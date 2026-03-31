import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// Add search_vector column
await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS search_vector tsvector`;

// Create GIN index
await sql`CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(search_vector)`;

// Populate existing articles
await sql`
  UPDATE articles
  SET search_vector = to_tsvector('portuguese',
    coalesce(title, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(author, '') || ' ' ||
    coalesce(content, '')
  )
`;

// Create trigger function
await sql`
  CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
  BEGIN
    NEW.search_vector := to_tsvector('portuguese',
      coalesce(NEW.title, '') || ' ' ||
      coalesce(NEW.category, '') || ' ' ||
      coalesce(NEW.author, '') || ' ' ||
      coalesce(NEW.content, '')
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql
`;

// Create trigger
await sql`DROP TRIGGER IF EXISTS articles_search_vector_trigger ON articles`;
await sql`
  CREATE TRIGGER articles_search_vector_trigger
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update()
`;

console.log('✅ tsvector search migration done');
