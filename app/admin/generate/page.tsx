'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle, ExternalLink, ChevronDown, Calendar, Zap } from 'lucide-react';
import Link from 'next/link';

const COMPETITIONS = [
  'Brasileirão',
  'Copa do Brasil',
  'Libertadores',
  'Sul-Americana',
  'Futebol Internacional',
  'Premier League',
  'La Liga',
  'Champions League',
];

interface GeneratedArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
}

interface UpcomingFixture {
  fixture: { id: number; date: string };
  league: { name: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
}

export default function GeneratePage() {
  const [type, setType] = useState<'preview' | 'roundup'>('preview');

  // Preview fields
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [competition, setCompetition] = useState('Brasileirão');

  // Roundup fields
  const [roundCompetition, setRoundCompetition] = useState('Brasileirão');
  const [round, setRound] = useState('');

  const [generating, setGenerating] = useState(false);
  const [generatingFixtureId, setGeneratingFixtureId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GeneratedArticle | null>(null);

  const [upcomingFixtures, setUpcomingFixtures] = useState<UpcomingFixture[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);

  useEffect(() => {
    fetch('/api/football?type=upcoming&league=71')
      .then(r => r.json())
      .then(data => setUpcomingFixtures((data.response || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingFixtures(false));
  }, []);

  const generateFromFixture = async (fixture: UpcomingFixture) => {
    setGeneratingFixtureId(fixture.fixture.id);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preview',
          team1: fixture.teams.home.name,
          team2: fixture.teams.away.name,
          competition: fixture.league.name,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Erro ao gerar'); return; }
      setResult(json.article);
    } catch {
      setError('Erro de rede.');
    } finally {
      setGeneratingFixtureId(null);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    setResult(null);

    const body =
      type === 'preview'
        ? { type, team1, team2, competition }
        : { type: 'roundup', competition: roundCompetition, round };

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erro ao gerar artigo');
        return;
      }
      setResult(json.article);
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-[#F2E205]" />
        <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Gerar Conteúdo com IA</h1>
      </div>

      <div className="max-w-xl">
        {/* Upcoming fixtures quick-generate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <h2 className="font-bold text-[#1B2436]">Próximos Jogos — Gerar Prévia Rápida</h2>
          </div>
          {loadingFixtures ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : upcomingFixtures.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum jogo próximo encontrado via API.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingFixtures.map(f => {
                const isGenerating = generatingFixtureId === f.fixture.id;
                const kickoff = new Date(f.fixture.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={f.fixture.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {f.teams.home.name} <span className="text-gray-400 font-normal">×</span> {f.teams.away.name}
                      </p>
                      <p className="text-xs text-gray-400">{f.league.name} · {kickoff}</p>
                    </div>
                    <button
                      onClick={() => generateFromFixture(f)}
                      disabled={!!generatingFixtureId}
                      className="flex items-center gap-1 bg-[#F2E205] text-[#1B2436] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-300 disabled:opacity-50 shrink-0"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      {isGenerating ? '...' : 'Gerar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Type selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-[#1B2436] mb-4">Tipo de conteúdo</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType('preview')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${type === 'preview' ? 'border-[#F2E205] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="font-bold text-sm text-[#1B2436]">Prévia de Jogo</div>
              <div className="text-xs text-gray-500 mt-1">Análise pré-jogo com escalações e palpite</div>
            </button>
            <button
              onClick={() => setType('roundup')}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${type === 'roundup' ? 'border-[#F2E205] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="font-bold text-sm text-[#1B2436]">Resumo de Rodada</div>
              <div className="text-xs text-gray-500 mt-1">Resultados, destaques e classificação</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          {type === 'preview' ? (
            <div className="space-y-4">
              <h2 className="font-bold text-[#1B2436]">Prévia de Jogo</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time 1 (mandante)</label>
                <input
                  type="text"
                  value={team1}
                  onChange={e => setTeam1(e.target.value)}
                  placeholder="Ex: Cruzeiro"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time 2 (visitante)</label>
                <input
                  type="text"
                  value={team2}
                  onChange={e => setTeam2(e.target.value)}
                  placeholder="Ex: Atlético-MG"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competição</label>
                <div className="relative">
                  <select
                    value={competition}
                    onChange={e => setCompetition(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent appearance-none bg-white"
                  >
                    {COMPETITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-bold text-[#1B2436]">Resumo de Rodada</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competição</label>
                <div className="relative">
                  <select
                    value={roundCompetition}
                    onChange={e => setRoundCompetition(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent appearance-none bg-white"
                  >
                    {COMPETITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rodada (opcional)</label>
                <input
                  type="text"
                  value={round}
                  onChange={e => setRound(e.target.value)}
                  placeholder="Ex: 15ª rodada"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Success */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-4 mb-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-green-800">Artigo gerado e salvo como rascunho!</p>
              <p className="text-sm text-green-700 mt-1 line-clamp-2">{result.title}</p>
              <Link
                href={`/admin/articles/${result.id}`}
                className="inline-flex items-center gap-1 mt-2 text-sm font-bold text-green-700 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Editar e publicar
              </Link>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || (type === 'preview' && (!team1 || !team2))}
          className="w-full flex items-center justify-center gap-2 bg-[#F2E205] text-[#1B2436] px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Artigo
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          O artigo será salvo como rascunho para revisão antes de publicar.
        </p>
      </div>
    </div>
  );
}
