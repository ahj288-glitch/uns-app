import { Router } from "express";
import { db } from "@workspace/db";
import { moodsTable, userProgressTable, microWinsTable } from "@workspace/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { GetInsightsQueryParams } from "@workspace/api-zod";
import pino from "pino";

const router = Router();
const logger = pino({ name: "insights" });

const MOOD_ARABIC: Record<string, string> = {
  happy: "سعيد",
  sad: "حزين",
  anxious: "قلق",
  calm: "هادئ",
  angry: "غاضب",
  grateful: "ممتنّ",
  tired: "متعب",
  hopeful: "متفائل",
  stressed: "مضغوط",
  peaceful: "مسترخي",
};

const MOOD_COLORS: Record<string, string> = {
  happy: "#74C69D",
  calm: "#85d7ad",
  peaceful: "#85d7ad",
  grateful: "#9B59B6",
  hopeful: "#74C69D",
  tired: "#4a7a5e",
  anxious: "#6B7FD7",
  stressed: "#6B7FD7",
  sad: "#5D6D8A",
  angry: "#ffb4ab",
};

const MOOD_INTENSITY: Record<string, number> = {
  happy: 0.9, grateful: 0.95, hopeful: 0.85, calm: 0.8, peaceful: 0.8,
  tired: 0.4, anxious: 0.35, stressed: 0.3, sad: 0.25, angry: 0.2,
};

const LEVELS = [
  { key: "awareness",   labelAr: "الوعي",       minXp: 0,   maxXp: 300,  color: "#6B7FD7" },
  { key: "balance",     labelAr: "التوازن",      minXp: 300, maxXp: 700,  color: "#C9A84C" },
  { key: "tranquility", labelAr: "الطمأنينة",    minXp: 700, maxXp: 1200, color: "#10B981" },
];

function getLevelFromXp(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

router.get("/insights", async (req, res) => {
  const parsed = GetInsightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId } = parsed.data;

  // ── Ownership check — caller must own this session ─────────────────────────
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  let entries: (typeof moodsTable.$inferSelect)[];
  let progressRows: (typeof userProgressTable.$inferSelect)[];
  let recentWins: (typeof microWinsTable.$inferSelect)[];

  try {
    [entries, progressRows, recentWins] = await Promise.all([
      db
        .select()
        .from(moodsTable)
        .where(and(
          eq(moodsTable.sessionId, sessionId as string),
          gte(moodsTable.createdAt, sevenDaysAgo),
        ))
        .orderBy(desc(moodsTable.createdAt))
        .limit(50),
      db
        .select()
        .from(userProgressTable)
        .where(eq(userProgressTable.sessionId, sessionId))
        .limit(1),
      db
        .select()
        .from(microWinsTable)
        .where(eq(microWinsTable.sessionId, sessionId))
        .orderBy(desc(microWinsTable.earnedAt))
        .limit(5),
    ]);
  } catch (err) {
    logger.error({ err, sessionId }, "[insights] DB error");
    return res.status(500).json({ error: "Internal server error", code: "INTERNAL_ERROR" });
  }

  const progRow = progressRows[0];

  const moodCounts: Record<string, number> = {};
  for (const e of entries) {
    moodCounts[e.moodWord] = (moodCounts[e.moodWord] ?? 0) + 1;
  }

  const topMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([mood, count]) => ({
      mood,
      moodArabic: MOOD_ARABIC[mood] ?? mood,
      count,
      color: MOOD_COLORS[mood] ?? "#74C69D",
    }));

  const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const weeklyDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = i === 6 ? "اليوم" : DAY_NAMES[d.getDay()];
    const dayEntries = entries.filter(e => e.createdAt.toISOString().startsWith(dateStr));
    const topEntry = dayEntries[0];
    const value = topEntry ? (MOOD_INTENSITY[topEntry.moodWord] ?? 0.5) : 0;
    return {
      day: dayName,
      dateLabel: dateStr,
      value,
      mood: topEntry?.moodWord ?? "",
      moodAr: topEntry ? (MOOD_ARABIC[topEntry.moodWord] ?? topEntry.moodWord) : "—",
      hasEntry: !!topEntry,
    };
  });

  const filledDays = weeklyDays.filter(d => d.hasEntry).length;
  let weeklyPattern = "لم تسجّل أي مشاعر هذا الأسبوع بعد.";
  if (filledDays >= 6) weeklyPattern = "أسبوع استثنائي! سجّلت مشاعرك كل يوم تقريباً.";
  else if (filledDays >= 4) weeklyPattern = "اتساق جيد هذا الأسبوع. الاستمرارية هي سر التحول.";
  else if (filledDays >= 2) weeklyPattern = "بداية جيدة. كل يوم تسجّل فيه مشاعرك هو خطوة للأمام.";

  const streakDays = progRow?.streakDays ?? 0;
  const xp = progRow?.xp ?? 0;
  const totalCheckins = progRow?.totalCheckins ?? entries.length;
  const level = getLevelFromXp(xp);
  const nextLevel = LEVELS.find(l => l.minXp > xp) ?? LEVELS[LEVELS.length - 1];
  const xpProgress = level.key !== "tranquility"
    ? (xp - level.minXp) / (level.maxXp - level.minXp)
    : 1;

  const message = streakDays >= 7
    ? "أسبوع كامل من الاهتمام بنفسك — هذا تحول حقيقي. 💚"
    : streakDays >= 3
    ? "٣ أيام متتالية! أنت تبني عادة صحية جميلة. 🌿"
    : totalCheckins >= 1
    ? "أقدر شجاعتك في مشاركة مشاعرك. استمر."
    : "سجّل مشاعرك اليوم وابدأ رحلتك.";

  return res.json({
    weeklyPattern,
    topMoods,
    message,
    streakDays,
    weeklyDays,
    gamification: {
      xp,
      level: { ...level, xpProgress: Math.min(xpProgress, 1) },
      nextLevel,
      totalCheckins,
      longestStreak: progRow?.longestStreak ?? 0,
      totalLoopsCompleted: progRow?.totalLoopsCompleted ?? 0,
    },
    recentWins: recentWins.map(w => ({
      id: w.id,
      winType: w.winType,
      labelAr: w.winLabelAr,
      points: w.points,
      earnedAt: w.earnedAt.toISOString(),
    })),
  });
});

export default router;
