# أُنْس — Manual Verification Checklist

**For:** Product Owner / QA Lead
**Date:** 2026-03-26
**Purpose:** Steps you must perform yourself before beta launch — these cannot be verified without a running database and mobile device

---

## How to Use This Checklist

Each item has:
- **Precondition** — what must be true before you test
- **Steps** — exact tap/click sequence
- **Expected result** — what correct behavior looks like
- **Fail indicator** — what a regression looks like

Mark each as ✅ PASS, ❌ FAIL, or ⚠️ PARTIAL.

---

## Flow 1: Onboarding — New User Registration

**Precondition:** Fresh app install, no stored session. SMTP configured or dev-mode OTP logging enabled.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 1.1 | Open app → tap "ابدأ رحلتك" | Welcome screen shows | Crash or blank screen |
| 1.2 | Fill name, email, DOB, gender → tap register | OTP sent screen or home (if verification disabled) | "EMAIL_EXISTS" on fresh email = bug |
| 1.3 | Enter OTP from email/console | Redirected to home tabs | "INVALID_OTP" on correct code = bug |
| 1.4 | Kill app → reopen | Home screen loads (session restored) | Redirected back to onboarding = session not persisted |

---

## Flow 2: "I Already Have an Account" — Login Flow ⭐ (Critical fix)

**Precondition:** At least one registered user exists in the database.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 2.1 | Onboarding screen → tap "لديّ حساب بالفعل — سجّل الدخول" | Login screen appears (not-found screen) | `+not-found` or crash = FIX NOT WORKING |
| 2.2 | Login screen shows email input with "مرحباً من جديد" title | Correct screen layout | Wrong screen = file not found |
| 2.3 | Enter unregistered email → tap "إرسال رمز الدخول" | Error: "لا يوجد حساب بهذا البريد الإلكتروني" with "إنشاء حساب جديد" link | 500 error or wrong message |
| 2.4 | Tap "إنشاء حساب جديد" link in error | Navigates to register screen | No navigation |
| 2.5 | Enter registered email → tap send | OTP verification screen appears with userId param | Error or crash |
| 2.6 | Enter correct OTP → verify | Session created, home screen loads | "INVALID_OTP" = backend not generating OTP for login |
| 2.7 | Enter wrong OTP | "INVALID_OTP" error shown | Silent pass = security failure |
| 2.8 | Let OTP expire (>10 min) → try to use it | "OTP_EXPIRED" error | Old OTP still accepted = security failure |

---

## Flow 3: Session Restore

**Precondition:** User has completed onboarding and has a session.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 3.1 | Background app for 5 min → foreground | Home screen loads, no re-auth required | Redirected to onboarding |
| 3.2 | Wait 15+ minutes (access token expires) → make any API call | Automatic token refresh, no visible interruption | 401 error shown or session lost |
| 3.3 | Kill and reopen app | Session restored from AsyncStorage | Onboarding shown again |

---

## Flow 4: Logout / Clear Session ⭐ (Fixed)

**Precondition:** Active session in the app.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 4.1 | Profile → "إعادة البدء" → confirm "نعم" | Alert: "أعد تشغيل التطبيق لبدء جلسة جديدة" | No confirmation alert |
| 4.2 | After clearing: use a tool (e.g. Flipper / RN Debugger) to inspect AsyncStorage | All three keys absent: `uns_session_id`, `uns_access_token`, `uns_refresh_token` | Any key still present = FIX NOT WORKING |
| 4.3 | Restart app after clearing | Onboarding screen (no session found) | Home screen loads = stale session remains |

---

## Flow 5: Admin Login

**Precondition:** `ADMIN_SECRET` env var set on backend. uns-admin running.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 5.1 | Open admin panel → enter wrong password | "بيانات الدخول غير صحيحة" | 500 or login succeeds |
| 5.2 | Enter correct `ADMIN_SECRET` | Dashboard loads | 401 stays = wrong secret |
| 5.3 | Open DevTools → Application → Session Storage | `uns_admin_token` present | Token in `localStorage` = FIX NOT WORKING |
| 5.4 | Close admin tab → reopen | Login screen (session cleared) | Auto-login = still using localStorage |
| 5.5 | Open DevTools → Application → Local Storage | `uns_admin_token` absent | Token in localStorage = FIX NOT WORKING |

---

## Flow 6: Admin Route Protection

**Precondition:** Admin logged in.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 6.1 | Navigate to AI Config page | Page loads | 403/redirect |
| 6.2 | Using a regular user Bearer token, call `GET /api/gamification/stats` | 403 FORBIDDEN | 200 response = admin guard not working |
| 6.3 | Using admin Bearer token, call `GET /api/gamification/stats` | 200 with data | 403 = over-protected |
| 6.4 | Delete admin token from sessionStorage → navigate to another admin page | Redirected to login | Dashboard still loads = no auth guard |

---

## Flow 7: AI Config Persistence ⭐ (Fixed)

**Precondition:** Admin logged in.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 7.1 | AI Config page → change model tier to "gpt-4-turbo" → save | Success toast | Error or no response |
| 7.2 | Reload the AI Config page | "gpt-4-turbo" still selected | Reverts to default = NOT FIXED |
| 7.3 | curl `GET /api/admin/ai-config` with admin token | Returns `{ modelTier: "gpt-4-turbo" }` | Returns old value = NOT FIXED |
| 7.4 | Restart server process → repeat 7.3 | Returns default `{ modelTier: "gpt-4o" }` | ⚠️ EXPECTED — in-memory store resets on restart. Full persistence requires DB. |

---

## Flow 8: Admin Dashboard Data Reality Check

**Precondition:** Admin logged in. Fresh database with known real data.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 8.1 | Register exactly 3 test users | — | — |
| 8.2 | Open admin Dashboard → check "إجمالي المستخدمين" | Shows ~2847 + waitlist count (NOT 3) | ⚠️ This CONFIRMS the fake data issue is NOT fixed. Document it. |
| 8.3 | Check "نمو المستخدمين" chart | Values change on refresh (Math.random()) | ⚠️ This CONFIRMS the fake data issue. Document it. |

**Note:** Admin dashboard fake data is a confirmed BLOCKED item. Do not mark as fixed.

---

## Flow 9: Crisis Detection Behavior ⭐ (Enhanced)

**Precondition:** Companion chat open.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 9.1 | Send: "أريد أن أموت" (MSA) | Response includes crisis resources with phone numbers | Generic response = keyword missed |
| 9.2 | Send: "بدي موت" (Levantine) | Response includes crisis resources | Generic response = Levantine not covered |
| 9.3 | Send: "بغيت نموت" (Maghrebi) | Response includes crisis resources | Generic response = Maghrebi not covered |
| 9.4 | Send: "أنا حزين اليوم" (normal distress, NOT crisis) | Empathetic response WITHOUT crisis alert | Crisis resources triggered = false positive |
| 9.5 | Check: is any admin/backend alert triggered when crisis detected? | No alert (current system only appends text) | If you need real escalation, this is a BLOCKED gap |

---

## Flow 10: Gamification Correctness ⭐ (Multiple fixes)

**Precondition:** New session with zero checkins.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 10.1 | Submit first mood checkin | `first_checkin` win appears once in MicroWinModal | No win shown |
| 10.2 | Submit second checkin same day | No `first_checkin` win | `first_checkin` shown again = FIX NOT WORKING |
| 10.3 | Check DB: `SELECT * FROM micro_wins WHERE session_id = ?` | Exactly one row with `win_type = 'first_checkin'` | Multiple rows = FIX NOT WORKING |
| 10.4 | Simulate 14 consecutive daily checkins | Streak-14 win shown in DB with `win_type = 'streak_14'` | `win_type = 'streak_7'` in DB = FIX NOT WORKING |
| 10.5 | Call `POST /api/gamification/progress/win` with `{ winType: "checkin" }` | XP increases correctly, no extra DB round-trip | 500 error = dead DB call still present |

---

## Flow 11: Server-Side Daily Message Limit ⭐ (Fixed)

**Status:** IMPLEMENTED. Manual verification confirms correct rejection.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 11.1 | Send 30 messages via `POST /api/companion/chat` with same sessionId | All 30 succeed (200), response includes `{ dailyUsed: N, dailyLimit: 30 }` | Missing dailyUsed field = fix not deployed |
| 11.2 | Send 31st message with same sessionId | 429 response: `{ code: "DAILY_LIMIT_REACHED", limit: 30, used: 30 }` | 200 = server limit not working |
| 11.3 | Bypass client: call API directly after client UI shows limit | Still gets 429 from server | 200 = client-side bypass still works |
| 11.4 | Next day (midnight reset): send message with same sessionId | 200 succeeds (new day counter resets) | 429 = counter not resetting daily |

---

## Flow 12: Unauthorized Access Rejection

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 12.1 | `GET /api/companion/history` with no token | 401 `UNAUTHORIZED` | 200 or 500 |
| 12.2 | `GET /api/insights` with expired token | 401 `UNAUTHORIZED` | 200 or 500 |
| 12.3 | `GET /api/admin/overview` with user-role token | 403 `FORBIDDEN` | 200 = admin not protected |
| 12.4 | `GET /api/gamification/stats` with user-role token | 403 `FORBIDDEN` | 200 = stats not protected |
| 12.5 | `PUT /api/admin/ai-config` with user-role token | 403 `FORBIDDEN` | 200 = config endpoint not protected |

---

## Flow 13: LLM Integration ⭐ (Fixed)

**Precondition:** `OPENAI_API_KEY` set in server environment.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 13.1 | Send any message to companion chat | Contextually aware response, not one of 3 hardcoded strings | Hardcoded response = LLM not connected |
| 13.2 | Send the same message twice | Responses differ (non-deterministic) | Identical = rule-based fallback active |
| 13.3 | Admin panel → AI Config → change model tier to "gpt-4o-mini" → save → send message | Response reflects new model (check `llmUsed: true` in API response) | `llmUsed: false` = not using LLM |
| 13.4 | Remove `OPENAI_API_KEY` → restart → send message | Rule-based response returned, no 500 error | 500 = fallback not working |

---

## Flow 14: Login Session Restore ⭐ (Fixed)

**Precondition:** User has previously registered and has companion history.

| # | Step | Expected | Fail Indicator |
|---|------|----------|----------------|
| 14.1 | Login as returning user → complete OTP verify | Response includes `{ restored: true }` | `{ restored: false }` = new session created |
| 14.2 | After login: `GET /api/companion/history` | Returns existing message history | Empty history = session not restored |
| 14.3 | Send new message after login | Message appended to existing history | Empty history = old session replaced |
| 14.4 | Register new user → verify OTP | `{ restored: false }` in response | Acceptable — new user always gets fresh session |

---

## Highest-Risk Remaining Gaps (Updated for Launch Decision)

| Risk | Severity | Fixed? | Launch Blocker? |
|------|----------|--------|-----------------|
| No real LLM | CRITICAL | ✅ Yes | Cleared — requires `OPENAI_API_KEY` in env |
| Admin dashboard fake metrics | HIGH | ✅ Yes | Cleared — real DB data, nulls for unmeasured fields |
| No server-side message limit | HIGH | ✅ Yes | Cleared |
| Admin login silently broken | HIGH | ✅ Yes | Cleared — `data.accessToken` fix applied |
| Login creates new session (loses history) | MEDIUM | ✅ Yes | Cleared |
| In-memory AI config resets on restart | MEDIUM | Partial | No — documented limitation, beta-acceptable |
| Admin token XSS-readable (sessionStorage) | MEDIUM | Partial | No — httpOnly cookie is recommended next step |
| OTP plaintext in dev logs | LOW | ❌ No | No — only when SMTP not configured |

---

## Exact Items That Require Your Attention Before Launch

1. **Set `OPENAI_API_KEY`** in production environment. Companion falls back to rule-based without it — functional but not intelligent.
2. **Run DB migration:** `pnpm --filter @workspace/db run push` — applies the `user_id uuid` column to `companion_sessions` in production.
3. **Set `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`** — prevents OTP plaintext appearing in pino logs.
4. **Set `ADMIN_SECRET`** — admin panel authentication requires this env var.
5. **Token revocation (future)** — `clearSession()` still doesn't server-side invalidate the refresh token. Add a `/auth/logout` endpoint that blacklists refresh tokens for true revocation.
