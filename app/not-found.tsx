import { Header } from '@/components/header'
import { getArticles } from '@/lib/db'
import Link from 'next/link'
import { Search, Home, Trophy, BarChart3 } from 'lucide-react'

export default async function NotFound() {
  const articles = await getArticles({ published: true })
  const recentArticles = articles.slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="text-8xl mb-6">⚽</div>
        <h1 className="text-4xl font-oswald font-bold text-[#1B2436] dark:text-white mb-3">
          Fora de campo!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md">
          A página que você procura não foi encontrada. Que tal buscar outra notícia?
        </p>

        {/* Search */}
        <form action="/busca" method="GET" className="w-full max-w-md mb-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                name="q"
                placeholder="Buscar notícias..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F2E205]"
              />
            </div>
            <button type="submit" className="px-5 py-3 bg-[#F2E205] text-[#1B2436] font-bold rounded-lg hover:bg-yellow-300 transition-colors">
              Buscar
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-[#1B2436] text-white rounded-lg hover:bg-[#F2E205] hover:text-[#1B2436] transition-colors text-sm font-medium">
            <Home className="w-4 h-4" /> Início
          </Link>
          <Link href="/placar" className="flex items-center gap-2 px-4 py-2 bg-[#1B2436] text-white rounded-lg hover:bg-[#F2E205] hover:text-[#1B2436] transition-colors text-sm font-medium">
            <Trophy className="w-4 h-4" /> Placar
          </Link>
          <Link href="/classificacao" className="flex items-center gap-2 px-4 py-2 bg-[#1B2436] text-white rounded-lg hover:bg-[#F2E205] hover:text-[#1B2436] transition-colors text-sm font-medium">
            <BarChart3 className="w-4 h-4" /> Classificação
          </Link>
        </div>

        {/* Recent articles */}
        {recentArticles.length > 0 && (
          <div className="w-full max-w-2xl">
            <h2 className="font-oswald font-bold text-[#1B2436] dark:text-white text-lg mb-4">Artigos Recentes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
                >
                  <span className="text-xs font-bold text-[#F2E205] uppercase">{article.category}</span>
                  <h3 className="mt-1 font-bold text-gray-900 dark:text-white text-sm line-clamp-2">{article.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">&copy; 2026 Acréscimos</div>
      </footer>
    </div>
  )
}
