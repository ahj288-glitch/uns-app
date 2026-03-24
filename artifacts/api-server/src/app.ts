import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — explicit origin allowlist ─────────────────────────────────────────
const rawOrigins = process.env["ALLOWED_ORIGINS"] ?? "";
const allowedOrigins: string[] = rawOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server / native app requests (no origin header)
      if (!origin) return callback(null, true);
      // In development with no allowlist configured, allow all origins
      if (process.env["NODE_ENV"] !== "production" && allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// Global: 300 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down.", code: "RATE_LIMITED" },
});

// Strict: 10 req / min per session for AI companion (prevents OpenAI cost abuse)
// Keyed by session-id header; falls back to "anon" (not IP) to avoid IPv6 issues
const companionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Companion rate limit reached. Please wait a moment.", code: "COMPANION_RATE_LIMITED" },
  keyGenerator: (req: Request) =>
    (req.headers["x-session-id"] as string | undefined) ?? "anon",
  validate: { keyGeneratorIpFallback: false },
});

app.use(globalLimiter);
app.use("/api/companion", companionLimiter);

// ── Request Logging — sensitive fields never reach logs ───────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          // Strip query string — may contain tokens or ids
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── Body Parsing — bounded size to prevent payload attacks ────────────────────
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Normalised Error Handler ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message?.startsWith("CORS:")) {
    res.status(403).json({ error: "Origin not allowed", code: "CORS_BLOCKED" });
    return;
  }
  logger.error({ err: { message: err.message, name: err.name } }, "Unhandled error");
  res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
});

export default app;
