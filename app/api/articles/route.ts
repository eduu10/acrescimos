import { NextRequest, NextResponse } from 'next/server';
import { getArticles, createArticle } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  let articles = getArticles();

  if (published === 'true') articles = articles.filter(a => a.published);
  if (published === 'false') articles = articles.filter(a => !a.published);
  if (category) articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  if (featured === 'true') articles = articles.filter(a => a.featured);

  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { title, content, image, category, author, published, featured } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
  }

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const article = createArticle({
    title,
    slug,
    content,
    image: image || '/uploads/default.jpg',
    category: category || 'Geral',
    author: author || 'Redação Acréscimos',
    published: published ?? true,
    featured: featured ?? false,
  });

  return NextResponse.json(article, { status: 201 });
}
