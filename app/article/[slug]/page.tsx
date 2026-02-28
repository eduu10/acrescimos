import { getArticles, getArticleBySlug } from '@/lib/db';
import { Header } from '@/components/header';
import { notFound } from 'next/navigation';
import { Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ArticleTracker } from './tracker';

export async function generateStaticParams() {
  const articles = getArticles();
  return articles.map(a => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || !article.published) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <ArticleTracker articleId={article.id} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2436] mb-6 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <article>
          <span className="inline-block px-2 py-1 bg-[#F2E205] text-[#1B2436] text-xs font-bold uppercase tracking-wider mb-3 rounded-sm">
            {article.category}
          </span>

          <h1 className="text-3xl sm:text-4xl font-oswald font-bold text-[#1B2436] dark:text-white leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {article.image && article.image !== '/uploads/default.jpg' && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 bg-gray-200">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {article.content.split('\n').map((paragraph, i) => (
              paragraph.trim() ? <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{paragraph}</p> : null
            ))}
          </div>
        </article>
      </main>

      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          &copy; 2026 Acréscimos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
