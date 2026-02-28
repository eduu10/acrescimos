import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '@/lib/db';

export async function GET() {
  const settings = await getAllSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  for (const [key, value] of Object.entries(body)) {
    await setSetting(key, value as string);
  }
  return NextResponse.json({ success: true });
}
