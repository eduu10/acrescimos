import { Header } from '@/components/header';
import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Eye, MessageCircle, Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 300;

const rankingDescription = 'As 10 matérias mais lidas e comentadas da semana no Acréscimos — portal de notícias do futebol brasileiro.'
export const metadata: Metadata = {
  title: 'Power Ranking — As mais lidas da semana | Acréscimos',
  description: rankingDescription,
  alternates: { canonical: 'https://acrescimos.com.br/ranking' },
  openGraph: {
    title: 'Power Ranking Semanal | Acréscimos',
    description: rankingDescription,
    url: 'https://acrescimos.com.br/ranking',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Acréscimos',
    images: [{ url: 'https://acrescimos.com.br/og-default.jpg', width: 1200, height: 630, alt: 'Power Ranking Acréscimos' }],
  },
  twitter: { card: 'summary_large_image', title: 'Power Ranking Semanal | Acréscimos', description: rankingDescription },
};

interface RankedArticle {
  position: number;
  id: number;
  title: string;
  slug: string;
  image: string | null;
  category: string;
  author: string;
  created_at: string;
  views: number;
  comment_count: number;
  score: number;
}

async function getRanking(): Promise<RankedArticle[]> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT
        a.id,
        a.title,
        a.slug,
        a.image,
        a.category,
        a.author,
        a.created_at,
        COALESCE(a.views, 0) AS views,
        0 AS comment_count
      FROM articles a
      WHERE a.published = true
        AND a.created_at >= NOW() - INTERVAL '7 days'
      ORDER BY COALESCE(a.views, 0) DESC
      LIMIT 10
    `;

    return rows.map((row, i) => ({
      position: i + 1,
      id: row.id,
      title: row.title,
      slug: row.slug,
      image: row.image,
      category: row.category,
      author: row.author,
      created_at: row.created_at,
      views: Number(row.views),
      comment_count: Number(row.comment_count),
      score: Number(row.views),
    }));
  } catch {
    return [];
  }
}

const MEDAL_COLORS = ['#F2E205', '#C0C0C0', '#CD7F32'];
const POSITION_BG = ['bg-yellow-400', 'bg-gray-300', 'bg-orange-400'];

export default async function RankingPage() {
  const ranking = await getRanking();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="bg-[#1B2436] rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F2E205] rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-[#1B2436]" />
          </div>
          <div>
            <h1 className="text-2xl font-oswald font-bold text-white">Power Ranking</h1>
            <p className="text-sm text-gray-400">As 10 matérias mais lidas e comentadas nos últimos 7 dias</p>
          </div>
        </div>

        {ranking.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhuma matéria publicada nos últimos 7 dias ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ranking.map(article => {
              const isTop3 = article.position <= 3;
              return (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className={`group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border ${
                    isTop3 ? 'border-[#F2E205]/40 shadow-md' : 'border-gray-100 dark:border-gray-700'
                  } p-4 hover:shadow-lg transition-all hover:-translate-y-0.5`}
                >
                  {/* Position badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-oswald font-bold text-lg ${
                    isTop3 ? POSITION_BG[article.position - 1] + ' text-[#1B2436]' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {article.position}
                  </div>

                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt=""
                        width={64}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#F2E205] bg-[#1B2436] dark:bg-[#0d1520] px-2 py-0.5 rounded-sm mb-1">
                      {article.category}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#1B2436] dark:group-hover:text-[#F2E205] transition-colors">
                      {article.title}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.views.toLocaleString('pt-BR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {article.comment_count}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-[#1B2436] text-white py-8 border-t-4 border-[#F2E205] mt-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F2E205] text-[#1B2436] rounded flex items-center justify-center font-bold text-xs">AC</div>
              <span className="font-oswald font-bold">ACRÉSCIMOS</span>
            </div>
            <div className="flex gap-6 text-xs text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <Link href="/placar" className="hover:text-white transition-colors">Placar</Link>
              <Link href="/classificacao" className="hover:text-white transition-colors">Classificação</Link>
              <Link href="/ranking" className="hover:text-white transition-colors">Ranking</Link>
            </div>
            <span className="text-xs text-gray-500">&copy; 2026 Acréscimos</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
