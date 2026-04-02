import { pgTable, uuid, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { Users } from "./user.schema";
import { Class } from "../schema";
import { StudentScore } from "./studentScore.schema";

export const StudentTakingClassForm = pgTable("student_taking_class_form", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
        .notNull()
        .references(() => Users.id),
    classId: uuid("class_id")
        .notNull()
        .references(() => Class.id),
    createdAt: timestamp("created_at").notNull().default(new Date()),
    takingPosition: integer("taking_position").notNull(),
    isFinalized: boolean("is_finalized").notNull().default(false)
});

export const studentTakingClassFormRelations = relations(StudentTakingClassForm, ({ one, many }) => ({
    student: one(Users, {
        fields: [StudentTakingClassForm.studentId],
        references: [Users.id],
    }),
    class: one(Class, {
        fields: [StudentTakingClassForm.classId],
        references: [Class.id],
    }),
    studentScores: many(StudentScore),
}));