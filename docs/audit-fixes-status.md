# Audit Fixes Status Tracker

**Audit**: Production-grade audit, March 25 2026  
**Last updated**: March 25 2026

Legend: ✅ Done | 🔄 In Progress | 📋 Planned | ❌ Blocked | ⏭ Deferred

---

## P0 — Critical (Production Blockers)

| # | Audit Finding | Status | Notes |
|---|---|---|---|
| P0-01 | No authentication on any API endpoint | 📋 Task #6 | JWT middleware + auth routes planned |
| P0-02 | Admin panel fully public (no login) | 📋 Task #7 | Login page + AuthGuard planned, depends on #6 |
| P0-03 | CORS wildcard `*` | ✅ Done | Explicit allowlist via `ALLOWED_ORIGINS` env var |
| P0-04 | No rate limiting on companion route (OpenAI cost exposure) | ✅ Done | 10 req/min per session on `/api/companion/*` |
| P0-05 | Weak session model (plain UUID, no signing) | 📋 Task #6 | JWT access+refresh token, signed with `JWT_SECRET` |
| P0-06 | No helmet security headers | ✅ Done | `helmet()` added to `app.ts` |
| P0-07 | Env var `EXPO_PUBLIC_DOMAIN` silent failure | ✅ Done | Config error screen in `_layout.tsx` |
| P0-08 | No startup validation for critical env vars | ✅ Done | `DATABASE_URL`, `PORT` validated; others warn |

---

## P1 — High (Pre-Beta)

| # | Audit Finding | Status | Notes |
|---|---|---|---|
| H-01 | No onboarding navigation guard | 📋 Task #8 | AsyncStorage check in tabs `_layout.tsx` |
| H-02 | Zero tests anywhere in codebase | 📋 Task #6 | Auth middleware tests added; broader test suite in roadmap |
| H-03 | Raw `fetch()` bypassing generated API client | 📋 Task #8 | Home screen raw fetch → `useGetDailyRecipesLatest` hook |
| H-04 | `SessionContext.initSession()` no cleanup (unmount leak) | ✅ Done | `AbortController` added |
| H-05 | No error state or recovery in `SessionContext` | ✅ Done | `initError` + `retryInit()` added |
| H-06 | No rate limiting on mutation routes | ✅ Done | 300 req/15 min global limiter |
| H-07 | React Query staleTime 0 — thrashes on focus | ✅ Done | `staleTime: 60s`, `refetchOnWindowFocus: false` |
| H-08 | No error tracking / observability | ⏭ Deferred | Sentry — requires DSN env var secret |

---

## Medium Priority

| # | Audit Finding | Status | Notes |
|---|---|---|---|
| M-01 | Daily Flash Card `#FFFFFF` background — design system violation | ✅ Done | `rgba(255,255,255,0.82)` + green shadow |
| M-02 | CTA color `#3AAFA9` — off-palette | ✅ Done | Replaced with `Colors.accent` (`#74C69D`) |
| M-03 | CTA always opens breathing regardless of recipe type | ✅ Done | Category-based routing (`تأمل`/`هدوء` → breathing, else → chat) |
| M-04 | Hardcoded "حكمة عربية" attribution leaks into real recipe | ✅ Done | Hidden when recipe is loaded |
| M-05 | `Animated.multiply()` in render — new nodes every cycle | ✅ Done | Moved to `useRef` in `IridescentOrb` |
| M-06 | Pino logs sensitive fields (chat messages, mood notes) | ✅ Done | Request body never logged; URL query stripped |
| M-07 | Request body size unbounded | ✅ Done | `limit: '50kb'` on `express.json()` |
| M-08 | Empty states missing on 4 screens | 📋 Task #8 | Insights, Journey, Community, Programs |
| M-09 | Community posts pseudonymous (sessionId in DB) | ⏭ Deferred | Requires privacy policy decision + DB migration |
| M-10 | No accessibility labels on interactive elements | 📋 Task #8 | IridescentOrb + primary Pressables |
| M-11 | Hardcoded avatar "س" — no personalisation | ⏭ Deferred | Requires user profile name field in DB |
| M-12 | Duplicate BlurView/View JSX for mood card (web vs native) | ⏭ Deferred | `PlatformBlurCard` component — low urgency |

---

## Low Priority / Post-Launch

| # | Audit Finding | Status | Notes |
|---|---|---|---|
| L-01 | No CI/CD pipeline | ⏭ Deferred | Add `.github/workflows` — requires GitHub Actions |
| L-02 | RBAC frontend-only (no server enforcement) | ⏭ Deferred | Depends on Phase 2 auth + role schema |
| L-03 | AI provider failover not wired | ⏭ Deferred | Admin UI → companion.ts routing |
| L-04 | Config Engine / Feature Flags backend missing | ⏭ Deferred | Add `runtime_config` table |
| L-05 | No data retention / GDPR deletion | ⏭ Deferred | `DELETE /api/sessions/:id` cascade |
| L-06 | No semantic AI caching | ⏭ Deferred | Requires Redis infrastructure |
| L-07 | ML-based crisis detection | ⏭ Deferred | Post-launch safety improvement |
| L-08 | IridescentOrb 4 concurrent animation loops | ⏭ Deferred | Reduce to 2 for older Android — low priority |
| L-09 | ThemeContext full-tree opacity re-render | ⏭ Deferred | CSS overlay approach — future optimisation |

---

## Summary

| Priority | Total | Done | In Progress | Planned | Deferred/Blocked |
|---|---|---|---|---|---|
| P0 | 8 | 5 | 0 | 3 | 0 |
| P1 (High) | 8 | 4 | 0 | 3 | 1 |
| Medium | 12 | 7 | 0 | 3 | 2 |
| Low | 9 | 0 | 0 | 0 | 9 |
| **Total** | **37** | **16** | **0** | **9** | **12** |

**P0 completion: 5/8 (63%)** — remaining 3 require the auth implementation (Tasks #6, #7)  
**Overall completion: 16/37 (43%)**
