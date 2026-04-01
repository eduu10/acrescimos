export interface ScrapedArticle {
  title: string
  content: string
  image: string
  url: string
  source: string
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function extractOgMeta(html: string, property: string): string {
  const pattern = new RegExp(
    `<meta\\s+(?:property|name)="${property}"\\s+content="([^"]+)"` +
      `|content="([^"]+)"\\s+(?:property|name)="${property}"`,
    'i'
  )
  const match = html.match(pattern)
  return decodeHtmlEntities(match?.[1] || match?.[2] || '')
}

function extractParagraphs(html: string, selector?: string): string {
  let pattern: RegExp
  if (selector) {
    pattern = new RegExp(`<p[^>]*class="[^"]*${selector}[^"]*"[^>]*>([\\s\\S]*?)</p>`, 'gi')
  } else {
    pattern = /<p[^>]*>([\s\S]*?)<\/p>/gi
  }

  const matches = [...html.matchAll(pattern)]
  return matches
    .map((m) => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 40)
    .slice(0, 60)
    .join('\n\n')
}

function extractArticleBody(html: string): string {
  // Try common article wrapper selectors in order of specificity
  const wrapperPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*(?:article-body|article__body|post-body|entry-content|content-text|materia-conteudo|story-body|newsarticle|article_body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ]

  for (const pattern of wrapperPatterns) {
    const match = html.match(pattern)
    if (match) {
      const body = match[1]
      const paragraphs = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
        .filter(t => t.length > 40)
        .slice(0, 60)
        .join('\n\n')
      if (paragraphs.length > 100) return paragraphs
    }
  }

  return ''
}

// ── GE Globo ───────────────────────────────────────────────────────────────

export async function scrapeGE(): Promise<string[]> {
  const res = await fetch('https://ge.globo.com/', {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return []
  const html = await res.text()
  const urlPattern = /href="(https:\/\/ge\.globo\.com\/[^"]*\/noticia\/[^"]*\.ghtml)"/g
  const urls: string[] = []
  let match
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1].split('#')[0].split('?')[0]
    if (!urls.includes(url)) urls.push(url)
  }
  return urls
}

// ── ESPN Brasil ────────────────────────────────────────────────────────────

export async function scrapeESPN(): Promise<string[]> {
  const res = await fetch('https://www.espn.com.br/', {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return []
  const html = await res.text()
  const urlPattern = /href="(https:\/\/www\.espn\.com\.br\/[^"]*(?:artigo|noticia|story)[^"]*)"/g
  const urls: string[] = []
  let match
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1].split('#')[0].split('?')[0]
    if (!urls.includes(url)) urls.push(url)
  }
  // Fallback: try generic article links
  if (urls.length === 0) {
    const genericPattern = /href="(https:\/\/www\.espn\.com\.br\/[^"]*\/[^"]*_\/id\/[^"]*)"/g
    while ((match = genericPattern.exec(html)) !== null) {
      const url = match[1].split('#')[0].split('?')[0]
      if (!urls.includes(url)) urls.push(url)
    }
  }
  return urls
}

// ── UOL Esporte ────────────────────────────────────────────────────────────

export async function scrapeUOL(): Promise<string[]> {
  const res = await fetch('https://www.uol.com.br/esporte/futebol/', {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return []
  const html = await res.text()
  const urlPattern = /href="(https:\/\/www\.uol\.com\.br\/esporte\/[^"]*\/(?:ultimas-noticias|noticias)\/[^"]*\.htm)"/g
  const urls: string[] = []
  let match
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1].split('#')[0].split('?')[0]
    if (!urls.includes(url)) urls.push(url)
  }
  return urls
}

// ── Lance! ─────────────────────────────────────────────────────────────────

export async function scrapeLance(): Promise<string[]> {
  const res = await fetch('https://www.lance.com.br/futebol/', {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return []
  const html = await res.text()
  const urlPattern = /href="(https:\/\/www\.lance\.com\.br\/[^"]*\/[^"]*\.html)"/g
  const urls: string[] = []
  let match
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1].split('#')[0].split('?')[0]
    if (!urls.includes(url) && !url.includes('/videos/') && !url.includes('/fotos/')) urls.push(url)
  }
  return urls.slice(0, 20)
}

// ── TNT Sports ─────────────────────────────────────────────────────────────

export async function scrapeTNT(): Promise<string[]> {
  const res = await fetch('https://www.tntsports.com.br/futebol/', {
    headers: BROWSER_HEADERS,
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) return []
  const html = await res.text()
  const urlPattern = /href="(https:\/\/www\.tntsports\.com\.br\/[^"]*\/[^"]*\/)"/g
  const urls: string[] = []
  let match
  while ((match = urlPattern.exec(html)) !== null) {
    const url = match[1].split('#')[0].split('?')[0]
    if (!urls.includes(url) && url.length > 40) urls.push(url)
  }
  return urls.slice(0, 20)
}

// ── Extract article content from any source ────────────────────────────────

export async function extractArticleContent(url: string): Promise<ScrapedArticle | null> {
  try {
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const html = await res.text()

    const title = extractOgMeta(html, 'og:title')
      || html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]+>/g, '').trim()
      || ''

    const image = extractOgMeta(html, 'og:image')

    // Try source-specific content selectors, then structural extraction, then generic fallback
    let content = ''
    if (url.includes('ge.globo.com')) {
      content = extractParagraphs(html, 'content-text')
    } else if (url.includes('espn.com.br')) {
      content = extractParagraphs(html, 'article-body')
    } else if (url.includes('uol.com.br')) {
      content = extractParagraphs(html, 'text')
    } else if (url.includes('lance.com.br')) {
      content = extractParagraphs(html, 'article-body')
    } else if (url.includes('tntsports.com.br')) {
      content = extractParagraphs(html, 'content')
    } else if (url.includes('sportbuzz.com.br') || url.includes('gazetaesportiva.com')) {
      content = extractParagraphs(html, 'entry-content') || extractParagraphs(html, 'post-content')
    }

    // Try structural extraction from <article>, <main>, etc.
    if (!content || content.length < 200) {
      content = extractArticleBody(html)
    }

    // Last resort: all paragraphs
    if (!content || content.length < 200) {
      content = extractParagraphs(html)
    }

    // If we only have a title but no content, use the description as hint
    if (!content || content.length < 100) {
      const description = extractOgMeta(html, 'og:description')
      if (description) content = description
    }

    if (!title) return null

    const source = url.includes('ge.globo.com')
      ? 'ge'
      : url.includes('espn.com.br')
        ? 'espn'
        : url.includes('uol.com.br')
          ? 'uol'
          : url.includes('lance.com.br')
            ? 'lance'
            : url.includes('tntsports.com.br')
              ? 'tnt'
              : 'unknown'

    return { title: decodeHtmlEntities(title), content, image, url, source }
  } catch {
    return null
  }
}

// ── Discover all URLs from all sources ─────────────────────────────────────

export async function discoverArticleUrls(
  source: 'ge' | 'espn' | 'uol' | 'lance' | 'tnt' | 'all' = 'all'
): Promise<string[]> {
  const scrapers: Record<string, () => Promise<string[]>> = {
    ge: scrapeGE,
    espn: scrapeESPN,
    uol: scrapeUOL,
    lance: scrapeLance,
    tnt: scrapeTNT,
  }

  if (source !== 'all') {
    const fn = scrapers[source]
    return fn ? fn() : []
  }

  const results = await Promise.allSettled([scrapeGE(), scrapeESPN(), scrapeUOL(), scrapeLance(), scrapeTNT()])
  const urls: string[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const url of result.value) {
        if (!urls.includes(url)) urls.push(url)
      }
    }
  }
  return urls
}
