# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## UNS | أُنس — Product Architecture

**Brand**: UNS | أُنس — "warmth of companionship." Midnight Garden palette — surface `#041710`, accent `#74C69D` (mint), primary `#a5d0b9`. All interfaces are Arabic-first, RTL. GOLD IS ABOLISHED.

**Midnight Garden Design System**:
- Surface: `#041710` (background), `#10231c` (cards), `#1a2e26` (elevated), `#1B4332` (CTA)
- Accent: `#74C69D` (mint) — buttons, active states, CTA
- Primary: `#a5d0b9` — text, icons
- Muted: `#4a7a5e` — secondary text
- On Surface: `#e8f5ee` — headings
- No-Line Rule: never use 1px borders; use tonal depth or ghost border `rgba(116,198,157,0.15)`
- Round Eight Rule: min borderRadius 8px, cards 16–20px, buttons borderRadius 999 (pill)
- Fonts: `Tajawal_400Regular` / `Tajawal_700Bold` (Arabic), `BeVietnamPro_400Regular` / `BeVietnamPro_500Medium` (Latin)

### Artifacts

| Artifact | Path | Purpose |
|---|---|---|
| `artifacts/api-server` | API at `/api` | Express backend — all routes |
| `artifacts/uns-app` | `/uns-app/` (Expo) | Mobile app (Arabic-first) |
| `artifacts/uns-admin` | `/uns-admin/` | Admin panel (Arabic RTL) |
| `artifacts/uns-landing` | `/uns-landing/` | Marketing landing page |
| `artifacts/uns-strategy` | `/` | Investor strategy deck |

### API Routes (`artifacts/api-server/src/routes/`)

- `health.ts` — `GET /api/health`
- `waitlist.ts` — Waitlist management
- `companion.ts` — AI companion sessions (OpenAI)
- `moods.ts` — Mood check-ins
- `insights.ts` — Emotional trend analytics
- `admin.ts` — Admin overview & safety monitor (mounted at `/api/admin`)
- `gamification.ts` — XP / streaks / levels / daily loops (mounted at `/api/gamification`)
  - `GET /progress?sessionId` — User XP, streak, level, milestones
  - `POST /checkin-complete` — Awards XP after mood check-in, tracks streak
  - `GET /loop/today?sessionId` — Get/create today's daily loop
  - `POST /loop/complete` — Complete daily loop (+30 XP)
  - `POST /progress/win` — Award a specific win type
  - `GET /stats` — Admin-level aggregated gamification stats
- `community.ts` — Safe space community sessions (mounted flat at `/api`)
  - `GET /community/sessions` — List active sessions (falls back to seed data)
  - `GET /community/sessions/:id/posts` — Posts within a session
  - `POST /community/sessions/:id/posts` — Submit anonymous post (crisis detection)
  - `POST /community/sessions/:id/heart` — Heart a post

### Database Tables (`lib/db/src/schema/`)

- `companionSessions`, `moodCheckins`, `waitlistEntries`, `programs`, `userSessions`
- `userProgress` — XP, streak, level, totalCheckins, totalLoopsCompleted
- `microWins` — Individual win events (checkin, streak_3, streak_7, loop_complete etc.)
- `dailyLoops` — Daily micro-experience state (pending/completed)
- `communitySessions` — Safe community circles
- `communityPosts` — Anonymous posts within sessions

### Mobile App (`artifacts/uns-app/`)

4-tab layout: **Journey** (رحلة) | **Insights** (رؤى) | **Chat** (أُنس) | **Home** (الرئيسية)
Hidden tabs (href: null): mood, community, programs, profile (accessible via navigation)

Key screens:
- `app/onboarding/index.tsx` — 3-step: welcome, dialect selection, intention (Midnight Garden)
- `app/(tabs)/index.tsx` — Home dashboard: breathing orb, greeting, mood chips, featured card, metrics
- `app/(tabs)/chat.tsx` — AI companion chat (redesigned Midnight Garden)
- `app/(tabs)/insights.tsx` — Insights: mood bar chart, key insights, emotion pattern
- `app/(tabs)/journey.tsx` — Journey: 3 stages (إدراك/توازن/طمأنينة), XP bar, quote
- `app/(tabs)/mood.tsx` — Mood check-in (8 moods, intensity, notes) + MicroWin modal
- `app/(tabs)/community.tsx` — Safe community circles + in-session anonymous post feed
- `app/(tabs)/profile.tsx` — Profile: dialect selector, settings, privacy, crisis hotlines
- `app/(tabs)/programs.tsx` — Welfare programs catalogue
- `constants/colors.ts` — Midnight Garden palette (see Brand section above)
- Fonts: `Tajawal_400Regular`, `Tajawal_700Bold`, `BeVietnamPro_400Regular`, `BeVietnamPro_500Medium`

### Gamification System

Levels: **الوعي** (0–300 XP) → **التوازن** (300–700 XP) → **الطمأنينة** (700–1200 XP)
Streak system: consecutive daily check-ins build the chain. Milestones at 3, 7, 14, 30 days.
Daily loop: one micro-experience per day (breathing, gratitude, reflection, body scan, affirmation).

### Admin Panel (`artifacts/uns-admin/`)

RTL sidebar: لوحة التحكم | المستخدمون وقائمة الانتظار | المساحة الآمنة | مراقبة السلامة | إعدادات الذكاء الاصطناعي
Dashboard includes: 6 KPI cards, "نظام التطور العاطفي" (gamification stats + level distribution), community quick panel, user growth chart, mood distribution pie chart.
Community page (`/community`): Session management, moderation queue, safety banner with crisis hotlines.
