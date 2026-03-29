import { Router } from "express";
import { db } from "@workspace/db";
import { moodsTable } from "@workspace/db/schema";
import { eq, desc, gte } from "drizzle-orm";
import { RecordMoodCheckinBody, GetMoodHistoryQueryParams } from "@workspace/api-zod";

const router = Router();

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

  const entries = await db
    .select()
    .from(moodsTable)
    .where(eq(moodsTable.sessionId, sessionId))
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

  return res.json({
    entries: formatted,
    summary: {
      dominantMood,
      averageIntensity,
      streakDays: Math.min(formatted.length, daysBack),
    },
  });
});

export default router;
