import { pgTable, text, uuid, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

/**
 * subscription_tiers — per design doc §3.2, with prices removed per
 * Decisions Log §3 Change 1 (multi-currency moved to subscription_tier_prices).
 *
 * Tier limits + features are stored as jsonb for flexibility. Shape is
 * enforced server-side via Zod schemas (LimitsZod / FeaturesZod) when the
 * tier enforcement middleware lands in mini-batch 3-B.1.
 *
 * Canonical limits_json shape (per design doc §7.1):
 *   {
 *     "daily_message_limit": number,        // e.g. 30 (free) | 300 (premium)
 *     "max_chars_per_message": number,      // e.g. 2000 (free) | 8000 (premium)
 *     "mood_checkins_per_day": number,      // e.g. 5 (free) | 30 (premium)
 *     "breathing_sessions_per_day": number, // e.g. 10 (free) | 100 (premium)
 *     "history_retention_days": number      // e.g. 30 (free) | 730 (premium, per Q9 — 24 months, NOT 365)
 *   }
 *
 * Canonical features_json shape (per design doc §7.1):
 *   {
 *     "programs_access": boolean,           // true on premium only
 *     "voice_input": boolean,               // gated by feature flag too
 *     "advanced_emotional_profile": boolean // premium only
 *     // … extensible per product roadmap
 *   }
 *
 * Seed rows (added in migration M03):
 *   key='free'             — 30 msg/day, 2000 chars, 5 mood, 10 breath, 30d retention
 *   key='premium_monthly'  — 300 msg/day, 8000 chars, 30 mood, 100 breath, 730d retention
 *   key='premium_yearly'   — same limits as premium_monthly
 *
 * Pricing for each tier lives in subscription_tier_prices (per-currency).
 *
 * `active=false` ⇒ no new subscriptions allowed (existing users stay on tier).
 * `sort_order` ASC drives tier-comparison UI ordering.
 */
export const subscriptionTiersTable = pgTable("subscription_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  limitsJson: jsonb("limits_json").notNull().default({}),
  featuresJson: jsonb("features_json").notNull().default({}),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SubscriptionTier = typeof subscriptionTiersTable.$inferSelect;
export type InsertSubscriptionTier = typeof subscriptionTiersTable.$inferInsert;
