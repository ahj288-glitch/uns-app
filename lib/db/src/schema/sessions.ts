import { text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { privateSchema } from "./schemas";
import { usersTable } from "./users";

export const companionSessionsTable = privateSchema.table("companion_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  // userId links a session to a registered user (nullable for anonymous sessions).
  // FK with ON DELETE CASCADE — deleting a user removes their sessions (and, via
  // downstream cascades, the data hanging off them).
  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  dialect: text("dialect").notNull().default("gulf"),
  emotionalProfile: jsonb("emotional_profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

export const insertSessionSchema = createInsertSchema(companionSessionsTable).omit({ sessionId: true, createdAt: true, lastActiveAt: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof companionSessionsTable.$inferSelect;
