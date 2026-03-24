import { Router } from "express";
import { db } from "@workspace/db";
import { dailyRecipesTable } from "@workspace/db/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";

const router = Router();

const VALID_CATEGORIES = ["تحفيز", "هدوء", "تأمل", "نمو ذاتي"] as const;

function validateRecipeBody(body: any, isPartial: boolean) {
  const errors: string[] = [];
  if (!isPartial) {
    if (!body.title || typeof body.title !== "string") errors.push("title required");
    if (!body.summary || typeof body.summary !== "string") errors.push("summary required");
    if (!body.content || typeof body.content !== "string") errors.push("content required");
  }
  if (body.category && !VALID_CATEGORIES.includes(body.category)) errors.push("invalid category");
  if (errors.length) return { success: false as const, errors };

  const data: Record<string, any> = {};
  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.summary !== undefined) data.summary = String(body.summary).trim();
  if (body.content !== undefined) data.content = String(body.content).trim();
  if ("imageUrl" in body) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null;
  if (body.category !== undefined) data.category = String(body.category);
  if ("scheduledFor" in body) data.scheduledFor = body.scheduledFor ? String(body.scheduledFor) : null;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (!isPartial) {
    data.category = data.category ?? "هدوء";
    data.isActive = data.isActive ?? true;
  }

  return { success: true as const, data };
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

router.get("/daily-recipe", async (_req, res) => {
  try {
    const today = getTodayDate();
    const rows = await db
      .select()
      .from(dailyRecipesTable)
      .where(
        and(
          eq(dailyRecipesTable.isActive, true),
          or(
            eq(dailyRecipesTable.scheduledFor, today),
            isNull(dailyRecipesTable.scheduledFor),
          ),
        ),
      )
      .orderBy(desc(dailyRecipesTable.createdAt))
      .limit(10);

    const todayRecipe = rows.find(r => r.scheduledFor === today) ?? rows[0] ?? null;

    if (!todayRecipe) {
      return res.json({
        recipe: {
          id: "default",
          title: "الومضة اليومية",
          summary: "لا تحمل الهمّ، فكل عسر يتبعه يسر.",
          content: "هذه الحكمة العربية القديمة تذكّرنا بأن كل صعوبة مؤقتة. خذ نفساً عميقاً، وتذكّر أنك أقوى مما تتخيل.",
          imageUrl: null,
          category: "هدوء",
          scheduledFor: null,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });
    }

    return res.json({
      recipe: {
        ...todayRecipe,
        createdAt: todayRecipe.createdAt.toISOString(),
        updatedAt: todayRecipe.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "server_error" });
  }
});

router.get("/admin/daily-recipes", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(dailyRecipesTable)
      .orderBy(desc(dailyRecipesTable.createdAt));
    return res.json({
      recipes: rows.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch {
    return res.status(500).json({ error: "server_error" });
  }
});

router.post("/admin/daily-recipes", async (req, res) => {
  const parsed = validateRecipeBody(req.body, false);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", details: parsed.errors });
  }
  try {
    const [created] = await db
      .insert(dailyRecipesTable)
      .values({
        title: parsed.data.title,
        summary: parsed.data.summary,
        content: parsed.data.content,
        imageUrl: parsed.data.imageUrl ?? null,
        category: parsed.data.category,
        scheduledFor: parsed.data.scheduledFor ?? null,
        isActive: parsed.data.isActive,
      })
      .returning();
    return res.status(201).json({
      recipe: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    });
  } catch {
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/admin/daily-recipes/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = validateRecipeBody(req.body, true);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", details: parsed.errors });
  }
  try {
    const [updated] = await db
      .update(dailyRecipesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(dailyRecipesTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "not_found" });
    return res.json({
      recipe: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch {
    return res.status(500).json({ error: "server_error" });
  }
});

router.delete("/admin/daily-recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.delete(dailyRecipesTable).where(eq(dailyRecipesTable.id, id));
    return res.json({ deleted: true });
  } catch {
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
