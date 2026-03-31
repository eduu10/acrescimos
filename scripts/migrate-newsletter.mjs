import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Creating newsletter_subscribers table...');
  await sql`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  console.log('Creating index...');
  await sql`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email)`;

  console.log('Newsletter migration complete!');
}

migrate().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
