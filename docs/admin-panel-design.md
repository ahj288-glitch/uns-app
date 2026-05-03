# أُنس Admin Panel — Design Document

**Status:** Draft v1 — pending review
**Author:** Replit Agent (main)
**Date:** 2026-05-03
**Related work:** `docs/audit-fixes-status.md`, `docs/security-backlog.md`, `docs/remediation-plan.md`
**Implements briefing:** BATCH 2 spec dated 2026-05-03 (sections A–K)

---

## Table of contents

1. Goals & non-goals
2. Information architecture
3. Data model
4. Auth & authorization
5. Tech stack decision
6. Multi-LLM architecture
7. Subscription tiers — schema & enforcement
8. Conversation review — privacy by design
9. Feedback system (admin side, this session)
10. Feature flags
11. Visual design tokens
12. Implementation roadmap (BATCH 3 sub-batches)
13. Open questions for product
14. Risks & mitigations

---

## 1. Goals & non-goals

The admin panel exists to give the أُنْس operations team **runtime control** over the production system without code deploys. Concretely it must enable five capabilities: (a) **operational visibility** — daily/weekly health of users, sessions, AI cost, crisis events; (b) **runtime configuration** — LLM provider selection, rate limits, feature flags, subscription tiers, prompt suffixes; (c) **support workflows** — find a user, see their (consented) conversation history, understand why they're stuck, grant manual subscription overrides; (d) **content moderation & curation** — daily recipes, community posts, programs catalog; and (e) **safety response** — crisis-flag triage queue with required-reason audit trail and append-only action log.

The admin panel is **explicitly not**: (i) a billing console — payment provider dashboards (Stripe/Tap/Apple) remain the source of truth for receipts, refunds, and dunning; we mirror subscription state for tier enforcement only. (ii) A customer-facing portal — users have a separate mobile app surface for their own data and account settings. (iii) A marketing or product-analytics replacement — we do not build cohort funnels, attribution, or A/B test orchestration; those go to a future analytics tool. (iv) An LLM playground — admins can send a single test message to verify a provider is reachable, but cannot freeform chat or run prompt experiments.

**Users:** four roles, defined in §4 — `super_admin`, `admin`, `support`, `read_only`. Initial seeded count: 1 super-admin, scaling to ~5–10 admins/support over the first year. **Concurrency target:** ≤ 20 simultaneous admin sessions; nothing here justifies horizontal scaling. **Performance:** any admin screen renders interactive content within 1.5 s p75 on a wired connection from KSA POP. Data freshness: dashboard widgets cached server-side 60 s; safety/crisis queue is real-time (no cache).

---

## 2. Information architecture

### 2.1 Screens

Each row below specifies one admin screen. Roles use the §4 abbreviations. Endpoints prefixed `/api/admin/` unless noted.

#### 2.1.1 Dashboard
- **Arabic chrome title:** لوحة التحكم
- **Route:** `/`
- **Purpose:** Single-glance operational health for the day and week.
- **Widgets:** Active users today / 7d / 30d (line chart); new registrations 14d (bar); messages sent 14d; crisis flags this week (count + sparkline + click-through to queue); top 3 AI providers by request share; subscription tier mix (donut); waitlist count; recent audit actions (last 10 rows).
- **Required role:** `read_only` and above.
- **Endpoints:** `GET /api/admin/overview` (replaces today's stub-with-fakes; queries real tables).

#### 2.1.2 Users
- **Arabic chrome title:** المستخدمون
- **Route:** `/users` (list), `/users/:id` (detail)
- **Purpose:** Find a user, view their profile + subscription + recent activity, perform support actions.
- **List widgets:** Search box (email / name / id), tier filter, verified filter, created-date range, sortable columns, paginated 50/page.
- **Detail widgets:** Profile block; subscription block (current tier, status, period end, "Grant override" button → §7.4); activity block (last 7 messages-per-day, last 5 mood checkins); session list (links to §2.1.3 Conversations with consent status); audit footprint (every admin action that touched this user).
- **Required role:** `support` and above; tier override requires `admin`; account delete requires `super_admin`.
- **Endpoints:** `GET /api/admin/users` (list, paginated, filtered); `GET /api/admin/users/:id`; `POST /api/admin/users/:id/subscription-override`; `DELETE /api/admin/users/:id` (super-admin only, audited).

#### 2.1.3 Conversations
- **Arabic chrome title:** المحادثات
- **Route:** `/conversations` (search), `/conversations/:sessionId` (detail, gated)
- **Purpose:** Privacy-gated conversation review. Full design in §8. This entry covers only IA shape.
- **List widgets:** Search by user-id or session-id; filter by date range, dialect, has-crisis-flag; columns show metadata only (no body) — pseudonym, message count, consent status, crisis-flag count.
- **Detail widgets:** Metadata header (always visible); body viewer (only renders if §8 gate passes — consent OR crisis-flag); required-reason input modal (≥10 chars) blocks body load.
- **Required role:** `support` (can read with consent or crisis flag, sees role-redacted body); `admin` (can read same conditions, sees full body); `super_admin` (same as admin + bulk export).
- **Endpoints:** `GET /api/admin/conversations` (metadata-only list); `POST /api/admin/conversations/:sessionId/read-request` (writes audit row, returns body if gate passes, 403 + structured reason otherwise); `GET /api/admin/conversations/export` (super-admin only).

#### 2.1.4 Subscription Tiers
- **Arabic chrome title:** الخطط والاشتراكات
- **Route:** `/tiers`
- **Purpose:** Define and edit tier shapes (limits, features). Per-user state lives in §2.1.2.
- **Widgets:** Tier list (free, premium_monthly, premium_yearly seeded); per-tier editor (limits JSON form + JSON-schema validation, features matrix, status toggle); diff preview before save; recent changes (last 10 audit rows).
- **Required role:** `admin` to read; `super_admin` to write.
- **Endpoints:** `GET /api/admin/tiers`; `PUT /api/admin/tiers/:id`; `POST /api/admin/tiers` (super-admin); `DELETE /api/admin/tiers/:id` (super-admin, audited, rejected if any user is on the tier).

#### 2.1.5 AI Configuration
- **Arabic chrome title:** إعدادات الذكاء الاصطناعي
- **Route:** `/ai-config`
- **Purpose:** Manage LLM providers, failover order, model defaults, system-prompt suffix. Absorbs the existing `AiProviders` page (§2.5).
- **Widgets:** Provider list (drag to reorder priority); add/edit provider modal (name, adapter type, encrypted API key, model id, max_tokens, temperature, enabled); per-provider health card (last 24h success rate, p50/p95 latency, circuit-breaker state, last failure); "Send test message" button (one-shot, audited); global settings (default dialect fallback, system-prompt suffix, crisis-threshold sensitivity).
- **Required role:** `admin` to read; `super_admin` to write keys; `admin` to enable/disable + reorder.
- **Endpoints:** `GET /api/admin/llm-providers`; `POST /api/admin/llm-providers`; `PATCH /api/admin/llm-providers/:id`; `DELETE /api/admin/llm-providers/:id`; `POST /api/admin/llm-providers/:id/test`; `GET /api/admin/llm-providers/:id/health` (returns `llm_provider_health` rows).

#### 2.1.6 Rate Limits
- **Arabic chrome title:** حدود الطلبات
- **Route:** `/rate-limits`
- **Purpose:** Per-endpoint and per-tier rate-limit configuration; real-time view of who is currently throttled. Absorbs the existing `ErrorsConfig` page (§2.5).
- **Widgets:** Endpoint list (companion/chat, mood/checkin, login-start, etc.) with current limits; per-tier overrides; live "currently rate-limited sessions" feed (read from in-memory limiter state via debug endpoint); reset button (admin override per session, audited).
- **Required role:** `admin`.
- **Endpoints:** `GET /api/admin/rate-limits`; `PUT /api/admin/rate-limits/:endpoint`; `GET /api/admin/rate-limits/active`; `POST /api/admin/rate-limits/reset` (audited).

#### 2.1.7 Daily Recipes
- **Arabic chrome title:** الومضة اليومية
- **Route:** `/daily-recipes`
- **Purpose:** Curate the daily wisdom card shown on the mobile home screen.
- **Widgets:** Calendar view of scheduled recipes; recipe editor (title/summary/content/category/image/scheduled_for/active); preview pane matching mobile rendering; bulk import (CSV) for super-admin.
- **Required role:** `support` to author, `admin` to publish/schedule.
- **Endpoints:** `GET /api/admin/daily-recipes`; `POST/PATCH/DELETE /api/admin/daily-recipes/:id`; `POST /api/admin/daily-recipes/import` (super-admin).

#### 2.1.8 Crisis Queue
- **Arabic chrome title:** طابور حالات الطوارئ
- **Route:** `/crisis`
- **Purpose:** Triage of automatically-flagged messages from §6 crisis detector. Append-only state machine (§3.10).
- **Widgets:** Queue list grouped by severity (immediate / high / medium / low); per-item card shows masked user identifier, the offending message excerpt (always visible — overrides §8 consent gate because public-safety basis), severity, age, current state; action buttons (mark under-review, record action-taken with required text, dismiss as false-positive with required reason); filter by state and severity.
- **Required role:** `support` to view + act on low/medium; `admin` to act on high/immediate; `super_admin` to override severity.
- **Endpoints:** `GET /api/admin/crisis-flags`; `PATCH /api/admin/crisis-flags/:id` (state transition, server validates allowed transition + required fields).

#### 2.1.9 Feedback Inbox
- **Arabic chrome title:** صندوق الملاحظات
- **Route:** `/feedback`
- **Purpose:** User-submitted feedback intake. The user-side submission UI is **not** built in this batch — see §9.
- **Widgets:** Inbox list with status filter (new / triaged / resolved / wont_fix); per-feedback detail (body, user metadata, attachments — none in v1); status change with optional admin note; bulk status change; CSV export (super-admin only, audited).
- **Required role:** `support` to read + change status; `super_admin` for export.
- **Endpoints:** `GET /api/admin/feedback`; `GET /api/admin/feedback/:id`; `PATCH /api/admin/feedback/:id`; `POST /api/admin/feedback/bulk-status`; `GET /api/admin/feedback/export` (super-admin, audited).

#### 2.1.10 Audit Log
- **Arabic chrome title:** سجل المراجعة
- **Route:** `/audit`
- **Purpose:** Immutable, append-only record of every state-changing admin action and every conversation read. Read-only UI.
- **Widgets:** Filter by actor, target type (user, session, tier, flag…), action verb, date range; row detail pane shows full payload diff; CSV export (super-admin only, audited — meta-audit).
- **Required role:** `read_only` and above to view; `super_admin` for export.
- **Endpoints:** `GET /api/admin/audit-log` (paginated, filtered); `GET /api/admin/audit-log/export`.

#### 2.1.11 Feature Flags
- **Arabic chrome title:** رايات الميزات
- **Route:** `/feature-flags`
- **Purpose:** Toggle features at runtime, percentage rollouts, kill-switches. Full design in §10.
- **Widgets:** Flag list (name, description, current value, rollout %, kill-switch indicator, last changed by, conditions JSON); per-flag editor; "who's affected" preview for percentage rollouts (deterministic bucket calculator); flag-history per row.
- **Required role:** `admin` to toggle non-killswitch; `super_admin` for killswitch and conditions JSON edits.
- **Endpoints:** `GET /api/admin/feature-flags`; `PATCH /api/admin/feature-flags/:key`; `GET /api/admin/feature-flags/:key/history`.

#### 2.1.12 App Settings
- **Arabic chrome title:** إعدادات التطبيق
- **Route:** `/settings`
- **Purpose:** Global runtime knobs that don't fit elsewhere. Absorbs scattered configuration from existing `ConfigEngine` page (§2.5).
- **Widgets:** Maintenance-mode banner control (with Arabic + English message); default dialect; CORS allowlist (super-admin); JWT secret rotation trigger (super-admin, dangerous-action confirmation); allowed-origins display.
- **Required role:** `admin` to read; `super_admin` to write.
- **Endpoints:** `GET /api/admin/settings`; `PATCH /api/admin/settings`; `POST /api/admin/settings/rotate-jwt-secret` (super-admin only, irreversible, audited, requires re-authentication).

### 2.2 Two extra screens that are KEPT from existing admin (real product features)

#### 2.2.1 Programs
- **Arabic chrome title:** البرامج
- **Route:** `/programs`
- **Purpose:** Catalog management for the wellness-program feature consumed by `app/(tabs)/programs.tsx`. Already has real DB (`wellness_programs`) and real CRUD in `admin.ts`.
- **Required role:** `admin`.
- **Status:** Existing handlers reused; UI gets restyling to v2 tokens but no rebuild.

#### 2.2.2 Community
- **Arabic chrome title:** المساحة الآمنة
- **Route:** `/community`
- **Purpose:** Moderation surface for `community_sessions` / `community_posts` consumed by `app/(tabs)/community.tsx`. Existing seed-fallback in server route is acceptable for v1.
- **Widgets:** Sessions list + create/edit; posts moderation (flagged queue, approve/reject); anonymous-name regenerate.
- **Required role:** `support` for post moderation; `admin` for session CRUD.
- **Endpoints:** Existing `GET /api/community/sessions` + new admin endpoints `GET /api/admin/community/posts?flagged=true`, `PATCH /api/admin/community/posts/:id`.

### 2.3 Sidebar grouping (final tree)

The briefing proposed Operations / Configuration / Content / Feedback. After the IA above, I'm proposing a small revision: **Safety** gets its own group because Crisis Queue + Audit Log are both safety-critical and visiting them together is the actual triage workflow.

```
أُنس Admin
├─ Operations
│   ├─ Dashboard           (/)
│   ├─ Users               (/users)
│   └─ Conversations       (/conversations)
├─ Safety
│   ├─ Crisis Queue        (/crisis)
│   └─ Audit Log           (/audit)
├─ Configuration
│   ├─ AI Configuration    (/ai-config)
│   ├─ Rate Limits         (/rate-limits)
│   ├─ Feature Flags       (/feature-flags)
│   └─ App Settings        (/settings)
├─ Content
│   ├─ Daily Recipes       (/daily-recipes)
│   ├─ Programs            (/programs)
│   └─ Community           (/community)
├─ Commerce
│   └─ Subscription Tiers  (/tiers)
└─ Feedback
    └─ Feedback Inbox      (/feedback)
```

Group ordering reflects expected daily-task frequency (Operations every day, Feedback weekly). Commerce is its own one-item group rather than under Configuration so that future commerce-adjacent screens (refunds queue, IAP receipts viewer if we ever build them) have a home.

### 2.4 Permissions matrix per screen

| Screen | super_admin | admin | support | read_only |
|---|---|---|---|---|
| Dashboard | R | R | R | R |
| Users (list) | R | R | R | R |
| Users (subscription override) | RW | RW | — | — |
| Users (delete) | RW | — | — | — |
| Conversations (metadata) | R | R | R | R |
| Conversations (body, gate-passed) | R-full | R-full | R-redacted | — |
| Conversations (export) | RW | — | — | — |
| Subscription Tiers | RW | R | R | R |
| AI Configuration (read) | RW | R | — | — |
| AI Configuration (toggle/reorder) | RW | RW | — | — |
| AI Configuration (key write) | RW | — | — | — |
| Rate Limits | RW | RW | — | — |
| Daily Recipes (author) | RW | RW | RW | R |
| Daily Recipes (publish) | RW | RW | — | R |
| Daily Recipes (bulk import) | RW | — | — | — |
| Crisis Queue (low/medium) | RW | RW | RW | R |
| Crisis Queue (high/immediate) | RW | RW | — | R |
| Crisis Queue (severity override) | RW | — | — | — |
| Feedback Inbox | RW | RW | RW | R |
| Feedback Inbox (export) | RW | — | — | — |
| Audit Log | R | R | R | R |
| Audit Log (export) | RW | — | — | — |
| Feature Flags (non-killswitch) | RW | RW | — | R |
| Feature Flags (killswitch) | RW | — | — | R |
| App Settings | RW | R | — | — |
| App Settings (JWT rotate) | RW | — | — | — |
| Programs | RW | RW | R | R |
| Community (posts) | RW | RW | RW | R |
| Community (sessions) | RW | RW | — | R |

`R` = read; `RW` = read + write; `—` = no access (UI element hidden + server enforces 403).

### 2.5 Existing-page disposition

Every page in today's `artifacts/uns-admin/src/pages/` is classified below. Investigation methodology: checked for backing DB schema, server route, real handler vs hardcoded fakes, and whether the mobile app consumes the underlying feature.

| Existing page | Bucket | Destination | Rationale |
|---|---|---|---|
| `Dashboard.tsx` | KEEP | `/` | Real product purpose; existing handler returns hardcoded fakes (see §5 evidence) — handler will be rebuilt to query real tables. |
| `Users.tsx` | KEEP | `/users` | Already wired to a real (if minimal) endpoint; rebuild for the per-user detail view. |
| `Login.tsx` | KEEP (rewrite) | `/login` | Public route. Will be fully rewritten in §4 — current single-shared-secret flow becomes email + password + TOTP. |
| `AuditLogs.tsx` | KEEP | `/audit` | Today's UI is real but reads no data (no `admin_audit_log` table yet). Rebuild on top of new table (§3.6). |
| `FeatureFlags.tsx` | KEEP | `/feature-flags` | Today's UI is a UI-only mock. Rebuild on top of new table (§3.8) and §10 logic. |
| `Safety.tsx` | KEEP (rename) | `/crisis` | Renamed Crisis Queue. Today returns hardcoded `recentEvents` from `admin.ts`. Rebuild on top of new `crisis_flags` table (§3.10). |
| `DailyRecipes.tsx` | KEEP | `/daily-recipes` | Already real (uses `daily_recipes` table). Restyle only. |
| `AiConfig.tsx` | KEEP (rebuild) | `/ai-config` | Today returns hardcoded JSON; settings are not persisted. Rebuild on top of new `llm_providers` table. |
| `Programs.tsx` | KEEP | `/programs` | Real DB + real CRUD + mobile consumes it. Restyle only. |
| `Community.tsx` | KEEP | `/community` | Real DB + mobile consumes it. Admin page uses old fetch pattern; migrate to typed client + restyle. |
| `AiProviders.tsx` | ABSORB → AI Configuration | merged into `/ai-config` | Today the page is UI-only; the data model needs `llm_providers` first, after which "providers" and "config" are not two screens — they are one workflow. |
| `TeamRBAC.tsx` | ABSORB → Auth (§4) | merged into `/settings/team` (sub-route) | RBAC management is sensitive enough to live behind the auth/settings cluster, not as a top-level peer to Dashboard. |
| `ErrorsConfig.tsx` | ABSORB → Rate Limits | merged into `/rate-limits` | Today's "errors and limits" page conflates rate-limit thresholds and error-message copy. Rate-limit config goes to the new screen; error-message copy is owned by the mobile app's `constants/errors.ts` and is **not** an admin-runtime concern. |
| `Nudges.tsx` | RETIRE | — | No backing data, no server route, no clear product owner. Future re-introduction (push-notification scheduler) would be a multi-week feature — out of scope. The name is reserved in `feature_flags` for re-enablement. |
| `ConfigEngine.tsx` | RETIRE | — | Generic "config" UI duplicates Feature Flags + App Settings + AI Configuration. Bag of UI without a coherent surface. Functionality covered by §2.1.11 + §2.1.12. |
| `ContentCMS.tsx` | RETIRE | — | Hardcoded content categories, no schema, no API. Real content surfaces (Daily Recipes, Programs) already exist as dedicated screens; a generic CMS adds nothing the operations team can use today. |

**Net change:** 16 existing pages → 14 screens in v2 (12 from the briefing + Programs + Community kept).

---

## 3. Data model

Conventions: all new tables use `uuid` primary keys with `defaultRandom()` unless noted; all tables have `created_at timestamp not null default now()`; all "mostly-config" tables have `updated_at timestamp not null default now()` updated by trigger or app-layer; all timestamps stored UTC. RLS policies assume Supabase but the project currently uses plain Postgres via Drizzle — see §3.12 for migration consideration.

### 3.1 `admin_users`
**Class:** read-write (state).

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| email | text | no | — | unique, lowercased on insert |
| password_hash | text | no | — | argon2id |
| role | text | no | — | enum `super_admin\|admin\|support\|read_only` |
| totp_secret_encrypted | text | yes | null | base32 secret AES-256-GCM-encrypted with `ADMIN_ENCRYPTION_KEY` |
| totp_enrolled_at | timestamp | yes | null | non-null ⇒ 2FA active |
| recovery_codes_hash | text[] | yes | null | argon2id hashes of 10 single-use codes |
| failed_login_count | int | no | 0 | reset on success |
| locked_until | timestamp | yes | null | non-null + future ⇒ account locked |
| last_login_at | timestamp | yes | null | for visibility |
| created_at | timestamp | no | now() | |
| created_by_admin_id | uuid | yes | null | FK → admin_users.id, null only for the seed super-admin |
| disabled_at | timestamp | yes | null | soft-disable; non-null ⇒ cannot log in |

**Indexes:** unique(email); (role) for permission lookups.
**FKs:** `created_by_admin_id` → `admin_users(id)` on delete set null.
**RLS:** read — own row OR caller is super-admin; write — only super-admin (and bootstrap CLI).
**Drizzle sketch:**
```ts
export const adminUsersTable = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["super_admin","admin","support","read_only"] }).notNull(),
  totpSecretEncrypted: text("totp_secret_encrypted"),
  totpEnrolledAt: timestamp("totp_enrolled_at"),
  recoveryCodesHash: text("recovery_codes_hash").array(),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdByAdminId: uuid("created_by_admin_id"),
  disabledAt: timestamp("disabled_at"),
});
```

### 3.2 `subscription_tiers`
**Class:** mostly-read (config).

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| key | text | no | — | unique, machine name e.g. `free`, `premium_monthly` |
| name_ar | text | no | — | display |
| name_en | text | no | — | display |
| price_minor_units | int | yes | null | NULL until product decides |
| currency | text | yes | null | `SAR` / `USD` / null |
| billing_period | text | yes | null | `month` / `year` / null |
| limits_json | jsonb | no | `{}` | shape in §7.1 |
| features_json | jsonb | no | `{}` | shape in §7.1 |
| active | boolean | no | true | inactive ⇒ no new subscriptions allowed |
| sort_order | int | no | 0 | for tier-comparison UI |
| created_at | timestamp | no | now() | |
| updated_at | timestamp | no | now() | |

**Indexes:** unique(key); (active, sort_order).
**RLS:** read — public (mobile app reads to render tier-comparison); write — super-admin only.
**Seed rows:** `free`, `premium_monthly`, `premium_yearly` — inserted by migration with `limits_json` populated and price columns NULL.

### 3.3 `user_subscriptions`
**Class:** read-write (state).

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| user_id | uuid | no | — | FK users.id, indexed |
| tier_id | uuid | no | — | FK subscription_tiers.id |
| status | text | no | — | enum `trial\|active\|grace_period\|expired\|cancelled` (§7.6) |
| started_at | timestamp | no | now() | |
| current_period_end | timestamp | yes | null | null only for free tier |
| cancelled_at | timestamp | yes | null | non-null ⇒ no auto-renew |
| external_provider | text | yes | null | `stripe`/`tap`/`apple_iap`/`manual_override` |
| external_subscription_id | text | yes | null | provider's id, indexed |
| override_admin_id | uuid | yes | null | non-null ⇒ this is a manual grant; FK admin_users.id |
| override_reason | text | yes | null | required when override_admin_id non-null |
| created_at | timestamp | no | now() | |
| updated_at | timestamp | no | now() | |

**Indexes:** (user_id, status); (external_provider, external_subscription_id) unique partial where external_subscription_id is not null; (current_period_end) for renewal-batch jobs.
**Constraint:** at most one row per user_id with status in (`trial`,`active`,`grace_period`) — partial unique index `(user_id) where status in ('trial','active','grace_period')`.
**RLS:** read — own row OR support+; write — admin (override) and webhook handlers (provider sync).

### 3.4 `llm_providers`
**Class:** mostly-read (config); admin can edit.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| name | text | no | — | display, unique |
| adapter_kind | text | no | — | enum `groq\|openai_compatible\|anthropic` (extensible) |
| base_url | text | yes | null | overrides adapter default; e.g. self-hosted endpoint |
| model | text | no | — | provider-specific model id |
| api_key_encrypted | text | no | — | AES-256-GCM payload (§6.5) |
| api_key_nonce | bytea | no | — | per-record 12-byte nonce |
| max_tokens | int | no | 1024 | |
| temperature | real | no | 0.7 | |
| priority | int | no | 100 | lower = tried first |
| enabled | boolean | no | true | |
| created_at | timestamp | no | now() | |
| updated_at | timestamp | no | now() | |
| created_by_admin_id | uuid | yes | null | audit attribution |

**Indexes:** unique(name); (enabled, priority) for failover-chain query.
**RLS:** read — admin+ (api_key_encrypted column-level: super-admin only); write — super-admin (key changes), admin (priority/enabled/temperature).

### 3.5 `llm_provider_health`
**Class:** write-once / append-only.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| provider_id | uuid | no | — | FK llm_providers.id |
| recorded_at | timestamp | no | now() | indexed |
| outcome | text | no | — | enum `success\|timeout\|network_error\|http_5xx\|http_4xx\|circuit_open` |
| latency_ms | int | yes | null | null on circuit_open |
| http_status | int | yes | null | only for http_* outcomes |
| error_message | text | yes | null | sanitized — no API keys, no user message bodies |
| session_id | uuid | yes | null | the affected /companion/chat call, for forensics |

**Indexes:** (provider_id, recorded_at desc); (recorded_at) for retention purges.
**Retention:** rolling 30 days; nightly purge job deletes older rows.
**RLS:** read — admin+; write — server only (insert via internal service role).

### 3.6 `admin_audit_log`
**Class:** write-once / append-only / immutable (no row updates ever).

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| occurred_at | timestamp | no | now() | indexed |
| actor_admin_id | uuid | yes | null | FK admin_users.id; null = system action |
| actor_email_snapshot | text | no | — | denormalized for log integrity even if admin row deleted |
| actor_role_snapshot | text | no | — | role at time of action |
| action | text | no | — | verb e.g. `user.subscription.override`, `conversation.read`, `tier.update` |
| target_type | text | yes | null | `user`/`session`/`tier`/`flag`/`provider`/etc |
| target_id | text | yes | null | string for flexibility (user uuid, session uuid, flag key, etc.) |
| reason | text | yes | null | required for some actions (conversation.read, tier.delete, flag.kill) |
| payload_before | jsonb | yes | null | state snapshot before the change |
| payload_after | jsonb | yes | null | state snapshot after |
| request_ip | text | yes | null | from `X-Forwarded-For` |
| request_user_agent | text | yes | null | |

**Indexes:** (occurred_at desc); (actor_admin_id, occurred_at desc); (target_type, target_id, occurred_at desc); (action, occurred_at desc).
**Constraint:** Postgres `revoke update,delete on admin_audit_log from public, app_role` — only a maintenance role can delete (for retention).
**Retention:** indefinite by default; Section 13 question for product on actual policy.
**RLS:** read — admin+; write — server only (via service role).

### 3.7 `feedback`
**Class:** read-write.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| user_id | uuid | yes | null | FK users.id, nullable for anonymous future-flow |
| body | text | no | — | the feedback text, Arabic or English |
| category | text | yes | null | enum `bug\|feature_request\|content\|other` (filled by user later) |
| status | text | no | `new` | enum `new\|triaged\|resolved\|wont_fix` |
| admin_notes | text | yes | null | internal triage notes |
| triaged_by_admin_id | uuid | yes | null | FK admin_users.id |
| triaged_at | timestamp | yes | null | |
| resolved_by_admin_id | uuid | yes | null | FK admin_users.id |
| resolved_at | timestamp | yes | null | |
| app_version | text | yes | null | sent by client on submission |
| created_at | timestamp | no | now() | |

**Indexes:** (status, created_at desc); (user_id, created_at desc); (created_at).
**RLS:** read — support+; write — public-via-server-side-endpoint (future) for inserts; only support+ for status PATCH.
**Note:** the user-side submission endpoint `POST /feedback` and mobile UI are **not** built in this batch — see §9.

### 3.8 `feature_flags`
**Class:** mostly-read (config); admin can toggle.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| key | text | no | — | PK, machine name e.g. `voice_input_enabled` |
| description | text | no | — | what it controls, in plain English |
| value | jsonb | no | `false` | boolean, string, number, or object |
| rollout_pct | int | no | 100 | 0–100, only meaningful when value is bool-true |
| client_visible | boolean | no | false | true ⇒ included in `GET /flags` mobile boot payload |
| killswitch | boolean | no | false | true ⇒ never cached, always fresh DB read; key ends in `_killswitch` by convention |
| conditions_json | jsonb | yes | null | shape in §10.4 |
| updated_at | timestamp | no | now() | |
| updated_by_admin_id | uuid | yes | null | audit attribution |

**Indexes:** PK on key; (client_visible) partial for `GET /flags`.
**RLS:** read — public (server uses cached read); write — admin (non-killswitch), super-admin (killswitch + conditions edits).
**Seed flags:** `spiritual_mode_enabled` (true), `voice_input_enabled` (false), `community_circles_enabled` (false), `daily_recipes_enabled` (true), `mood_checkin_enabled` (true), `email_verification_enabled` (false — mirrors current `IS_VERIFICATION_ENABLED`), `signup_killswitch` (false), `companion_chat_killswitch` (false), `crisis_alerts_to_admin` (true), `feedback_submission_enabled` (false — gates the future user-side endpoint).

### 3.9 `conversation_review_consent`
**Class:** read-write (state); user-set, admin-read.

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| user_id | uuid | no | — | PK + FK users.id |
| granted | boolean | no | false | tri-state via timestamps below |
| granted_at | timestamp | yes | null | non-null ⇒ user explicitly opted in |
| revoked_at | timestamp | yes | null | non-null ⇒ user revoked (effective immediately) |
| consent_text_version | text | yes | null | hash or version of the consent disclosure shown to user |
| created_at | timestamp | no | now() | |
| updated_at | timestamp | no | now() | |

**Effective consent rule (server-side):** `granted == true AND granted_at IS NOT NULL AND (revoked_at IS NULL OR revoked_at < granted_at)`.
**Indexes:** PK (user_id).
**RLS:** read — own row OR support+; write — own row only (user); admins cannot grant consent on a user's behalf.

### 3.10 `crisis_flags`
**Class:** read-write (state machine).

| Column | Type | Null | Default | Notes |
|---|---|---|---|---|
| id | uuid | no | random | PK |
| user_id | uuid | yes | null | FK users.id; nullable for anonymous-session edge case |
| session_id | uuid | no | — | FK companion_sessions.session_id |
| message_id | uuid | no | — | FK companion_messages.id — the offending message |
| detector | text | no | — | enum `keyword_v1\|keyword_v2\|classifier_v1` |
| matched_terms | text[] | yes | null | which keywords/patterns hit, for explainability |
| severity | text | no | — | enum `low\|medium\|high\|immediate` |
| state | text | no | `new` | enum `new\|under_review\|action_taken\|dismissed_false_positive` |
| opened_by_admin_id | uuid | yes | null | non-null when state moves to under_review |
| opened_at | timestamp | yes | null | |
| resolved_by_admin_id | uuid | yes | null | non-null when state ∈ {action_taken, dismissed_false_positive} |
| resolved_at | timestamp | yes | null | |
| action_taken_text | text | yes | null | required when state = action_taken |
| dismissal_reason | text | yes | null | required when state = dismissed_false_positive (≥10 chars) |
| created_at | timestamp | no | now() | |

**Indexes:** (state, severity, created_at desc) for the queue view; (user_id, created_at desc) for per-user crisis history.
**RLS:** read — support+ for low/medium, admin+ for high/immediate; write — server insert + admin state transitions.

**State machine (per Decision additional):**

```
                    ┌──────────────────────────────┐
                    │             new              │
                    │ (auto-created by detector)   │
                    └─────────────┬────────────────┘
                                  │ admin opens (PATCH state=under_review)
                                  ▼
                    ┌──────────────────────────────┐
                    │        under_review          │
                    │ (opened_by_admin_id set)     │
                    └─────────┬───────────┬────────┘
                              │           │
              required: text  │           │  required: reason ≥10 chars
                              ▼           ▼
                ┌─────────────────┐ ┌─────────────────────────────┐
                │  action_taken   │ │ dismissed_false_positive    │
                │  (terminal)     │ │ (terminal)                  │
                └─────────────────┘ └─────────────────────────────┘
```

**Allowed transitions** (server enforces; rejects anything else with 422):
- `new → under_review` (opened_by_admin_id, opened_at set automatically)
- `under_review → action_taken` (requires action_taken_text non-empty; resolved_by_admin_id, resolved_at set)
- `under_review → dismissed_false_positive` (requires dismissal_reason ≥10 chars; resolved_by_admin_id, resolved_at set)
- Re-open from terminal state: **not allowed** in v1; admins can create a follow-up note via `admin_audit_log` instead.

**Triggers:** server-side automatic on detection in `/companion/chat`. Detector pseudocode in §6.3.

**Severity scoring:** Tier 1 (expanded keyword list) issues `low` or `medium` based on which list matched. Tier 2 (classifier, deferred from BATCH 3 — see §13) adds `high` and `immediate`. Until Tier 2 ships, severity above `medium` only via `super_admin` override (audited).

**Notification:** v1 surfaces flags only on the in-app Crisis Queue badge (real-time count via 30-s polling — WebSocket out of scope). Optional email digest to a configurable group address is **deferred to BATCH 4** unless explicitly prioritized — see §13. (Acknowledging the briefing's `Notification: flags` was truncated; this is the assumed baseline pending your clarification.)

### 3.11 Migration to `companion_sessions` (Decision 2)

Add a `user_id uuid` column to the existing `companion_sessions` table:

```ts
// lib/db/src/schema/sessions.ts — addition
export const companionSessionsTable = pgTable("companion_sessions", {
  sessionId: uuid("session_id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),                         // NEW — nullable, FK users.id
  dialect: text("dialect").notNull().default("gulf"),
  emotionalProfile: jsonb("emotional_profile"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
});
```

**FK:** `user_id` → `users(id)` on delete set null (preserves audit footprint when user is deleted).
**Index:** `(user_id, created_at desc)` for the §8 "user's conversation history" query pattern. Also keep existing PK-only access patterns for legacy `/companion/session` flow.

**Backfill strategy:**
- (a) **Post-migration sessions created by registered users** — populate `user_id` at session creation (`POST /api/auth/session` already has the user, just persists the linkage).
- (b) **Anonymous sessions** (if anonymous flow stays supported beyond MVP — currently it does, see `/auth/session` issuing tokens for anonymous companions) — `user_id` stays NULL.
- (c) **Pre-migration sessions** — cannot be reliably linked. Decision per briefing: **Option α (leave NULL) + retention policy: orphan sessions auto-purge after 12 months of inactivity** (job runs nightly, deletes companion_sessions WHERE user_id IS NULL AND last_active_at < now() - interval '12 months', cascades to companion_messages). Rationale: (i) no reliable linkage attribution exists; backfilling from logs is forensic-grade work that doesn't pay for itself; (ii) 12-month inactivity threshold is generous enough that any real user who returns after 6 months still finds their session intact; (iii) the §8 admin UI displays orphan sessions as "(unlinked)" with no per-user lookup possible — they remain searchable by session_id only.

### 3.12 Migration ordering

Within BATCH 3, migrations apply in this order to satisfy FK dependencies:

```
M01  admin_users                              (no deps)
M02  admin_audit_log                          (FK → admin_users; nullable)
M03  subscription_tiers                       (no deps)
M04  user_subscriptions                       (FK → users, subscription_tiers, admin_users)
M05  llm_providers                            (FK → admin_users)
M06  llm_provider_health                      (FK → llm_providers)
M07  feature_flags                            (FK → admin_users)
M08  feedback                                 (FK → users, admin_users)
M09  conversation_review_consent              (FK → users)
M10  ALTER companion_sessions ADD user_id     (FK → users)
M11  crisis_flags                             (FK → users, companion_sessions, companion_messages, admin_users)
```

**RLS toolchain note:** the project uses plain Postgres via Drizzle, not Supabase. The "RLS policy" rows above describe the **intent**. Implementation-wise this becomes Express middleware enforcement (`requireRole('admin')`) plus per-query filters. If we ever migrate to Supabase, the policies translate directly to Postgres RLS. This intent-vs-implementation distinction is documented for future migrators; the security model holds either way.

---

## 4. Auth & authorization

### 4.1 Login flow

Proposal: **email + password + optional TOTP 2FA**. No magic-link, no OAuth (no third-party identity provider for admin accounts — the operations team is small and known). Justification: (i) magic-link relies on email delivery, which couples admin login availability to a third-party SMTP provider; (ii) OAuth introduces a SPOF on the IdP and complicates JIT provisioning; (iii) password+TOTP is the operations-tooling baseline that every Saudi-market compliance auditor will recognize.

**Flow:**
1. `POST /api/admin-auth/login-start` body `{ email, password }`. Server: argon2id-verify; if mismatch → increment `failed_login_count`, return 401; if 5 consecutive failures → set `locked_until = now()+15min`, return 423 Locked.
2. If admin has TOTP enrolled: respond 200 `{ challenge_id, requires_totp: true }`. Otherwise (only allowed for `read_only` and `support` roles per §4.4): issue session cookie, return 200.
3. `POST /api/admin-auth/login-verify-totp` body `{ challenge_id, totp_code }`. Server: validate TOTP within ±1 step (30 s window); on success issue session cookie; on failure increment counter as above.
4. Recovery code path: `POST /api/admin-auth/login-verify-recovery-code` accepts a one-time code from the 10 generated at TOTP enrollment; consumes it; same outcome.

### 4.2 Session management

- **Token type:** opaque server-managed session, NOT a JWT. Sessions are stored in a new `admin_sessions` table (id, admin_id, created_at, expires_at, revoked_at, ip, user_agent). Rationale: opaque tokens can be revoked instantly server-side (forced logout, RBAC change, breach response) without waiting for JWT TTL. JWTs are appropriate for the mobile-app surface (stateless, short-lived) but inappropriate for an admin surface where revocability matters more than scale.
- **Storage:** `httpOnly`, `Secure`, `SameSite=Strict` cookie. Not in localStorage (XSS-stealable), not in `Authorization` header (admin SPA + cookie is the standard pairing).
- **Idle timeout:** 30 minutes of inactivity. Each authenticated request touches `expires_at = now()+30min`.
- **Max session lifetime:** 12 hours absolute, regardless of activity. Forces a daily re-auth.
- **Concurrent sessions:** allowed (admin can be on laptop + phone). Each session is its own row; `admin_sessions` view in the admin's profile shows all live sessions with "revoke" buttons.

### 4.3 Role definitions

Four roles, ordered most→least privileged. The matrix in §2.4 is the authoritative per-screen view; this section defines the role semantics.

- **`super_admin`** — can perform any action, including: create/delete/disable other admins, edit RBAC (currently fixed to four roles, but role assignments per admin), rotate JWT secret, write LLM API keys, edit subscription tier prices and definitions, export audit log, export feedback, override crisis severity, kill-switch flags, delete users. Two super-admins minimum recommended (avoid bus factor of 1).
- **`admin`** — operational scope. Can change LLM priority/enabled/temperature (not keys), edit non-killswitch flags, edit rate limits, write daily recipes + programs + community, grant subscription overrides up to 30-day duration, act on all crisis severities. Cannot create other admins, cannot rotate secrets, cannot delete users, cannot export.
- **`support`** — read-most + narrow write. Can read all metadata; can read conversation bodies (with redaction) when §8 gate passes; can change feedback status; can act on low/medium crisis flags; can author (not publish) daily recipes; can moderate community posts (approve/flag).
- **`read_only`** — strictly read. Can view dashboard, list users, see audit log, see feature-flag values, see crisis queue (no actions). Useful for managers, finance, contractors who need visibility without write authority.

### 4.4 2FA requirements

- **`super_admin`:** TOTP **required** at first login. The seed CLI script issues an enrollment URL the operator must complete before any other admin actions are possible. Recovery codes (10 single-use, argon2id-hashed in `recovery_codes_hash`) shown once at enrollment; downloadable as `.txt`; warning banner that they cannot be re-displayed.
- **`admin`:** TOTP **strongly recommended**, enforced after 7-day grace from account creation. Until enrolled, admin can log in but a banner blocks all write actions with "Enable 2FA to continue."
- **`support`, `read_only`:** TOTP **optional**.

Recovery code regeneration: super-admin can trigger regeneration for another admin (audited; old codes invalidated; new codes presented to that admin at next login via a forced-flow).

### 4.5 Password policy

- **Minimum length:** 12 characters. No maximum (we hash; length is free).
- **Complexity:** no character-class requirements (NIST SP 800-63B §5.1.1.2 explicitly recommends against forced complexity, which yields predictable substitutions). https://pages.nist.gov/800-63-3/sp800-63b.html
- **Rotation:** none mandated (NIST recommends against mandatory rotation; rotate on suspected compromise instead).
- **Breach check:** at password set time, k-anonymity check against the Have I Been Pwned API (https://haveibeenpwned.com/API/v3#PwnedPasswords) — submit first 5 chars of SHA-1 hash, compare returned suffixes locally. Reject if password seen in any known breach. Feature-flagged via `password_breach_check_enabled` in case API is down.
- **Storage:** argon2id, parameters t=3, m=64 MiB, p=1 (OWASP 2023 baseline). https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

### 4.6 Account lockout

- **Trigger:** 5 consecutive failed login attempts (any auth step — password OR TOTP OR recovery code).
- **Lock duration:** 15 minutes; `locked_until` timestamp.
- **Reset:** successful login resets `failed_login_count` to 0. Admin can manually clear another admin's lockout (audited).
- **Distinct from rate limiting:** rate limiting is per-IP / per-endpoint (mass-attack defense); lockout is per-account (credential-attack defense). Both apply.

### 4.7 Initial super-admin bootstrap

The very first super-admin must exist before the admin SPA is reachable, otherwise no one can log in. Bootstrap path:

1. Production deploy ensures `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `ADMIN_ENCRYPTION_KEY`, `JWT_SECRET` are set in the deployment environment.
2. Operator SSHes to (or uses Replit's shell on) the production environment and runs `pnpm --filter @workspace/api-server exec tsx scripts/seed-super-admin.ts`. Script reads the env vars; refuses to run if `admin_users` already has a super_admin row; argon2-hashes the password; inserts a single row with role=super_admin, totp_enrolled_at=null, created_by_admin_id=null; prints a TOTP enrollment URL.
3. Operator opens the admin SPA login page, enters credentials, completes the forced-TOTP-enrollment flow on first login.
4. Operator deletes `ADMIN_SEED_PASSWORD` from the deployment environment (one-shot).

**Secure execution path:** `ADMIN_SEED_PASSWORD` is pasted into the deployment env vars manually via the Replit Secrets UI, never committed to git, never logged. The script reads-and-zeroes the env var after use (best-effort — Node doesn't guarantee memory zeroing, but the exit-after-one-row design minimizes the window).

### 4.8 Migration from current admin auth (Decision 3)

The existing `/api/auth/admin` endpoint validates a single shared `ADMIN_SECRET` env var and issues a `role=admin` JWT. Migration plan:

- **Phase 1** (BATCH 3, sub-batch 3.2): `admin_users` table ships, `seed-super-admin.ts` ships, new `/api/admin-auth/*` endpoints ship. Existing `/api/auth/admin` continues to work in parallel. The admin SPA gets a feature-flagged login path: when `admin_login_v2_enabled = true` it shows the new email/password/TOTP form; otherwise the legacy shared-secret form. Default OFF in production at first.
- **Phase 2** (after super-admin is seeded and verified working): flip `admin_login_v2_enabled = true` in production. Both auth paths still work (no users locked out).
- **Phase 3** (BATCH 3, sub-batch 3.10 — final cleanup): remove the legacy `/api/auth/admin` endpoint, remove `Login.tsx`/`useAdminAuth.ts` legacy code paths, remove `ADMIN_SECRET` requirement from server boot.
- **Frontend:** `Login.tsx` and `useAdminAuth.ts` are **fully rewritten**, not patched. The new `useAdminAuth` returns the current admin's `role` (so the SPA can hide UI per §2.4) and exposes a `logout()` that hits `POST /api/admin-auth/logout` to revoke the server-side session.
- **Lock-out safety net:** during Phase 1+2, `ADMIN_SECRET` remains a valid login path so we never lock ourselves out mid-migration. It is removed only after the new flow is confirmed working in production by at least 2 distinct super-admins for ≥7 days.

---

## 5. Tech stack decision

### 5.1 Option A — replace `uns-admin` in place

**What stays:** the artifact registration (`/uns-admin` preview path), the workflow definition, the dependency catalog (React, Vite, Tailwind, shadcn/ui, react-query, recharts, framer-motion, react-hook-form, zod, wouter, lucide), the entire `src/components/ui/` shadcn component set (~50 files; not customized), the `AuthGuard` shell pattern, the `useFetchWithAuth` hook pattern, the `Login.tsx` route slot.

**What gets refactored:** `App.tsx` route table (16 routes → 14, with renames); `AdminLayout.tsx` sidebar (4 groups → 6 groups); `lib/api.ts` extended to handle the new admin endpoints; `Login.tsx` rewritten end-to-end for email/password/TOTP; `useAdminAuth.ts` rewritten for opaque sessions + role; `Dashboard.tsx`, `Users.tsx`, `Safety.tsx`, `AiConfig.tsx` rewritten on top of real (not stub) endpoints; new pages added (`Conversations.tsx`, `Tiers.tsx`, `RateLimits.tsx`, `Crisis.tsx`, `Feedback.tsx`, `Settings.tsx`).

**What gets removed:** `AiProviders.tsx` (absorbed), `ConfigEngine.tsx` (retired), `ContentCMS.tsx` (retired), `ErrorsConfig.tsx` (absorbed into `RateLimits.tsx`), `Nudges.tsx` (retired), `TeamRBAC.tsx` (absorbed into `Settings.tsx` sub-route), the hardcoded fakes in `admin.ts` server route, the `ADMIN_SECRET` legacy login (in Phase 3).

**Migration risk:**
- Shared git history means every `git blame` traces back through deletes; cognitive overhead during reviews ("is this file still used?").
- Active TestFlight build at the moment uses the existing `uns-admin` URL — replacing in place means the URL keeps working but content changes under their feet. Operations team needs a heads-up.
- Low technical risk: the deps overlap is ~95%, and the routing structure is small.

**Time estimate:** 2 weeks of one engineer. Distribution: ~3 days schema + migrations + new routes scaffolding; ~5 days new UI screens (Conversations, Crisis, Tiers, Feedback, Rate Limits, Settings); ~2 days auth rewrite + 2FA flow; ~2 days dashboard rebuild on real data; remainder testing + QA.

### 5.2 Option B — new `uns-admin-v2` alongside

**Clean slate benefits:**
- Zero retire-or-keep cognitive load — every file in v2 is intentional.
- Allows different navigation library (TanStack Router) if we want typed routes; current uns-admin uses `wouter`, which is fine but not best-in-class for nested routes.
- Easier to express the v2 sidebar/IA without grepping for legacy references.
- No worry about accidentally importing from a retired page.
- Dependency catalog can be tightened (uns-admin imports `@radix-ui/react-toast` separately from `sonner`; v2 standardizes on one).

**Code duplication risk:**
- `src/components/ui/` shadcn set ~50 files would be duplicated across uns-admin and uns-admin-v2 during coexistence. Mitigation: lift shared UI primitives into `lib/admin-ui` workspace package — but this is its own multi-day effort.
- The `useFetchWithAuth` pattern, the `AuthGuard` pattern: small enough to rewrite, but rewriting also means re-discovering the same edge cases (401 retry, base64url padding bug, etc.).

**Coexistence period:**
- uns-admin v1 stays at preview path `/uns-admin`; v2 lives at `/uns-admin-v2` for the duration of BATCH 3.
- v1 retires (artifact removed) only after all 14 v2 screens are launched, audited, and used by the operations team for ≥1 week.
- During coexistence, both panels read the same database and the same admin endpoints; v1's read paths keep working, v1's write paths (e.g., legacy `/api/auth/admin` shared-secret) are gradually disabled.

**Time estimate:** 3 weeks of one engineer. The extra week vs. Option A is: new artifact bootstrap (~half day), re-implementing AuthGuard/fetch patterns (~1 day), shared UI duplication overhead (~1 day), the time spent maintaining v1 in parallel during coexistence (~1.5 days of cumulative drag), plus the v1 retirement/cleanup at the end (~1 day).

### 5.3 Recommendation

**Recommend Option A (replace in place).** Anchored to empirical reality, not abstract preference:

1. **80%+ of v1 page code is stub.** Of 16 pages, 4 are real (Dashboard endpoint stub but page real, Users, DailyRecipes, Programs, Community), 6 are absorbed/retired, 6 need rewrites. So in either option, ~10 of 16 files are touched. Option B does not save us from rewriting them; it adds duplicating the unchanged 4 alongside the rewrite of the 10.
2. **The auth rewrite is the same scope in both options.** Whether `Login.tsx` lives in `uns-admin` or `uns-admin-v2`, the work is identical: TOTP, opaque sessions, role wiring, Phase 1/2/3 cutover.
3. **The IA change is significant but not violent.** 16 → 14 pages, with renames. Sidebar grouping changes. None of this requires a fresh slate to express clearly; `App.tsx` and `AdminLayout.tsx` both fit comfortably in a single review.
4. **The RBAC introduction touches every endpoint, not the SPA shell.** The hard work is server-side (`requireRole` middleware, per-screen permission checks, audit-log instrumentation). The SPA just hides UI based on `useAdminAuth().role`. Either option pays the same server-side cost.
5. **Coexistence cost is real.** During Option B's 1–3 week coexistence, two SPAs are running, two URLs are documented, two builds are tested. Every shared-DB invariant change has to be tested in both. That's not free.
6. **One-week time advantage** for Option A in our estimates, plus avoiding the duplication-cleanup work later.

**Where Option A loses:** if the operations team has a hard requirement that the existing admin URL `/uns-admin` keeps working unchanged during BATCH 3 (e.g., active production support on it during the migration window), Option B's coexistence becomes valuable. The briefing doesn't suggest that's the case — and the existing dashboards return hardcoded fakes anyway, so there isn't much "production use" to disrupt.

**Awaiting your call before treating Option A as final.**

---

## 6. Multi-LLM architecture

The briefing requires building the abstraction even though we ship Groq only. Goal: adding a second provider in 6 months should be a config insert + one adapter file, not a fork.

### 6.1 Provider interface

```ts
// artifacts/api-server/src/lib/llm/types.ts
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model: string;
  maxTokens: number;
  temperature: number;
  signal?: AbortSignal;            // for timeout cancellation
}

export interface ChatResult {
  content: string;
  finishReason: "stop" | "length" | "content_filter" | "tool_calls";
  usage: { promptTokens: number; completionTokens: number };
  providerMetadata?: Record<string, unknown>;
}

export interface HealthStatus {
  ok: boolean;
  latencyMs: number;
  error?: string;
}

export interface LLMProvider {
  readonly name: string;
  readonly adapterKind: "groq" | "openai_compatible" | "anthropic";
  chat(messages: ChatMessage[], options: ChatOptions): Promise<ChatResult>;
  healthCheck(): Promise<HealthStatus>;  // sends a 1-token noop to /models or /health
}
```

### 6.2 Provider registry

- **Loading:** at server boot, `loadProviders()` queries `llm_providers WHERE enabled = true ORDER BY priority ASC`, decrypts each `api_key_encrypted` (§6.5), instantiates an adapter per row, holds the array in a module-scoped `let providers: LLMProvider[]`.
- **Refresh trigger:** when admin SPA writes to `/api/admin/llm-providers/*`, the handler calls `invalidateProviderRegistry()` after the DB write. This sets a "stale" flag; the next `getActiveProviders()` re-queries the DB. Lazy refresh (not polling) keeps the hot path free of timer overhead.
- **Caching strategy:** registry is held in memory; per-request lookup is O(N) over a list of <5 providers. No need for Redis — provider count and admin write frequency are both tiny. Multi-instance deploys: each instance refreshes independently after its own writes; eventual consistency window ≤ 60s acceptable for provider config (worst case: an instance briefly uses the previous provider order until its next stale-check tick).

### 6.3 Failover chain logic

```
async function chatWithFailover(messages, options):
  providers = getActiveProviders()  // ordered by priority asc
  for provider in providers:
    if circuitBreakerOpen(provider): continue
    try:
      result = await withTimeout(provider.chat(messages, options), 30s)
      recordHealth(provider, success, latency)
      return result
    catch err:
      recordHealth(provider, classify(err), latency)
      if shouldFailover(err):
        continue
      else:
        throw err  // user-facing — do not fall through
  throw new AllProvidersDown()
```

**`shouldFailover(err)` returns true for:**
- Network error (ECONNREFUSED, ECONNRESET, ETIMEDOUT, DNS failures)
- HTTP 5xx (after one retry against the same provider with exponential backoff: 500ms, then fail through)
- Hard timeout (30s elapsed without first byte)
- Circuit-breaker open (we never enter this branch in the loop above; included for completeness)

**`shouldFailover(err)` returns false for:**
- HTTP 4xx other than 429 — these are real responses (bad request, content policy rejection, auth misconfiguration). Failing over hides config bugs.
- HTTP 429 (rate-limit) — this is a real provider response indicating user/account-level throttling, not a provider failure. Failing over to a different provider for the same user defeats the rate limit. Surface to client with appropriate Retry-After.
- Content-policy rejections (whatever specific status the provider uses; for Groq it's 400 with body markers) — surface to client.

**Logging:** every failover decision writes a row to `llm_provider_health` with the original provider's outcome and an additional row when the next provider succeeds. Admin Crisis Queue / AI Configuration screen surfaces a "failover events last 24h" widget so operations can spot a degraded provider.

### 6.4 Circuit breaker per provider

Three-state machine, per-provider, in-memory:

```
                    closed
                      │
     5 consecutive failures within rolling 60s window
                      ▼
                     open
            (all requests skipped for 5 min)
                      │
              5-min cooldown elapses
                      ▼
                  half_open
                      │
   ┌────────────┬─────┴─────┬────────────────┐
   │ next request          │ next request    │
   │   succeeds            │    fails        │
   ▼                       ▼                 │
 closed                  open ────────────────┘
```

- **State storage:** in-memory per Node process. Cluster-wide consistency is a non-goal — if one instance has a provider open and another has it closed, the user retries hit the open instance until its breaker resets; small inefficiency, no correctness issue.
- **Why not Redis:** provider count tiny, breaker decisions don't need to be globally consistent (worst case: extra requests to a degraded provider for ≤ 30s).
- **Thresholds:** 5 consecutive failures (counter resets on first success); 60s rolling window for "consecutive" (failures older than 60s don't count); 5-min open duration before half-open. All values configurable via `llm_circuit_breaker_*` feature flags (not yet seeded; can be added later without schema change).
- **Admin UI exposure:** AI Configuration screen shows per-provider breaker state badge (closed/open/half_open) with last-state-change timestamp; super-admin can manually reset a breaker (audited).

### 6.5 API key encryption at rest

**Library:** Node standard `crypto` module — AES-256-GCM. No third-party crypto library; reduces supply-chain attack surface.

**Master key:** `ADMIN_ENCRYPTION_KEY` env var, 32 bytes, base64-encoded. Stored in Replit Secrets, never in git. Server refuses to boot if missing or wrong length.

**Per-record nonce:** 12 bytes, generated via `crypto.randomBytes(12)` at insert/update, stored in `api_key_nonce bytea` column. Re-using a nonce with the same key is the GCM cardinal sin; per-record nonces guarantee uniqueness.

**Encrypt:**
```ts
function encryptApiKey(plaintext: string): { ciphertext: string; nonce: Buffer } {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", masterKey, nonce);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // store tag concatenated to ciphertext
  return { ciphertext: Buffer.concat([enc, tag]).toString("base64"), nonce };
}
```

**Decrypt:** symmetric; `getAuthTag()` slice from the trailing 16 bytes of the decoded ciphertext, `setAuthTag()` before `decipher.final()` which throws on mismatch.

**Key rotation strategy:**
- Rotation is initiated by super-admin via `POST /api/admin/settings/rotate-encryption-key` (super-admin only, irreversible-feeling, requires re-authentication, audited). The endpoint accepts a new base64 key.
- Server enters "dual-key" mode: tries new key first, falls back to old key if AuthTag fails. Re-encrypts each `llm_providers` row in a transaction as decrypted; over time all rows migrate to new key. Once all rows migrated, super-admin runs `POST /api/admin/settings/finalize-key-rotation` which sets `ADMIN_ENCRYPTION_KEY` to new key and removes old-key fallback.
- Recommended cadence: annual, or immediately on suspected compromise.
- Key loss recovery: there is no recovery without the key. This is on purpose — losing the key means provider API keys are unreadable, which means we re-enter them via the admin UI (the keys themselves still exist in Groq/OpenAI dashboards). This is documented in the runbook.

References:
- AES-GCM nonce uniqueness: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf §8
- OWASP Cryptographic Storage Cheat Sheet (key management): https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html

### 6.6 Adapters to ship

**Groq adapter** (working — wraps the existing `groq-sdk` instantiation in `companion.ts` behind the `LLMProvider` interface):

```ts
// artifacts/api-server/src/lib/llm/adapters/groq.ts
export function createGroqAdapter(row: LLMProviderRow): LLMProvider {
  const client = new Groq({ apiKey: decryptApiKey(row.apiKeyEncrypted, row.apiKeyNonce) });
  return {
    name: row.name,
    adapterKind: "groq",
    async chat(messages, options) {
      const r = await client.chat.completions.create({
        model: row.model, messages, max_tokens: options.maxTokens,
        temperature: options.temperature,
      }, { signal: options.signal });
      return { content: r.choices[0].message.content, finishReason: r.choices[0].finish_reason as any,
               usage: { promptTokens: r.usage.prompt_tokens, completionTokens: r.usage.completion_tokens },
               providerMetadata: { id: r.id } };
    },
    async healthCheck() { /* GET /models with timeout 5s */ }
  };
}
```

**`OpenAICompatible` adapter (stub)** — proves the abstraction by implementing a full second provider against the OpenAI REST shape (which is implemented by Together, Anyscale, Fireworks, vLLM, LM Studio, Ollama, and many others). No additional dependency: uses `fetch` against `${baseUrl}/v1/chat/completions`. Even though we won't have a non-Groq provider configured in production at launch, the adapter being present (and unit-tested with a mock server) ensures the LLMProvider interface didn't accidentally bake in Groq-isms.

### 6.7 Admin UI controls (recap)

Section 2.1.5 covered IA. Implementation specifics:
- Add provider modal: form fields Name, Adapter Kind (select), Base URL (optional), Model, API Key (write-only — display shows `••••••••` with "Replace key" action), Max Tokens, Temperature, Priority, Enabled.
- Edit provider modal: same fields except `Adapter Kind` is read-only after creation (changing adapter is "delete + recreate").
- Test message: server endpoint `POST /api/admin/llm-providers/:id/test` body `{ message: "Hello, please reply with one word." }`, calls the provider directly (bypassing failover for the test), returns content + latency. Capped at 10 tests per admin per hour to prevent cost abuse. Audited.
- Health history: line chart of last 7 days success rate, p50/p95 latency, total request volume; click-through to row-level `llm_provider_health` entries.

---

## 7. Subscription tiers — schema and ENFORCEMENT

### 7.1 Tier shape

`limits_json` (per `subscription_tiers` row):
```json
{
  "companion_messages_per_day": 30,
  "companion_message_max_chars": 2000,
  "mood_checkins_per_day": 5,
  "breathing_sessions_per_day": 10,
  "history_retention_days": 30,
  "concurrent_sessions": 1,
  "programs_access": ["free"]
}
```

`features_json`:
```json
{
  "voice_input": false,
  "spiritual_layer": true,
  "dialect_choice": true,
  "custom_program_creation": false,
  "priority_support": false,
  "ad_free": true
}
```

Both fields are JSON; the admin tier editor renders a typed form (one input per known key) with a "raw JSON" mode for adding new keys product hasn't formalized yet. Server-side, a shared `LimitsZod` and `FeaturesZod` define the canonical shape; unknown keys are preserved (forward-compatibility) but warned on save.

### 7.2 Initial tiers

Inserted by migration M03:
- `free`: limits as above (30 msg/day, 2000 chars, 5 mood, 10 breathing, 30-day retention, 1 concurrent, programs_access=["free"]); features as above. `price_minor_units`, `currency`, `billing_period` all NULL.
- `premium_monthly`: limits {300/day, 8000 chars, 30 mood, 100 breathing, 365-day retention, 3 concurrent, programs_access=["free","premium"]}; features {voice_input:true, spiritual_layer:true, dialect_choice:true, custom_program_creation:true, priority_support:true, ad_free:true}. Pricing NULL.
- `premium_yearly`: same limits + features as premium_monthly. Pricing NULL.

Numbers are starting proposals; product confirms in §13.

### 7.3 Per-request enforcement on `/companion/chat`

```
middleware enforceTierLimits(req, res, next):
  userId = req.auth.userId  // already verified by JWT middleware
  tier = await getEffectiveTier(userId)  // §7.5 cache-aware
  endpoint = "companion_chat"

  // limit lookup
  dailyLimit = tier.limits_json.companion_messages_per_day
  count = await getMessageCountToday(userId)  // SELECT count(*) WHERE userId AND createdAt > today_start_utc
  if count >= dailyLimit:
    return res.status(429).json(rejectionPayload("DAILY_MESSAGE_LIMIT", tier))

  charLimit = tier.limits_json.companion_message_max_chars
  if req.body.content.length > charLimit:
    return res.status(400).json(rejectionPayload("MESSAGE_TOO_LONG", tier))

  next()
```

Cost: one cached tier lookup + one indexed COUNT per request. Acceptable for current message volume; if the COUNT becomes hot, replace with a per-day per-user counter row updated in a trigger.

The constant `DAILY_MESSAGE_LIMIT = 30` currently hardcoded in `companion.ts` is removed and replaced by this middleware in BATCH 3 sub-batch 3.4.

### 7.4 Caching strategy

- **`getEffectiveTier(userId)`** is a 5-minute in-memory cache (`Map<userId, { tier, fetchedAt }>`), single-process scope. Multi-process: stale-tolerated; max staleness ≤ 5 min.
- **Cache invalidation on upgrade:** when admin grants override OR when payment-provider webhook updates `user_subscriptions`, the handler calls `invalidateUserTierCache(userId)`. The user's NEXT request immediately sees the new tier.
- **No Redis** for v1 — single-instance server, no need. If we move to multi-instance, Redis pub/sub for invalidation is the proper upgrade path.

### 7.5 Per-request enforcement on other endpoints

| Endpoint | Tier limit key | Reject status | Notes |
|---|---|---|---|
| `/companion/chat` | `companion_messages_per_day`, `companion_message_max_chars` | 429, 400 | covered above |
| `/moods` POST | `mood_checkins_per_day` | 429 | one per day is plenty for free; enforcement guards against scripted spam |
| `/companion/session` | `concurrent_sessions` | 429 | counts active sessions (last_active_at within 30 min) |
| `/insights/history` | `history_retention_days` | filter, not reject | server returns only rows newer than `now() - retention_days`; older messages exist in DB but invisible until upgrade |
| `/programs/:id/enroll` | `programs_access` (membership in array) | 403 | tier-gated content |
| `/breathing/sessions` POST | `breathing_sessions_per_day` | 429 | |

### 7.6 Rejection error shape

```json
{
  "error": "DAILY_MESSAGE_LIMIT",
  "code": "DAILY_MESSAGE_LIMIT",
  "message_ar": "بلغت حدّك اليومي. يمكنك المتابعة غداً، أو الترقية للحصول على مزيد من الرسائل.",
  "message_en": "You've reached today's limit. Continue tomorrow, or upgrade for more messages.",
  "current_tier": "free",
  "limit": 30,
  "used": 30,
  "resets_at": "2026-05-04T00:00:00Z",
  "upgrade_cta": {
    "available": true,
    "recommended_tier": "premium_monthly",
    "deep_link": "uns://upgrade?from=companion_chat"
  }
}
```

The mobile app reads `upgrade_cta.available` and `deep_link` to render the upgrade button. The Arabic + English messages allow the app to render in the user's locale without an extra round-trip.

### 7.7 Manual override per user

Admin grants override at `/users/:id`:
- Form fields: target tier (select), duration (days, max 90 for `admin`, unlimited for `super_admin`), reason (free text, required, ≥ 20 chars), notes (optional internal).
- Server: insert `user_subscriptions` row with `external_provider='manual_override'`, `override_admin_id=req.auth.adminId`, `override_reason`, `current_period_end=now()+duration`. Mark previous active row `expired`.
- Audit: `admin_audit_log` row with `action='user.subscription.override'`, full payload before/after.
- Notification: out of scope for v1; future enhancement could email the user "You've been granted Premium for 30 days."

### 7.8 Subscription status states (state machine)

```
              ┌─────────┐
              │  trial  │
              └────┬────┘
                   │ trial period elapses
                   ▼
              ┌─────────┐
   ┌──────────│ active  │──────────────┐
   │ payment  └────┬────┘ user cancels │
   │ fails         │ period elapses    │
   ▼               ▼                   ▼
┌────────────────┐ ┌─────────┐  ┌──────────────┐
│ grace_period   │ │ expired │  │  cancelled   │
└──────┬─────────┘ └─────────┘  └──────┬───────┘
       │ payment recovers              │ period ends (no auto-renew)
       │ within 7 days                 ▼
       ▼                          ┌─────────┐
   active                         │ expired │
       │ 7 days no recovery       └─────────┘
       ▼
   expired
```

`grace_period` is a soft-fail window: the user retains access for 7 days while we retry the payment provider. If recovery succeeds, `active`; if not, `expired`. Tier enforcement during `grace_period` uses the previous active tier's limits.

---

## 8. Conversation review — privacy by design

### 8.1 The 8 constraints (verbatim from briefing section H)

> H1. Default OFF. Admins cannot read user conversations unless the user has explicitly granted review consent OR the system has flagged the conversation as a crisis event.
>
> H2. Per-read audit. Every conversation-body fetch generates an audit log entry BEFORE the body is returned. If the audit write fails, the body is not returned.
>
> H3. Required reason. Every read requires a typed reason from the admin (≥ 10 chars). Reason is stored on the audit row.
>
> H4. Role-redacted body. `support` role sees the body with identifiers (names, emails, phone numbers, account-id-shaped strings) redacted; `admin` sees the full body; `super_admin` same as admin + can export.
>
> H5. No bulk export below super-admin. Bulk export of conversation bodies is gated to super-admin and itself audited per export with required reason.
>
> H6. Crisis exception. If a message has a `crisis_flags` row attached (any state), the corresponding conversation body is readable to support+ regardless of consent state, on the public-safety basis. The audit log records `via_crisis_flag: true` on those reads.
>
> H7. User can revoke. The user can revoke consent at any time from the mobile app; revocation is effective immediately for new reads. Past audit entries (logging that a read happened while consent was active) remain.
>
> H8. Privacy policy gating. The conversation review feature ships ONLY after the privacy policy is updated to disclose the practice, and only after first-launch consent flow surfaces the choice to existing users. Release blocker for production.

### 8.2 Database design recap

`conversation_review_consent` table — §3.9.
`crisis_flags` table — §3.10.
`admin_audit_log` table — §3.6, with `action='conversation.read'` rows for this feature.

### 8.3 Crisis detection upgrade

**Tier 1 (BATCH 3, ships):** expanded keyword list in `artifacts/api-server/src/lib/crisis/keywords.ts`. The current `companion.ts` list of ~17 phrases gets replaced with structured per-dialect lists, intent-pattern matching with negation handling, and severity buckets:
- **Low-severity matchers:** generalized distress phrasing (e.g., "تعبت من كل شيء", "ما أبغى أكمل") — the admin reviews to assess.
- **Medium-severity matchers:** explicit ideation language without immediacy (e.g., "أفكر بالموت", "ودي أنام ولا أصحى") — flagged with reasonable urgency.
- **Negation handling:** "ما أبغى أنتحر" still triggers (negation of an action verb is not an absence of distress; safer to false-positive than miss).
- Per-dialect variants: gulf, levant, egyptian, msa, maghrebi — same patterns transliterated to dialect-specific phrasings.

**Tier 2 (deferred from BATCH 3 — see §13):** lightweight classifier, either fine-tuned on labeled distress data OR an off-the-shelf risk classifier. Adds `high` and `immediate` severity. Until Tier 2 ships, only super-admin can manually escalate a flag's severity to `high` or `immediate`.

### 8.4 Admin UI flow for reading a conversation

```
Admin clicks /conversations
   │
   ▼
GET /api/admin/conversations  ──▶  metadata-only list
                                   (pseudonym, msg count, dates, consent badge, crisis-flag badge)
   │
   │ admin clicks a row
   ▼
/conversations/:sessionId
   │
   │ server checks: do we have a precondition for body access?
   │   - consent.granted == true AND not revoked, OR
   │   - any crisis_flags row exists for this session
   │
   ▼
   IF NO precondition met:
     ────────────────────────────────────────────
     │ Sidebar header always visible:           │
     │   pseudonym, msg count, dialect, dates,  │
     │   "Consent: NOT GRANTED"                 │
     │                                          │
     │ Body area replaced with banner:          │
     │   "User has not granted review consent.  │
     │    Body cannot be displayed."            │
     ────────────────────────────────────────────
     END.

   IF precondition met:
     ────────────────────────────────────────────
     │ Modal pops:                              │
     │   "Reason for reading this conversation: │
     │    [textarea, min 10 chars]"             │
     │   [Cancel]  [Submit and read]            │
     ────────────────────────────────────────────
     │
     │ admin types reason ≥ 10, clicks Submit
     ▼
     POST /api/admin/conversations/:sessionId/read-request
       body { reason }
     │
     │ server (transaction):
     │   1. INSERT admin_audit_log row (action='conversation.read',
     │      target_id=sessionId, reason, actor_*, payload_before=null, payload_after=null,
     │      via_crisis_flag = (crisis-precondition was the reason))
     │   2. SELECT messages WHERE session_id=...
     │   3. apply role redaction (§8.5)
     │   4. return { messages: [...redacted...] }
     │
     │ if step 1 fails: server returns 500, NO body returned (constraint H2)
     │
     ▼
     UI renders messages list, each with role + content (redacted per H4)
     "Reason logged. Audit ID: <uuid>" displayed at top.
```

### 8.5 Role redaction

Implemented server-side, NEVER trust client redaction:
- **`support` role:** redaction patterns applied to `content`:
  - Email regex → `[email redacted]`
  - Phone numbers (Saudi: `+9665…`, `05…`, generic `\d{8,15}`) → `[phone redacted]`
  - Sequences matching account-id shape (UUIDs, long alphanumeric strings) → `[id redacted]`
  - Common Arabic name patterns following "اسمي" / "أنا" → `[name redacted]` (best-effort, false-positive-tolerant)
- **`admin` role:** no redaction.
- **`super_admin` role:** no redaction + can export entire session as JSON.

Redaction is applied via a shared `redactForRole(content, role)` function in `artifacts/api-server/src/lib/privacy/redaction.ts`. Unit-tested with corpus of synthetic Arabic + English samples. Errors on under-redaction (in tests) cause CI failure.

### 8.6 Privacy policy update REQUIRED checklist (release blocker)

Before this feature ships to production, the privacy policy must include:

- [ ] **Disclosure that conversation messages may be reviewed by authorized personnel** under either of two conditions: (a) the user has granted explicit review consent in the app, or (b) the system has automatically flagged the conversation as containing crisis indicators.
- [ ] **Identification of the audit-log practice**: every such review is logged with the reviewer's identity, timestamp, and reason.
- [ ] **Statement of the user's revocation right**: how to revoke consent in-app, and confirmation that past audit entries are not deleted.
- [ ] **Retention statement**: how long messages are stored and when they are deleted.
- [ ] **Crisis-flagged review specifically**: explain that messages flagged as crisis can be reviewed without consent on the basis of public safety.
- [ ] **Roles and access tiers**: describe the four-role model and what each role sees (full vs. redacted).

These are content requirements. Authoring is product/legal owner — see §13 open question.

### 8.7 PDPL compliance notes

Saudi Arabia's Personal Data Protection Law (PDPL) — Royal Decree M/19, dated 9/2/1443H, in effect since September 2023. https://sdaia.gov.sa/en/SDAIA/about/Files/PersonalDataEnglishV2.pdf

Mapping per article:
- **Article 5 (data minimization):** only the data necessary for the stated purpose. Conversation review collects nothing new; it gates access to existing data. The stricter `support`-role redaction is the minimization control.
- **Article 6 (consent):** explicit, informed, revocable, separate from other consents. The `conversation_review_consent` flow with `consent_text_version` and `granted_at`/`revoked_at` columns implements this.
- **Article 9 (legitimate interest carve-out):** Article 6's consent requirement has carve-outs for vital interests of the data subject. Crisis-flagged review without consent (constraint H6) operates on this basis. We document this rationale in the privacy policy.
- **Article 10 (right of access):** users can request a copy of their data; we can satisfy this from `companion_messages` filtered by their `user_id` (post-§3.11 migration).
- **Article 11 (right to deletion):** users can request deletion; we delete `users` row + cascade. Audit log entries are NOT deleted (legitimate interest — security/compliance), but with the user's primary identifier removed they are de-identified.
- **Article 30 (breach notification):** any unauthorized read of conversation content is a personal-data breach under PDPL; SDAIA notification within 72 hours. Our audit log makes this detectable; alerting on anomalous read patterns is BATCH 4 work.

---

## 9. Feedback system (admin side, this session)

### 9.1 DB schema

`feedback` table — §3.7.

### 9.2 Admin UI

- **Inbox view:** `/feedback` shows table — Created, Status, Category, Snippet (first 80 chars), User, Triaged-by. Column sort. Filter chips: status, category, date range.
- **Per-feedback detail:** modal or side-panel showing full body, user metadata (id, email, app_version), admin notes textarea, status select. Save button enabled only on dirty.
- **Status transitions:** `new → triaged | resolved | wont_fix`; `triaged → resolved | wont_fix`; `resolved | wont_fix → triaged` (re-open). Server validates allowed transitions (state machine like §3.10's crisis_flags but simpler).
- **Bulk actions:** select multiple rows, choose new status, type optional bulk note. Server runs in transaction; returns per-row success/failure summary.
- **CSV export:** super-admin only. Audited (`admin_audit_log` row with `action='feedback.export'`, payload=filter parameters used). Download is generated server-side; no streaming sensitive data through the SPA in chunks beyond the response body.

### 9.3 API endpoints

- `GET /api/admin/feedback?status=&category=&page=&limit=` — paginated list, filtered.
- `GET /api/admin/feedback/:id` — single feedback detail.
- `PATCH /api/admin/feedback/:id` body `{ status?, admin_notes? }` — partial update; fills `triaged_by_admin_id` + `triaged_at` on first triage, `resolved_by_admin_id` + `resolved_at` on resolution.
- `POST /api/admin/feedback/bulk-status` body `{ ids: uuid[], status: string, note?: string }` — transactional bulk update; max 100 ids per call.
- `GET /api/admin/feedback/export?status=&category=&from=&to=` — super-admin only; returns CSV with content-disposition header; audited.

### 9.4 NOT in this session

User-side feedback submission UI (mobile screen + composer) and the public endpoint `POST /feedback` are explicitly **out of scope** for BATCH 3. The `feedback` table will accept inserts from a future endpoint, but no inserter exists yet — the inbox starts empty in production until the user-side flow ships in a later batch. The `feedback_submission_enabled` feature flag (§3.8 seed) gates the future endpoint so it can be rolled out independently without code redeploy.

---

## 10. Feature flags

### 10.1 Schema

`feature_flags` table — §3.8.

### 10.2 Server-side reads

Cached 60 seconds per flag key. Cache shape: `Map<key, { value, fetchedAt }>`. Cache miss or stale → DB read → backfill cache.

Kill-switch flags (any flag with `killswitch=true`, by convention also named `*_killswitch`) bypass the cache: every read is a fresh DB query. Rationale: a kill-switch is only flipped during incident response, where staleness up to 60s could keep a broken feature live for an extra minute; that's a minute too long.

```ts
async function getFlag(key: string): Promise<JsonValue> {
  const flag = await getFlagRow(key);  // either cache or DB
  if (flag.killswitch) {
    return await freshDbRead(key).value;
  }
  // apply rollout_pct + conditions
  return resolveValue(flag, callerContext);
}
```

### 10.3 Client-side reads

On mobile-app boot, `GET /flags` returns:
```json
{ "flags": { "voice_input_enabled": false, "spiritual_mode_enabled": true, ... } }
```

Only flags with `client_visible=true` are included. Server-only flags (e.g., `companion_chat_killswitch`, `password_breach_check_enabled`) are never sent to clients.

The mobile app caches the `/flags` response in AsyncStorage with a 1-hour TTL; on next boot, refreshes. There's no live update mechanism in v1.

### 10.4 Rollout percentage and conditions JSON

When `rollout_pct < 100` and the value is boolean-true, server resolves per user:
```ts
function isInRollout(userId: string, flagKey: string, pct: number): boolean {
  const hash = sha256(`${flagKey}:${userId}`).readUInt32BE(0);
  return (hash % 100) < pct;
}
```

Deterministic per-(user, flag): the same user gets a stable answer for a given rollout percentage. Increasing `pct` only adds users (never removes a previously-included user from the rollout, since the bucket is per-user-and-flag).

`conditions_json` schema (optional override):
```json
{
  "tier_in": ["premium_monthly", "premium_yearly"],
  "country_in": ["SA", "AE"],
  "app_version_gte": "1.4.0",
  "app_version_lt": "2.0.0"
}
```

Conditions are AND-combined. If conditions are present, `rollout_pct` applies only to users matching conditions (e.g., "30% of Premium users in SA running ≥1.4.0").

### 10.5 Admin UI

`/feature-flags` per §2.1.11. Edit modal includes a "preview affected users" widget that runs the deterministic bucket calculation against a sample of 1000 active users and reports "X% would be in" — sanity-check before saving.

### 10.6 Initial seed flags

Listed in §3.8 seeds. Repeated here for visibility:
- `spiritual_mode_enabled` (true, client_visible)
- `voice_input_enabled` (false, client_visible) — gates a future feature
- `community_circles_enabled` (false, client_visible) — gates the existing Community tab
- `daily_recipes_enabled` (true, client_visible)
- `mood_checkin_enabled` (true, client_visible)
- `email_verification_enabled` (false, server-only) — replaces the hardcoded `IS_VERIFICATION_ENABLED = false` in `register.tsx` / `login.tsx` / `app/index.tsx`
- `signup_killswitch` (false, server-only, killswitch) — emergency disable of new signups
- `companion_chat_killswitch` (false, server-only, killswitch) — emergency disable of companion chat (e.g., LLM cost spike)
- `crisis_alerts_to_admin` (true, server-only) — gates whether crisis flags are surfaced in admin queue
- `feedback_submission_enabled` (false, server-only) — gates the future user-side `POST /feedback`

### 10.7 Kill-switch convention

Any flag with `killswitch=true` (and by convention named `*_killswitch`) is exempt from cache and from `client_visible`. Kill-switch flips are server-side decisions made during incidents; the client gets a 503 / friendly error, not a flag value. Killswitch toggles are super-admin only and audited with required reason.

---

## 11. Visual design tokens

### 11.1 Theming

- **Light theme** (default for admin chrome — analytical, data-dense readability):
  - Background `#fafbfa`, surface `#ffffff`, surface-2 `#f3f5f4`
  - Text primary `#10231c`, secondary `#4a7a5e`, muted `#7c9b8a`
  - Border `#e3eae6`, border-strong `#c8d6cf`
  - Accent `#74C69D` (mint, matches mobile brand)
  - Destructive `#c0392b`, warning `#d97706`, success `#15803d`
- **Dark theme** (operator preference; not the default):
  - Background `#0a1715`, surface `#10231c`, surface-2 `#163129`
  - Text primary `#e8f5ee`, secondary `#a5d0b9`, muted `#7c9b8a`
  - Border `#1f3b32`, border-strong `#2d5446`
  - Accent `#85d7ad`
  - Destructive `#f87171`, warning `#fbbf24`, success `#4ade80`

Tokens emitted as CSS custom properties; Tailwind reads via `@theme` (Tailwind v4 syntax, already in use).

### 11.2 Component library

shadcn/ui — already present in the existing uns-admin (~50 components installed). Reuse the existing component set; restyle via theme tokens, no per-component overrides.

### 11.3 Layout

Tailwind utilities, sidebar nav (left side, collapsible at <1024px to icon-only rail), top bar with breadcrumbs + admin avatar + theme toggle + logout. Content area max-width 1440px with side gutters; data tables span the available width.

### 11.4 Charts

Recharts (already installed). Standard chart types: line (time series), bar (counts), donut (proportions), sparkline (in dashboard cards). Chart palette derived from theme accent + a 4-step categorical scale.

### 11.5 Typography

- **English chrome** (sidebar, buttons, tables): Inter — variable weight 400/500/600. Loaded via `@fontsource/inter` (no CDN).
- **Arabic user content** (rendered conversation messages, daily recipes preview, feedback bodies): IBM Plex Sans Arabic — weight 400/500/700. Loaded via `@fontsource/ibm-plex-sans-arabic`. Confirms the mobile app's font choice is consistent across surfaces. https://www.ibm.com/plex/specs/

### 11.6 Three reference layouts

Three production admin/dashboard surfaces that capture the data-dense, professional, low-chrome aesthetic the brief targets. Reviewing one of these and approving the direction (or pointing to a different one) before BATCH 3 saves a round-trip.

1. **Linear's settings/admin surfaces** — https://linear.app — sidebar grouping by capability, dense tables, restrained color, strong typographic hierarchy. The "Settings → Members" page is the cleanest reference for our `/users` and `/settings/team` screens.
2. **Vercel dashboard** — https://vercel.com/dashboard — combination of operational widgets (deployments) + log viewers + configuration surfaces under one shell. Mirrors our Operations + Configuration split.
3. **Cal.com admin** — https://cal.com — open-source, inspectable, uses shadcn/ui (the same primitives we have). Direct reference for component usage patterns and form-heavy screens like our tier editor.

### 11.7 RTL / LTR

The admin chrome (sidebar, top bar, table headers) is **LTR** with English labels — operators are bilingual and English chrome supports faster scanning of mixed Arabic/English content. Arabic content sections (conversation viewer, daily recipe preview, feedback body display) are rendered RTL with proper Arabic typography and lineHeight ≥ 1.85× (mirrors the mobile app's audit fix). This dual-direction layout is well-supported by Tailwind's `dir="rtl"` scoped wrappers.

---

## 12. Implementation roadmap (BATCH 3 sub-batches)

The 10 sub-batches from the original briefing, with effort estimate (S=½–1 day, M=2–3 days, L=4–7 days) and dependencies.

| # | Sub-batch | Effort | Depends on |
|---|---|---|---|
| 3.1 | Schema migrations M01–M11 (§3) + Drizzle types + RLS-equivalent middleware scaffolding | M | — |
| 3.2 | `admin_users`, `admin_sessions`, new `/api/admin-auth/*` endpoints, seed CLI, TOTP enrollment, migration to `Login.tsx` v2 + `useAdminAuth` v2 | L | 3.1 |
| 3.3 | `admin_audit_log` write helpers + global instrumentation in admin endpoints | S | 3.1 |
| 3.4 | `subscription_tiers` + `user_subscriptions` + tier-enforcement middleware on all gated endpoints (§7.3, §7.5); replace `DAILY_MESSAGE_LIMIT` constant | L | 3.1, 3.3 |
| 3.5 | `llm_providers` + `llm_provider_health` + `LLMProvider` interface + Groq adapter + OpenAI-compatible stub adapter + failover + circuit breaker | L | 3.1, 3.3 |
| 3.6 | `feature_flags` + caching layer + `GET /flags` endpoint + admin UI page + replace `IS_VERIFICATION_ENABLED` constants with flag reads | M | 3.1, 3.3 |
| 3.7 | `conversation_review_consent` + `crisis_flags` + `/companion/sessions.user_id` ALTER + crisis-detector keyword expansion (Tier 1 only) + admin Crisis Queue UI | L | 3.1, 3.3, mobile-app consent screen (parallel) |
| 3.8 | Admin `/users`, `/conversations`, `/dashboard` rebuilds on real data + redaction module + read-request audit flow | L | 3.4, 3.7 |
| 3.9 | `feedback` + admin Inbox UI + endpoints; user-side submission deferred | M | 3.1, 3.3 |
| 3.10 | Cleanup: retire pages (Nudges/ConfigEngine/ContentCMS), absorb pages, remove legacy `/api/auth/admin`, remove `ADMIN_SECRET` from boot, restyle remaining pages to v2 tokens, add `/settings/team` sub-route | M | all prior |

### 12.1 Dependency graph

```
3.1 ──┬── 3.2 ──┐
      │          │
      ├── 3.3 ──┼── 3.4 ──┐
      │          │          │
      ├── 3.5 ──┘          │
      │                     │
      ├── 3.6              │
      │                     │
      ├── 3.7 ──────────────┼── 3.8 ──┐
      │                     │           │
      └── 3.9 ──────────────┘           │
                                         ▼
                                       3.10
```

### 12.2 Total estimate

Sum: 4×L (16–28 days) + 4×M (8–12 days) + 1×S (½–1 day) ≈ **5–8 weeks** for one full-time engineer, or 3–5 weeks if split across two engineers (3.5 and 3.7 are the natural split because they touch different surfaces). Recommendation matches Option A's 2-week estimate **only for the SPA shell + auth rewrite portion**; the full BATCH 3 scope is broader.

---

## 13. Open questions for product (require your input)

These need your decision before BATCH 3 starts. The doc avoids guessing on any of them.

1. **Free tier exact limits** — proposed 30 msg/day, 2000 char/msg, 5 mood/day, 30-day retention. Confirm or revise.
2. **Premium tier exact prices** — currency (SAR? USD? both?), monthly + annual amounts, regional pricing (PPP-adjusted?). All three pricing columns are NULL in the schema until decided.
3. **Payment provider** — Stripe, Tap, Apple IAP (iOS), Google Play Billing (Android), all of the above? Affects `user_subscriptions.external_provider` enum and the webhook-handler endpoints (out of scope for BATCH 3 unless committed now).
4. **Initial super-admin seed** — who gets the first super-admin account? What email? Must be set before first production deploy. The seed script runs once with `ADMIN_SEED_EMAIL` from env vars.
5. **Crisis classifier (Tier 2)** — ship in BATCH 3 or defer? Tier 1 (expanded keywords) covers low/medium severity; Tier 2 (classifier) is needed for high/immediate. Deferring means severity-high requires manual super-admin escalation.
6. **Conversation review default OFF** — confirm explicitly. Briefing says yes; reconfirming in writing.
7. **Privacy policy authoring** — who owns drafting the privacy policy clauses listed in §8.6? Is there in-house counsel or external? **Release blocker** for the conversation review feature — until this lands, the feature stays behind `conversation_review_enabled=false`.
8. **Admin panel languages** — English chrome + Arabic for content (current proposal §11.7), or full Arabic chrome, or full English? Affects sidebar labels, button text, error messages.
9. **Data retention** — how long do we keep `companion_messages`? `crisis_flags`? `admin_audit_log`? Proposal: messages 12 months for free tier (matches retention-days limit) / 5 years for premium; crisis_flags indefinite; audit log indefinite. Confirm or revise.
10. **Crisis-flag notification mechanism** — the briefing's "Notification: flags" line was truncated. Proposed baseline: in-app Crisis Queue badge with 30s polling, optional email digest deferred to BATCH 4. Confirm or specify alternative (real-time push? SMS? Slack webhook?).
11. **Tier override max duration for `admin` role** — proposed 90 days; super-admin unlimited. Confirm threshold.
12. **Account-id seed** — should the existing `ADMIN_SECRET` legacy login stay forever as a glass-break recovery option, or be fully removed in Phase 3? Recommend full removal (any credential that lives forever in env vars is a long-term liability), but glass-break could be valuable for incident recovery.
13. **`email_verification_enabled` flag default** — currently hardcoded `false` in three mobile-app files; the flag's seed value will preserve current behavior. Confirm we want the runtime ability to flip this on without a mobile redeploy (server can flip immediately; mobile would need to start reading the flag — small refactor).
14. **First super-admin's TOTP enrollment device** — phone-based authenticator (Google Authenticator / 1Password) vs hardware key (YubiKey). TOTP works for both; YubiKey path also supports WebAuthn which is stronger but a larger scope. Default proposal: TOTP-only in v1, WebAuthn deferred.
15. **Admin SPA hosting URL** — current `/uns-admin` preview path stays after rebuild, or new path `/uns-admin-v2` (Option B-style URL even if we go Option A)? Option A's recommendation assumes the URL stays.

---

## 14. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Encryption key loss** (`ADMIN_ENCRYPTION_KEY` accidentally rotated without dual-key migration) | low | high (LLM API keys unrecoverable from DB) | Documented dual-key rotation procedure (§6.5); operations runbook step "back up the new key in the password manager BEFORE finalizing"; recovery path = re-enter API keys via admin UI from provider dashboards. |
| **Admin account compromise** (stolen credentials) | medium | high (full data access) | TOTP required for super-admin; argon2id passwords; per-account lockout; HIBP breach check; audit log makes detection possible; IP allowlist option deferred to §13 if we want it harder. |
| **Insider threat** (rogue admin actions) | low | high (data exfiltration / sabotage) | Granular roles (§4.3) prevent support from doing super-admin actions; immutable audit log (§3.6 revoke update/delete); periodic access review; bulk export gated to super-admin only with required reason. |
| **Privacy breach via conversation reading** (admin reads bodies they shouldn't) | medium | very high (PDPL violation, reputational) | Default-off consent; per-read audit before body release (constraint H2); required reason ≥ 10 chars; role-redacted display for support; bulk export gated. Privacy policy must disclose; release-blocked until done. |
| **Failover misconfiguration** (single provider configured, breaker opens, all traffic dies) | medium | medium (chat outage) | Admin UI surfaces breaker state; alert email when any provider's circuit opens; documentation strongly recommends ≥2 providers configured in production before multi-LLM is "fully on." |
| **Audit log fills the database** (no retention policy) | low | medium (storage cost; query slowdown) | §13 question on retention policy; meanwhile, partition `admin_audit_log` by month in BATCH 4 to make eventual retention cheap. |
| **Hardcoded `IS_VERIFICATION_ENABLED = false` in 3 mobile files** drifts from the new feature flag once flipped | medium | medium (flag flips on server but mobile still bypasses) | BATCH 3 sub-batch 3.6 explicitly replaces those constants with flag reads; tests verify the fetch + cache + boot wiring. |
| **Subscription tier cache stale during upgrade** (user pays, still sees free-tier limits) | low | low (5-min annoyance, refunds claimable) | `invalidateUserTierCache(userId)` called from webhook AND from manual override; if multi-instance, accept ≤5-min staleness as v1 trade-off; document in operations runbook. |

---

## End of document — change log

- **v1 — 2026-05-03** — initial draft, pending review.
