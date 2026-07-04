# أُنس — Audit Fixes Status (P0/P1 remediation pass)

**Date:** 2026-07-04
**Scope:** All P0/P1 findings from the production audit (`AUDIT_REPORT.md`).
**Repo:** `ahj288-glitch/uns-app` — monorepo (`artifacts/api-server`, `artifacts/uns-app`, `lib/db`).

> This file was regenerated for the current 10-fix remediation pass. The earlier
> (2026-03) 24-finding remediation record is preserved in git history and in the
> sibling files `docs/audit-remediation-status.md` and
> `docs/audit-remediation-evidence.md`.
>
> Verification commands and their **raw** output are in
> [`remediation-evidence.md`](./remediation-evidence.md). Summary: api-server
> `typecheck` ✅, `build` ✅; uns-app `tsc --noEmit` ✅. Neither package defines a
> `lint` script, so `npm run lint` exits non-zero with `Missing script: "lint"`
> (recorded verbatim in the evidence file).

Path note: the audit refers to routes as `api-server/...` and screens as
`uns-app/...`; in this monorepo those live under `artifacts/api-server/...` and
`artifacts/uns-app/...`.

---

## Fix 1 — Timing-safe admin secret comparison

- **Finding ID / title:** Fix 1 — Admin secret compared with `===` (non-constant-time). Relates to audit §4.7 / §7 admin-auth hardening.
- **Severity:** P0
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/api-server/src/routes/auth.ts`
- **Root cause:** `POST /auth/admin` compared the submitted secret to `ADMIN_SECRET` with `secret !== adminSecret`. `===`/`!==` short-circuits on the first differing byte, leaking length/prefix information through response timing (a theoretical byte-by-byte brute force).
- **What was implemented:** Added `timingSafeEqual` to the `crypto` import. The handler now rejects missing secret/config first, then compares via constant-time `crypto.timingSafeEqual` over `Buffer`s, with an explicit length check first (the primitive throws on unequal-length buffers). Failure still logs and returns `401 Unauthorized`.
- **How it was tested:** `tsc -p tsconfig.json --noEmit` (0 errors) and `npm run build` (esbuild bundle succeeds). Logic review: unequal-length → early `false`; equal-length equal bytes → pass; equal-length differing bytes → constant-time `false`.
- **Remaining risk:** None for the comparison itself. Broader admin-auth hardening (SEV-2: admin JWT in `localStorage`) is a separate finding and out of this fix's scope.

---

## Fix 2 — JWTs moved from AsyncStorage to SecureStore

- **Finding ID / title:** Fix 2 — Access/refresh JWTs stored in plaintext `AsyncStorage` (audit §4.5, SEV-6).
- **Severity:** P0
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/uns-app/lib/secureTokens.ts` **(new)** — centralized SecureStore wrapper
  - `artifacts/uns-app/contexts/SessionContext.tsx`
  - `artifacts/uns-app/app/index.tsx`
  - `artifacts/uns-app/app/onboarding/verify.tsx`
  - `artifacts/uns-app/app/onboarding/register.tsx`
  - `artifacts/uns-app/app/onboarding/login.tsx`
  - `artifacts/uns-app/app/(tabs)/profile.tsx`
  - `artifacts/uns-app/package.json` + `artifacts/uns-app/app.json` — added `expo-secure-store ~15.0.8` dependency and config plugin (via `expo install`)
  - `pnpm-lock.yaml`
- **Root cause:** `uns_access_token` and `uns_refresh_token` were written/read via `@react-native-async-storage/async-storage`, which persists unencrypted on disk (readable on a rooted/jailbroken device or from an unencrypted backup). Additionally (SEV-6) `AsyncStorage.multiRemove`/`clear()` on logout would no longer reach tokens once moved.
- **What was implemented:**
  - New `secureTokens.ts` exposing `get/set/deleteAccessToken`, `get/set/deleteRefreshToken`, and `clearTokens()` backed by `expo-secure-store` (iOS Keychain / Android Keystore).
  - Every access/refresh token read, write, and delete across the 6 files now goes through this module. Non-secret keys (`uns_session_id`, dialect, gender, name, onboarding flags) intentionally stay in AsyncStorage.
  - Logout (`profile.tsx`) and account deletion now call `clearTokens()` explicitly alongside AsyncStorage cleanup — closing SEV-6 (tokens surviving a reset).
- **How it was tested:** `npx tsc --noEmit` on uns-app (0 errors). `grep` confirms **zero** remaining `AsyncStorage.*uns_access_token|uns_refresh_token` references. `expo install` resolved the SDK-54-compatible version and registered the config plugin.
- **Remaining risk:** SecureStore is device-only; existing users with tokens already in AsyncStorage will be treated as logged-out on first launch after upgrade (they re-authenticate). Acceptable for an MVP; a one-time migration shim could be added if seamless upgrade is required. Runtime keychain behavior should be smoke-tested on a physical device/build (cannot be exercised by `tsc`).

---

## Fix 3 — Rate limit on OTP verification endpoint

- **Finding ID / title:** Fix 3 — `POST /auth/verify-email` had no brute-force protection (audit SEV-4 / §5.2-D, OTP hardening).
- **Severity:** P0
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/api-server/src/routes/auth.ts`
- **Root cause:** The 6-digit OTP verify route was unauthenticated and unlimited. An attacker could iterate the ~900k code space against a known `userId`.
- **What was implemented:** Added `express-rate-limit` (already a dependency). Defined `otpLimiter` (5 attempts / 10 min, keyed on `req.body.userId` with `req.ip` fallback, standard headers, JSON error message) and applied it as middleware: `router.post("/auth/verify-email", otpLimiter, ...)`.
- **How it was tested:** `typecheck` + `build` pass. Middleware ordering verified (limiter runs before the handler; the handler reads `req.body.userId`, which the keyGenerator also uses).
- **Remaining risk:** `express-rate-limit`'s default store is in-memory, so limits reset on process restart and are per-instance (same class of limitation the audit notes for the resend limiter, SEV-4). For multi-instance production, back it with a shared store (e.g. Redis). Noted, not blocking for single-instance MVP.

---

## Fix 4 — Real LLM wired into the companion

- **Finding ID / title:** Fix 4 — Companion replies were keyword-matched, not LLM-generated (audit AI-1: "No LLM integration").
- **Severity:** P0
- **Status:** ✅ Fixed (already largely implemented; extended per spec)
- **Files changed:**
  - `artifacts/api-server/src/routes/companion.ts`
  - `artifacts/api-server/.env.example` (documented keys)
- **Root cause:** Original code returned canned dialect strings. The working tree already contained a real LLM path via a Groq (OpenAI-compatible) client with a rule-based fallback; the mission spec additionally requires honoring `OPENAI_API_KEY`.
- **What was implemented:** `getOpenAI()` now initializes from **either** `GROQ_API_KEY` (preferred, Groq base URL) **or** `OPENAI_API_KEY` (native OpenAI, default `gpt-4o` via `aiConfig.modelTier`). `callLLM()` builds a dialect-aware system prompt, sends the last 10 turns of history + the user message, and on a missing key **or** a thrown API error falls back to `buildFallbackResponse()` (rule-based) — the endpoint never crashes. `.env.example` now documents both keys and the fallback behavior.
- **How it was tested:** `typecheck` + `build` pass. Reviewed both branches: no key → fallback; key present + API error caught → logged + fallback; success → LLM text + emotion tag returned. Live API calls not exercised (no key configured in this environment) — graceful-degradation path confirmed by code path.
- **Remaining risk:** Real response quality/latency/cost can only be validated with a live key. The crisis-detection augmentation (AI-3, a separate finding) is unchanged.

---

## Fix 5 — `IS_VERIFICATION_ENABLED` as env var

- **Finding ID / title:** Fix 5 — Verification feature flag hardcoded in client (`app/index.tsx`).
- **Severity:** P0
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/uns-app/app/index.tsx`
  - `artifacts/uns-app/app/onboarding/register.tsx` (same flag, single-sourced)
  - `artifacts/uns-app/.env.example` **(new)** + local `.env` (gitignored) default
- **Root cause:** `const IS_VERIFICATION_ENABLED = false;` was a compile-time constant in both `index.tsx` and `register.tsx`, so shipping MVP vs. full-verification required a code edit. (The server side in `auth.ts` already read `process.env.VERIFICATION_ENABLED`.)
- **What was implemented:** Both `index.tsx` and `register.tsx` now use `IS_VERIFICATION_ENABLED = process.env["EXPO_PUBLIC_VERIFICATION_ENABLED"] === "true"`, so the client flag is single-sourced by one env var. Documented in a new `.env.example` and defaulted to `false` in the local `.env` so current MVP behavior is preserved.
- **How it was tested:** `npx tsc --noEmit` passes. Default (`false`/unset) preserves the exact prior MVP routing and registration behavior.
- **Remaining risk:** Client env vars are build-time inlined by Expo, so changing the flag requires a rebuild (expected).

---

## Fix 6 — `userId` foreign key on sessions

- **Finding ID / title:** Fix 6 — `companion_sessions.user_id` had no FK to `users` (audit §5 architecture / data-integrity).
- **Severity:** P1
- **Status:** ✅ Fixed
- **Files changed:**
  - `lib/db/src/schema/sessions.ts`
- **Root cause:** `userId: uuid("user_id")` existed as a bare column with no referential integrity, so orphaned sessions could survive user deletion and cascade cleanup was impossible at the DB layer.
- **What was implemented:** `userId` now declares `.references(() => usersTable.id, { onDelete: "cascade" })`, imported from `./users` (no circular import — `users.ts` does not import sessions). User↔session association at creation time already happens in `auth.ts` (`register`, `login`, `verify-email` all insert sessions with `userId: user.id`); the `/companion/session` route remains intentionally anonymous as it runs pre-authentication during onboarding.
- **How it was tested:** `lib/db` `tsc --noEmit` passes; api-server `typecheck` + `build` (which bundle the schema) pass, confirming the Drizzle relation type-checks end to end.
- **Remaining risk:** This changes the schema only. Applying it to an existing database requires `drizzle-kit push` (a migration that adds the FK constraint); pre-existing rows with a `user_id` that has no matching user would violate the new constraint and must be reconciled before the push. DB migration not run in this environment.

---

## Fix 7 — Correct consecutive-day streak calculation

- **Finding ID / title:** Fix 7 — Streak was `Math.min(entries, daysBack)`, not a real streak (audit REL-6).
- **Severity:** P1
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/api-server/src/routes/moods.ts`
- **Root cause:** `streakDays: Math.min(formatted.length, daysBack)` counts total entries in the window, not consecutive days ending today — any user with N check-ins showed an N-day "streak" regardless of gaps.
- **What was implemented:** Walk backward from today (midnight-normalized); for each day check whether any entry falls on it; increment on a hit, `break` on the first miss. `streakDays` now reflects the true current consecutive-day streak.
- **How it was tested:** `typecheck` + `build` pass. Traced cases: check-in today only → 1; today+yesterday → 2; gap yesterday → breaks at 1; no entries → 0.
- **Remaining risk:** Streak is computed in server-local time (`new Date()` / `setHours(0,0,0,0)`), so day boundaries follow the server timezone rather than the user's. Matches the app's existing date handling; per-user timezone is a future enhancement.

---

## Fix 8 — Gate `console.log` behind `__DEV__`

- **Finding ID / title:** Fix 8 — Debug `console.log`s shipped in production (audit §4 / hygiene).
- **Severity:** P1
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/uns-app/app/index.tsx`
  - `artifacts/uns-app/app/onboarding/verify.tsx`
  - `artifacts/uns-app/app/onboarding/register.tsx`
- **Root cause:** Router/auth flows logged tokens-adjacent state and routing decisions unconditionally, leaking flow details and adding noise in production.
- **What was implemented:** Every runtime `console.log` (and the one `console.warn` error path in `index.tsx`) is now wrapped in `if (__DEV__)`, so the calls are stripped/no-op in release builds. Build-time Node scripts (`scripts/build.js`, `server/serve.js`) were intentionally left alone — they are tooling, not app runtime.
- **How it was tested:** `npx tsc --noEmit` passes (`__DEV__` is a typed RN global). `grep console.log` across `app/**` shows all remaining occurrences are `__DEV__`-gated or inside a `if (__DEV__) { ... }` block.
- **Remaining risk:** `SessionContext.tsx`, `lib/api.ts`, and `ErrorFallback.tsx` retain `console.error`/`console.warn` in genuine error paths (intentional diagnostics, not `console.log`). Could be routed through a logger later if desired.

---

## Fix 9 — Handle font-load failure

- **Finding ID / title:** Fix 9 — App hangs on blank splash if fonts fail to load (`app/_layout.tsx`).
- **Severity:** P1
- **Status:** ✅ Fixed
- **Files changed:**
  - `artifacts/uns-app/app/_layout.tsx`
- **Root cause:** `if (!fontsLoaded && !fontError) return null;` meant a `fontError` fell through with `fontsLoaded` still false, leaving the app on `null` (blank splash) indefinitely.
- **What was implemented:** On `fontError`, render a RTL Arabic recovery screen ("فشل تحميل التطبيق … يرجى إعادة تشغيله") inside `SafeAreaProvider` (reusing existing `configStyles`). Only when there is no error and fonts are still loading do we `return null`.
- **How it was tested:** `npx tsc --noEmit` passes (JSX/imports — `View`, `Text`, `SafeAreaProvider`, `configStyles` — all already in scope).
- **Remaining risk:** Copy is static; no auto-retry. The screen uses the app's font family names which themselves failed to load, so it falls back to system fonts — acceptable for an error state.

---

## Fix 10 — Apply mood-history date filter

- **Finding ID / title:** Fix 10 — `since` computed but not used in the mood-history query (`moods.ts`).
- **Severity:** P1
- **Status:** ✅ Fixed (already present in working tree; verified)
- **Files changed:**
  - `artifacts/api-server/src/routes/moods.ts` (verified; the `.where()` clause was already corrected in the working tree)
- **Root cause:** `since` was calculated from `days` but the Drizzle query filtered only by `sessionId`, so `?days=` was ignored and up to 100 all-time rows were returned.
- **What was implemented:** The query `.where()` uses `and(eq(moodsTable.sessionId, sessionId), gte(moodsTable.createdAt, since))`, correctly bounding results to the requested window. Confirmed in place at `moods.ts` (line ~71) and now compiles alongside the Fix 7 streak change.
- **How it was tested:** `typecheck` + `build` pass. Reviewed that `since = new Date(Date.now() - daysBack*86_400_000)` feeds the `gte` bound.
- **Remaining risk:** None. Same server-timezone note as Fix 7 applies to the window boundary.

---

## Additional change (not one of the 10 fixes) — unblock verification

- **File:** `artifacts/api-server/src/routes/insights.ts`
- **Why:** The working tree already contained a **pre-existing compile error** (introduced by earlier uncommitted work, not by this audit pass): three `let` declarations typed as `Awaited<ReturnType<typeof db.select().from(...)>>`. `typeof` in type position does not accept a call expression, so `tsc` failed with `TS1005/TS1109` and the **entire api-server typecheck was red** — making any evidence meaningless.
- **Fix:** Replaced those annotations with Drizzle's `(typeof moodsTable.$inferSelect)[]` / `userProgressTable` / `microWinsTable` element types, which is what the `Promise.all` actually resolves to. Behavior unchanged; the try/catch structure is preserved.
- **Status:** ✅ Fixed — required so the P0/P1 fixes above can be verified against a green typecheck/build.

---

## Coverage summary

| # | Fix | Severity | Status |
|---|-----|----------|--------|
| 1 | Timing-safe admin secret | P0 | ✅ Fixed |
| 2 | JWT → SecureStore | P0 | ✅ Fixed |
| 3 | Rate limit OTP verify | P0 | ✅ Fixed |
| 4 | Real LLM in companion | P0 | ✅ Fixed |
| 5 | Verification flag as env var | P0 | ✅ Fixed |
| 6 | `userId` FK on sessions | P1 | ✅ Fixed |
| 7 | Consecutive-day streak | P1 | ✅ Fixed |
| 8 | Gate `console.log` w/ `__DEV__` | P1 | ✅ Fixed |
| 9 | Font-load error screen | P1 | ✅ Fixed |
| 10 | Mood-history date filter | P1 | ✅ Fixed |
| — | `insights.ts` typecheck unblock | — | ✅ Fixed |
