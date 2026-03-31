import { NextRequest, NextResponse } from 'next/server';
import { getPendingComments } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const comments = await getPendingComments();
  return NextResponse.json(comments);
}
