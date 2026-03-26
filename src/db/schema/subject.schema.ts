import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { Class } from "./class.schema";
import { relations } from "drizzle-orm";


export const Subject = pgTable("subject", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    code: varchar("code").notNull().unique(),
    sks: integer("sks").notNull(),
    semesterTaken: integer("semester_taken").notNull(),
});

export const subjectRelations = relations(Subject, ({ many }) => ({
    classes: many(Class),
}));