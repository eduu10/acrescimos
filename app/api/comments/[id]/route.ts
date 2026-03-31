import { NextRequest, NextResponse } from 'next/server';
import { approveComment, deleteComment } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const commentId = Number(id);
  if (isNaN(commentId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const ok = await approveComment(commentId);
  if (!ok) return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id } = await params;
  const commentId = Number(id);
  if (isNaN(commentId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const ok = await deleteComment(commentId);
  if (!ok) return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
  return NextResponse.json({ success: true });
}
