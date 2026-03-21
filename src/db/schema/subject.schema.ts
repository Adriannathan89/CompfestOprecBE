// import { relations } from "drizzle-orm";
// import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

// import { Class } from "./class.schema";

// export const Subject = pgTable("subject", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: varchar("name").notNull(),
//   code: varchar("code").notNull().unique(),
//   sks: integer("sks").notNull(),
// });

// export const subjectRelations = relations(Subject, ({ many }) => ({
//   classes: many(Class),
// }));