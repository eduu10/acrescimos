import { Header } from '@/components/header'
import { Pagination } from '@/components/pagination'
import { getArticlesByCategory } from '@/lib/db'
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const revalidate = 120

export function generateStaticParams() {
  return CATEGORIES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return { title: 'Categoria não encontrada' }

  return {
    title: `${category.name} — Notícias`,
    description: category.description,
    alternates: { canonical: `https://acrescimos.com.br/categoria/${slug}` },
    openGraph: {
      title: `${category.name} - Acréscimos`,
      description: category.description,
      url: `https://acrescimos.com.br/categoria/${slug}`,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Acréscimos',
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageStr } = await searchParams
  const category = getCategoryBySlug(slug)

  if (!category) notFound()

  const page = Math.max(1, parseInt(pageStr || '1', 10))
  const limit = 12
  const { articles, total } = await getArticlesByCategory(category.name, page, limit)
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-[#1B2436] dark:hover:text-white">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 dark:text-white font-medium">{category.name}</li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-oswald font-bold text-[#1B2436] dark:text-white mb-2">{category.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">{category.description}</p>
          <p className="text-gray-400 text-xs mt-2">{total} {total === 1 ? 'artigo' : 'artigos'} encontrados</p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Nenhum artigo nesta categoria ainda.</p>
            <Link href="/" className="mt-4 inline-block text-[#F2E205] font-bold hover:underline">
              Voltar ao início
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-[#F2E205] uppercase">{article.category}</span>
                  <h2 className="mt-1 font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#F2E205] transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {article.content.replace(/<[^>]+>/g, '').slice(0, 120)}...
                  </p>
                  <time dateTime={article.created_at} className="mt-3 block text-xs text-gray-400">
                    {new Date(article.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} basePath={`/categoria/${slug}`} />
      </main>

      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          &copy; 2026 Acréscimos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
