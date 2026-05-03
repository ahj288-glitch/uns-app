import { pgTable, text, uuid, timestamp, integer, check, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { llmProvidersTable } from "./llm-providers";

/**
 * llm_provider_health — APPEND-ONLY event log per design doc §3.5.
 * One row per LLM call attempt (success or failure).
 *
 * Per Decisions Log 2026-05-03 changelog entry #2: this table is one half
 * of a 2-table split. The OTHER half is `llm_provider_circuit_state`
 * (1:1 fast-read snapshot for circuit-breaker decisions). Splitting them
 * keeps event-log forensics independent of breaker state mutation.
 *
 * outcome enum (per §3.5): success | timeout | network_error | http_5xx | http_4xx | circuit_open
 *
 * latency_ms: NULL on circuit_open (no actual call made)
 * http_status: only set for http_4xx / http_5xx outcomes
 * error_message: sanitized — no API keys, no user message bodies (enforce in writer)
 * session_id: the affected /companion/chat call, for forensics. NOT a FK
 *   (companion_sessions may be purged before this event log; we keep the
 *   id as text-of-uuid for soft linkage).
 *
 * Retention: rolling 30 days; nightly purge job deletes WHERE recorded_at < now() - interval '30 days'.
 *
 * RLS: read — admin+; write — server only (insert via internal service role).
 */
export const llmProviderHealthTable = pgTable(
  "llm_provider_health",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => llmProvidersTable.id, { onDelete: "cascade" }),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    outcome: text("outcome").notNull(),
    latencyMs: integer("latency_ms"),
    httpStatus: integer("http_status"),
    errorMessage: text("error_message"),
    sessionId: uuid("session_id"),
  },
  (t) => [
    check(
      "llm_provider_health_outcome_check",
      sql`${t.outcome} IN ('success', 'timeout', 'network_error', 'http_5xx', 'http_4xx', 'circuit_open')`,
    ),
    index("llm_provider_health_provider_recorded_idx").on(t.providerId, t.recordedAt.desc()),
    index("llm_provider_health_recorded_idx").on(t.recordedAt),
  ],
);

export type LlmProviderHealth = typeof llmProviderHealthTable.$inferSelect;
export type InsertLlmProviderHealth = typeof llmProviderHealthTable.$inferInsert;
