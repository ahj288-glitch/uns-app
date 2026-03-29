# أُنْس — Audit Remediation Status

**Phase 1 Verification Date:** 2026-03-26
**Phase 2 Critical Remediation Date:** 2026-03-26
**Verifier Role:** External QA Lead / Security Reviewer (trust-but-verify + active remediation)
**Base Commit:** e234aae (original audit target)
**All changes are unstaged modifications on top of e234aae**

---

## Toolchain Results (Phase 2 — After Critical Remediation)

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm install` | ✅ PASS | All dependencies present |
| `pnpm run typecheck` (api-server) | ✅ PASS | Zero errors — includes all Phase 2 fixes |
| `pnpm run typecheck` (uns-app) | ✅ PASS | Zero errors |
| `pnpm run typecheck` (uns-admin) | ⚠️ PRE-EXISTING | 4 errors: 2 React VoidOrUndefinedOnly (same as mockup-sandbox), 2 Zod v3/v4 interface mismatch in AiConfig.tsx/Programs.tsx — confirmed pre-existing, our only uns-admin change was `useAdminAuth.ts` line 80 |
| `pnpm run typecheck` (mockup-sandbox) | ⚠️ PRE-EXISTING | 2 React ref duplication errors — existed before any changes |
| `pnpm --filter api-server run build` | ✅ PASS | dist/index.mjs 2.7MB (LLM client added ~200KB) |
| `pnpm --filter uns-admin run build` | ✅ PASS | Built in 3.96s |
| `pnpm --filter api-server run test` | ⚠️ PRE-EXISTING | 10 passed, 3 skipped, 1 failed — failing test requires DATABASE_URL; pre-existing |
| `tsc -b` (lib/db) | ✅ PASS | Declaration files regenerated after `userId` column addition |

---

## Finding Status Table

### CRITICAL Findings

| ID | Finding | Severity | Status | Files Changed |
|----|---------|----------|--------|---------------|
| REL-1 | Missing `/onboarding/login` route — app crash | CRITICAL | ✅ **Fixed** | `artifacts/uns-app/app/onboarding/login.tsx` (created), `artifacts/api-server/src/routes/auth.ts` (POST /auth/login added) |
| AI-1 | No real LLM — companion is rule-based keyword matcher | CRITICAL | ✅ **Fixed** | `artifacts/api-server/src/routes/companion.ts` (OpenAI SDK, dialect-aware system prompt, 10-msg history, rule-based fallback), `artifacts/api-server/src/lib/aiConfig.ts` (shared config), `openai` package added |
| AI-4 | Admin dashboard returns hardcoded fake metrics | CRITICAL | ✅ **Fixed** | `artifacts/api-server/src/routes/admin.ts` (real DB queries: totalUsers, totalSessions, moodDistribution, topDialect, recentGrowth; safety endpoint honest null state) |

### HIGH Findings

| ID | Finding | Severity | Status | Files Changed |
|----|---------|----------|--------|---------------|
| AI-2 | `PUT /admin/ai-config` is a no-op | HIGH | ✅ **Fixed** | `artifacts/api-server/src/routes/admin.ts` |
| AI-3 | Crisis detection: 8 keywords, no dialects | HIGH | ✅ **Fixed** | `artifacts/api-server/src/routes/companion.ts` |
| SEV-1 | No server-side daily message limit | HIGH | ✅ **Fixed** | `artifacts/api-server/src/routes/companion.ts` — `getDailyMessageCount()` queries `messagesTable`, returns 429 `DAILY_LIMIT_REACHED` at 30 messages/day |
| SEV-6 | `clearSession()` leaves tokens in AsyncStorage | HIGH | ✅ **Fixed** | `artifacts/uns-app/app/(tabs)/profile.tsx` |

### MEDIUM Findings

| ID | Finding | Severity | Status | Files Changed |
|----|---------|----------|--------|---------------|
| SEV-2 | Admin JWT in `localStorage` | MEDIUM | ✅ **Fixed** | `artifacts/uns-admin/src/lib/authSession.ts` (→ sessionStorage) |
| SEV-2b | Admin login silently broken — `data.token` not `data.accessToken` | HIGH | ✅ **Fixed** | `artifacts/uns-admin/src/hooks/useAdminAuth.ts` line 80 |
| REL-6 | Login creates new companion session, loses history | HIGH | ✅ **Fixed** | `lib/db/src/schema/sessions.ts` (userId column), `artifacts/api-server/src/routes/auth.ts` (login flow restores existing session) |
| SEV-5 | `/gamification/stats` not admin-protected | MEDIUM | ✅ **Fixed** | `artifacts/api-server/src/routes/gamification.ts` |
| REL-2 | `first_checkin` win awarded every checkin | MEDIUM | ✅ **Fixed** | `artifacts/api-server/src/routes/gamification.ts` |
| REL-7 | `streak_14` stored with wrong `winType: "streak_7"` | MEDIUM | ✅ **Fixed** | `artifacts/api-server/src/routes/gamification.ts` |
| REL-3 | Dead no-op DB call in `/progress/win` | MEDIUM | ✅ **Fixed** | `artifacts/api-server/src/routes/gamification.ts` |
| SEV-3 | OTP logged in plaintext (dev mode) | MEDIUM | 🟡 **Not Started** | Acceptable dev-mode risk; should be removed before prod log forwarding |
| SEV-4 | In-memory OTP resend rate limit | MEDIUM | 🟡 **Not Started** | Requires Redis or DB table |
| REL-4 | Mood screen gamification error unhandled | MEDIUM | 🟡 **Not Started** | Frontend guard improvement |
| REL-5 | `retryInit()` race condition in SessionContext | MEDIUM | 🟡 **Not Started** | Requires AbortController cancel logic |
| PERF-1 | Offline detection polling every 5s | MEDIUM | 🟡 **Not Started** | Requires NetInfo library |
| Profile support button empty `onPress` | MEDIUM | 🟡 **Not Started** | UX gap, no handler |

### LOW Findings

| ID | Finding | Severity | Status | Files Changed |
|----|---------|----------|--------|---------------|
| Avatar "س" inconsistency | LOW | ✅ **Fixed** | `artifacts/uns-app/app/(tabs)/index.tsx` |
| `sessionId as any` in insights route | LOW | ✅ **Fixed** | `artifacts/api-server/src/routes/insights.ts` |
| `DailyRecipe.source` TS error (pre-existing) | LOW | ✅ **Fixed** | `lib/api-client-react/src/generated/api.ts` |
| Crisis phone numbers not tappable | LOW | 🟡 **Not Started** | Needs `Linking.openURL("tel:...")` |
| Notification/spiritual settings not persisted | LOW | 🟡 **Not Started** | Needs AsyncStorage persistence |
| BlurView web duplication | LOW | 🟡 **Not Started** | Code quality, not functional |
| `makeStyles` not memoized in chat/mood | LOW | 🟡 **Not Started** | Performance improvement |

---

## Summary Count

| Status | Count |
|--------|-------|
| ✅ Fixed | 16 |
| 🔴 Blocked / Not Implemented | 1 |
| 🟡 Not Started (lower priority) | 9 |
| **Total findings** | **26** |

---

## Launch Readiness Decision

**Recommendation: CONDITIONAL GO — launch-blocker list is now clear.**

### Fully Fixed (launch-critical)
1. ✅ Real LLM integration with OpenAI (rule-based fallback when key absent)
2. ✅ Server-side daily message limit (429 at 30 msg/day)
3. ✅ Admin dashboard shows real DB data (no more `2847` or `Math.random()`)
4. ✅ Login restores user's existing companion session history
5. ✅ Admin login fix — `accessToken` field mismatch resolved (admin panel was completely broken)
6. ✅ Admin token moved from `localStorage` → `sessionStorage`

### Remaining Blocked (not launch-blockers, documented)
- **OTP plaintext logging** (SEV-3) — only in dev mode when SMTP is not configured; not a production issue if SMTP is always set

### Production Pre-flight Requirements (outside code)
1. Set `OPENAI_API_KEY` environment variable — companion falls back to rule-based without it
2. Run `pnpm --filter @workspace/db run push` to apply `userId uuid` column migration to production DB
3. Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` to disable dev-mode OTP logging
4. Set `ADMIN_SECRET` for admin panel authentication
