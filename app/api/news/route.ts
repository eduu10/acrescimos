import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GNEWS_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'futebol';
  const page = searchParams.get('page') || '1';
  const max = searchParams.get('max') || '10';

  if (!API_KEY) {
    return NextResponse.json({ articles: [], totalResults: 0, error: 'API key não configurada' });
  }

  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query + ' esporte')}&lang=pt&max=${max}&page=${page}&apikey=${API_KEY}`,
      { next: { revalidate: 1800 } }
    );

    if (!res.ok) return NextResponse.json({ articles: [], totalResults: 0 });
    const data = await res.json();

    const articles = (data.articles || []).map((a: any) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.image,
      source: a.source?.name || 'Desconhecido',
      publishedAt: a.publishedAt,
    }));

    return NextResponse.json({ articles, totalResults: data.totalArticles || 0 });
  } catch {
    return NextResponse.json({ articles: [], totalResults: 0 });
  }
}
