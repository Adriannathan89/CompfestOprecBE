import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const DRIZZLE = "DRIZZLE";
export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

export const DrizzleProvider = {
  provide: DRIZZLE,
  useFactory: async () => {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    return drizzle(pool, { schema });
  },
};