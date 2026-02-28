'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Search } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
  clicks: number;
  createdAt: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArticles = () => {
    setLoading(true);
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => { setArticles(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    fetchArticles();
  };

  const togglePublished = async (id: string, published: boolean) => {
    await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    });
    fetchArticles();
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !featured }),
    });
    fetchArticles();
  };

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Artigos</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-[#F2E205] text-[#1B2436] px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Artigo
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar artigos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-6 h-6 border-2 border-[#F2E205] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Título</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Categoria</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Cliques</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(article => (
                  <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 line-clamp-1">{article.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{article.author} - {new Date(article.createdAt).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{article.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell font-bold text-gray-600">{article.clicks}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${article.published ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className="text-xs">{article.published ? 'Publicado' : 'Rascunho'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleFeatured(article.id, article.featured)}
                          className={`p-1.5 rounded hover:bg-gray-100 ${article.featured ? 'text-[#F2E205]' : 'text-gray-300'}`}
                          title={article.featured ? 'Remover destaque' : 'Destacar'}
                        >
                          <Star className="w-4 h-4" fill={article.featured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => togglePublished(article.id, article.published)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                          title={article.published ? 'Despublicar' : 'Publicar'}
                        >
                          {article.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      Nenhum artigo encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
