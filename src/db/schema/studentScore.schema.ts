import { pgTable, uuid, boolean, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { StudentTakingClassForm } from "../schema";
import { ScoringComponent } from "./scoringComponent.schema";
import { relations } from "drizzle-orm";

export const StudentScore = pgTable("student_score", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentTakingClassFormId: uuid("student_taking_class_form_id")
        .notNull()
        .references(() => StudentTakingClassForm.id, { onDelete: "cascade" }),
    scoringComponentId: uuid("scoring_component_id")
        .notNull()
        .references(() => ScoringComponent.id, { onDelete: "cascade" }),
    isPublished: boolean("is_published").notNull().default(false),
    percentage: numeric("percentage", { precision: 10, scale: 2 })
        .notNull()
        .default("0.00")
}, (table) => [
    uniqueIndex("student_score_scoring_component_form_unique")
        .on(table.scoringComponentId, table.studentTakingClassFormId),
]);

export const studentScoreRelations = relations(StudentScore, ({ one }) => ({
    scoringComponent: one(ScoringComponent, {
        fields: [StudentScore.scoringComponentId],
        references: [ScoringComponent.id],
    }),
    studentTakingClassForm: one(StudentTakingClassForm, {
        fields: [StudentScore.studentTakingClassFormId],
        references: [StudentTakingClassForm.id],
    }),
}));