import Image from 'next/image';
import { Clock, MessageSquare } from 'lucide-react';

const NEWS_ITEMS = [
  {
    id: 1,
    category: "Brasileirão",
    title: "Análise: O que esperar da próxima rodada decisiva",
    image: "https://loremflickr.com/400/300/soccer,match?random=4",
    time: "Há 2 horas",
    comments: 12
  },
  {
    id: 2,
    category: "Futebol Internacional",
    title: "Craque argentino renova contrato até 2028",
    image: "https://loremflickr.com/400/300/football,celebration?random=5",
    time: "Há 3 horas",
    comments: 45
  },
  {
    id: 3,
    category: "Copa do Brasil",
    title: "Sorteio define confrontos das quartas de final",
    image: "https://loremflickr.com/400/300/trophy,soccer?random=6",
    time: "Há 5 horas",
    comments: 89
  },
  {
    id: 4,
    category: "Basquete",
    title: "Lakers vencem mais uma com show de LeBron",
    image: "https://loremflickr.com/400/300/basketball,nba?random=7",
    time: "Há 6 horas",
    comments: 8
  }
];

export function NewsFeed() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h3 className="text-2xl font-oswald font-bold text-[#1B2436] uppercase border-l-4 border-[#F2E205] pl-3">
          Últimas Notícias
        </h3>
        <a href="#" className="text-sm font-bold text-[#1B2436] hover:text-[#F2E205] transition-colors">
          Ver todas &rarr;
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {NEWS_ITEMS.map((item) => (
          <article key={item.id} className="group flex flex-col gap-3 cursor-pointer">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image 
                src={item.image} 
                alt={item.title} 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 bg-[#1B2436] text-[#F2E205] text-[10px] font-bold px-2 py-1 uppercase rounded">
                {item.category}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-[#1B2436]/80">
                {item.title}
              </h4>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {item.comments} comentários
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
