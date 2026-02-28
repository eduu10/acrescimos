import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData, trackPageView, trackArticleClick } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const data = await getAnalyticsData();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { type, articleId } = await request.json();

  if (type === 'pageview') {
    await trackPageView();
  } else if (type === 'click' && articleId) {
    await trackArticleClick(Number(articleId));
  }

  return NextResponse.json({ success: true });
}
