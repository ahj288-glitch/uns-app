import app from "./app";
import { logger } from "./lib/logger";

// ── Required environment variable validation ──────────────────────────────────
// Fail fast with clear messages rather than cryptic runtime errors later.
const REQUIRED: string[] = ["PORT", "DATABASE_URL"];
const WARN_IF_MISSING: string[] = ["OPENAI_API_KEY", "ADMIN_SECRET", "JWT_SECRET"];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[startup] FATAL: Required environment variable '${key}' is not set.`);
    process.exit(1);
  }
}

for (const key of WARN_IF_MISSING) {
  if (!process.env[key]) {
    logger.warn(`[startup] WARNING: '${key}' is not set — related features will be degraded.`);
  }
}

// ── Server startup ────────────────────────────────────────────────────────────
const rawPort = process.env["PORT"]!;
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  // eslint-disable-next-line no-console
  console.error(`[startup] FATAL: Invalid PORT value: "${rawPort}"`);
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
