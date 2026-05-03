import { pgTable, text, uuid, timestamp, integer, bigint, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { llmProvidersTable } from "./llm-providers";

/**
 * llm_provider_circuit_state — fast-read circuit-breaker state snapshot
 * (NEW table per Decisions Log 2026-05-03 changelog entry #2). One row
 * per llm_providers.id (1:1, provider_id is PK).
 *
 * Companion to llm_provider_health (the append-only event log per §3.5).
 * Splitting them avoids scanning the event log on every gateway call to
 * decide whether the breaker is open/closed/half_open.
 *
 * breaker_state: 'closed' (healthy) | 'open' (failing, requests skipped) |
 *   'half_open' (probing one request to see if service recovered)
 *
 * Threshold per design §6: 5 failures within 60 seconds opens the breaker,
 * stays open for 5 minutes, then transitions to half_open. One success in
 * half_open closes it; one failure reopens it for another 5 minutes.
 *
 * Counters are best-effort, updated by the failover wrapper on each call.
 * A periodic compaction job may zero them; this table is observability,
 * not the source of billing truth.
 *
 * Updated by the failover/breaker logic in mini-batch 3-B.2.
 */
export const llmProviderCircuitStateTable = pgTable(
  "llm_provider_circuit_state",
  {
    providerId: uuid("provider_id")
      .primaryKey()
      .references(() => llmProvidersTable.id, { onDelete: "cascade" }),
    breakerState: text("breaker_state").notNull().default("closed"),
    consecutiveFailures: integer("consecutive_failures").notNull().default(0),
    lastFailureAt: timestamp("last_failure_at"),
    openedAt: timestamp("opened_at"),
    lastSuccessAt: timestamp("last_success_at"),
    totalRequests: bigint("total_requests", { mode: "number" }).notNull().default(0),
    totalFailures: bigint("total_failures", { mode: "number" }).notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    check(
      "llm_provider_circuit_state_breaker_state_check",
      sql`${t.breakerState} IN ('closed', 'open', 'half_open')`,
    ),
  ],
);

export type LlmProviderCircuitState = typeof llmProviderCircuitStateTable.$inferSelect;
export type InsertLlmProviderCircuitState = typeof llmProviderCircuitStateTable.$inferInsert;
