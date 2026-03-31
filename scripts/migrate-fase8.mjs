import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

// live_coverage
await sql`
  CREATE TABLE IF NOT EXISTS live_coverage (
    id SERIAL PRIMARY KEY,
    fixture_id INTEGER NOT NULL,
    minute INTEGER,
    event_type TEXT NOT NULL,
    team TEXT,
    player TEXT,
    detail TEXT,
    ai_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_live_coverage_fixture ON live_coverage (fixture_id, created_at DESC)`;
console.log('✅ live_coverage table created');

// transfer_alerts
await sql`
  CREATE TABLE IF NOT EXISTS transfer_alerts (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    player TEXT,
    from_club TEXT,
    to_club TEXT,
    status TEXT DEFAULT 'detected',
    article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_transfer_alerts_status ON transfer_alerts (status, detected_at DESC)`;
console.log('✅ transfer_alerts table created');
