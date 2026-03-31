'use client'

import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Inscrito com sucesso!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || data.error || 'Erro ao inscrever.')
      }
    } catch {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <section className="bg-[#1B2436] py-10">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="flex items-center justify-center gap-2 text-[#F2E205] mb-3">
          <Mail className="w-5 h-5" />
          <span className="font-oswald font-bold uppercase text-sm tracking-wider">Newsletter</span>
        </div>
        <h3 className="text-xl font-oswald font-bold text-white mb-2">
          Receba as melhores notícias esportivas
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Cadastre seu email e fique por dentro de tudo que acontece no mundo dos esportes.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-green-400 bg-green-400/10 rounded-lg py-3 px-4">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              placeholder="Seu melhor email"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-[#F2E205] text-[#1B2436] font-bold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Inscrever-se'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <div className="flex items-center justify-center gap-2 text-red-400 mt-3">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    </section>
  )
}
