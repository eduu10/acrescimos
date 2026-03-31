import { NextRequest, NextResponse } from 'next/server';
import { getTransferAlerts, updateTransferAlertStatus } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const alerts = await getTransferAlerts(status);
  return NextResponse.json(alerts);
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { id, status, article_id } = await request.json();
  if (!id || !status) return NextResponse.json({ error: 'id e status obrigatórios' }, { status: 400 });

  await updateTransferAlertStatus(Number(id), status, article_id);
  return NextResponse.json({ ok: true });
}
