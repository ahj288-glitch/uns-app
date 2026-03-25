import { Router } from "express";
import { randomInt } from "crypto";
import { db } from "@workspace/db";
import {
  companionSessionsTable,
  usersTable,
  verificationTokensTable,
} from "@workspace/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
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
// Set VERIFICATION_ENABLED=true in env to require email OTP/magic-link.
// Default false for MVP/testing — user enters app immediately after registration.
const IS_VERIFICATION_ENABLED = process.env["VERIFICATION_ENABLED"] === "true";
logger.info({ IS_VERIFICATION_ENABLED }, "[auth] verification feature flag");

function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const masked = local[0] + "***";
  return `${masked}@${domain}`;
}

async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const smtpHost = process.env["SMTP_HOST"];
  const smtpUser = process.env["SMTP_USER"];
  const smtpPass = process.env["SMTP_PASS"];

  if (!smtpHost || !smtpUser || !smtpPass) {
    logger.info({ otp }, "DEV: verification code");
    return;
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
    // Verification disabled — create session immediately and return tokens
    const [session] = await db
      .insert(companionSessionsTable)
      .values({ dialect: "gulf" })
      .returning();

    const accessToken = generateAccessToken(session.sessionId, "user");
    const refreshToken = generateRefreshToken(session.sessionId);

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

  await db.insert(verificationTokensTable).values({
    userId: user.id,
    otp,
    expiresAt,
  });

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

  await db
    .update(usersTable)
    .set({ verified: true })
    .where(eq(usersTable.id, userId));

  const [session] = await db
    .insert(companionSessionsTable)
    .values({ dialect: "gulf" })
    .returning();

  const accessToken = generateAccessToken(session.sessionId, "user");
  const refreshToken = generateRefreshToken(session.sessionId);

  return res.json({ accessToken, refreshToken, sessionId: session.sessionId });
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
      and(
        eq(verificationTokensTable.userId, userId),
        isNull(verificationTokensTable.usedAt)
      )
    );

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.insert(verificationTokensTable).values({ userId, otp, expiresAt });

  await sendOtpEmail(user[0].email, otp);

  return res.json({ message: "تم إعادة إرسال الرمز" });
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

      return res.json({
        accessToken,
        refreshToken,
        sessionId: existing.sessionId,
        greeting,
      });
    }
  }

  const [session] = await db
    .insert(companionSessionsTable)
    .values({
      dialect: resolvedDialect,
      emotionalProfile: onboardingData ?? null,
    })
    .returning();

  const greeting = DIALECT_GREETINGS[resolvedDialect] ?? DIALECT_GREETINGS["gulf"]!;
  const accessToken = generateAccessToken(session.sessionId, "user");
  const refreshToken = generateRefreshToken(session.sessionId);

  return res.status(201).json({
    accessToken,
    refreshToken,
    sessionId: session.sessionId,
    greeting,
  });
});

router.post("/auth/admin", (req, res) => {
  const { secret } = req.body as { secret?: string };
  const adminSecret = process.env["ADMIN_SECRET"];

  if (!adminSecret || !secret || secret !== adminSecret) {
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }

  const accessToken = generateAdminToken();
  return res.json({ accessToken });
});

router.post("/auth/refresh", (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }

  try {
    const payload = verifyJwt(refreshToken);
    const accessToken = generateAccessToken(payload.sub, "user");
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
});

export default router;
