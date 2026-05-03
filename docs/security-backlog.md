# Security Backlog

Tracked security issues that are accepted as MVP debt or otherwise deferred. Each entry has a severity, the date discovered, the current status, and the planned resolution.

---

## Email enumeration via /auth/login-start (accepted MVP debt)

**Severity:** Medium
**Discovered:** 3 May 2026, BATCH 1 pre-flight
**Status:** Accepted for MVP, scheduled for BATCH 4 hardening

The `/auth/login-start` endpoint returns `404 USER_NOT_FOUND` when the email isn't registered, which leaks account existence to a probing attacker. Three resolutions were considered:

- (i)   Keep 404 — clear UX, accepts enumeration leak  ← chosen for MVP
- (ii)  Always return 200 — privacy-first, hurts UX for typo'd emails
- (iii) Generic 200 + email-side disambiguation — best of both, more work

BATCH 4 will migrate to (iii): server returns 200 regardless of whether the email exists. If the email IS registered, OTP email goes out as normal. If it ISN'T, send a different email ("Someone tried to log in to an account at this address but no account exists. If this was you, you can create one here.") — preserving privacy while maintaining UX recovery for typos.

Additional consideration for BATCH 4: timing attack. The current DB lookup time differs between existing and non-existing emails. Even if the response is generic, an attacker measuring response latency can infer existence. Mitigation: constant-time lookup pattern (always fetch SOMETHING, always run bcrypt-equivalent dummy work), OR add deliberate random delay to mask the timing signal.
