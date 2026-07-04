-- ═══════════════════════════════════════════════════════════════════════════
-- أُنْس — Rollback: 001_private_schema
-- Run as: postgres superuser in Supabase SQL Editor
-- Use ONLY if post-migration verification (001_verify.sql) fails.
-- This script is safe to run — it moves tables back to public and removes
-- the private/api schemas. No data is deleted.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- § 1  DROP RLS POLICIES ON api TABLES
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "daily_recipes: public read active only"      ON api.daily_recipes;
DROP POLICY IF EXISTS "wellness_programs: public read active only"  ON api.wellness_programs;
DROP POLICY IF EXISTS "community_sessions: public read active only" ON api.community_sessions;

ALTER TABLE api.daily_recipes      DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.wellness_programs  DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.community_sessions DISABLE ROW LEVEL SECURITY;


-- ───────────────────────────────────────────────────────────────────────────
-- § 2  RESTORE GRANTS (before moving tables)
-- ───────────────────────────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT USAGE ON SCHEMA api     TO anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- § 3  MOVE TABLES BACK TO public
-- ───────────────────────────────────────────────────────────────────────────

-- private → public
ALTER TABLE private.users               SET SCHEMA public;
ALTER TABLE private.companion_sessions  SET SCHEMA public;
ALTER TABLE private.companion_messages  SET SCHEMA public;
ALTER TABLE private.mood_checkins       SET SCHEMA public;
ALTER TABLE private.refresh_tokens      SET SCHEMA public;
ALTER TABLE private.verification_tokens SET SCHEMA public;
ALTER TABLE private.user_progress       SET SCHEMA public;
ALTER TABLE private.daily_loops         SET SCHEMA public;
ALTER TABLE private.micro_wins          SET SCHEMA public;
ALTER TABLE private.waitlist            SET SCHEMA public;
ALTER TABLE private.community_posts     SET SCHEMA public;

-- Move waitlist sequence back to public
ALTER SEQUENCE IF EXISTS private.waitlist_id_seq SET SCHEMA public;

-- api → public
ALTER TABLE api.daily_recipes      SET SCHEMA public;
ALTER TABLE api.wellness_programs  SET SCHEMA public;
ALTER TABLE api.community_sessions SET SCHEMA public;


-- ───────────────────────────────────────────────────────────────────────────
-- § 4  DROP rls_auto_enable FUNCTION
-- ───────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS api.rls_auto_enable();


-- ───────────────────────────────────────────────────────────────────────────
-- § 5  DROP SCHEMAS (only if empty)
-- ───────────────────────────────────────────────────────────────────────────

DROP SCHEMA IF EXISTS api;
DROP SCHEMA IF EXISTS private;


-- ───────────────────────────────────────────────────────────────────────────
-- § 6  RE-APPLY ORIGINAL RLS (public schema lockdown)
--      Restore the previous RLS state from rls.sql (pre-migration).
-- ───────────────────────────────────────────────────────────────────────────

-- Private tables: RLS ON, no policies (default-deny)
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_checkins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_loops         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_wins          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts     ENABLE ROW LEVEL SECURITY;

-- Content tables: RLS ON + SELECT policy
ALTER TABLE public.daily_recipes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_programs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_recipes: public read active only"      ON public.daily_recipes;
DROP POLICY IF EXISTS "wellness_programs: public read active only"  ON public.wellness_programs;
DROP POLICY IF EXISTS "community_sessions: public read active only" ON public.community_sessions;

CREATE POLICY "daily_recipes: public read active only"
  ON public.daily_recipes FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "wellness_programs: public read active only"
  ON public.wellness_programs FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "community_sessions: public read active only"
  ON public.community_sessions FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- REVOKE writes and re-grant SELECT on content tables
REVOKE ALL ON public.users, public.companion_sessions, public.companion_messages,
             public.mood_checkins, public.user_progress, public.daily_loops,
             public.micro_wins, public.refresh_tokens, public.verification_tokens,
             public.waitlist, public.community_posts
FROM anon, authenticated;

GRANT SELECT ON public.daily_recipes      TO anon, authenticated;
GRANT SELECT ON public.wellness_programs  TO anon, authenticated;
GRANT SELECT ON public.community_sessions TO anon, authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON public.daily_recipes, public.wellness_programs, public.community_sessions
FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- § 7  VERIFY ROLLBACK
-- ───────────────────────────────────────────────────────────────────────────

SELECT schemaname, tablename
FROM   pg_tables
WHERE  tablename IN (
  'users', 'companion_sessions', 'companion_messages', 'mood_checkins',
  'refresh_tokens', 'verification_tokens', 'user_progress', 'daily_loops',
  'micro_wins', 'waitlist', 'community_posts',
  'daily_recipes', 'wellness_programs', 'community_sessions'
)
ORDER BY tablename;

/*
EXPECTED: all 14 rows show schemaname = 'public'
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- After rollback: redeploy pre-migration backend build
--   pm2 stop uns-api
--   cd /root/uns-app && git stash  (or git checkout the previous schema files)
--   pnpm --filter api-server build
--   pm2 start uns-api --update-env
-- ═══════════════════════════════════════════════════════════════════════════
