import { NextRequest, NextResponse } from 'next/server';
import { getAllPushSubscriptions } from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.title || !body?.body) {
    return NextResponse.json({ error: 'title e body são obrigatórios' }, { status: 400 });
  }

  const { title, body: bodyText, url = '/' } = body;

  const subscriptions = await getAllPushSubscriptions();
  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Nenhum assinante cadastrado' });
  }

  // Use web-push if VAPID keys are configured
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@acrescimos.com.br';

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'VAPID keys não configuradas. Adicione VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas env vars.' }, { status: 500 });
  }

  let webpush;
  try {
    webpush = await import('web-push');
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  } catch {
    return NextResponse.json({ error: 'Pacote web-push não instalado. Execute: npm install web-push' }, { status: 500 });
  }

  const payload = JSON.stringify({ title, body: bodyText, url });
  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth } },
          payload
        );
        sent++;
      } catch {
        failed++;
      }
    })
  );

  return NextResponse.json({ sent, failed, total: subscriptions.length });
}
