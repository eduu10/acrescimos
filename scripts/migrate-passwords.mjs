import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const BCRYPT_SALT_ROUNDS = 12;

async function migratePasswords() {
  console.log('Fetching admin users...');
  const users = await sql`SELECT id, username, password FROM admin_users`;

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    const isBcrypt = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (isBcrypt) {
      console.log(`  [SKIP] ${user.username} — already hashed`);
      skipped++;
      continue;
    }

    console.log(`  [MIGRATING] ${user.username}...`);
    const hash = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
    await sql`UPDATE admin_users SET password = ${hash} WHERE id = ${user.id}`;
    console.log(`  [DONE] ${user.username} — password hashed`);
    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
}

migratePasswords().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
