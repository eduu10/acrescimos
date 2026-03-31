'use client';

import { useEffect, useState } from 'react';
import { Check, Trash2, MessageCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PendingComment {
  id: number;
  article_id: number;
  article_title: string;
  author_name: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { loadComments(); }, []);

  const handleApprove = async (id: number) => {
    setProcessing(id);
    const res = await fetch(`/api/comments/${id}`, { method: 'PUT' });
    if (res.ok) setComments(cs => cs.filter(c => c.id !== id));
    setProcessing(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este comentário?')) return;
    setProcessing(id);
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) setComments(cs => cs.filter(c => c.id !== id));
    setProcessing(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-[#F2E205]" />
        <h1 className="text-2xl font-oswald font-bold text-[#1B2436]">Moderação de Comentários</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full" />
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum comentário pendente</p>
          <p className="text-sm text-gray-400 mt-1">Todos os comentários foram moderados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500">{comments.length} comentário(s) aguardando aprovação</p>
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[#1B2436]">{comment.author_name}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    Artigo:
                    <Link
                      href={`/api/articles/${comment.article_id}`}
                      target="_blank"
                      className="text-[#1B2436] hover:text-[#F2E205] font-medium flex items-center gap-0.5"
                    >
                      {comment.article_title}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(comment.id)}
                    disabled={processing === comment.id}
                    title="Aprovar"
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={processing === comment.id}
                    title="Excluir"
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
