-- ═══════════════════════════════════════════════════════════════════════════
-- أُنْس — Post-Migration Verification: 001_private_schema
-- Run as: postgres superuser in Supabase SQL Editor
-- Purpose: confirm schema placement, RLS state, and permission lockdown
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- § 1  TABLE PLACEMENT
--      Every table must be in exactly the right schema.
--      Zero rows in result = migration incomplete or partially failed.
-- ───────────────────────────────────────────────────────────────────────────

-- 1a. All 14 tables with their schema
SELECT
  schemaname,
  tablename,
  CASE schemaname
    WHEN 'private' THEN '✓ not exposed to PostgREST'
    WHEN 'api'     THEN '✓ catalog — expose if needed'
    WHEN 'public'  THEN '✗ STILL IN PUBLIC — migration incomplete'
    ELSE               '? unexpected schema'
  END AS status
FROM pg_tables
WHERE tablename IN (
  -- private expected
  'users', 'companion_sessions', 'companion_messages',
  'mood_checkins', 'refresh_tokens', 'verification_tokens',
  'user_progress', 'daily_loops', 'micro_wins',
  'waitlist', 'community_posts',
  -- api expected
  'daily_recipes', 'wellness_programs', 'community_sessions'
)
ORDER BY schemaname, tablename;

/*
EXPECTED (14 rows):
  schemaname | tablename
  -----------+--------------------
  api        | community_sessions
  api        | daily_recipes
  api        | wellness_programs
  private    | community_posts
  private    | companion_messages
  private    | companion_sessions
  private    | daily_loops
  private    | micro_wins
  private    | mood_checkins
  private    | refresh_tokens
  private    | user_progress
  private    | users
  private    | verification_tokens
  private    | waitlist

  FAIL if any row shows schemaname = 'public'
*/


-- 1b. Confirm nothing sensitive remains in public
SELECT tablename
FROM   pg_tables
WHERE  schemaname = 'public'
  AND  tablename IN (
    'users', 'companion_sessions', 'companion_messages',
    'mood_checkins', 'refresh_tokens', 'verification_tokens',
    'user_progress', 'daily_loops', 'micro_wins',
    'waitlist', 'community_posts',
    'daily_recipes', 'wellness_programs', 'community_sessions'
  );

/*
EXPECTED: 0 rows
FAIL if any rows returned — means SET SCHEMA did not complete
*/


-- 1c. Confirm waitlist sequence moved
SELECT sequencename, schemaname
FROM   pg_sequences
WHERE  sequencename = 'waitlist_id_seq';

/*
EXPECTED: private | waitlist_id_seq
FAIL if schemaname = 'public' — serial inserts to waitlist will break
*/


-- ───────────────────────────────────────────────────────────────────────────
-- § 2  RLS STATE
--      Only api tables should have RLS enabled + policies.
--      private tables: RLS irrelevant (schema not exposed), but can be ON.
--      api tables: RLS must be ON with exactly 1 SELECT policy each.
-- ───────────────────────────────────────────────────────────────────────────

-- 2a. RLS status for all migrated tables
SELECT
  t.schemaname,
  t.tablename,
  t.rowsecurity                                                    AS rls_enabled,
  COUNT(p.policyname)                                              AS policy_count,
  CASE
    WHEN t.schemaname = 'api'     AND t.rowsecurity = true
         AND COUNT(p.policyname) = 1                               THEN '✓ correct'
    WHEN t.schemaname = 'private' AND t.rowsecurity = false        THEN '✓ correct (not needed)'
    WHEN t.schemaname = 'private' AND t.rowsecurity = true
         AND COUNT(p.policyname) = 0                               THEN '✓ correct (locked)'
    ELSE                                                                '✗ CHECK REQUIRED'
  END AS check
FROM pg_tables t
LEFT JOIN pg_policies p
  ON  p.tablename  = t.tablename
  AND p.schemaname = t.schemaname
WHERE t.schemaname IN ('private', 'api')
  AND t.tablename IN (
    'users', 'companion_sessions', 'companion_messages',
    'mood_checkins', 'refresh_tokens', 'verification_tokens',
    'user_progress', 'daily_loops', 'micro_wins', 'waitlist',
    'community_posts', 'daily_recipes', 'wellness_programs',
    'community_sessions'
  )
GROUP BY t.schemaname, t.tablename, t.rowsecurity
ORDER BY t.schemaname, t.tablename;

/*
EXPECTED (api tables have 1 policy, private tables have 0):
  api     | community_sessions | true  | 1 | ✓ correct
  api     | daily_recipes      | true  | 1 | ✓ correct
  api     | wellness_programs  | true  | 1 | ✓ correct
  private | ...                | false | 0 | ✓ correct (not needed)
  -- OR --
  private | ...                | true  | 0 | ✓ correct (locked)

  FAIL if any row shows '✗ CHECK REQUIRED'
*/


-- 2b. Inspect the actual policy definitions on api tables
SELECT
  schemaname,
  tablename,
  policyname,
  cmd        AS "for",
  roles,
  qual       AS using_expr
FROM pg_policies
WHERE schemaname = 'api'
ORDER BY tablename;

/*
EXPECTED (3 rows):
  api | community_sessions | community_sessions: public read active only | SELECT | {anon,authenticated} | (is_active = true)
  api | daily_recipes      | daily_recipes: public read active only      | SELECT | {anon,authenticated} | (is_active = true)
  api | wellness_programs  | wellness_programs: public read active only  | SELECT | {anon,authenticated} | (active = true)

  FAIL if cmd is not SELECT, or roles include 'public', or using_expr is null
*/


-- ───────────────────────────────────────────────────────────────────────────
-- § 3  PERMISSION LOCKDOWN
--      anon and authenticated must have zero privileges on private schema.
--      api schema: SELECT only on the 3 catalog tables.
-- ───────────────────────────────────────────────────────────────────────────

-- 3a. Check schema-level USAGE grants (most critical)
SELECT
  n.nspname                                        AS schema,
  r.rolname                                        AS role,
  has_schema_privilege(r.rolname, n.nspname, 'USAGE') AS can_use_schema
FROM pg_namespace n
CROSS JOIN (
  SELECT rolname FROM pg_roles
  WHERE  rolname IN ('anon', 'authenticated', 'service_role')
) r
WHERE n.nspname IN ('private', 'api')
ORDER BY n.nspname, r.rolname;

/*
EXPECTED:
  api     | anon           | true    ✓ (needs to read catalog)
  api     | authenticated  | true    ✓
  api     | service_role   | true    ✓
  private | anon           | false   ✓ CRITICAL — must be false
  private | authenticated  | false   ✓ CRITICAL — must be false
  private | service_role   | true    ✓

  FAIL if private | anon | true  (schema lockdown failed)
  FAIL if private | authenticated | true
*/


-- 3b. Check table-level privileges on private tables
SELECT
  grantee,
  table_schema,
  table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'private'
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

/*
EXPECTED: 0 rows
FAIL if any rows appear — anon/authenticated have table grants on private
*/


-- 3c. Check table-level privileges on api tables
SELECT
  grantee,
  table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'api'
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

/*
EXPECTED (SELECT only, no INSERT/UPDATE/DELETE):
  anon          | community_sessions | SELECT
  anon          | daily_recipes      | SELECT
  anon          | wellness_programs  | SELECT
  authenticated | community_sessions | SELECT
  authenticated | daily_recipes      | SELECT
  authenticated | wellness_programs  | SELECT

  FAIL if INSERT, UPDATE, or DELETE appear in privileges column
*/


-- 3d. Simulate anon access to private schema (most critical test)
SET ROLE anon;

DO $$
BEGIN
  BEGIN
    PERFORM 1 FROM private.users LIMIT 1;
    RAISE EXCEPTION 'FAIL: anon can read private.users';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot access private.users';
  END;

  BEGIN
    PERFORM 1 FROM private.companion_messages LIMIT 1;
    RAISE EXCEPTION 'FAIL: anon can read private.companion_messages';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot access private.companion_messages';
  END;

  BEGIN
    PERFORM 1 FROM private.refresh_tokens LIMIT 1;
    RAISE EXCEPTION 'FAIL: anon can read private.refresh_tokens';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot access private.refresh_tokens';
  END;
END;
$$;

RESET ROLE;


-- 3e. Simulate anon write attempt on api tables (must fail)
SET ROLE anon;

DO $$
BEGIN
  BEGIN
    INSERT INTO api.daily_recipes (title, summary, content, category)
    VALUES ('test', 'test', 'test', 'test');
    RAISE EXCEPTION 'FAIL: anon wrote to api.daily_recipes';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'PASS: anon cannot write to api.daily_recipes';
  END;
END;
$$;

RESET ROLE;


-- ───────────────────────────────────────────────────────────────────────────
-- § 4  SERVICE_ROLE CONNECTIVITY (backend access must work)
-- ───────────────────────────────────────────────────────────────────────────

-- 4a. service_role can access both schemas
SET ROLE service_role;

SELECT COUNT(*) AS user_count          FROM private.users;
SELECT COUNT(*) AS session_count       FROM private.companion_sessions;
SELECT COUNT(*) AS token_count         FROM private.refresh_tokens;
SELECT COUNT(*) AS recipe_count        FROM api.daily_recipes;
SELECT COUNT(*) AS program_count       FROM api.wellness_programs;
SELECT COUNT(*) AS community_count     FROM api.community_sessions;

RESET ROLE;

/*
EXPECTED: all queries return a count (0 is fine if tables are empty)
FAIL if any query raises insufficient_privilege
*/


-- ───────────────────────────────────────────────────────────────────────────
-- § 5  FOREIGN KEY INTEGRITY
--      verification_tokens.user_id → private.users.id
--      Confirm constraint still valid after schema move.
-- ───────────────────────────────────────────────────────────────────────────

SELECT
  tc.constraint_name,
  tc.table_schema || '.' || tc.table_name            AS "from",
  kcu.column_name                                    AS "from_column",
  ccu.table_schema || '.' || ccu.table_name          AS "to",
  ccu.column_name                                    AS "to_column"
FROM information_schema.table_constraints        tc
JOIN information_schema.key_column_usage         kcu
  ON  kcu.constraint_name = tc.constraint_name
  AND kcu.table_schema    = tc.table_schema
JOIN information_schema.constraint_column_usage  ccu
  ON  ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema IN ('private', 'api')
ORDER BY tc.table_name;

/*
EXPECTED (at minimum):
  verification_tokens_user_id_fkey | private.verification_tokens | user_id | private.users | id

  FAIL if no rows — FK was dropped during migration (data integrity risk)
  FAIL if references public.users — constraint points to wrong schema
*/


-- ───────────────────────────────────────────────────────────────────────────
-- § 6  rls_auto_enable() FUNCTION EXISTS
-- ───────────────────────────────────────────────────────────────────────────

SELECT routine_schema, routine_name, routine_type
FROM   information_schema.routines
WHERE  routine_name   = 'rls_auto_enable'
  AND  routine_schema = 'api';

/*
EXPECTED: 1 row — api | rls_auto_enable | FUNCTION
FAIL if 0 rows — function was not created
*/


-- ═══════════════════════════════════════════════════════════════════════════
-- END VERIFICATION
-- All sections must show only PASS / expected output.
-- Any FAIL = stop, do not proceed to backend smoke tests.
-- ═══════════════════════════════════════════════════════════════════════════
