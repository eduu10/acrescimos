import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  const { username, password } = await request.json();
  const valid = await verifyAdmin(username, password);
  if (valid) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    return response;
  }
  return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
