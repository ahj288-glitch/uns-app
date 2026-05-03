import { pgTable, text, uuid, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { adminUsersTable } from "./admin-users";

/**
 * feedback — per design doc §3.7 (strict alignment per Decisions Log
 * 2026-05-03 audit Decision 4).
 *
 * Per Decisions Log §9: the user-side submission UI is OUT of scope for
 * BATCH 3. This table is populated by manual insert (debug) or, later,
 * by a mobile feedback form. The admin UI rebuilds in 3-E.1.
 *
 * category enum (NULLABLE — filled by user later via mobile form):
 *   bug | feature_request | content | other
 *
 * status enum: new | triaged | resolved | wont_fix
 *
 * Triage / resolution attribution kept as separate column pairs per §3.7
 * (allows distinct admins to triage vs resolve, with separate timestamps).
 *
 * user_id is nullable: anonymous feedback supported (e.g. pre-login crash).
 *
 * Removed extras (per Decision 4) that may return in a future migration if
 * product need surfaces: severity, screenshot_url, platform, updated_at,
 * assigned_admin_id (replaced by triaged_by/resolved_by pair).
 */
export const feedbackTable = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    category: text("category"),
    status: text("status").notNull().default("new"),
    adminNotes: text("admin_notes"),
    triagedByAdminId: uuid("triaged_by_admin_id").references(() => adminUsersTable.id, { onDelete: "set null" }),
    triagedAt: timestamp("triaged_at"),
    resolvedByAdminId: uuid("resolved_by_admin_id").references(() => adminUsersTable.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at"),
    appVersion: text("app_version"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    check(
      "feedback_category_check",
      sql`${t.category} IS NULL OR ${t.category} IN ('bug', 'feature_request', 'content', 'other')`,
    ),
    check(
      "feedback_status_check",
      sql`${t.status} IN ('new', 'triaged', 'resolved', 'wont_fix')`,
    ),
  ],
);

export type Feedback = typeof feedbackTable.$inferSelect;
export type InsertFeedback = typeof feedbackTable.$inferInsert;
