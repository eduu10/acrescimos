import { Header } from '@/components/header';
import type { Metadata } from 'next';
import { LiveCoverageClient } from './client';

export const metadata: Metadata = {
  title: 'Cobertura Ao Vivo',
  description: 'Acompanhe minuto a minuto os jogos em tempo real no Acréscimos.',
  openGraph: {
    title: 'Cobertura Ao Vivo | Acréscimos',
    description: 'Acompanhe minuto a minuto os jogos em tempo real.',
  },
};

export const revalidate = 0;

export default function AoVivoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-3xl font-oswald font-bold text-[#1B2436] dark:text-white">Cobertura Ao Vivo</h1>
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">Live</span>
        </div>
        <LiveCoverageClient />
      </main>
      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205] mt-auto">
        <div className="container mx-auto px-4 max-w-4xl text-center text-xs text-gray-400">
          &copy; 2026 Acréscimos
        </div>
      </footer>
    </div>
  );
}
