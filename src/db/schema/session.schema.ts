import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { Users } from "./user.schema";

export const Session = pgTable("session", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    username: varchar("username").notNull(),

    refreshToken: varchar("refresh_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
});