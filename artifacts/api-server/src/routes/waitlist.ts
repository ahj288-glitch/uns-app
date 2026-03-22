import { Router } from "express";
import { db } from "@workspace/db";
import { waitlistTable } from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { JoinWaitlistBody } from "@workspace/api-zod";

const router = Router();

router.post("/waitlist", async (req, res) => {
  const parsed = JoinWaitlistBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { email, name, dialect, source } = parsed.data;

  const existing = await db.select().from(waitlistTable).where(eq(waitlistTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(409).json({ error: "already_on_waitlist", message: "This email is already on the waitlist." });
  }

  const countResult = await db.select({ count: count() }).from(waitlistTable);
  const position = (countResult[0]?.count ?? 0) + 1;

  const [entry] = await db.insert(waitlistTable).values({
    email,
    name: name ?? null,
    dialect: dialect ?? null,
    source: source ?? null,
    position,
  }).returning();

  return res.status(201).json({
    id: String(entry.id),
    email: entry.email,
    name: entry.name ?? undefined,
    dialect: entry.dialect ?? undefined,
    position: entry.position,
    createdAt: entry.createdAt.toISOString(),
  });
});

router.get("/waitlist/count", async (_req, res) => {
  const result = await db.select({ count: count() }).from(waitlistTable);
  const total = result[0]?.count ?? 0;
  return res.json({
    count: total,
    message: total > 0 ? `${total.toLocaleString()} people are waiting` : "Be the first to join!",
  });
});

export default router;
