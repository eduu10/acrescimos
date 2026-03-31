'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TransferAlert {
  id: number;
  url: string;
  title: string | null;
  player: string | null;
  from_club: string | null;
  to_club: string | null;
  status: 'detected' | 'published' | 'skipped';
  article_id: number | null;
  detected_at: string;
}

export default function TransfersAdminPage() {
  const [alerts, setAlerts] = useState<TransferAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'detected' | 'published' | 'skipped'>('detected');

  const loadAlerts = async () => {
    setLoading(true);
    const params = filter !== 'all' ? `?status=${filter}` : '';
    const res = await fetch(`/api/transfers${params}`);
    if (res.ok) setAlerts(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadAlerts(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id: number, status: 'published' | 'skipped') => {
    await fetch('/api/transfers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/cron/transfers', {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}` },
      });
      const data = await res.json();
      alert(`Scan concluído: ${data.detected || 0} novos, ${data.articlesGenerated || 0} artigos gerados`);
      loadAlerts();
    } catch {
      alert('Erro no scan');
    }
    setScanning(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Agora';
    if (hours < 24) return `Há ${hours}h`;
    return `Há ${Math.floor(hours / 24)}d`;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Alertas de Transferências</h1>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="ml-auto flex items-center gap-2 bg-[#1B2436] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F2E205] hover:text-[#1B2436] transition-colors disabled:opacity-50"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Escanear fontes
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['detected', 'published', 'skipped', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-[#1B2436] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'detected' ? 'Detectados' : f === 'published' ? 'Publicados' : f === 'skipped' ? 'Ignorados' : 'Todos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>Nenhum alerta {filter !== 'all' ? `com status "${filter}"` : ''} encontrado.</p>
          <p className="text-sm mt-2">Clique em &quot;Escanear fontes&quot; para verificar transferências.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    alert.status === 'detected' ? 'bg-yellow-100 text-yellow-700' :
                    alert.status === 'published' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {alert.status === 'detected' ? 'Detectado' : alert.status === 'published' ? 'Publicado' : 'Ignorado'}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(alert.detected_at)}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                  {alert.title || alert.url.split('/').filter(Boolean).pop()?.replace(/-/g, ' ')}
                </p>
                {(alert.player || alert.from_club || alert.to_club) && (
                  <p className="text-xs text-gray-500">
                    {alert.player}{alert.from_club ? ` · ${alert.from_club}` : ''}{alert.to_club ? ` → ${alert.to_club}` : ''}
                  </p>
                )}
                {alert.article_id && (
                  <Link href={`/admin/articles/${alert.article_id}`} className="text-xs text-[#F2E205] font-bold hover:underline mt-1 inline-block">
                    Ver artigo →
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={alert.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded text-gray-400">
                  <ExternalLink className="w-4 h-4" />
                </a>
                {alert.status === 'detected' && (
                  <>
                    <button
                      onClick={() => handleAction(alert.id, 'published')}
                      className="p-1.5 hover:bg-green-50 rounded text-green-500" title="Publicar"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(alert.id, 'skipped')}
                      className="p-1.5 hover:bg-red-50 rounded text-red-400" title="Ignorar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
