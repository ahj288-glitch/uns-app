import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

/**
 * companion_sessions — chat session container.
 *
 * user_id (added 2026-05-03 via migration 0020 / M10): nullable FK to
 * users.id. Pre-existing sessions created before authenticated chat are
 * left with user_id=NULL. New sessions created post-auth populate it.
 * Tier enforcement (3-B.1) joins on this column to look up the user's
 * subscription. Privacy redaction (3-C.2) joins to look up consent.
 */
export const companionSessionsTable = pgTable("companion_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  dialect: text("dialect").notNull().default("gulf"),
  emotionalProfile: jsonb("emotional_profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const insertSessionSchema = createInsertSchema(companionSessionsTable).omit({ sessionId: true, createdAt: true, lastActiveAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof companionSessionsTable.$inferSelect;
