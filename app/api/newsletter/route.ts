import { NextRequest, NextResponse } from 'next/server'
import { subscribeNewsletter } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    const result = await subscribeNewsletter(email.toLowerCase().trim())

    if (result.success) {
      return NextResponse.json({ message: result.message })
    }
    return NextResponse.json({ message: result.message }, { status: 409 })
  } catch {
    return NextResponse.json({ error: 'Erro ao processar inscrição' }, { status: 500 })
  }
}
