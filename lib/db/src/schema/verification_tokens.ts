import { text, uuid, timestamp } from "drizzle-orm/pg-core";
import { privateSchema } from "./schemas";
import { usersTable } from "./users";

export const verificationTokensTable = privateSchema.table("verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

export type VerificationToken = typeof verificationTokensTable.$inferSelect;
