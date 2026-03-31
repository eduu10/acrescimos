import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://acrescimos.com.br';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 });

  const { article_id, platform, title, slug } = body;
  if (!platform || !title || !slug) {
    return NextResponse.json({ error: 'platform, title e slug são obrigatórios' }, { status: 400 });
  }

  const url = `${BASE_URL}/article/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  let shareUrl = '';
  let text = '';

  switch (platform) {
    case 'whatsapp':
      text = encodeURIComponent(`${title} ⚽ ${url}`);
      shareUrl = `https://wa.me/?text=${text}`;
      break;
    case 'twitter':
      text = encodeURIComponent(`${title.slice(0, 200)} #futebol #acrescimos`);
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;
    case 'telegram':
      text = encodeURIComponent(title);
      shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
      break;
    default:
      return NextResponse.json({ error: 'Plataforma não suportada' }, { status: 400 });
  }

  // Track share click if article_id provided
  if (article_id) {
    try {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      await sql`INSERT INTO analytics (type, article_id, date, count) VALUES ('share', ${article_id}, CURRENT_DATE, 1) ON CONFLICT (type, article_id, date) DO UPDATE SET count = analytics.count + 1`;
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ shareUrl });
}
