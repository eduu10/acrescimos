'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Clock, Filter } from 'lucide-react';
import Image from 'next/image';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  source: string;
  publishedAt: string;
}

const SPORT_FILTERS = [
  { label: 'Futebol', query: 'futebol' },
  { label: 'Basquete', query: 'basquete NBA' },
  { label: 'Tênis', query: 'tênis' },
  { label: 'F1', query: 'fórmula 1' },
  { label: 'Vôlei', query: 'vôlei' },
];

export function ExternalNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('futebol');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = async (query: string, pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(query)}&page=${pageNum}&pageSize=6`);
      const data = await res.json();
      const articles = data.articles || [];
      if (append) {
        setNews(prev => [...prev, ...articles]);
      } else {
        setNews(articles);
      }
      setHasMore(articles.length === 6);
    } catch {
      if (!append) setNews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    fetchNews(activeFilter, 1);
  }, [activeFilter]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNews(activeFilter, next, true);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-6">
        <h3 className="text-2xl font-oswald font-bold text-[#1B2436] uppercase border-l-4 border-[#F2E205] pl-3">
          Notícias Externas
        </h3>
        <Filter className="w-4 h-4 text-gray-400" />
      </div>

      {/* Sport Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SPORT_FILTERS.map(filter => (
          <button
            key={filter.query}
            onClick={() => setActiveFilter(filter.query)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-colors ${
              activeFilter === filter.query
                ? 'bg-[#1B2436] text-[#F2E205]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading && news.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-[#F2E205] border-t-transparent rounded-full" />
        </div>
      ) : news.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhuma notícia encontrada. Configure a GNEWS_API_KEY.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-gray-100">
                  {item.urlToImage ? (
                    <Image
                      src={item.urlToImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ExternalLink className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-[#1B2436]/80 mb-1">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-bold">{item.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(item.publishedAt)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-[#1B2436] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#2A3447] transition-colors disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
