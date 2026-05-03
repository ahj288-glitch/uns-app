import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsersTable } from "./admin-users";

/**
 * feature_flags — server-evaluated runtime flags with rollout + killswitch.
 *
 * Per design doc §3.8: 9 columns. PK is `key` (text), no surrogate id and
 * no created_at. Only updated_at is tracked.
 *
 * `value` jsonb is the on/off source of truth (no separate `enabled` boolean).
 *   - For pure on/off flags: value = true (enabled) or false (disabled)
 *   - For typed flags: value carries the typed payload (number, string, object)
 *
 * `client_visible` (per §3.8): when true, the flag is included in the
 *   mobile boot `GET /flags` payload. Server-only flags stay false.
 *
 * `rollout_pct`: 0..100 — when value=true, the flag is enabled for a
 *   deterministic pct of users (hash on user_id). 100 = full rollout.
 *
 * `conditions_json` (per §3.8): optional shape like
 *   { roles: ['premium'], min_app_version: '2.0.0' } — see §10.4.
 *
 * `killswitch`: when true, bypasses cache (always re-fetched), super-admin-
 *   only to flip, audited with reason. Used for emergency disable. Keys end
 *   in `_killswitch` by convention.
 *
 * `updated_by_admin_id`: denormalized "who last touched this flag" for the
 *   admin UI flag-list page. Audit log still captures full mutation history.
 *
 * Seed flags added in migration 0017 (M07) — list in design doc §3.8 +
 *   admin_login_v2_enabled (NEW per 3-A.2 phase 1, default OFF until super-
 *   admin is seeded).
 */
export const featureFlagsTable = pgTable(
  "feature_flags",
  {
    key: text("key").primaryKey(),
    description: text("description").notNull(),
    value: jsonb("value").notNull().default(false),
    rolloutPct: integer("rollout_pct").notNull().default(100),
    clientVisible: boolean("client_visible").notNull().default(false),
    killswitch: boolean("killswitch").notNull().default(false),
    conditionsJson: jsonb("conditions_json"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedByAdminId: uuid("updated_by_admin_id").references(() => adminUsersTable.id),
  },
  (t) => [
    check(
      "feature_flags_rollout_pct_range_check",
      sql`${t.rolloutPct} >= 0 AND ${t.rolloutPct} <= 100`,
    ),
  ],
);

export type FeatureFlag = typeof featureFlagsTable.$inferSelect;
export type InsertFeatureFlag = typeof featureFlagsTable.$inferInsert;
