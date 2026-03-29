import app from "./app";
import { logger } from "./lib/logger";

// ── Required environment variable validation ──────────────────────────────────
// Fail fast with clear messages rather than cryptic runtime errors later.
const REQUIRED: string[] = ["PORT", "DATABASE_URL", "JWT_SECRET"];

// These degrade specific features when absent; warn in all envs.
const WARN_IF_MISSING: string[] = [
  "OPENAI_API_KEY",  // AI companion degrades to rule-based responses
  "ADMIN_SECRET",    // Admin panel login will be blocked
  "SMTP_HOST",       // Email verification cannot send OTP in non-dev
  "SMTP_USER",
  "SMTP_PASS",
];

// In production / staging these become hard requirements.
const REQUIRED_IN_PRODUCTION: string[] = [
  "ADMIN_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[startup] FATAL: Required environment variable '${key}' is not set.`);
    process.exit(1);
  }
}

const isProduction = process.env["NODE_ENV"] === "production";
const isStaging = process.env["NODE_ENV"] === "staging";

if (isProduction || isStaging) {
  for (const key of REQUIRED_IN_PRODUCTION) {
    if (!process.env[key]) {
      // eslint-disable-next-line no-console
      console.error(`[startup] FATAL: '${key}' is required in ${process.env["NODE_ENV"]} but is not set.`);
      process.exit(1);
    }
  }
}

for (const key of WARN_IF_MISSING) {
  if (!process.env[key] && !isProduction && !isStaging) {
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

// ── Startup configuration summary ─────────────────────────────────────────────
// Confirms active configuration for operators without exposing secret values.
const nodeEnv = process.env["NODE_ENV"] ?? "development";
const smtpConfigured = Boolean(
  process.env["SMTP_HOST"] && process.env["SMTP_USER"] && process.env["SMTP_PASS"]
);
const rawOrigins = process.env["ALLOWED_ORIGINS"] ?? "";
const allowedOriginsCount = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean).length;

logger.info({
  environment: nodeEnv,
  port: rawPort,
  smtp: smtpConfigured
    ? "configured"
    : nodeEnv === "development"
      ? "disabled — OTP printed to stdout (dev only; login/verify will NOT work in production without SMTP)"
      : "NOT CONFIGURED — login and OTP verification will fail with 500",
  openai: process.env["OPENAI_API_KEY"] ? "configured" : "absent — rule-based fallback",
  adminSecret: process.env["ADMIN_SECRET"] ? "present" : "absent — admin login blocked",
  emailVerification: process.env["VERIFICATION_ENABLED"] === "true" ? "enabled" : "disabled",
  cors: allowedOriginsCount > 0
    ? `${allowedOriginsCount} origin(s) allowlisted`
    : nodeEnv !== "production"
      ? "unrestricted (dev/staging)"
      : "WARNING: no ALLOWED_ORIGINS set — browser requests will be blocked",
  secureCookie: nodeEnv === "production" ? "enabled (Secure + SameSite=Strict)" : "disabled (SameSite=Lax)",
}, "[startup] Configuration summary — env validation passed");

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port, environment: nodeEnv }, "[startup] Server listening");
});
