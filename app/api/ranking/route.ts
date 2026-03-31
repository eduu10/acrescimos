import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const revalidate = 0;

export async function GET() {
  // Build ranking from article view counts + engagement (comments + shares)
  const rows = await sql`
    SELECT
      a.id,
      a.title,
      a.slug,
      a.image,
      a.category,
      a.author,
      a.created_at,
      COALESCE(a.views, 0) AS views,
      COUNT(DISTINCT c.id) AS comment_count
    FROM articles a
    LEFT JOIN comments c ON c.article_id = a.id AND c.approved = true
    WHERE a.published = true
      AND a.created_at >= NOW() - INTERVAL '7 days'
    GROUP BY a.id
    ORDER BY (COALESCE(a.views, 0) + COUNT(DISTINCT c.id) * 5) DESC
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
    comment_count: Number(row.comment_count),
    score: Number(row.views) + Number(row.comment_count) * 5,
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
