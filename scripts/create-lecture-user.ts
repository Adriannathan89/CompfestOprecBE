import 'dotenv/config';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { Users, Role, UserRole } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function createLectureUser() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const db = drizzle(pool);
    
    const username = 'dosen asep';
    const password = 'dosen123'; // Default password, should be changed later
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await db.insert(Users).values({
      username: username,
      password: hashedPassword,

    }).returning();
    
    if (!user || user.length === 0) {
      throw new Error('Failed to create user');
    }
    
    // Get LECTURE role
    const lectureRole = await db.select().from(Role).where(eq(Role.name, 'LECTURE')).limit(1);
    
    if (!lectureRole || lectureRole.length === 0) {
      throw new Error('LECTURE role not found. Please run add-roles.ts first.');
    }
    
    // Assign LECTURE role to user
    await db.insert(UserRole).values({
      userId: user[0].id,
      roleId: lectureRole[0].id,
    });
    
    console.log(`Lecture user created successfully.`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`User ID: ${user[0].id}`);
  } catch (error) {
    console.error('Failed to create lecture user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createLectureUser();
