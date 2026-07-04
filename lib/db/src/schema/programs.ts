import { text, uuid, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { apiSchema } from "./schemas";

export const programsTable = apiSchema.table("wellness_programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  durationDays: integer("duration_days").notNull(),
  category: text("category").notNull(),
  tier: text("tier").notNull().default("free"),
  active: boolean("active").notNull().default(true),
  enrolledCount: integer("enrolled_count").notNull().default(0),
  completionRate: real("completion_rate").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProgramSchema = createInsertSchema(programsTable).omit({ id: true, createdAt: true, enrolledCount: true, completionRate: true });
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programsTable.$inferSelect;
