import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const revalidate = 0;

export async function GET() {
  // Build ranking from article view counts
  const rows = await sql`
    SELECT
      id, title, slug, image, category, author, created_at,
      COALESCE(views, 0) AS views
    FROM articles
    WHERE published = true
      AND created_at >= NOW() - INTERVAL '7 days'
    ORDER BY COALESCE(views, 0) DESC
    LIMIT 10
  `;

  const ranking = rows.map((row, i) => ({
    position: i + 1,
    id: row.id,
    title: row.title,
    slug: row.slug,
    image: row.image,
    category: row.category,
    author: row.author,
    created_at: row.created_at,
    views: Number(row.views),
    comment_count: 0,
    score: Number(row.views),
  }));

  return NextResponse.json(ranking);
}

export async function POST(request: NextRequest) {
  // Admin: manually set ranking (override score with custom order)
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { article_ids } = await request.json();
  if (!Array.isArray(article_ids) || article_ids.length === 0) {
    return NextResponse.json({ error: 'article_ids obrigatório' }, { status: 400 });
  }

  // Return ranking based on provided order (just fetch those articles in order)
  const rows = await sql`
    SELECT id, title, slug, image, category, author, created_at, COALESCE(views, 0) AS views
    FROM articles
    WHERE id = ANY(${article_ids}::int[]) AND published = true
  `;

  const byId = Object.fromEntries(rows.map(r => [r.id, r]));
  const ranking = article_ids
    .filter(id => byId[id])
    .map((id, i) => ({ position: i + 1, ...byId[id], views: Number(byId[id].views) }));

  return NextResponse.json(ranking);
}
