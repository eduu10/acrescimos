import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

export function HeroGrid() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Story - Takes up 2 columns */}
        <div className="lg:col-span-2 group cursor-pointer">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image 
              src="https://loremflickr.com/800/450/soccer,stadium?random=1" 
              alt="Main story" 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <span className="inline-block px-2 py-1 bg-[#F2E205] text-[#1B2436] text-xs font-bold uppercase tracking-wider mb-3 rounded-sm">
                Destaque
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-oswald font-bold text-white leading-tight mb-2 group-hover:text-[#F2E205] transition-colors">
                Final eletrizante: Virada histórica nos acréscimos garante o título
              </h1>
              <p className="text-gray-300 text-sm sm:text-base line-clamp-2 max-w-2xl">
                Em jogo de tirar o fôlego, equipe da casa busca o resultado impossível e levanta a taça diante de 50 mil torcedores.
              </p>
            </div>
          </div>
        </div>

        {/* Side Stories - Vertical Stack */}
        <div className="flex flex-col gap-6">
          
          {/* Secondary Story 1 */}
          <div className="relative flex-1 group cursor-pointer min-h-[200px] rounded-xl overflow-hidden">
            <Image 
              src="https://loremflickr.com/400/250/soccer,contract?random=8" 
              alt="Secondary story" 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="text-[#F2E205] text-xs font-bold uppercase mb-1 block">Mercado da Bola</span>
              <h2 className="text-xl font-oswald font-bold text-white leading-tight group-hover:underline">
                Atacante da seleção é sondado por gigantes europeus
              </h2>
            </div>
          </div>

          {/* Secondary Story 2 */}
          <div className="relative flex-1 group cursor-pointer min-h-[200px] rounded-xl overflow-hidden">
             <Image 
              src="https://loremflickr.com/400/250/soccer,coach?random=3" 
              alt="Secondary story" 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <div className="flex items-center gap-2 mb-1">
                <PlayCircle className="w-4 h-4 text-[#F2E205]" />
                <span className="text-white/80 text-xs font-bold uppercase">Vídeo</span>
              </div>
              <h2 className="text-xl font-oswald font-bold text-white leading-tight group-hover:underline">
                Assista: A coletiva polêmica do técnico após o clássico
              </h2>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
