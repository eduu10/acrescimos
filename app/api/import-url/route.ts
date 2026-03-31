import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSetting } from '@/lib/db';
import { extractArticleContent } from '@/lib/scrapers';

async function getGroqClient() {
  const apiKey = await getSetting('groq_api_key');
  if (!apiKey) return null;
  return new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.url) return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 });

  const { url, rewrite = false } = body;

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
  } catch {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
  }

  // Extract article content
  const article = await extractArticleContent(parsedUrl.toString());
  if (!article) {
    return NextResponse.json({ error: 'Não foi possível extrair o conteúdo da URL. Verifique se o link é de um artigo público.' }, { status: 422 });
  }

  if (!rewrite) {
    // Just return extracted data, no AI rewrite
    return NextResponse.json({
      title: article.title,
      content: article.content,
      image: article.image,
      source: article.source,
    });
  }

  // Rewrite with Groq AI
  const grok = await getGroqClient();
  if (!grok) {
    // Return original without rewrite
    return NextResponse.json({
      title: article.title,
      content: article.content,
      image: article.image,
      source: article.source,
      rewritten: false,
      warning: 'Chave da API Groq não configurada — conteúdo original importado sem reescrita.',
    });
  }

  try {
    const completion = await grok.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é um jornalista esportivo brasileiro experiente. Reescreva artigos com palavras e estrutura completamente diferentes, mantendo as informações factuais. Responda SOMENTE com JSON válido, sem markdown.',
        },
        {
          role: 'user',
          content: `Reescreva o artigo abaixo com título e conteúdo 100% originais em português brasileiro.
Classifique em UMA categoria: Brasileirão, Campeonato Mineiro, Série B, Copa do Brasil, Libertadores, Futebol Internacional, Seleção Brasileira, Copa do Mundo, Futebol Feminino, Mercado da Bola, Basquete, Fórmula 1, Tênis, Vôlei, Opinião, Geral

TÍTULO: ${article.title}

CONTEÚDO: ${article.content.slice(0, 3000)}

Responda com JSON: {"title": "novo título", "content": "conteúdo reescrito com parágrafos separados por \\n\\n", "category": "categoria"}`,
        },
      ],
    });

    let text = completion.choices[0]?.message?.content || '';
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let rewritten: { title: string; content: string; category: string };
    try {
      rewritten = JSON.parse(text);
    } catch {
      // Return original if JSON parse fails
      return NextResponse.json({
        title: article.title,
        content: article.content,
        image: article.image,
        source: article.source,
        rewritten: false,
        warning: 'IA não retornou JSON válido — conteúdo original importado.',
      });
    }

    return NextResponse.json({
      title: rewritten.title || article.title,
      content: rewritten.content || article.content,
      image: article.image,
      category: rewritten.category || 'Geral',
      source: article.source,
      rewritten: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: `Erro na IA: ${message}` }, { status: 500 });
  }
}
