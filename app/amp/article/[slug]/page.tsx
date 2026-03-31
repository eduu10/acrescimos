import { getArticleBySlug } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artigo não encontrado' };
  const description = article.content.replace(/<[^>]+>/g, '').slice(0, 160);
  return {
    title: `${article.title} | Acréscimos`,
    description,
    alternates: {
      canonical: `https://acrescimos.com.br/article/${article.slug}`,
    },
    robots: {
      index: false, // canonical is the main article page
    },
  };
}

export default async function AmpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.published) notFound();

  const formattedDate = new Date(article.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const plainContent = article.content.replace(/<[^>]+>/g, '');
  const paragraphs = plainContent.split('\n').filter(p => p.trim().length > 0);
  const canonicalUrl = `https://acrescimos.com.br/article/${article.slug}`;

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal header */}
      <header className="bg-[#1B2436] px-4 py-3 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-[#F2E205] text-[#1B2436] font-bold text-xs px-2 py-1 rounded">AC</span>
          <span className="text-white font-bold text-sm tracking-widest">ACRÉSCIMOS</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <span className="inline-block bg-[#F2E205] text-[#1B2436] text-xs font-bold px-3 py-1 rounded-sm mb-4 uppercase tracking-wide">
          {article.category}
        </span>

        <h1 className="text-2xl font-bold text-[#1B2436] leading-tight mb-3">
          {article.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-5 pb-4 border-b border-gray-100">
          <span>Por {article.author}</span>
          <time dateTime={article.created_at}>{formattedDate}</time>
        </div>

        {article.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            className="w-full rounded-lg mb-6 object-cover"
            style={{ maxHeight: '400px' }}
            loading="eager"
          />
        )}

        <article className="prose prose-lg max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-4 text-base">
              {p}
            </p>
          ))}
        </article>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link
            href={canonicalUrl}
            className="inline-flex items-center gap-2 bg-[#1B2436] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
          >
            Leia a versão completa →
          </Link>
        </div>
      </main>

      <footer className="bg-[#1B2436] text-gray-400 text-xs text-center py-4 mt-8 border-t-2 border-[#F2E205]">
        © 2026 Acréscimos
      </footer>
    </div>
  );
}
