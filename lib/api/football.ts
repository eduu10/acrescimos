const API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

async function fetchAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const res = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
  return res.json();
}

export async function getLiveFixtures() {
  try {
    const data = await fetchAPI('/fixtures', { live: 'all' });
    return data.response || [];
  } catch {
    return [];
  }
}

export async function getTodayFixtures() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await fetchAPI('/fixtures', { date: today });
    return data.response || [];
  } catch {
    return [];
  }
}

export async function getStandings(leagueId: string, season: string) {
  try {
    const data = await fetchAPI('/standings', { league: leagueId, season });
    return data.response?.[0]?.league?.standings?.[0] || [];
  } catch {
    return [];
  }
}

// League IDs
export const LEAGUES = {
  brasileirao: { id: '71', name: 'Brasileirão Série A', season: '2026' },
  premierLeague: { id: '39', name: 'Premier League', season: '2025' },
  laLiga: { id: '140', name: 'La Liga', season: '2025' },
  championsLeague: { id: '2', name: 'Champions League', season: '2025' },
};
