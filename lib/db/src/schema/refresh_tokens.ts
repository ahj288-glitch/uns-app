import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

/**
 * Persisted refresh token store for server-side revocation.
 *
 * We store a SHA-256 hash of the JWT refresh token (never the raw token).
 * On logout the row is soft-deleted via revokedAt. On POST /auth/refresh
 * we verify the hash exists and revokedAt IS NULL before issuing a new
 * access token — preventing reuse of stolen/revoked tokens.
 */
export const refreshTokensTable = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  // The companion session this token grants access to.
  sessionId: uuid("session_id").notNull(),
  // SHA-256 hex digest of the raw JWT string. Never store the raw token.
  tokenHash: text("token_hash").notNull().unique(),
  // Mirror of the JWT exp claim, stored for fast expiry sweeps.
  expiresAt: timestamp("expires_at").notNull(),
  // Set when the token is explicitly revoked (logout / token rotation).
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RefreshToken = typeof refreshTokensTable.$inferSelect;
