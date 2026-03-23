import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";

import { Session } from "./session.schema";
import { StudentTakingClassForm } from "./studentTakingClassForm.schema";
import { UserRole } from "./userRole.schema";

export const Users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username").notNull().unique(),
    password: varchar("password").notNull(),
    currentSKS: integer("current_sks").notNull().default(0),
});

export const userRelations = relations(Users, ({ many }) => ({
    userRoles: many(UserRole),
    sessions: many(Session),
    studentTakingClassForms: many(StudentTakingClassForm),
}));