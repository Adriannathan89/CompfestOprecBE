import * as dotenv from 'dotenv';
import { Config } from 'drizzle-kit';

dotenv.config({ path: '.env' });

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",

    dbCredentials: {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT!),
        user: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
    },
} satisfies Config;