import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { Class } from "./class.schema";

export const Schedule = pgTable("schedule", {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id")
        .notNull()
        .references(() => Class.id, { onDelete: "cascade" }),
    classroom: varchar("classroom").notNull(), 
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: varchar("start_time").notNull(),
    endTime: varchar("end_time").notNull(),
});

export const scheduleRelations = relations(Schedule, ({ one }) => ({
    class: one(Class, {
        fields: [Schedule.classId],
        references: [Class.id],
    }),
}));