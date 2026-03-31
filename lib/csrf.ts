import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

export function generateCsrfToken(): string {
  return randomUUID()
}

export function setCsrfCookie(response: NextResponse, token: string): void {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

export function validateCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return false
  }

  return cookieToken === headerToken
}

export function csrfError(): NextResponse {
  return NextResponse.json(
    { error: 'Token CSRF inválido. Recarregue a página e tente novamente.' },
    { status: 403 }
  )
}
