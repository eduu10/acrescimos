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
Responda SOMENTE com JSON válido, sem blocos de código. O campo "content" deve conter HTML limpo.`,
        },
        {
          role: 'user',
          content: `Com base na notícia abaixo, escreva um artigo jornalístico COMPLETO e ORIGINAL com MÍNIMO de 3000 palavras.

ESTRUTURA OBRIGATÓRIA DO CONTEÚDO (use HTML no campo content):
- Início: parágrafo de introdução forte com a palavra-chave principal
- Use <h2>Título da Seção</h2> para seções principais (pelo menos 5 seções H2)
- Use <h3>Subtítulo</h3> dentro das seções quando necessário
- Cada seção H2 deve ter NO MÍNIMO 3 parágrafos <p>texto</p> com profundidade
- Use <strong>termo importante</strong> para destacar palavras-chave e dados
- Adicione uma seção <h2>O Que Você Precisa Saber</h2> com lista <ul><li>ponto importante</li></ul>
- Use <blockquote><p>citação ou dado relevante</p></blockquote> para destacar informações importantes
- Termine com <h2>Conclusão</h2> sólida com perspectivas futuras (mínimo 2 parágrafos)
- Tom: jornalístico profissional, linguagem clara e envolvente

REGRAS SEO e GEO:
- Título com palavra-chave principal no início (máx. 65 caracteres)
- meta_description atraente de 150-160 caracteres
- Repita a palavra-chave principal naturalmente ao longo do texto
- Inclua dados, estatísticas e contexto histórico — textos que a IA (Gemini, Perplexity) cite como fonte

NOTÍCIA DE REFERÊNCIA:
Título: ${article.title}
Conteúdo: ${contentSnippet}
URL: ${article.url || ''}

Classifique em UMA categoria: Brasileirão, Campeonato Mineiro, Série B, Copa do Brasil, Libertadores, Futebol Internacional, Seleção Brasileira, Copa do Mundo, Futebol Feminino, Mercado da Bola, Basquete, Fórmula 1, Tênis, Vôlei, Opinião, Geral

Responda com JSON (content deve ser HTML válido com as tags acima):
{"title": "título otimizado para SEO", "meta_description": "descrição de 150-160 chars", "content": "<p>introdução...</p><h2>Seção 1</h2><p>...</p>", "category": "categoria"}`,
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
