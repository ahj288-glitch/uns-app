# أُنس Admin Panel — Decisions Log
**Date:** 2026-05-03  
**Source:** design review session, 5 rounds  
**Design doc:** docs/admin-panel-design.md @ commit 2c8394a  
**Status:** Frozen for BATCH 3 implementation. Subsequent changes require explicit user approval and an entry in the changelog at the bottom of this file.

## Section 13 — Open Questions (all 15 resolved)

| # | Question | Decision |
|---|---|---|
| Q1 | Free tier rate limits | 30 messages/day, 2000 chars/message, 5 mood checkins/day, 10 breathing sessions/day, 30-day chat history retention |
| Q2 | Premium pricing | Multi-currency support (SAR + USD). Schema uses separate `subscription_tier_prices` table. Prices NULL until product decides; values entered before launch. |
| Q3 | Launch platforms | iOS + Android together. `user_subscriptions.external_provider` enum: `apple_iap \| google_play \| stripe \| tap \| manual_override`. Webhook handlers for Apple IAP and Google Play Billing required server-side. Apple receipt validation MUST be server-side. |
| Q4 | Initial super-admin email | Placeholder `ADMIN_SEED_EMAIL` env var, will use `admin@uns.app` domain when ready. Bootstrap CLI script reads from env. |
| Q5 | Crisis classifier | Tier 1 (expanded keywords) + Tier 2 (ML classifier) BOTH ship in BATCH 3. Tier 2 uses Groq for classification (separate API call from chat) with system prompt for severity scoring (low/medium/high/immediate). Fallback: if Tier 2 fails, fall back to Tier 1 result + log the classifier failure. |
| Q6 | Conversation review default | OFF. opt-in mandatory. User toggles in mobile profile settings. Crisis-flagged messages exempt per H6. |
| Q7 | Privacy policy | Legal counsel available. Release blocker resolved (will be drafted in parallel with implementation). |
| Q8 | Admin language | English chrome (sidebar, buttons, errors) + Arabic content (conversation viewer, daily recipe preview, feedback bodies). |
| Q9 | Data retention | 12 months for free tier, 24 months for premium tier. Reduced from original 5-year proposal for stricter PDPL alignment. Crisis flags + audit log: indefinite (immutable). |
| Q10 | Crisis notification | In-app Crisis Queue badge with 30-second polling. Email digest deferred to BATCH 4. |
| Q11 | Tier override max duration | 90 days for `admin` role; unlimited for `super_admin`. |
| Q12 | ADMIN_SECRET legacy | Keep 6 months as glass-break recovery, then full removal. Document removal date in this file when reached. |
| Q13 | email_verification_enabled flag | Live, flippable from admin without redeploy. Mobile reads from `/flags` endpoint on boot. |
| Q14 | TOTP method | Phone authenticator only (TOTP via standard apps: Google Authenticator, 1Password, Authy). WebAuthn/YubiKey deferred to v2. |
| Q15 | Admin SPA URL | Keep `/uns-admin` preview path. No new path needed (Option A replaces in place). |

## Section 1 (Goals & non-goals)
Approved without modification.

## Section 2 (IA) — approved with 3 refinements

1. **Crisis Queue excerpt limit:** when a crisis flag's message excerpt is shown in the queue, display only a 200-character window centered on the trigger keyword(s). Full message body requires the admin to navigate to `/conversations/:sessionId` (which goes through the §8 audit log + reason flow). Implementation: `crisis_flags.matched_terms` lookup + slicing logic in the API response for `/api/admin/crisis-flags`.

2. **Audit log meta-audit non-deletable:** add Postgres-level constraint that prevents UPDATE/DELETE on `admin_audit_log` even from a super-admin. Use `REVOKE UPDATE, DELETE ON admin_audit_log FROM CURRENT_USER` after table creation. Document in migration M02 comment that even SQL-level deletion requires DB-superuser intervention (and that DB-superuser is not the application user).

3. **Programs/Community security spot-check:** in mini-batch 3-E (cleanup), spot-check `programs.ts` and `community.ts` server routes for: missing auth checks, SQL injection vectors, missing rate limits. If issues found, log them in `docs/security-backlog.md` and continue (do not block 3-E).

## Section 3 (Schema) — approved with 2 schema changes

### Change 1: subscription_tier_prices table (replaces inline price columns)

```sql
CREATE TABLE subscription_tier_prices (
  tier_id uuid NOT NULL REFERENCES subscription_tiers(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('SAR', 'USD')),
  billing_period text NOT NULL CHECK (billing_period IN ('month', 'year')),
  price_minor_units int NOT NULL CHECK (price_minor_units > 0),
  effective_from timestamp NOT NULL DEFAULT now(),
  effective_until timestamp,
  PRIMARY KEY (tier_id, currency, billing_period, effective_from)
);
CREATE INDEX subscription_tier_prices_active_idx
  ON subscription_tier_prices (tier_id, currency, billing_period)
  WHERE effective_until IS NULL;
```

Removes `price_minor_units`, `currency`, `billing_period` columns from
`subscription_tiers`. Pricing history is preserved via the `effective_*`
columns (current price = row where effective_until IS NULL).

### Change 2: external_provider enum extension

`user_subscriptions.external_provider` enum updated to:
```
apple_iap | google_play | stripe | tap | manual_override
```
Added `google_play`. The check constraint must be in the migration.

## Section 4 (Auth) — approved with glass-break recovery addition

Add to `scripts/seed-super-admin.ts`:
- Flag `--reset-totp <admin_email>`: when invoked with this flag, the
  script does NOT create a new admin. Instead, it: (a) finds the
  existing admin by email, (b) sets `totp_secret_encrypted = null` and
  `totp_enrolled_at = null`, (c) regenerates the 10 recovery codes
  (argon2-hashed), (d) prints a fresh TOTP enrollment URL to be scanned
  on next login, (e) writes an `admin_audit_log` row with
  `action = 'super_admin.totp_reset_via_seed'`, actor = null (system),
  reason = "glass-break recovery via seed CLI".
- Documented in `scripts/README.md` as the glass-break path.

TOTP grace period for `admin` role: 7 days from account creation.
Banner in admin SPA blocks all write actions until enrolled.

## Section 5 (Tech Stack) — Option A approved

Replace `uns-admin` in place. User confirmed they are the sole operator
of the existing admin panel; no migration concerns. Existing dependency
catalog and shadcn/ui component set are reused.

## Section 6 (Multi-LLM) — approved without modification

LLMProvider interface, registry, failover chain, circuit breaker,
AES-256-GCM encryption, key rotation strategy: all as designed.

## Section 7 (Tiers) — approved with multi-currency schema (see Change 1 above)

Initial tier limits as proposed (free: 30/2000/5/10/30; premium:
300/8000/30/100/365 — with retention adjusted to 24 months per Q9 =
730 days, NOT 365).

**Important correction:** §7.2 of the design doc says premium retention
is 365 days. Per Decision Q9, premium retention is 24 months = 730 days.
Use 730 in the seed migration. Update §7.2 reference if you write a
follow-up doc.

## Section 8 (Conversation Review) — approved without modification

All 8 H-constraints (H1-H8) implemented as written. PDPL article
mapping (5, 6, 9, 10, 11, 30) implemented as written.

## Section 9 (Feedback admin-side) — approved without modification

User-side submission UI explicitly out of scope for BATCH 3.

## Section 10 (Feature Flags) — approved without modification

Including the killswitch convention (no cache, super-admin-only,
audited with reason).

## Section 11 (Visual) — approved

LTR chrome, RTL content. Inspiration from Linear + Vercel + Cal.com.

## Section 12 (Roadmap) — split into 5 mini-batches

Mini-batch 3-A: Foundation (sub-batches 3.1, 3.2, 3.3) — 1.5-2 weeks
Mini-batch 3-B: Subscription + LLM (3.4, 3.5) — 1.5-2 weeks
Mini-batch 3-C: Privacy + Crisis (3.6, 3.7) — 2-3 weeks (Tier 2 adds scope)
Mini-batch 3-D: Admin UI (3.8) — 1-1.5 weeks
Mini-batch 3-E: Cleanup + Feedback (3.9, 3.10) — 1 week

Total: 7-10 weeks for one engineer. The user is the engineer.

## Section 14 (Risks) — approved

All 8 risks acknowledged. Mitigations as designed.

## Changelog
- 2026-05-03: Initial freeze. All 14 sections approved by user across 5 review rounds.

### 2026-05-03 (post-freeze) — schema deviations from design doc

During implementation audit (mini-batch 3-A.1), three schema deviations
from design doc §3 were approved:

1. **llm_providers crypto envelope:** §3.4 specifies a single
   `api_key_encrypted` text column holding base64(nonce + ciphertext +
   auth_tag). Implementation uses 3 separate bytea columns
   (`api_key_ciphertext`, `api_key_nonce`, `api_key_auth_tag`) for
   storage efficiency (33% savings vs base64 text) and conceptual
   clarity (ciphertext, nonce, auth_tag are independent crypto
   primitives, bytea is the native PG binary type with no
   encode/decode overhead). AES-256-GCM encryption itself is unchanged.

2. **LLM health storage:** §3.5 specifies a single append-only
   `llm_provider_health` table. Implementation splits this into
   `llm_provider_health` (append-only event log, per spec) AND
   `llm_provider_circuit_state` (1:1 fast-read snapshot, new) so
   circuit-breaker decisions don't require scanning the event log.
   Standard pattern in production LLM gateways. Both tables share
   `provider_id` FK to `llm_providers(id)` ON DELETE CASCADE. Retention
   purge job applies only to the event log; the state snapshot persists
   for the lifetime of the provider row.

3. **admin_users + llm_providers extra columns:** Implementation adds
   the following columns NOT in design doc §3.1 / §3.4. They're
   documented here as additions:
   - `admin_users.hibp_breach_flagged` boolean — flips true when HIBP
     check (per §4.5) detects breach exposure; admin gets banner
     prompting password change. Useful for OWASP password-storage
     hygiene.
   - `admin_users.updated_at` timestamp — standard hygiene, used by
     audit log diff serialization.
   - `llm_providers.config_json` jsonb — adapter-specific settings
     (e.g., per-adapter custom headers, organization IDs, region
     overrides). Avoids per-adapter schema migrations.
