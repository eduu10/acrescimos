import { NextRequest, NextResponse } from 'next/server';
import { upsertTransferAlert, createArticle, updateTransferAlertStatus, getSetting } from '@/lib/db';
import OpenAI from 'openai';

export const revalidate = 0;

const TRANSFER_KEYWORDS = ['assina', 'contrata', 'acerta', 'renova', 'emprestado', 'negocia', 'acerto', 'fechado', 'transferência confirmada', 'oficializa'];

const SOURCES = [
  'https://www.lance.com.br/mercado-da-bola/',
  'https://ge.globo.com/futebol/mercado/',
];

async function scrapeTransferSource(url: string): Promise<{ url: string; title: string }[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcrescimosBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    const links: { url: string; title: string }[] = [];
    const urlPattern = /href="(https?:\/\/[^"]*(?:mercado|transfer|contrat|assinou|renov)[^"]*)"/gi;
    const titlePattern = /<(?:h[1-4]|a)[^>]*>([^<]{20,150})<\/(?:h[1-4]|a)>/gi;

    let match;
    while ((match = urlPattern.exec(html)) !== null) {
      const articleUrl = match[1];
      if (links.some(l => l.url === articleUrl)) continue;

      // Check if nearby text has transfer keywords
      const context = html.substring(Math.max(0, match.index - 200), match.index + 200).toLowerCase();
      const hasKeyword = TRANSFER_KEYWORDS.some(kw => context.includes(kw));
      if (!hasKeyword) continue;

      // Try to get a title from nearby heading
      let title = '';
      const titleMatch = titlePattern.exec(html.substring(Math.max(0, match.index - 500), match.index + 100));
      if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      if (!title) title = articleUrl.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || '';

      links.push({ url: articleUrl, title });
      if (links.length >= 5) break;
    }

    return links;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const groqKey = await getSetting('groq_api_key');
  let detected = 0;
  let articlesGenerated = 0;

  for (const source of SOURCES) {
    const items = await scrapeTransferSource(source);
    for (const item of items) {
      const { inserted } = await upsertTransferAlert({
        url: item.url,
        title: item.title,
        player: null,
        from_club: null,
        to_club: null,
      });

      if (inserted) {
        detected++;

        // Auto-generate article if Groq is available
        if (groqKey) {
          try {
            const grok = new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' });
            const prompt = `Escreva um artigo jornalístico sobre a seguinte notícia de mercado do futebol brasileiro: "${item.title}".

O artigo deve ter pelo menos 4 parágrafos, tom jornalístico esportivo, especulação moderada quando os detalhes forem incertos.

Responda com JSON: {"title": "título", "content": "conteúdo com parágrafos separados por \\n\\n"}`;

            const completion = await grok.chat.completions.create({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: 'Jornalista esportivo brasileiro. Responda SOMENTE com JSON válido.' },
                { role: 'user', content: prompt },
              ],
            });

            let text = completion.choices[0]?.message?.content || '';
            text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(text);
            const slug = parsed.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            const article = await createArticle({
              title: parsed.title,
              slug: `mercado-${slug}-${Date.now()}`,
              content: parsed.content,
              image: '',
              category: 'Mercado da Bola',
              author: 'IA Acréscimos',
              published: false,
              featured: false,
            });

            // Find the transfer alert we just inserted and update its status
            const alerts = await import('@/lib/db').then(m => m.getTransferAlerts('detected'));
            const alert = alerts.find(a => a.url === item.url);
            if (alert) await updateTransferAlertStatus(alert.id, 'published', article.id);
            articlesGenerated++;
          } catch { /* skip article generation for this item */ }
        }
      }
    }
  }

  return NextResponse.json({ detected, articlesGenerated });
}
