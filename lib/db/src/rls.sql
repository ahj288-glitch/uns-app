-- ═══════════════════════════════════════════════════════════════════════════
-- أُنْس — RLS Policy Reference  (post-migration 001)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- After migration 001_private_schema.sql, the schema layout is:
--
--   private.*  — zero PostgREST exposure (schema not in exposed_schemas)
--                RLS not required; schema USAGE is revoked from anon.
--                Tables: users, companion_sessions, companion_messages,
--                        mood_checkins, refresh_tokens, verification_tokens,
--                        user_progress, daily_loops, micro_wins,
--                        waitlist, community_posts
--
--   api.*      — optional PostgREST exposure for catalog data
--                RLS enforced: SELECT active rows only, writes blocked.
--                Tables: daily_recipes, wellness_programs, community_sessions
--
-- This file documents the RLS policies on the api schema only.
-- Run 001_private_schema.sql for the full migration (includes these policies).
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- api.daily_recipes
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE api.daily_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_recipes: public read active only" ON api.daily_recipes;
CREATE POLICY "daily_recipes: public read active only"
  ON api.daily_recipes
  FOR SELECT TO anon, authenticated
  USING (is_active = true);


-- ───────────────────────────────────────────────────────────────────────────
-- api.wellness_programs
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE api.wellness_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wellness_programs: public read active only" ON api.wellness_programs;
CREATE POLICY "wellness_programs: public read active only"
  ON api.wellness_programs
  FOR SELECT TO anon, authenticated
  USING (active = true);


-- ───────────────────────────────────────────────────────────────────────────
-- api.community_sessions
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE api.community_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_sessions: public read active only" ON api.community_sessions;
CREATE POLICY "community_sessions: public read active only"
  ON api.community_sessions
  FOR SELECT TO anon, authenticated
  USING (is_active = true);


-- ───────────────────────────────────────────────────────────────────────────
-- Maintenance: re-run after adding new catalog tables to api schema
-- ───────────────────────────────────────────────────────────────────────────

-- SELECT api.rls_auto_enable();


-- ───────────────────────────────────────────────────────────────────────────
-- Validation
-- ───────────────────────────────────────────────────────────────────────────

/*
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
*/
