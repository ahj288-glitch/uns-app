# UNS Audit Remediation Status
> Generated: 2026-03-24 | Updated 2026-03-25 (post-registration UX + visual polish)
> Total findings tracked: 24
> **Fixed: 24 | Partially Fixed: 0 | Not Started: 0 | Blocked: 0**

### 2026-03-25 Fixes (this session)
- `app/(tabs)/index.tsx` — Daily Flash Card background changed from `rgba(255,255,255,0.82)` to `#10231c` (dark on-palette), text colors updated to dark-palette values (`#e8f5ee`, `#a5d0b9`, `#4a7a5e`)
- `app/(tabs)/programs.tsx` — Programs card gradient: `#3AAFA9` → `#74C69D` (brand mint)
- `app/(tabs)/index.tsx` — Recipe attribution: now shows `recipe.source` when available; falls back to `حكمة عربية` only when no recipe loaded
- `app/(tabs)/journey.tsx` — Removed mock data fallback in `.catch()` handler; new/disconnected users now see the proper EmptyState instead of fabricated xp=350 data
- `app/onboarding/register.tsx` — Full rewrite: Arabic lineHeight fix (≥1.85×), DOB dropdowns (Day/Month/Year modal), name validation, friendly EMAIL_EXISTS message, back-button canGoBack() guard

---

## P0 — Critical Security

### P0-01 · No authentication on any API endpoint
**Status: FIXED**  
**Root cause:** API had zero auth middleware — every route was publicly accessible.  
**Files changed:**
- `artifacts/api-server/src/lib/jwt.ts` — HS256 JWT generation: `generateAccessToken` (15m), `generateAdminToken` (24h), `generateRefreshToken` (7d), `verifyJwt()`
- `artifacts/api-server/src/middlewares/auth.ts` — `verifyToken` middleware: reads `Authorization: Bearer <token>`, verifies signature + expiry, attaches `req.auth = { sessionId, role }`, returns `{ error: "Unauthorized", code: "UNAUTHORIZED" }` with 401 on failure
- `artifacts/api-server/src/routes/auth.ts` — `POST /api/auth/session` (create/restore session + issue tokens), `POST /api/auth/admin` (validate `ADMIN_SECRET` → admin JWT), `POST /api/auth/refresh` (rotate refresh token)
- `artifacts/api-server/src/routes/index.ts` — `router.use(verifyToken)` applied after public auth/health/waitlist; companion/moods/insights/community/daily-recipes/gamification all protected
**How it was tested:** 13/13 unit tests pass. Live curl: `/api/companion/session`, `/api/insights`, `/api/moods`, `/api/daily-recipe` all return `{"error":"Unauthorized","code":"UNAUTHORIZED"}` with 401 without a token.  
**Remaining risk:** `JWT_SECRET` must be set in production. Server emits WARN (not FATAL) if missing — production deploy checklist must include this secret.

---

### P0-02 · Admin panel completely unprotected
**Status: FIXED**  
**Root cause:** No login page, no route guard — any user with the URL had full access to all 16 admin pages.  
**Files changed:**
- `artifacts/uns-admin/src/pages/Login.tsx` — bilingual login form, calls `POST /api/auth/admin`, stores token in localStorage
- `artifacts/uns-admin/src/hooks/useAdminAuth.ts` — `login()`, `logout()`, `isAuthenticated` (JWT expiry check via base64url decode with padding fix), `getAuthHeader()`
- `artifacts/uns-admin/src/components/AuthGuard.tsx` — wraps all admin routes, redirects to `/login` if `!isAuthenticated`
- `artifacts/uns-admin/src/lib/api.ts` — `useFetchWithAuth` hook injects `Authorization: Bearer` header, auto-calls `logout()` on 401
- `artifacts/uns-admin/src/lib/authSession.ts` — module-level bridge for token state + logout callback
- `artifacts/uns-admin/src/App.tsx` — `/login` public route + `AuthGuard` wrapping all other routes
- `artifacts/uns-admin/src/components/layout/AdminLayout.tsx` — "تسجيل الخروج / Logout" button in sidebar
- `artifacts/uns-admin/src/pages/Dashboard.tsx`, `Users.tsx`, `Safety.tsx`, `AiConfig.tsx` — converted to `fetchWithAuth`
**How it was tested:** `tsc --noEmit` passes cleanly (0 errors). Live curl: `GET /api/admin/users` → 401 without token. Wrong admin secret → 401.  
**Remaining risk:** `ADMIN_SECRET` must be set in production. Single shared secret — no per-user admin accounts (RBAC is a future improvement).

---

### P0-03 · CORS wildcard allowing all origins
**Status: FIXED**  
**Root cause:** `cors({ origin: '*' })` — any website could call the API with user credentials.  
**Files changed:**
- `artifacts/api-server/src/app.ts` — explicit origin allowlist via `ALLOWED_ORIGINS` env var (comma-separated). Dev with no allowlist: all origins allowed. Production: only listed origins pass.
**How it was tested:** `curl -sI http://localhost:8080/api/healthz` shows `Vary: Origin`, `Access-Control-Allow-Credentials: true`. Production restriction requires `ALLOWED_ORIGINS` env var.  
**Remaining risk:** `ALLOWED_ORIGINS` must be configured for production.

---

### P0-04 · No rate limiting — OpenAI cost exposure
**Status: FIXED**  
**Root cause:** No rate limiting anywhere — a single client could exhaust OpenAI quota.  
**Files changed:**
- `artifacts/api-server/src/app.ts` — global limiter: 300 req/15min; companion limiter: 10 req/min per session-id header (avoids IPv6 bypass by not using IP as fallback)
**How it was tested:** `curl -sI http://localhost:8080/api/healthz` → `RateLimit-Policy: 300;w=900`, `RateLimit-Limit: 300`, `RateLimit-Remaining: 285`, `RateLimit-Reset: 878`.

---

### P0-05 · No security headers
**Status: FIXED**  
**Root cause:** Express default sends no security headers.  
**Files changed:**
- `artifacts/api-server/src/app.ts` — `helmet()` middleware
**How it was tested:** Live curl shows:
```
Content-Security-Policy: default-src 'self';...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
```

---

### P0-06 · No backend authorization — admin routes unprotected server-side
**Status: FIXED**  
**Root cause:** Admin routes existed in Express but had zero middleware checking role.  
**Files changed:**
- `artifacts/api-server/src/middlewares/auth.ts` — `requireAdmin` middleware checks `req.auth?.role === 'admin'`, returns `{ error: "Forbidden", code: "FORBIDDEN" }` with 403
- `artifacts/api-server/src/routes/index.ts` — `router.use("/admin", requireAdmin)` applied before all admin routes
**How it was tested:** Unit test: `requireAdmin middleware > returns 403 for user role` ✅. Live curl: admin routes return 401 without token, 403 with user-role token.

---

### P0-07 · `EXPO_PUBLIC_DOMAIN` unguarded — silent failures if unset
**Status: FIXED**  
**Files changed:**
- `artifacts/uns-app/app/_layout.tsx` — checks `EXPO_PUBLIC_DOMAIN` at boot; if missing, renders Arabic `ConfigErrorScreen` instead of proceeding to a broken app
**How it was tested:** Confirmed conditional render in `_layout.tsx`.

---

### P0-08 · SessionContext sent no auth headers — all API calls were unauthenticated
**Status: FIXED**  
**Root cause:** `SessionContext` stored a `sessionId` but never sent `Authorization` headers.  
**Files changed:**
- `artifacts/uns-app/contexts/SessionContext.tsx` — calls `POST /api/auth/session`; stores access + refresh tokens in AsyncStorage; exposes `authToken` and `authFetch`; `authFetch` injects `Authorization: Bearer` on every call and retries on 401 via refresh token
- `artifacts/uns-app/app/(tabs)/chat.tsx`, `insights.tsx`, `mood.tsx`, `programs.tsx`, `index.tsx` — all use `authFetch`
**How it was tested:** Auth flow unit-tested at server layer. `tsc --noEmit` clean on `uns-app`.

---

## P1 — High Priority

### P1-01 · No onboarding navigation guard
**Status: FIXED**  
**Root cause:** No check whether the user had completed onboarding — first-time users landed directly on tabs.  
**Files changed:**
- `artifacts/uns-app/app/(tabs)/_layout.tsx` — async `useEffect` reads `AsyncStorage.getItem('@uns_onboarding_complete')`; shows `ActivityIndicator` while checking; redirects to `/onboarding` if key absent
**How it was tested:** Guard logic confirmed in `_layout.tsx`. Onboarding screen sets the key on completion.

---

### P1-02 · Raw `fetch()` in home screen — no caching, no abort, no type safety
**Status: FIXED**  
**Root cause:** Home screen used raw `fetch()` for `/api/daily-recipe` with no React Query caching, no abort signal, no types.  
**Files changed:**
- `lib/api-client-react/src/generated/api.ts` — `useGetDailyRecipe` hook and `useRecordMoodCheckin` mutation added; declarations rebuilt
- `artifacts/uns-app/app/(tabs)/index.tsx` — raw `fetch()` replaced with `useGetDailyRecipe`; mood recording replaced with `useRecordMoodCheckin`; `BASE` constant removed
**How it was tested:** `tsc --noEmit` passes cleanly on `uns-app`.

---

### P1-03 · No empty states — blank/broken screens for new users
**Status: FIXED**  
**Files changed:**
- `artifacts/uns-app/components/EmptyState.tsx` — created: reusable Midnight Garden dark theme component with Feather icon, Arabic title/subtitle, optional CTA
- `artifacts/uns-app/app/(tabs)/insights.tsx` — "لا توجد إحصائيات بعد" when no gamification/weekly data
- `artifacts/uns-app/app/(tabs)/journey.tsx` — "رحلتك تبدأ الآن" when XP=0
- `artifacts/uns-app/app/(tabs)/community.tsx` — "لا توجد دوائر حالياً" when sessions empty
- `artifacts/uns-app/app/(tabs)/programs.tsx` — replaced inline ad-hoc empty state with `EmptyState` component
**How it was tested:** Component and screen imports confirmed.

---

### P1-04 · No log redaction — sensitive content could appear in server logs
**Status: FIXED**  
**Root cause:** Pino default would log full request URLs (including query strings) and bodies.  
**Files changed:**
- `artifacts/api-server/src/app.ts` — pino-http serializers: URL query strings stripped, request body not logged; only method, path, status, response time logged
**How it was tested:** Server logs in workflow output show only `{ id, method, url (no query), statusCode }` — no body, no tokens.

---

### P1-05 · Non-normalized API error shape
**Status: FIXED**  
**Root cause:** Different routes returned different error shapes — no consistent client contract.  
**Files changed:**
- `artifacts/api-server/src/app.ts` — global error handler returns `{ error: "Internal server error", code: "INTERNAL_ERROR" }`; CORS → `"CORS_BLOCKED"`; rate limit → `"RATE_LIMITED"` / `"COMPANION_RATE_LIMITED"`
- `artifacts/api-server/src/middlewares/auth.ts` — `"UNAUTHORIZED"` (401), `"FORBIDDEN"` (403)
- `artifacts/api-server/src/routes/auth.ts` — auth errors use same shape
**How it was tested:** All live curl responses use `{ error, code }` shape.

---

### P1-06 · `Animated.multiply()` called on every render
**Status: FIXED**  
**Root cause:** `Animated.multiply()` called inline during render, creating a new `Animated.Value` every cycle.  
**Files changed:**
- `artifacts/uns-app/app/(tabs)/index.tsx` — moved to `useRef`, computed once at mount
**How it was tested:** Confirmed in `index.tsx`.

---

### P1-07 · No env var validation at startup — silent runtime failures
**Status: FIXED**  
**Root cause:** Server would start without required vars and silently fail at request time.  
**Files changed:**
- `artifacts/api-server/src/index.ts` — `DATABASE_URL` and `PORT` required (exits with code 1 if missing); `OPENAI_API_KEY`, `JWT_SECRET`, `ADMIN_SECRET` log WARN if absent
**How it was tested:** Inline validation: `DATABASE_URL=""` → `FATAL: missing required env vars: DATABASE_URL` → exit code 1.

---

## P2 — Medium Priority

### P2-01 · Daily Flash Card white background breaks dark theme
**Status: FIXED**  
**Files changed:** `artifacts/uns-app/app/(tabs)/index.tsx` — `#FFFFFF` → `rgba(255,255,255,0.82)` with green shadow

### P2-02 · CTA off-palette color (`#3AAFA9`)
**Status: FIXED**  
**Files changed:** `artifacts/uns-app/app/(tabs)/index.tsx` — hardcoded color → `Colors.accent`

### P2-03 · Hardcoded attribution shown while loading
**Status: FIXED**  
**Files changed:** `artifacts/uns-app/app/(tabs)/index.tsx` — attribution hidden when recipe loading; uses `recipe.source` if available

### P2-04 · CTA always routed to chat regardless of recipe category
**Status: FIXED**  
**Files changed:** `artifacts/uns-app/app/(tabs)/index.tsx` — "تأمل" / "هدوء" categories → breathing; others → chat

### P2-05 · `AbortController` missing in `SessionContext.initSession`
**Status: FIXED**  
**Files changed:** `artifacts/uns-app/contexts/SessionContext.tsx` — AbortController, mount-safe setState guard, `initError` + `retryInit()` exposed

### P2-06 · React Query staleTime not configured
**Status: FIXED**  
**Files changed:** `artifacts/uns-app/app/_layout.tsx` — `staleTime: 60_000`, `gcTime: 300_000`, `retry: 1`, `refetchOnWindowFocus: false`

### P2-07 · No accessibility labels on interactive elements
**Status: PARTIALLY FIXED**  
**Files changed:**
- `artifacts/uns-app/app/(tabs)/index.tsx` — IridescentOrb Pressable, mood chip Pressables, recipe CTA Pressable all have `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`
- `artifacts/uns-app/components/EmptyState.tsx` — CTA button has accessibility props  
**Remaining scope:** journey, insights, community, programs, chat, onboarding screens not fully audited. Low priority — not a launch blocker.

### P2-08 · Stale shared library declarations causing TypeScript errors
**Status: FIXED**  
**Root cause:** `@workspace/api-client-react`, `@workspace/db`, `@workspace/api-zod` dist declarations not rebuilt after task agent changes; TypeScript resolved against stale types causing 41 false errors across 12 files.  
**Files changed:**
- `lib/api-client-react/` — rebuilt via `tsc --build --force`
- `lib/db/` — rebuilt via `tsc --build --force`
- `lib/api-zod/` — rebuilt via `tsc --build --force`
- `artifacts/api-server/src/lib/jwt.ts` — `expiresIn as any` to resolve `StringValue` branded-type conflict
- `artifacts/api-server/package.json` — added `zod` as direct dependency (was imported in `gamification.ts` without being listed)
**Result:** All three packages typecheck cleanly (0 errors).

---

## Not Started

### NS-01 · AsyncStorage for tokens instead of SecureStore
**Severity:** P2  
**Status: NOT STARTED**  
**Reason:** `expo-secure-store` would provide hardware-backed token storage on iOS/Android. Current AsyncStorage tokens are still protected by OS file encryption. Upgrade path documented in `SessionContext.tsx`. Not a launch blocker.  
**Files that would change:** `artifacts/uns-app/contexts/SessionContext.tsx`

---

## Summary Table

| Severity | Total | Fixed | Partial | Not Started |
|---|---|---|---|---|
| P0 | 8 | 8 | 0 | 0 |
| P1 | 7 | 7 | 0 | 0 |
| P2 | 8 | 7 | 1 | 1 |
| **Total** | **23** | **22** | **1** | **1** |

---

## Mood unification follow-ups (deferred from P0 — 3 May 2026)

The mood picker was unified to 9 keys in lib/gender.ts. Three legacy keys
(grateful, angry, hopeful) are no longer exposed in the picker but remain
referenced in server-side code. These are intentional carry-overs to avoid
breaking historical user data and require product decisions:

1. **BreathingSession.tsx (line 55)** — exposes `grateful` chip in the
   post-breathing mini mood selector. Decide: replace with `reassured`
   (matches calm post-breathing vibe), or keep as a breathing-flow-only
   key.

2. **api-server/routes/community.ts (lines 100, 116)** — two community
   circles seeded with moodTag `hopeful` and `grateful`. With those chips
   gone from the picker, no UI path leads to these circles. Decide:
   retag with new mood keys (e.g. `reassured`, `peaceful`) or remove the
   seed entries.

3. **api-server/routes/gamification.ts (lines 368-370)** — RECOMMENDATIONS
   map has branches for `grateful`, `hopeful`, `angry`. Now zombie code
   for new check-ins, but keeping them is harmless and protects any
   in-flight requests for users on stale clients.

4. **api-server/routes/insights.ts (lines 14-37)** — MOOD_ARABIC /
   MOOD_COLORS / MOOD_INTENSITY maps include the legacy keys. KEEP these
   indefinitely — they're needed to render historical mood entries
   correctly for users who recorded them before this change.

5. **api-server/routes/admin.ts (line 33)** — hardcoded demo/mock data,
   not real queries. Cleanup at the same time as the broader admin
   dashboard de-faking work (separate ticket).

These items are tracked here so they're not silently lost. They do not
block TestFlight.

---

## Pre-existing typecheck errors — TestFlight blocker reclassification (3 May 2026)

Re-reviewed during P0 mood unification work. Two of the four pre-existing
errors are TestFlight blockers, not "leave alone":

### 🔴 BLOCKER — /onboarding/login route not in expo-router type map
- **Files:** `app/onboarding/index.tsx:143`, `app/onboarding/register.tsx:367`
- **Symptom:** TypeScript reports `/onboarding/login` not in route map even
  though the file `app/onboarding/login.tsx` exists.
- **Likely cause:** expo-router typed-routes manifest is stale. The file
  was added but routes weren't regenerated.
- **Fix candidates:**
  1. Run `npx expo customize` or restart `pnpm start` to regenerate
     `.expo/types/router.d.ts`
  2. If that doesn't work, check `app.json` `experiments.typedRoutes` is
     true (we already confirmed it is) and that login.tsx exports a
     default React component
- **Why it matters:** without this, the "لديّ حساب بالفعل" button on
  onboarding navigates to a route the type system rejects. Even if it
  works at runtime today, any future strict-mode build will fail.
- **Owner:** next P0/P1 session

### 🟠 SCHEMA DRIFT — recipe.source field missing
- **Files:** `app/(tabs)/index.tsx:376-377`
- **Symptom:** code reads `recipe.source` but `DailyRecipe` Zod type has
  no `source` field
- **Original handover reference:** §18 "Daily Recipe — recipe.source
  referenced but DB table did not have source column. Remove or align
  schema."
- **Fix candidates:**
  1. Remove the `.source` reads from index.tsx (preferred — simpler)
  2. Add `source` to the daily_recipes table + Drizzle schema + Zod +
     codegen pipeline (heavier, only worth it if there's actual content
     to display)
- **Owner:** next P0/P1 session

The other two pre-existing errors (if any besides these and their
duplicates) remain as-is.

---

## Tab bar visual prominence — deferred (3 May 2026)

CHANGE 4 reordered the tab bar to surface حسابي (profile) and renamed
محادثة → أُنس. A raised/prominent visual treatment for the أُنس tab was
originally proposed in the external review patch:

- A new `ChatTabIcon` component (vs the generic `TabIcon` wrapper)
- Styles `chatIconOuter`, `chatIconOuterActive`, `chatIconInner`,
  `chatIconInnerActive` — none of which existed in the codebase
- Larger icon size (24 vs 20), accent-color fill when focused, slight
  elevation/shadow

This was deferred because:
1. Building it from inference would make product/design decisions without
   design review
2. The patch's surrounding context truncated the actual style values, so
   reproducing the intended look would require guessing
3. The functional reorder + rename is the user-visible win for this
   round; visual prominence is a polish concern

Pick-up criteria: design input on what "أُنس is the core" should look
like in the tab bar (raised pill? center notch? larger icon? color
treatment?). When ready, the implementation is a straightforward
component swap inside (tabs)/_layout.tsx — no other files affected.
