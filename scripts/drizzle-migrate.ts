import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Drizzle migrations applied successfully.');
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error('Failed to apply Drizzle migrations:', error);
  process.exit(1);
});
