import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  pageViews: { date: string; count: number }[];
  articleClicks: { articleId: string; date: string; count: number }[];
}

function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Articles
export function getArticles(): Article[] {
  return readJSON<Article[]>('articles.json');
}

export function getArticleById(id: string): Article | undefined {
  const articles = getArticles();
  return articles.find(a => a.id === id);
}

export function getArticleBySlug(slug: string): Article | undefined {
  const articles = getArticles();
  return articles.find(a => a.slug === slug);
}

export function createArticle(article: Omit<Article, 'id' | 'clicks' | 'createdAt' | 'updatedAt'>): Article {
  const articles = getArticles();
  const newArticle: Article = {
    ...article,
    id: Date.now().toString(),
    clicks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  articles.unshift(newArticle);
  writeJSON('articles.json', articles);
  return newArticle;
}

export function updateArticle(id: string, updates: Partial<Article>): Article | null {
  const articles = getArticles();
  const index = articles.findIndex(a => a.id === id);
  if (index === -1) return null;
  articles[index] = { ...articles[index], ...updates, updatedAt: new Date().toISOString() };
  writeJSON('articles.json', articles);
  return articles[index];
}

export function deleteArticle(id: string): boolean {
  const articles = getArticles();
  const filtered = articles.filter(a => a.id !== id);
  if (filtered.length === articles.length) return false;
  writeJSON('articles.json', filtered);
  return true;
}

// Analytics
export function getAnalytics(): AnalyticsData {
  return readJSON<AnalyticsData>('analytics.json');
}

export function trackPageView(): void {
  const analytics = getAnalytics();
  const today = new Date().toISOString().split('T')[0];
  const existing = analytics.pageViews.find(v => v.date === today);
  if (existing) {
    existing.count++;
  } else {
    analytics.pageViews.push({ date: today, count: 1 });
  }
  // Keep last 30 days
  analytics.pageViews = analytics.pageViews.slice(-30);
  writeJSON('analytics.json', analytics);
}

export function trackArticleClick(articleId: string): void {
  const analytics = getAnalytics();
  const today = new Date().toISOString().split('T')[0];
  const existing = analytics.articleClicks.find(c => c.articleId === articleId && c.date === today);
  if (existing) {
    existing.count++;
  } else {
    analytics.articleClicks.push({ articleId, date: today, count: 1 });
  }
  // Keep last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0];
  analytics.articleClicks = analytics.articleClicks.filter(c => c.date >= cutoff);
  writeJSON('analytics.json', analytics);

  // Also increment article click count
  const articles = getArticles();
  const article = articles.find(a => a.id === articleId);
  if (article) {
    article.clicks++;
    writeJSON('articles.json', articles);
  }
}
