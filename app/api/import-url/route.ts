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
    const contentSnippet = article.content.slice(0, 6000);
    const completion = await grok.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Você é um jornalista esportivo brasileiro sênior especializado em SEO e GEO (Generative Engine Optimization).
Escreva artigos longos, completos e 100% originais em português brasileiro.
Responda SOMENTE com JSON válido, sem markdown, sem blocos de código.`,
        },
        {
          role: 'user',
          content: `Com base na notícia abaixo, escreva um artigo jornalístico esportivo COMPLETO e ORIGINAL com MÍNIMO de 3000 palavras.

REGRAS DE SEO e GEO:
- Título principal com a palavra-chave principal no início (máx. 65 caracteres)
- Subtítulo (meta_description) atraente de 150-160 caracteres com a palavra-chave
- Estruture o conteúdo com subtítulos H2 e H3 (use ## para H2 e ### para H3)
- Parágrafo de introdução forte nos primeiros 100 palavras com a palavra-chave principal
- Desenvolva CADA ponto com pelo menos 2-3 parágrafos de profundidade
- Inclua contexto histórico, estatísticas relevantes e análise de impacto
- Use linguagem direta, clara e envolvente — como um texto que a IA (Gemini, ChatGPT, Perplexity) citaria
- Adicione uma seção "O que você precisa saber" com bullet points no meio do artigo
- Termine com uma conclusão sólida e perspectivas futuras
- Tom: jornalístico profissional, apaixonado pelo esporte

NOTÍCIA DE REFERÊNCIA:
Título: ${article.title}
Conteúdo: ${contentSnippet}
URL: ${article.url || ''}

Classifique em UMA categoria: Brasileirão, Campeonato Mineiro, Série B, Copa do Brasil, Libertadores, Futebol Internacional, Seleção Brasileira, Copa do Mundo, Futebol Feminino, Mercado da Bola, Basquete, Fórmula 1, Tênis, Vôlei, Opinião, Geral

Responda com JSON:
{"title": "título otimizado", "meta_description": "descrição de 150-160 chars", "content": "artigo completo com ## subtítulos e parágrafos separados por \\n\\n", "category": "categoria"}`,
        },
      ],
      max_tokens: 8000,
    });

    let text = completion.choices[0]?.message?.content || '';
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let rewritten: { title: string; content: string; category: string; meta_description?: string };
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
      meta_description: rewritten.meta_description || '',
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
