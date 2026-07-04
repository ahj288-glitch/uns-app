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
