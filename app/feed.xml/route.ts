import { getArticles } from '@/lib/db'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRfc822(dateStr: string): string {
  return new Date(dateStr).toUTCString()
}

export async function GET() {
  const articles = await getArticles({ published: true })
  const feedArticles = articles.slice(0, 20)

  const items = feedArticles
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>https://acrescimos.com.br/article/${article.slug}</link>
      <description>${escapeXml(article.content.slice(0, 300))}</description>
      <pubDate>${toRfc822(article.created_at)}</pubDate>
      <guid isPermaLink="true">https://acrescimos.com.br/article/${article.slug}</guid>
      <category>${escapeXml(article.category)}</category>
      ${article.image ? `<enclosure url="${escapeXml(article.image)}" type="image/jpeg" />` : ''}
    </item>`
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Acréscimos - A Notícia Além do Tempo</title>
    <link>https://acrescimos.com.br</link>
    <description>Portal de notícias esportivas focado no futebol brasileiro</description>
    <language>pt-br</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://acrescimos.com.br/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://acrescimos.com.br/icon.svg</url>
      <title>Acréscimos</title>
      <link>https://acrescimos.com.br</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
