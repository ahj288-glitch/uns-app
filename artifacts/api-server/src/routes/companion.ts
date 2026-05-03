import { Router } from "express";
import Groq from "groq-sdk";
import { db } from "@workspace/db";
import { companionSessionsTable, messagesTable } from "@workspace/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import {
  CreateCompanionSessionBody,
  SendCompanionMessageBody,
  GetCompanionHistoryQueryParams,
} from "@workspace/api-zod";
import { DIALECT_GREETINGS, CRISIS_RESOURCES } from "../lib/constants.js";

const router = Router();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is required for the companion chat service.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = "llama-3.3-70b-versatile";
const HISTORY_TURNS = 10;

const CRISIS_KEYWORDS = [
  "اقتل نفسي", "انتحر", "أنتحر", "بنتحر", "هنتحر", "انهيت",
  "مابغا أعيش", "ما أبغى أعيش", "ما بدي أعيش", "مش عايز أعيش",
  "أموت", "عايز أموت", "عاوز أموت", "نفسي أموت", "بدي موت", "أبي أموت",
  "ميت", "خلاص تعبت من الحياة",
];

function detectCrisis(text: string): boolean {
  const t = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => t.includes(kw));
}

function detectEmotion(text: string): string {
  const t = text.toLowerCase();
  if (/(حزن|حزين|تعبان|زعلان|مكتئب|باكي|بكيت|دمع|اكتئاب|كآبة)/.test(t)) return "sadness";
  if (/(قلق|خايف|خوف|توتر|متوتر|رعب|مرعوب|مذعور)/.test(t)) return "anxiety";
  if (/(غضب|غاضب|عصبي|متضايق|زهقان|زهق|زعل)/.test(t)) return "anger";
  if (/(فرح|سعيد|زين|تمام|كويس|مبسوط|فرحان|مرتاح|راحة)/.test(t)) return "joy";
  if (/(وحيد|وحدة|محد معاي|لحالي|لوحدي|بمفردي)/.test(t)) return "loneliness";
  return "neutral";
}

const DIALECT_LABEL: Record<string, string> = {
  gulf: "اللهجة الخليجية (السعودية، الإمارات، الكويت، قطر، البحرين، عُمان)",
  levant: "اللهجة الشامية (سوريا، لبنان، فلسطين، الأردن)",
  egyptian: "اللهجة المصرية",
  msa: "العربية الفصحى المعاصرة، بأسلوب دافئ ومألوف",
  maghrebi: "اللهجة المغاربية (المغرب، الجزائر، تونس)",
};

function buildSystemPrompt(dialect: string): string {
  const label = DIALECT_LABEL[dialect] ?? DIALECT_LABEL.msa;
  return [
    "أنت «أُنْس» — رفيق عاطفي عربي. مهمتك أن تكون حاضرًا، وتسمع، وتفهم.",
    `تحدّث دائمًا بـ${label}.`,
    "",
    "أسلوبك:",
    "- ودود، هادئ، صادق، بدون تكلّف.",
    "- ردودك قصيرة (٢–٤ جمل عادةً).",
    "- اعكس مشاعر المستخدم بكلماتك أنت قبل أن تطرح أي سؤال.",
    "- اطرح في الغالب سؤالًا مفتوحًا واحدًا في النهاية، يدعو للحديث لا للحلّ.",
    "- لا تكرّر تحيات مكرّرة («مرحبًا»، «أهلًا») في كل رسالة.",
    "",
    "ممنوع تمامًا:",
    "- التشخيص الطبي أو النفسي.",
    "- وصف الأدوية أو العلاجات.",
    "- المواعظ الدينية أو الأحكام الأخلاقية غير المطلوبة.",
    "- الاستشهاد بآيات أو أحاديث ما لم يطلب المستخدم ذلك صراحةً.",
    "- إعطاء «حلول سريعة» قبل أن يشعر المستخدم بأنه مسموع.",
    "",
    "إن لاح أيّ تلميح للأذى الذاتي، اعترف بألم الشخص بلطف، وذكّره بلُطف أنه ليس وحده — دون وعظ. النظام نفسه سيضيف موارد الطوارئ تلقائيًا، فلا تفعل أنت.",
    "",
    "اكتب الرد فقط، بدون أقواس وصفية أو ملاحظات للمطوّر، وبدون توقيع.",
  ].join("\n");
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

  if (req.auth?.sessionId !== sessionId) {
    return res.status(403).json({ error: "forbidden", code: "SESSION_MISMATCH" });
  }

  const sessions = await db.select().from(companionSessionsTable).where(eq(companionSessionsTable.sessionId, sessionId)).limit(1);
  const session = sessions[0];
  if (!session) {
    return res.status(404).json({ error: "not_found", message: "Session not found." });
  }

  const crisisDetected = detectCrisis(message);
  const emotion = detectEmotion(message);

  const recent = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(HISTORY_TURNS);

  const history = recent.reverse().map(m => ({
    role: (m.role === "companion" ? "assistant" : "user") as "assistant" | "user",
    content: m.content,
  }));

  let aiText: string;
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.8,
      max_tokens: 280,
      messages: [
        { role: "system", content: buildSystemPrompt(session.dialect) },
        ...history,
        { role: "user", content: message },
      ],
    });
    aiText = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!aiText) {
      return res.status(502).json({ error: "ai_empty_response", message: "No response generated." });
    }
  } catch (err) {
    req.log?.error({ err }, "Groq completion failed");
    return res.status(502).json({ error: "ai_provider_error", message: "AI provider unavailable." });
  }

  const finalResponse = crisisDetected
    ? aiText + "\n\nأنا قلقان عليك. إذا تحتاج مساعدة فورية، تواصل مع خط الدعم النفسي في بلدك الآن."
    : aiText;

  await db.insert(messagesTable).values({ sessionId, role: "user", content: message, emotion });
  const [aiMsg] = await db.insert(messagesTable).values({ sessionId, role: "companion", content: finalResponse, emotion }).returning();

  await db.update(companionSessionsTable)
    .set({ lastActiveAt: new Date() })
    .where(eq(companionSessionsTable.sessionId, sessionId));

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

  if (req.auth?.sessionId !== sessionId) {
    return res.status(403).json({ error: "forbidden", code: "SESSION_MISMATCH" });
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(asc(messagesTable.createdAt))
    .limit(limit ?? 20);

  const formatted = messages.map(m => ({
    id: m.id,
    role: m.role as "user" | "companion",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    emotion: m.emotion ?? undefined,
  }));

  return res.json({ messages: formatted, total: formatted.length });
});

export default router;
