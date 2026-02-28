const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || '';
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  source: string;
  publishedAt: string;
}

export async function getSportsNews(query: string = 'futebol', page: number = 1, pageSize: number = 10): Promise<{ articles: NewsItem[]; totalResults: number }> {
  try {
    const res = await fetch(
      `${BASE_URL}/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return { articles: [], totalResults: 0 };
    const data = await res.json();
    const articles: NewsItem[] = (data.articles || []).map((a: Record<string, unknown>) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      urlToImage: a.urlToImage,
      source: (a.source as Record<string, string>)?.name || 'Desconhecido',
      publishedAt: a.publishedAt,
    }));
    return { articles, totalResults: data.totalResults || 0 };
  } catch {
    return { articles: [], totalResults: 0 };
  }
}
