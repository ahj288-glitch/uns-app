// Vitest global setup — provides the env vars that modules assert at import time.
// DATABASE_URL: lib/db/src/index.ts throws unless this is set. It is a dummy DSN;
// the pg Pool is lazy, so no connection is opened unless a test actually queries.
// JWT_SECRET / ADMIN_SECRET: used by the auth route + jwt helpers under test.
process.env["DATABASE_URL"] ??= "postgres://test:test@localhost:5432/uns_test";
process.env["JWT_SECRET"] ??= "test-secret-for-unit-tests";
process.env["ADMIN_SECRET"] ??= "test-admin-secret";
