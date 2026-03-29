import { Router } from "express";
import { db } from "@workspace/db";
import { companionSessionsTable, messagesTable } from "@workspace/db/schema";
import { eq, desc, and, gte, count } from "drizzle-orm";
import {
  CreateCompanionSessionBody,
  SendCompanionMessageBody,
  GetCompanionHistoryQueryParams,
} from "@workspace/api-zod";
import { DIALECT_GREETINGS, CRISIS_RESOURCES } from "../lib/constants.js";
import { aiConfig } from "../lib/aiConfig.js";
import OpenAI from "openai";
import pino from "pino";

const router = Router();
const logger = pino({ name: "companion" });

// ── OpenAI client — lazy-initialised only when API key is present ─────────────
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: key });
  return openaiClient;
}

// ── Crisis detection ──────────────────────────────────────────────────────────
const CRISIS_KEYWORDS = [
  // Gulf / KSA
  "اقتل نفسي", "مابغا أعيش", "ما أبغى أعيش", "خلاص تعبت", "ما لي فايدة",
  // Levantine
  "بدي موت", "مش قادر كمان", "بدي خلص حياتي", "ما في فايدة",
  // Egyptian
  "عايز أموت", "نفسي أموت", "مش عارف أكمل", "تعبت من الحياة",
  // Maghrebi
  "بغيت نموت", "ما بقيت نقدر", "حياتي خلصت",
  // MSA / universal
  "أريد أن أموت", "لا أريد أن أعيش", "الانتحار", "أفكار الانتحار",
  "إنهاء حياتي", "الموت أفضل", "يأس", "ميت", "انهيت", "لا أحد يهتم",
];

function detectCrisis(text: string): boolean {
  return CRISIS_KEYWORDS.some(kw => text.includes(kw));
}

// ── System prompt builder ─────────────────────────────────────────────────────
function buildSystemPrompt(dialect: string): string {
  const dialectNames: Record<string, string> = {
    gulf: "Gulf Arabic (Saudi/Emirati)",
    levant: "Levantine Arabic (Lebanese/Syrian/Palestinian/Jordanian)",
    egyptian: "Egyptian Arabic",
    maghrebi: "Maghrebi Arabic (Moroccan/Algerian/Tunisian)",
    msa: "Modern Standard Arabic (فصحى)",
  };

  const toneMap: Record<string, string> = {
    "semi-formal": "warm and approachable, not overly formal",
    "formal": "respectful and composed",
    "casual": "friendly and conversational",
  };

  const dialectLabel = dialectNames[dialect] ?? dialectNames.gulf;
  const tone = toneMap[aiConfig.toneIntensity] ?? toneMap["semi-formal"];

  let prompt = `You are أُنْس (Uns), an Arabic-first emotional companion app designed for Arab users.

Your role:
- Provide warm, empathetic emotional support in ${dialectLabel}
- Respond ONLY in Arabic, matching the user's dialect: ${dialectLabel}
- Tone: ${tone}, emotionally intelligent, non-clinical
- Never give medical or psychiatric diagnoses
- Never prescribe medication
- Always validate feelings before offering perspective
- Keep responses concise (2-4 sentences) — this is a mobile chat interface
- If you sense distress, gently explore it without pressure`;

  if (aiConfig.spiritualLayerEnabled) {
    prompt += `\n- You may include gentle spiritual references (أذكار، دعاء، آيات) when contextually appropriate, but never force it`;
  }

  if (aiConfig.systemPromptSuffix?.trim()) {
    prompt += `\n\n${aiConfig.systemPromptSuffix.trim()}`;
  }

  prompt += `\n\nImportant: If the user expresses suicidal thoughts or a crisis, respond with empathy and strongly encourage them to contact a crisis helpline immediately.`;

  return prompt;
}

// ── Rule-based fallback (used when OPENAI_API_KEY is not set) ─────────────────
function buildFallbackResponse(userMessage: string, dialect: string): { response: string; emotion: string } {
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

// ── LLM call via OpenAI ───────────────────────────────────────────────────────
async function callLLM(
  userMessage: string,
  dialect: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<{ response: string; emotion: string }> {
  const client = getOpenAI();
  if (!client) {
    return buildFallbackResponse(userMessage, dialect);
  }

  try {
    const systemPrompt = buildSystemPrompt(dialect);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // last 5 exchanges = 10 messages
      { role: "user", content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: aiConfig.modelTier || "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content?.trim() ?? "";

    // Detect emotion from the response content for gamification
    let emotion = "neutral";
    if (response.includes("حزن") || userMessage.includes("حزين")) emotion = "sadness";
    else if (response.includes("قلق") || userMessage.includes("قلق")) emotion = "anxiety";
    else if (response.includes("فرح") || response.includes("سعيد")) emotion = "joy";
    else if (response.includes("اطمئنان") || response.includes("هدوء")) emotion = "calm";

    return { response, emotion };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message }, "[companion] LLM call failed — falling back to rule-based");
    return buildFallbackResponse(userMessage, dialect);
  }
}

// ── Daily message limit ───────────────────────────────────────────────────────
const DAILY_MESSAGE_LIMIT = 30;

async function getDailyMessageCount(sessionId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await db
    .select({ c: count() })
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.sessionId, sessionId),
        eq(messagesTable.role, "user"),
        gte(messagesTable.createdAt, todayStart)
      )
    );

  return Number(result[0]?.c ?? 0);
}

// ── Routes ────────────────────────────────────────────────────────────────────

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

  // ── Ownership check — caller must own this session ─────────────────────────
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

  // ── Server-side daily message limit ────────────────────────────────────────
  const todayCount = await getDailyMessageCount(sessionId);
  if (todayCount >= DAILY_MESSAGE_LIMIT) {
    return res.status(429).json({
      error: "DAILY_LIMIT_REACHED",
      code: "DAILY_LIMIT_REACHED",
      limit: DAILY_MESSAGE_LIMIT,
      used: todayCount,
      message: "لقد وصلت إلى الحد اليومي من الرسائل. عد غداً لمواصلة الحديث.",
    });
  }

  const sessions = await db
    .select()
    .from(companionSessionsTable)
    .where(eq(companionSessionsTable.sessionId, sessionId))
    .limit(1);
  const session = sessions[0];
  if (!session) {
    return res.status(404).json({ error: "not_found", message: "Session not found." });
  }

  // Load recent conversation history for LLM context
  const recentMessages = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(10);

  const history = recentMessages.reverse().map(m => ({
    role: m.role === "companion" ? "assistant" as const : "user" as const,
    content: m.content,
  }));

  const crisisDetected = detectCrisis(message);
  const { response, emotion } = await callLLM(message, session.dialect, history);

  const finalResponse = crisisDetected
    ? `${response}\n\nأنا قلقان عليك. أرجوك تواصل مع أحد متخصص إذا كنت بحاجة للمساعدة الفورية.`
    : response;

  await db.insert(messagesTable).values({ sessionId, role: "user", content: message, emotion: null });
  const [aiMsg] = await db.insert(messagesTable).values({
    sessionId,
    role: "companion",
    content: finalResponse,
    emotion,
  }).returning();

  // Update session last active timestamp
  await db
    .update(companionSessionsTable)
    .set({ lastActiveAt: new Date() })
    .where(eq(companionSessionsTable.sessionId, sessionId));

  return res.json({
    response: finalResponse,
    emotion,
    crisisDetected,
    crisisResources: crisisDetected ? CRISIS_RESOURCES : [],
    messageId: aiMsg.id,
    dailyUsed: todayCount + 1,
    dailyLimit: DAILY_MESSAGE_LIMIT,
    llmUsed: !!getOpenAI(),
  });
});

router.get("/companion/history", async (req, res) => {
  const parsed = GetCompanionHistoryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "validation_error", message: parsed.error.message });
  }

  const { sessionId, limit } = parsed.data;

  // ── Ownership check — caller must own this session ─────────────────────────
  if (sessionId !== req.auth?.sessionId) {
    return res.status(403).json({ error: "Forbidden", code: "SESSION_MISMATCH" });
  }

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
