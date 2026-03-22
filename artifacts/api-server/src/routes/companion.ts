import { Router } from "express";
import { db } from "@workspace/db";
import { companionSessionsTable, messagesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  CreateCompanionSessionBody,
  SendCompanionMessageBody,
  GetCompanionHistoryQueryParams,
} from "@workspace/api-zod";

const router = Router();

const DIALECT_GREETINGS: Record<string, string> = {
  gulf: "هلا وغلا! أنا رفيقك اليوم. كيف حالك؟",
  levant: "مرحبا كتير! أنا رفيقك اليوم. كيفك؟",
  egyptian: "أهلاً! أنا رفيقك النهارده. إيه أخبارك؟",
  maghrebi: "مرحبا بيك! أنا رفيقك اليوم. كيداير؟",
  msa: "مرحباً بك! أنا رفيقك اليوم. كيف حالك؟",
};

const CRISIS_RESOURCES = [
  { country: "KSA", name: "إتصال", number: "920033360" },
  { country: "UAE", name: "800HOPE", number: "800-4673" },
  { country: "Egypt", name: "خط دعم الصحة النفسية", number: "08008880700" },
];

const CRISIS_KEYWORDS = ["اقتل نفسي", "انهيت", "مابغا أعيش", "أموت", "عايز أموت", "نفسي أموت", "يأس", "ميت"];

function detectCrisis(text: string): boolean {
  return CRISIS_KEYWORDS.some(kw => text.includes(kw));
}

function buildCompanionResponse(userMessage: string, dialect: string): { response: string; emotion: string } {
  const lowerMsg = userMessage.toLowerCase();
  let emotion = "neutral";
  let response = "";

  if (lowerMsg.includes("حزين") || lowerMsg.includes("حزينة") || lowerMsg.includes("تعبان") || lowerMsg.includes("زعلان")) {
    emotion = "sadness";
    const responses: Record<string, string> = {
      gulf: "أحس فيك. الحزن ما يدل على ضعف، يدل إنك إنسان بمشاعر حقيقية. خبرني أكثر، أنا هنا.",
      levant: "بفهمك كتير. الحزن هو دليل على إنك بتشعر بعمق. حكيلي أكثر، أنا هون.",
      egyptian: "حاسس بيك. الحزن ده مش ضعف، ده دليل على إنك بتحس. قولي أكتر، أنا جنبك.",
      msa: "أشعر بما تمر به. الحزن دليل على العمق لا الضعف. حدثني أكثر.",
      maghrebi: "كنعرف بيك. الحزن ما هو ضعف. حكيلي أكثر.",
    };
    response = responses[dialect] ?? responses.msa;
  } else if (lowerMsg.includes("قلق") || lowerMsg.includes("خايف") || lowerMsg.includes("توتر")) {
    emotion = "anxiety";
    const responses: Record<string, string> = {
      gulf: "القلق شيء صعب، أعرف. خلنا نتنفس مع بعض ونشوف ايش اللي يقلقك.",
      levant: "القلق صعب كتير. خلينا نحكي عن اللي بيقلقك.",
      egyptian: "القلق صعب جداً. خلينا نتكلم عن اللي بيقلقك.",
      msa: "القلق أمر صعب. دعنا نتحدث عما يقلقك.",
      maghrebi: "القلق صعب. نتكلمو على اللي كيقلقك.",
    };
    response = responses[dialect] ?? responses.msa;
  } else if (lowerMsg.includes("فرح") || lowerMsg.includes("سعيد") || lowerMsg.includes("زين") || lowerMsg.includes("تمام")) {
    emotion = "joy";
    const responses: Record<string, string> = {
      gulf: "والله يسعدني أسمع هذا! خبرني، ايش السبب؟",
      levant: "والله يسعدني كتير! شو السبب؟",
      egyptian: "ده بيسعدني أوي! قولي، إيه السبب؟",
      msa: "يسعدني ذلك! أخبرني عن السبب.",
      maghrebi: "هذا يسعدني بزاف! شنو السبب؟",
    };
    response = responses[dialect] ?? responses.msa;
  } else {
    const responses: Record<string, string> = {
      gulf: "شكراً لمشاركتي هذا. أنا هنا أسمعك. كيف تحس الحين؟",
      levant: "شكراً لمشاركتي. أنا هون أسمعك. كيف عم تحس هلق؟",
      egyptian: "شكراً إنك شاركتني ده. أنا هنا أسمعك. إيه اللي بتحسه دلوقتي؟",
      msa: "شكراً لمشاركتي. أنا هنا أستمع. كيف تشعر الآن؟",
      maghrebi: "شكراً على المشاركة. أنا هنا نسمعك. كيف داير دابا؟",
    };
    response = responses[dialect] ?? responses.msa;
  }

  return { response, emotion };
}

router.post("/companion/session", async (req, res) => {
  const parsed = CreateCompanionSessionBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const dialect = parsed.data.dialect ?? "gulf";
  const greeting = DIALECT_GREETINGS[dialect] ?? DIALECT_GREETINGS.gulf;

  const [session] = await db.insert(companionSessionsTable).values({
    dialect,
    emotionalProfile: parsed.data.emotionalProfile ?? null,
  }).returning();

  return res.status(201).json({
    sessionId: session.sessionId,
    dialect: session.dialect,
    greeting,
    createdAt: session.createdAt.toISOString(),
  });
});

router.post("/companion/chat", async (req, res) => {
  const parsed = SendCompanionMessageBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId, message } = parsed.data;

  const sessions = await db.select().from(companionSessionsTable).where(eq(companionSessionsTable.sessionId, sessionId)).limit(1);
  const session = sessions[0];
  if (!session) {
    return res.status(404).json({ error: "not_found", message: "Session not found." });
  }

  const crisisDetected = detectCrisis(message);
  const { response, emotion } = buildCompanionResponse(message, session.dialect);

  const finalResponse = crisisDetected
    ? (response + "\n\nأنا قلقان عليك. أرجوك تواصل مع أحد متخصص إذا كنت بحاجة للمساعدة الفورية.")
    : response;

  await db.insert(messagesTable).values({ sessionId, role: "user", content: message, emotion: null });
  const [aiMsg] = await db.insert(messagesTable).values({ sessionId, role: "companion", content: finalResponse, emotion }).returning();

  return res.json({
    response: finalResponse,
    emotion,
    crisisDetected,
    crisisResources: crisisDetected ? CRISIS_RESOURCES : [],
    messageId: aiMsg.id,
  });
});

router.get("/companion/history", async (req, res) => {
  const parsed = GetCompanionHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId, limit } = parsed.data;

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit ?? 20);

  const formatted = messages.reverse().map(m => ({
    id: m.id,
    role: m.role as "user" | "companion",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    emotion: m.emotion ?? undefined,
  }));

  return res.json({ messages: formatted, total: formatted.length });
});

export default router;
