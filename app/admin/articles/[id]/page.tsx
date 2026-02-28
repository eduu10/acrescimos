'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Search, X, ImageIcon } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Brasileirão', 'Futebol Internacional', 'Copa do Brasil', 'Libertadores', 'Basquete', 'Fórmula 1', 'Tênis', 'Vôlei', 'Mercado da Bola', 'Opinião', 'Geral'];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageQuery, setImageQuery] = useState('');
  const [imageResults, setImageResults] = useState<{ id: number; url: string; thumb: string; alt: string }[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    image: '',
    category: 'Geral',
    author: '',
    published: true,
    featured: false,
  });

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(article => {
        setForm({
          title: article.title,
          content: article.content,
          image: article.image,
          category: article.category,
          author: article.author,
          published: article.published,
          featured: article.featured,
        });
        setLoading(false);
      })
      .catch(() => {
        alert('Artigo não encontrado');
        router.push('/admin/articles');
      });
  }, [params.id, router]);

  const handleImageSearch = async (query?: string) => {
    const q = query || imageQuery;
    if (!q.trim()) return;
    setSearchingImages(true);
    try {
      const res = await fetch(`/api/images?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (res.ok) setImageResults(json.images || []);
    } catch {} finally { setSearchingImages(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/articles/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push('/admin/articles');
    } else {
      alert('Erro ao salvar');
    }
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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/articles" className="p-2 hover:bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Editar Artigo</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
            {/* Image preview */}
            {form.image && (
              <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img src={form.image} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, image: '' }))}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {!form.image && (
              <div className="h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-2">
                <ImageIcon className="w-8 h-8 text-gray-300 mb-1" />
                <span className="text-xs text-gray-400">Sem imagem</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                placeholder="URL da imagem ou busque abaixo"
              />
              <button
                type="button"
                onClick={() => { setShowImageSearch(!showImageSearch); setImageQuery(form.title.split(' ').slice(0, 3).join(' ')); if (!showImageSearch) handleImageSearch(form.title.split(' ').slice(0, 3).join(' ')); }}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm transition-colors"
              >
                <Search className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Buscar</span>
              </button>
            </div>
            {/* Image search panel */}
            {showImageSearch && (
              <div className="mt-2 border border-gray-200 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={imageQuery}
                    onChange={e => setImageQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleImageSearch())}
                    placeholder="Ex: futebol, basquete..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F2E205]"
                  />
                  <button type="button" onClick={() => handleImageSearch()} disabled={searchingImages} className="bg-[#F2E205] text-[#1B2436] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-300 disabled:opacity-50">
                    {searchingImages ? '...' : 'Buscar'}
                  </button>
                  <button type="button" onClick={() => { setShowImageSearch(false); setImageResults([]); }} className="p-1.5 hover:bg-gray-200 rounded">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {searchingImages && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin w-5 h-5 border-2 border-[#F2E205] border-t-transparent rounded-full" />
                  </div>
                )}
                {imageResults.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {imageResults.map(img => (
                      <button type="button" key={img.id} onClick={() => { setForm(f => ({ ...f, image: img.url })); setShowImageSearch(false); setImageResults([]); }}
                        className="relative aspect-video rounded overflow-hidden border-2 border-transparent hover:border-[#F2E205] transition-colors">
                        <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2">Imagens por Pexels</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input
                type="text"
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={12}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent resize-y"
              required
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-[#F2E205]"
              />
              <span className="text-sm text-gray-700">Publicado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-[#F2E205]"
              />
              <span className="text-sm text-gray-700">Destaque</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#F2E205] text-[#1B2436] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
