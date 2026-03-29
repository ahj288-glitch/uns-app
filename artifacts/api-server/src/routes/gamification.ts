import { Router } from "express";
import { db } from "@workspace/db";
import { userProgressTable, microWinsTable, dailyLoopsTable } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

const LEVELS = [
  { key: "awareness", labelAr: "الوعي", labelEn: "Awareness", minXp: 0, maxXp: 300, color: "#6B7FD7" },
  { key: "balance", labelAr: "التوازن", labelEn: "Balance", minXp: 300, maxXp: 700, color: "#C9A84C" },
  { key: "tranquility", labelAr: "الطمأنينة", labelEn: "Tranquility", minXp: 700, maxXp: 1200, color: "#10B981" },
];

const MICRO_EXPERIENCES = [
  {
    type: "breathing",
    titleAr: "تمرين التنفس الواعي",
    titleEn: "Mindful Breathing",
    descAr: "٤ دقائق لإعادة ضبط جهازك العصبي",
    durationMin: 4,
    xpReward: 25,
    icon: "wind",
  },
  {
    type: "gratitude",
    titleAr: "لحظة امتنان",
    titleEn: "Gratitude Moment",
    descAr: "اكتب ثلاثة أشياء تجعل قلبك يطمئن اليوم",
    durationMin: 3,
    xpReward: 20,
    icon: "heart",
  },
  {
    type: "reflection",
    titleAr: "تأمل يومي",
    titleEn: "Daily Reflection",
    descAr: "سؤال واحد عميق لفهم نفسك أكثر",
    durationMin: 5,
    xpReward: 30,
    icon: "feather",
  },
  {
    type: "body_scan",
    titleAr: "مسح الجسد",
    titleEn: "Body Scan",
    descAr: "انتبه لجسدك من الرأس للقدم بلطف",
    durationMin: 5,
    xpReward: 25,
    icon: "activity",
  },
  {
    type: "affirmation",
    titleAr: "تأكيدات إيجابية",
    titleEn: "Positive Affirmations",
    descAr: "كلمات تُذكّرك بقوتك وقيمتك",
    durationMin: 2,
    xpReward: 15,
    icon: "sun",
  },
];

const WIN_TYPES = {
  checkin: { labelAr: "سجّلت مشاعرك اليوم ✨", points: 10 },
  loop_complete: { labelAr: "أكملت دورتك اليومية 🌟", points: 30 },
  streak_3: { labelAr: "٣ أيام متواصلة 🔥", points: 50 },
  streak_7: { labelAr: "أسبوع من الرعاية الذاتية 💎", points: 100 },
  streak_30: { labelAr: "شهر من التحول 🌙", points: 300 },
  first_session: { labelAr: "أول محادثة مع أُنس 💬", points: 20 },
  program_join: { labelAr: "انضممت لبرنامج جديد 📚", points: 25 },
  community_share: { labelAr: "شاركت في مساحة آمنة 🤝", points: 20 },
};

function getLevelFromXp(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

async function getOrCreateProgress(sessionId: string) {
  let [progress] = await db
    .select()
    .from(userProgressTable)
    .where(eq(userProgressTable.sessionId, sessionId))
    .limit(1);

  if (!progress) {
    [progress] = await db.insert(userProgressTable).values({ sessionId }).returning();
  }
  return progress;
}

router.get("/progress", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  const progress = await getOrCreateProgress(sessionId);
  const currentLevel = getLevelFromXp(progress.xp);
  const nextLevel = LEVELS.find(l => l.minXp > progress.xp);

  const recentWins = await db
    .select()
    .from(microWinsTable)
    .where(eq(microWinsTable.sessionId, sessionId))
    .orderBy(desc(microWinsTable.earnedAt))
    .limit(10);

  const today = getTodayDate();
  const [todayLoop] = await db
    .select()
    .from(dailyLoopsTable)
    .where(and(
      eq(dailyLoopsTable.sessionId, sessionId),
      eq(dailyLoopsTable.loopDate, today)
    ))
    .limit(1);

  return res.json({
    sessionId,
    xp: progress.xp,
    streakDays: progress.streakDays,
    longestStreak: progress.longestStreak,
    totalCheckins: progress.totalCheckins,
    totalLoopsCompleted: progress.totalLoopsCompleted,
    currentLevel: {
      ...currentLevel,
      progressPercent: nextLevel
        ? Math.round(((progress.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100)
        : 100,
    },
    nextLevel: nextLevel ?? null,
    milestones: progress.milestones as string[],
    recentWins: recentWins.map(w => ({
      id: w.id,
      winType: w.winType,
      labelAr: w.winLabelAr,
      points: w.points,
      earnedAt: w.earnedAt.toISOString(),
    })),
    todayLoop: todayLoop
      ? {
          id: todayLoop.id,
          state: todayLoop.state,
          microExperience: todayLoop.microExperienceType
            ? MICRO_EXPERIENCES.find(e => e.type === todayLoop.microExperienceType)
            : null,
        }
      : null,
  });
});

router.post("/progress/win", async (req, res) => {
  const { sessionId, winType } = req.body as { sessionId: string; winType: string };
  if (!sessionId || !winType) return res.status(400).json({ error: "sessionId and winType required" });
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  const winDef = WIN_TYPES[winType as keyof typeof WIN_TYPES];
  if (!winDef) return res.status(400).json({ error: "unknown win type" });

  const [win] = await db.insert(microWinsTable).values({
    sessionId,
    winType,
    winLabelAr: winDef.labelAr,
    points: winDef.points,
  }).returning();

  const progress = await getOrCreateProgress(sessionId);
  const newXp = progress.xp + winDef.points;
  const newLevel = getLevelFromXp(newXp);

  await db
    .update(userProgressTable)
    .set({
      xp: newXp,
      updatedAt: new Date(),
    })
    .where(eq(userProgressTable.sessionId, sessionId));

  return res.status(201).json({
    win: {
      id: win.id,
      labelAr: win.winLabelAr,
      points: win.points,
    },
    newXp,
    newLevel: newLevel.key,
    levelUp: newLevel.key !== getLevelFromXp(progress.xp).key,
  });
});

router.get("/loop/today", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  const today = getTodayDate();
  let [loop] = await db
    .select()
    .from(dailyLoopsTable)
    .where(and(
      eq(dailyLoopsTable.sessionId, sessionId),
      eq(dailyLoopsTable.loopDate, today)
    ))
    .limit(1);

  if (!loop) {
    const randomExp = MICRO_EXPERIENCES[Math.floor(Math.random() * MICRO_EXPERIENCES.length)];
    [loop] = await db.insert(dailyLoopsTable).values({
      sessionId,
      loopDate: today,
      state: "pending",
      microExperienceType: randomExp.type,
      microExperienceTitleAr: randomExp.titleAr,
    }).returning();
  }

  const microExp = MICRO_EXPERIENCES.find(e => e.type === loop.microExperienceType) ?? MICRO_EXPERIENCES[0];

  return res.json({
    id: loop.id,
    state: loop.state,
    loopDate: loop.loopDate,
    microExperience: {
      ...microExp,
    },
    completedAt: loop.completedAt?.toISOString() ?? null,
  });
});

router.post("/loop/complete", async (req, res) => {
  const { sessionId, loopId } = req.body as { sessionId: string; loopId: string };
  if (!sessionId || !loopId) return res.status(400).json({ error: "sessionId and loopId required" });
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  await db
    .update(dailyLoopsTable)
    .set({ state: "completed", completedAt: new Date() })
    .where(eq(dailyLoopsTable.id, loopId));

  const progress = await getOrCreateProgress(sessionId);
  const today = getTodayDate();
  const newTotalLoops = progress.totalLoopsCompleted + 1;
  const newXp = progress.xp + 30;

  await db
    .update(userProgressTable)
    .set({
      totalLoopsCompleted: newTotalLoops,
      xp: newXp,
      updatedAt: new Date(),
    })
    .where(eq(userProgressTable.sessionId, sessionId));

  await db.insert(microWinsTable).values({
    sessionId,
    winType: "loop_complete",
    winLabelAr: WIN_TYPES.loop_complete.labelAr,
    points: WIN_TYPES.loop_complete.points,
  });

  const DAILY_NUDGES_AR = [
    "رائع! أكملت دورتك اليومية. كل يوم تهتم بنفسك هو إنجاز حقيقي. 🌟",
    "أحسنت! هذه اللحظات الصغيرة هي التي تصنع التغيير الكبير. 💫",
    "أنت تستحق هذا الاهتمام بنفسك. استمر. ✨",
    "يوم آخر من العناية بروحك. هذا هو التحول الحقيقي. 🌙",
  ];
  const nudgeMessage = DAILY_NUDGES_AR[newTotalLoops % DAILY_NUDGES_AR.length];

  return res.json({
    completed: true,
    xpEarned: 30,
    newXp,
    nudgeMessage,
    newLevel: getLevelFromXp(newXp).key,
  });
});

router.post("/checkin-complete", async (req, res) => {
  const { sessionId, moodWord, streak } = req.body as { sessionId: string; moodWord: string; streak?: number };
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  const progress = await getOrCreateProgress(sessionId);
  const today = getTodayDate();
  const lastDate = progress.lastCheckinDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = 1;
  if (lastDate === yesterday) {
    newStreak = progress.streakDays + 1;
  } else if (lastDate === today) {
    newStreak = progress.streakDays;
  }

  const newXp = progress.xp + 10;
  const newTotalCheckins = progress.totalCheckins + 1;
  const newLongest = Math.max(progress.longestStreak, newStreak);

  await db
    .update(userProgressTable)
    .set({
      xp: newXp,
      streakDays: newStreak,
      longestStreak: newLongest,
      lastCheckinDate: today,
      totalCheckins: newTotalCheckins,
      updatedAt: new Date(),
    })
    .where(eq(userProgressTable.sessionId, sessionId));

  await db.insert(microWinsTable).values({
    sessionId,
    winType: "checkin",
    winLabelAr: WIN_TYPES.checkin.labelAr,
    points: 10,
  });

  const newWins: { type: string; points: number }[] = [];

  if (newTotalCheckins === 1) {
    newWins.push({ type: "first_checkin", points: 10 });
  }

  if (newStreak === 3) {
    await db.insert(microWinsTable).values({
      sessionId,
      winType: "streak_3",
      winLabelAr: WIN_TYPES.streak_3.labelAr,
      points: WIN_TYPES.streak_3.points,
    });
    newWins.push({ type: "streak_3", points: WIN_TYPES.streak_3.points });
  } else if (newStreak === 7) {
    await db.insert(microWinsTable).values({
      sessionId,
      winType: "streak_7",
      winLabelAr: WIN_TYPES.streak_7.labelAr,
      points: WIN_TYPES.streak_7.points,
    });
    newWins.push({ type: "streak_7", points: WIN_TYPES.streak_7.points });
  } else if (newStreak === 14) {
    await db.insert(microWinsTable).values({
      sessionId,
      winType: "streak_14",
      winLabelAr: "أسبوعان من الاستمرارية 🌟",
      points: 150,
    });
    newWins.push({ type: "streak_14", points: 150 });
  } else if (newStreak === 30) {
    await db.insert(microWinsTable).values({
      sessionId,
      winType: "streak_30",
      winLabelAr: WIN_TYPES.streak_30.labelAr,
      points: WIN_TYPES.streak_30.points,
    });
    newWins.push({ type: "streak_30", points: WIN_TYPES.streak_30.points });
  }

  const RECOMMENDATIONS: Record<string, string> = {
    anxious: "بناءً على شعورك، أقترح تمرين التنفس العميق — ٤ دقائق تُعيد ضبط جهازك العصبي.",
    sad: "الحزن يستحق مساحة. أقترح لحظة تأمل هادئة اليوم.",
    tired: "جسدك يخبرك بشيء. جرب مسح الجسد الآن لتستمع إليه.",
    happy: "فرحتك طاقة. وثّقها بلحظة امتنان حتى تظل معك.",
    calm: "الهدوء نعمة. عزّزه بتأمل يومي قصير.",
    grateful: "الامتنان يفتح القلب. شاركنا ما تشعر بالامتنان له.",
    hopeful: "التفاؤل أمل. اصنع من هذا الأمل خطوة واحدة للأمام.",
    angry: "الغضب طاقة محبوسة. تنفس معي: شهيق ٤ ثوانٍ، زفير ٦ ثوانٍ.",
    default: "خصّص ٥ دقائق لنفسك اليوم — أنت تستحق.",
  };

  const recommendation = RECOMMENDATIONS[moodWord ?? "default"] ?? RECOMMENDATIONS.default;

  const oldLevel = getLevelFromXp(progress.xp);
  const newLevel = getLevelFromXp(newXp);
  const levelUp = newLevel.key !== oldLevel.key ? { newLevel: newLevel.key, labelAr: newLevel.labelAr } : null;

  return res.json({
    streakDays: newStreak,
    longestStreak: newLongest,
    xpEarned: 10,
    newXp,
    newWins,
    recommendation,
    levelUp,
    isStreakMilestone: [3, 7, 14, 30].includes(newStreak),
  });
});

router.get("/stats", requireAdmin, async (_req, res) => {
  const allProgress = await db.select().from(userProgressTable);
  const LEVELS = [
    { key: "awareness", labelAr: "الوعي", minXp: 0, maxXp: 300, color: "#6B7FD7" },
    { key: "balance", labelAr: "التوازن", minXp: 300, maxXp: 700, color: "#C9A84C" },
    { key: "tranquility", labelAr: "الطمأنينة", minXp: 700, maxXp: 1200, color: "#10B981" },
  ];

  const totalXp = allProgress.reduce((s, p) => s + p.xp, 0);
  const avgStreak = allProgress.length > 0
    ? Math.round(allProgress.reduce((s, p) => s + p.streakDays, 0) / allProgress.length)
    : 0;

  const levelDistribution = LEVELS.map(level => ({
    ...level,
    count: allProgress.filter(p => {
      const nextLevel = LEVELS.find(l => l.minXp > p.xp);
      const curLevel = LEVELS.slice().reverse().find(l => p.xp >= l.minXp) ?? LEVELS[0];
      return curLevel.key === level.key;
    }).length,
  }));

  const topStreaks = [7, 14, 30].map(s => ({
    streak: s,
    count: allProgress.filter(p => p.longestStreak >= s).length,
  }));

  return res.json({
    totalUsers: allProgress.length,
    totalXpAwarded: totalXp,
    avgStreak,
    levelDistribution,
    topStreaks,
  });
});

export default router;
