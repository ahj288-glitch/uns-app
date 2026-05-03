import { pgTable, text, uuid, timestamp, integer, primaryKey, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { subscriptionTiersTable } from "./subscription-tiers";

/**
 * subscription_tier_prices — multi-currency pricing per Decisions Log §3
 * Change 1. Prices NULL until product team decides values; schema is ready.
 *
 * Currency: 'SAR' or 'USD' (extend list via migration when needed).
 * Billing period: 'month' or 'year'.
 * price_minor_units: integer in smallest currency unit (halalas for SAR,
 * cents for USD). MUST be > 0.
 *
 * Pricing history preserved via effective_from / effective_until.
 * The current active price for a (tier, currency, period) tuple is the row
 * where effective_until IS NULL. Partial index supports that lookup.
 *
 * To change a price: insert a new row with effective_from=now(), and
 * UPDATE the previous active row to set effective_until=now() (in the
 * same transaction).
 */
export const subscriptionTierPricesTable = pgTable(
  "subscription_tier_prices",
  {
    tierId: uuid("tier_id")
      .notNull()
      .references(() => subscriptionTiersTable.id, { onDelete: "cascade" }),
    currency: text("currency").notNull(),
    billingPeriod: text("billing_period").notNull(),
    priceMinorUnits: integer("price_minor_units").notNull(),
    effectiveFrom: timestamp("effective_from").notNull().defaultNow(),
    effectiveUntil: timestamp("effective_until"),
  },
  (t) => [
    primaryKey({ columns: [t.tierId, t.currency, t.billingPeriod, t.effectiveFrom] }),
    index("subscription_tier_prices_active_idx")
      .on(t.tierId, t.currency, t.billingPeriod)
      .where(sql`${t.effectiveUntil} IS NULL`),
    check("subscription_tier_prices_currency_check", sql`${t.currency} IN ('SAR', 'USD')`),
    check(
      "subscription_tier_prices_billing_period_check",
      sql`${t.billingPeriod} IN ('month', 'year')`,
    ),
    check("subscription_tier_prices_price_positive_check", sql`${t.priceMinorUnits} > 0`),
  ],
);

export type SubscriptionTierPrice = typeof subscriptionTierPricesTable.$inferSelect;
export type InsertSubscriptionTierPrice = typeof subscriptionTierPricesTable.$inferInsert;
