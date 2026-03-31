import { NextRequest, NextResponse } from 'next/server';
import { getApprovedComments, createComment } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = Number(searchParams.get('article_id'));
  if (isNaN(articleId) || articleId <= 0) {
    return NextResponse.json({ error: 'article_id inválido' }, { status: 400 });
  }
  const comments = await getApprovedComments(articleId);
  return NextResponse.json(comments);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Body inválido' }, { status: 400 });

  const { article_id, author_name, content } = body;

  if (!article_id || isNaN(Number(article_id))) {
    return NextResponse.json({ error: 'article_id inválido' }, { status: 400 });
  }
  if (!author_name || typeof author_name !== 'string' || author_name.trim().length < 2) {
    return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 });
  }
  if (!content || typeof content !== 'string' || content.trim().length < 5) {
    return NextResponse.json({ error: 'Comentário deve ter pelo menos 5 caracteres' }, { status: 400 });
  }

  // Strip HTML tags to prevent XSS
  const safeAuthor = author_name.trim().replace(/<[^>]*>/g, '').slice(0, 100);
  const safeContent = content.trim().replace(/<[^>]*>/g, '').slice(0, 1000);

  const comment = await createComment(Number(article_id), safeAuthor, safeContent);
  return NextResponse.json(comment, { status: 201 });
}
