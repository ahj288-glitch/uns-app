import { useState, useCallback, useMemo } from "react";
import {
  useGetMoodHistory,
  useGetInsights,
} from "@workspace/api-client-react";
import type {
  MoodEntry,
  InsightsResponse,
} from "@workspace/api-client-react";
import { useSession } from "@/contexts/SessionContext";

export type FingerprintKey =
  | "aware_calm"
  | "rising_peace"
  | "inner_light"
  | "deep_balance"
  | "growing_calm"
  | "warm_presence"
  | "renewed_clarity";

export interface FingerprintResult {
  key: FingerprintKey;
  labelAr: string;
  quote: string;
  gradientColors: [string, string];
  accentColor: string;
  hasData: boolean;
  regenerate: () => void;
}

const FINGERPRINT_META: Record<
  FingerprintKey,
  { labelAr: string; gradientColors: [string, string]; accentColor: string }
> = {
  aware_calm: {
    labelAr: "هادئ بوعي",
    gradientColors: ["#1B4332", "#041710"],
    accentColor: "#74C69D",
  },
  rising_peace: {
    labelAr: "طمأنينة متصاعدة",
    gradientColors: ["#1a3040", "#041215"],
    accentColor: "#85c8e8",
  },
  inner_light: {
    labelAr: "نور داخلي",
    gradientColors: ["#2a2a1a", "#0d0d05"],
    accentColor: "#e8d070",
  },
  deep_balance: {
    labelAr: "اتزان عميق",
    gradientColors: ["#1a2e26", "#041710"],
    accentColor: "#a5d0b9",
  },
  growing_calm: {
    labelAr: "سكينة نامية",
    gradientColors: ["#1c2e1a", "#080f07"],
    accentColor: "#88c979",
  },
  warm_presence: {
    labelAr: "حضور دافئ",
    gradientColors: ["#2e1e18", "#0f0806"],
    accentColor: "#e8a87c",
  },
  renewed_clarity: {
    labelAr: "صفاء متجدد",
    gradientColors: ["#1a1a2e", "#080812"],
    accentColor: "#9d88e8",
  },
};

const QUOTE_BANK: Record<FingerprintKey, string[]> = {
  aware_calm: [
    "في الهدوء تُولد أعمق القرارات، وفي السكون تتجلّى الحقائق.",
    "الطمأنينة ليست غياب العاصفة، بل وجودك بهدوء في قلبها.",
    "بعض الأيام، الصمت هو أجمل شيء تقوله لنفسك.",
    "الراحة ليست كسلاً — إنها حكمة الجسد وسداد الروح.",
    "عدت إلى نفسك اليوم. هذا وحده يكفي.",
  ],
  rising_peace: [
    "كل صباح تستيقظ فيه هو وعد جديد تقطعه لنفسك.",
    "السلام ليس وجهةً — هو الطريق نفسه الذي تخطوه.",
    "أنت تتقدم، حتى حين لا ترى ذلك بعينيك.",
    "كل خطوة نحو السكون هي انتصار لا يراه أحد سواك.",
    "الصعود لا يكون دائماً نحو الأعلى — أحياناً هو نحو الداخل.",
  ],
  inner_light: [
    "ثمة نور بداخلك لم تتعلّم بعد كيف توقده — لكنّه موجود.",
    "الأمل ليس وهماً، هو البذرة التي تختار أن تسقيها.",
    "حين تؤمن بغدٍ أجمل، يبدأ اليوم بالتغيّر من حولك.",
    "نورك ليس للعرض — إنه للدفء، لك أولاً.",
    "في أعمق لحظات الظلمة، من يحتفظ بشرارة أمل يملك كل شيء.",
  ],
  deep_balance: [
    "الاتزان العميق لا يعني غياب الحركة — بل أن تتحرك بجذور.",
    "ما أنجزتَه اليوم هو حجر أساس لمن ستكون غداً.",
    "الانتظام عبادة بحد ذاته — أنت تمارسها.",
    "السير الثابت يتجاوز العدّاء المتقطّع دوماً.",
    "حين تلتزم بنفسك يوماً بيوم، تبني قلعة من الداخل.",
  ],
  growing_calm: [
    "البدايات صغيرة دائماً — لكن ذلك لا يجعلها أقل أهمية.",
    "كل يوم تسجّل فيه حالتك هو يوم تتعرف فيه أكثر على نفسك.",
    "أنت في بداية رحلة جميلة، والبداية دائماً تستحق الاحتفال.",
    "بصمتك العاطفية تتشكّل الآن — كن صبوراً معها.",
    "السكينة ليست هدفاً نصل إليه مرةً واحدة، بل بذرة نرويها كل يوم.",
  ],
  warm_presence: [
    "أنت تستحق اللطف الذي تمنحه للآخرين — ابدأ بنفسك.",
    "ليس عليك أن تكون مكتملاً لتكون كافياً.",
    "الحضور الدافئ هدية نادرة — وأنت تحملها.",
    "حين تعتني بنفسك، تمنح من حولك نسخة أكمل منك.",
    "أنت في أمان. أنت بخير. أنت تكفي تماماً.",
  ],
  renewed_clarity: [
    "بعد كل عاصفة، ثمة صفاء لا تجده في أي مكان آخر.",
    "الانطلاق من جديد ليس فشلاً — هو شجاعة من نوع مختلف.",
    "الصفاء لا يأتي دفعةً واحدة، يأتي قطرةً قطرة.",
    "ما مررتَ به لم يكسرك — صنع منك عيناً ترى ما لا يراه الآخرون.",
    "اليوم فرصة لترى نفسك بعيون أكثر رحمة.",
  ],
};

const CALM_WORDS = new Set([
  "calm", "serene", "peaceful", "relaxed", "tranquil",
  "هادئ", "مطمئن", "مرتاح", "سكينة", "هدوء",
]);
const HOPEFUL_WORDS = new Set([
  "hopeful", "optimistic", "happy", "joyful",
  "متفائل", "سعيد", "أمل", "فرحان",
]);
const ANXIOUS_WORDS = new Set([
  "anxious", "worried", "stressed", "nervous",
  "قلق", "متوتر", "خائف",
]);

function getDominantMood(entries: MoodEntry[]): string {
  if (!entries.length) return "";
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const key = (e.moodWord || "").toLowerCase().trim();
    if (key) counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function getXpDelta(entries: MoodEntry[]): number {
  if (entries.length < 2) return 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  const recent7 = sorted.filter(
    e => new Date(e.createdAt).getTime() >= sevenDaysAgo
  );
  const prior7 = sorted.filter(e => {
    const t = new Date(e.createdAt).getTime();
    return t >= fourteenDaysAgo && t < sevenDaysAgo;
  });

  const recentAvg = recent7.length
    ? recent7.reduce((s, e) => s + e.intensity, 0) / recent7.length
    : 0;
  const priorAvg = prior7.length
    ? prior7.reduce((s, e) => s + e.intensity, 0) / prior7.length
    : 0;

  if (!recent7.length && !prior7.length) return 0;
  if (!prior7.length) return recentAvg > 0 ? 1 : 0;
  return recentAvg - priorAvg;
}

function hadPreviousAnxious(entries: MoodEntry[]): boolean {
  if (entries.length < 2) return false;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const half = Math.ceil(sorted.length / 2);
  return sorted.slice(0, half).some(e =>
    ANXIOUS_WORDS.has((e.moodWord || "").toLowerCase())
  );
}

type ExtendedInsights = InsightsResponse & {
  gamification?: { totalLoopsCompleted?: number; totalCheckins?: number };
};

function deriveFingerprint(
  entries: MoodEntry[],
  insights: InsightsResponse | undefined,
  breathingSessions: number,
  totalCheckins: number,
): FingerprintKey {
  if (!entries.length && !insights) return "growing_calm";

  const dominantMood = getDominantMood(entries);
  const streak = insights?.streakDays ?? 0;
  const xpDelta = getXpDelta(entries);
  const consistencyScore = Math.min(streak / 14, 1);
  const isCalmDominant = CALM_WORDS.has(dominantMood);
  const isHopefulDominant = HOPEFUL_WORDS.has(dominantMood);
  const wasAnxious = hadPreviousAnxious(entries);
  const isNewUser = totalCheckins < 5;
  const engagementHigh = totalCheckins >= 10 || breathingSessions >= 5;

  if (streak > 7 && isCalmDominant) return "deep_balance";
  if (isCalmDominant && breathingSessions > 3) return "aware_calm";
  if (isCalmDominant && consistencyScore > 0.3) return "aware_calm";
  if (streak > 4 && xpDelta >= 0) return "rising_peace";
  if (isHopefulDominant && engagementHigh) return "inner_light";
  if (isNewUser) return "growing_calm";
  if (wasAnxious && xpDelta > 0) return "renewed_clarity";
  if (streak > 2) return "warm_presence";
  if (entries.length > 0) return "growing_calm";

  return "growing_calm";
}

export function useEmotionalFingerprint(): FingerprintResult {
  const { sessionId } = useSession();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const skip = !sessionId;

  const { data: moodHistory } = useGetMoodHistory(
    { sessionId: sessionId ?? "", days: 14 },
    { query: { enabled: !skip } as never }
  );

  const { data: insights } = useGetInsights(
    { sessionId: sessionId ?? "" },
    { query: { enabled: !skip } as never }
  );

  const key = useMemo<FingerprintKey>(() => {
    const entries = moodHistory?.entries ?? [];
    const extInsights = insights as ExtendedInsights | undefined;
    const breathingSessions = extInsights?.gamification?.totalLoopsCompleted ?? 0;
    const totalCheckins = extInsights?.gamification?.totalCheckins ?? entries.length;
    return deriveFingerprint(entries, insights, breathingSessions, totalCheckins);
  }, [moodHistory, insights]);

  const regenerate = useCallback(() => {
    setQuoteIndex(i => i + 1);
  }, []);

  const meta = FINGERPRINT_META[key];
  const quotes = QUOTE_BANK[key];
  const quote = quotes[quoteIndex % quotes.length];

  const extInsightsForHasData = insights as ExtendedInsights | undefined;
  const hasData =
    (moodHistory?.entries?.length ?? 0) > 0 ||
    (insights?.streakDays ?? 0) > 0 ||
    (extInsightsForHasData?.gamification?.totalLoopsCompleted ?? 0) > 0;

  return {
    key,
    labelAr: meta.labelAr,
    quote,
    gradientColors: meta.gradientColors,
    accentColor: meta.accentColor,
    hasData,
    regenerate,
  };
}
