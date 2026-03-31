import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSetting } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fixture, events } = body;

    if (!fixture) return NextResponse.json({ error: 'Dados do jogo obrigatórios' }, { status: 400 });

    const apiKey = await getSetting('groq_api_key');
    if (!apiKey) return NextResponse.json({ error: 'Groq API key não configurada' }, { status: 400 });

    const grok = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });

    const eventsText = Array.isArray(events) && events.length > 0
      ? `\nÚltimos eventos: ${events.map((e: { time?: { elapsed?: number }; type?: string; detail?: string; player?: { name?: string } }) => `${e.time?.elapsed ?? '?'}' ${e.type ?? ''} ${e.player?.name ?? ''}`).join(', ')}`
      : '';

    const prompt = `Você é um narrador esportivo brasileiro empolgante. Escreva UM parágrafo curto (3-4 frases) de narração ao vivo para o jogo:

${fixture.home} ${fixture.score} ${fixture.away}
Competição: ${fixture.league}
Minuto: ${fixture.minute ?? 'Final'}
Status: ${fixture.status}${eventsText}

Seja dinâmico, use gírias do futebol brasileiro, mencione o placar e o momento do jogo. NÃO invente gols ou eventos que não aconteceram. Responda APENAS com o texto da narração, sem aspas.`;

    const completion = await grok.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Você é um narrador esportivo brasileiro. Seja entusiasmado, use linguagem coloquial do futebol.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
    });

    const commentary = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ commentary });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
