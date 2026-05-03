import { pgTable, text, uuid, timestamp, integer, boolean, check, type AnyPgColumn } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * admin_users — backs the new email/password/TOTP login flow (3-A.2).
 * Per design doc §3.1 with two documented additions (per Decisions Log
 * 2026-05-03 changelog entry #3).
 *
 * Roles (4-tier RBAC per design doc §2.4):
 *   - super_admin: full access, can manage other admins, unlimited tier overrides
 *   - admin: most operations, 90-day max tier override
 *   - support: conversation review (with consent), feedback triage, no config
 *   - read_only: dashboards + audit log only
 *
 * password_hash: argon2id (OWASP 2023 baseline)
 * totp_secret_encrypted: AES-256-GCM ciphertext of base32 secret; null until enrolled
 * recovery_codes_hash: text[] of argon2id-hashed 10 single-use codes
 *   (consumed codes are deleted from the array on use). Nullable per §3.1.
 * created_by_admin_id: FK self-ref, null only for the seed super-admin.
 * disabled_at: soft-disable; non-null ⇒ cannot log in.
 *
 * Additions vs design §3.1 (documented in Decisions Log 2026-05-03):
 *   - hibp_breach_flagged: set true if password matched HIBP at set-time;
 *     forces password change on next login (does not block immediately).
 *   - updated_at: standard hygiene, used by audit log diff serialization.
 */
export const adminUsersTable = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(),
    totpSecretEncrypted: text("totp_secret_encrypted"),
    totpEnrolledAt: timestamp("totp_enrolled_at"),
    recoveryCodesHash: text("recovery_codes_hash").array(),
    failedLoginCount: integer("failed_login_count").notNull().default(0),
    lockedUntil: timestamp("locked_until"),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdByAdminId: uuid("created_by_admin_id").references((): AnyPgColumn => adminUsersTable.id, { onDelete: "set null" }),
    disabledAt: timestamp("disabled_at"),
    hibpBreachFlagged: boolean("hibp_breach_flagged").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    check(
      "admin_users_role_check",
      sql`${t.role} IN ('super_admin', 'admin', 'support', 'read_only')`,
    ),
  ],
);

export type AdminUser = typeof adminUsersTable.$inferSelect;
export type InsertAdminUser = typeof adminUsersTable.$inferInsert;
