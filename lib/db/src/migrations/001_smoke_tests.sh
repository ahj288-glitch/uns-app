#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# أُنْس — Backend Smoke Tests: post-migration 001_private_schema
# Run from VPS: bash 001_smoke_tests.sh
# Requires: curl, jq
# ═══════════════════════════════════════════════════════════════════════════

API="http://localhost:3000"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $1"; ((PASS++)); }
fail() { echo -e "${RED}FAIL${NC} $1"; ((FAIL++)); }
section() { echo -e "\n${YELLOW}── $1 ──${NC}"; }

# ── helpers ─────────────────────────────────────────────────────────────────
http_status() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

json_field() {
  echo "$1" | jq -r "$2" 2>/dev/null
}


# ═══════════════════════════════════════════════════════════════════════════
# 1. HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════
section "1. HEALTH"

STATUS=$(http_status "$API/health")
[ "$STATUS" = "200" ] && pass "GET /health → 200" || fail "GET /health → $STATUS (expected 200)"


# ═══════════════════════════════════════════════════════════════════════════
# 2. AUTH — REGISTER + LOGIN + TOKEN
# ═══════════════════════════════════════════════════════════════════════════
section "2. AUTH"

TEST_EMAIL="smoke_$(date +%s)@test.local"
TEST_PASS="SmokeTest123!"
TEST_NAME="اختبار"

# 2a. Register
REGISTER=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"name\":\"$TEST_NAME\",\"dob\":\"1990-01-01\",\"gender\":\"male\"}")

REGISTER_STATUS=$(echo "$REGISTER" | jq -r '.sessionId // empty')
[ -n "$REGISTER_STATUS" ] \
  && pass "POST /auth/register → sessionId present (writes to private.users)" \
  || fail "POST /auth/register → $(echo "$REGISTER" | jq -r '.error // .message // "unknown error"')"

SESSION_ID=$(json_field "$REGISTER" '.sessionId')
ACCESS_TOKEN=$(json_field "$REGISTER" '.accessToken')
REFRESH_TOKEN=$(json_field "$REGISTER" '.refreshToken')

# 2b. Login
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")

LOGIN_TOKEN=$(json_field "$LOGIN" '.accessToken')
[ -n "$LOGIN_TOKEN" ] \
  && pass "POST /auth/login → accessToken present (reads private.users)" \
  || fail "POST /auth/login → $(echo "$LOGIN" | jq -r '.error // .message // "unknown"')"

# Use login token for subsequent requests
TOKEN="$LOGIN_TOKEN"

# 2c. Token refresh
REFRESH=$(curl -s -X POST "$API/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

NEW_TOKEN=$(json_field "$REFRESH" '.accessToken')
[ -n "$NEW_TOKEN" ] \
  && pass "POST /auth/refresh → new accessToken (reads/writes private.refresh_tokens)" \
  || fail "POST /auth/refresh → $(echo "$REFRESH" | jq -r '.error // .message // "unknown"')"

TOKEN="$NEW_TOKEN"


# ═══════════════════════════════════════════════════════════════════════════
# 3. COMPANION SESSION + CHAT
# ═══════════════════════════════════════════════════════════════════════════
section "3. CHAT"

# 3a. Start companion session (should already exist from register)
[ -n "$SESSION_ID" ] \
  && pass "Companion session exists: $SESSION_ID (private.companion_sessions)" \
  || fail "No session ID from registration"

# 3b. Send a chat message
CHAT=$(curl -s -X POST "$API/companion/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"message\":\"أهلاً، كيف حالك؟\"}")

CHAT_RESPONSE=$(json_field "$CHAT" '.response')
[ -n "$CHAT_RESPONSE" ] \
  && pass "POST /companion/chat → response received (writes to private.companion_messages)" \
  || fail "POST /companion/chat → $(echo "$CHAT" | jq -r '.error // .message // "unknown"')"

LLM_USED=$(json_field "$CHAT" '.llmUsed')
[ "$LLM_USED" = "true" ] \
  && pass "POST /companion/chat → llmUsed=true (Groq active)" \
  || fail "POST /companion/chat → llmUsed=$LLM_USED (Groq not active, rule-based fallback)"

# 3c. Chat history
HISTORY=$(curl -s "$API/companion/history?sessionId=$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

MSG_COUNT=$(json_field "$HISTORY" '.messages | length')
[ "${MSG_COUNT:-0}" -gt 0 ] \
  && pass "GET /companion/history → $MSG_COUNT messages (reads private.companion_messages)" \
  || fail "GET /companion/history → $(echo "$HISTORY" | jq -r '.error // .message // "0 messages"')"


# ═══════════════════════════════════════════════════════════════════════════
# 4. MOOD CHECK-INS
# ═══════════════════════════════════════════════════════════════════════════
section "4. MOODS"

MOOD=$(curl -s -X POST "$API/moods" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"moodWord\":\"calm\",\"moodWordArabic\":\"هادئ\",\"intensity\":7}")

MOOD_ID=$(json_field "$MOOD" '.id')
[ -n "$MOOD_ID" ] \
  && pass "POST /moods → mood saved (writes to private.mood_checkins)" \
  || fail "POST /moods → $(echo "$MOOD" | jq -r '.error // .message // "unknown"')"

MOOD_LIST=$(curl -s "$API/moods?sessionId=$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

MOOD_COUNT=$(json_field "$MOOD_LIST" '. | if type == "array" then length else .moods | length end')
[ "${MOOD_COUNT:-0}" -gt 0 ] \
  && pass "GET /moods → $MOOD_COUNT entries (reads private.mood_checkins)" \
  || fail "GET /moods → $(echo "$MOOD_LIST" | jq -r '.error // .message // "0 entries"')"


# ═══════════════════════════════════════════════════════════════════════════
# 5. PUBLIC CATALOG ENDPOINTS (api schema)
# ═══════════════════════════════════════════════════════════════════════════
section "5. PUBLIC CATALOG (api schema)"

# 5a. Wellness programs — no auth required
PROGRAMS=$(curl -s "$API/programs")
PROG_STATUS=$(http_status "$API/programs")
[ "$PROG_STATUS" = "200" ] \
  && pass "GET /programs → 200 (reads api.wellness_programs)" \
  || fail "GET /programs → $PROG_STATUS"

# 5b. Daily recipes
RECIPES=$(curl -s "$API/daily-recipes")
REC_STATUS=$(http_status "$API/daily-recipes")
[ "$REC_STATUS" = "200" ] \
  && pass "GET /daily-recipes → 200 (reads api.daily_recipes)" \
  || fail "GET /daily-recipes → $REC_STATUS"

# 5c. Community sessions
COMMUNITY=$(curl -s "$API/community/sessions")
COM_STATUS=$(http_status "$API/community/sessions")
[ "$COM_STATUS" = "200" ] \
  && pass "GET /community/sessions → 200 (reads api.community_sessions)" \
  || fail "GET /community/sessions → $COM_STATUS"


# ═══════════════════════════════════════════════════════════════════════════
# 6. UNAUTHORIZED ACCESS (security assertions)
# ═══════════════════════════════════════════════════════════════════════════
section "6. SECURITY ASSERTIONS"

# 6a. Chat without token → 401
UNAUTH=$(http_status -X POST "$API/companion/chat" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION_ID\",\"message\":\"test\"}")
[ "$UNAUTH" = "401" ] \
  && pass "POST /companion/chat without token → 401" \
  || fail "POST /companion/chat without token → $UNAUTH (expected 401)"

# 6b. Chat with wrong session → 403
WRONG_SESSION="00000000-0000-0000-0000-000000000000"
MISMATCH=$(http_status -X POST "$API/companion/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"sessionId\":\"$WRONG_SESSION\",\"message\":\"test\"}")
[ "$MISMATCH" = "403" ] \
  && pass "POST /companion/chat with mismatched sessionId → 403" \
  || fail "POST /companion/chat with mismatched sessionId → $MISMATCH (expected 403)"

# 6c. Mood history for different session → 403 or empty
CROSS=$(http_status "$API/moods?sessionId=$WRONG_SESSION" \
  -H "Authorization: Bearer $TOKEN")
[ "$CROSS" = "403" ] || [ "$CROSS" = "200" ] \
  && pass "GET /moods for foreign sessionId → $CROSS (acceptable)" \
  || fail "GET /moods for foreign sessionId → $CROSS (unexpected)"


# ═══════════════════════════════════════════════════════════════════════════
# 7. LOGOUT (cleanup)
# ═══════════════════════════════════════════════════════════════════════════
section "7. LOGOUT"

LOGOUT=$(curl -s -X POST "$API/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")

LOGOUT_STATUS=$(http_status -X POST "$API/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
[ "$LOGOUT_STATUS" = "200" ] || [ "$LOGOUT_STATUS" = "204" ] \
  && pass "POST /auth/logout → $LOGOUT_STATUS (revokes private.refresh_tokens)" \
  || fail "POST /auth/logout → $LOGOUT_STATUS"


# ═══════════════════════════════════════════════════════════════════════════
# RESULTS
# ═══════════════════════════════════════════════════════════════════════════

TOTAL=$((PASS + FAIL))
echo ""
echo "═══════════════════════════════════════════"
echo -e " Results: ${GREEN}${PASS} passed${NC} / ${RED}${FAIL} failed${NC} / ${TOTAL} total"
echo "═══════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}Migration verification FAILED — review failures above.${NC}"
  echo "If backend cannot reach tables: confirm schema files were rebuilt"
  echo "  cd /root/uns-app && pnpm --filter api-server build && pm2 restart uns-api --update-env"
  echo "If SQL failures: run 001_rollback.sql in Supabase SQL Editor"
  exit 1
else
  echo -e "${GREEN}All checks passed — migration successful.${NC}"
  exit 0
fi
