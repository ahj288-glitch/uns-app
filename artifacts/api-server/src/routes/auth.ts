import { Router } from "express";
import { db } from "@workspace/db";
import { companionSessionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  generateAccessToken,
  generateAdminToken,
  generateRefreshToken,
  verifyJwt,
} from "../lib/jwt.js";

const router = Router();

const DIALECT_GREETINGS: Record<string, string> = {
  gulf: "هلا وغلا! أنا رفيقك اليوم. كيف حالك؟",
  levant: "مرحبا كتير! أنا رفيقك اليوم. كيفك؟",
  egyptian: "أهلاً! أنا رفيقك النهارده. إيه أخبارك؟",
  maghrebi: "مرحبا بيك! أنا رفيقك اليوم. كيداير؟",
  msa: "مرحباً بك! أنا رفيقك اليوم. كيف حالك؟",
};

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
