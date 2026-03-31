import { NextRequest, NextResponse } from 'next/server';
import { getArticles, countArticles, createArticle } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const withCount = searchParams.get('count') === 'true';

  const filters: { published?: boolean; category?: string; featured?: boolean; limit?: number; offset?: number } = {};
  if (published === 'true') filters.published = true;
  if (published === 'false') filters.published = false;
  if (category) filters.category = category;
  if (featured === 'true') filters.featured = true;
  if (limitParam) filters.limit = parseInt(limitParam, 10);
  if (offsetParam) filters.offset = parseInt(offsetParam, 10);

  const articles = await getArticles(Object.keys(filters).length > 0 ? filters : undefined);

  if (withCount) {
    const total = await countArticles({ published: filters.published, category: filters.category });
    return NextResponse.json({ articles, total });
  }

  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { title, content, image, image_caption, category, author, published, featured, scheduled_at } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
  }

  const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const article = await createArticle({
    title, slug, content,
    image: image || '',
    image_caption: image_caption || '',
    category: category || 'Geral',
    author: author || 'Redação Acréscimos',
    published: published ?? true,
    featured: featured ?? false,
    scheduled_at: scheduled_at || null,
  });

  return NextResponse.json(article, { status: 201 });
}
