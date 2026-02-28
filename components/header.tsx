import { Search, Menu, Shield } from 'lucide-react';
import Link from 'next/link';
import { WeatherWidget } from './weather-widget';
import { ThemeToggle } from './theme-toggle';

const TEAMS = [
  'Cruzeiro', 'Atlético-MG', 'Flamengo', 'Palmeiras', 'Corinthians',
  'São Paulo', 'Vasco', 'Grêmio', 'Internacional', 'Botafogo',
  'Fluminense', 'Santos', 'Bahia', 'Fortaleza', 'Athletico-PR'
];

export function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#1B2436] text-white border-b-4 border-[#F2E205] shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-10 h-10 bg-[#F2E205] rounded-lg transform -skew-x-6 group-hover:scale-105 transition-transform">
                <span className="transform skew-x-6 text-[#1B2436] font-bold font-oswald text-xl">AC</span>
              </div>
              <div className="flex flex-col">
                <span className="font-oswald font-bold text-2xl leading-none tracking-wide text-[#F2E205]">ACRÉSCIMOS</span>
                <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase leading-none">A notícia além do tempo</span>
              </div>
            </Link>
          </div>

          {/* Center: Quick Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 font-bold text-sm uppercase tracking-wider font-oswald">
            <Link href="/" className="hover:text-[#F2E205] transition-colors">Início</Link>
            <Link href="/standings" className="hover:text-[#F2E205] transition-colors">Classificação</Link>
            <Link href="#" className="hover:text-[#F2E205] transition-colors">Libertadores</Link>
            <Link href="#" className="hover:text-[#F2E205] transition-colors">Copa do Brasil</Link>
          </nav>

          {/* Right: Weather, Search, Theme & Account */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <WeatherWidget />
            </div>
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-[#2A3447] border border-gray-700 rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-[#F2E205] focus:border-transparent w-48 transition-all focus:w-64 placeholder-gray-400 text-white"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <ThemeToggle />
            <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Admin">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Sub-header for Teams (Marquee) */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 overflow-hidden relative z-40 group">
        <div className="container mx-auto px-4 flex items-center gap-4">
           <span className="text-[#1B2436] dark:text-gray-300 font-bold uppercase text-xs whitespace-nowrap z-10 bg-white dark:bg-gray-800 pr-2">Times:</span>
           <div className="flex-1 overflow-hidden relative h-5 mask-linear-fade">
             <div className="animate-marquee-slower whitespace-nowrap absolute top-0 left-0 flex items-center gap-8 hover-pause">
               {[...TEAMS, ...TEAMS, ...TEAMS, ...TEAMS].map((team, index) => (
                 <Link key={`${team}-${index}`} href="#" className="flex items-center gap-1.5 hover:text-[#F2E205] hover:scale-105 transition-all text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">
                   <Shield className="w-3 h-3 fill-gray-300 text-gray-400" />
                   {team}
                 </Link>
               ))}
             </div>
           </div>
        </div>
      </div>
    </>
  );
}
