import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { UserRole } from "./userRole.schema";

export const Role = pgTable("role", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roleRelations = relations(Role, ({ many }) => ({
  userRoles: many(UserRole),
}));

export const RoleName = {
  ADMIN: "ADMIN",
  LECTURE: "LECTURE",
  STUDENT: "STUDENT",
};