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

  // Fetch today's finished fixtures for Brasileirão
  const year = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  const fixturesRes = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=71&season=${year}&date=${today}&status=FT`,
    { headers: { 'x-apisports-key': apiKey }, signal: AbortSignal.timeout(10000) }
  );

  if (!fixturesRes.ok) return NextResponse.json({ error: 'Erro na API de futebol' }, { status: 500 });
  const data = await fixturesRes.json();
  const finished = data.response || [];

  if (finished.length === 0) {
    return NextResponse.json({ message: 'Nenhum jogo encerrado hoje', generated: 0 });
  }

  // Build results summary for prompt
  const results = finished.map((f: { teams: { home: { name: string }; away: { name: string } }; goals: { home: number; away: number }; league: { round: string } }) =>
    `${f.teams.home.name} ${f.goals.home} x ${f.goals.away} ${f.teams.away.name}`
  ).join('\n');
  const round = finished[0]?.league?.round || 'Rodada';

  const grok = new OpenAI({ apiKey: groqKey, baseURL: 'https://api.groq.com/openai/v1' });

  try {
    const prompt = `Escreva um artigo jornalístico de resumo da ${round} do Brasileirão com os seguintes resultados reais:

${results}

Inclua: análise dos jogos, goleadas e viradas, mudanças na classificação, destaque da rodada, artilheiro e previsão para a próxima rodada.

Pelo menos 6 parágrafos, tom jornalístico esportivo brasileiro.

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
      slug: `resumo-${slug}-${Date.now()}`,
      content: parsed.content,
      image: '',
      category: 'Brasileirão',
      author: 'IA Acréscimos',
      published: false,
      featured: false,
    });

    return NextResponse.json({ message: 'Resumo de rodada gerado', generated: 1 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erro' }, { status: 500 });
  }
}
