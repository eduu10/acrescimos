'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';

interface Fixture {
  fixture: { id: number; status: { short: string; elapsed: number | null } };
  league: { name: string; logo: string };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

export function LiveScoreTicker() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        // Try live first
        const liveRes = await fetch('/api/football?type=live');
        const liveData = await liveRes.json();
        if (liveData.response && liveData.response.length > 0) {
          setFixtures(liveData.response.slice(0, 15));
          setIsLive(true);
          return;
        }
        // Fall back to today's fixtures
        const todayRes = await fetch('/api/football?type=today');
        const todayData = await todayRes.json();
        setFixtures((todayData.response || []).slice(0, 15));
        setIsLive(false);
      } catch {
        setFixtures([]);
      }
    };

    fetchFixtures();
    const interval = setInterval(fetchFixtures, 60000);
    return () => clearInterval(interval);
  }, []);

  if (fixtures.length === 0) {
    return (
      <div className="bg-[#1B2436] text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase whitespace-nowrap">
            <Activity className="w-4 h-4 text-[#F2E205]" />
            <span className="text-[#F2E205]">Placar</span>
          </div>
          <span className="text-gray-400 text-xs">Nenhum jogo no momento. Configure a NEXT_PUBLIC_FOOTBALL_API_KEY.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B2436] text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase whitespace-nowrap z-10 bg-[#1B2436] pr-2">
          {isLive ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-red-400">AO VIVO</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 text-[#F2E205]" />
              <span className="text-[#F2E205]">Hoje</span>
            </>
          )}
        </div>

        <div className="flex-1 overflow-hidden relative h-6">
          <div className="animate-marquee-slow whitespace-nowrap absolute top-0 left-0 flex items-center gap-6 hover-pause">
            {[...fixtures, ...fixtures].map((fix, i) => (
              <div key={`${fix.fixture.id}-${i}`} className="flex items-center gap-2 text-xs">
                <span className="font-bold">{fix.teams.home.name}</span>
                <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-bold text-[#F2E205]">
                  {fix.goals.home ?? '-'} x {fix.goals.away ?? '-'}
                </span>
                <span className="font-bold">{fix.teams.away.name}</span>
                {isLive && fix.fixture.status.elapsed && (
                  <span className="text-red-400 text-[10px]">{fix.fixture.status.elapsed}&apos;</span>
                )}
                {!isLive && (
                  <span className="text-gray-500 text-[10px]">{fix.fixture.status.short}</span>
                )}
                <span className="text-gray-600">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
