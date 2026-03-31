import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getScrapedUrls, addScrapedUrl, createArticle, getSetting } from '@/lib/db';
import { discoverArticleUrls, extractArticleContent } from '@/lib/scrapers';
import { validateCsrfToken, csrfError } from '@/lib/csrf';

async function getGrokClient() {
  const apiKey = await getSetting('xai_api_key');
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const grok = await getGrokClient();
    if (!grok) {
      return NextResponse.json({ error: 'Chave da API Grok não configurada. Vá em Configurações para adicionar.' }, { status: 400 });
    }

    // Accept source parameter (ge, espn, uol, all)
    const body = await request.json().catch(() => ({}));
    const source = (body.source as 'ge' | 'espn' | 'uol' | 'all') || 'all';

    // Discover URLs from selected source(s)
    const allUrls = await discoverArticleUrls(source);

    if (allUrls.length === 0) {
      return NextResponse.json({ error: 'Nenhum artigo encontrado nas fontes selecionadas.' }, { status: 404 });
    }

    // Find first unscraped URL
    const scrapedUrls = await getScrapedUrls();
    const targetUrl = allUrls.find(url => !scrapedUrls.includes(url));

    if (!targetUrl) {
      return NextResponse.json({ error: 'Todos os artigos das fontes já foram importados. Volte mais tarde.' }, { status: 404 });
    }

    // Extract article content
    const article = await extractArticleContent(targetUrl);
    if (!article) {
      return NextResponse.json({ error: 'Não foi possível extrair o conteúdo do artigo.' }, { status: 422 });
    }

    // Rewrite with Grok AI
    const completion = await grok.chat.completions.create({
      model: 'grok-3-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um jornalista esportivo brasileiro experiente. Reescreva artigos com palavras e estrutura completamente diferentes, mantendo as informações factuais. Responda SOMENTE com JSON válido, sem markdown.'
        },
        {
          role: 'user',
          content: `Reescreva o artigo abaixo com título e conteúdo 100% originais em português brasileiro.
Classifique em UMA categoria: Brasileirão, Futebol Internacional, Copa do Brasil, Libertadores, Basquete, Fórmula 1, Tênis, Vôlei, Mercado da Bola, Opinião, Geral

TÍTULO: ${article.title}

CONTEÚDO: ${article.content.slice(0, 3000)}

Responda com JSON: {"title": "novo título", "content": "conteúdo reescrito com parágrafos separados por \\n\\n", "category": "categoria"}`
        }
      ],
    });

    let rewrittenText = completion.choices[0]?.message?.content || '';
    rewrittenText = rewrittenText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let rewritten: { title: string; content: string; category: string };
    try {
      rewritten = JSON.parse(rewrittenText);
    } catch {
      return NextResponse.json({ error: 'Erro na geração do conteúdo pela IA. Tente novamente.' }, { status: 500 });
    }

    // Search for image via Pexels
    let pexelsImage = '';
    try {
      const pexelsKey = await getSetting('pexels_api_key');
      if (pexelsKey) {
        const searchTerms = (rewritten.title || article.title).split(' ').slice(0, 4).join(' ');
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms + ' sports')}&per_page=1&orientation=landscape`,
          { headers: { Authorization: pexelsKey }, signal: AbortSignal.timeout(8000) }
        );
        if (pexelsRes.ok) {
          const pexelsData = await pexelsRes.json();
          pexelsImage = pexelsData.photos?.[0]?.src?.large || '';
        }
      }
    } catch { /* Pexels failure is non-critical */ }

    const finalImage = pexelsImage || article.image;

    return NextResponse.json({
      original: { title: article.title, content: article.content, image: article.image, url: targetUrl, source: article.source },
      rewritten: {
        title: rewritten.title || article.title,
        content: rewritten.content || article.content,
        image: finalImage,
        category: rewritten.category || 'Geral',
      },
      articlesFound: allUrls.length,
      alreadyScraped: scrapedUrls.length,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: `Erro ao importar: ${message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!validateCsrfToken(request)) return csrfError();

  try {
    const body = await request.json();
    const { title, content, image, category, originalUrl, skip } = body;

    if (skip) {
      if (originalUrl) await addScrapedUrl(originalUrl);
      return NextResponse.json({ success: true, skipped: true });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    let slug = title.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let savedArticle;
    try {
      savedArticle = await createArticle({
        title, slug, content,
        image: image || '',
        category: category || 'Geral',
        author: 'Redação Acréscimos',
        published: false,
        featured: false,
      });
    } catch {
      slug = `${slug}-${Date.now()}`;
      savedArticle = await createArticle({
        title, slug, content,
        image: image || '',
        category: category || 'Geral',
        author: 'Redação Acréscimos',
        published: false,
        featured: false,
      });
    }

    if (originalUrl) await addScrapedUrl(originalUrl);

    return NextResponse.json(savedArticle, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: `Erro ao salvar: ${message}` }, { status: 500 });
  }
}
