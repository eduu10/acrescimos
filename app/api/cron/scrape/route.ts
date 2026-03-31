import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getScrapedUrls, addScrapedUrl, createArticle, getSetting } from '@/lib/db'
import { discoverArticleUrls, extractArticleContent } from '@/lib/scrapers'

const MAX_ARTICLES_PER_RUN = 5

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { title: string; source: string; status: string }[] = []

  try {
    // Check Grok API key
    const apiKey = await getSetting('xai_api_key')
    if (!apiKey) {
      return NextResponse.json({ error: 'Grok API key not configured' }, { status: 400 })
    }

    const grok = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' })
    const pexelsKey = await getSetting('pexels_api_key')

    // Discover URLs from all sources
    const allUrls = await discoverArticleUrls('all')
    const scrapedUrls = await getScrapedUrls()
    const newUrls = allUrls.filter((url) => !scrapedUrls.includes(url))

    if (newUrls.length === 0) {
      return NextResponse.json({ message: 'No new articles found', results })
    }

    // Process up to MAX_ARTICLES_PER_RUN
    const toProcess = newUrls.slice(0, MAX_ARTICLES_PER_RUN)

    for (const url of toProcess) {
      try {
        const article = await extractArticleContent(url)
        if (!article) {
          await addScrapedUrl(url)
          results.push({ title: url, source: 'unknown', status: 'skip_no_content' })
          continue
        }

        // Rewrite with Grok AI
        const completion = await grok.chat.completions.create({
          model: 'grok-3-mini',
          messages: [
            {
              role: 'system',
              content:
                'Você é um jornalista esportivo brasileiro experiente. Reescreva artigos com palavras e estrutura completamente diferentes, mantendo as informações factuais. Responda SOMENTE com JSON válido, sem markdown.',
            },
            {
              role: 'user',
              content: `Reescreva o artigo abaixo com título e conteúdo 100% originais em português brasileiro.
Classifique em UMA categoria: Brasileirão, Futebol Internacional, Copa do Brasil, Libertadores, Basquete, Fórmula 1, Tênis, Vôlei, Mercado da Bola, Opinião, Geral

TÍTULO: ${article.title}
CONTEÚDO: ${article.content.slice(0, 3000)}

Responda com JSON: {"title": "novo título", "content": "conteúdo reescrito com parágrafos separados por \\n\\n", "category": "categoria"}`,
            },
          ],
        })

        let rewrittenText = completion.choices[0]?.message?.content || ''
        rewrittenText = rewrittenText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

        let rewritten: { title: string; content: string; category: string }
        try {
          rewritten = JSON.parse(rewrittenText)
        } catch {
          await addScrapedUrl(url)
          results.push({ title: article.title, source: article.source, status: 'skip_ai_error' })
          continue
        }

        // Pexels image
        let image = article.image
        if (pexelsKey) {
          try {
            const searchTerms = rewritten.title.split(' ').slice(0, 4).join(' ')
            const pexelsRes = await fetch(
              `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms + ' sports')}&per_page=1&orientation=landscape`,
              { headers: { Authorization: pexelsKey }, signal: AbortSignal.timeout(5000) }
            )
            if (pexelsRes.ok) {
              const data = await pexelsRes.json()
              image = data.photos?.[0]?.src?.large || image
            }
          } catch { /* non-critical */ }
        }

        // Generate slug
        const slug = rewritten.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        // Save as draft
        try {
          await createArticle({
            title: rewritten.title,
            slug: `${slug}-${Date.now()}`,
            content: rewritten.content,
            image: image || '',
            category: rewritten.category || 'Geral',
            author: 'Redação Acréscimos',
            published: false,
            featured: false,
          })
          results.push({ title: rewritten.title, source: article.source, status: 'imported' })
        } catch {
          results.push({ title: rewritten.title, source: article.source, status: 'save_error' })
        }

        await addScrapedUrl(url)
      } catch {
        results.push({ title: url, source: 'unknown', status: 'error' })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} articles`,
      imported: results.filter((r) => r.status === 'imported').length,
      skipped: results.filter((r) => r.status !== 'imported').length,
      results,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
