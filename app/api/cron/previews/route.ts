import { NextRequest, NextResponse } from 'next/server';
import { createArticle, getSetting } from '@/lib/db';
import OpenAI from 'openai';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Football API key não configurada' }, { status: 400 });

  const groqKey = await getSetting('groq_api_key');
  if (!groqKey) return NextResponse.json({ error: 'Groq API key não configurada' }, { status: 400 });

  // Fetch upcoming games in next 24h for Brasileirão (league 71)
  const year = new Date().getFullYear();
  const fixturesRes = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=71&season=${year}&next=5`,
    { headers: { 'x-apisports-key': apiKey }, signal: AbortSignal.timeout(10000) }
  );

  if (!fixturesRes.ok) return NextResponse.json({ error: 'Erro na API de futebol' }, { status: 500 });
  const fixturesData = await fixturesRes.json();
  const fixtures = fixturesData.response || [];

  // Filter fixtures in next 24h
  const now = Date.now();
  const in24h = now + 24 * 60 * 60 * 1000;
  const upcoming = fixtures.filter((f: { fixture: { date: string } }) => {
    const t = new Date(f.fixture.date).getTime();
    return t >= now && t <= in24h;
  });

  if (upcoming.length === 0) {
    return NextResponse.json({ message: 'Nenhum jogo nas próximas 24h', generated: 0 });
  }

  const grok = new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' });
  let generated = 0;

  for (const fixture of upcoming.slice(0, 3)) {
    const team1 = fixture.teams?.home?.name || 'Time A';
    const team2 = fixture.teams?.away?.name || 'Time B';
    const competition = fixture.league?.name || 'Brasileirão';
    const dateStr = new Date(fixture.fixture.date).toLocaleDateString('pt-BR');

    try {
      const prompt = `Escreva um artigo jornalístico de prévia do jogo ${team1} x ${team2} pelo ${competition}, marcado para ${dateStr}.

Inclua: análise da forma recente dos dois times, prováveis escalações com nomes realistas de jogadores brasileiros, histórico de confrontos, e previsão para o jogo.

O artigo deve ter pelo menos 5 parágrafos, tom jornalístico esportivo brasileiro.

Responda com JSON: {"title": "título", "content": "conteúdo com parágrafos separados por \\n\\n"}`;

      const completion = await grok.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Você é um jornalista esportivo brasileiro. Responda SOMENTE com JSON válido, sem markdown.' },
          { role: 'user', content: prompt },
        ],
      });

      let text = completion.choices[0]?.message?.content || '';
      text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(text);

      const slug = parsed.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      await createArticle({
        title: parsed.title,
        slug: `previa-${slug}-${Date.now()}`,
        content: parsed.content,
        image: '',
        category: competition.includes('Brasil') ? 'Copa do Brasil' : competition.includes('Libertadores') ? 'Libertadores' : 'Brasileirão',
        author: 'IA Acréscimos',
        published: false,
        featured: false,
      });
      generated++;
    } catch { /* skip this fixture */ }
  }

  return NextResponse.json({ message: `${generated} prévias geradas`, generated });
}
