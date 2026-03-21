import { relations } from "drizzle-orm";
import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { Role } from "./role.schema";
import { Users } from "./user.schema";

export const UserRole = pgTable("user_role", {
    userId: uuid("user_id")
        .notNull()
        .references(() => Users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
        .notNull()
        .references(() => Role.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => [
    uniqueIndex("user_role_user_id_role_id_unique").on(table.userId, table.roleId),
]);

export const userRoleRelations = relations(UserRole, ({ one }) => ({
    user: one(Users, {
        fields: [UserRole.userId],
        references: [Users.id],
    }),
    role: one(Role, {
        fields: [UserRole.roleId],
        references: [Role.id],
    }),
}));