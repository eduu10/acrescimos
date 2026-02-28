'use client';

import { useEffect, useState } from 'react';
import { Eye, MousePointerClick, FileText, TrendingUp, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  topArticles: { id: string; title: string; clicks: number; category: string }[];
  todayClicks: number;
  todayViews: number;
  totalArticles: number;
  publishedArticles: number;
  viewsLast7Days: { date: string; count: number }[];
  clicksLast7Days: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    setRefreshing(true);
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => { setData(d); setRefreshing(false); })
      .catch(() => setRefreshing(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalViews = data.viewsLast7Days.reduce((s, d) => s + d.count, 0);
  const totalClicks = data.clicksLast7Days.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Analytics</h1>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Views Hoje</span>
          </div>
          <span className="text-2xl font-bold text-[#1B2436]">{data.todayViews}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Cliques Hoje</span>
          </div>
          <span className="text-2xl font-bold text-[#1B2436]">{data.todayClicks}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Views (7 dias)</span>
          </div>
          <span className="text-2xl font-bold text-[#1B2436]">{totalViews}</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Cliques (7 dias)</span>
          </div>
          <span className="text-2xl font-bold text-[#1B2436]">{totalClicks}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-oswald font-bold text-[#1B2436] mb-4">Page Views - 7 dias</h2>
          <div className="flex items-end gap-2 h-48">
            {data.viewsLast7Days.length === 0 ? (
              <p className="text-gray-400 text-sm">Sem dados</p>
            ) : (
              data.viewsLast7Days.map(day => {
                const max = Math.max(...data.viewsLast7Days.map(d => d.count), 1);
                const h = (day.count / max) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{day.count}</span>
                    <div className="w-full bg-purple-500 rounded-t transition-all" style={{ height: `${Math.max(h, 4)}%` }} />
                    <span className="text-[10px] text-gray-400">{day.date.split('-').slice(1).join('/')}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-oswald font-bold text-[#1B2436] mb-4">Cliques em Artigos - 7 dias</h2>
          <div className="flex items-end gap-2 h-48">
            {data.clicksLast7Days.length === 0 ? (
              <p className="text-gray-400 text-sm">Sem dados</p>
            ) : (
              data.clicksLast7Days.map(day => {
                const max = Math.max(...data.clicksLast7Days.map(d => d.count), 1);
                const h = (day.count / max) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-gray-600">{day.count}</span>
                    <div className="w-full bg-[#F2E205] rounded-t transition-all" style={{ height: `${Math.max(h, 4)}%` }} />
                    <span className="text-[10px] text-gray-400">{day.date.split('-').slice(1).join('/')}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Articles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-oswald font-bold text-[#1B2436]">Top 10 - Matérias Mais Clicadas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Artigo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Categoria</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {data.topArticles.map((article, i) => (
                <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{article.title}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{article.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#1B2436]">{article.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
