import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { imageData, fileName } = body as { imageData: string; fileName: string }

    if (!imageData || !imageData.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Dados de imagem inválidos' }, { status: 400 })
    }

    // Try Vercel Blob if available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob')
      const base64Data = imageData.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const contentType = imageData.split(';')[0].split(':')[1]

      const blob = await put(`articles/${Date.now()}-${fileName}`, buffer, {
        access: 'public',
        contentType,
      })
      return NextResponse.json({ url: blob.url })
    }

    // Try Imgur as free hosting fallback
    try {
      const base64Data = imageData.split(',')[1]
      const imgurRes = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID 546c25a59c58ad7',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Data, type: 'base64' }),
      })

      if (imgurRes.ok) {
        const imgurData = await imgurRes.json()
        if (imgurData.data?.link) {
          return NextResponse.json({ url: imgurData.data.link })
        }
      }
    } catch {
      // Imgur failed, continue to next fallback
    }

    // Last fallback: return the compressed data URL itself (small enough after client compression)
    return NextResponse.json({ url: imageData })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: `Erro no upload: ${message}` }, { status: 500 })
  }
}
