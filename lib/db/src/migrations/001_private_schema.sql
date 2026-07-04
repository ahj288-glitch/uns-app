-- ═══════════════════════════════════════════════════════════════════════════
-- أُنْس — Migration 001: Private Schema Architecture
-- Run as: postgres superuser in Supabase SQL Editor
-- Safe to re-run: all steps are idempotent
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ARCHITECTURE
-- ─────────────────────────────────────────────────────────────────────────
--  private schema — NEVER exposed to Supabase PostgREST / Data API
--    Contains: all personal, emotional, auth-critical tables
--    Access:   Express backend only (service_role via DATABASE_URL)
--    RLS:      not needed — PostgREST cannot reach schemas not in
--              pg_catalog's exposed_schemas list
--
--  api schema — optionally exposed to PostgREST for read-only catalog data
--    Contains: recipes, programs, community_sessions (no personal data)
--    Access:   anon = SELECT active rows only (RLS enforced)
--              backend = full access via service_role
--    Enable:   Supabase Dashboard → Settings → API → Extra schemas → "api"
--
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- § 1  CREATE SCHEMAS
-- ───────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS private;
CREATE SCHEMA IF NOT EXISTS api;


-- ───────────────────────────────────────────────────────────────────────────
-- § 2  MOVE PRIVATE TABLES  (public → private)
--      ALTER TABLE … SET SCHEMA moves the table and all its indexes,
--      constraints, triggers, and sequences atomically.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users               SET SCHEMA private;
ALTER TABLE public.companion_sessions  SET SCHEMA private;
ALTER TABLE public.companion_messages  SET SCHEMA private;
ALTER TABLE public.mood_checkins       SET SCHEMA private;
ALTER TABLE public.refresh_tokens      SET SCHEMA private;
ALTER TABLE public.verification_tokens SET SCHEMA private;
ALTER TABLE public.user_progress       SET SCHEMA private;
ALTER TABLE public.daily_loops         SET SCHEMA private;
ALTER TABLE public.micro_wins          SET SCHEMA private;
ALTER TABLE public.waitlist            SET SCHEMA private;
ALTER TABLE public.community_posts     SET SCHEMA private;

-- Move waitlist serial sequence (serial sequences stay in original schema)
ALTER SEQUENCE IF EXISTS public.waitlist_id_seq SET SCHEMA private;


-- ───────────────────────────────────────────────────────────────────────────
-- § 3  MOVE API TABLES  (public → api)
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE public.daily_recipes      SET SCHEMA api;
ALTER TABLE public.wellness_programs  SET SCHEMA api;
ALTER TABLE public.community_sessions SET SCHEMA api;


-- ───────────────────────────────────────────────────────────────────────────
-- § 4  PERMISSIONS
-- ───────────────────────────────────────────────────────────────────────────

-- ── service_role: full access to both schemas ────────────────────────────
GRANT USAGE ON SCHEMA private TO service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA private TO service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA private TO service_role;

GRANT USAGE ON SCHEMA api    TO service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA api    TO service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA api    TO service_role;

-- ── anon / authenticated: zero access to private ────────────────────────
-- Revoking USAGE on the schema itself blocks all table access regardless
-- of table-level grants — defense in depth on top of RLS
REVOKE USAGE ON SCHEMA private FROM anon, authenticated, PUBLIC;
REVOKE ALL   ON ALL TABLES    IN SCHEMA private FROM anon, authenticated;
REVOKE ALL   ON ALL SEQUENCES IN SCHEMA private FROM anon, authenticated;

-- ── anon / authenticated: limited access to api ──────────────────────────
GRANT USAGE ON SCHEMA api TO anon, authenticated;
-- Table-level grants are managed by RLS policies below (§ 5)


-- ───────────────────────────────────────────────────────────────────────────
-- § 5  DROP OLD PUBLIC RLS POLICIES (cleanup from previous migration)
--      Now that tables are gone from public, these are no-ops but kept
--      for safety if this script runs before § 2 in a split execution.
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
-- § 6  RLS ON API SCHEMA ONLY
--      private schema does not need RLS — PostgREST cannot reach it at all
--      when it is not in the exposed_schemas list.
--      api schema needs RLS so that if it IS exposed, writes are blocked
--      and only active rows are readable.
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE api.daily_recipes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.wellness_programs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.community_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "daily_recipes: public read active only"      ON api.daily_recipes;
DROP POLICY IF EXISTS "wellness_programs: public read active only"  ON api.wellness_programs;
DROP POLICY IF EXISTS "community_sessions: public read active only" ON api.community_sessions;

CREATE POLICY "daily_recipes: public read active only"
  ON api.daily_recipes
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "wellness_programs: public read active only"
  ON api.wellness_programs
  FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE POLICY "community_sessions: public read active only"
  ON api.community_sessions
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Block writes from anon/authenticated on all api tables
REVOKE INSERT, UPDATE, DELETE, TRUNCATE
  ON api.daily_recipes, api.wellness_programs, api.community_sessions
  FROM anon, authenticated;

-- Ensure SELECT is granted (RLS policies alone don't grant table access)
GRANT SELECT ON api.daily_recipes      TO anon, authenticated;
GRANT SELECT ON api.wellness_programs  TO anon, authenticated;
GRANT SELECT ON api.community_sessions TO anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- § 7  rls_auto_enable() — MAINTENANCE FUNCTION
--      Automatically enables RLS on all future tables added to api schema.
--      Call this after adding new catalog tables to api.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION api.rls_auto_enable()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM   pg_tables
    WHERE  schemaname = 'api'
  LOOP
    EXECUTE format('ALTER TABLE api.%I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    RAISE NOTICE 'RLS enabled on api.%', tbl.tablename;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION api.rls_auto_enable() IS
  'Enable RLS on all tables in the api schema. Run after adding new catalog tables.';


-- ───────────────────────────────────────────────────────────────────────────
-- § 8  VALIDATION QUERIES  (run manually to verify)
-- ───────────────────────────────────────────────────────────────────────────

/*
-- 1. Confirm tables moved correctly:
SELECT schemaname, tablename
FROM   pg_tables
WHERE  tablename IN (
  'users', 'companion_sessions', 'companion_messages', 'mood_checkins',
  'refresh_tokens', 'verification_tokens', 'user_progress', 'daily_loops',
  'micro_wins', 'waitlist', 'community_posts',
  'daily_recipes', 'wellness_programs', 'community_sessions'
)
ORDER BY schemaname, tablename;

-- Expected:
-- api     | community_sessions
-- api     | daily_recipes
-- api     | wellness_programs
-- private | companion_messages
-- private | companion_sessions
-- private | daily_loops
-- private | micro_wins
-- private | mood_checkins
-- private | refresh_tokens
-- private | user_progress
-- private | users
-- private | verification_tokens
-- private | waitlist
-- private | community_posts


-- 2. Confirm RLS state on api schema:
SELECT tablename, rowsecurity AS rls_enabled,
       (SELECT COUNT(*) FROM pg_policies p
        WHERE p.tablename = t.tablename AND p.schemaname = 'api') AS policy_count
FROM   pg_tables t
WHERE  schemaname = 'api'
ORDER BY tablename;

-- Expected:
-- community_sessions | true | 1
-- daily_recipes      | true | 1
-- wellness_programs  | true | 1


-- 3. Test anon cannot reach private:
SET ROLE anon;
SELECT COUNT(*) FROM private.users;           -- ERROR: permission denied for schema private
SELECT COUNT(*) FROM private.companion_messages; -- ERROR: permission denied
RESET ROLE;


-- 4. Test anon can read active api rows:
SET ROLE anon;
SELECT COUNT(*) FROM api.daily_recipes WHERE is_active = true;  -- OK
INSERT INTO api.daily_recipes (title, summary, content, category)
  VALUES ('x','x','x','x');                                     -- ERROR: insufficient privilege
RESET ROLE;
*/


-- ═══════════════════════════════════════════════════════════════════════════
-- POST-MIGRATION CHECKLIST
-- ═══════════════════════════════════════════════════════════════════════════
--
-- □ Run validation queries (§ 8) to confirm schema placement
-- □ Deploy updated backend (pnpm build && pm2 restart uns-api --update-env)
-- □ Supabase Dashboard → Settings → API:
--     - Remove "public" from exposed schemas (or leave; tables are gone)
--     - Add "api" to Extra schemas if you want catalog data via PostgREST
-- □ Supabase Dashboard → Table Editor: private tables will no longer appear
-- □ Test: POST /companion/chat, GET /api/programs, POST /auth/register
--
-- ═══════════════════════════════════════════════════════════════════════════
