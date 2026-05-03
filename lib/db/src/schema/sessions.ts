import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companionSessionsTable = pgTable("companion_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  dialect: text("dialect").notNull().default("gulf"),
  emotionalProfile: jsonb("emotional_profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const insertSessionSchema = createInsertSchema(companionSessionsTable).omit({ sessionId: true, createdAt: true, lastActiveAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof companionSessionsTable.$inferSelect;
