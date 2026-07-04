-- ═══════════════════════════════════════════════════════════════════════════
-- أُنْس — Row Level Security: Complete Lockdown Migration
-- Target: Supabase PostgreSQL (staging & production)
-- Run as: service_role or postgres superuser in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ARCHITECTURE NOTE — READ BEFORE APPLYING
-- ─────────────────────────────────────────
-- This app uses CUSTOM JWT auth (Express backend), NOT Supabase Auth.
-- auth.uid() always returns NULL for app users — do NOT use it in policies.
--
-- Access pattern:
--   Mobile app ──► Express API (service_role key) ──► PostgreSQL
--                                                        ↑
--                                                  Bypasses RLS
--
-- Threat model:
--   ✗ Anon key holder queries PostgREST directly → must return 0 rows
--   ✗ Supabase Dashboard Table Editor leaks data → must be blocked
--   ✗ Stolen anon key + REST API = silent data harvest → blocked by RLS
--   ✓ Express backend (service_role) continues to work unaffected
--
-- Policy design:
--   Private tables (user data)   → RLS ON, NO policies  → default-deny for all
--   Content tables (app catalog) → RLS ON, SELECT only  → readable, not writable
--   Token tables (auth secrets)  → RLS ON, NO policies  → total blackout
--
-- Service role ALWAYS bypasses RLS in Supabase — no backend changes needed.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- § 0  SAFETY: Drop all existing RLS policies on these tables first
--       Makes this script safe to re-run (idempotent)
-- ───────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT schemaname, tablename, policyname
    FROM   pg_policies
    WHERE  schemaname = 'public'
    AND    tablename IN (
             'users', 'companion_sessions', 'companion_messages',
             'mood_checkins', 'user_progress', 'daily_loops',
             'micro_wins', 'wellness_programs', 'community_posts',
             'community_sessions', 'refresh_tokens', 'verification_tokens',
             'daily_recipes', 'waitlist'
           )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      rec.policyname, rec.schemaname, rec.tablename
    );
  END LOOP;
END;
$$;


-- ───────────────────────────────────────────────────────────────────────────
-- § 1  ENABLE ROW LEVEL SECURITY ON ALL TABLES
--       Enabling RLS with no policies = deny all for anon/authenticated roles
-- ───────────────────────────────────────────────────────────────────────────

-- ── Personal / Emotional Data ───────────────────────────────────────────────
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_loops         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_wins          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist            ENABLE ROW LEVEL SECURITY;

-- ── Auth Secrets (highest sensitivity) ─────────────────────────────────────
ALTER TABLE public.refresh_tokens       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens  ENABLE ROW LEVEL SECURITY;

-- ── App Content (semi-public) ───────────────────────────────────────────────
ALTER TABLE public.daily_recipes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_programs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts     ENABLE ROW LEVEL SECURITY;


-- ───────────────────────────────────────────────────────────────────────────
-- § 2  PRIVATE TABLES — NO POLICIES (default-deny)
--       These tables contain personal, emotional, or auth-critical data.
--       No anon or authenticated Supabase role may access them.
--       Only the service_role (backend) can read/write — it bypasses RLS.
-- ───────────────────────────────────────────────────────────────────────────

-- users: email, dob, gender — PII
-- No policies. Enabling RLS is sufficient to deny all direct API access.

-- companion_sessions: contains emotional_profile (JSONB), links to users
-- No policies.

-- companion_messages: full AI conversation content — most sensitive
-- No policies.

-- mood_checkins: moodWord, intensity, notes — raw emotional states
-- No policies.

-- user_progress: xp, streaks, milestones — behavioral fingerprint
-- No policies.

-- daily_loops: daily mental state tracking
-- No policies.

-- micro_wins: behavioral achievements tied to session
-- No policies.

-- waitlist: email addresses
-- No policies.

-- refresh_tokens: tokenHash (SHA-256 of JWT) — auth critical
-- No policies. Zero public exposure.

-- verification_tokens: otp (plaintext OTP code), userId
-- No policies. Zero public exposure.

-- community_posts: although anonymous, session_id can fingerprint users
-- No policies. Moderation data (is_flagged, is_ai_moderated) must be private.


-- ───────────────────────────────────────────────────────────────────────────
-- § 3  CONTENT TABLES — SELECT ONLY FOR ANONYMOUS ROLE
--       These tables contain app catalog content, no personal data.
--       Readable by anyone (anon key), writable only by backend (service_role).
-- ───────────────────────────────────────────────────────────────────────────

-- ── daily_recipes ───────────────────────────────────────────────────────────
-- Contains: title, summary, content, category — no personal data
-- Only active recipes are visible to prevent leaking draft/scheduled content

CREATE POLICY "daily_recipes: public read active only"
ON public.daily_recipes
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- ── wellness_programs ───────────────────────────────────────────────────────
-- Contains: program catalog — no personal data
-- Only active programs visible

CREATE POLICY "wellness_programs: public read active only"
ON public.wellness_programs
FOR SELECT
TO anon, authenticated
USING (active = true);

-- ── community_sessions ──────────────────────────────────────────────────────
-- Contains: session titles/descriptions — no personal data
-- Only active sessions visible

CREATE POLICY "community_sessions: public read active only"
ON public.community_sessions
FOR SELECT
TO anon, authenticated
USING (is_active = true);


-- ───────────────────────────────────────────────────────────────────────────
-- § 4  COLUMN-LEVEL PROTECTION — REVOKE DIRECT ROLE GRANTS
--       Belt-and-suspenders: even if a policy bug opens a table,
--       the anon role cannot see these specific columns.
-- ───────────────────────────────────────────────────────────────────────────

-- Revoke all table-level grants from anon on sensitive tables
REVOKE ALL ON public.users               FROM anon, authenticated;
REVOKE ALL ON public.companion_sessions  FROM anon, authenticated;
REVOKE ALL ON public.companion_messages  FROM anon, authenticated;
REVOKE ALL ON public.mood_checkins       FROM anon, authenticated;
REVOKE ALL ON public.user_progress       FROM anon, authenticated;
REVOKE ALL ON public.daily_loops         FROM anon, authenticated;
REVOKE ALL ON public.micro_wins          FROM anon, authenticated;
REVOKE ALL ON public.refresh_tokens      FROM anon, authenticated;
REVOKE ALL ON public.verification_tokens FROM anon, authenticated;
REVOKE ALL ON public.waitlist            FROM anon, authenticated;
REVOKE ALL ON public.community_posts     FROM anon, authenticated;

-- Grant SELECT on content tables (restore after broad revoke)
GRANT SELECT ON public.daily_recipes      TO anon, authenticated;
GRANT SELECT ON public.wellness_programs  TO anon, authenticated;
GRANT SELECT ON public.community_sessions TO anon, authenticated;

-- Deny writes on content tables even from authenticated role
-- (backend uses service_role which bypasses GRANT restrictions)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE
ON public.daily_recipes, public.wellness_programs, public.community_sessions
FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- § 5  VALIDATION QUERIES
--       Run these after applying to confirm the lockdown is active.
--       Expected: all sensitive tables show 0 rows when queried as anon.
-- ───────────────────────────────────────────────────────────────────────────

/*
-- Test as anon role:
SET ROLE anon;

-- Should return 0 rows (or permission denied):
SELECT COUNT(*) FROM public.users;
SELECT COUNT(*) FROM public.companion_messages;
SELECT COUNT(*) FROM public.mood_checkins;
SELECT COUNT(*) FROM public.refresh_tokens;
SELECT COUNT(*) FROM public.verification_tokens;
SELECT COUNT(*) FROM public.waitlist;
SELECT COUNT(*) FROM public.companion_sessions;
SELECT COUNT(*) FROM public.user_progress;
SELECT COUNT(*) FROM public.daily_loops;
SELECT COUNT(*) FROM public.micro_wins;
SELECT COUNT(*) FROM public.community_posts;

-- Should return rows (public catalog):
SELECT COUNT(*) FROM public.daily_recipes;      -- > 0 if recipes exist
SELECT COUNT(*) FROM public.wellness_programs;  -- > 0 if programs exist
SELECT COUNT(*) FROM public.community_sessions; -- > 0 if sessions exist

-- Should fail (write blocked):
INSERT INTO public.daily_recipes (title, summary, content, category)
  VALUES ('test', 'test', 'test', 'test'); -- ERROR: insufficient privilege

RESET ROLE;
*/


-- ───────────────────────────────────────────────────────────────────────────
-- § 6  VERIFY RLS STATUS
--       Confirm all tables have RLS enabled after applying.
-- ───────────────────────────────────────────────────────────────────────────

/*
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  (
    SELECT COUNT(*)
    FROM pg_policies p
    WHERE p.tablename = c.tablename
      AND p.schemaname = 'public'
  ) AS policy_count
FROM pg_tables c
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'companion_sessions', 'companion_messages',
    'mood_checkins', 'user_progress', 'daily_loops',
    'micro_wins', 'wellness_programs', 'community_posts',
    'community_sessions', 'refresh_tokens', 'verification_tokens',
    'daily_recipes', 'waitlist'
  )
ORDER BY tablename;

-- Expected output:
-- tablename              | rls_enabled | policy_count
-- -----------------------+-------------+-------------
-- community_posts        | true        | 0  (blocked)
-- community_sessions     | true        | 1  (read-only)
-- companion_messages     | true        | 0  (blocked)
-- companion_sessions     | true        | 0  (blocked)
-- daily_loops            | true        | 0  (blocked)
-- daily_recipes          | true        | 1  (read-only)
-- micro_wins             | true        | 0  (blocked)
-- mood_checkins          | true        | 0  (blocked)
-- refresh_tokens         | true        | 0  (blocked)
-- user_progress          | true        | 0  (blocked)
-- users                  | true        | 0  (blocked)
-- verification_tokens    | true        | 0  (blocked)
-- waitlist               | true        | 0  (blocked)
-- wellness_programs      | true        | 1  (read-only)
*/


-- ═══════════════════════════════════════════════════════════════════════════
-- END OF MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════
