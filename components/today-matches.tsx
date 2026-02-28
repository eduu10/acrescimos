'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface Fixture {
  fixture: { id: number; date: string; status: { short: string; elapsed: number | null } };
  league: { name: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

export function TodayMatches() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/football?type=today')
      .then(res => res.json())
      .then(data => { setFixtures((data.response || []).slice(0, 8)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
        <Calendar className="w-5 h-5 text-[#F2E205]" />
        <h3 className="font-oswald font-bold text-[#1B2436] uppercase">Jogos de Hoje</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin w-5 h-5 border-2 border-[#F2E205] border-t-transparent rounded-full" />
        </div>
      ) : fixtures.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-4">Nenhum jogo hoje ou API não configurada.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {fixtures.map(fix => (
            <div key={fix.fixture.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 flex-1 justify-end text-right">
                <span className="font-bold text-gray-700 text-xs truncate">{fix.teams.home.name}</span>
                {fix.teams.home.logo && <img src={fix.teams.home.logo} alt="" className="w-4 h-4" />}
              </div>
              <div className="mx-2 text-center min-w-[60px]">
                {fix.goals.home !== null ? (
                  <span className="bg-[#1B2436] text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                    {fix.goals.home} x {fix.goals.away}
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1 justify-center">
                    <Clock className="w-3 h-3" />
                    {formatTime(fix.fixture.date)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                {fix.teams.away.logo && <img src={fix.teams.away.logo} alt="" className="w-4 h-4" />}
                <span className="font-bold text-gray-700 text-xs truncate">{fix.teams.away.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
