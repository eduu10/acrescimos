import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function migrateTags() {
  console.log('Creating tags table...');
  await sql`CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  console.log('Creating article_tags table...');
  await sql`CREATE TABLE IF NOT EXISTS article_tags (
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
  )`;

  console.log('Creating indexes...');
  await sql`CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id)`;

  console.log('Creating full-text search index...');
  await sql`CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(content, '')))`;

  console.log('Seeding default tags...');
  const defaultTags = [
    { name: 'Atlético-MG', slug: 'atletico-mg' },
    { name: 'Cruzeiro', slug: 'cruzeiro' },
    { name: 'América-MG', slug: 'america-mg' },
    { name: 'Série A', slug: 'serie-a' },
    { name: 'Série B', slug: 'serie-b' },
    { name: 'Seleção Brasileira', slug: 'selecao-brasileira' },
    { name: 'Champions League', slug: 'champions-league' },
    { name: 'Premier League', slug: 'premier-league' },
  ];

  for (const tag of defaultTags) {
    await sql`INSERT INTO tags (name, slug) VALUES (${tag.name}, ${tag.slug}) ON CONFLICT (slug) DO NOTHING`;
  }

  console.log('Migration complete!');
}

migrateTags().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
