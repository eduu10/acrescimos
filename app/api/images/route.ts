import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const query = request.nextUrl.searchParams.get('q');
  if (!query) return NextResponse.json({ error: 'Parâmetro q obrigatório' }, { status: 400 });

  try {
    const pexelsKey = await getSetting('pexels_api_key');
    if (!pexelsKey) {
      return NextResponse.json({ error: 'Chave da API Pexels não configurada. Vá em Configurações.' }, { status: 400 });
    }

    // Search Pexels for sports images
    const searchQuery = `${query} sports`;
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=12&orientation=landscape`,
      {
        headers: { Authorization: pexelsKey },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao buscar imagens' }, { status: 502 });
    }

    const data = await res.json();
    const images = data.photos?.map((photo: { id: number; src: { large: string; medium: string; small: string }; alt: string; photographer: string }) => ({
      id: photo.id,
      url: photo.src.large,
      thumb: photo.src.medium,
      small: photo.src.small,
      alt: photo.alt || query,
      photographer: photo.photographer,
    })) || [];

    return NextResponse.json({ images });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
