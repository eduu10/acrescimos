'use client';

import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface StandingTeam {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

const LEAGUES = [
  { id: '71', name: 'Brasileirão', season: '2026' },
  { id: '39', name: 'Premier League', season: '2025' },
  { id: '140', name: 'La Liga', season: '2025' },
  { id: '2', name: 'Champions League', season: '2025' },
];

export function StandingsTable() {
  const [standings, setStandings] = useState<StandingTeam[]>([]);
  const [activeLeague, setActiveLeague] = useState(LEAGUES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/football?type=standings&league=${activeLeague.id}&season=${activeLeague.season}`)
      .then(res => res.json())
      .then(data => {
        setStandings(data.response || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeLeague]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
        <Trophy className="w-5 h-5 text-[#F2E205]" />
        <h2 className="text-2xl font-oswald font-bold text-[#1B2436] uppercase">Classificação</h2>
      </div>

      {/* League Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LEAGUES.map(league => (
          <button
            key={league.id}
            onClick={() => setActiveLeague(league)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              activeLeague.id === league.id
                ? 'bg-[#1B2436] text-[#F2E205]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {league.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-[#F2E205] border-t-transparent rounded-full" />
        </div>
      ) : standings.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">
          Dados indisponíveis. Configure a NEXT_PUBLIC_FOOTBALL_API_KEY.
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1B2436] text-white">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-bold">#</th>
                  <th className="px-3 py-3 text-left text-xs font-bold">Time</th>
                  <th className="px-3 py-3 text-center text-xs font-bold">J</th>
                  <th className="px-3 py-3 text-center text-xs font-bold">V</th>
                  <th className="px-3 py-3 text-center text-xs font-bold">E</th>
                  <th className="px-3 py-3 text-center text-xs font-bold">D</th>
                  <th className="px-3 py-3 text-center text-xs font-bold">GP</th>
                  <th className="px-3 py-3 text-center text-xs font-bold">GC</th>
                  <th className="px-3 py-3 text-center text-xs font-bold bg-[#F2E205] text-[#1B2436]">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team, i) => (
                  <tr key={team.team.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i < 4 ? 'border-l-2 border-l-green-500' : i >= standings.length - 3 ? 'border-l-2 border-l-red-500' : ''}`}>
                    <td className="px-3 py-2.5 text-center font-bold text-gray-400">{team.rank}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {team.team.logo && (
                          <img src={team.team.logo} alt={team.team.name} className="w-5 h-5" />
                        )}
                        <span className="font-bold text-gray-900 text-xs">{team.team.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{team.all.played}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{team.all.win}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{team.all.draw}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{team.all.lose}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{team.all.goals.for}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500">{team.all.goals.against}</td>
                    <td className="px-3 py-2.5 text-center font-bold text-[#1B2436]">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
