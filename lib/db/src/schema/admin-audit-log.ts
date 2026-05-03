import { pgTable, text, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * admin_audit_log — append-only record of every admin action.
 * Per design doc §3.6.
 *
 * Per Decisions Log §2 refinement #2: REVOKE UPDATE, DELETE on this table
 * is applied in migration 0011 (M02). The application user cannot mutate
 * or delete rows once written; tampering requires DB-superuser access.
 *
 * actor_admin_id is nullable: system actions (e.g. seed CLI glass-break)
 * write actor=null with action prefix `super_admin.` and reason set.
 *
 * actor_email_snapshot + actor_role_snapshot are NOT NULL: they
 * denormalize the actor's identity at action time so log rows survive
 * admin deletion / role changes. For system actions, write the literal
 * 'system' / 'system' snapshots.
 *
 * For action='conversation.read', the writeAuditLog helper (3-A.3) refuses
 * to write the row if reason is missing or < 10 chars. This is enforced in
 * application code, not DB-level (since the helper composes the row).
 */
export const adminAuditLogTable = pgTable("admin_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  actorAdminId: uuid("actor_admin_id"),
  actorEmailSnapshot: text("actor_email_snapshot").notNull(),
  actorRoleSnapshot: text("actor_role_snapshot").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  reason: text("reason"),
  payloadBefore: jsonb("payload_before"),
  payloadAfter: jsonb("payload_after"),
  requestIp: text("request_ip"),
  requestUserAgent: text("request_user_agent"),
});

export type AdminAuditLogRow = typeof adminAuditLogTable.$inferSelect;
export type InsertAdminAuditLogRow = typeof adminAuditLogTable.$inferInsert;
