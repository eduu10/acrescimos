import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_caption TEXT DEFAULT ''`;

console.log('image_caption migration done.');
