'use client';

import { useEffect, useState, useRef } from 'react';

interface LiveEvent {
  id: number;
  fixture_id: number;
  minute: number | null;
  event_type: string;
  team: string | null;
  player: string | null;
  detail: string | null;
  ai_comment: string | null;
  created_at: string;
}

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
  var: '📺',
  kickoff: '🏁',
  halftime: '⏱️',
  fulltime: '🏆',
  commentary: '🎙️',
};

const EVENT_LABELS: Record<string, string> = {
  goal: 'GOL',
  card: 'CARTÃO',
  red_card: 'CARTÃO VERMELHO',
  substitution: 'SUBSTITUIÇÃO',
  var: 'VAR',
  kickoff: 'INÍCIO',
  halftime: 'INTERVALO',
  fulltime: 'FIM DE JOGO',
  commentary: 'LANCE',
};

export function LiveCoverageClient({ fixtureId, homeTeam, awayTeam, homeScore, awayScore }: {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({ home: homeScore, away: awayScore });
  const topRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`/api/live-coverage?fixture_id=${fixtureId}`);
      if (res.ok) {
        const data: LiveEvent[] = await res.json();
        // Count goals for live score
        let home = homeScore;
        let away = awayScore;
        data.forEach(e => {
          if (e.event_type === 'goal' && e.team) {
            if (e.team.toLowerCase().includes(homeTeam.toLowerCase().slice(0, 5))) home++;
            else away++;
          }
        });
        setScores({ home, away });

        setEvents(data.reverse()); // newest first
        if (data.length > prevCount.current) {
          prevCount.current = data.length;
          topRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtureId]);

  return (
    <div>
      {/* Live scoreboard */}
      <div className="bg-[#1B2436] rounded-2xl p-6 mb-6 text-white text-center">
        <div className="flex items-center justify-center gap-6">
          <div className="flex-1 text-right">
            <p className="font-oswald font-bold text-lg">{homeTeam}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-oswald font-black text-[#F2E205]">{scores.home}</span>
            <span className="text-2xl text-gray-400">—</span>
            <span className="text-4xl font-oswald font-black text-[#F2E205]">{scores.away}</span>
          </div>
          <div className="flex-1 text-left">
            <p className="font-oswald font-bold text-lg">{awayTeam}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">Ao Vivo</span>
        </div>
      </div>

      {/* Events list */}
      <div ref={topRef} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📡</p>
          <p>Aguardando eventos do jogo...</p>
          <p className="text-xs mt-2">Atualiza automaticamente a cada 30 segundos</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map(event => (
            <div
              key={event.id}
              className={`rounded-xl border p-4 ${
                event.event_type === 'goal'
                  ? 'bg-[#1B2436] border-[#F2E205] shadow-md'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Minute badge */}
                {event.minute !== null && (
                  <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                    event.event_type === 'goal' ? 'bg-[#F2E205] text-[#1B2436]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {event.minute}&apos;
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  {/* Event header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{EVENT_ICONS[event.event_type] || '🎙️'}</span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${
                      event.event_type === 'goal' ? 'text-[#F2E205]' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {EVENT_LABELS[event.event_type] || event.event_type}
                    </span>
                    {event.team && (
                      <span className="text-xs text-gray-400">— {event.team}</span>
                    )}
                  </div>

                  {/* Player + detail */}
                  {(event.player || event.detail) && (
                    <p className={`text-sm font-semibold mb-1 ${event.event_type === 'goal' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {event.player}{event.player && event.detail ? ' — ' : ''}{event.detail}
                    </p>
                  )}

                  {/* AI comment */}
                  {event.ai_comment && (
                    <p className={`text-sm italic ${event.event_type === 'goal' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      {event.ai_comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
