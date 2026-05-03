import { pgTable, text, uuid, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";
import { subscriptionTiersTable } from "./subscription-tiers";
import { adminUsersTable } from "./admin-users";

/**
 * user_subscriptions — per design doc §3.3.
 *
 * status enum (5 values per §3.3): trial | active | grace_period | expired | cancelled
 * external_provider enum (per Decisions Log §3 Change 2): apple_iap | google_play | stripe | tap | manual_override
 *
 * `override_admin_id` (renamed from `override_set_by_admin_id` to match §3.3):
 *   non-null ⇒ this is a manual grant; FK admin_users.id.
 * `override_reason`: required when override_admin_id non-null (enforced in app code).
 *
 * Addition vs §3.3: `override_expires_at` (kept per audit decision).
 *   Declarative enforcement of Q11 cap: 90 days max for `admin` role,
 *   unlimited (NULL) for `super_admin`. Server-side validator in 3-B.1.
 *
 * Constraints (created in M04 SQL migration):
 *   - partial unique index (user_id) WHERE status IN ('trial','active','grace_period')
 *     — at most one "live" subscription per user.
 *   - partial unique index (external_provider, external_subscription_id)
 *     WHERE external_subscription_id IS NOT NULL — webhook idempotency.
 */
export const userSubscriptionsTable = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tierId: uuid("tier_id")
      .notNull()
      .references(() => subscriptionTiersTable.id),
    status: text("status").notNull(),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelledAt: timestamp("cancelled_at"),
    externalProvider: text("external_provider"),
    externalSubscriptionId: text("external_subscription_id"),
    overrideAdminId: uuid("override_admin_id").references(() => adminUsersTable.id),
    overrideReason: text("override_reason"),
    overrideExpiresAt: timestamp("override_expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    check(
      "user_subscriptions_status_check",
      sql`${t.status} IN ('trial', 'active', 'grace_period', 'expired', 'cancelled')`,
    ),
    check(
      "user_subscriptions_provider_check",
      sql`${t.externalProvider} IS NULL OR ${t.externalProvider} IN ('apple_iap', 'google_play', 'stripe', 'tap', 'manual_override')`,
    ),
  ],
);

export type UserSubscription = typeof userSubscriptionsTable.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptionsTable.$inferInsert;
