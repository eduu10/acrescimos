'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, BarChart3, LogOut, Menu, X, Home } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/check')
      .then(res => {
        if (res.ok) setAuthenticated(true);
        else setAuthenticated(false);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthenticated(false);
    router.push('/admin');
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#F2E205] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/articles', label: 'Artigos', icon: FileText },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1B2436] text-white transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F2E205] rounded flex items-center justify-center transform -skew-x-6">
              <span className="transform skew-x-6 text-[#1B2436] font-bold font-oswald text-sm">AC</span>
            </div>
            <div>
              <span className="font-oswald font-bold text-[#F2E205]">ACRÉSCIMOS</span>
              <span className="block text-[10px] text-gray-400">Painel Admin</span>
            </div>
          </div>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-[#F2E205] text-[#1B2436]' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors mb-1">
            <Home className="w-5 h-5" />
            Ver Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-oswald font-bold text-[#1B2436]">ADMIN</span>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      onLogin();
    } else {
      setError('Usuário ou senha incorretos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1B2436] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#F2E205] rounded-lg flex items-center justify-center transform -skew-x-6">
              <span className="transform skew-x-6 text-[#1B2436] font-bold font-oswald text-2xl">AC</span>
            </div>
          </div>
          <h1 className="font-oswald font-bold text-3xl text-[#F2E205]">ACRÉSCIMOS</h1>
          <p className="text-gray-400 text-sm mt-1">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2A3447] rounded-xl p-6 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-[#1B2436] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              placeholder="admin"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1B2436] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#F2E205] focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F2E205] text-[#1B2436] font-bold py-3 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
