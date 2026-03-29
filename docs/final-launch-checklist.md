# Final Launch Checklist

Use this checklist for every production or staging deployment. Check each item before marking the deploy complete.

---

## 1 — Database Migrations

- [ ] Run `pnpm --filter @workspace/db run push` against the target database
- [ ] Verify `companion_sessions` table has `user_id uuid` column (nullable)
- [ ] Verify `refresh_tokens` table exists with columns: `id`, `session_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at`
- [ ] Confirm no existing data is corrupted (old rows get `user_id = NULL` — expected)

---

## 2 — Secrets and Environment Variables

- [ ] `PORT` set and numeric
- [ ] `DATABASE_URL` set and points to the correct database
- [ ] `JWT_SECRET` set (min 32 chars recommended; same value across all instances)
- [ ] `ADMIN_SECRET` set (production requirement; strong random string)
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` set (production requirement)
- [ ] `OPENAI_API_KEY` set (companion degrades to fallback responses if absent)
- [ ] `NODE_ENV=production` set
- [ ] `ALLOWED_ORIGINS` set to the exact frontend origin(s)
- [ ] No `.env` files committed to git

---

## 3 — SMTP / Email Verification

- [ ] Send a test OTP to a real email address and confirm delivery
- [ ] Confirm OTP arrives within 30 seconds
- [ ] Confirm OTP HTML template renders correctly in Gmail / Outlook
- [ ] Verify `VERIFICATION_ENABLED=true` if email verification is required for launch
- [ ] Confirm no OTP appears in server logs (should only see masked email)

---

## 4 — Admin Auth Verification

- [ ] Log in to admin panel with correct `ADMIN_SECRET` — should succeed
- [ ] Confirm `uns_admin_token` httpOnly cookie is set in browser DevTools (Application → Cookies)
- [ ] Confirm cookie has `HttpOnly`, `Secure`, `SameSite=Strict` flags in production
- [ ] Confirm admin routes respond with real data (dashboard metrics, AI config, programs)
- [ ] Click "Log out" — cookie should be cleared, redirect to /login
- [ ] Attempt to access protected route after logout — should redirect to /login
- [ ] Try incorrect secret — should return 401, no cookie set

---

## 5 — Token Revocation Verification

- [ ] Complete registration or login flow — obtain refresh token
- [ ] Call `POST /auth/logout` with the refresh token
- [ ] Attempt `POST /auth/refresh` with the revoked token — should return 401 `TOKEN_REVOKED`
- [ ] Confirm `revokedAt` is set in the `refresh_tokens` table
- [ ] Attempt `POST /auth/refresh` with a valid (un-revoked) token — should succeed

---

## 6 — OTP Safety Check

- [ ] Confirm OTP does NOT appear in production logs (pino / CloudWatch / Datadog)
- [ ] Confirm that with SMTP configured, OTP is sent via email (not stdout)
- [ ] In a dev environment, confirm OTP appears on stdout with masked email

---

## 7 — Session Restore (Login Flow)

- [ ] Register a new user, create companion messages
- [ ] Log out (app-side), log back in with the same email
- [ ] Confirm companion session history is restored (same `sessionId` returned)
- [ ] Confirm `restored: true` in the `POST /auth/verify-email` response for returning users

---

## 8 — AI Companion

- [ ] Send a message to companion — confirm LLM response (not fallback) if `OPENAI_API_KEY` is set
- [ ] Send 30 messages in one day — confirm 429 `DAILY_LIMIT_REACHED` on message 31
- [ ] Remove `OPENAI_API_KEY` and confirm fallback responses work (no 500 errors)

---

## 9 — Build and Typecheck

- [ ] `pnpm --filter @workspace/api-server typecheck` — 0 errors
- [ ] `pnpm --filter @workspace/uns-admin typecheck` — 0 errors
- [ ] `pnpm --filter @workspace/api-server build` — succeeds
- [ ] `pnpm --filter @workspace/uns-admin build` — succeeds (with PORT and BASE_PATH set)

---

## 10 — Pre-deploy Infrastructure

- [ ] HTTPS terminated at load balancer or reverse proxy
- [ ] Health check endpoint responds: `GET /api/healthz` → `{ "status": "ok" }`
- [ ] Database connection pool configured appropriately
- [ ] Log aggregation set up and verified (pino JSON logs readable)
- [ ] Error alerting configured for HTTP 500 rate spike
- [ ] `ALLOWED_ORIGINS` includes the exact frontend origin(s) — required or all browser requests fail in production
- [ ] Admin panel and api-server served from the same origin (same hostname) — required for cookie auth and relative `/api` paths
- [ ] Startup log `[startup] Configuration summary` confirms expected state after first deploy

---

## 11 — Post-Deploy Validation

- [ ] Run all 13 items in `docs/postdeploy-validation-checklist.md`
- [ ] All 🔴 Critical items pass before marking deploy stable
- [ ] All 🟠 High items pass before ending deployment window

---

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Engineering | | | |
| Security | | | |
| Product | | | |
