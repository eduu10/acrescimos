import { NextRequest, NextResponse } from 'next/server';
import { upsertTransferAlert, createArticle, updateTransferAlertStatus, getSetting } from '@/lib/db';
import OpenAI from 'openai';

export const revalidate = 0;

const TRANSFER_KEYWORDS = [
  'assina', 'contrata', 'contratação', 'acerta', 'renova', 'renovação',
  'emprestado', 'negocia', 'negociação', 'acerto', 'fechado', 'oficializa',
  'transferência', 'reforço', 'rescinde', 'rescisão', 'mercado da bola',
];

// RSS feeds that work without JS rendering
const RSS_SOURCES = [
  'https://sportbuzz.com.br/feed/',
  'https://www.gazetaesportiva.com/feed/',
];

interface RssItem {
  title: string;
  link: string;
}

async function fetchRssItems(feedUrl: string): Promise<RssItem[]> {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcrescimosBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items: RssItem[] = [];
    const itemRegex = /<item[\s\S]*?<\/item>/gi;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const block = itemMatch[0];

      const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+)(?:\]\]>)?<\/link>/i)
        || block.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<]+)(?:\]\]>)?<\/guid>/i);

      if (!titleMatch || !linkMatch) continue;

      const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').trim();
      const link = linkMatch[1].trim();

      // Only include items with transfer keywords
      const lowerTitle = title.toLowerCase();
      const hasKeyword = TRANSFER_KEYWORDS.some(kw => lowerTitle.includes(kw));
      if (!hasKeyword) continue;

      items.push({ title, link });
      if (items.length >= 8) break;
    }

    return items;
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

  for (const feedUrl of RSS_SOURCES) {
    const items = await fetchRssItems(feedUrl);

    for (const item of items) {
      const { inserted, id: alertId } = await upsertTransferAlert({
        url: item.link,
        title: item.title,
        player: null,
        from_club: null,
        to_club: null,
      });

      if (inserted) {
        detected++;

        // Generate a draft article linked to the alert (stays as 'detected' for admin review)
        if (groqKey) {
          try {
            const grok = new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' });
            const prompt = `Escreva um artigo jornalístico sobre a seguinte notícia de mercado do futebol: "${item.title}".

O artigo deve ter pelo menos 4 parágrafos, tom jornalístico esportivo, análise sobre o impacto no futebol brasileiro.

Responda com JSON: {"title": "título do artigo", "content": "conteúdo com parágrafos separados por \\n\\n"}`;

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
            const slug = parsed.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');

            // Create as draft (published: false) — admin decides whether to publish
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

            // Link article draft to alert — keep status 'detected' for admin review
            if (alertId) await updateTransferAlertStatus(alertId, 'detected', article.id);
            articlesGenerated++;
          } catch { /* skip article generation */ }
        }
      }
    }
  }

  return NextResponse.json({ detected, articlesGenerated });
}
