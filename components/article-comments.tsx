'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export function ArticleComments({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ author_name: '', content: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/comments?article_id=${articleId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setForm({ author_name: '', content: '' });
      } else {
        setError(data.error || 'Erro ao enviar comentário');
      }
    } catch {
      setError('Erro ao enviar comentário');
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
      <h2 className="font-oswald font-bold text-[#1B2436] dark:text-white text-xl mb-5 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-[#F2E205]" />
        Comentários
        {comments.length > 0 && (
          <span className="text-sm font-normal text-gray-400">({comments.length})</span>
        )}
      </h2>

      {/* Comment form */}
      {submitted ? (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 text-sm text-green-700 dark:text-green-400">
          Seu comentário foi enviado e será publicado após moderação. Obrigado!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Seu nome"
              value={form.author_name}
              onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
              maxLength={100}
              required
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
            />
            <textarea
              placeholder="Escreva seu comentário..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              maxLength={1000}
              rows={4}
              required
              className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F2E205] focus:border-transparent resize-y"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Seu comentário será publicado após moderação.</span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-[#F2E205] text-[#1B2436] px-5 py-2 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Enviando...' : 'Comentar'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin w-6 h-6 border-2 border-[#F2E205] border-t-transparent rounded-full" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Seja o primeiro a comentar!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1B2436] dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                <User className="w-4 h-4 text-[#F2E205]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.author_name}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
