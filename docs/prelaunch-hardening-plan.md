# Pre-Launch Hardening Plan

## Overview

This document captures the security and production-readiness hardening work performed after the initial critical-blocker remediation phase. All items below were identified in the closure report as remaining risks before go-live.

---

## Item 1 — OTP Plaintext Logging

**Risk:** OTP codes were logged via pino (`logger.info({ otp }, ...)`) whenever SMTP was absent, regardless of environment. In any deployed environment without SMTP (e.g. a staging server relying on email forwarding), the OTP would appear in log aggregators (CloudWatch, Datadog, etc.), potentially exposing authentication bypass.

**Implementation approach:**
- OTP is now written only to `process.stdout` (not pino) and only when `NODE_ENV === "development"`.
- In all other environments (staging, production), if SMTP is not configured, `sendOtpEmail` throws an error rather than silently continuing. The route returns HTTP 500, making the configuration gap immediately visible in ops dashboards.
- The dev output uses `maskEmail()` to avoid the full email appearing in terminal history.

**Files changed:** `artifacts/api-server/src/routes/auth.ts`

**Security rationale:** OTPs are equivalent to session tokens for 10 minutes. Logging them violates the same principle as logging passwords. The environment guard ensures this can never silently regress in a deployment pipeline.

---

## Item 2 — Admin Authentication: httpOnly Cookie

**Risk:** `sessionStorage` is XSS-readable. A reflected or stored XSS attack on the admin panel could steal the admin JWT and authenticate as admin.

**Implementation approach:**
- Backend `POST /auth/admin` now also sets a `uns_admin_token` httpOnly cookie (in addition to returning `{ accessToken }` in the body for backward compatibility).
- Cookie flags: `httpOnly: true`, `secure: true` (production only), `sameSite: "strict"` (production) / `"lax"` (dev).
- `POST /auth/admin/logout` endpoint added — clears the cookie server-side.
- Auth middleware (`verifyToken`) now accepts EITHER a `Bearer` token OR the httpOnly admin cookie.
- Frontend `useAdminAuth.login()` adds `credentials: "include"` so the browser stores the cookie.
- Frontend `logout()` calls `POST /auth/admin/logout` to clear the cookie before clearing local state.
- `sessionStorage` is retained for client-side UI state (knowing whether to render the login screen) but is no longer the sole auth mechanism.

**Files changed:**
- `artifacts/api-server/src/routes/auth.ts`
- `artifacts/api-server/src/app.ts` (added `cookieParser()`)
- `artifacts/api-server/src/middlewares/auth.ts`
- `artifacts/uns-admin/src/hooks/useAdminAuth.ts`

**Security rationale:** httpOnly cookies are inaccessible to JavaScript. Even a successful XSS attack cannot read the admin token. The server-side logout ensures revocation propagates immediately.

**Rollout notes:** Cross-origin dev (Vite on a different port) uses `sameSite: "lax"` which still allows cookie sending with top-level navigation. Production uses `"strict"` which only allows same-site requests.

---

## Item 3 — Refresh Token Revocation

**Risk:** JWT refresh tokens expired after 7 days with no server-side revocation mechanism. A stolen refresh token could be used until expiry — a 7-day window with no recourse.

**Implementation approach:**
- New `refresh_tokens` DB table: stores `sessionId`, SHA-256 hash of the token, `expiresAt`, `revokedAt`, `createdAt`.
- The raw token is never stored — only its SHA-256 hex digest. This prevents DB exfiltration from yielding usable tokens.
- All token generation points (`/auth/session`, `/auth/register`, `/auth/verify-email` login path, `/auth/verify-email` register path) now call `storeRefreshToken()` to persist the hash.
- `POST /auth/refresh` verifies the hash exists in DB and `revokedAt IS NULL` before issuing a new access token. Tokens not in DB (issued before this feature, or forged) are rejected.
- `POST /auth/logout` computes the hash of the submitted token and sets `revokedAt = now`. Also clears the admin httpOnly cookie.

**Files changed:**
- `lib/db/src/schema/refresh_tokens.ts` (new)
- `lib/db/src/schema/index.ts`
- `artifacts/api-server/src/routes/auth.ts`

**Security rationale:** Server-side revocation means logout is real. Stolen tokens can be invalidated. The hash-only storage means the DB is not a token oracle.

**Rollout notes:** Existing refresh tokens (pre-migration) will be rejected since they're not in the DB. Users will need to re-authenticate once after deploy. This is acceptable for a first deploy; for a rolling upgrade, you would add a `legacy: true` flag for a grace period.

---

## Item 4 — Environment Validation at Startup

**Risk:** Missing secrets (JWT_SECRET, SMTP config) cause silent failures at runtime rather than a clear startup error, making misconfigurations hard to diagnose in production.

**Implementation approach:**
- `JWT_SECRET` promoted from `WARN_IF_MISSING` to `REQUIRED` (hard fail at startup if absent).
- SMTP vars (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) added to `WARN_IF_MISSING` in dev/test.
- New `REQUIRED_IN_PRODUCTION` list: if `NODE_ENV === "production"` or `"staging"`, all of `ADMIN_SECRET`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` become hard requirements.

**Files changed:** `artifacts/api-server/src/index.ts`

---

## Item 5 — uns-admin Typecheck: 0 Errors

**Risk:** 4 pre-existing TypeScript errors in the admin panel. While not runtime bugs, they indicate dependency version drift and erode confidence in the type safety of the codebase.

**Root cause diagnosed:** Dual Zod installation:
- `@hookform/resolvers` was resolving to hoisted `zod@4.3.6` (pulled in by `@scalar/openapi-types`)
- Admin panel code used `zod@3.25.76` (catalog version)
- TypeScript saw structurally incompatible `ZodType` definitions from two different Zod versions

**Fixes applied:**
- `pnpm-workspace.yaml`: added `packageExtensions` to declare `zod >= 3` as a peer dep for `@hookform/resolvers@*`. This causes pnpm to route `@hookform/resolvers` to the same Zod instance as the rest of the workspace.
- `@hookform/resolvers` downgraded to `3.3.4` (a version with Zod v3 type signatures).
- `button-group.tsx`: changed `ButtonGroupText` props from `React.ComponentProps<"div">` to `React.HTMLAttributes<HTMLElement>`. The `asChild` pattern makes the component element-agnostic; the wider type is semantically correct and removes the `ChangeEventHandler` variance conflict with Radix UI's `Slot`.
- `calendar.tsx`: replaced direct `ref={rootRef}` with a `useCallback` ref adapter that handles both function refs and object refs. This is the correct pattern for bridging react-day-picker's older `Ref` type with React 19's stricter ref callback return type constraint.

**Files changed:**
- `pnpm-workspace.yaml`
- `artifacts/uns-admin/package.json`
- `artifacts/uns-admin/src/components/ui/button-group.tsx`
- `artifacts/uns-admin/src/components/ui/calendar.tsx`
