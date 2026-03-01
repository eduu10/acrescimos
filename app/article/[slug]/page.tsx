import { getArticleBySlug, getArticles } from '@/lib/db';
import { Header } from '@/components/header';
import { notFound } from 'next/navigation';
import { Clock, User, ArrowLeft, Eye, Tag, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ArticleTracker } from './tracker';
import { ArticleSidebar } from './sidebar';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artigo não encontrado - Acréscimos' };
  return {
    title: `${article.title} - Acréscimos`,
    description: article.content.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.slice(0, 160),
      images: article.image ? [article.image] : [],
      type: 'article',
      publishedTime: article.created_at,
      authors: [article.author],
    },
  };
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.published) notFound();

  const allArticles = await getArticles({ published: true });
  const relatedArticles = allArticles
    .filter(a => a.id !== article.id)
    .sort((a, b) => {
      const aMatch = a.category === article.category ? 0 : 1;
      const bMatch = b.category === article.category ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, 5);

  const readingTime = estimateReadingTime(article.content);
  const formattedDate = new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const paragraphs = article.content.split('\n').filter(p => p.trim());

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <ArticleTracker articleId={article.id} />

      {/* Hero image */}
      {article.image && (
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] bg-gray-800">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover opacity-80"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8 max-w-5xl">
            <span className="inline-block px-3 py-1 bg-[#F2E205] text-[#1B2436] text-xs font-bold uppercase tracking-wider rounded-sm mb-3">
              {article.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-oswald font-bold text-white leading-tight max-w-3xl">
              {article.title}
            </h1>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        {/* Title fallback when no image */}
        {!article.image && (
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2436] mb-4 dark:text-gray-400 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <span className="inline-block px-3 py-1 bg-[#F2E205] text-[#1B2436] text-xs font-bold uppercase tracking-wider rounded-sm mb-3">
              {article.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-oswald font-bold text-[#1B2436] dark:text-white leading-tight">
              {article.title}
            </h1>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {article.image && (
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2436] mb-4 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                Voltar para início
              </Link>
            )}

            {/* Meta bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {readingTime} min de leitura
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                {article.category}
              </span>
            </div>

            {/* Article body */}
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-base sm:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            {/* Share bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Gostou? Compartilhe!</span>
                <ArticleSidebar type="share" title={article.title} slug={article.slug} />
              </div>
            </div>

            {/* Related articles - mobile */}
            <div className="lg:hidden">
              {relatedArticles.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
                  <h3 className="font-oswald font-bold text-[#1B2436] dark:text-white text-lg mb-4">Mais Notícias</h3>
                  <div className="flex flex-col gap-4">
                    {relatedArticles.map(related => (
                      <Link key={related.id} href={`/article/${related.slug}`} className="flex gap-3 group">
                        <div className="w-20 h-14 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          {related.image ? (
                            <img src={related.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-[#F2E205] transition-colors">{related.title}</p>
                          <span className="text-xs text-gray-400 mt-1">{related.category}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            {/* Live scores */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-oswald font-bold text-[#1B2436] dark:text-white text-lg mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Placar Ao Vivo
              </h3>
              <ArticleSidebar type="scores" />
            </div>

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-oswald font-bold text-[#1B2436] dark:text-white text-lg mb-4">Mais Notícias</h3>
                <div className="flex flex-col gap-4">
                  {relatedArticles.map(related => (
                    <Link key={related.id} href={`/article/${related.slug}`} className="flex gap-3 group">
                      <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {related.image ? (
                          <img src={related.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-[#F2E205] transition-colors">{related.title}</p>
                        <span className="text-xs text-gray-400">{related.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Standings CTA */}
            <div className="bg-[#1B2436] rounded-xl p-5 text-center">
              <h3 className="font-oswald font-bold text-white text-lg mb-2">Classificação</h3>
              <p className="text-xs text-gray-400 mb-3">Veja a tabela completa do Brasileirão</p>
              <Link href="/classificacao" className="inline-block bg-[#F2E205] text-[#1B2436] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors">
                Ver Classificação
              </Link>
            </div>

            {/* Placar link */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="font-oswald font-bold text-[#1B2436] dark:text-white mb-2">Acompanhe</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Resultados em tempo real de todos os campeonatos</p>
              <Link href="/placar" className="flex items-center gap-2 text-sm text-[#1B2436] dark:text-[#F2E205] font-bold hover:underline">
                <MessageCircle className="w-4 h-4" />
                Ver placar ao vivo
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1B2436] text-white py-8 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F2E205] text-[#1B2436] rounded flex items-center justify-center font-bold text-xs">AC</div>
              <span className="font-oswald font-bold">ACRÉSCIMOS</span>
            </div>
            <div className="flex gap-6 text-xs text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <Link href="/placar" className="hover:text-white transition-colors">Placar</Link>
              <Link href="/classificacao" className="hover:text-white transition-colors">Classificação</Link>
            </div>
            <span className="text-xs text-gray-500">&copy; 2026 Acréscimos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
