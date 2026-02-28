'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

export function HeroGrid() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?published=true&featured=true')
      .then(res => res.json())
      .then(data => { setArticles(data.slice(0, 3)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 aspect-video rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex flex-col gap-6">
            <div className="flex-1 min-h-[200px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1 min-h-[200px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Nenhum artigo em destaque. Marque artigos como &quot;featured&quot; no painel admin.</p>
        </div>
      </section>
    );
  }

  const main = articles[0];
  const side = articles.slice(1, 3);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Story */}
        <Link href={`/article/${main.slug}`} className="lg:col-span-2 group cursor-pointer block">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            {main.image ? (
              <Image src={main.image} alt={main.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <span className="inline-block px-2 py-1 bg-[#F2E205] text-[#1B2436] text-xs font-bold uppercase tracking-wider mb-3 rounded-sm">
                {main.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-oswald font-bold text-white leading-tight mb-2 group-hover:text-[#F2E205] transition-colors">
                {main.title}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base line-clamp-2 max-w-2xl">
                {main.content.slice(0, 150)}...
              </p>
            </div>
          </div>
        </Link>

        {/* Side Stories */}
        <div className="flex flex-col gap-6">
          {side.map(article => (
            <Link href={`/article/${article.slug}`} key={article.id} className="relative flex-1 group cursor-pointer min-h-[200px] rounded-xl overflow-hidden block">
              {article.image ? (
                <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-700 absolute inset-0" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="text-[#F2E205] text-xs font-bold uppercase mb-1 block">{article.category}</span>
                <h2 className="text-xl font-oswald font-bold text-white leading-tight group-hover:underline">
                  {article.title}
                </h2>
              </div>
            </Link>
          ))}
          {side.length < 2 && (
            <div className="relative flex-1 min-h-[200px] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Mais destaques em breve</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
