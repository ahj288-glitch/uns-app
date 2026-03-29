# UNS Remediation Plan

**Source**: Full production-grade audit, March 25 2026  
**Repository**: ahj288-glitch/uns-app  
**Status**: In Progress

---

## Priority Framework

| Priority | Definition |
|---|---|
| P0 | Production blocker — do not ship with any real users |
| P1 | Pre-beta requirement — must be done before any external testing |
| P2 | Pre-launch requirement |
| P3 | Pre-growth / ongoing |

---

## Phase 1 — Quick Wins (COMPLETE)

All high-impact, low-risk changes with no architectural dependencies.

| # | Fix | File(s) | Status |
|---|---|---|---|
| QW-01 | `helmet()` security headers | `api-server/src/app.ts` | ✅ Done |
| QW-02 | CORS explicit allowlist (not `*`) | `api-server/src/app.ts` | ✅ Done |
| QW-03 | Global + companion rate limiting | `api-server/src/app.ts` | ✅ Done |
| QW-04 | Request body size limit (50kb) | `api-server/src/app.ts` | ✅ Done |
| QW-05 | Pino log redaction for sensitive fields | `api-server/src/app.ts` | ✅ Done |
| QW-06 | Normalised error response shape `{ error, code }` | `api-server/src/app.ts` | ✅ Done |
| QW-07 | Env var validation at startup (`DATABASE_URL`, `PORT`) | `api-server/src/index.ts` | ✅ Done |
| QW-08 | Warn on missing optional vars (`OPENAI_API_KEY`, `JWT_SECRET`, `ADMIN_SECRET`) | `api-server/src/index.ts` | ✅ Done |
| QW-09 | `EXPO_PUBLIC_DOMAIN` guard — config error screen instead of silent failure | `uns-app/app/_layout.tsx` | ✅ Done |
| QW-10 | React Query `staleTime: 60s`, `gcTime: 5m`, `retry: 2`, `refetchOnWindowFocus: false` | `uns-app/app/_layout.tsx` | ✅ Done |
| QW-11 | `AbortController` in `SessionContext.initSession()` — prevents setState on unmounted | `uns-app/contexts/SessionContext.tsx` | ✅ Done |
| QW-12 | `initError` + `retryInit()` — session error recovery UI surface | `uns-app/contexts/SessionContext.tsx` | ✅ Done |
| QW-13 | `Animated.multiply()` moved to `useRef` in `IridescentOrb` — prevents new nodes each render | `uns-app/app/(tabs)/index.tsx` | ✅ Done |
| QW-14 | Daily Flash Card: `#FFFFFF` → `rgba(255,255,255,0.82)` + green-tinted shadow | `uns-app/app/(tabs)/index.tsx` | ✅ Done |
| QW-15 | Daily CTA: `#3AAFA9` → `Colors.accent` (#74C69D) | `uns-app/app/(tabs)/index.tsx` | ✅ Done |
| QW-16 | Static "حكمة عربية" attribution hidden when real recipe loaded | `uns-app/app/(tabs)/index.tsx` | ✅ Done |
| QW-17 | CTA action: breathing for `تأمل`/`هدوء` recipes, chat for others | `uns-app/app/(tabs)/index.tsx` | ✅ Done |

---

## Phase 2 — Backend Security Foundation (Task #6 — PLANNED)

**P0 — production blocker**

Implement a real authentication and authorisation layer. The current API has zero access control.

### Scope

**Auth Architecture**
- `POST /api/auth/session` — creates or validates a mobile session, returns a signed JWT access token
- `POST /api/auth/admin` — admin login with `ADMIN_SECRET` env var, returns admin JWT
- `POST /api/auth/refresh` — rotates expired access tokens
- JWT signed with `JWT_SECRET` (HS256), access token 15min, refresh token 7d
- Middleware: `verifyToken(req)` — validates `Authorization: Bearer <token>` on all protected routes
- Middleware: `requireAdmin(req)` — ensures `role === 'admin'` on `/api/admin/*`

**Route Protection**
- Public (no auth): `/api/healthz`, `/api/waitlist`, `/api/auth/*`
- Session-authenticated: all other `/api/*` routes
- Admin-only: `/api/admin/*`

**Session Model Upgrade**
- Mobile `SessionContext`: store JWT in `AsyncStorage` with `uns_access_token` key
- Send `Authorization: Bearer <token>` on all API calls
- Handle 401 responses: clear token + trigger `retryInit()` recovery flow

**Unit Tests**
- `verifyToken` middleware: valid token, expired token, missing token, tampered token
- `requireAdmin`: admin token, user token, no token
- Token generation and expiry

### Files
```
artifacts/api-server/src/
  middlewares/auth.ts       ← verifyToken + requireAdmin
  routes/auth.ts            ← /api/auth/* endpoints
  routes/index.ts           ← wire auth routes, apply middleware
  lib/jwt.ts                ← sign/verify helpers
artifacts/uns-app/
  contexts/SessionContext.tsx ← store JWT, send Authorization header, handle 401
```

---

## Phase 3 — Admin Panel Authentication (Task #7 — PLANNED, depends on Phase 2)

**P0 — admin panel is currently fully public**

### Scope
- Login page (`uns-admin/src/pages/Login.tsx`) — password field + submit, Arabic/English bilingual
- `useAdminAuth` hook — manages token in `localStorage`, expiry check
- `AuthGuard` component — wraps all routes, redirects to `/login` if no valid token
- All admin API calls: inject `Authorization: Bearer <token>` header
- Logout clears token and redirects to login

### Files
```
artifacts/uns-admin/src/
  pages/Login.tsx
  hooks/useAdminAuth.ts
  components/AuthGuard.tsx
  App.tsx                   ← add Login route + wrap Router in AuthGuard
  lib/api.ts                ← auth header injection helper
```

---

## Phase 4 — Empty States + UX Reliability (Task #8 — PLANNED)

**P1 — first-time users see blank/broken screens**

### Scope
- Shared `EmptyState` component: icon, Arabic copy, optional CTA button
- Insights: "سجّل حالتك الأولى" when no check-in history
- Journey: "ابدأ رحلتك" when zero XP / no progress
- Community: "لا توجد دوائر حالياً" when no circles
- Programs: "لا توجد برامج متاحة" when no programs
- Onboarding guard in `app/(tabs)/_layout.tsx`: redirect to onboarding if `uns_onboarding_done` not set in AsyncStorage
- Replace raw `fetch()` in `index.tsx` with `useGetDailyRecipesLatest` hook from `@workspace/api-client-react`
- Add accessibility labels (`accessibilityLabel`, `accessibilityRole`) to IridescentOrb and all primary Pressable elements

### Files
```
artifacts/uns-app/
  components/EmptyState.tsx
  app/(tabs)/_layout.tsx    ← onboarding guard
  app/(tabs)/index.tsx      ← replace raw fetch with hook
  app/(tabs)/insights.tsx   ← empty state
  app/(tabs)/journey.tsx    ← empty state
  app/(tabs)/community.tsx  ← empty state
  app/(tabs)/programs.tsx   ← empty state
```

---

## Deferred / Documented Blockers

| Item | Why deferred | Next step |
|---|---|---|
| Server-side RBAC enforcement | Requires Phase 2 auth complete + DB role schema | Add `role` column to sessions table, enforce in `requireAdmin` |
| AI provider failover wiring | Admin UI exists but companion.ts is hardcoded | Wire provider config from DB after auth is in place |
| Config Engine / Feature Flags backend | Frontend-only | Add `runtime_config` table + evaluation endpoint |
| Sentry error tracking | Requires Sentry DSN secret | Add `SENTRY_DSN` env var, install `@sentry/react-native` and `@sentry/node` |
| GDPR data deletion endpoint | `DELETE /api/sessions/:id` wipes all user data | Add in Phase 3+ |
| CI/CD pipeline | No `.github/workflows` | Add TypeScript check + lint + test gates |
| Semantic AI response caching | Redis not provisioned | Future infrastructure decision |
| ML-based crisis detection | Keyword matching only | Phase 4 / post-launch |

---

## Architecture Decisions

### Why HS256 JWT over sessions table?
The project already uses Drizzle and has a `companionSessionsTable`. Rather than adding a full sessions table with server-side state, HS256 JWT keeps the server stateless while providing token signing and expiry. The sessionId (UUID) becomes the JWT `sub` claim. Refresh tokens are stored in the companion sessions table using an existing field.

### Why ADMIN_SECRET instead of admin user accounts?
The audit recommends admin auth. For the current team size (single team), a shared `ADMIN_SECRET` env var authenticated via JWT is appropriate and avoids a user management system. When the team grows, this transitions naturally to a users table with `role: 'admin'`.

### Why keep AsyncStorage for the JWT (not SecureStore)?
`expo-secure-store` is not universally available on all Expo platforms and requires additional permissions. The JWT itself is already signed/verified server-side, which is the security boundary. `AsyncStorage` is acceptable for the access token in MVP. `SecureStore` is the recommended upgrade before launch.
