import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle } from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const article = await getArticleById(articleId);
  if (!article) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const body = await request.json();

  if (body.title) {
    body.slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const article = await updateArticle(articleId, body);
  if (!article) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  return NextResponse.json(article);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const deleted = await deleteArticle(articleId);
  if (!deleted) return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 });
  return NextResponse.json({ success: true });
}
