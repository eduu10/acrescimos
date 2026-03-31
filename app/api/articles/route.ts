import { NextRequest, NextResponse } from 'next/server';
import { getArticles, countArticles, createArticle } from '@/lib/db';
import { sanitizeContent, sanitizeText } from '@/lib/sanitize';
import { postTweet, buildTweetText } from '@/lib/twitter';

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

  const safeTitle = sanitizeText(title).trim();
  const safeContent = sanitizeContent(content);
  const safeCaption = image_caption ? sanitizeText(image_caption) : '';

  const slug = safeTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const article = await createArticle({
    title: safeTitle, slug, content: safeContent,
    image: image || '',
    image_caption: safeCaption,
    category: category || 'Geral',
    author: sanitizeText(author || 'Redação Acréscimos'),
    published: published ?? true,
    featured: featured ?? false,
    scheduled_at: scheduled_at || null,
  });

  // Fire-and-forget: auto-post to X/Twitter if published
  if (published) {
    postTweet(buildTweetText(safeTitle, article.slug)).catch(() => {});
  }

  return NextResponse.json(article, { status: 201 });
}
