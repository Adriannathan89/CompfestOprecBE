import { pgTable, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { Users } from "./user.schema";
import { Class } from "../schema";

export const StudentTakingClassForm = pgTable("student_taking_class_form", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: uuid("student_id")
        .notNull()
        .references(() => Users.id),
    classId: uuid("class_id")
        .notNull()
        .references(() => Class.id),
    takingPosition: integer("taking_position").notNull(),
    isApproved: boolean("is_approved").notNull().default(false)
});

export const studentTakingClassFormRelations = relations(StudentTakingClassForm, ({ one }) => ({
    student: one(Users, {
        fields: [StudentTakingClassForm.studentId],
        references: [Users.id],
    }),
    class: one(Class, {
        fields: [StudentTakingClassForm.classId],
        references: [Class.id],
    }),
}));