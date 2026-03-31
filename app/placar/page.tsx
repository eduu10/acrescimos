import { Header } from '@/components/header';
import { LiveScoreTicker } from '@/components/live-score-ticker';
import { BreakingNews } from '@/components/breaking-news';
import { ScoreBoard } from '@/components/score-board';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Placar Ao Vivo',
  description: 'Acompanhe os placares dos jogos de hoje em tempo real. Brasileirão, Libertadores, Premier League e mais campeonatos.',
  alternates: {
    canonical: 'https://acrescimos.com.br/placar',
  },
  openGraph: {
    title: 'Placar Ao Vivo - Acréscimos',
    description: 'Acompanhe os placares dos jogos de hoje em tempo real.',
    url: 'https://acrescimos.com.br/placar',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Acréscimos',
    images: [{ url: 'https://acrescimos.com.br/icon.svg', alt: 'Acréscimos Placar' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Placar Ao Vivo - Acréscimos',
    description: 'Placares em tempo real de todos os campeonatos.',
    images: ['https://acrescimos.com.br/icon.svg'],
  },
};

export default function PlacarPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <LiveScoreTicker />
      <BreakingNews />

      <main className="flex-1 container mx-auto px-4 py-8">
        <ScoreBoard />
      </main>

      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205]">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">&copy; 2026 Acréscimos. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
