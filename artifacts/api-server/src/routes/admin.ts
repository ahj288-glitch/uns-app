import { Router } from "express";
import { db } from "@workspace/db";
import { waitlistTable, programsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import {
  CreateAdminProgramBody,
  UpdateAdminProgramBody,
  UpdateAdminProgramParams,
  DeleteAdminProgramParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/admin/overview", async (_req, res) => {
  const waitlistResult = await db.select({ count: count() }).from(waitlistTable);
  const waitlistCount = waitlistResult[0]?.count ?? 0;

  const recentGrowth = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toISOString().split("T")[0],
      users: Math.floor(50 + i * 12 + Math.random() * 20),
      sessions: Math.floor(120 + i * 25 + Math.random() * 40),
    };
  });

  const moodDistribution = [
    { mood: "calm", moodArabic: "هادئ", count: 1240, percentage: 28.5 },
    { mood: "anxious", moodArabic: "قلق", count: 980, percentage: 22.5 },
    { mood: "happy", moodArabic: "سعيد", count: 860, percentage: 19.8 },
    { mood: "sad", moodArabic: "حزين", count: 640, percentage: 14.7 },
    { mood: "grateful", moodArabic: "ممتنّ", count: 520, percentage: 11.9 },
    { mood: "other", moodArabic: "أخرى", count: 110, percentage: 2.6 },
  ];

  return res.json({
    totalUsers: 2847 + waitlistCount,
    activeToday: 412,
    waitlistCount,
    premiumUsers: 284,
    avgSessionLength: 18.4,
    d7Retention: 0.68,
    npsScore: 72,
    moodCheckins: 4350,
    crisisEventsThisWeek: 3,
    topDialect: "gulf",
    recentGrowth,
    moodDistribution,
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
  return res.json({
    eventsThisWeek: 3,
    eventsThisMonth: 11,
    crisisResponseRate: 0.97,
    regionBreakdown: [
      { region: "KSA", count: 5 },
      { region: "UAE", count: 3 },
      { region: "Egypt", count: 2 },
      { region: "Other", count: 1 },
    ],
    recentEvents: [
      { id: "evt-001", type: "crisis_keyword_detected", severity: "high", region: "KSA", createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
      { id: "evt-002", type: "elevated_distress", severity: "medium", region: "UAE", resolvedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
      { id: "evt-003", type: "crisis_keyword_detected", severity: "high", region: "Egypt", resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), createdAt: new Date(Date.now() - 13 * 3600 * 1000).toISOString() },
    ],
  });
});

router.get("/admin/ai-config", async (_req, res) => {
  return res.json({
    defaultDialect: "gulf",
    toneIntensity: "semi-formal",
    spiritualLayerEnabled: true,
    crisisThreshold: "standard",
    familyModeEnabled: false,
    modelTier: "gpt-4o",
    systemPromptSuffix: "",
  });
});

router.put("/admin/ai-config", async (req, res) => {
  return res.json(req.body);
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
