'use client';

import { useEffect, useState } from 'react';
import { CloudRain, Droplets, Thermometer, MapPin, Search } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const fetchWeather = async (lat?: number, lon?: number, city?: string) => {
    try {
      let params = 'city=São Paulo';
      if (lat && lon) params = `lat=${lat}&lon=${lon}`;
      else if (city) params = `city=${encodeURIComponent(city)}`;
      const res = await fetch(`/api/weather?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (!data.error) { setWeather(data); setShowInput(false); }
      }
    } catch { /* silently fail */ }
    setLoading(false);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => setShowInput(true),
        { timeout: 5000 }
      );
      // Timeout fallback
      setTimeout(() => { if (!weather) { setLoading(false); setShowInput(true); } }, 6000);
    } else {
      setShowInput(true);
      setLoading(false);
    }
  }, []);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) fetchWeather(undefined, undefined, cityInput.trim());
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CloudRain className="w-4 h-4 animate-pulse" />
        <span>...</span>
      </div>
    );
  }

  if (showInput && !weather) {
    return (
      <form onSubmit={handleCitySearch} className="flex items-center gap-1">
        <input
          type="text"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          placeholder="Sua cidade"
          className="bg-[#2A3447] border border-gray-700 rounded px-2 py-1 text-xs w-24 text-white placeholder-gray-500 focus:ring-1 focus:ring-[#F2E205]"
        />
        <button type="submit" className="p-1 hover:bg-white/10 rounded">
          <Search className="w-3 h-3 text-gray-400" />
        </button>
      </form>
    );
  }

  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 text-xs cursor-pointer" onClick={() => setShowInput(true)} title="Clique para mudar a cidade">
      {weather.icon && (
        <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt={weather.description} className="w-8 h-8" />
      )}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-[#F2E205]" />
          <span className="font-bold text-white">{weather.temp}°C</span>
          <span className="text-gray-400 hidden sm:inline">ST {weather.feelsLike}°C</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>{weather.city}</span>
          <Droplets className="w-3 h-3 ml-1" />
          <span>{weather.humidity}%</span>
        </div>
      </div>
    </div>
  );
}
