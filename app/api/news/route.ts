import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'futebol';
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('pageSize') || '10';

  if (!API_KEY) {
    return NextResponse.json({ articles: [], totalResults: 0, error: 'API key não configurada' });
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query + ' esporte')}&language=pt&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) return NextResponse.json({ articles: [], totalResults: 0 });
    const data = await res.json();

    const articles = (data.articles || []).map((a: Record<string, unknown>) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.urlToImage,
      source: (a.source as Record<string, string>)?.name || 'Desconhecido',
      publishedAt: a.publishedAt,
    }));

    return NextResponse.json({ articles, totalResults: data.totalResults || 0 });
  } catch {
    return NextResponse.json({ articles: [], totalResults: 0 });
  }
}
