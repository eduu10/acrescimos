import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))

  if (!query.trim()) {
    return NextResponse.json({ articles: [], total: 0 })
  }

  const result = await searchArticles(query, page, limit)
  return NextResponse.json(result)
}
