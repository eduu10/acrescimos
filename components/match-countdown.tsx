'use client';

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface CountdownEvent {
  name: string;
  date: string;
  teams?: string;
}

// You can make these dynamic via admin later
const UPCOMING_EVENTS: CountdownEvent[] = [
  { name: 'Brasileirão - Rodada 5', date: '2026-03-08T16:00:00', teams: 'Flamengo x Palmeiras' },
  { name: 'Libertadores - Fase de Grupos', date: '2026-03-12T21:30:00', teams: 'Início da fase de grupos' },
  { name: 'Copa do Brasil - Oitavas', date: '2026-03-20T19:00:00', teams: 'Sorteio dos jogos' },
];

function getTimeRemaining(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

export function MatchCountdown() {
  const [time, setTime] = useState(getTimeRemaining(UPCOMING_EVENTS[0].date));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(UPCOMING_EVENTS[activeIndex].date));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const event = UPCOMING_EVENTS[activeIndex];

  return (
    <div className="bg-[#1B2436] rounded-xl p-4 text-white">
      <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
        <Timer className="w-5 h-5 text-[#F2E205]" />
        <h3 className="font-oswald font-bold text-sm uppercase text-[#F2E205]">Próximo Evento</h3>
      </div>

      {/* Event selector */}
      <div className="flex gap-1 mb-3">
        {UPCOMING_EVENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); setTime(getTimeRemaining(UPCOMING_EVENTS[i].date)); }}
            className={`flex-1 h-1 rounded-full transition-colors ${i === activeIndex ? 'bg-[#F2E205]' : 'bg-white/20'}`}
          />
        ))}
      </div>

      <p className="text-sm font-bold mb-1">{event.name}</p>
      {event.teams && <p className="text-xs text-gray-400 mb-3">{event.teams}</p>}

      {time.expired ? (
        <p className="text-[#F2E205] font-bold text-sm">Evento iniciado!</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Dias', value: time.days },
            { label: 'Horas', value: time.hours },
            { label: 'Min', value: time.minutes },
            { label: 'Seg', value: time.seconds },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-lg p-2 text-center">
              <span className="text-xl font-bold font-mono text-[#F2E205]">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
