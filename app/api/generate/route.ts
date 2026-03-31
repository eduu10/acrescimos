import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createArticle, getSetting } from '@/lib/db'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const apiKey = await getSetting('xai_api_key')
    if (!apiKey) {
      return NextResponse.json({ error: 'Chave da API Grok não configurada.' }, { status: 400 })
    }

    const grok = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' })
    const body = await request.json()
    const { type } = body

    let prompt: string
    let category: string

    if (type === 'preview') {
      const { team1, team2, competition } = body
      if (!team1 || !team2) {
        return NextResponse.json({ error: 'Times são obrigatórios' }, { status: 400 })
      }

      category = competition || 'Brasileirão'
      prompt = `Escreva um artigo jornalístico de prévia do jogo ${team1} x ${team2} pelo ${competition || 'campeonato'}.

Inclua:
- Análise da forma recente dos dois times (invente dados realistas)
- Prováveis escalações (invente nomes realistas de jogadores brasileiros)
- Histórico de confrontos recentes (invente 3 últimos resultados)
- Seu palpite para o resultado com justificativa

O artigo deve ter pelo menos 5 parágrafos, tom jornalístico esportivo brasileiro.

Responda com JSON: {"title": "título do artigo", "content": "conteúdo com parágrafos separados por \\n\\n"}`

    } else if (type === 'roundup') {
      const { competition, round } = body
      category = competition || 'Brasileirão'
      prompt = `Escreva um artigo jornalístico de resumo da rodada ${round || 'atual'} do ${competition || 'Brasileirão'}.

Inclua:
- Resultados dos principais jogos da rodada (invente 5-6 resultados realistas)
- Destaques: goleadas, viradas dramáticas, jogos importantes
- Mudanças na classificação (líderes, zona de rebaixamento)
- Artilheiro da rodada e melhor jogador
- O que esperar da próxima rodada

O artigo deve ter pelo menos 6 parágrafos, tom jornalístico esportivo brasileiro.

Responda com JSON: {"title": "título do artigo", "content": "conteúdo com parágrafos separados por \\n\\n"}`

    } else {
      return NextResponse.json({ error: 'Tipo inválido. Use "preview" ou "roundup".' }, { status: 400 })
    }

    const completion = await grok.chat.completions.create({
      model: 'grok-3-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um jornalista esportivo brasileiro experiente. Crie artigos 100% originais com informações realistas. Responda SOMENTE com JSON válido, sem markdown.',
        },
        { role: 'user', content: prompt },
      ],
    })

    let responseText = completion.choices[0]?.message?.content || ''
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

    let generated: { title: string; content: string }
    try {
      generated = JSON.parse(responseText)
    } catch {
      return NextResponse.json({ error: 'Erro na geração. Tente novamente.' }, { status: 500 })
    }

    // Search for image
    let image = ''
    const pexelsKey = await getSetting('pexels_api_key')
    if (pexelsKey) {
      try {
        const searchTerms = generated.title.split(' ').slice(0, 4).join(' ')
        const pexelsRes = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerms + ' football soccer')}&per_page=1&orientation=landscape`,
          { headers: { Authorization: pexelsKey }, signal: AbortSignal.timeout(5000) }
        )
        if (pexelsRes.ok) {
          const data = await pexelsRes.json()
          image = data.photos?.[0]?.src?.large || ''
        }
      } catch { /* non-critical */ }
    }

    // Save as draft
    const slug = generated.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const article = await createArticle({
      title: generated.title,
      slug: `${slug}-${Date.now()}`,
      content: generated.content,
      image,
      category,
      author: 'IA Acréscimos',
      published: false,
      featured: false,
    })

    return NextResponse.json({
      article,
      message: 'Artigo gerado e salvo como rascunho.',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
