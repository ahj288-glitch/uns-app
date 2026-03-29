# Pre-Launch Hardening Status

Last updated: 2026-03-27 (production rollout readiness pass complete)

| # | Item | Status | Files Changed | Risk if Skipped | Follow-up Notes |
|---|------|--------|---------------|-----------------|-----------------|
| 1 | OTP plaintext logging — NODE_ENV guard | ✅ DONE | `auth.ts` | OTPs logged to aggregators in staging/prod | None |
| 2 | Admin auth — httpOnly cookie | ✅ DONE | `auth.ts`, `app.ts`, `middlewares/auth.ts`, `useAdminAuth.ts` | XSS-readable sessionStorage token | Cookie is in addition to body token; backward compatible |
| 2b | Admin logout — server-side cookie clear | ✅ DONE | `auth.ts`, `useAdminAuth.ts` | Logout doesn't invalidate session | Requires `credentials: include` on logout fetch |
| 3 | Refresh token revocation (DB-backed) | ✅ DONE | `refresh_tokens.ts` (new), `schema/index.ts`, `auth.ts` | Stolen tokens usable for 7 days | Existing tokens rejected on first deploy — users re-auth once |
| 4 | Env validation at startup — production strict mode | ✅ DONE | `index.ts` | Silent misconfiguration in prod | JWT_SECRET now required; SMTP required in prod/staging |
| 5 | uns-admin typecheck — 0 errors | ✅ DONE | `pnpm-workspace.yaml`, `uns-admin/package.json`, `button-group.tsx`, `calendar.tsx` | Type drift erosion | Root cause was dual Zod install; fixed via packageExtensions |
| 6 | DB schema migration — refresh_tokens table | ⚠️ PENDING DEPLOY | `lib/db/src/schema/refresh_tokens.ts` | Server crash on first use of token revocation | Run `pnpm --filter @workspace/db run push` against production DB before deploy |
| 7 | DB schema migration — userId column on sessions | ⚠️ PENDING DEPLOY | `lib/db/src/schema/sessions.ts` | Login session restore fails | Same migration run; userId is nullable, backward compatible |

| 8 | Startup configuration summary log | ✅ DONE | `api-server/src/index.ts` | Silent misconfiguration at startup | Logs env mode, SMTP state, CORS origins, cookie security mode |
| 9 | Auth failure observability | ✅ DONE | `middlewares/auth.ts` | Undetectable auth attacks | Logs 401/403 with method + path, no token material |
| 10 | Refresh token rejection observability | ✅ DONE | `routes/auth.ts` | TOKEN_NOT_FOUND/REVOKED/EXPIRED silent | Logs hash prefix (8 chars) + rejection reason |
| 11 | Admin login failure observability | ✅ DONE | `routes/auth.ts` | Failed brute-force attempts invisible | Logs IP + reason (WRONG_SECRET vs ADMIN_SECRET_NOT_SET) |

## Summary

- **Security hardening:** Complete
- **Admin auth:** httpOnly cookie implemented and backward compatible
- **Token revocation:** Implemented; requires DB migration before first deploy
- **Observability:** Startup summary, auth failures, token rejections, admin login all logged
- **TypeScript:** 0 errors in both `api-server` and `uns-admin`
- **Builds:** Both packages build clean
- **Deployment docs:** `docs/production-rollout-plan.md`, `docs/postdeploy-validation-checklist.md`, `docs/rollback-plan.md`

## Pre-deploy checklist

Before deploying to production:
1. Set all required env vars (see `docs/production-env-requirements.md` and `docs/production-rollout-plan.md`)
2. Run `pnpm --filter @workspace/db run push` against the production DB
3. Verify `refresh_tokens` table created with correct columns
4. Verify `companion_sessions.user_id` column exists (nullable uuid)
5. Build both packages clean (typecheck + build)
6. Deploy api-server — confirm `[startup] Configuration summary` log shows expected state
7. Run `docs/postdeploy-validation-checklist.md` immediately after deploy
8. First deploy will invalidate all existing refresh tokens — acceptable for beta launch
