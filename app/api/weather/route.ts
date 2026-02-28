import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const city = searchParams.get('city') || 'São Paulo';

  if (!API_KEY) {
    return NextResponse.json({ error: 'API key não configurada' }, { status: 500 });
  }

  try {
    let url: string;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`;
    }

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar clima' }, { status: 500 });
    const data = await res.json();

    return NextResponse.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar clima' }, { status: 500 });
  }
}
