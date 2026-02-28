import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics, trackPageView, trackArticleClick, getArticles } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const analytics = getAnalytics();
  const articles = getArticles();

  // Top articles by clicks
  const topArticles = [...articles]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)
    .map(a => ({ id: a.id, title: a.title, clicks: a.clicks, category: a.category }));

  // Total clicks today
  const today = new Date().toISOString().split('T')[0];
  const todayClicks = analytics.articleClicks
    .filter(c => c.date === today)
    .reduce((sum, c) => sum + c.count, 0);

  // Total page views today
  const todayViews = analytics.pageViews.find(v => v.date === today)?.count || 0;

  // Views last 7 days
  const last7Days = analytics.pageViews.slice(-7);

  // Clicks per day last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split('T')[0];
  const clicksPerDay: Record<string, number> = {};
  analytics.articleClicks
    .filter(c => c.date >= cutoff)
    .forEach(c => {
      clicksPerDay[c.date] = (clicksPerDay[c.date] || 0) + c.count;
    });

  return NextResponse.json({
    topArticles,
    todayClicks,
    todayViews,
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.published).length,
    viewsLast7Days: last7Days,
    clicksLast7Days: Object.entries(clicksPerDay).map(([date, count]) => ({ date, count })),
  });
}

export async function POST(request: NextRequest) {
  const { type, articleId } = await request.json();

  if (type === 'pageview') {
    trackPageView();
  } else if (type === 'click' && articleId) {
    trackArticleClick(articleId);
  }

  return NextResponse.json({ success: true });
}
