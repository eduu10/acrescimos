import { NextRequest, NextResponse } from 'next/server';
import { votePoll } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pollId = Number(id);
  if (isNaN(pollId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  // Rate limit: 1 vote per IP per poll per 24h (using poll-specific key)
  const ip = getClientIp(request);
  const key = `poll:${pollId}:${ip}`;
  const { allowed } = checkRateLimit(key, 1, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Você já votou nesta enquete.' }, { status: 429 });
  }

  const { option_id } = await request.json();
  if (!option_id) return NextResponse.json({ error: 'option_id obrigatório' }, { status: 400 });

  const poll = await votePoll(pollId, Number(option_id));
  if (!poll) return NextResponse.json({ error: 'Enquete não encontrada' }, { status: 404 });
  return NextResponse.json(poll);
}
