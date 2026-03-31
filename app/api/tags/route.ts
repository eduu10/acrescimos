import { NextRequest, NextResponse } from 'next/server';
import { getTags, createTag, getArticleTags, setArticleTags } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('article_id');

  if (articleId) {
    const tags = await getArticleTags(Number(articleId));
    return NextResponse.json(tags);
  }

  const tags = await getTags();
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { name, article_id, tag_ids } = body;

  // Set tags for an article
  if (article_id !== undefined && Array.isArray(tag_ids)) {
    await setArticleTags(Number(article_id), tag_ids.map(Number));
    return NextResponse.json({ success: true });
  }

  // Create a new tag
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  const tag = await createTag(name.trim());
  return NextResponse.json(tag, { status: 201 });
}
