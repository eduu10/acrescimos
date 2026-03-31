'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Fixture {
  fixture: {
    id: number;
    status: { short: string; elapsed: number | null; long: string };
    date: string;
  };
  league: { id: number; name: string; logo: string; country: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

const STATUS_LABELS: Record<string, string> = {
  NS: 'Não iniciado',
  '1H': '1º tempo',
  HT: 'Intervalo',
  '2H': '2º tempo',
  ET: 'Prorrogação',
  P: 'Pênaltis',
  FT: 'Encerrado',
  AET: 'Enc. (prorr.)',
  PEN: 'Enc. (pênaltis)',
  PST: 'Adiado',
  CANC: 'Cancelado',
  SUSP: 'Suspenso',
  TBD: 'A definir',
};

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE']);

export function LiveCoverageClient() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchFixtures() {
    try {
      const [liveRes, todayRes] = await Promise.all([
        fetch('/api/football?type=live').then(r => r.json()).catch(() => []),
        fetch('/api/football?type=today').then(r => r.json()).catch(() => []),
      ]);
      const live = Array.isArray(liveRes) ? liveRes : [];
      const today = Array.isArray(todayRes) ? todayRes : [];
      const ids = new Set(live.map((f: Fixture) => f.fixture.id));
      const merged = [
        ...live,
        ...today.filter((f: Fixture) => !ids.has(f.fixture.id)),
      ];
      // Sort: live first, then by date
      merged.sort((a, b) => {
        const aLive = LIVE_STATUSES.has(a.fixture.status.short) ? 0 : 1;
        const bLive = LIVE_STATUSES.has(b.fixture.status.short) ? 0 : 1;
        if (aLive !== bLive) return aLive - bLive;
        return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      });
      setFixtures(merged);
      setLastUpdated(new Date());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFixtures();
    const interval = setInterval(fetchFixtures, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-10 h-10 border-3 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  const liveGames = fixtures.filter(f => LIVE_STATUSES.has(f.fixture.status.short));
  const otherGames = fixtures.filter(f => !LIVE_STATUSES.has(f.fixture.status.short));

  return (
    <div>
      {lastUpdated && (
        <p className="text-xs text-gray-400 mb-4">
          Atualizado às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — auto-refresh a cada 60s
        </p>
      )}

      {fixtures.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Nenhum jogo ao vivo agora</p>
          <p className="text-sm text-gray-400">Volte durante as partidas para acompanhar em tempo real.</p>
          <Link href="/placar" className="inline-block mt-4 bg-[#F2E205] text-[#1B2436] px-6 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300">
            Ver placar completo
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {liveGames.length > 0 && (
            <section>
              <h2 className="font-oswald font-bold text-lg text-red-500 flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                Em andamento ({liveGames.length})
              </h2>
              <div className="flex flex-col gap-3">
                {liveGames.map(f => <FixtureCard key={f.fixture.id} fixture={f} isLive />)}
              </div>
            </section>
          )}
          {otherGames.length > 0 && (
            <section>
              <h2 className="font-oswald font-bold text-lg text-[#1B2436] dark:text-white mb-3">
                Outros jogos do dia ({otherGames.length})
              </h2>
              <div className="flex flex-col gap-3">
                {otherGames.map(f => <FixtureCard key={f.fixture.id} fixture={f} isLive={false} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function FixtureCard({ fixture: f, isLive }: { fixture: Fixture; isLive: boolean }) {
  const status = f.fixture.status;
  const statusLabel = STATUS_LABELS[status.short] || status.long || status.short;
  const kickoff = new Date(f.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const hasScore = f.goals.home !== null && f.goals.away !== null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${isLive ? 'border-red-200 dark:border-red-800 shadow-md' : 'border-gray-100 dark:border-gray-700'} p-4`}>
      {/* League */}
      <div className="flex items-center gap-2 mb-3">
        {f.league.logo && (
          <img src={f.league.logo} alt={f.league.name} className="w-5 h-5 object-contain" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{f.league.name} — {f.league.country}</span>
        {isLive ? (
          <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
            {status.elapsed ? `${status.elapsed}'` : statusLabel}
          </span>
        ) : (
          <span className="ml-auto text-xs text-gray-400">{statusLabel === 'Não iniciado' ? kickoff : statusLabel}</span>
        )}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center gap-4">
        <TeamRow name={f.teams.home.name} logo={f.teams.home.logo} />
        <div className="flex-shrink-0 text-center min-w-[60px]">
          {hasScore ? (
            <span className={`text-2xl font-bold font-oswald ${isLive ? 'text-red-500' : 'text-[#1B2436] dark:text-white'}`}>
              {f.goals.home} - {f.goals.away}
            </span>
          ) : (
            <span className="text-sm text-gray-400 font-medium">{kickoff}</span>
          )}
        </div>
        <TeamRow name={f.teams.away.name} logo={f.teams.away.logo} right />
      </div>
    </div>
  );
}

function TeamRow({ name, logo, right }: { name: string; logo: string; right?: boolean }) {
  return (
    <div className={`flex-1 flex items-center gap-2 ${right ? 'flex-row-reverse text-right' : ''}`}>
      {logo && <img src={logo} alt={name} className="w-8 h-8 object-contain flex-shrink-0" />}
      <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{name}</span>
    </div>
  );
}
