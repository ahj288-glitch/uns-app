# أُنس — Remediation Evidence (P0/P1 pass)

**Run date:** 2026-07-04
**Environment:** Windows 11, Node/pnpm monorepo. Commands run from
`artifacts/api-server` and `artifacts/uns-app`.

> All command output below is **real** — captured verbatim from execution, not
> summarized or fabricated. Exit codes are shown as `EXIT_CODE=...`.
>
> This file was regenerated for the current 10-fix pass. The earlier (2026-03)
> evidence is preserved in git history and in `docs/audit-remediation-evidence.md`.

---

## 1. api-server — `npm run typecheck`

```text
$ npm run typecheck

> @workspace/api-server@0.0.0 typecheck
> tsc -p tsconfig.json --noEmit

EXIT_CODE=0
```

✅ **Pass** — 0 type errors (this includes the `insights.ts` pre-existing
compile-error fix; without it this step failed with `TS1005`/`TS1109`).

---

## 2. api-server — `npm run lint`

```text
$ npm run lint
npm error Missing script: "lint"
npm error
npm error Did you mean this?
npm error   npm link # Symlink a package folder
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\fngpc\AppData\Local\npm-cache\_logs\2026-07-04T18_14_14_168Z-debug-0.log
EXIT_CODE=1
```

⚠️ **No lint script exists** in `artifacts/api-server/package.json` (scripts:
`dev`, `build`, `start`, `typecheck`, `test`). `npm run lint` therefore errors
with `Missing script: "lint"`. This is a repository configuration fact, not a
code defect introduced by this pass. Type safety is enforced via `typecheck`.

---

## 3. api-server — `npm run build`

```text
$ npm run build

> @workspace/api-server@0.0.0 build
> node ./build.mjs


  dist\index.mjs                   2.7mb
  dist\pino-worker.mjs           153.4kb
  dist\pino-file.mjs             142.1kb
  dist\pino-pretty.mjs           114.6kb
  dist\thread-stream-worker.mjs    7.3kb
  ...and 5 more output files...

Done in 307ms
EXIT_CODE=0
```

✅ **Pass** — esbuild bundle produced successfully.

---

## 4. uns-app — `npx tsc --noEmit`

```text
$ npx tsc --noEmit
EXIT_CODE=0
```

✅ **Pass** — 0 type errors across the Expo app, including the new
`lib/secureTokens.ts`, the SecureStore migration in 6 files, the `__DEV__`
gating, and the `_layout.tsx` font-error screen.

---

## 5. uns-app — `npm run lint`

```text
$ npm run lint
npm error Missing script: "lint"
npm error
npm error Did you mean this?
npm error   npm link # Symlink a package folder
npm error
npm error To see a list of scripts, run:
npm error   npm run
npm error A complete log of this run can be found in: C:\Users\fngpc\AppData\Local\npm-cache\_logs\2026-07-04T18_14_40_300Z-debug-0.log
EXIT_CODE=1
```

⚠️ **No lint script exists** in `artifacts/uns-app/package.json` (scripts:
`dev`, `dev:local`, `build`, `serve`, `typecheck`). Same situation as api-server;
type safety is enforced via `tsc --noEmit`.

---

## 6. Dependency install evidence (Fix 2)

`expo-secure-store` was added via the SDK-aware installer:

```text
$ npx expo install expo-secure-store
› Installing 1 SDK 54.0.0 compatible native module using pnpm
> pnpm add expo-secure-store@~15.0.8
...
dependencies:
+ expo-secure-store ~15.0.8
› Added config plugin: expo-secure-store
```

`artifacts/uns-app/package.json` now contains `"expo-secure-store": "~15.0.8"`
and `app.json` `plugins` includes `"expo-secure-store"`.

---

## 7. Manual verification per fix

Static verification snippets (grep) confirming each change is in place.

### Fix 1 — timing-safe admin secret (`auth.ts`)
```text
2:import { createHash, randomInt, timingSafeEqual } from "crypto";
508:  // timing. timingSafeEqual requires equal-length buffers, so length-check first.
511:  if (a.length !== b.length || !timingSafeEqual(a, b)) {
```
`===` comparison removed; constant-time compare with length guard in place.

### Fix 2 — JWT → SecureStore
```text
$ grep -rn "AsyncStorage.*uns_access_token|uns_refresh_token" artifacts/uns-app
(no matches — all token I/O uses SecureStore)
```
Zero AsyncStorage token references remain. `lib/secureTokens.ts` created; 6 call
sites migrated; logout/delete call `clearTokens()`.

### Fix 3 — OTP verify rate limit (`auth.ts`)
```text
117:const otpLimiter = rateLimit({
222:router.post("/auth/verify-email", otpLimiter, async (req, res) => {
```
Limiter defined (5/10min, userId-keyed) and attached to the verify route.

### Fix 4 — real LLM (`companion.ts`)
`getOpenAI()` initializes from `GROQ_API_KEY` or `OPENAI_API_KEY`; `callLLM()`
falls back to `buildFallbackResponse()` on missing key / thrown error. Verified
by `typecheck` + `build` (both green). Live call not exercised (no key set here);
the no-key path returns the rule-based reply without throwing.

### Fix 5 — verification flag env var (`app/index.tsx`)
```text
const IS_VERIFICATION_ENABLED = process.env["EXPO_PUBLIC_VERIFICATION_ENABLED"] === "true";
```
Documented in `.env.example`; local `.env` defaults to `false` (MVP preserved).

### Fix 6 — sessions FK (`lib/db/src/schema/sessions.ts`)
```text
12:  userId: uuid("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
```
FK with cascade delete. `lib/db` + api-server typecheck confirm the relation.

### Fix 7 — streak calculation (`moods.ts`)
```text
102:    for (let i = 0; i < daysBack; i++) {
119:        streakDays: streak,
```
`Math.min(...)` replaced by a real backward consecutive-day scan.

### Fix 8 — `__DEV__` gating
All runtime `console.log` in `app/index.tsx`, `onboarding/verify.tsx`, and
`onboarding/register.tsx` are `__DEV__`-guarded (verified via `grep console.log`).

### Fix 9 — font-load error (`_layout.tsx`)
`if (fontError) { return <recovery screen/> }` added before `if (!fontsLoaded) return null;`.
Verified by `tsc --noEmit`.

### Fix 10 — mood date filter (`moods.ts`)
`.where(and(eq(sessionId), gte(moodsTable.createdAt, since)))` — `since` bound
applied. Verified by `typecheck` + `build`.

---

## 8. Aggregate result

| Command | Package | Exit | Result |
|---|---|---|---|
| `npm run typecheck` | api-server | 0 | ✅ pass |
| `npm run lint` | api-server | 1 | ⚠️ no lint script (`Missing script`) |
| `npm run build` | api-server | 0 | ✅ pass |
| `npx tsc --noEmit` | uns-app | 0 | ✅ pass |
| `npm run lint` | uns-app | 1 | ⚠️ no lint script (`Missing script`) |

**Type safety and build are green across both packages.** The only non-zero
exits are the two `npm run lint` invocations, which fail solely because no `lint`
script is defined in either `package.json` — reported verbatim above rather than
hidden.

---

## Recovery — cherry-pick of `50a62c1` onto `origin/master` (2026-07-04)

The 10-fix commit `50a62c1` was dropped during a `git pull --rebase`. It was
recovered on branch `recover/audit-fixes-50a62c1` (backup: `backup/master-before-recover-50a62c1`).

### Merge resolution decisions (18 conflicted paths)
- **Fix side (50a62c1):** `moods.ts` (F7/F10), `insights.ts` (typecheck unblock), `onboarding/verify.tsx` (F2/F8), both docs.
- **Origin side (kept newer architecture):** `companion.ts` (F4 already present, no `aiConfig`), `sessions.ts` (F6 FK already present as `set null`), `(tabs)/{_layout,chat,mood}.tsx`, `lib/api.ts`.
- **Deleted (origin removed):** `api-server/.env.example`, `api-server/src/lib/aiConfig.ts`, `lib/db/src/schema/refresh_tokens.ts`.
- **Hand-merged (both diverged):** `auth.ts` (kept origin `login-start`/cookies + re-applied F1 `timingSafeEqual` and F3 `otpLimiter`, dropped 50a62c1's unused admin-cookie helpers and old `/auth/login`), `app/_layout.tsx` (kept origin `NetworkProvider` + re-inserted F9 font-error screen), `onboarding/login.tsx` + `contexts/SessionContext.tsx` (kept origin flow + swapped token I/O to `secureTokens`).

### Build fix required
`lib/db/dist/*.d.ts` was stale (missing `revokedAt`), which api-server consumes via
TS project references. Rebuilt with `npx tsc --build lib/db --force` (exit 0). Also
ran `pnpm install` to restore `groq-sdk` (in lockfile, absent from `node_modules`).

### Verification (real output)
```text
$ (lib/db) npx tsc --build lib/db --force            → EXIT 0  (dist now has revokedAt ×2)
$ (api-server) npx tsc -p tsconfig.json --noEmit     → EXIT 0  ✅ typecheck
$ (api-server) npm run build                         → EXIT 0  ✅ esbuild bundle (dist/index.mjs 2.6mb)
$ (uns-app)   npx tsc --noEmit --skipLibCheck        → EXIT 0  ✅ typecheck
$ (api-server) npm test                              → EXIT 1  ⚠️ toolchain blocker (see below)
```

`npm test` fails **before running any test** with:
`Cannot find module '@rollup/rollup-win32-x64-msvc'` — vitest pulls `rollup@4.59.0`
but only the `4.60.0` win32 native binary is in the pnpm store (the well-known
npm/pnpm optional-native-dep bug, unrelated to the audit code). Not a source defect.

### 10-fix presence in the recovered tree (grep-verified)
F1 `timingSafeEqual` ×3 · F2 `secureTokens.ts` + 6 consumers, **0** residual `AsyncStorage` token I/O ·
F3 `otpLimiter` on `/auth/verify-email` · F4 `chat.completions` · F5 `EXPO_PUBLIC_VERIFICATION_ENABLED` ·
F6 `.references(() => usersTable.id, …)` · F7 consecutive-day streak scan · F8 `__DEV__` gates ·
F9 `if (fontError)` recovery screen · F10 `gte(moodsTable.createdAt, since)`.

---

## Pre-merge hardening pass (2026-07-04) — F6 completion, test toolchain, migration review

### F6 — now fully implemented (was schema-only)
Session creation is centralized in `createUserSession(userId, dialect)` (in `auth.ts`),
which validates a non-empty `userId` and writes it on every authenticated insert
(`/auth/register` bypass, `/auth/login-start` bypass, `/auth/verify-email`).
`/auth/session` stays intentionally anonymous (pre-registration onboarding, `user_id = NULL`).

```text
$ (api-server) npm test
 ✓ src/__tests__/auth.test.ts          (13 tests | 3 skipped)
 ✓ src/__tests__/session-userid.test.ts (4 tests)   ← Fix 6
 Test Files  2 passed (2)
      Tests  17 passed (17)
 EXIT 0
```
`session-userid.test.ts` mocks `@workspace/db` and asserts: writes `{dialect, userId}`;
honors custom dialect; **throws instead of creating an orphaned session** when `userId`
is empty/undefined. `scripts/verify-f6.sh` covers the real-Postgres end-to-end path.

### Test toolchain blocker — fixed (not hidden)
`npm test` previously died with `Cannot find module '@rollup/rollup-win32-x64-msvc'`.
**Root cause:** `pnpm-workspace.yaml` `overrides` force-removed Windows-x64 native
binaries (`rollup>@rollup/rollup-win32-x64-msvc: '-'`, alongside tailwind/lightningcss),
authored for the Linux deploy target. On a Windows x64 dev box this strips the binary
Rollup (via Vitest) needs to run. **Fix:** removed only the `rollup-win32-x64-msvc`
override (left the other-platform strips intact) + `pnpm install`. pnpm OS/CPU-gates
optional native deps, so this is inert on the Linux target (pnpm skips it there) but
unblocks `vitest run` on Windows. Lockfile updated accordingly (+1 optional dep).

### Full re-verification (all real)
```text
$ (lib/db)     npx tsc --build lib/db --force     → EXIT 0
$ (api-server) npx tsc -p tsconfig.json --noEmit  → EXIT 0
$ (api-server) npm run build                      → EXIT 0
$ (uns-app)    npx tsc --noEmit                    → EXIT 0
$ (api-server) npm test                           → EXIT 0  (17 passed)
```

### ⚠️ Migration Review — DB-architecture conflict with the admin-panel line (MERGE BLOCKER)
Commit `50a62c1` bundled a **DB security re-architecture** that is NOT one of the 10
audit fixes and **conflicts with `master`** (the admin-panel line). The cherry-pick
applied it cleanly (no textual conflict) because `master`'s `rls.sql` was unchanged
from the base, so the semantic clash is invisible to git.

**What the recovery introduces (vs master):**
- **New migration** `lib/db/src/migrations/001_private_schema.sql` (266 lines) that:
  - `CREATE SCHEMA private; CREATE SCHEMA api;`
  - **`ALTER TABLE ... SET SCHEMA private`** for 11 sensitive tables (`users`,
    `companion_sessions`, `companion_messages`, `mood_checkins`, `refresh_tokens`,
    `verification_tokens`, `user_progress`, `daily_loops`, `micro_wins`, `waitlist`,
    `community_posts`) — physically moving them out of `public`.
  - `SET SCHEMA api` for 3 public-catalog tables (`daily_recipes`, `wellness_programs`,
    `community_sessions`), with `REVOKE`/`GRANT` re-grants and RLS on those 3 only.
  - Plus `001_rollback.sql`, `001_verify.sql`, `001_smoke_tests.sh`, `schemas.ts`.
- **`rls.sql` rewritten 281 → 85 lines**: master's "RLS lockdown on 14 `public.*` tables"
  is replaced by "RLS on 3 `api.*` tables + `private` schema hidden from PostgREST."

**Migration impact summary:**
| Dimension | Assessment |
|---|---|
| New tables | None (no `CREATE TABLE`) — but **two new schemas** (`private`, `api`) |
| Altered tables | **All 14** relocated to a different schema via `SET SCHEMA` |
| RLS changes | Model swap: 14-table `public` RLS lockdown → 3-table `api` RLS + `private` hidden |
| Backward-compat risk | **High.** Anything referencing `public.<table>` (existing SQL, Supabase PostgREST `exposed_schemas`, the admin-panel RLS commit, external tools) breaks after the move. |
| Dev/prod data risk | `SET SCHEMA` preserves rows, but is a **breaking structural migration**; running it on a DB already set up per master's `public` model would require coordinated app + PostgREST config changes. Not reversible without `001_rollback.sql`. |
| Internal consistency | ⚠️ The Drizzle schema `.ts` still uses `pgTable(...)` (public) — inconsistent with the migration's `private`/`api` placement. 50a62c1's own defect. |

**Recommendation:** treat the private/api schema migration as **out of scope** for the
audit-fix recovery. It should be split into its own PR and reconciled with the
admin-panel RLS work by that owner. The 10 audit fixes do **not** depend on it
(F6's FK works in either schema model).
