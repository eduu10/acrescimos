import { Header } from '@/components/header';
import { LiveMatchClient } from './client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minuto a Minuto | Acréscimos',
  description: 'Acompanhe o minuto a minuto do jogo em tempo real.',
};

export const revalidate = 0;

export default async function LiveMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <LiveMatchClient fixtureId={id} />
      </main>
      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205] mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          &copy; 2026 Acréscimos
        </div>
      </footer>
    </div>
  );
}
