'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, User } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string;
  category: string;
  author: string;
  created_at: string;
}

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?published=true')
      .then(res => res.json())
      .then(data => { setArticles(data.slice(0, 6)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Há ${days}d`;
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="text-2xl font-oswald font-bold text-[#1B2436] dark:text-white uppercase border-l-4 border-[#F2E205] pl-3">
          Últimas Notícias
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-[4/3] rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Nenhum artigo publicado ainda. Crie artigos no painel admin.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.map(article => (
            <Link href={`/article/${article.slug}`} key={article.id} className="group flex flex-col gap-3 cursor-pointer">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                {article.image ? (
                  <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sem imagem</div>
                )}
                <span className="absolute top-2 left-2 bg-[#1B2436] text-[#F2E205] text-[10px] font-bold px-2 py-1 uppercase rounded">
                  {article.category}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-[#1B2436]/80 dark:group-hover:text-[#F2E205] transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(article.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
