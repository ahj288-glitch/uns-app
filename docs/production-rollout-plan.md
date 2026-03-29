# Production Rollout Plan

Last updated: 2026-03-27

---

## Overview

This document defines the exact deployment sequence, migration requirements, user impact assessment, and topology constraints for taking this codebase to production.

---

## PART 1 — Database Migration

### What changed

| Table | Change | Type | Backward compatible? |
|-------|--------|------|----------------------|
| `companion_sessions` | Added `user_id uuid` column (nullable) | Additive | ✅ Yes — existing rows get `NULL` |
| `refresh_tokens` | New table | Additive | ✅ Yes — no existing table to break |

Both changes are additive. They do not modify existing columns or drop anything.

### Migration command

```bash
pnpm --filter @workspace/db run push
```

Run this against the production database before deploying the api-server. The order is non-negotiable: **migrate first, deploy second**.

### Why migration must precede deployment

The api-server code references `refresh_tokens` table on every `POST /auth/refresh` call. If the table does not exist when the server starts, the first token refresh attempt will throw a Drizzle/Postgres error (relation does not exist), returning 500 to the user. There is no graceful degradation — the server assumes the table exists.

### Verification after migration

```sql
-- Verify refresh_tokens table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'refresh_tokens'
ORDER BY ordinal_position;

-- Expected columns: id, session_id, token_hash, expires_at, revoked_at, created_at

-- Verify companion_sessions has user_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companion_sessions'
AND column_name = 'user_id';

-- Expected: user_id | uuid | YES
```

### Impact on existing rows

| Table | Existing rows | After migration |
|-------|--------------|-----------------|
| `companion_sessions` | All existing sessions | `user_id = NULL` — treated as anonymous sessions. No behavioral change. |
| `refresh_tokens` | N/A (new table) | Empty. All existing client-held refresh tokens are unknown to the table. |

**The existing anonymous session flow continues to work.** Sessions created before this migration have `user_id = NULL`, which is the intended state for anonymous sessions.

### Impact on existing refresh tokens

Any refresh token issued before this deploy is not in the `refresh_tokens` table. When those clients call `POST /auth/refresh`, they receive:

```json
{ "error": "Unauthorized", "code": "TOKEN_NOT_FOUND" }
```

The mobile app's `SessionContext.tsx` handles a 401 from `/auth/refresh` by clearing local tokens and redirecting to session init / re-registration. **This is the expected behavior.** All existing users re-authenticate once after first deploy.

This is safe for a first launch. Pre-existing user sessions are discarded on the first token refresh attempt, not on login.

---

## PART 2 — Deployment Sequence

Execute these steps in order. Do not skip steps or reorder.

```
Step 1  │  Set all production environment variables (see PART 3)
Step 2  │  Run database migration against production DB
Step 3  │  Verify migration with SQL queries above
Step 4  │  Build api-server: pnpm --filter @workspace/api-server build
Step 5  │  Build uns-admin: pnpm --filter @workspace/uns-admin build
Step 6  │  Deploy api-server binary (serves /api/* routes + admin static files)
Step 7  │  Smoke test: GET /api/healthz → 200
Step 8  │  Run post-deploy validation checklist (docs/postdeploy-validation-checklist.md)
```

---

## PART 3 — Environment Variables (Production)

### Required in all environments (server exits without these)

| Variable | Notes |
|----------|-------|
| `PORT` | Must be numeric and > 0 |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32 chars; must be identical across all api-server instances |

### Required in production/staging (server exits without these when NODE_ENV=production or staging)

| Variable | Notes |
|----------|-------|
| `ADMIN_SECRET` | Admin panel passphrase. Strong random string, min 20 chars. |
| `SMTP_HOST` | Required when `VERIFICATION_ENABLED=true` OR for login OTP flow |
| `SMTP_USER` | SMTP auth username |
| `SMTP_PASS` | SMTP auth password |

### Required for correct production behavior (no startup crash, but features broken without them)

| Variable | Default behavior if absent | Required for |
|----------|---------------------------|--------------|
| `NODE_ENV` | Startup behaves as dev | Strict env checks, secure cookie, strict CORS |
| `ALLOWED_ORIGINS` | All origins blocked in production | Browser requests from admin panel |
| `OPENAI_API_KEY` | Rule-based fallback responses | LLM companion |
| `VERIFICATION_ENABLED` | OTP verification disabled | Email-gated registration |

### ALLOWED_ORIGINS — critical for production browser access

In production (`NODE_ENV=production`), the CORS middleware blocks ALL browser requests unless `ALLOWED_ORIGINS` is set. Set it to the comma-separated list of origins that serve the admin panel and the mobile web preview:

```
ALLOWED_ORIGINS=https://uns-app.com,https://admin.uns-app.com
```

**If this is empty in production, the admin panel login will fail with a 403 CORS error in the browser.**

---

## PART 4 — Cookie / Auth Production Topology

### Deployment model requirement

The admin panel (`uns-admin`) uses `API_BASE = "/api"` (relative URL, hardcoded). This works correctly only when **the admin panel and api-server share the same origin** — either:

- The api-server serves the admin SPA as static files at the same domain, or
- A reverse proxy serves both from the same hostname (`GET /*` → SPA, `GET /api/*` → api-server)

If the admin panel is deployed to a separate domain from the api-server, relative `/api` paths will not resolve to the api-server. The admin login fetch will go to the wrong server.

### Cookie security flags by environment

| Flag | Development | Production |
|------|-------------|------------|
| `HttpOnly` | ✅ | ✅ |
| `Secure` | ❌ (HTTP allowed) | ✅ (HTTPS required) |
| `SameSite` | `Lax` | `Strict` |
| `MaxAge` | 24h | 24h |

`SameSite=Strict` in production means the cookie is only sent for requests originating from the same site. Since the admin panel and api-server share the same origin (see above), the cookie will be sent on every request.

### HTTPS requirement

`secure: true` (production) means the browser will only send the cookie over HTTPS. Ensure HTTPS is terminated at the load balancer or reverse proxy. The api-server itself does not need to terminate TLS.

### Frontend fetch requirements

The `useAdminAuth.ts` hook uses `credentials: "include"` on both login and logout fetches. This is required for the browser to send and receive the `Set-Cookie` header. Every fetch to a protected endpoint must also include `credentials: "include"` (or use the API client wrapper which adds the Bearer token).

### Dual-auth fallback

The `verifyToken` middleware checks Bearer token first, then falls back to the admin cookie. The admin panel sends Bearer via `Authorization` header on API calls (from the in-memory `accessToken`), and the cookie provides persistence across page refreshes. Both must be present for full functionality; either alone is sufficient for a single request.

### Page refresh behavior

After a page refresh, the in-memory `accessToken` is gone. The admin panel re-reads from `localStorage` on mount. If the stored token is expired or absent, the user sees the login screen — the cookie alone does not auto-login the SPA. This is correct: the cookie protects API routes; the SPA manages its own auth state via `localStorage`.

---

## PART 5 — SMTP Configuration for Production

SMTP is required in production for any endpoint that sends email. The following are always called regardless of `VERIFICATION_ENABLED`:

- `POST /auth/login` — **always** sends an OTP to the user's email. SMTP required unconditionally.
- `POST /auth/resend-verification` — **always** sends an OTP. SMTP required unconditionally.
- `POST /auth/register` — sends OTP only when `VERIFICATION_ENABLED=true`.

**This means:** even if you set `VERIFICATION_ENABLED=false` (so registration bypasses email), users who re-install the app and try to log in will hit `POST /auth/login`, which always requires SMTP. Do not assume SMTP is optional because verification is disabled.

If SMTP is missing in production, the server exits at startup (enforced by `REQUIRED_IN_PRODUCTION`). If for any reason the server starts without SMTP (e.g. `NODE_ENV` not set to `production`), the login and resend endpoints will return 500. The startup log will show `"smtp": "NOT CONFIGURED — login and OTP verification will fail with 500"`.

In development only (`NODE_ENV=development`), missing SMTP causes OTP to be printed to stdout via `process.stdout.write` — never through pino, so it cannot reach log aggregators.

---

## PART 6 — Rollback Safety

See `docs/rollback-plan.md` for full rollback guidance.

Short version: the migration is additive and safe to leave in place even if you roll back the api-server binary. The old api-server code does not reference `refresh_tokens` and will ignore the new table. The `user_id` column on `companion_sessions` is nullable and ignored by old code.
