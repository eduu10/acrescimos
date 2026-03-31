import { NextRequest, NextResponse } from 'next/server';
import { getLiveCoverage, addLiveEvent, getSetting } from '@/lib/db';
import OpenAI from 'openai';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fixtureId = Number(searchParams.get('fixture_id'));
  if (!fixtureId) return NextResponse.json({ error: 'fixture_id obrigatório' }, { status: 400 });

  const events = await getLiveCoverage(fixtureId);
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { fixture_id, minute, event_type, team, player, detail } = body;
  if (!fixture_id || !event_type) {
    return NextResponse.json({ error: 'fixture_id e event_type obrigatórios' }, { status: 400 });
  }

  // Generate AI comment for significant events
  let ai_comment: string | null = null;
  const significantEvents = ['goal', 'card', 'var', 'substitution'];
  if (significantEvents.includes(event_type)) {
    try {
      const apiKey = await getSetting('groq_api_key');
      if (apiKey) {
        const grok = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
        const eventLabels: Record<string, string> = { goal: 'GOL', card: 'CARTÃO', var: 'VAR', substitution: 'SUBSTITUIÇÃO' };
        const prompt = `Minuto ${minute ?? '?'}: ${eventLabels[event_type] || event_type} — ${player || 'jogador'} (${team || 'time'}) — ${detail || ''}. Comente em 1-2 frases, tom jornalístico esportivo brasileiro.`;
        const completion = await grok.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
        });
        ai_comment = completion.choices[0]?.message?.content?.trim() || null;
      }
    } catch { /* non-critical */ }
  }

  const event = await addLiveEvent({ fixture_id: Number(fixture_id), minute: minute ?? null, event_type, team: team ?? null, player: player ?? null, detail: detail ?? null, ai_comment });
  return NextResponse.json(event, { status: 201 });
}
