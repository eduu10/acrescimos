import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Redirect acrescimos.com (and www) to acrescimos.com.br
  if (host === 'acrescimos.com' || host === 'www.acrescimos.com') {
    const url = new URL(request.url);
    url.hostname = 'acrescimos.com.br';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // Redirect www.acrescimos.com.br to acrescimos.com.br
  if (host === 'www.acrescimos.com.br') {
    const url = new URL(request.url);
    url.hostname = 'acrescimos.com.br';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  // Protect /admin/* sub-routes (not /admin itself — that renders the login UI)
  const isAdminSubRoute = pathname.startsWith('/admin/');
  if (isAdminSubRoute) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
