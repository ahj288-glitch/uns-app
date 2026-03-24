export type Gender = "male" | "female";

export function getG(maleText: string, femaleText: string, gender: Gender): string {
  return gender === "male" ? maleText : femaleText;
}

export const MOOD_OPTIONS = {
  female: [
    { word: "مرتاحة", en: "calm", emoji: "😌", color: "#74C69D", intensity: 5 },
    { word: "هادئة",  en: "peaceful", emoji: "🙂", color: "#85d7ad", intensity: 4 },
    { word: "مضغوطة", en: "stressed", emoji: "😟", color: "#6B7FD7", intensity: 2 },
    { word: "متعبة",  en: "tired", emoji: "😔", color: "#8E7BB5", intensity: 2 },
    { word: "حزينة",  en: "sad", emoji: "😢", color: "#5D6D8A", intensity: 1 },
  ],
  male: [
    { word: "مرتاح", en: "calm", emoji: "😌", color: "#74C69D", intensity: 5 },
    { word: "هادئ",  en: "peaceful", emoji: "🙂", color: "#85d7ad", intensity: 4 },
    { word: "مضغوط", en: "stressed", emoji: "😟", color: "#6B7FD7", intensity: 2 },
    { word: "متعب",  en: "tired", emoji: "😔", color: "#8E7BB5", intensity: 2 },
    { word: "حزين",  en: "sad", emoji: "😢", color: "#5D6D8A", intensity: 1 },
  ],
};

export function getMoodQuestion(gender: Gender): string {
  return gender === "female" ? "كيف تشعرين اليوم؟" : "كيف تشعر اليوم؟";
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
  if (moodEn === "tired") {
    return [
      `جسمك يحتاج راحة — خل${suffixK}نا نهدأ`,
      "أرني كيف أساعدك",
      "جرّب تمرين الاسترخاء",
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
