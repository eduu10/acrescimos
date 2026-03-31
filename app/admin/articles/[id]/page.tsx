'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Search, X, Upload, Loader2, Link2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { compressImage } from '@/lib/image-compress';
import { RichEditor } from '@/components/admin/rich-editor';
import { TagSelector } from '@/components/admin/tag-selector';

const CATEGORIES = ['Brasileirão', 'Futebol Internacional', 'Copa do Brasil', 'Libertadores', 'Basquete', 'Fórmula 1', 'Tênis', 'Vôlei', 'Mercado da Bola', 'Opinião', 'Geral'];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageQuery, setImageQuery] = useState('');
  const [imageResults, setImageResults] = useState<{ id: number; url: string; thumb: string; alt: string }[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);

  // URL import state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    image: '',
    image_caption: '',
    category: 'Geral',
    author: '',
    published: true,
    featured: false,
    scheduled_at: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

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
          image_caption: article.image_caption || '',
          category: article.category,
          author: article.author,
          published: article.published,
          featured: article.featured,
          scheduled_at: article.scheduled_at ? new Date(article.scheduled_at).toISOString().slice(0, 16) : '',
        });
        setLoading(false);
        // Load article tags
        fetch(`/api/tags?article_id=${article.id}`)
          .then(r => r.json())
          .then((tags: { id: number }[]) => setSelectedTagIds(tags.map(t => t.id)))
          .catch(() => {});
      })
      .catch(() => {
        alert('Artigo não encontrado');
        router.push('/admin/articles');
      });
  }, [params.id, router]);

  const handleImportUrl = async (rewrite: boolean) => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim(), rewrite }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportStatus({ type: 'error', message: data.error || 'Erro ao importar' });
        return;
      }
      setForm(f => ({
        ...f,
        title: data.title || f.title,
        content: data.content || f.content,
        image: data.image || f.image,
        category: data.category || f.category,
      }));
      setImportStatus({
        type: data.warning ? 'warning' : 'success',
        message: data.warning || (rewrite ? 'Matéria importada e reescrita com IA!' : 'Matéria importada! Edite antes de salvar.'),
      });
    } catch {
      setImportStatus({ type: 'error', message: 'Erro de conexão ao importar' });
    }
    setImporting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: compressed, fileName: file.name }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm(f => ({ ...f, image: data.url }));
      } else {
        alert(data.error || 'Erro no upload');
      }
    } catch {
      alert('Erro ao enviar imagem');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
      await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: Number(params.id), tag_ids: selectedTagIds }),
      });
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

          {/* ── IMPORT FROM URL ───────────────────────────────────── */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              Importar matéria por link
            </label>
            <p className="text-xs text-blue-600 mb-3">Cole o link de uma matéria para substituir título, imagem e conteúdo automaticamente.</p>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={importUrl}
                onChange={e => { setImportUrl(e.target.value); setImportStatus(null); }}
                placeholder="https://ge.globo.com/futebol/..."
                className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleImportUrl(false))}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleImportUrl(false)}
                disabled={importing || !importUrl.trim()}
                className="flex items-center gap-1.5 bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                Importar dados
              </button>
              <button
                type="button"
                onClick={() => handleImportUrl(true)}
                disabled={importing || !importUrl.trim()}
                className="flex items-center gap-1.5 bg-[#1B2436] hover:bg-[#F2E205] hover:text-[#1B2436] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Importar + Reescrever com IA
              </button>
            </div>
            {importStatus && (
              <div className={`mt-3 flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
                importStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                importStatus.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {importStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {importStatus.message}
              </div>
            )}
          </div>

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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#F2E205] hover:bg-yellow-50 flex flex-col items-center justify-center mb-2 cursor-pointer transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#F2E205] mb-1 animate-spin" />
                    <span className="text-xs text-gray-500">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mb-1" />
                    <span className="text-xs text-gray-500 font-medium">Clique para enviar imagem</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP — máx. 5MB</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
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
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 bg-[#1B2436] hover:bg-[#F2E205] hover:text-[#1B2436] text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? '...' : 'Upload'}</span>
              </button>
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

            {/* ── IMAGE CAPTION ─────────────────────────────────── */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Descrição / Créditos da imagem</label>
              <input
                type="text"
                value={form.image_caption}
                onChange={e => setForm(f => ({ ...f, image_caption: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                placeholder="Ex: Jogador em ação durante a partida. Foto: Nome do fotógrafo / Agência"
                maxLength={300}
              />
            </div>
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
            <RichEditor
              content={form.content}
              onChange={html => setForm(f => ({ ...f, content: html }))}
              theme="light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <TagSelector selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={e => setForm(f => ({ ...f, published: e.target.checked, scheduled_at: e.target.checked ? '' : f.scheduled_at }))}
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
            {!form.published && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Agendar publicação (opcional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
                />
                {form.scheduled_at && <p className="text-xs text-gray-400 mt-1">O artigo será publicado automaticamente nessa data.</p>}
              </div>
            )}
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
