'use client';

import { useEffect, useState } from 'react';
import { CloudRain, Droplets, Thermometer, MapPin } from 'lucide-react';

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

  useEffect(() => {
    const fetchWeather = async (lat?: number, lon?: number) => {
      try {
        const params = lat && lon ? `lat=${lat}&lon=${lon}` : 'city=São Paulo';
        const res = await fetch(`/api/weather?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.error) setWeather(data);
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(),
        { timeout: 5000 }
      );
    } else {
      fetchWeather();
    }
  }, []);

  if (loading || !weather) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <CloudRain className="w-4 h-4" />
        <span>{loading ? '...' : 'Clima indisponível'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      {weather.icon && (
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
          alt={weather.description}
          className="w-8 h-8"
        />
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
