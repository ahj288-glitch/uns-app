import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * conversation_review_consent — per design doc §3.9.
 * Per-user opt-in flag for admin review of non-crisis conversations.
 * Per Q6: default OFF, opt-in mandatory.
 *
 * One row per user (PK on user_id). Insert on first toggle; update on
 * subsequent toggles. Revocation sets revoked_at and granted=false.
 *
 * Effective consent rule (server-side, enforced in app code):
 *   granted == true
 *   AND granted_at IS NOT NULL
 *   AND (revoked_at IS NULL OR revoked_at < granted_at)
 *
 * consent_text_version: hash or version of the consent disclosure shown
 * to user. Set by app on each consent transaction (no schema default;
 * stale defaults would mask copy changes that should require re-consent).
 *
 * H6 reminder: crisis-flagged messages can be reviewed regardless of this
 * flag. The crisis flag itself is the lawful basis for review.
 */
export const conversationReviewConsentTable = pgTable("conversation_review_consent", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  granted: boolean("granted").notNull().default(false),
  grantedAt: timestamp("granted_at"),
  revokedAt: timestamp("revoked_at"),
  consentTextVersion: text("consent_text_version"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ConversationReviewConsent = typeof conversationReviewConsentTable.$inferSelect;
export type InsertConversationReviewConsent = typeof conversationReviewConsentTable.$inferInsert;
