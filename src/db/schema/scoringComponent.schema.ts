import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { Class } from "./class.schema";

export const ScoringComponent = pgTable("scoring_component", {
    id: uuid("id").primaryKey().defaultRandom(),
    classId: uuid("class_id")
        .notNull()
        .references(() => Class.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    weight: integer("weight").notNull(),
});