# Post-Deploy Validation Checklist

Execute this checklist immediately after every production or staging deployment, in order.
Each item includes the action, expected result, failure signal, and severity if it fails.

Last updated: 2026-03-27

---

## 1 — API Health Check

**Action:** `GET /api/healthz`

**Expected result:** HTTP 200 with `{ "status": "ok" }`.

**Failure signal:** Connection refused, 502, or 500. Check that the api-server process is running and that the reverse proxy is routing `/api/*` correctly. Note: the health endpoint is `/api/healthz` (with z), not `/api/health`.

**Severity:** 🔴 Critical — all other items depend on this. Stop and fix before continuing.

---

## 2 — Admin Login Test

**Action:** POST to `{API_URL}/api/auth/admin` with `{ "secret": "<ADMIN_SECRET>" }` and `credentials: "include"` (or via the admin panel login screen)

**Expected result:** HTTP 200. Response body contains `{ "accessToken": "<jwt>" }`. Browser DevTools → Application → Cookies shows `uns_admin_token` with `HttpOnly` and `Secure` flags set.

**Failure signal:**
- 401 → `ADMIN_SECRET` env var is wrong or unset. Check `[auth/admin] failed login attempt` in server logs, specifically the `reason` field.
- 403 → CORS blocking the request. Check `ALLOWED_ORIGINS` env var includes the exact origin of the admin panel.
- 500 → Server misconfiguration. Check startup logs for `[startup] Configuration summary`.

**Severity:** 🔴 Critical — admin panel is unusable without this.

---

## 3 — Admin Route Protection Test

**Action:** Make a GET request to a protected admin endpoint (e.g. `GET /api/admin/dashboard`) without any Authorization header and without the cookie (use incognito or delete the cookie first).

**Expected result:** HTTP 401 with `{ "code": "UNAUTHORIZED" }`.

**Failure signal:** 200 response without auth — admin routes are unprotected. This is a security failure requiring immediate rollback.

**Severity:** 🔴 Critical.

---

## 4 — Admin Logout Test

**Action:** Log in to the admin panel. Click logout. Inspect browser DevTools → Application → Cookies.

**Expected result:** `uns_admin_token` cookie is gone. Navigating to a protected admin route redirects to the login page.

**Failure signal:**
- Cookie still present → `POST /api/auth/admin/logout` may not be reaching the server, or `clearCookie` is failing. Check server logs for the logout request.
- Protected route still accessible after logout → the `verifyToken` middleware accepted a stale cookie. Should not happen if the cookie was cleared.

**Severity:** 🟠 High.

---

## 5 — Refresh Token Invalidation Test

**Action:**
1. Register a new test user to obtain a `refreshToken`.
2. Call `POST /api/auth/logout` with `{ "refreshToken": "<token>" }`.
3. Immediately call `POST /api/auth/refresh` with the same `refreshToken`.

**Expected result:** Step 2 returns `{ "ok": true }`. Step 3 returns HTTP 401 with `{ "code": "TOKEN_REVOKED" }`.

**Failure signal:**
- Step 3 returns 200 → token revocation is not working. Check `refresh_tokens` table exists and the `revokedAt` column is being set.
- Step 3 returns `TOKEN_NOT_FOUND` → the token was never stored (migration may not have run before the deploy).

**Severity:** 🔴 Critical — this is a security control.

---

## 6 — User Registration Test

**Action:** Submit a new registration with a fresh email via `POST /api/auth/register` (or via the mobile app registration screen).

**Expected result:**
- If `VERIFICATION_ENABLED=false`: HTTP 201 with `{ accessToken, refreshToken, sessionId, userId, verified: true }`.
- If `VERIFICATION_ENABLED=true`: HTTP 201 with `{ userId, email, message }`, and an OTP email is delivered.

**Failure signal:**
- 409 → `EMAIL_EXISTS` — use a different test email.
- 500 with SMTP error → SMTP is not configured. Check `[startup] Configuration summary` for smtp status.
- No email received within 60s → SMTP misconfiguration or delivery failure. Check SMTP credentials.

**Severity:** 🔴 Critical.

---

## 7 — Existing Session Restore Test

**Action:**
1. Register or log in as an existing user with a known `sessionId`.
2. Call `POST /api/auth/session` with `{ "sessionId": "<existing_session_id>" }`.

**Expected result:** HTTP 200 with the same `sessionId` in the response and a new `accessToken` and `refreshToken`. The companion session history is preserved.

**Failure signal:**
- Different `sessionId` returned → session lookup failed. Check `companion_sessions` table. Verify the session exists and `session_id` column is correct.
- 500 → DB error. Check logs.

**Severity:** 🟠 High — existing users lose their companion history if this fails.

---

## 8 — OTP / Email Verification Test

**Action:**
If `VERIFICATION_ENABLED=true`: register a new user, wait for the OTP email, and submit the OTP via `POST /api/auth/verify-email`.

**Expected result:** HTTP 200 with `{ accessToken, refreshToken, sessionId, restored: false }` (first registration) or `restored: true` (returning user).

**Failure signal:**
- No email received → SMTP misconfiguration. See item 6.
- 400 `OTP_EXPIRED` → OTP was not submitted within 10 minutes.
- OTP appears in server logs → security failure. Check that `sendOtpEmail` only writes to stdout in `NODE_ENV=development`.

**Severity:** 🟠 High (if verification is enabled).

---

## 9 — LLM Message Send Test

**Action:** Authenticate as a test user. Send a message to the companion via `POST /api/companion/message` (or equivalent endpoint).

**Expected result:**
- If `OPENAI_API_KEY` is set: HTTP 200 with an LLM-generated response.
- If `OPENAI_API_KEY` is absent: HTTP 200 with a rule-based fallback response. No 500.

**Failure signal:**
- 500 → Check `OPENAI_API_KEY` is set and valid. Check OpenAI API status.
- 429 with `COMPANION_RATE_LIMITED` → rate limiter working as expected (not a failure).

**Severity:** 🟡 Medium — companion is the core product feature.

---

## 10 — Daily Limit Enforcement Test

**Action:** Send 31 companion messages in one session within a 24-hour window.

**Expected result:** The 31st message returns HTTP 429 with `{ "code": "DAILY_LIMIT_REACHED" }`.

**Failure signal:** 31st message succeeds (no rate limit) → daily limit enforcement is not active. Check the companion route limit logic.

**Severity:** 🟡 Medium — cost control for OpenAI usage.

---

## 11 — Dashboard Real-Data Check

**Action:** Log in to the admin panel and navigate to the dashboard. Verify data is present.

**Expected result:** Dashboard displays real metrics (user count, session count, message volume). Data refreshes on page reload. No "loading" spinner stuck state or empty charts.

**Failure signal:**
- All zeros with real data in DB → API queries may be failing silently. Check browser network tab for failed requests.
- 401 on dashboard API calls → admin token expired mid-session or cookie not being sent. Check `credentials: "include"` on dashboard fetch calls.

**Severity:** 🟡 Medium.

---

## 12 — Cookie Persistence Test After Page Refresh

**Action:**
1. Log in to the admin panel. Confirm access to a protected route.
2. Hard-refresh the browser (Ctrl+Shift+R / Cmd+Shift+R).
3. Attempt to access the same protected route.

**Expected result:** User remains authenticated. The admin panel re-reads `accessToken` from `localStorage` on mount. If token is expired, re-auth is expected — but if token is still valid, access should be seamless.

**Failure signal:** User is kicked to login on every refresh with a valid token → `localStorage` not persisting, or token is being cleared incorrectly.

**Severity:** 🟡 Medium — UX regression if every refresh requires re-login.

---

## 13 — Production Build Sanity

**Action:**
```bash
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/uns-admin typecheck
pnpm --filter @workspace/api-server build
pnpm --filter @workspace/uns-admin build
```

**Expected result:** All four commands exit 0. Zero TypeScript errors.

**Failure signal:** Any non-zero exit code. Do not deploy a build that fails typecheck.

**Severity:** 🔴 Critical — run this before every deploy, not after.

---

## Severity Key

| Symbol | Meaning |
|--------|---------|
| 🔴 Critical | Fix before considering the deploy complete. Rollback if cannot fix quickly. |
| 🟠 High | Fix within the deployment window. Do not mark deploy as stable. |
| 🟡 Medium | Fix in the next patch. Deploy is stable with this open. |
