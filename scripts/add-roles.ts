import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Role } from '../src/db/schema';

async function addRoles() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const db = drizzle(pool);
    
    const roles = ['LECTURE', 'STUDENT', 'ADMIN'];
    
    for (const roleName of roles) {
      await db.insert(Role).values({
        name: roleName,
      }).onConflictDoNothing();
    }
    
    console.log('Roles added successfully.');
  } catch (error) {
    console.error('Failed to add roles:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addRoles();
