import { pgTable, text, uuid, timestamp, integer, boolean, jsonb, real, customType, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { adminUsersTable } from "./admin-users";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/**
 * llm_providers — per design doc §3.4 with two documented deviations
 * (Decisions Log 2026-05-03 changelog entries #1 and #3).
 *
 * adapter_kind enum (per §3.4): groq | openai_compatible | anthropic
 *   (`anthropic` adapter implementation lands later; enum value is reserved.)
 *
 * Crypto envelope (Decisions Log #1 — overrides §3.4):
 *   §3.4 specifies a single api_key_encrypted text column (base64 of
 *   nonce+ciphertext+tag). Implementation uses 3 separate bytea columns
 *   for storage efficiency (33% savings vs base64 text) and conceptual
 *   clarity (ciphertext, nonce, auth_tag are independent crypto primitives,
 *   bytea is the native PG binary type with no encode/decode overhead):
 *     - api_key_ciphertext: bytea — encrypted bytes
 *     - api_key_nonce: bytea — 12-byte AES-GCM nonce, unique per record
 *     - api_key_auth_tag: bytea — 16-byte AES-GCM auth tag
 *   AES-256-GCM encryption itself is unchanged from §3.4.
 *
 * Master encryption key: ADMIN_ENCRYPTION_KEY env var (32 bytes,
 * base64-encoded). Server refuses to boot if missing or wrong length
 * (validated in 3-B.2).
 *
 * priority: lower number = higher preference in failover chain. Two
 *   providers may share priority (round-robin tiebreak).
 *
 * Addition vs §3.4 (Decisions Log #3): `config_json` jsonb — adapter-
 *   specific settings (custom headers, organization IDs, region overrides).
 *   Avoids per-adapter schema migrations.
 */
export const llmProvidersTable = pgTable(
  "llm_providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    adapterKind: text("adapter_kind").notNull(),
    baseUrl: text("base_url"),
    model: text("model").notNull(),
    apiKeyCiphertext: bytea("api_key_ciphertext").notNull(),
    apiKeyNonce: bytea("api_key_nonce").notNull(),
    apiKeyAuthTag: bytea("api_key_auth_tag").notNull(),
    maxTokens: integer("max_tokens").notNull().default(1024),
    temperature: real("temperature").notNull().default(0.7),
    priority: integer("priority").notNull().default(100),
    enabled: boolean("enabled").notNull().default(true),
    configJson: jsonb("config_json"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdByAdminId: uuid("created_by_admin_id").references(() => adminUsersTable.id, { onDelete: "set null" }),
  },
  (t) => [
    check(
      "llm_providers_adapter_kind_check",
      sql`${t.adapterKind} IN ('groq', 'openai_compatible', 'anthropic')`,
    ),
  ],
);

export type LlmProvider = typeof llmProvidersTable.$inferSelect;
export type InsertLlmProvider = typeof llmProvidersTable.$inferInsert;
