import { pgTable, uuid, varchar, boolean, integer  } from "drizzle-orm/pg-core";
import { Subject } from "./subject.schema";
import { Schedule } from "./schedule.schema";
import { relations } from "drizzle-orm";

export const Class = pgTable("class_session", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),

    subjectId: uuid("subject_id")
        .notNull()
        .references(() => Subject.id),

    lecturerName: varchar("lecturer_name").notNull(),
    isHiddenLecturer: boolean("is_hidden_lecturer").notNull().default(false),
    classCapacity: integer("class_capacity").notNull(),
});

export const classRelations = relations(Class, ({ many, one }) => ({
    subject: one(Subject, {
        fields: [Class.subjectId],
        references: [Subject.id],
    }),
    schedules: many(Schedule),
}));