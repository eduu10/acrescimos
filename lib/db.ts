import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false>;
function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
  clicks: number;
  created_at: string;
  updated_at: string;
}

// Articles
export async function getArticles(filters?: { published?: boolean; category?: string; featured?: boolean }): Promise<Article[]> {
  const q = sql();
  if (filters?.published !== undefined && filters?.category) {
    return await q`SELECT * FROM articles WHERE published = ${filters.published} AND LOWER(category) = LOWER(${filters.category}) ORDER BY created_at DESC` as Article[];
  } else if (filters?.published !== undefined) {
    return await q`SELECT * FROM articles WHERE published = ${filters.published} ORDER BY created_at DESC` as Article[];
  } else if (filters?.featured) {
    return await q`SELECT * FROM articles WHERE featured = true AND published = true ORDER BY created_at DESC` as Article[];
  }
  return await q`SELECT * FROM articles ORDER BY created_at DESC` as Article[];
}

export async function getArticleById(id: number): Promise<Article | null> {
  const rows = await sql()`SELECT * FROM articles WHERE id = ${id}` as Article[];
  return rows[0] || null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const rows = await sql()`SELECT * FROM articles WHERE slug = ${slug}` as Article[];
  return rows[0] || null;
}

export async function createArticle(data: { title: string; slug: string; content: string; image: string; category: string; author: string; published: boolean; featured: boolean }): Promise<Article> {
  const rows = await sql()`INSERT INTO articles (title, slug, content, image, category, author, published, featured) VALUES (${data.title}, ${data.slug}, ${data.content}, ${data.image}, ${data.category}, ${data.author}, ${data.published}, ${data.featured}) RETURNING *` as Article[];
  return rows[0];
}

export async function updateArticle(id: number, data: Partial<Article>): Promise<Article | null> {
  const current = await getArticleById(id);
  if (!current) return null;

  const title = data.title ?? current.title;
  const slug = data.slug ?? current.slug;
  const content = data.content ?? current.content;
  const image = data.image ?? current.image;
  const category = data.category ?? current.category;
  const author = data.author ?? current.author;
  const published = data.published ?? current.published;
  const featured = data.featured ?? current.featured;

  const rows = await sql()`UPDATE articles SET title=${title}, slug=${slug}, content=${content}, image=${image}, category=${category}, author=${author}, published=${published}, featured=${featured}, updated_at=NOW() WHERE id=${id} RETURNING *` as Article[];
  return rows[0] || null;
}

export async function deleteArticle(id: number): Promise<boolean> {
  const rows = await sql()`DELETE FROM articles WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// Analytics
export async function trackPageView(): Promise<void> {
  try {
    await sql()`INSERT INTO analytics (type, date, count) VALUES ('pageview', CURRENT_DATE, 1) ON CONFLICT (type, article_id, date) DO UPDATE SET count = analytics.count + 1 WHERE analytics.type = 'pageview' AND analytics.date = CURRENT_DATE`;
  } catch {
    try { await sql()`INSERT INTO analytics (type, date, count) VALUES ('pageview', CURRENT_DATE, 1)`; } catch {}
  }
}

export async function trackArticleClick(articleId: number): Promise<void> {
  await sql()`UPDATE articles SET clicks = clicks + 1 WHERE id = ${articleId}`;
  try { await sql()`INSERT INTO analytics (type, article_id, date, count) VALUES ('click', ${articleId}, CURRENT_DATE, 1)`; } catch {}
}

export async function getAnalyticsData() {
  const q = sql();
  const articles = await q`SELECT * FROM articles ORDER BY clicks DESC LIMIT 10` as Article[];
  const todayViews = await q`SELECT COALESCE(SUM(count), 0) as total FROM analytics WHERE type = 'pageview' AND date = CURRENT_DATE`;
  const todayClicks = await q`SELECT COALESCE(SUM(count), 0) as total FROM analytics WHERE type = 'click' AND date = CURRENT_DATE`;
  const viewsLast7 = await q`SELECT date::text, COALESCE(SUM(count), 0) as count FROM analytics WHERE type = 'pageview' AND date >= CURRENT_DATE - INTERVAL '7 days' GROUP BY date ORDER BY date`;
  const clicksLast7 = await q`SELECT date::text, COALESCE(SUM(count), 0) as count FROM analytics WHERE type = 'click' AND date >= CURRENT_DATE - INTERVAL '7 days' GROUP BY date ORDER BY date`;
  const totalArticles = await q`SELECT count(*) as total FROM articles`;
  const publishedArticles = await q`SELECT count(*) as total FROM articles WHERE published = true`;

  return {
    topArticles: articles.map(a => ({ id: a.id, title: a.title, clicks: a.clicks, category: a.category })),
    todayViews: Number(todayViews[0]?.total || 0),
    todayClicks: Number(todayClicks[0]?.total || 0),
    totalArticles: Number(totalArticles[0]?.total || 0),
    publishedArticles: Number(publishedArticles[0]?.total || 0),
    viewsLast7Days: viewsLast7.map(r => ({ date: r.date, count: Number(r.count) })),
    clicksLast7Days: clicksLast7.map(r => ({ date: r.date, count: Number(r.count) })),
  };
}

// Admin
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const rows = await sql()`SELECT * FROM admin_users WHERE username = ${username} AND password = ${password}`;
  return rows.length > 0;
}

// Settings
export async function getSetting(key: string): Promise<string | null> {
  const rows = await sql()`SELECT value FROM site_settings WHERE key = ${key}`;
  return rows[0]?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await sql()`INSERT INTO site_settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await sql()`SELECT key, value FROM site_settings`;
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return settings;
}
