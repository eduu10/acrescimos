import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'live';
  const league = searchParams.get('league');
  const season = searchParams.get('season') || '2026';

  if (!API_KEY) {
    return NextResponse.json({ response: [], error: 'API key não configurada' });
  }

  try {
    let url = '';
    if (type === 'live') {
      url = `${BASE_URL}/fixtures?live=all`;
    } else if (type === 'today') {
      const today = new Date().toISOString().split('T')[0];
      url = `${BASE_URL}/fixtures?date=${today}`;
    } else if (type === 'standings' && league) {
      url = `${BASE_URL}/standings?league=${league}&season=${season}`;
    }

    const res = await fetch(url, {
      headers: { 'x-apisports-key': API_KEY },
      next: { revalidate: 60 },
    });

    const data = await res.json();

    if (type === 'standings') {
      return NextResponse.json({
        response: data.response?.[0]?.league?.standings?.[0] || [],
      });
    }

    return NextResponse.json({ response: data.response || [] });
  } catch {
    return NextResponse.json({ response: [] });
  }
}
