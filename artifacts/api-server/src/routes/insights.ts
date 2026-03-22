import { Router } from "express";
import { db } from "@workspace/db";
import { moodsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { GetInsightsQueryParams } from "@workspace/api-zod";

const router = Router();

const MOOD_ARABIC: Record<string, string> = {
  happy: "سعيد",
  sad: "حزين",
  anxious: "قلق",
  calm: "هادئ",
  angry: "غاضب",
  grateful: "ممتنّ",
  tired: "متعب",
  hopeful: "متفائل",
};

router.get("/insights", async (req, res) => {
  const parsed = GetInsightsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId } = parsed.data;

  const entries = await db
    .select()
    .from(moodsTable)
    .where(eq(moodsTable.sessionId, sessionId))
    .orderBy(desc(moodsTable.createdAt))
    .limit(30);

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
    }));

  const streakDays = entries.length;
  const dominantMood = topMoods[0]?.mood ?? "neutral";

  const weeklyPatterns = [
    "مشاعرك هذا الأسبوع كانت متوازنة نسبياً.",
    "لاحظت تحسناً تدريجياً في مزاجك هذا الأسبوع.",
    "يبدو أن بداية الأسبوع كانت أصعب من نهايته.",
    "أظهرت ثباتاً عاطفياً ملحوظاً هذا الأسبوع.",
  ];
  const weeklyPattern = weeklyPatterns[entries.length % weeklyPatterns.length];

  const messages = [
    "أنت تقوم بعمل رائع في تتبع مشاعرك.",
    "الوعي الذاتي هو أول خطوة نحو التوازن.",
    "أقدر شجاعتك في مشاركة مشاعرك.",
    "استمر في هذا الجهد الجميل.",
  ];
  const message = messages[entries.length % messages.length];

  return res.json({
    weeklyPattern,
    topMoods,
    message,
    streakDays,
  });
});

export default router;
