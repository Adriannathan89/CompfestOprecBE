import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";

import { Session } from "./session.schema";
import { UserRole } from "./userRole.schema";

export const Users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username").notNull().unique(),
    password: varchar("password").notNull(),
    sksMaks: integer("sks_maks").notNull().default(24),
});

export const userRelations = relations(Users, ({ many }) => ({
    userRoles: many(UserRole),
    sessions: many(Session),
}));