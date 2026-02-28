'use client';

import { useEffect, useState } from 'react';
import { Save, Settings, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Configurações do Site</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#F2E205] text-[#1B2436] px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Configurações salvas com sucesso!
        </div>
      )}

      <div className="grid gap-6 max-w-2xl">
        {/* Site Name */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#1B2436] mb-4">Informações do Site</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Site</label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={e => setSettings(s => ({ ...s, site_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={settings.site_description || ''}
                onChange={e => setSettings(s => ({ ...s, site_description: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Breaking News */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#1B2436] mb-2">Notícias de Última Hora</h2>
          <p className="text-xs text-gray-400 mb-4">Separe cada notícia com | (pipe)</p>
          <textarea
            value={settings.breaking_news || ''}
            onChange={e => setSettings(s => ({ ...s, breaking_news: e.target.value }))}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent resize-y"
            placeholder="Notícia 1|Notícia 2|Notícia 3"
          />
        </div>

        {/* API Keys - Configurable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#1B2436] mb-2">Chaves de API</h2>
          <p className="text-xs text-gray-400 mb-4">Configure as chaves de API diretamente aqui. Elas são salvas no banco de dados.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grok / xAI <span className="text-xs text-gray-400">(Reescrita de artigos com IA)</span>
              </label>
              <input
                type="password"
                value={settings.xai_api_key || ''}
                onChange={e => setSettings(s => ({ ...s, xai_api_key: e.target.value }))}
                placeholder="xai-..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Obtenha em <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer" className="underline">console.x.ai</a></p>
            </div>
          </div>
        </div>

        {/* Other API Keys Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-[#1B2436] mb-2">APIs Externas (Vercel)</h2>
          <p className="text-xs text-gray-400 mb-4">Estas chaves são configuradas nas variáveis de ambiente da Vercel</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">API-Football (Placar ao vivo)</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-500">NEXT_PUBLIC_FOOTBALL_API_KEY</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">OpenWeatherMap (Clima)</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-500">NEXT_PUBLIC_OPENWEATHER_API_KEY</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">GNews (Notícias externas)</span>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-500">GNEWS_API_KEY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
