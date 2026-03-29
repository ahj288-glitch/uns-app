# Rollback Plan

Last updated: 2026-03-27

This document defines what operators should do if a production deployment causes auth or session failures. It is intentionally short and operational.

---

## What can be rolled back safely

### api-server binary
Rolling back the api-server to the previous build is safe at any time. The database changes are additive (see below) — old code does not reference `refresh_tokens` and ignores `user_id` on `companion_sessions`.

### uns-admin build
Rolling back the admin SPA is safe at any time. No schema dependency.

---

## Database migration — do NOT roll back automatically

The migration added two things:
1. `refresh_tokens` table (new)
2. `user_id uuid` column on `companion_sessions` (nullable)

**Rolling back the api-server does not require rolling back the migration.** Old code doesn't reference these additions. They are harmless orphans if the old server runs.

If you must undo the migration (e.g., the column causes issues), do it manually:

```sql
-- Only if absolutely necessary. Read all cautions below first.
DROP TABLE IF EXISTS refresh_tokens;
ALTER TABLE companion_sessions DROP COLUMN IF EXISTS user_id;
```

**Cautions:**
- Dropping `refresh_tokens` while the new api-server is running will cause 500 errors on every `/auth/refresh` call.
- Dropping `user_id` while the new api-server is running will cause registration/verify-email to fail (it inserts with `userId`).
- Never drop during traffic. Deploy old api-server first, then drop if needed.

---

## What happens to newly issued refresh tokens after rollback

If you roll back the api-server after users have registered and received refresh tokens tracked in `refresh_tokens`:

- The old server does not validate tokens against the DB — it accepts any JWT-signed refresh token.
- Users experience **transparent continuation** — their refresh tokens still work, just without revocation enforcement.
- Tokens issued after rollback are not tracked. Logout will not revoke them.

This is a security regression (not a user-visible regression). It is acceptable for a brief rollback window. Issue new `JWT_SECRET` after the rollback window to invalidate all outstanding tokens if needed.

---

## Operator: admin login fails after deploy

Check these in order:

1. **Is `ADMIN_SECRET` set?**
   Look at server logs for `[startup] Configuration summary`. The `adminSecret` field shows `"present"` or `"absent"`. If absent, set the env var and restart.

2. **Is it a CORS error?**
   In the browser DevTools Network tab, look for a CORS preflight failure (OPTIONS request returning 403). Set `ALLOWED_ORIGINS` to include the exact origin of the admin panel and restart.

3. **Is the wrong secret being used?**
   Server logs show `[auth/admin] failed login attempt` with `reason: "WRONG_SECRET"`. Verify the admin panel is submitting the correct value.

4. **Is the cookie being blocked?**
   In a same-origin deployment, cookies work by default. If the admin panel is on a different domain from the api-server, cookies will be blocked by `SameSite=Strict`. See `docs/production-rollout-plan.md` Part 4 for the topology requirement.

5. **Is the server running?**
   If none of the above, check that the api-server process is up and the load balancer is routing to it.

---

## Operator: user auth / refresh flows fail after deploy

Check these in order:

1. **Did the migration run before the deploy?**
   If `POST /auth/refresh` returns 500, check server logs for a DB error like `relation "refresh_tokens" does not exist`. Run the migration and restart the server.

2. **Are users getting `TOKEN_NOT_FOUND`?**
   This is expected for the first deploy — users held tokens issued before revocation was added. They need to re-authenticate once. The mobile app handles this automatically by clearing local tokens and redirecting to re-auth. No operator action needed.

3. **Are users getting `TOKEN_REVOKED`?**
   Someone logged out on this session, or the token was explicitly revoked. Expected behavior. No operator action needed.

4. **Are all users being kicked out repeatedly?**
   If `JWT_SECRET` changed between deploys, all outstanding tokens are invalid. New tokens issued after the restart will work. If the secret change was unintentional, restore the original `JWT_SECRET` and restart.

5. **Session restore returning wrong session?**
   If `POST /auth/session` with an existing `sessionId` returns a different session, check that `companion_sessions` migration was applied and the `session_id` column still has the correct data.

---

## Rollback decision threshold

| Failure observed | Recommended action |
|------------------|--------------------|
| Admin login 401 (wrong secret) | Fix env var, no rollback needed |
| Admin login 403 CORS | Fix `ALLOWED_ORIGINS`, no rollback needed |
| All `/auth/refresh` returning 500 | Run migration, no rollback needed |
| All `/auth/refresh` returning `TOKEN_NOT_FOUND` | Expected on first deploy — not a failure |
| DB connection errors on all routes | Check `DATABASE_URL`, restart — rollback only if DB is corrupted |
| New TypeScript runtime error causing 500s | Rollback api-server binary, investigate, redeploy |
| Security regression (auth bypass) | Rollback immediately, rotate `JWT_SECRET` and `ADMIN_SECRET` |
