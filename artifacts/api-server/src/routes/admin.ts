import { Router } from "express";
import { db } from "@workspace/db";
import {
  waitlistTable,
  programsTable,
  usersTable,
  companionSessionsTable,
  moodsTable,
} from "@workspace/db/schema";
import { eq, count, gte, desc } from "drizzle-orm";
import { aiConfig, AiConfig } from "../lib/aiConfig.js";
import {
  CreateAdminProgramBody,
  UpdateAdminProgramBody,
  UpdateAdminProgramParams,
  DeleteAdminProgramParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/admin/overview", async (_req, res) => {
  const [waitlistResult, totalUsersResult, totalSessionsResult, totalMoodCheckinsResult] =
    await Promise.all([
      db.select({ c: count() }).from(waitlistTable),
      db.select({ c: count() }).from(usersTable).where(eq(usersTable.verified, true)),
      db.select({ c: count() }).from(companionSessionsTable),
      db.select({ c: count() }).from(moodsTable),
    ]);

  const waitlistCount = Number(waitlistResult[0]?.c ?? 0);
  const totalUsers = Number(totalUsersResult[0]?.c ?? 0);
  const totalSessions = Number(totalSessionsResult[0]?.c ?? 0);
  const totalMoodCheckins = Number(totalMoodCheckinsResult[0]?.c ?? 0);

  // Top dialect by session count
  const dialectRows = await db
    .select({ dialect: companionSessionsTable.dialect, c: count() })
    .from(companionSessionsTable)
    .groupBy(companionSessionsTable.dialect)
    .orderBy(desc(count()))
    .limit(1);
  const topDialect = dialectRows[0]?.dialect ?? "gulf";

  // 14-day growth: real user registrations and session creations
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [recentUsersRows, recentSessionsRows] = await Promise.all([
    db.select({ createdAt: usersTable.createdAt }).from(usersTable)
      .where(gte(usersTable.createdAt, fourteenDaysAgo)),
    db.select({ createdAt: companionSessionsTable.createdAt }).from(companionSessionsTable)
      .where(gte(companionSessionsTable.createdAt, fourteenDaysAgo)),
  ]);

  const usersByDay = new Map<string, number>();
  const sessionsByDay = new Map<string, number>();
  for (const u of recentUsersRows) {
    const d = u.createdAt.toISOString().split("T")[0]!;
    usersByDay.set(d, (usersByDay.get(d) ?? 0) + 1);
  }
  for (const s of recentSessionsRows) {
    const d = s.createdAt.toISOString().split("T")[0]!;
    sessionsByDay.set(d, (sessionsByDay.get(d) ?? 0) + 1);
  }

  const recentGrowth = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split("T")[0]!;
    return {
      date: dateStr,
      users: usersByDay.get(dateStr) ?? 0,
      sessions: sessionsByDay.get(dateStr) ?? 0,
    };
  });

  // Real mood distribution from DB
  const moodRows = await db
    .select({ mood: moodsTable.moodWord, moodArabic: moodsTable.moodWordArabic, c: count() })
    .from(moodsTable)
    .groupBy(moodsTable.moodWord, moodsTable.moodWordArabic)
    .orderBy(desc(count()));

  const totalMoods = moodRows.reduce((s, r) => s + Number(r.c), 0);
  const moodDistribution = moodRows.map(r => ({
    mood: r.mood,
    moodArabic: r.moodArabic ?? r.mood,
    count: Number(r.c),
    percentage: totalMoods > 0 ? Math.round((Number(r.c) / totalMoods) * 1000) / 10 : 0,
  }));

  return res.json({
    totalUsers,
    waitlistCount,
    totalSessions,
    moodCheckins: totalMoodCheckins,
    topDialect,
    recentGrowth,
    moodDistribution,
    // Fields not yet computable without dedicated tables — honest nulls
    activeToday: null,
    premiumUsers: null,
    avgSessionLength: null,
    d7Retention: null,
    npsScore: null,
    crisisEventsThisWeek: null,
  });
});

router.get("/admin/programs", async (_req, res) => {
  const programs = await db.select().from(programsTable);
  return res.json({ programs: programs.map(formatProgram), total: programs.length });
});

router.post("/admin/programs", async (req, res) => {
  const parsed = CreateAdminProgramBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const [program] = await db.insert(programsTable).values({
    ...parsed.data,
    active: parsed.data.active ?? true,
  }).returning();

  return res.status(201).json(formatProgram(program));
});

router.put("/admin/programs/:id", async (req, res) => {
  const paramsParsed = UpdateAdminProgramParams.safeParse(req.params);
  const bodyParsed = UpdateAdminProgramBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    return res.status(400).json({ error: "validation_error", message: "Invalid request" });
  }

  const [updated] = await db
    .update(programsTable)
    .set(bodyParsed.data)
    .where(eq(programsTable.id, paramsParsed.data.id))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "not_found", message: "Program not found" });
  }

  return res.json(formatProgram(updated));
});

router.delete("/admin/programs/:id", async (req, res) => {
  const parsed = DeleteAdminProgramParams.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  await db.delete(programsTable).where(eq(programsTable.id, parsed.data.id));
  return res.status(204).send();
});

router.get("/admin/safety", async (_req, res) => {
  // No dedicated safety_events table exists yet.
  // Crisis detection happens at chat time but is not persisted as a separate event.
  // Return honest empty state rather than fabricated data.
  return res.json({
    eventsThisWeek: null,
    eventsThisMonth: null,
    crisisResponseRate: null,
    regionBreakdown: [],
    recentEvents: [],
    _note: "safety_events table not yet implemented — crisis detection is active at chat time but events are not separately logged",
  });
});

router.get("/admin/ai-config", (_req, res) => {
  return res.json(aiConfig);
});

router.put("/admin/ai-config", (req, res) => {
  const allowed: (keyof AiConfig)[] = [
    "defaultDialect", "toneIntensity", "spiritualLayerEnabled",
    "crisisThreshold", "familyModeEnabled", "modelTier", "systemPromptSuffix",
  ];
  for (const key of allowed) {
    if (key in req.body) {
      (aiConfig as unknown as Record<string, unknown>)[key] = req.body[key];
    }
  }
  return res.json(aiConfig);
});

function formatProgram(p: any) {
  return {
    id: p.id,
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    descriptionAr: p.descriptionAr ?? undefined,
    descriptionEn: p.descriptionEn ?? undefined,
    durationDays: p.durationDays,
    category: p.category,
    tier: p.tier,
    active: p.active,
    enrolledCount: p.enrolledCount,
    completionRate: p.completionRate,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

export default router;
