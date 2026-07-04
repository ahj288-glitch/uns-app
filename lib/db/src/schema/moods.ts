import { text, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { privateSchema } from "./schemas";

export const moodsTable = privateSchema.table("mood_checkins", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  moodWord: text("mood_word").notNull(),
  moodWordArabic: text("mood_word_arabic"),
  intensity: integer("intensity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoodSchema = createInsertSchema(moodsTable).omit({ id: true, createdAt: true });
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moodsTable.$inferSelect;
