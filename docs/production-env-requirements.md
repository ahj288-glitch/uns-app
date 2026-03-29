# Production Environment Requirements

This document defines every environment variable used by the `api-server` and how each behaves across environments.

---

## Required in ALL environments (server crashes if absent)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | TCP port the HTTP server listens on | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/uns` |
| `JWT_SECRET` | HMAC-SHA256 secret for signing JWTs (min 32 chars recommended) | random 64-char hex string |

---

## Required in production and staging (server crashes if absent when `NODE_ENV=production` or `staging`)

| Variable | Description |
|----------|-------------|
| `ADMIN_SECRET` | Passphrase for admin panel login. Use a strong random string (min 20 chars). |
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.sendgrid.net`). Required for `POST /auth/login` and `POST /auth/resend-verification` — both always send email regardless of `VERIFICATION_ENABLED`. |
| `SMTP_USER` | SMTP authentication username |
| `SMTP_PASS` | SMTP authentication password |

---

## Optional but recommended (degraded features if absent)

| Variable | Default behaviour when absent | Example |
|----------|-------------------------------|---------|
| `OPENAI_API_KEY` | AI companion falls back to rule-based responses | `sk-...` |
| `SMTP_PORT` | Defaults to `587` | `587` or `465` |
| `VERIFICATION_ENABLED` | OTP email verification disabled; users enter app immediately | `true` |
| `ALLOWED_ORIGINS` | CORS allows all origins in non-production (comma-separated list in prod) | `https://uns-app.com,https://admin.uns-app.com` |
| `NODE_ENV` | Defaults to undefined; set to `production` or `staging` to activate strict env checks | `production` |

---

## Development-only behaviour

| Condition | Behaviour |
|-----------|-----------|
| `NODE_ENV=development` + no SMTP | OTP printed to stdout (`[DEV OTP] m***@mail.com → 123456`). The `POST /auth/login` flow works in dev without SMTP. |
| `NODE_ENV` not set | All optional vars warn but don't block startup |
| No `ADMIN_SECRET` in dev | Admin login always fails (expected) |

> **Important:** `POST /auth/login` and `POST /auth/resend-verification` always send OTP via SMTP regardless of the `VERIFICATION_ENABLED` flag. SMTP is not optional in production even if registration verification is disabled — users who attempt to log in after re-installing the app require SMTP to receive their OTP.

---

## Deployment topology requirement

The admin panel (`uns-admin`) uses `API_BASE = "/api"` (relative URL). The admin panel and api-server **must share the same origin** in production. Use a reverse proxy that serves both the SPA and API from the same hostname. If they are on separate domains, relative `/api` paths will not reach the api-server and admin login will fail.

If `ALLOWED_ORIGINS` is empty and `NODE_ENV=production`, all browser requests from pages with an `Origin` header are blocked by CORS. Set `ALLOWED_ORIGINS` to the exact production origin(s).

## Security notes

- Never commit any of these to source control.
- `JWT_SECRET` must be the same across all api-server instances (otherwise tokens issued by one instance fail on others).
- `ADMIN_SECRET` should be rotated if there is any suspicion of compromise. All admin sessions expire in 24 hours by design.
- The httpOnly admin cookie is only sent with `secure: true` when `NODE_ENV=production`. Ensure HTTPS is terminated at the load balancer in production.
- Refresh tokens are stored as SHA-256 hashes in the `refresh_tokens` table. The raw token is never persisted.
- On first production deploy, all existing refresh tokens are invalidated (TOKEN_NOT_FOUND). Users re-authenticate once. This is expected behavior.

---

## Database migrations required before first deploy

The following schema changes were made and must be applied with:
```
pnpm --filter @workspace/db run push
```

| Table | Change | Notes |
|-------|--------|-------|
| `companion_sessions` | Added nullable `user_id uuid` column | Links sessions to registered users; old rows have `NULL` (anonymous) |
| `refresh_tokens` | New table | Required for server-side token revocation; `POST /auth/refresh` will reject tokens not in this table |
