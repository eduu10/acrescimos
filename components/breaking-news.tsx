import { AlertCircle } from 'lucide-react';

export function BreakingNews() {
  return (
    <div className="bg-[#F2E205] text-[#1B2436] py-2 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 font-bold uppercase text-xs whitespace-nowrap">
          <AlertCircle className="w-4 h-4" />
          Plantão
        </div>
        <div className="flex-1 overflow-hidden relative h-5">
          <div className="animate-marquee-slow whitespace-nowrap absolute top-0 left-0 flex items-center gap-8 text-sm font-medium hover-pause">
            {/* Duplicated content for seamless loop */}
            <div className="flex items-center gap-8">
              <span>URGENTE: Treinador da seleção convoca substituto para a lateral direita.</span>
              <span>•</span>
              <span>MERCADO: Clube saudita faz proposta milionária por artilheiro do campeonato.</span>
              <span>•</span>
              <span>LIBERTADORES: Conmebol define datas das finais.</span>
              <span>•</span>
              <span>BASQUETE: Astro da NBA anuncia aposentadoria ao fim da temporada.</span>
              <span>•</span>
            </div>
            <div className="flex items-center gap-8">
              <span>URGENTE: Treinador da seleção convoca substituto para a lateral direita.</span>
              <span>•</span>
              <span>MERCADO: Clube saudita faz proposta milionária por artilheiro do campeonato.</span>
              <span>•</span>
              <span>LIBERTADORES: Conmebol define datas das finais.</span>
              <span>•</span>
              <span>BASQUETE: Astro da NBA anuncia aposentadoria ao fim da temporada.</span>
              <span>•</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
