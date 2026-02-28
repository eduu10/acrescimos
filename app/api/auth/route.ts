import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const adminPath = path.join(process.cwd(), 'data', 'admin.json');
  const admin = JSON.parse(fs.readFileSync(adminPath, 'utf-8'));

  if (username === admin.username && password === admin.password) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24h
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
