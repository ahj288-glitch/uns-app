import { Router } from "express";
import { createHash, randomInt } from "crypto";
import { db } from "@workspace/db";
import {
  companionSessionsTable,
  refreshTokensTable,
  usersTable,
  verificationTokensTable,
} from "@workspace/db/schema";
import { eq, and, isNull, gt, desc } from "drizzle-orm";
import {
  generateAccessToken,
  generateAdminToken,
  generateRefreshToken,
  verifyJwt,
} from "../lib/jwt.js";
import nodemailer from "nodemailer";
import pino from "pino";
import { DIALECT_GREETINGS } from "../lib/constants.js";

const router = Router();
const logger = pino({ name: "auth" });

// ── Feature flag ──────────────────────────────────────────────────────────────
const IS_VERIFICATION_ENABLED = process.env["VERIFICATION_ENABLED"] === "true";
logger.info({ IS_VERIFICATION_ENABLED }, "[auth] verification feature flag");

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Persist a refresh token hash to the DB so it can be revoked on logout.
 * We never store the raw token — only its SHA-256 digest.
 */
async function storeRefreshToken(sessionId: string, token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await db
    .insert(refreshTokensTable)
    .values({ sessionId, tokenHash, expiresAt })
    .onConflictDoNothing(); // idempotent — duplicate hashes are fine to ignore
}

async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const smtpHost = process.env["SMTP_HOST"];
  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];

  if (!smtpHost || !smtpUser || !smtpPass) {
    if (process.env["NODE_ENV"] === "development") {
      // Dev-only: print OTP directly to stdout, NOT through pino (keeps it out of log aggregators).
      process.stdout.write(`\n[DEV OTP] ${maskEmail(email)} → ${otp}\n\n`);
      return;
    }
    // Staging/production with no SMTP: fail loudly. Never silently drop the OTP.
    throw new Error("SMTP is not configured — cannot send OTP (set SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env["SMTP_PORT"] ?? "587"),
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: `"أُنس" <${smtpUser}>`,
    to: email,
    subject: "رمز التحقق من أُنس",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1B4332;">أُنْس — رمز التحقق</h2>
        <p>رمز التحقق الخاص بك هو:</p>
        <h1 style="letter-spacing: 8px; color: #74C69D; font-size: 40px;">${otp}</h1>
        <p style="color: #7A9A8A;">صالح لمدة ١٠ دقائق فقط.</p>
      </div>
    `,
  });
}

// ── Cookie helpers ────────────────────────────────────────────────────────────
const ADMIN_COOKIE = "uns_admin_token";
const ADMIN_COOKIE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

function setAdminCookie(res: import("express").Response, token: string): void {
  const isProd = process.env["NODE_ENV"] === "production";
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: ADMIN_COOKIE_TTL_MS,
    path: "/",
  });
}

function clearAdminCookie(res: import("express").Response): void {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.post("/auth/register", async (req, res) => {
  const { name, email, dob, gender } = req.body as {
    name?: string;
    email?: string;
    dob?: string;
    gender?: string;
  };

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "INVALID_NAME", code: "INVALID_NAME" });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL", code: "INVALID_EMAIL" });
  }
  if (!dob || !/^\d{4}-\d{2}(-\d{2})?$/.test(dob)) {
    return res.status(400).json({ error: "INVALID_DOB", code: "INVALID_DOB" });
  }
  const [yearStr, monthStr] = dob.split("-");
  const year = parseInt(yearStr ?? "0", 10);
  const month = parseInt(monthStr ?? "0", 10);
  const currentYear = new Date().getFullYear();
  if (month < 1 || month > 12 || year < 1920 || year > currentYear - 10) {
    return res.status(400).json({ error: "INVALID_DOB", code: "INVALID_DOB" });
  }
  if (!gender || !["male", "female"].includes(gender)) {
    return res.status(400).json({ error: "INVALID_GENDER", code: "INVALID_GENDER" });
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "EMAIL_EXISTS", code: "EMAIL_EXISTS" });
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      name: name.trim(),
      email: email.toLowerCase(),
      dob,
      gender,
      verified: !IS_VERIFICATION_ENABLED,
    })
    .returning();

  if (!IS_VERIFICATION_ENABLED) {
    const [session] = await db
      .insert(companionSessionsTable)
      .values({ dialect: "gulf", userId: user.id })
      .returning();

    const accessToken = generateAccessToken(session.sessionId, "user");
    const refreshToken = generateRefreshToken(session.sessionId);
    await storeRefreshToken(session.sessionId, refreshToken);

    logger.info(
      { userId: user.id, IS_VERIFICATION_ENABLED, isAuthenticated: true, isEmailVerified: true },
      "[auth/register] verification disabled — session created immediately"
    );

    return res.status(201).json({
      accessToken,
      refreshToken,
      sessionId: session.sessionId,
      userId: user.id,
      email: user.email,
      verified: true,
    });
  }

  // Verification enabled — generate OTP and send email
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationTokensTable).values({ userId: user.id, otp, expiresAt });

  await sendOtpEmail(email.toLowerCase(), otp);

  logger.info(
    { userId: user.id, IS_VERIFICATION_ENABLED, maskedEmail: maskEmail(email) },
    "[auth/register] OTP sent — awaiting verification"
  );

  return res.status(201).json({
    userId: user.id,
    email: user.email,
    message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
  });
});

router.post("/auth/verify-email", async (req, res) => {
  const { userId, otp } = req.body as { userId?: string; otp?: string };

  if (!userId || !otp) {
    return res.status(400).json({ error: "INVALID_OTP", code: "INVALID_OTP" });
  }

  const now = new Date();

  const tokens = await db
    .select()
    .from(verificationTokensTable)
    .where(
      and(
        eq(verificationTokensTable.userId, userId),
        eq(verificationTokensTable.otp, otp),
        isNull(verificationTokensTable.usedAt),
        gt(verificationTokensTable.expiresAt, now)
      )
    )
    .limit(1);

  if (tokens.length === 0) {
    const expiredTokens = await db
      .select()
      .from(verificationTokensTable)
      .where(
        and(
          eq(verificationTokensTable.userId, userId),
          eq(verificationTokensTable.otp, otp),
          isNull(verificationTokensTable.usedAt)
        )
      )
      .limit(1);

    if (expiredTokens.length > 0) {
      return res.status(400).json({ error: "OTP_EXPIRED", code: "OTP_EXPIRED" });
    }

    return res.status(400).json({ error: "INVALID_OTP", code: "INVALID_OTP" });
  }

  const token = tokens[0];

  await db
    .update(verificationTokensTable)
    .set({ usedAt: now })
    .where(eq(verificationTokensTable.id, token.id));

  // Check verified state BEFORE marking verified — to distinguish login vs registration flow
  const userRows = await db
    .select({ verified: usersTable.verified })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  const wasAlreadyVerified = userRows[0]?.verified ?? false;

  await db
    .update(usersTable)
    .set({ verified: true })
    .where(eq(usersTable.id, userId));

  if (wasAlreadyVerified) {
    // LOGIN FLOW: restore the user's most recent session
    const existingSessions = await db
      .select()
      .from(companionSessionsTable)
      .where(eq(companionSessionsTable.userId, userId))
      .orderBy(desc(companionSessionsTable.lastActiveAt))
      .limit(1);

    if (existingSessions.length > 0) {
      const existingSession = existingSessions[0];
      const accessToken = generateAccessToken(existingSession.sessionId, "user");
      const refreshToken = generateRefreshToken(existingSession.sessionId);
      await storeRefreshToken(existingSession.sessionId, refreshToken);
      return res.json({
        accessToken,
        refreshToken,
        sessionId: existingSession.sessionId,
        restored: true,
      });
    }
    // User has no session yet (edge case) — fall through to create one
  }

  // REGISTRATION FLOW (or first-ever login with no session): create new session linked to userId
  const [session] = await db
    .insert(companionSessionsTable)
    .values({ dialect: "gulf", userId })
    .returning();

  const accessToken = generateAccessToken(session.sessionId, "user");
  const refreshToken = generateRefreshToken(session.sessionId);
  await storeRefreshToken(session.sessionId, refreshToken);

  return res.json({ accessToken, refreshToken, sessionId: session.sessionId, restored: false });
});

const resendCounts = new Map<string, { count: number; resetAt: number }>();

router.post("/auth/resend-verification", async (req, res) => {
  const { userId } = req.body as { userId?: string };

  if (!userId) {
    return res.status(400).json({ error: "INVALID_REQUEST", code: "INVALID_REQUEST" });
  }

  const now = Date.now();
  const record = resendCounts.get(userId);
  if (record && now < record.resetAt) {
    if (record.count >= 3) {
      return res.status(429).json({ error: "RATE_LIMITED", code: "RATE_LIMITED" });
    }
    record.count += 1;
  } else {
    resendCounts.set(userId, { count: 1, resetAt: now + 10 * 60 * 1000 });
  }

  const user = await db
    .select({ email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (user.length === 0) {
    return res.status(404).json({ error: "USER_NOT_FOUND", code: "USER_NOT_FOUND" });
  }

  await db
    .update(verificationTokensTable)
    .set({ usedAt: new Date() })
    .where(
      and(eq(verificationTokensTable.userId, userId), isNull(verificationTokensTable.usedAt))
    );

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationTokensTable).values({ userId, otp, expiresAt });

  await sendOtpEmail(user[0].email, otp);

  return res.json({ message: "تم إعادة إرسال الرمز" });
});

router.post("/auth/login", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL", code: "INVALID_EMAIL" });
  }

  const trimmedEmail = email.trim().toLowerCase();

  const users = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.email, trimmedEmail))
    .limit(1);

  if (users.length === 0) {
    return res.status(404).json({ error: "USER_NOT_FOUND", code: "USER_NOT_FOUND" });
  }

  const user = users[0];

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db
    .update(verificationTokensTable)
    .set({ usedAt: new Date() })
    .where(
      and(eq(verificationTokensTable.userId, user.id), isNull(verificationTokensTable.usedAt))
    );

  await db.insert(verificationTokensTable).values({ userId: user.id, otp, expiresAt });

  await sendOtpEmail(trimmedEmail, otp);

  logger.info(
    { userId: user.id, maskedEmail: maskEmail(trimmedEmail) },
    "[auth/login] OTP sent for login"
  );

  return res.json({
    userId: user.id,
    email: user.email,
    message: "تم إرسال رمز الدخول إلى بريدك الإلكتروني",
  });
});

router.post("/auth/session", async (req, res) => {
  const { dialect, sessionId: existingSessionId, onboardingData } = req.body as {
    dialect?: string;
    sessionId?: string;
    onboardingData?: Record<string, unknown>;
  };

  const resolvedDialect = typeof dialect === "string" ? dialect : "gulf";

  if (existingSessionId) {
    const rows = await db
      .select()
      .from(companionSessionsTable)
      .where(eq(companionSessionsTable.sessionId, existingSessionId))
      .limit(1);

    const existing = rows[0];
    if (existing) {
      const greeting = DIALECT_GREETINGS[existing.dialect] ?? DIALECT_GREETINGS["gulf"]!;
      const accessToken = generateAccessToken(existing.sessionId, "user");
      const refreshToken = generateRefreshToken(existing.sessionId);
      await storeRefreshToken(existing.sessionId, refreshToken);

      return res.json({ accessToken, refreshToken, sessionId: existing.sessionId, greeting });
    }
  }

  const [session] = await db
    .insert(companionSessionsTable)
    .values({ dialect: resolvedDialect, emotionalProfile: onboardingData ?? null })
    .returning();

  const greeting = DIALECT_GREETINGS[resolvedDialect] ?? DIALECT_GREETINGS["gulf"]!;
  const accessToken = generateAccessToken(session.sessionId, "user");
  const refreshToken = generateRefreshToken(session.sessionId);
  await storeRefreshToken(session.sessionId, refreshToken);

  return res.status(201).json({ accessToken, refreshToken, sessionId: session.sessionId, greeting });
});

// ── Admin auth ────────────────────────────────────────────────────────────────

router.post("/auth/admin", (req, res) => {
  const { secret } = req.body as { secret?: string };
  const adminSecret = process.env["ADMIN_SECRET"];

  if (!adminSecret || !secret || secret !== adminSecret) {
    logger.warn(
      { ip: req.ip, reason: !adminSecret ? "ADMIN_SECRET_NOT_SET" : "WRONG_SECRET" },
      "[auth/admin] failed login attempt"
    );
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }

  const accessToken = generateAdminToken();

  // Set httpOnly cookie for browser-based admin panel; also return token in body
  // so clients that can't read cookies (e.g. server-to-server) still work.
  setAdminCookie(res, accessToken);

  logger.info({ ip: req.ip }, "[auth/admin] successful admin login");
  return res.json({ accessToken });
});

router.post("/auth/admin/logout", (_req, res) => {
  clearAdminCookie(res);
  return res.json({ ok: true });
});

// ── Token management ──────────────────────────────────────────────────────────

router.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }

  try {
    const payload = verifyJwt(refreshToken);

    // Verify the token is in our DB and has not been revoked.
    const tokenHash = hashToken(refreshToken);
    const stored = await db
      .select({ revokedAt: refreshTokensTable.revokedAt, expiresAt: refreshTokensTable.expiresAt })
      .from(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, tokenHash))
      .limit(1);

    if (stored.length === 0) {
      // Token was never persisted — issued before revocation was added, or forged.
      logger.warn(
        { hashPrefix: tokenHash.slice(0, 8) },
        "[auth/refresh] TOKEN_NOT_FOUND — not in DB (pre-revocation token or forged)"
      );
      return res.status(401).json({ error: "Unauthorized", code: "TOKEN_NOT_FOUND" });
    }

    if (stored[0].revokedAt !== null) {
      logger.warn(
        { hashPrefix: tokenHash.slice(0, 8), revokedAt: stored[0].revokedAt },
        "[auth/refresh] TOKEN_REVOKED — attempt to use a revoked token"
      );
      return res.status(401).json({ error: "Unauthorized", code: "TOKEN_REVOKED" });
    }

    if (stored[0].expiresAt < new Date()) {
      logger.warn(
        { hashPrefix: tokenHash.slice(0, 8), expiresAt: stored[0].expiresAt },
        "[auth/refresh] TOKEN_EXPIRED — token past expiry date"
      );
      return res.status(401).json({ error: "Unauthorized", code: "TOKEN_EXPIRED" });
    }

    const accessToken = generateAccessToken(payload.sub, "user");
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
});

/**
 * POST /auth/logout
 * Revokes the provided refresh token.  The client MUST discard the refresh
 * token and any stored access tokens after calling this endpoint.
 */
router.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await db
      .update(refreshTokensTable)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokensTable.tokenHash, tokenHash), isNull(refreshTokensTable.revokedAt))
      );
  }

  // Also clear the admin cookie if present (handles admin panel logout via same endpoint).
  clearAdminCookie(res);

  return res.json({ ok: true });
});

export default router;
