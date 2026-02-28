'use client';

import { useEffect, useState } from 'react';
import { FileText, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

interface DashboardData {
  topArticles: { id: string; title: string; clicks: number; category: string }[];
  todayClicks: number;
  todayViews: number;
  totalArticles: number;
  publishedArticles: number;
  viewsLast7Days: { date: string; count: number }[];
  clicksLast7Days: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

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
        {/* Views Chart (Simple bar chart) */}
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
    </div>
  );
}
