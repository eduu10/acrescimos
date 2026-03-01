'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface Fixture {
  fixture: { id: number; status: { short: string; elapsed: number | null } };
  league: { name: string; logo: string };
  teams: { home: { name: string; logo: string }; away: { name: string; logo: string } };
  goals: { home: number | null; away: number | null };
}

function LiveScoresWidget() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const [liveRes, todayRes] = await Promise.all([
          fetch('/api/football?type=live').then(r => r.json()).catch(() => []),
          fetch('/api/football?type=today').then(r => r.json()).catch(() => []),
        ]);

        const live = Array.isArray(liveRes) ? liveRes : [];
        const today = Array.isArray(todayRes) ? todayRes : [];

        const ids = new Set(live.map((f: Fixture) => f.fixture.id));
        const merged = [...live, ...today.filter((f: Fixture) => !ids.has(f.fixture.id))];
        setFixtures(merged.slice(0, 8));
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin w-5 h-5 border-2 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (fixtures.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">Nenhum jogo no momento</p>;
  }

  const isLive = (status: string) => ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(status);
  const isFinished = (status: string) => ['FT', 'AET', 'PEN'].includes(status);

  return (
    <div className="flex flex-col gap-2">
      {fixtures.map(f => (
        <div key={f.fixture.id} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              {f.teams.home.logo && <img src={f.teams.home.logo} alt="" className="w-4 h-4" />}
              <span className="text-xs truncate text-gray-700 dark:text-gray-300">{f.teams.home.name}</span>
              <span className="ml-auto text-xs font-bold text-gray-900 dark:text-white">{f.goals.home ?? '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {f.teams.away.logo && <img src={f.teams.away.logo} alt="" className="w-4 h-4" />}
              <span className="text-xs truncate text-gray-700 dark:text-gray-300">{f.teams.away.name}</span>
              <span className="ml-auto text-xs font-bold text-gray-900 dark:text-white">{f.goals.away ?? '-'}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-center w-14">
            {isLive(f.fixture.status.short) ? (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                {f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : 'AO VIVO'}
              </span>
            ) : isFinished(f.fixture.status.short) ? (
              <span className="text-[10px] text-gray-400">Encerrado</span>
            ) : (
              <span className="text-[10px] text-blue-500">{f.fixture.status.short}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/article/${slug}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={shareWhatsApp}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
      >
        WhatsApp
      </button>
      <button
        onClick={shareTwitter}
        className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
      >
        𝕏
      </button>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copiado!' : 'Copiar'}
      </button>
    </div>
  );
}

export function ArticleSidebar({ type, title, slug }: { type: 'scores' | 'share'; title?: string; slug?: string }) {
  if (type === 'scores') return <LiveScoresWidget />;
  if (type === 'share' && title && slug) return <ShareButtons title={title} slug={slug} />;
  return null;
}
