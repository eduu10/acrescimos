import { NextRequest, NextResponse } from 'next/server';
import { publishScheduledArticles } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const count = await publishScheduledArticles();
  return NextResponse.json({ published: count, message: `${count} artigo(s) agendado(s) publicado(s)` });
}
