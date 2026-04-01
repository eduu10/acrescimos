import { Header } from '@/components/header'
import { Pagination } from '@/components/pagination'
import { searchArticles } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams
  const title = q ? `Busca: ${q} | Acréscimos` : 'Buscar Notícias Esportivas | Acréscimos'
  const description = q
    ? `Resultados de busca para "${q}" no Acréscimos — portal de notícias do futebol brasileiro.`
    : 'Busque notícias esportivas no Acréscimos. Futebol brasileiro, Brasileirão, Copa do Brasil, Libertadores e muito mais.'
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, url: 'https://acrescimos.com.br/busca', type: 'website', locale: 'pt_BR', siteName: 'Acréscimos' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q, page: pageStr } = await searchParams
  const query = q?.trim() || ''
  const page = Math.max(1, parseInt(pageStr || '1', 10))

  const { articles, total } = query
    ? await searchArticles(query, page, 12)
    : { articles: [], total: 0 }
  const totalPages = Math.ceil(total / 12)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-oswald font-bold text-[#1B2436] dark:text-white mb-6">Buscar Notícias</h1>

        <form action="/busca" method="GET" className="mb-8">
          <div className="flex gap-2 max-w-xl">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar artigos..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F2E205]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#F2E205] text-[#1B2436] font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>

        {query && (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {total} {total === 1 ? 'resultado' : 'resultados'} para &quot;{query}&quot;
          </p>
        )}

        {!query ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">Digite algo para buscar notícias esportivas.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Brasileirão', 'Cruzeiro', 'Atlético', 'Libertadores', 'Mercado'].map((term) => (
                <Link key={term} href={`/busca?q=${term}`} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-[#F2E205] hover:text-[#1B2436] transition-colors">
                  {term}
                </Link>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Nenhum resultado encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.slug}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                  {article.image ? (
                    <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Sem imagem</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-[#F2E205] uppercase">{article.category}</span>
                  <h2 className="mt-1 font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#F2E205] transition-colors">{article.title}</h2>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{article.content.slice(0, 120)}...</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query && <Pagination currentPage={page} totalPages={totalPages} basePath={`/busca?q=${encodeURIComponent(query)}`} />}
      </main>

      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">&copy; 2026 Acréscimos</div>
      </footer>
    </div>
  )
}
