import { NextRequest, NextResponse } from 'next/server';
import { savePushSubscription, deletePushSubscription } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 });
  }
  try {
    await savePushSubscription(body.endpoint, body.keys.p256dh, body.keys.auth);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.endpoint) {
    return NextResponse.json({ error: 'endpoint obrigatório' }, { status: 400 });
  }
  await deletePushSubscription(body.endpoint);
  return NextResponse.json({ success: true });
}
