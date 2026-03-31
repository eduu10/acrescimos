import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Adding scheduled_at column to articles...');
  await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON articles (scheduled_at) WHERE scheduled_at IS NOT NULL`;
  console.log('Migration complete!');
}

migrate().catch(err => { console.error(err); process.exit(1); });
