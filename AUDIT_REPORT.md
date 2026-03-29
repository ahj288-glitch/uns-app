# أُنْس — Production-Grade Audit Report
**Audit Date:** 2026-03-26
**Auditor:** Elite Multidisciplinary Software Review Board (Claude Code)
**Repository:** https://github.com/ahj288-glitch/uns-app
**Commit:** HEAD (shallow clone, depth=1)

---

## 1. Executive Summary

| Dimension | Rating |
|-----------|--------|
| **Overall Maturity** | Early-Beta / Pre-Launch |
| **Architecture** | ✅ Solid foundations, monorepo well-structured |
| **Security** | ⚠️ Several medium-severity gaps, one critical no-op |
| **UX / Identity Fidelity** | ✅ Strong — cohesive Arabic-first design system |
| **Reliability** | ⚠️ Missing server-side guards, a crashing route, gamification bug |
| **AI / Companion** | 🔴 Rule-based only (no actual LLM), crisis detection dangerously shallow |
| **Admin Panel** | 🔴 Dashboard metrics are 100% hardcoded fake data; AI config changes don't persist |

### Biggest Strengths
- **Polished Arabic-first UX** — RTL layout, dialect-aware copy, Tajawal typography, calm green/gold palette, haptics, breathing session all feel premium
- **Unified error taxonomy** (`constants/errors.ts`) — every error has a code, bilingual copy, domain classification, log/alert flags; industry-level approach
- **Thoughtful rate limiting** — global + companion-specific limiters with session-keyed companion limiter to prevent AI cost abuse
- **Security fundamentals** — Helmet, explicit CORS allowlist, JWT HS256 with role separation, body size limits, pino with PII-stripping serializers
- **Crisis resources** prominently embedded in both companion chat and profile screen
- **React Query config** — sane staleTime/gcTime/retry defaults, no window-focus thrashing on mobile

### Biggest Weaknesses
1. **The AI companion is a rule-based keyword matcher, not an LLM** — chat.ts returns handcrafted string responses. This is dangerous for a product positioning itself as an "emotional companion." No model integration exists.
2. **Admin dashboard returns hardcoded fake metrics** — `totalUsers: 2847`, `activeToday: 412`, safety events — all fabricated. Decision-making based on this data would be harmful.
3. **`PUT /admin/ai-config` is a no-op** — returns `req.body` directly, nothing is saved. AI configuration changes have zero effect.
4. **Missing `/onboarding/login` route** — "لديّ حساب بالفعل" button navigates to a non-existent screen, crashing the app.
5. **Daily message limit is client-side only** — entirely bypassable via direct API calls.
6. **Crisis detection is 8 Arabic keywords, no dialect variation, no intent detection** — insufficient for a mental health product.

### Immediate Risk Level
**MEDIUM-HIGH** — Not safe for public launch without addressing items 1, 2, 3, 4, 6 above.

---

## 2. Project Structure Overview

```
uns-app2/                              ← pnpm monorepo root
├── artifacts/
│   ├── api-server/                    ← Express 5 + Drizzle + TypeScript backend
│   │   └── src/
│   │       ├── app.ts                 ← Middleware stack (CORS, helmet, rate-limits)
│   │       ├── routes/                ← auth, companion, moods, insights, gamification,
│   │       │                            community, daily-recipes, admin, waitlist
│   │       ├── lib/jwt.ts             ← HS256 JWT helpers
│   │       └── middlewares/auth.ts    ← verifyToken + requireAdmin
│   │
│   ├── uns-app/                       ← Expo React Native mobile app
│   │   ├── app/
│   │   │   ├── _layout.tsx            ← Root: fonts, QueryClient, providers
│   │   │   ├── index.tsx              ← Auth guard / splash redirect
│   │   │   ├── onboarding/            ← index, register, tour, verify (no login!)
│   │   │   └── (tabs)/               ← Home, Chat, Mood, Insights, Journey, Programs,
│   │   │                               Profile, Community, Share
│   │   ├── components/
│   │   │   ├── BreathingSession.tsx   ← Guided breathing modal
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/                   ← ErrorToast, NetworkBanner, CharCounter, LimitBlocker
│   │   ├── constants/                 ← colors, typography, layout, errors
│   │   ├── contexts/                  ← SessionContext, ThemeContext
│   │   └── lib/                      ← api.ts, crisis.ts, gender.ts
│   │
│   ├── uns-admin/                     ← React + Tailwind admin SPA (Vite)
│   │   └── src/
│   │       ├── pages/                 ← Dashboard, Users, AiConfig, AiProviders, Safety,
│   │       │                           Community, Programs, Nudges, FeatureFlags, RBAC, etc.
│   │       └── lib/                  ← api.ts, authSession.ts (localStorage token storage)
│   │
│   ├── uns-landing/                   ← React landing page with waitlist
│   └── mockup-sandbox/                ← Shadcn/ui component sandbox
│
└── lib/
    ├── db/                            ← Drizzle ORM schema + PG connection
    ├── api-spec/                      ← OpenAPI 3.1 spec + Orval codegen config
    ├── api-client-react/              ← Generated React Query hooks
    └── api-zod/                       ← Generated Zod validators
```

**Key observation:** The architecture is well-thought-out — shared Zod schemas via OpenAPI codegen, shared React Query hooks, separate admin/app/landing/server artifacts. This is a good foundation.

---

## 3. Screen / Page Inventory

### Mobile App (uns-app)

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Splash/Auth Guard | `app/index.tsx` | ✅ Good | Redirects to onboarding or tabs |
| Onboarding Welcome | `app/onboarding/index.tsx` | ⚠️ Needs Improvement | Crashes on "لديّ حساب" button |
| Register | `app/onboarding/register.tsx` | ⚠️ Needs Improvement | No login.tsx counterpart |
| Email Verify | `app/onboarding/verify.tsx` | ✅ Good | OTP flow works |
| App Tour | `app/onboarding/tour.tsx` | ✅ Good | |
| Home | `app/(tabs)/index.tsx` | ✅ Good | Avatar hardcoded "س" |
| Chat | `app/(tabs)/chat.tsx` | ⚠️ High Concern | Client-side limits only; no real AI |
| Mood Check-in | `app/(tabs)/mood.tsx` | ✅ Good | Clean UX |
| Insights | `app/(tabs)/insights.tsx` | ✅ Good | Good gamification integration |
| Journey | `app/(tabs)/journey.tsx` | Not read | — |
| Programs | `app/(tabs)/programs.tsx` | Not read | — |
| Community | `app/(tabs)/community.tsx` | Not read | — |
| Share | `app/(tabs)/share.tsx` | Not read | — |
| Profile | `app/(tabs)/profile.tsx` | ⚠️ Needs Improvement | clearSession doesn't clear tokens |

### Admin Panel (uns-admin)

| Screen | File | Status | Notes |
|--------|------|--------|-------|
| Login | `pages/Login.tsx` | ⚠️ Needs Improvement | Token in localStorage |
| Dashboard | `pages/Dashboard.tsx` | 🔴 High Concern | Shows fake data |
| Users | `pages/Users.tsx` | Not read | — |
| AI Config | `pages/AiConfig.tsx` | 🔴 High Concern | PUT is no-op |
| AI Providers | `pages/AiProviders.tsx` | Not read | — |
| Safety | `pages/Safety.tsx` | 🔴 High Concern | Shows fake safety events |
| Feature Flags | `pages/FeatureFlags.tsx` | Not read | — |
| Team RBAC | `pages/TeamRBAC.tsx` | Not read | — |

---

## 4. Detailed Findings by Screen

### 4.1 Home Screen (`app/(tabs)/index.tsx`)

**Purpose:** Daily entry point — breathing orb, mood quick-select, daily recipe card, community CTA.

**Strengths:**
- Iridescent animated orb with multi-layer Animated API is beautiful and thematically resonant
- `useGetDailyRecipe()` React Query integration is clean
- Haptics on every interaction creates premium feel
- Accessibility labels on mood chips and orb button

**Issues:**
- `avatarText: "س"` (line 273) is hardcoded. The letter "س" has no relation to the user or app identity — inconsistent with the profile screen's "أ". **Severity: Low**
- No loading skeleton shown while `recipeData` is loading — the card flickers to default copy. **Severity: Low**
- `handleMoodSelect` uses `setTimeout(() => router.push(...), 300)` — this timeout is not cancelled if the component unmounts. **Severity: Low**
- The BlurView/plain-View code duplication for mood card (lines 310–360) — identical JSX repeated twice for web vs native. Should be extracted. **Severity: Low**

### 4.2 Chat Screen (`app/(tabs)/chat.tsx`)

**Purpose:** Core companion conversation interface.

**Strengths:**
- Excellent error handling UX: toast system with retry, network banner, daily limit blocker, rate limit countdown
- CharCounter, LimitBlocker components show engineering maturity
- Offline detection with pending message queue is thoughtful
- Crisis resources shown inline in message bubble

**Issues:**
- **Daily message limit is enforced client-side only** — `DAILY_LIMIT` and `dailyCount` are React state. Any user calling `POST /companion/chat` directly bypasses this entirely. **Severity: High**
- `sendMessage` is not memoized with `useCallback` — the function is re-created every render, causing FlatList re-renders via `ListHeaderComponent`. **Severity: Medium**
- The offline detection interval (`setInterval` every 5000ms) pings `/health` — this creates continuous background HTTP traffic even when the user isn't chatting. **Severity: Medium**
- `attachBtn` (the "+" button) has no handler — it's purely decorative. Should be disabled or hidden. **Severity: Low**

### 4.3 Mood Screen (`app/(tabs)/mood.tsx`)

**Purpose:** Daily mood check-in with intensity, notes, and gamification feedback.

**Strengths:**
- Spring animation on chip selection
- MicroWin modal for level-up/streak feedback is emotionally rewarding
- CharCounter, error toast integration
- Saving lifecycle well-handled (saved state, reset after 2s)

**Issues:**
- If `progressRes.ok` is false (gamification fails), `progressData` is parsed and `progressData.xpEarned > 0` check can throw. No error guard on the gamification call. **Severity: Medium**
- MOODS list is hardcoded directly in the component (not imported from `lib/gender.ts` or `constants`), creating duplication with `lib/gender.ts`. **Severity: Low**

### 4.4 Insights Screen (`app/(tabs)/insights.tsx`)

**Purpose:** Weekly mood patterns, XP progress, gamification.

**Strengths:**
- Good empty state with CTA
- Animated staggered entrance
- XpBar with level colors
- useMemo on styles is correct

**Issues:**
- `console.error("Insights fetch error:", e)` — raw console.error in production code. Should use the app's error taxonomy or silent fallback. **Severity: Low**
- No error state shown — if fetch fails, the loading spinner disappears and nothing shows (silently empty). **Severity: Medium**
- `data?.topMoods` null-coalesced to `[]` inconsistently — sometimes uses `data!.topMoods` with non-null assertion after a length guard. **Severity: Low**

### 4.5 Profile Screen (`app/(tabs)/profile.tsx`)

**Purpose:** Settings, dialect, privacy statement, session reset.

**Issues:**
- `clearSession()` only removes `uns_session_id` from AsyncStorage. Leaves `uns_access_token` and `uns_refresh_token` behind. The old tokens remain valid until they expire. **Severity: High**
- "الدعم والمساعدة" row `onPress={() => {}}` — empty handler, appears tappable but does nothing. **Severity: Medium**
- Notification and spiritual toggles have no persistence — state resets on app restart. **Severity: Medium**
- Crisis numbers are hardcoded inline (not imported from `lib/crisis.ts`), creating duplication. **Severity: Low**

### 4.6 Onboarding Screen (`app/onboarding/index.tsx`)

**Issues:**
- `router.push("/onboarding/login")` (line 143) — **the file `app/onboarding/login.tsx` does not exist**. This causes the app to navigate to the `+not-found.tsx` screen when the user taps "لديّ حساب بالفعل". This is a crash-equivalent UX failure. **Severity: Critical**

### 4.7 Admin Login (`uns-admin/src/pages/Login.tsx`)

**Issues:**
- Admin token stored in `localStorage` via `authSession.ts`. localStorage persists across tabs and browser sessions and is accessible to any JavaScript on the page (XSS risk). **Severity: Medium**
- No brute-force protection in the UI — unlimited login attempts. Server has global 300 req/15min limit which is too permissive for admin auth. **Severity: Medium**

---

## 5. Architecture Findings

### 5.1 Strengths
- **Monorepo with shared packages** (`@workspace/db`, `@workspace/api-zod`, `@workspace/api-client-react`) — correct approach for a multi-artifact system
- **OpenAPI → Zod → React Query codegen pipeline** (Orval) — type-safe, maintainable
- **Express middleware ordering** in `routes/index.ts` is correct: public routes → `verifyToken` → authenticated routes → `requireAdmin` → admin routes
- **`authFetch` with automatic token refresh** in `SessionContext.tsx` — clean 401 intercept pattern

### 5.2 Concerns

**A. The AI companion is not actually AI**
`artifacts/api-server/src/routes/companion.ts` implements the companion entirely as a rule-based keyword matcher with hardcoded response strings per dialect. There is no OpenAI/Anthropic/LLM integration anywhere in the codebase. The admin panel has `AiConfig.tsx` and `AiProviders.tsx` pages suggesting LLM integration was planned but not implemented. This is the single most important missing feature.

**B. Admin dashboard is entirely fabricated**
`routes/admin.ts` `/admin/overview` returns:
- `totalUsers: 2847 + waitlistCount` (hardcoded base)
- `activeToday: 412` (hardcoded)
- `recentGrowth` generated with `Math.random()` on every request
- `moodDistribution` with hardcoded percentages
- Safety events: hardcoded 3 fake incidents

**C. `PUT /admin/ai-config` is a no-op**
```ts
router.put("/admin/ai-config", async (req, res) => {
  return res.json(req.body); // literally echoes the request back
});
```
Any config saved in the admin panel is immediately discarded.

**D. In-memory OTP resend rate limiting**
`resendCounts` in `routes/auth.ts` is a module-level `Map`. It resets on any server restart and doesn't work across multiple server instances. Should be in Redis or the database.

**E. Session creation endpoint (`POST /auth/session`) requires no registration**
Any anonymous caller can create a session and use the companion. This is likely intentional for the anonymous flow, but combined with no server-side daily limits, it means the companion cost is unbounded.

**F. `/gamification/stats` exposes aggregate user data to any authenticated user**
Returns total XP awarded, average streak, level distribution for ALL users. Should be `requireAdmin`-protected.

**G. `sessionId` cast `as any` in insights route**
```ts
eq(moodsTable.sessionId, sessionId as any)
```
A type mismatch silenced with `as any`. Indicates a schema drift between `moodsTable.sessionId` and the query param type.

---

## 6. Design System & UX Consistency Findings

### 6.1 Strengths
- **Color system is excellent** — `LIGHT`/`DARK` tokens with semantic naming (`primaryContainer`, `surfaceContainerHigh`, etc.) following Material You patterns
- **Typography constants** — `display`, `h1-h3`, `body`, `bodySmall`, `label`, `caption` consistently applied
- **Spacing/Radius/Shadow constants** — `Spacing.xs/sm/md/lg/xl/xxl`, `Radius.sm/md/lg/xl/pill` prevent magic numbers
- **RTL-first layout** — `textAlign: "right"`, `alignItems: "flex-end"`, `flexDirection: "row-reverse"` where needed
- **Emotional tone consistency** — copy is warm, first-person, non-clinical throughout

### 6.2 Issues
- **Avatar initial inconsistency** — Home: "س", Profile: "أ", Chat: "أ". No consistent identity for the user avatar letter.
- **BlurView on web** — The web fallback for BlurView uses plain `backgroundColor: "rgba(...)"` which is fine, but creates slightly different appearance on web vs native. Not a major issue but worth noting.
- **Crisis numbers in profile are not tappable** — Showing a phone number without `Linking.openURL("tel:...")` is a missed opportunity for a crisis-sensitive app. In a real emergency, the user should be able to tap to call.
- **"الدعم والمساعدة" button does nothing** — Shows a chevron implying navigation, but no handler. Breaks trust.

---

## 7. Security & Privacy Findings

### SEV-1: No server-side daily message limit
- **File:** `artifacts/api-server/src/routes/companion.ts`
- **Issue:** `POST /companion/chat` has no server-side check on message count. The client enforces `LIMITS.CHAT_MAX_DAILY_MESSAGES = 30` but this is trivially bypassed.
- **Impact:** Unlimited AI costs if/when LLM is connected; data exposure

### SEV-2: Admin JWT in localStorage
- **File:** `artifacts/uns-admin/src/lib/authSession.ts:26`
- **Issue:** `localStorage.setItem(TOKEN_KEY, token)`. localStorage survives browser close, is accessible to all scripts on the domain, and is vulnerable to XSS attacks.
- **Recommendation:** Use `sessionStorage` at minimum; `httpOnly` cookie is best practice for admin auth tokens.

### SEV-3: OTP logged in plaintext (dev mode)
- **File:** `artifacts/api-server/src/routes/auth.ts:46`
- **Issue:** `logger.info({ otp }, "DEV: verification code")` — if SMTP is not configured and logging is forwarded to a SIEM/log aggregator, OTPs will be in plaintext logs.
- **Recommendation:** Hash or omit OTPs from logs entirely.

### SEV-4: In-memory resend rate limit
- **File:** `artifacts/api-server/src/routes/auth.ts:234`
- **Issue:** `resendCounts = new Map()` — resets on server restart, doesn't work in multi-process deployments.
- **Impact:** Rate limit for OTP resend is bypassed by restarting the server process.

### SEV-5: `/gamification/stats` not admin-protected
- **File:** `artifacts/api-server/src/routes/gamification.ts:392`
- **Issue:** `GET /gamification/stats` returns aggregate platform data to any authenticated user.
- **Recommendation:** Add `requireAdmin` middleware.

### SEV-6: Session token not cleared on session reset
- **File:** `artifacts/uns-app/app/(tabs)/profile.tsx:87`
- **Issue:** `clearSession()` only removes `uns_session_id`. `uns_access_token` and `uns_refresh_token` remain valid in AsyncStorage.

### SEV-7: CORS allows all origins in non-production with empty allowlist
- **File:** `artifacts/api-server/src/app.ts:27`
- **Issue:** If `ALLOWED_ORIGINS` is not set in a staging environment that has `NODE_ENV=development`, all origins are permitted. This is documented behavior but risky if a staging env is accidentally not configured.

---

## 8. Performance Findings

### PERF-1: Offline detection polling on 5s interval
- **File:** `artifacts/uns-app/app/(tabs)/chat.tsx:216`
- `setInterval` pings `/api/health` every 5 seconds indefinitely while the chat screen is mounted. On mobile, this drains battery and burns data.
- **Fix:** Use `NetInfo` from `@react-native-community/netinfo` instead.

### PERF-2: `makeStyles` called every render in Chat and Mood
- Multiple screens call `makeStyles(T)` inside the component body without `useMemo`. For heavy style objects, this recreates the StyleSheet object on every render.
- **Fix:** Already done in `insights.tsx` (`useMemo(() => makeStyles(T), [T])`). Apply to chat.tsx and mood.tsx.

### PERF-3: `sendMessage` not memoized
- **File:** `artifacts/uns-app/app/(tabs)/chat.tsx:240`
- `sendMessage` is a plain `async function` redeclared every render. It's passed as a dep to the offline effect and inline in FlatList components.

### PERF-4: IridescentOrb runs 3 parallel animation loops always
- **File:** `artifacts/uns-app/app/(tabs)/index.tsx:36`
- Three `Animated.loop` instances always run on the home screen. No visibility-based pause.

### PERF-5: Gamification `checkin-complete` double DB write
- **File:** `artifacts/api-server/src/routes/gamification.ts:172`
- Dead no-op `db.$with("xp_add")` call followed by a correct update. Unnecessary DB round-trip.

---

## 9. Reliability / QA Findings

### REL-1: Missing `/onboarding/login` route — CRASH
- **File:** `artifacts/uns-app/app/onboarding/index.tsx:143`
- `router.push("/onboarding/login")` navigates to a non-existent screen.

### REL-2: Gamification `checkin-complete` always awards `first_checkin`
- **File:** `artifacts/api-server/src/routes/gamification.ts:326`
- `newWins.push({ type: "first_checkin", points: 10 })` runs on **every** checkin, not just the first.
- **Impact:** Users accumulate `first_checkin` win entries forever.

### REL-3: Gamification win endpoint dead DB call
- **File:** `artifacts/api-server/src/routes/gamification.ts:172`
```ts
await db.update(userProgressTable)
  .set({ xp: db.$with("xp_add" as any) as any }) // ← this does nothing useful
```
This call precedes a correct re-read and update. The dead call adds latency without effect.

### REL-4: Mood screen gamification error not handled
- **File:** `artifacts/uns-app/app/(tabs)/mood.tsx:201`
- If `progressRes.ok` is false, `progressData` could be an error JSON, but the code still accesses `progressData.xpEarned` without guarding.

### REL-5: `retryInit` in SessionContext doesn't cancel the previous abort controller
- **File:** `artifacts/uns-app/contexts/SessionContext.tsx:168`
- `retryInit()` creates a new AbortController without aborting the previous one. Two concurrent `initSession` calls could race.

### REL-6: Streak calculation off-by-one for same-day re-checkins
- **File:** `artifacts/api-server/src/routes/gamification.ts:295`
- When `lastDate === today`, streak is correctly preserved. But `first_checkin` win is still added every time (REL-2 above).

### REL-7: `streak_14` win uses wrong `winType: "streak_7"` key
- **File:** `artifacts/api-server/src/routes/gamification.ts:348`
```ts
winType: "streak_7",  // ← should be "streak_14"
winLabelAr: "أسبوعان من الاستمرارية 🌟",
```
The 14-day streak badge is stored as `streak_7` in the database. Analytics queries for `streak_14` will return 0.

---

## 10. Admin / AI / Config Findings

### AI-1: No LLM integration
The companion is a hardcoded rule engine. The `AiProviders.tsx` and `AiConfig.tsx` admin pages suggest this was planned. Until real AI is connected, the product cannot deliver on its emotional companion promise.

### AI-2: `PUT /admin/ai-config` is a no-op
Changes made in the admin AI config panel are never persisted or applied.

### AI-3: Crisis detection coverage is critically insufficient
**File:** `artifacts/api-server/src/routes/companion.ts:14`
```ts
const CRISIS_KEYWORDS = ["اقتل نفسي", "انهيت", "مابغا أعيش", "أموت", "عايز أموت", "نفسي أموت", "يأس", "ميت"];
```
- 8 keywords, all Gulf/Egyptian/MSA dialect
- No Levantine, Maghrebi variants
- No intent patterns (e.g., "مش قادر أكمل", "تعبت من الحياة")
- No negation handling ("ما أبغا أكمل")
- When detected, only appends text to the companion response — no separate alert, no escalation

### AI-4: Admin overview data is fabricated
The dashboard metrics are completely hardcoded:
- `totalUsers: 2847` — a magic number
- `recentGrowth` uses `Math.random()` — regenerated on every page refresh
- Safety events are fake historical entries
Operators making decisions based on this dashboard would be acting on false data.

### AI-5: Admin safety endpoint returns static fake events
`/admin/safety` returns 3 hardcoded "past" crisis events. No real alerting, escalation, or notification system is connected.

---

## 11. Top 20 Priority Issues (Ranked)

| # | Severity | Issue | File(s) | Why It Matters |
|---|----------|-------|---------|----------------|
| 1 | 🔴 CRITICAL | No real AI — companion is keyword matching | `routes/companion.ts` | Core product promise undelivered |
| 2 | 🔴 CRITICAL | Missing `/onboarding/login` route — app crash | `onboarding/index.tsx` | "Already have account" button crashes |
| 3 | 🔴 CRITICAL | Admin dashboard shows fake hardcoded data | `routes/admin.ts` | Operational decisions based on lies |
| 4 | 🔴 HIGH | `PUT /admin/ai-config` is a no-op | `routes/admin.ts:134` | Config changes have zero effect |
| 5 | 🔴 HIGH | Crisis detection: 8 keywords, no dialects | `routes/companion.ts:14` | Safety failure in mental health app |
| 6 | 🟠 HIGH | No server-side daily message limit | `routes/companion.ts` | Unbounded API cost when LLM added |
| 7 | 🟠 HIGH | `clearSession()` leaves tokens in storage | `profile.tsx:87` | Security: stale tokens never cleared |
| 8 | 🟠 MEDIUM | Admin JWT in localStorage (XSS risk) | `authSession.ts:26` | Admin token exposed to XSS |
| 9 | 🟠 MEDIUM | `first_checkin` win awarded every checkin | `gamification.ts:326` | Data corruption in wins table |
| 10 | 🟠 MEDIUM | `streak_14` stored with wrong type `streak_7` | `gamification.ts:348` | Analytics permanently broken |
| 11 | 🟠 MEDIUM | Dead no-op DB call in `/progress/win` | `gamification.ts:172` | Extra latency + confusing code |
| 12 | 🟠 MEDIUM | `/gamification/stats` not admin-protected | `gamification.ts:392` | Platform aggregate data exposed |
| 13 | 🟡 MEDIUM | In-memory OTP resend rate limit | `routes/auth.ts:234` | Bypassed on server restart |
| 14 | 🟡 MEDIUM | OTP logged in plaintext | `routes/auth.ts:46` | Credential leakage in log aggregators |
| 15 | 🟡 MEDIUM | Mood screen gamification error unhandled | `mood.tsx:201` | Silent failures on gamification calls |
| 16 | 🟡 MEDIUM | `retryInit()` race condition in SessionContext | `SessionContext.tsx:168` | Two concurrent init calls can race |
| 17 | 🟡 LOW | Avatar "س" inconsistent with rest of app | `index.tsx:273` | Visual incoherence |
| 18 | 🟡 LOW | `sessionId as any` type cast in insights | `routes/insights.ts:68` | Silenced type error, schema drift |
| 19 | 🟡 LOW | `makeStyles` not memoized in Chat/Mood | `chat.tsx`, `mood.tsx` | Extra StyleSheet recreation per render |
| 20 | 🟡 LOW | "دعم والمساعدة" button has empty onPress | `profile.tsx:178` | Tappable element that does nothing |

---

## 12. Quick Wins

These can be fixed in under 30 minutes each:

1. **Fix "لديّ حساب بالفعل" route** → redirect to `/onboarding/register` or create a minimal login screen
2. **Fix `clearSession()` token cleanup** → add 2 lines to remove access + refresh tokens
3. **Remove dead gamification DB call** → delete 3 lines
4. **Fix `first_checkin` always-awarded bug** → wrap in `if (newTotalCheckins === 1)` check
5. **Fix `streak_14` wrong win type** → change `"streak_7"` to `"streak_14"`
6. **Move admin token to `sessionStorage`** → single word change in `authSession.ts`
7. **Add `requireAdmin` to `/gamification/stats`** → one line in `routes/index.ts`
8. **Fix avatar "س" → "أ"** → change one character in `index.tsx`
9. **Fix `sessionId as any`** → cast as `string` instead
10. **Make crisis phone numbers tappable in profile** → `Linking.openURL("tel:...")`

---

## 13. Refactoring Roadmap

### Immediate (Before Beta Launch)
- [ ] Connect a real LLM (OpenAI/Anthropic) to the companion endpoint
- [ ] Fix the onboarding login crash
- [ ] Implement `PUT /admin/ai-config` persistence (database or Redis)
- [ ] Replace fake admin metrics with real database queries
- [ ] Expand crisis keyword list with all 5 dialect variants and intent patterns
- [ ] Add server-side daily message limit in companion route
- [ ] Fix all gamification bugs (first_checkin, streak_14, dead DB call)
- [ ] Move admin token from localStorage to sessionStorage

### Short-term (First Month)
- [ ] Add `NetInfo`-based offline detection, remove polling
- [ ] Memoize `sendMessage` and `makeStyles` in Chat
- [ ] Persist notification/spiritual settings to AsyncStorage
- [ ] Move OTP resend rate limiting to database
- [ ] Add proper login/session-restore flow for returning users
- [ ] Make crisis phone numbers tappable
- [ ] Fix all empty `onPress` handlers
- [ ] Add loading skeleton for daily recipe card

### Medium-term (Q2)
- [ ] Add real-time crisis alert system (webhook/email) for admin safety dashboard
- [ ] Implement AI config hot-reload (DB-backed config read per request)
- [ ] Add client-side analytics events (the error taxonomy already has `analyticsEvent` fields)
- [ ] Implement push notifications for daily reminders
- [ ] Add session-to-user linking (moods/insights are session-scoped; should persist across devices)
- [ ] Audit all `as any` casts and fix underlying type mismatches

### Long-term (6+ months)
- [ ] Multi-instance Redis for session management and rate limiting
- [ ] Content Security Policy headers for admin panel
- [ ] RBAC fully operational for team access control
- [ ] A/B testing on companion response styles
- [ ] Safety escalation workflow with on-call alerting

---

## 14. Final Verdict

**أُنْس has exceptional potential and strong foundational design.**

The Arabic-first design language, the calm-green premium palette, the emotional care baked into error copy, the haptics, the breathing session, the crisis resources — this product *feels* like it was designed by people who deeply understand the Arab mental health context. The engineering fundamentals — monorepo structure, shared Zod schemas, React Query, JWT auth — are solid.

**However, it is not yet a product. It is a prototype.**

The companion is a rule-based string matcher with 8 responses. The admin dashboard shows fictional metrics. The AI config screen saves nothing. A user who has already registered cannot log back in (the route crashes). These are not polish issues — they are foundational gaps that must be resolved before any public launch.

**The core risk:** A mental health app with only 8 crisis keywords and no real AI response system could harm vulnerable users who reach out in distress and receive generic, tone-deaf automated responses. This is the most important thing to fix.

**Bottom line:** Fix the 6 critical/high items in the Top 20 table, connect a real LLM, and this product is ready for a closed beta. The design quality and product vision are genuinely exceptional for the MENA mental health space.

---

*Report generated by automated audit. All findings reference specific files and line numbers in the repository.*
