import { integer, pgTable, uuid, varchar, boolean } from "drizzle-orm/pg-core";


export const Subject = pgTable("subject", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    code: varchar("code").notNull().unique(),
    sks: integer("sks").notNull(),
    lecturer: varchar("lecturer").notNull(),
    isLectureHidden: boolean("is_lecture_hidden").notNull().default(true),
    semesterTaken: integer("semester_taken").notNull(),
});