import { Router } from "express";
import { db } from "@workspace/db";
import { moodsTable } from "@workspace/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { RecordMoodCheckinBody, GetMoodHistoryQueryParams } from "@workspace/api-zod";
import pino from "pino";

const router = Router();
const logger = pino({ name: "moods" });

router.post("/moods/checkin", async (req, res) => {
  const parsed = RecordMoodCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId, moodWord, moodWordArabic, intensity, notes } = parsed.data;

  // ── Ownership check — caller must own this session ─────────────────────────
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  try {
    const [entry] = await db.insert(moodsTable).values({
      sessionId,
      moodWord,
      moodWordArabic: moodWordArabic ?? null,
      intensity,
      notes: notes ?? null,
    }).returning();

    return res.status(201).json({
      id: entry.id,
      sessionId: entry.sessionId,
      moodWord: entry.moodWord,
      moodWordArabic: entry.moodWordArabic ?? undefined,
      intensity: entry.intensity,
      notes: entry.notes ?? undefined,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err, sessionId }, "[moods/checkin] DB error");
    return res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }
});

router.get("/moods/history", async (req, res) => {
  const parsed = GetMoodHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId, days } = parsed.data;

  // ── Ownership check — caller must own this session ─────────────────────────
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  const daysBack = days ?? 30;
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  try {
    const entries = await db
      .select()
      .from(moodsTable)
      .where(
        and(
          eq(moodsTable.sessionId, sessionId),
          gte(moodsTable.createdAt, since),   // FIX: `since` was computed but never used
        )
      )
      .orderBy(desc(moodsTable.createdAt))
      .limit(100);

    const formatted = entries.map(e => ({
      id: e.id,
      sessionId: e.sessionId,
      moodWord: e.moodWord,
      moodWordArabic: e.moodWordArabic ?? undefined,
      intensity: e.intensity,
      notes: e.notes ?? undefined,
      createdAt: e.createdAt.toISOString(),
    }));

    const moodCounts: Record<string, number> = {};
    let totalIntensity = 0;
    for (const e of formatted) {
      moodCounts[e.moodWord] = (moodCounts[e.moodWord] ?? 0) + 1;
      totalIntensity += e.intensity;
    }
    const dominantMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "neutral";
    const averageIntensity = formatted.length > 0 ? Math.round((totalIntensity / formatted.length) * 10) / 10 : 0;

    // ── Consecutive-day streak ─────────────────────────────────────────────────
    // Count backwards from today; stop at the first day with no check-in. This is
    // the real streak, not just a capped entry count (old bug: Math.min(len, days)).
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < daysBack; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const hasEntry = formatted.some((e) => {
        const d = new Date(e.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === day.getTime();
      });
      if (hasEntry) streak++;
      else break;
    }

    return res.json({
      entries: formatted,
      summary: {
        dominantMood,
        averageIntensity,
        streakDays: streak,
      },
    });
  } catch (err) {
    logger.error({ err, sessionId }, "[moods/history] DB error");
    return res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }
});

export default router;
