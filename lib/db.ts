import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

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
  image_caption: string;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
  clicks: number;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
}

// Articles
export async function getArticles(filters?: { published?: boolean; category?: string; featured?: boolean; limit?: number; offset?: number }): Promise<Article[]> {
  const q = sql();
  const limit = filters?.limit ?? 100;
  const offset = filters?.offset ?? 0;
  if (filters?.published !== undefined && filters?.category) {
    return await q`SELECT * FROM articles WHERE published = ${filters.published} AND LOWER(category) = LOWER(${filters.category}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
  } else if (filters?.published !== undefined) {
    return await q`SELECT * FROM articles WHERE published = ${filters.published} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
  } else if (filters?.featured) {
    return await q`SELECT * FROM articles WHERE featured = true AND published = true ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
  }
  return await q`SELECT * FROM articles ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
}

export async function countArticles(filters?: { published?: boolean; category?: string }): Promise<number> {
  const q = sql();
  let result;
  if (filters?.published !== undefined && filters?.category) {
    result = await q`SELECT COUNT(*) as total FROM articles WHERE published = ${filters.published} AND LOWER(category) = LOWER(${filters.category})`;
  } else if (filters?.published !== undefined) {
    result = await q`SELECT COUNT(*) as total FROM articles WHERE published = ${filters.published}`;
  } else {
    result = await q`SELECT COUNT(*) as total FROM articles`;
  }
  return Number(result[0]?.total ?? 0);
}

export async function getArticleById(id: number): Promise<Article | null> {
  const rows = await sql()`SELECT * FROM articles WHERE id = ${id}` as Article[];
  return rows[0] || null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const rows = await sql()`SELECT * FROM articles WHERE slug = ${slug}` as Article[];
  return rows[0] || null;
}

export async function createArticle(data: { title: string; slug: string; content: string; image: string; image_caption?: string; category: string; author: string; published: boolean; featured: boolean; scheduled_at?: string | null }): Promise<Article> {
  const caption = data.image_caption || '';
  const scheduled = data.scheduled_at || null;
  const rows = await sql()`INSERT INTO articles (title, slug, content, image, image_caption, category, author, published, featured, scheduled_at) VALUES (${data.title}, ${data.slug}, ${data.content}, ${data.image}, ${caption}, ${data.category}, ${data.author}, ${data.published}, ${data.featured}, ${scheduled}) RETURNING *` as Article[];
  return rows[0];
}

export async function updateArticle(id: number, data: Partial<Article>): Promise<Article | null> {
  const current = await getArticleById(id);
  if (!current) return null;

  const title = data.title ?? current.title;
  const slug = data.slug ?? current.slug;
  const content = data.content ?? current.content;
  const image = data.image ?? current.image;
  const image_caption = data.image_caption ?? current.image_caption ?? '';
  const category = data.category ?? current.category;
  const author = data.author ?? current.author;
  const published = data.published ?? current.published;
  const featured = data.featured ?? current.featured;
  const scheduled_at = data.scheduled_at !== undefined ? data.scheduled_at : current.scheduled_at;

  const rows = await sql()`UPDATE articles SET title=${title}, slug=${slug}, content=${content}, image=${image}, image_caption=${image_caption}, category=${category}, author=${author}, published=${published}, featured=${featured}, scheduled_at=${scheduled_at}, updated_at=NOW() WHERE id=${id} RETURNING *` as Article[];
  return rows[0] || null;
}

export async function publishScheduledArticles(): Promise<number> {
  const rows = await sql()`UPDATE articles SET published = true, scheduled_at = NULL WHERE scheduled_at IS NOT NULL AND scheduled_at <= NOW() AND published = false RETURNING id`;
  return rows.length;
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
const BCRYPT_SALT_ROUNDS = 12;

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const rows = await sql()`SELECT * FROM admin_users WHERE username = ${username}`;
  if (rows.length === 0) return false;
  const storedPassword = rows[0].password as string;

  // Support both bcrypt hashes and plain text (for migration period)
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
    return bcrypt.compare(password, storedPassword);
  }

  // Plain text fallback — auto-migrate to bcrypt on successful login
  if (password === storedPassword) {
    const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await sql()`UPDATE admin_users SET password = ${hash} WHERE username = ${username}`;
    return true;
  }

  return false;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
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

// Paginated queries
export async function getArticlesByCategory(
  category: string,
  page: number = 1,
  limit: number = 12
): Promise<{ articles: Article[]; total: number }> {
  const offset = (page - 1) * limit;
  const q = sql();
  const articles = await q`SELECT * FROM articles WHERE published = true AND LOWER(category) = LOWER(${category}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
  const countResult = await q`SELECT COUNT(*) as total FROM articles WHERE published = true AND LOWER(category) = LOWER(${category})`;
  return { articles, total: Number(countResult[0]?.total || 0) };
}

export async function searchArticles(
  query: string,
  page: number = 1,
  limit: number = 12
): Promise<{ articles: Article[]; total: number }> {
  const offset = (page - 1) * limit;
  const q = sql();

  try {
    // Full-text search with tsvector + ts_rank relevance ordering
    const articles = await q`
      SELECT *, ts_rank(search_vector, plainto_tsquery('portuguese', ${query})) AS rank
      FROM articles
      WHERE published = true AND search_vector @@ plainto_tsquery('portuguese', ${query})
      ORDER BY rank DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as (Article & { rank: number })[];

    const countResult = await q`
      SELECT COUNT(*) as total FROM articles
      WHERE published = true AND search_vector @@ plainto_tsquery('portuguese', ${query})
    `;

    if (Number(countResult[0]?.total || 0) > 0) {
      return { articles, total: Number(countResult[0].total) };
    }
  } catch {
    // fall through to ILIKE
  }

  // Fallback: ILIKE (handles edge cases / column not yet populated)
  const searchQuery = `%${query}%`;
  const articles = await q`SELECT * FROM articles WHERE published = true AND (title ILIKE ${searchQuery} OR content ILIKE ${searchQuery}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
  const countResult = await q`SELECT COUNT(*) as total FROM articles WHERE published = true AND (title ILIKE ${searchQuery} OR content ILIKE ${searchQuery})`;
  return { articles, total: Number(countResult[0]?.total || 0) };
}

// Tags
export interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
}

export async function getTags(): Promise<Tag[]> {
  return await sql()`SELECT * FROM tags ORDER BY name` as Tag[];
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const rows = await sql()`SELECT * FROM tags WHERE slug = ${slug}` as Tag[];
  return rows[0] || null;
}

export async function createTag(name: string): Promise<Tag> {
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const rows = await sql()`INSERT INTO tags (name, slug) VALUES (${name}, ${slug}) RETURNING *` as Tag[];
  return rows[0];
}

export async function getArticleTags(articleId: number): Promise<Tag[]> {
  return await sql()`SELECT t.* FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = ${articleId} ORDER BY t.name` as Tag[];
}

export async function setArticleTags(articleId: number, tagIds: number[]): Promise<void> {
  await sql()`DELETE FROM article_tags WHERE article_id = ${articleId}`;
  for (const tagId of tagIds) {
    await sql()`INSERT INTO article_tags (article_id, tag_id) VALUES (${articleId}, ${tagId}) ON CONFLICT DO NOTHING`;
  }
}

export async function getArticlesByTag(tagSlug: string, page: number = 1, limit: number = 12): Promise<{ articles: Article[]; total: number }> {
  const offset = (page - 1) * limit;
  const q = sql();
  const articles = await q`SELECT a.* FROM articles a JOIN article_tags at ON a.id = at.article_id JOIN tags t ON t.id = at.tag_id WHERE t.slug = ${tagSlug} AND a.published = true ORDER BY a.created_at DESC LIMIT ${limit} OFFSET ${offset}` as Article[];
  const countResult = await q`SELECT COUNT(*) as total FROM articles a JOIN article_tags at ON a.id = at.article_id JOIN tags t ON t.id = at.tag_id WHERE t.slug = ${tagSlug} AND a.published = true`;
  return { articles, total: Number(countResult[0]?.total || 0) };
}

// Newsletter
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    await sql()`INSERT INTO newsletter_subscribers (email) VALUES (${email})`;
    return { success: true, message: 'Inscrito com sucesso!' };
  } catch {
    return { success: false, message: 'Este email já está inscrito.' };
  }
}

export async function getSubscriberCount(): Promise<number> {
  const rows = await sql()`SELECT COUNT(*) as total FROM newsletter_subscribers`;
  return Number(rows[0]?.total || 0);
}

// Comments
export interface Comment {
  id: number;
  article_id: number;
  author_name: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export async function getApprovedComments(articleId: number): Promise<Comment[]> {
  return await sql()`SELECT * FROM comments WHERE article_id = ${articleId} AND approved = true ORDER BY created_at DESC` as Comment[];
}

export async function createComment(articleId: number, authorName: string, content: string): Promise<Comment> {
  const rows = await sql()`INSERT INTO comments (article_id, author_name, content) VALUES (${articleId}, ${authorName}, ${content}) RETURNING *` as Comment[];
  return rows[0];
}

export async function getPendingComments(): Promise<(Comment & { article_title: string; article_slug: string })[]> {
  return await sql()`SELECT c.*, a.title as article_title, a.slug as article_slug FROM comments c JOIN articles a ON a.id = c.article_id WHERE c.approved = false ORDER BY c.created_at DESC` as (Comment & { article_title: string; article_slug: string })[];
}

export async function approveComment(id: number): Promise<boolean> {
  const rows = await sql()`UPDATE comments SET approved = true WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function deleteComment(id: number): Promise<boolean> {
  const rows = await sql()`DELETE FROM comments WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// Push subscriptions
export interface PushSubscription {
  id: number;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  created_at: string;
}

export async function savePushSubscription(endpoint: string, p256dh: string, auth: string): Promise<void> {
  await sql()`INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth) VALUES (${endpoint}, ${p256dh}, ${auth}) ON CONFLICT (endpoint) DO UPDATE SET keys_p256dh = ${p256dh}, keys_auth = ${auth}`;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  await sql()`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
}

export async function getAllPushSubscriptions(): Promise<PushSubscription[]> {
  return await sql()`SELECT * FROM push_subscriptions` as PushSubscription[];
}

// Scraped URLs tracking
export async function getScrapedUrls(): Promise<string[]> {
  const value = await getSetting('scraped_urls');
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}

export async function addScrapedUrl(url: string): Promise<void> {
  const urls = await getScrapedUrls();
  if (!urls.includes(url)) {
    urls.push(url);
    await setSetting('scraped_urls', JSON.stringify(urls));
  }
}

// Polls
export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Poll {
  id: number;
  article_id: number;
  question: string;
  options: PollOption[];
  created_at: string;
}

export async function createPoll(articleId: number, question: string, optionTexts: string[]): Promise<Poll> {
  const options: PollOption[] = optionTexts.map((text, i) => ({ id: i + 1, text, votes: 0 }));
  const rows = await sql()`INSERT INTO polls (article_id, question, options) VALUES (${articleId}, ${question}, ${JSON.stringify(options)}) RETURNING *` as Poll[];
  return { ...rows[0], options };
}

export async function getArticlePoll(articleId: number): Promise<Poll | null> {
  const rows = await sql()`SELECT * FROM polls WHERE article_id = ${articleId} LIMIT 1` as Poll[];
  if (!rows[0]) return null;
  const options = typeof rows[0].options === 'string' ? JSON.parse(rows[0].options) : rows[0].options;
  return { ...rows[0], options };
}

export async function votePoll(pollId: number, optionId: number): Promise<Poll | null> {
  const rows = await sql()`SELECT * FROM polls WHERE id = ${pollId}` as Poll[];
  if (!rows[0]) return null;
  const options: PollOption[] = typeof rows[0].options === 'string' ? JSON.parse(rows[0].options) : rows[0].options;
  const updated = options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o);
  const result = await sql()`UPDATE polls SET options = ${JSON.stringify(updated)} WHERE id = ${pollId} RETURNING *` as Poll[];
  return { ...result[0], options: updated };
}

// Live Coverage
export interface LiveEvent {
  id: number;
  fixture_id: number;
  minute: number | null;
  event_type: string;
  team: string | null;
  player: string | null;
  detail: string | null;
  ai_comment: string | null;
  created_at: string;
}

export async function getLiveCoverage(fixtureId: number): Promise<LiveEvent[]> {
  return await sql()`SELECT * FROM live_coverage WHERE fixture_id = ${fixtureId} ORDER BY minute ASC NULLS FIRST, created_at ASC` as LiveEvent[];
}

export async function addLiveEvent(data: Omit<LiveEvent, 'id' | 'created_at'>): Promise<LiveEvent> {
  const rows = await sql()`
    INSERT INTO live_coverage (fixture_id, minute, event_type, team, player, detail, ai_comment)
    VALUES (${data.fixture_id}, ${data.minute ?? null}, ${data.event_type}, ${data.team ?? null}, ${data.player ?? null}, ${data.detail ?? null}, ${data.ai_comment ?? null})
    RETURNING *
  ` as LiveEvent[];
  return rows[0];
}

export async function clearLiveCoverage(fixtureId: number): Promise<void> {
  await sql()`DELETE FROM live_coverage WHERE fixture_id = ${fixtureId}`;
}

// Transfer Alerts
export interface TransferAlert {
  id: number;
  url: string;
  title: string | null;
  player: string | null;
  from_club: string | null;
  to_club: string | null;
  status: 'detected' | 'published' | 'skipped';
  article_id: number | null;
  detected_at: string;
}

export async function getTransferAlerts(status?: string): Promise<TransferAlert[]> {
  if (status) {
    return await sql()`SELECT * FROM transfer_alerts WHERE status = ${status} ORDER BY detected_at DESC LIMIT 50` as TransferAlert[];
  }
  return await sql()`SELECT * FROM transfer_alerts ORDER BY detected_at DESC LIMIT 50` as TransferAlert[];
}

export async function upsertTransferAlert(data: Pick<TransferAlert, 'url' | 'title' | 'player' | 'from_club' | 'to_club'>): Promise<{ inserted: boolean }> {
  const rows = await sql()`
    INSERT INTO transfer_alerts (url, title, player, from_club, to_club)
    VALUES (${data.url}, ${data.title ?? null}, ${data.player ?? null}, ${data.from_club ?? null}, ${data.to_club ?? null})
    ON CONFLICT (url) DO NOTHING
    RETURNING id
  `;
  return { inserted: rows.length > 0 };
}

export async function updateTransferAlertStatus(id: number, status: 'published' | 'skipped', articleId?: number): Promise<void> {
  await sql()`UPDATE transfer_alerts SET status = ${status}, article_id = ${articleId ?? null} WHERE id = ${id}`;
}
