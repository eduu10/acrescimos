import { NextRequest, NextResponse } from 'next/server';
import { getArticlePoll, createPoll } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = Number(searchParams.get('article_id'));
  if (!articleId) return NextResponse.json({ error: 'article_id required' }, { status: 400 });

  const poll = await getArticlePoll(articleId);
  return NextResponse.json(poll || null);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { article_id, question, options } = await request.json();
  if (!article_id || !question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: 'article_id, question e ao menos 2 opções são obrigatórios' }, { status: 400 });
  }

  const poll = await createPoll(Number(article_id), question, options.slice(0, 4));
  return NextResponse.json(poll, { status: 201 });
}
