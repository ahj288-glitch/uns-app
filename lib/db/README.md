# @workspace/db

Drizzle ORM schemas and SQL migrations for أُنس.

## Hybrid workflow (decided 2026-05-03 for BATCH 3)

Two artefacts coexist in this package:

1. **`src/schema/*.ts`** — Drizzle TypeScript schemas. Source of truth
   for the application's typed query layer. Day-to-day dev DB sync uses
   `pnpm db:push`, which diffs the live DB against these files and
   applies the delta declaratively.

2. **`migrations/*.sql`** — hand-authored SQL migration files. These
   exist for three reasons:
   - **Audit trail.** BATCH 4 security review wants an explicit, ordered,
     human-readable record of every schema change.
   - **SQL features Drizzle cannot express.** `REVOKE UPDATE, DELETE`,
     multi-column `CHECK` constraints, partial indexes with non-trivial
     predicates, comment annotations, etc.
   - **Production deploys.** In production we apply schema changes via
     `psql $DATABASE_URL -f migrations/<file>.sql` in a documented
     runbook step, NOT via drizzle-kit. This makes every prod schema
     change reviewable and reversible from a single SQL file.

### Day-to-day flow

```bash
# 1. Edit lib/db/src/schema/<table>.ts
# 2. Sync dev DB
pnpm --filter @workspace/db run push
# 3. Hand-author the corresponding SQL migration
#    lib/db/migrations/NNNN_<name>.sql
# 4. (For non-trivial changes) sanity-check the SQL applies cleanly
#    against a fresh DB
```

The Drizzle file and the SQL file MUST agree. If they diverge, the
SQL file wins for production purposes; fix the Drizzle file to match.

### Migration numbering

Migrations are zero-padded and monotonic:
- `0001_*.sql` … `0009_*.sql` — pre-BATCH-3 schema (legacy; reconstructed
  if needed)
- `0010_*.sql` onwards — BATCH 3 admin panel foundation

Never renumber an existing migration. Append only.

## Scripts

- `pnpm push` — `drizzle-kit push` against `DATABASE_URL`
- `pnpm push-force` — same with `--force` (DESTRUCTIVE; manual review only)
