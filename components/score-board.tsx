'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock, RefreshCw } from 'lucide-react';

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; long: string; elapsed: number | null } };
  league: { id: number; name: string; country: string; logo: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

export function ScoreBoard() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [liveRes, todayRes] = await Promise.all([
        fetch('/api/football?type=live'),
        fetch('/api/football?type=today'),
      ]);
      const liveData = await liveRes.json();
      const todayData = await todayRes.json();
      const all = [...(liveData.response || []), ...(todayData.response || [])];
      // Deduplicate by fixture id
      const seen = new Set<number>();
      const unique = all.filter((f: Fixture) => { if (seen.has(f.fixture.id)) return false; seen.add(f.fixture.id); return true; });
      setFixtures(unique);
    } catch { setFixtures([]); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i); }, []);

  // Group by league
  const grouped: Record<string, { league: Fixture['league']; matches: Fixture[] }> = {};
  fixtures.forEach(f => {
    const key = `${f.league.id}-${f.league.name}`;
    if (!grouped[key]) grouped[key] = { league: f.league, matches: [] };
    grouped[key].matches.push(f);
  });

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    if (['1H', '2H', 'HT', 'ET', 'P'].includes(status)) return <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold animate-pulse">AO VIVO</span>;
    if (status === 'FT' || status === 'AET' || status === 'PEN') return <span className="bg-gray-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">ENCERRADO</span>;
    return <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">A INICIAR</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#F2E205]" />
          <h1 className="text-2xl font-oswald font-bold text-[#1B2436] dark:text-white uppercase">Placar dos Jogos</h1>
        </div>
        <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded mb-2" />
              <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">Nenhum jogo encontrado. Configure a NEXT_PUBLIC_FOOTBALL_API_KEY para ver jogos ao vivo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map(({ league, matches }) => (
            <div key={league.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-[#1B2436] px-4 py-3 flex items-center gap-3">
                {league.logo && <img src={league.logo} alt="" className="w-5 h-5" />}
                <span className="text-white font-bold text-sm">{league.name}</span>
                <span className="text-gray-400 text-xs">{league.country}</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {matches.map(m => (
                  <div key={m.fixture.id} className="px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1 justify-end text-right">
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{m.teams.home.name}</span>
                      {m.teams.home.logo && <img src={m.teams.home.logo} alt="" className="w-6 h-6" />}
                    </div>
                    <div className="text-center min-w-[80px]">
                      {m.goals.home !== null ? (
                        <span className="bg-[#1B2436] text-[#F2E205] px-3 py-1 rounded font-mono font-bold text-sm">
                          {m.goals.home} - {m.goals.away}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 justify-center text-xs text-gray-500">
                          <Clock className="w-3 h-3" />{formatTime(m.fixture.date)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      {m.teams.away.logo && <img src={m.teams.away.logo} alt="" className="w-6 h-6" />}
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{m.teams.away.name}</span>
                    </div>
                    <div className="hidden sm:block">{getStatusBadge(m.fixture.status.short)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
