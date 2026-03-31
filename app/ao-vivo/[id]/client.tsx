'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Zap, Clock, RefreshCw } from 'lucide-react';

interface FixtureDetails {
  fixture: {
    id: number;
    status: { short: string; elapsed: number | null; long: string };
    date: string;
  };
  league: { name: string; logo: string; country: string; round: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
  };
}

interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

interface Commentary {
  minute: number;
  text: string;
  type: 'goal' | 'card' | 'sub' | 'event' | 'ai';
  team?: string;
  player?: string;
}

const EVENT_ICONS: Record<string, string> = {
  Goal: '⚽',
  'Yellow Card': '🟨',
  'Red Card': '🟥',
  subst: '🔄',
  Var: '📺',
};

const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'P', 'BT', 'LIVE']);

export function LiveMatchClient({ fixtureId }: { fixtureId: string }) {
  const [fixture, setFixture] = useState<FixtureDetails | null>(null);
  const [events, setEvents] = useState<FixtureEvent[]>([]);
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [fixtureRes, eventsRes] = await Promise.all([
        fetch(`/api/football?type=fixture&fixture=${fixtureId}`).then(r => r.json()),
        fetch(`/api/football?type=events&fixture=${fixtureId}`).then(r => r.json()),
      ]);

      const fix: FixtureDetails | undefined = fixtureRes.response?.[0];
      const evts: FixtureEvent[] = eventsRes.response || [];

      if (!fix) {
        setError('Jogo não encontrado.');
        return;
      }

      setFixture(fix);
      setEvents(evts);
      setLastUpdated(new Date());

      // Build basic commentary from events
      const basic: Commentary[] = evts.map((e) => ({
        minute: e.time.elapsed + (e.time.extra || 0),
        text: buildEventText(e),
        type: eventType(e),
        team: e.team.name,
        player: e.player.name,
      }));
      setCommentary(basic.sort((a, b) => b.minute - a.minute));
    } catch {
      setError('Erro ao carregar dados do jogo.');
    } finally {
      setLoading(false);
    }
  }, [fixtureId]);

  useEffect(() => {
    fetchData();
    const isLive = fixture ? LIVE_STATUSES.has(fixture.fixture.status.short) : false;
    if (isLive) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, fixture?.fixture.status.short]);

  const generateAICommentary = async () => {
    if (!fixture || generatingAI) return;
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/live-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixture: {
            home: fixture.teams.home.name,
            away: fixture.teams.away.name,
            score: `${fixture.goals.home ?? 0}-${fixture.goals.away ?? 0}`,
            minute: fixture.fixture.status.elapsed,
            status: fixture.fixture.status.short,
            league: fixture.league.name,
          },
          events: events.slice(-5),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiEntry: Commentary = {
          minute: fixture.fixture.status.elapsed || 0,
          text: data.commentary,
          type: 'ai',
        };
        setCommentary(prev => [aiEntry, ...prev.filter(c => c.type !== 'ai')]);
      }
    } catch { /* ignore */ } finally {
      setGeneratingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin w-10 h-10 border-2 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !fixture) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">{error || 'Jogo não encontrado.'}</p>
        <Link href="/ao-vivo" className="text-[#F2E205] font-bold hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
    );
  }

  const isLive = LIVE_STATUSES.has(fixture.fixture.status.short);
  const hasScore = fixture.goals.home !== null && fixture.goals.away !== null;

  return (
    <div>
      {/* Back */}
      <Link href="/ao-vivo" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B2436] mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar à cobertura ao vivo
      </Link>

      {/* Scoreboard */}
      <div className={`bg-[#1B2436] rounded-2xl p-6 mb-6 text-white shadow-xl ${isLive ? 'ring-2 ring-red-500' : ''}`}>
        {/* League */}
        <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
          {fixture.league.logo && (
            <img src={fixture.league.logo} alt={fixture.league.name} className="w-5 h-5 object-contain" />
          )}
          <span className="text-xs font-medium uppercase tracking-widest">{fixture.league.name} · {fixture.league.round}</span>
          {isLive && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">AO VIVO</span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-center">
            {fixture.teams.home.logo && (
              <img src={fixture.teams.home.logo} alt={fixture.teams.home.name} className="w-16 h-16 object-contain mx-auto mb-2" />
            )}
            <p className="font-bold text-sm leading-tight">{fixture.teams.home.name}</p>
          </div>

          <div className="text-center">
            {hasScore ? (
              <div className="text-5xl font-oswald font-bold text-[#F2E205]">
                {fixture.goals.home} <span className="text-3xl text-white/40">-</span> {fixture.goals.away}
              </div>
            ) : (
              <div className="text-sm text-white/60">
                {new Date(fixture.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {isLive && fixture.fixture.status.elapsed && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-bold">{fixture.fixture.status.elapsed}'</span>
              </div>
            )}
            {fixture.fixture.status.short === 'HT' && (
              <p className="text-xs text-white/60 mt-1">Intervalo</p>
            )}
            {fixture.fixture.status.short === 'FT' && (
              <p className="text-xs text-white/60 mt-1">Encerrado</p>
            )}
          </div>

          <div className="text-center">
            {fixture.teams.away.logo && (
              <img src={fixture.teams.away.logo} alt={fixture.teams.away.name} className="w-16 h-16 object-contain mx-auto mb-2" />
            )}
            <p className="font-bold text-sm leading-tight">{fixture.teams.away.name}</p>
          </div>
        </div>

        {/* Halftime score */}
        {(fixture.score.halftime.home !== null) && (
          <p className="text-center text-xs text-white/40 mt-3">
            Intervalo: {fixture.score.halftime.home} - {fixture.score.halftime.away}
          </p>
        )}
      </div>

      {/* AI Commentary Button */}
      {isLive && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {lastUpdated && `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            <span>· auto-refresh 30s</span>
          </div>
          <button
            onClick={generateAICommentary}
            disabled={generatingAI}
            className="flex items-center gap-1.5 bg-[#F2E205] text-[#1B2436] px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {generatingAI ? 'Gerando...' : 'Narrativa IA'}
          </button>
        </div>
      )}

      {/* Commentary / Events */}
      <div className="flex flex-col gap-2">
        <h2 className="font-oswald font-bold text-lg text-[#1B2436] dark:text-white border-l-4 border-[#F2E205] pl-3 mb-2">
          Minuto a Minuto
        </h2>

        {commentary.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-400 text-sm">
              {isLive ? 'Aguardando eventos do jogo...' : 'Nenhum evento registrado.'}
            </p>
          </div>
        ) : (
          commentary.map((c, i) => (
            <div key={i} className={`flex gap-3 items-start p-4 rounded-xl border ${
              c.type === 'goal' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
              c.type === 'card' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
              c.type === 'ai' ? 'bg-[#1B2436] border-[#F2E205] text-white' :
              'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                c.type === 'ai' ? 'bg-[#F2E205] text-[#1B2436]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {c.type === 'ai' ? '⚡' : `${c.minute}'`}
              </div>
              <div className="flex-1 min-w-0">
                {c.type === 'ai' ? (
                  <p className="text-sm text-white leading-relaxed">{c.text}</p>
                ) : (
                  <>
                    {c.player && <p className="text-sm font-bold text-gray-900 dark:text-white">{c.player}</p>}
                    <p className={`text-sm ${c.type === 'ai' ? 'text-white' : 'text-gray-600 dark:text-gray-300'} leading-relaxed`}>{c.text}</p>
                    {c.team && <p className="text-xs text-gray-400 mt-0.5">{c.team}</p>}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function buildEventText(e: FixtureEvent): string {
  const icon = EVENT_ICONS[e.type] || EVENT_ICONS[e.detail] || '▸';
  const assist = e.assist.name ? ` (assist: ${e.assist.name})` : '';
  if (e.type === 'Goal') return `${icon} Gol de ${e.player.name}${assist}! ${e.detail}`;
  if (e.type === 'Card') return `${icon} ${e.detail === 'Yellow Card' ? 'Cartão amarelo' : 'Cartão vermelho'} para ${e.player.name}`;
  if (e.type === 'subst') return `🔄 Substituição: entra ${e.player.name}, sai ${e.assist.name || '?'}`;
  if (e.type === 'Var') return `📺 VAR: ${e.detail} — ${e.player.name}`;
  return `${icon} ${e.detail} — ${e.player.name}`;
}

function eventType(e: FixtureEvent): Commentary['type'] {
  if (e.type === 'Goal') return 'goal';
  if (e.type === 'Card') return 'card';
  if (e.type === 'subst') return 'sub';
  return 'event';
}
