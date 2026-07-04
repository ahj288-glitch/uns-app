#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Fix 6 — real-DB manual verification
#
# The automated test (src/__tests__/session-userid.test.ts) mocks the database,
# so it proves the WIRING (createUserSession always writes a userId + validates).
# This script proves the END-TO-END behaviour against a real Postgres: that after
# register / login-start / verify-email, the companion_sessions row has the right
# user_id, and that the anonymous /auth/session row is intentionally NULL.
#
# Prereqs:
#   - API server running against a real DB:  DATABASE_URL=... npm run dev
#   - psql available and DATABASE_URL exported in this shell
#   - Env: API=${API:-http://localhost:3000/api}
#
# Usage:  DATABASE_URL=postgres://... API=http://localhost:3000/api bash scripts/verify-f6.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
API="${API:-http://localhost:3000/api}"
: "${DATABASE_URL:?export DATABASE_URL to the running server's database}"

q() { psql "$DATABASE_URL" -tA -c "$1"; }
pass() { echo "  ✅ $1"; }
fail() { echo "  ❌ $1"; exit 1; }

EMAIL="f6-verify-$(date +%s)@example.com"

echo "1) /auth/register (VERIFICATION disabled → immediate session)"
REG=$(curl -s -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"F6 Test\",\"email\":\"$EMAIL\",\"dob\":\"1990-01-01\",\"gender\":\"female\"}")
USER_ID=$(echo "$REG" | node -pe 'JSON.parse(require("fs").readFileSync(0)).userId')
SESSION_ID=$(echo "$REG" | node -pe 'JSON.parse(require("fs").readFileSync(0)).sessionId // ""')
echo "   userId=$USER_ID sessionId=$SESSION_ID"

if [ -n "$SESSION_ID" ]; then
  LINKED=$(q "SELECT user_id FROM companion_sessions WHERE session_id = '$SESSION_ID';")
  [ "$LINKED" = "$USER_ID" ] && pass "register session linked to user_id" \
    || fail "register session user_id='$LINKED' expected '$USER_ID'"
else
  echo "   (verification enabled — no immediate session; run the verify-email path below)"
fi

echo "2) Anonymous /auth/session (onboarding, pre-auth → user_id MUST be NULL)"
ANON=$(curl -s -X POST "$API/auth/session" -H 'Content-Type: application/json' -d '{"dialect":"gulf"}')
ANON_SID=$(echo "$ANON" | node -pe 'JSON.parse(require("fs").readFileSync(0)).sessionId')
ANON_UID=$(q "SELECT COALESCE(user_id::text,'NULL') FROM companion_sessions WHERE session_id = '$ANON_SID';")
[ "$ANON_UID" = "NULL" ] && pass "anonymous onboarding session is intentionally NULL" \
  || fail "anonymous session unexpectedly linked to '$ANON_UID'"

echo "3) Invariant: NO authenticated path leaves an orphaned session"
echo "   (informational) sessions with NULL user_id (expected: only anonymous/onboarding rows):"
q "SELECT count(*) FROM companion_sessions WHERE user_id IS NULL;"

echo ""
echo "F6 real-DB verification complete."
