import { Header } from '@/components/header';
import { HeroGrid } from '@/components/hero-grid';
import { NewsFeed } from '@/components/news-feed';
import { LeagueTable } from '@/components/league-table';
import { BreakingNews } from '@/components/breaking-news';
import { LiveScoreTicker } from '@/components/live-score-ticker';
import { ExternalNewsFeed } from '@/components/external-news-feed';
import { MatchCountdown } from '@/components/match-countdown';
import { TodayMatches } from '@/components/today-matches';
import { Video } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Header />
      <LiveScoreTicker />
      <BreakingNews />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 pb-12">
        {/* Hero Section */}
        <HeroGrid />

        <div className="container mx-auto px-4 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Content Column */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              <NewsFeed />

              {/* Video Section Banner */}
              <div className="bg-[#1B2436] rounded-xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2E205] rounded-full blur-[100px] opacity-10 pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#F2E205] mb-2">
                      <Video className="w-5 h-5" />
                      <span className="font-bold uppercase text-sm">Acréscimos Play</span>
                    </div>
                    <h3 className="text-2xl font-oswald font-bold mb-2">Melhores momentos da rodada</h3>
                    <p className="text-gray-400 text-sm max-w-md">
                      Assista aos gols, defesas incríveis e lances polêmicos que marcaram o fim de semana.
                    </p>
                  </div>
                  <button className="bg-[#F2E205] text-[#1B2436] px-6 py-3 rounded-lg font-bold uppercase text-sm hover:bg-white transition-colors">
                    Assistir Agora
                  </button>
                </div>
              </div>

              {/* External News Feed */}
              <ExternalNewsFeed />

              {/* Opinion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                     <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">Opinião</span>
                     <h4 className="font-bold text-gray-900 dark:text-white leading-snug mb-2">
                       A tática que mudou o jogo no segundo tempo
                     </h4>
                     <div className="flex items-center gap-2 mt-auto">
                       <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600" />
                       <span className="text-xs text-gray-500">Colunista {i}</span>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
              <LeagueTable />
              <TodayMatches />
              <MatchCountdown />

              {/* Quick Links */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                <h3 className="font-oswald font-bold text-[#1B2436] dark:text-white uppercase mb-3 text-sm">Links Rápidos</h3>
                <div className="flex flex-col gap-2">
                  <Link href="/standings" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#F2E205] transition-colors">Tabela de Classificação</Link>
                  <Link href="/admin" className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#F2E205] transition-colors">Painel Admin</Link>
                </div>
              </div>

              {/* Ad Placeholder */}
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 flex items-center justify-center text-gray-400 text-sm font-medium uppercase tracking-widest">
                Publicidade
              </div>
            </aside>

          </div>
        </div>
      </main>

      <footer className="bg-[#1B2436] text-white pt-12 pb-6 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F2E205] rounded flex items-center justify-center transform -skew-x-6">
                  <span className="transform skew-x-6 text-[#1B2436] font-bold font-oswald">AC</span>
                </div>
                <span className="font-oswald font-bold text-xl text-[#F2E205]">ACRÉSCIMOS</span>
              </div>
              <p className="text-gray-400 text-sm">
                Acompanhe tudo sobre o mundo dos esportes. Notícias, resultados, tabelas e muito mais em tempo real.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase mb-4 text-[#F2E205]">Futebol</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/standings" className="hover:text-white">Brasileirão</Link></li>
                <li><a href="#" className="hover:text-white">Libertadores</a></li>
                <li><a href="#" className="hover:text-white">Copa do Brasil</a></li>
                <li><a href="#" className="hover:text-white">Seleção Brasileira</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase mb-4 text-[#F2E205]">Mais Esportes</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Basquete / NBA</a></li>
                <li><a href="#" className="hover:text-white">Vôlei</a></li>
                <li><a href="#" className="hover:text-white">Fórmula 1</a></li>
                <li><a href="#" className="hover:text-white">Tênis</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold uppercase mb-4 text-[#F2E205]">Institucional</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white">Expediente</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>&copy; 2026 Acréscimos. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Instagram</a>
              <a href="#" className="hover:text-white">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
