export type Gender = "male" | "female";

export function getG(maleText: string, femaleText: string, gender: Gender): string {
  return gender === "male" ? maleText : femaleText;
}

// ── Mood option model ─────────────────────────────────────────────────────────
// `en` is a stable, language-agnostic key used for analytics and gamification.
// `word` is the display text in the user's gender-correct Arabic form.
// `intensity` is a 1–5 scale where higher = more positive emotional state.
//
// Single source of truth: BOTH the home screen quick-pick and the dedicated
// mood check-in screen import this list. Do NOT duplicate this elsewhere.
export interface MoodOption {
  word: string;
  en: string;
  emoji: string;
  color: string;
  intensity: number;
}

export const MOOD_OPTIONS: Record<Gender, MoodOption[]> = {
  female: [
    { word: "مطمئنة", en: "reassured", emoji: "🤍", color: "#7CC9A8", intensity: 5 },
    { word: "سعيدة",  en: "happy",     emoji: "😊", color: "#F4B942", intensity: 5 },
    { word: "مرتاحة", en: "calm",      emoji: "😌", color: "#74C69D", intensity: 5 },
    { word: "هادئة",  en: "peaceful",  emoji: "🙂", color: "#85d7ad", intensity: 4 },
    { word: "قلقة",   en: "anxious",   emoji: "😬", color: "#A89B7E", intensity: 2 },
    { word: "مضغوطة", en: "stressed",  emoji: "😟", color: "#6B7FD7", intensity: 2 },
    { word: "متعبة",  en: "tired",     emoji: "😔", color: "#8E7BB5", intensity: 2 },
    { word: "مرهقة",  en: "exhausted", emoji: "😮‍💨", color: "#7B6FA0", intensity: 1 },
    { word: "حزينة",  en: "sad",       emoji: "😢", color: "#5D6D8A", intensity: 1 },
  ],
  male: [
    { word: "مطمئن", en: "reassured", emoji: "🤍", color: "#7CC9A8", intensity: 5 },
    { word: "سعيد",  en: "happy",     emoji: "😊", color: "#F4B942", intensity: 5 },
    { word: "مرتاح", en: "calm",      emoji: "😌", color: "#74C69D", intensity: 5 },
    { word: "هادئ",  en: "peaceful",  emoji: "🙂", color: "#85d7ad", intensity: 4 },
    { word: "قلق",   en: "anxious",   emoji: "😬", color: "#A89B7E", intensity: 2 },
    { word: "مضغوط", en: "stressed",  emoji: "😟", color: "#6B7FD7", intensity: 2 },
    { word: "متعب",  en: "tired",     emoji: "😔", color: "#8E7BB5", intensity: 2 },
    { word: "مرهق",  en: "exhausted", emoji: "😮‍💨", color: "#7B6FA0", intensity: 1 },
    { word: "حزين",  en: "sad",       emoji: "😢", color: "#5D6D8A", intensity: 1 },
  ],
};

// ── Quick-pick subset for the home strip ──────────────────────────────────────
// The home screen shows moods in a single horizontal row that doesn't scale to
// 9 chips on small phones. We expose a curated 5-chip subset that spans the
// emotional range (positive → neutral → tired → anxious → sad). Tapping any of
// these still navigates to the full mood screen, where the user sees all 9.
const HOME_QUICK_PICK_KEYS = ["happy", "calm", "tired", "anxious", "sad"] as const;

export function getHomeQuickPickMoods(gender: Gender): MoodOption[] {
  const all = MOOD_OPTIONS[gender];
  return HOME_QUICK_PICK_KEYS.map((k) => all.find((m) => m.en === k)).filter(
    (m): m is MoodOption => Boolean(m),
  );
}

export function getMoodQuestion(gender: Gender): string {
  return gender === "female" ? "كيف تشعرين اليوم؟" : "كيف تشعر اليوم؟";
}

/** Find a mood option by its language-agnostic `en` key. */
export function findMoodByEn(gender: Gender, en: string): MoodOption | undefined {
  return MOOD_OPTIONS[gender].find((m) => m.en === en);
}

/** Find a mood option by its display word (what the user tapped). */
export function findMoodByWord(gender: Gender, word: string): MoodOption | undefined {
  return MOOD_OPTIONS[gender].find((m) => m.word === word);
}

export function getContextualSuggestions(
  gender: Gender,
  moodEn: string | null,
  hour: number,
): string[] {
  const isFemale = gender === "female";
  const suffix = isFemale ? "ين" : "";
  const suffixK = isFemale ? "ي" : "";

  if (moodEn === "stressed" || moodEn === "anxious") {
    return [
      `خل${suffixK}نا نتنفس سوا شوي`,
      `واضح${isFemale ? "ة" : ""} متضغط${isFemale ? "ة" : ""}… تبغ${suffixK} نرتب يومك؟`,
      "أخبرني بما يضغط عليك",
    ];
  }
  if (moodEn === "sad") {
    return [
      `أنا هنا أسمع${suffix}`,
      "تكلم معي بحرية",
      `ما يهم أنك مش لوحد${isFemale ? "ة" : ""}`,
    ];
  }
  if (moodEn === "tired" || moodEn === "exhausted") {
    return [
      `جسمك يحتاج راحة — خل${suffixK}نا نهدأ`,
      "أرني كيف أساعدك",
      "جرّب تمرين الاسترخاء",
    ];
  }
  if (moodEn === "happy" || moodEn === "reassured") {
    return [
      `حلو نسمع${suffix} عنه`,
      `شارك${suffix}ني السبب`,
      `خل${suffixK}نا نحتفظ بهذي اللحظة`,
    ];
  }
  if (hour >= 5 && hour < 12) {
    return [
      `كيف بدأ صباحك؟`,
      `نضع نيّة لهذا اليوم سوا`,
      "شيء واحد تتطلع له اليوم؟",
    ];
  }
  if (hour >= 20 || hour < 5) {
    return [
      `كيف كان يومك؟`,
      "ما الشيء الذي شعرت بامتنان له اليوم؟",
      "جرّب تأمل قبل النوم",
    ];
  }
  return [
    `أحتاج أهدأ شوي`,
    `شارك${suffix}ني ما تشعر${suffix} به`,
    "تفريغ عاطفي",
  ];
}
