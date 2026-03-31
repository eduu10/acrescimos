import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)`;
await sql`CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved)`;

console.log('Comments migration done.');
