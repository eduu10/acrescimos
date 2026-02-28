'use client';

import { useEffect, useState } from 'react';
import { FileText, Eye, MousePointerClick, TrendingUp, Download, Save, SkipForward, ImageIcon, Search, X } from 'lucide-react';

interface DashboardData {
  topArticles: { id: string; title: string; clicks: number; category: string }[];
  todayClicks: number;
  todayViews: number;
  totalArticles: number;
  publishedArticles: number;
  viewsLast7Days: { date: string; count: number }[];
  clicksLast7Days: { date: string; count: number }[];
}

interface ScrapePreview {
  original: { title: string; content: string; image: string; url: string };
  rewritten: { title: string; content: string; image: string; category: string };
  articlesFound: number;
  alreadyScraped: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  // Scrape state
  const [scraping, setScraping] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [scrapeSuccess, setScrapeSuccess] = useState('');
  const [preview, setPreview] = useState<ScrapePreview | null>(null);

  // Image search state
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageQuery, setImageQuery] = useState('');
  const [imageResults, setImageResults] = useState<{ id: number; url: string; thumb: string; small: string; alt: string; photographer: string }[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const handleScrape = async () => {
    setScraping(true);
    setScrapeError('');
    setScrapeSuccess('');
    setPreview(null);

    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        setScrapeError(json.error || 'Erro ao buscar artigo');
        return;
      }
      setPreview(json);
    } catch {
      setScrapeError('Erro de conexão');
    } finally {
      setScraping(false);
    }
  };

  const handlePublish = async () => {
    if (!preview) return;
    setPublishing(true);
    setScrapeError('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: preview.rewritten.title,
          content: preview.rewritten.content,
          image: preview.rewritten.image,
          category: preview.rewritten.category,
          originalUrl: preview.original.url,
        }),
      });

      if (res.ok) {
        setScrapeSuccess('Artigo importado com sucesso! Acesse Artigos para publicá-lo.');
        setPreview(null);
        fetch('/api/analytics').then(r => r.json()).then(setData).catch(() => {});
      } else {
        const json = await res.json();
        setScrapeError(json.error || 'Erro ao salvar');
      }
    } catch {
      setScrapeError('Erro ao salvar artigo');
    } finally {
      setPublishing(false);
    }
  };

  const handleSkip = async () => {
    if (!preview) return;
    await fetch('/api/scrape', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: preview.original.url, skip: true }),
    }).catch(() => {});
    setPreview(null);
    handleScrape();
  };

  const updatePreview = (field: string, value: string) => {
    if (!preview) return;
    setPreview({
      ...preview,
      rewritten: { ...preview.rewritten, [field]: value },
    });
  };

  const handleImageSearch = async (query?: string) => {
    const q = query || imageQuery;
    if (!q.trim()) return;
    setSearchingImages(true);
    try {
      const res = await fetch(`/api/images?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (res.ok) {
        setImageResults(json.images || []);
      }
    } catch {} finally {
      setSearchingImages(false);
    }
  };

  const selectImage = (url: string) => {
    updatePreview('image', url);
    setShowImageSearch(false);
    setImageResults([]);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total de Artigos', value: data.totalArticles, icon: FileText, color: 'bg-blue-500' },
    { label: 'Artigos Publicados', value: data.publishedArticles, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Views Hoje', value: data.todayViews, icon: Eye, color: 'bg-purple-500' },
    { label: 'Cliques Hoje', value: data.todayClicks, icon: MousePointerClick, color: 'bg-orange-500' },
  ];

  const maxClicks = Math.max(...(data.topArticles.map(a => a.clicks) || [1]), 1);

  return (
    <div>
      <h1 className="text-2xl font-oswald font-bold text-[#1B2436] mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{card.label}</span>
                <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-3xl font-bold text-[#1B2436]">{card.value}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-oswald font-bold text-[#1B2436] mb-4">Views - Últimos 7 dias</h2>
          <div className="flex items-end gap-2 h-40">
            {data.viewsLast7Days.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum dado ainda</p>
            ) : (
              data.viewsLast7Days.map(day => {
                const maxViews = Math.max(...data.viewsLast7Days.map(d => d.count), 1);
                const height = (day.count / maxViews) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{day.count}</span>
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${Math.max(height, 4)}%` }} />
                    <span className="text-[10px] text-gray-400">{day.date.split('-').slice(1).join('/')}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Articles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-oswald font-bold text-[#1B2436] mb-4">Matérias Mais Clicadas</h2>
          <div className="flex flex-col gap-3">
            {data.topArticles.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum dado ainda</p>
            ) : (
              data.topArticles.map((article, i) => (
                <div key={article.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{article.category}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[#F2E205] h-1.5 rounded-full"
                          style={{ width: `${(article.clicks / maxClicks) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{article.clicks}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clicks Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
        <h2 className="font-oswald font-bold text-[#1B2436] mb-4">Cliques - Últimos 7 dias</h2>
        <div className="flex items-end gap-2 h-40">
          {data.clicksLast7Days.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum dado ainda</p>
          ) : (
            data.clicksLast7Days.map(day => {
              const maxC = Math.max(...data.clicksLast7Days.map(d => d.count), 1);
              const height = (day.count / maxC) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{day.count}</span>
                  <div className="w-full bg-[#F2E205] rounded-t" style={{ height: `${Math.max(height, 4)}%` }} />
                  <span className="text-[10px] text-gray-400">{day.date.split('-').slice(1).join('/')}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Import from GE Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-oswald font-bold text-[#1B2436] text-lg">Importar do GE</h2>
            <p className="text-xs text-gray-400 mt-1">Busca artigos do ge.globo.com e reescreve com IA</p>
          </div>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-2 bg-[#F2E205] text-[#1B2436] px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {scraping ? 'Buscando...' : 'Buscar Próximo Artigo'}
          </button>
        </div>

        {scrapeError && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm mb-4">
            {scrapeError}
          </div>
        )}

        {scrapeSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
            {scrapeSuccess}
          </div>
        )}

        {scraping && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#F2E205] border-t-transparent rounded-full" />
            <span className="text-sm text-gray-500">Buscando e reescrevendo artigo com IA...</span>
          </div>
        )}

        {preview && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Image preview with edit controls */}
            <div className="relative h-48 bg-gray-100">
              {preview.rewritten.image ? (
                <img src={preview.rewritten.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                {preview.articlesFound} artigos encontrados / {preview.alreadyScraped} já importados
              </div>
              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  onClick={() => { setShowImageSearch(!showImageSearch); setImageQuery(preview.rewritten.title.split(' ').slice(0, 3).join(' ')); if (!showImageSearch) handleImageSearch(preview.rewritten.title.split(' ').slice(0, 3).join(' ')); }}
                  className="flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                  <Search className="w-3 h-3" />
                  Buscar Imagem
                </button>
              </div>
            </div>

            {/* Image search panel */}
            {showImageSearch && (
              <div className="border-b border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 flex gap-2">
                    <input
                      value={imageQuery}
                      onChange={e => setImageQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleImageSearch()}
                      placeholder="Ex: futebol, basquete, fórmula 1..."
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                    />
                    <button
                      onClick={() => handleImageSearch()}
                      disabled={searchingImages}
                      className="flex items-center gap-1 bg-[#F2E205] text-[#1B2436] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-300 disabled:opacity-50"
                    >
                      <Search className="w-3.5 h-3.5" />
                      {searchingImages ? '...' : 'Buscar'}
                    </button>
                  </div>
                  <button onClick={() => { setShowImageSearch(false); setImageResults([]); }} className="p-1.5 hover:bg-gray-200 rounded-lg">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* URL manual input */}
                <div className="flex gap-2 mb-3">
                  <input
                    placeholder="Ou cole uma URL de imagem..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                    onKeyDown={e => { if (e.key === 'Enter') { updatePreview('image', (e.target as HTMLInputElement).value); setShowImageSearch(false); } }}
                  />
                </div>

                {searchingImages && (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin w-5 h-5 border-2 border-[#F2E205] border-t-transparent rounded-full" />
                  </div>
                )}

                {imageResults.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {imageResults.map(img => (
                      <button
                        key={img.id}
                        onClick={() => selectImage(img.url)}
                        className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-[#F2E205] transition-colors group"
                      >
                        <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}

                {!searchingImages && imageResults.length === 0 && imageQuery && (
                  <p className="text-xs text-gray-400 text-center py-3">Nenhuma imagem encontrada. Tente outro termo.</p>
                )}

                <p className="text-[10px] text-gray-400 mt-2">Imagens por Pexels (gratuitas para uso)</p>
              </div>
            )}

            <div className="p-4 space-y-3">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Título (reescrito pela IA)</label>
                <input
                  value={preview.rewritten.title}
                  onChange={e => updatePreview('title', e.target.value)}
                  className="w-full font-bold text-lg border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Categoria</label>
                <select
                  value={preview.rewritten.category}
                  onChange={e => updatePreview('category', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F2E205]"
                >
                  {['Brasileirão', 'Futebol Internacional', 'Copa do Brasil', 'Libertadores', 'Basquete', 'Fórmula 1', 'Tênis', 'Vôlei', 'Mercado da Bola', 'Opinião', 'Geral'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Conteúdo (reescrito pela IA)</label>
                <textarea
                  value={preview.rewritten.content}
                  onChange={e => updatePreview('content', e.target.value)}
                  rows={10}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent resize-y"
                />
              </div>

              {/* Original source */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Fonte original: <a href={preview.original.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">{preview.original.title}</a>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Pular
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {publishing ? 'Salvando...' : 'Salvar como Rascunho'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
