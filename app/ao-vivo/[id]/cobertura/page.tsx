import { Header } from '@/components/header';
import { LiveCoverageClient } from '@/components/live-coverage-client';
import type { Metadata } from 'next';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Cobertura ao Vivo #${id} | Acréscimos`,
    description: 'Acompanhe o minuto a minuto em tempo real com comentários gerados por IA.',
    robots: { index: false },
  };
}

async function getFixtureData(id: string) {
  const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${id}`,
      { headers: { 'x-apisports-key': apiKey }, next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.[0] || null;
  } catch {
    return null;
  }
}

export default async function CoveragePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixture = await getFixtureData(id);

  const homeTeam = fixture?.teams?.home?.name || 'Time A';
  const awayTeam = fixture?.teams?.away?.name || 'Time B';
  const homeScore = fixture?.goals?.home ?? 0;
  const awayScore = fixture?.goals?.away ?? 0;
  const competition = fixture?.league?.name || 'Futebol';
  const round = fixture?.league?.round || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="uppercase tracking-wider font-bold text-red-500">Ao Vivo</span>
            <span>·</span>
            <span>{competition}{round ? ` · ${round}` : ''}</span>
          </div>
          <h1 className="text-2xl font-oswald font-bold text-[#1B2436] dark:text-white">
            {homeTeam} x {awayTeam}
          </h1>
          <p className="text-xs text-gray-400 mt-1">Atualizações automáticas a cada 30 segundos</p>
        </div>

        <LiveCoverageClient
          fixtureId={id}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
        />
      </main>

      <footer className="bg-[#1B2436] text-white py-6 border-t-4 border-[#F2E205] mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          &copy; 2026 Acréscimos
        </div>
      </footer>
    </div>
  );
}
