import { pgTable, text, uuid, timestamp, numeric, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { companionSessionsTable } from "./sessions";
import { messagesTable } from "./messages";
import { usersTable } from "./users";
import { adminUsersTable } from "./admin-users";

/**
 * crisis_flags — per design doc §3.10 state machine + Decisions Log
 * additions (Q5 Tier 2 classifier columns + §2 refinement #1 message_excerpt).
 *
 * detector enum (per §3.10): keyword_v1 | keyword_v2 | classifier_v1
 *   - keyword_v1: original keyword list (legacy / fallback)
 *   - keyword_v2: per-dialect expanded keyword match with negation
 *     handling (gulf/levant/egyptian/msa/maghrebi)
 *   - classifier_v1: Tier 2 Groq classifier (per Q5)
 *
 * severity enum (per §3.10): low | medium | high | immediate
 *   Tier 1 keywords issue low/medium. Tier 2 classifier may bump to high
 *   or immediate. Until Tier 2 ships, severity above medium only via
 *   super_admin override (audited).
 *
 * state machine (per §3.10):
 *   new → under_review (admin opens; opened_by_admin_id + opened_at set)
 *   under_review → action_taken (action_taken_text required, non-empty;
 *                                 resolved_by_admin_id + resolved_at set)
 *   under_review → dismissed_false_positive (dismissal_reason ≥10 chars
 *                                             required; resolved_by_admin_id
 *                                             + resolved_at set)
 *   Re-open from terminal state: NOT allowed in v1 (use audit log note).
 *
 * Tier 2 classifier columns (KEPT per Decisions Log Q5; not in design §3.10
 * because Tier 2 was added to BATCH 3 after design freeze):
 *   - tier2_classifier_score: numeric — model confidence
 *   - tier2_classifier_label: text — model's severity label (cross-checked vs `severity`)
 *
 * message_excerpt (KEPT per Decisions Log §2 refinement #1, REQUIRED):
 *   200-character window centered on trigger keywords. Full message body
 *   requires admin to navigate to /conversations/:sessionId (audit-gated).
 *
 * matched_terms is text[] NULLABLE per §3.10 (NULL when detector=classifier_v1
 * and no keyword match; explainability stored in tier2_classifier_label).
 */
export const crisisFlagsTable = pgTable(
  "crisis_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => companionSessionsTable.sessionId, { onDelete: "cascade" }),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messagesTable.id, { onDelete: "cascade" }),
    detector: text("detector").notNull(),
    matchedTerms: text("matched_terms").array(),
    severity: text("severity").notNull(),
    state: text("state").notNull().default("new"),
    openedByAdminId: uuid("opened_by_admin_id").references(() => adminUsersTable.id, { onDelete: "set null" }),
    openedAt: timestamp("opened_at"),
    resolvedByAdminId: uuid("resolved_by_admin_id").references(() => adminUsersTable.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    actionTakenText: text("action_taken_text"),
    dismissalReason: text("dismissal_reason"),
    tier2ClassifierScore: numeric("tier2_classifier_score"),
    tier2ClassifierLabel: text("tier2_classifier_label"),
    messageExcerpt: text("message_excerpt").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    check(
      "crisis_flags_detector_check",
      sql`${t.detector} IN ('keyword_v1', 'keyword_v2', 'classifier_v1')`,
    ),
    check(
      "crisis_flags_severity_check",
      sql`${t.severity} IN ('low', 'medium', 'high', 'immediate')`,
    ),
    check(
      "crisis_flags_state_check",
      sql`${t.state} IN ('new', 'under_review', 'action_taken', 'dismissed_false_positive')`,
    ),
    check(
      "crisis_flags_tier2_label_check",
      sql`${t.tier2ClassifierLabel} IS NULL OR ${t.tier2ClassifierLabel} IN ('low', 'medium', 'high', 'immediate')`,
    ),
  ],
);

export type CrisisFlag = typeof crisisFlagsTable.$inferSelect;
export type InsertCrisisFlag = typeof crisisFlagsTable.$inferInsert;
