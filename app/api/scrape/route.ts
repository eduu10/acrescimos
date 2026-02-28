import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getScrapedUrls, addScrapedUrl, createArticle, getSetting } from '@/lib/db';

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
    // 1. Check Grok API key
    const grok = await getGrokClient();
    if (!grok) {
      return NextResponse.json({ error: 'Chave da API Grok não configurada. Vá em Configurações para adicionar.' }, { status: 400 });
    }

    // 2. Fetch ge.globo.com homepage
    const homepageRes = await fetch('https://ge.globo.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!homepageRes.ok) {
      return NextResponse.json({ error: 'Não foi possível acessar o ge.globo.com' }, { status: 502 });
    }

    const homepageHtml = await homepageRes.text();

    // 3. Extract article URLs
    const urlPattern = /href="(https:\/\/ge\.globo\.com\/[^"]*\/noticia\/[^"]*\.ghtml)"/g;
    const allUrls: string[] = [];
    let match;
    while ((match = urlPattern.exec(homepageHtml)) !== null) {
      const url = match[1].split('#')[0].split('?')[0]; // Clean URL
      if (!allUrls.includes(url)) allUrls.push(url);
    }

    if (allUrls.length === 0) {
      return NextResponse.json({ error: 'Nenhum artigo encontrado na página do GE' }, { status: 404 });
    }

    // 4. Find first unscraped URL
    const scrapedUrls = await getScrapedUrls();
    const targetUrl = allUrls.find(url => !scrapedUrls.includes(url));

    if (!targetUrl) {
      return NextResponse.json({ error: 'Todos os artigos da página já foram importados. Volte mais tarde para novos artigos.' }, { status: 404 });
    }

    // 5. Fetch article page
    const articleRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!articleRes.ok) {
      return NextResponse.json({ error: 'Não foi possível acessar o artigo' }, { status: 502 });
    }

    const articleHtml = await articleRes.text();

    // 6. Extract article data using og: meta tags (most reliable) and body content
    const ogTitle = articleHtml.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/)?.[1]
      || articleHtml.match(/content="([^"]+)"\s+(?:property|name)="og:title"/)?.[1]
      || articleHtml.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]+>/g, '').trim()
      || '';

    const ogImage = articleHtml.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/)?.[1]
      || articleHtml.match(/content="([^"]+)"\s+(?:property|name)="og:image"/)?.[1]
      || '';

    // Extract content paragraphs
    const contentMatches = [...articleHtml.matchAll(/<p[^>]*class="[^"]*content-text[^"]*"[^>]*>(.*?)<\/p>/gs)];
    let originalContent = contentMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean).join('\n\n');

    // Fallback: try generic article paragraphs
    if (!originalContent) {
      const genericParagraphs = [...articleHtml.matchAll(/<p[^>]*>(.*?)<\/p>/gs)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 50);
      originalContent = genericParagraphs.slice(0, 10).join('\n\n');
    }

    const originalTitle = ogTitle.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    if (!originalTitle || !originalContent) {
      return NextResponse.json({ error: 'Não foi possível extrair o conteúdo do artigo' }, { status: 422 });
    }

    // 7. Rewrite with Grok AI
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

TÍTULO: ${originalTitle}

CONTEÚDO: ${originalContent.slice(0, 3000)}

Responda com JSON: {"title": "novo título", "content": "conteúdo reescrito com parágrafos separados por \\n\\n", "category": "categoria"}`
        }
      ],
    });

    let rewrittenText = completion.choices[0]?.message?.content || '';

    // Clean markdown wrapping if present
    rewrittenText = rewrittenText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let rewritten: { title: string; content: string; category: string };
    try {
      rewritten = JSON.parse(rewrittenText);
    } catch {
      return NextResponse.json({ error: 'Erro na geração do conteúdo pela IA. Tente novamente.' }, { status: 500 });
    }

    // 8. Search for a relevant sports image via Pexels
    let pexelsImage = '';
    try {
      const pexelsKey = await getSetting('pexels_api_key');
      if (pexelsKey) {
        const searchTerms = (rewritten.title || originalTitle).split(' ').slice(0, 4).join(' ');
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms + ' sports')}&per_page=1&orientation=landscape`,
          { headers: { Authorization: pexelsKey }, signal: AbortSignal.timeout(8000) }
        );
        if (pexelsRes.ok) {
          const pexelsData = await pexelsRes.json();
          pexelsImage = pexelsData.photos?.[0]?.src?.large || '';
        }
      }
    } catch {}

    // Use Pexels image as primary (original), fallback to og:image
    const finalImage = pexelsImage || ogImage;

    // 9. Return preview
    return NextResponse.json({
      original: { title: originalTitle, content: originalContent, image: ogImage, url: targetUrl },
      rewritten: {
        title: rewritten.title || originalTitle,
        content: rewritten.content || originalContent,
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

  try {
    const body = await request.json();
    const { title, content, image, category, originalUrl, skip } = body;

    // If skipping, just mark URL as scraped
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

    // Try creating, if slug collision append timestamp
    let article;
    try {
      article = await createArticle({
        title, slug, content,
        image: image || '',
        category: category || 'Geral',
        author: 'Redação Acréscimos',
        published: false,
        featured: false,
      });
    } catch {
      slug = `${slug}-${Date.now()}`;
      article = await createArticle({
        title, slug, content,
        image: image || '',
        category: category || 'Geral',
        author: 'Redação Acréscimos',
        published: false,
        featured: false,
      });
    }

    if (originalUrl) await addScrapedUrl(originalUrl);

    return NextResponse.json(article, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: `Erro ao salvar: ${message}` }, { status: 500 });
  }
}
