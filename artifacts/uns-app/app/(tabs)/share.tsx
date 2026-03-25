import React, { useState, useRef, useCallback } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors, { useTokens } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/layout";

// ─── Tone Library ──────────────────────────────────────────────────────────
const QUOTE_BANK: Record<string, string[]> = {
  calm: [
    "في الهدوء تُولد أعمق القرارات.",
    "الطمأنينة ليست غياب العاصفة، بل السكينة وسطها.",
    "بعض الأيام، الصمت هو أجمل شيء تقوله لنفسك.",
    "الراحة ليست كسلاً — إنها حكمة الجسد.",
    "عدت إلى نفسك اليوم. هذا يكفي.",
  ],
  deep: [
    "ما لا يُقال يكتب نفسه على الروح.",
    "في كل موجة خوف، بذرة فهم لم تنبت بعد.",
    "الألم الذي تشعر به اليوم هو القوة التي ستحملها غداً.",
    "لا أحد يرى ما تحمله — لكن وزنه حقيقي تماماً.",
    "النضج هو أن تحمل الثقيل بهدوء.",
  ],
  reflective: [
    "أحياناً العودة إلى الداخل هي أطول رحلة.",
    "تأمّل ما مررت به — ليس كل جرح يحتاج طبيباً.",
    "من أنت اليوم؟ هذا السؤال يستحق دقيقة.",
    "بعض اللحظات لا تُعاش مرتين — احضر فيها.",
    "الوعي الذاتي شجاعة — ليس ضعفاً.",
  ],
  warm: [
    "أنت تستحق اللطف الذي تمنحه للآخرين.",
    "ليس عليك أن تكون مكتملاً لتكون كافياً.",
    "إذا كنت تقرأ هذا، فأنت لا تزال هنا — وهذا أمر عظيم.",
    "كيف تعتني بنفسك اليوم؟ هذا يهمني.",
    "أنت في أمان. أنت بخير. أنت تكفي.",
  ],
  mysterious: [
    "ثمة شيء بداخلك يعرف الطريق.",
    "الأسئلة التي تبقى بلا إجابة تصنع الشخصية.",
    "ليس كل شيء يحتاج إلى تفسير — بعضها يحتاج إلى شعور.",
    "الهدوء الداخلي لغة تتعلمها في الظلام.",
    "أحياناً الخسارة هي الدرس الذي لا تتعلمه في أي مكان آخر.",
  ],
};

// ─── Aura Colors by Emotional State ───────────────────────────────────────
const AURA_STATES = [
  { key: "calm", label: "هادئ", labelEn: "Calm", color: "#74C69D", bg: ["#1B4332", "#041710"] as [string, string] },
  { key: "reflective", label: "تأملي", labelEn: "Reflective", color: "#a5d0b9", bg: ["#10231c", "#041710"] as [string, string] },
  { key: "hopeful", label: "متفائل", labelEn: "Hopeful", color: "#85d7ad", bg: ["#1a2e26", "#041710"] as [string, string] },
  { key: "tired", label: "متعب", labelEn: "Tired", color: "#4a7a5e", bg: ["#0d1f18", "#041710"] as [string, string] },
  { key: "anxious", label: "قلق", labelEn: "Anxious", color: "#ffb4ab", bg: ["#2a1a18", "#041710"] as [string, string] },
];

const CARD_TYPES = [
  { key: "aura", label: "أورا", icon: "circle" as const },
  { key: "insight", label: "حكمة", icon: "feather" as const },
  { key: "streak", label: "سلسلة", icon: "zap" as const },
  { key: "summary", label: "ملخص", icon: "bar-chart-2" as const },
  { key: "night", label: "ليلي", icon: "moon" as const },
];

const TONES = [
  { key: "calm", label: "هادئ" },
  { key: "deep", label: "عميق" },
  { key: "reflective", label: "تأملي" },
  { key: "warm", label: "دافئ" },
  { key: "mysterious", label: "غامض" },
];

const PRIVACY = [
  { key: "public", label: "عام", icon: "globe" as const },
  { key: "semi", label: "محدود", icon: "users" as const },
  { key: "private", label: "خاص", icon: "lock" as const },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function AuraCard({ aura, quote }: { aura: typeof AURA_STATES[0]; quote: string }) {
  const T = useTokens();
  const cardStyles = makeCardStyles(T);
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 2600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <LinearGradient colors={aura.bg} style={cardStyles.card}>
      <Text style={cardStyles.brand}>أُنْس</Text>
      <Text style={cardStyles.brandSub}>لحظة من أُنْس</Text>
      <View style={cardStyles.orbWrap}>
        <Animated.View style={[cardStyles.orbGlow, { backgroundColor: aura.color, transform: [{ scale: pulse }] }]} />
        <View style={[cardStyles.orbCore, { borderColor: aura.color + "50" }]}>
          <Text style={[cardStyles.orbEmoji, { color: aura.color }]}>{aura.label}</Text>
        </View>
      </View>
      <Text style={[cardStyles.quote, { color: aura.color }]}>{quote}</Text>
      <View style={cardStyles.cardFooter}>
        <Text style={cardStyles.footerCue}>اكتشف بصمتك العاطفية مع أُنْس</Text>
      </View>
    </LinearGradient>
  );
}

function InsightCard({ aura, quote }: { aura: typeof AURA_STATES[0]; quote: string }) {
  const T = useTokens();
  const cardStyles = makeCardStyles(T);
  return (
    <LinearGradient colors={aura.bg} style={cardStyles.card}>
      <Text style={cardStyles.brand}>أُنْس</Text>
      <View style={cardStyles.insightIconWrap}>
        <Feather name="feather" size={36} color={aura.color} />
      </View>
      <Text style={[cardStyles.bigQuote, { color: T.onSurface }]}>"</Text>
      <Text style={[cardStyles.insightQuote, { color: T.onSurface }]}>{quote}</Text>
      <View style={[cardStyles.quoteBar, { backgroundColor: aura.color }]} />
      <Text style={[cardStyles.auraLabel, { color: aura.color }]}>{aura.label}</Text>
      <View style={cardStyles.cardFooter}>
        <Text style={cardStyles.footerCue}>via أُنْس</Text>
      </View>
    </LinearGradient>
  );
}

function StreakCard({ aura, quote }: { aura: typeof AURA_STATES[0]; quote: string }) {
  const T = useTokens();
  const cardStyles = makeCardStyles(T);
  const streak = 7;
  return (
    <LinearGradient colors={aura.bg} style={cardStyles.card}>
      <Text style={cardStyles.brand}>أُنْس</Text>
      <View style={cardStyles.streakHeader}>
        <Text style={[cardStyles.streakCount, { color: aura.color }]}>{streak}</Text>
        <Text style={cardStyles.streakUnit}>أيام</Text>
        <Text style={cardStyles.streakLabel}>من الرعاية الذاتية</Text>
      </View>
      <View style={cardStyles.dotsRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View
            key={i}
            style={[
              cardStyles.dot,
              { backgroundColor: i < streak ? aura.color : "rgba(255,255,255,0.6)" },
            ]}
          />
        ))}
      </View>
      <Text style={[cardStyles.smallQuote, { color: T.muted }]}>{quote}</Text>
      <View style={cardStyles.cardFooter}>
        <Text style={cardStyles.footerCue}>سلسلتي على أُنْس</Text>
      </View>
    </LinearGradient>
  );
}

function SummaryCard({ aura, quote }: { aura: typeof AURA_STATES[0]; quote: string }) {
  const T = useTokens();
  const cardStyles = makeCardStyles(T);
  return (
    <LinearGradient colors={aura.bg} style={cardStyles.card}>
      <Text style={cardStyles.brand}>أُنْس</Text>
      <Text style={[cardStyles.summaryTitle, { color: aura.color }]}>ملخص يومي</Text>
      <View style={cardStyles.statsGrid}>
        {[
          { label: "الحالة", value: aura.label },
          { label: "الجلسات", value: "٣" },
          { label: "السلسلة", value: "٧ أيام" },
          { label: "المزاج", value: "هادئ" },
        ].map(s => (
          <View key={s.label} style={[cardStyles.statBox, { borderColor: aura.color + "20" }]}>
            <Text style={[cardStyles.statValue, { color: aura.color }]}>{s.value}</Text>
            <Text style={cardStyles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <Text style={[cardStyles.smallQuote, { color: T.muted }]}>{quote}</Text>
      <View style={cardStyles.cardFooter}>
        <Text style={cardStyles.footerCue}>بصمتي اليومية على أُنْس</Text>
      </View>
    </LinearGradient>
  );
}

function NightCard({ aura, quote }: { aura: typeof AURA_STATES[0]; quote: string }) {
  const T = useTokens();
  const cardStyles = makeCardStyles(T);
  return (
    <LinearGradient colors={["#020d08", "#041710"]} style={cardStyles.card}>
      <Text style={cardStyles.brand}>أُنْس</Text>
      <Text style={cardStyles.moonEmoji}>🌙</Text>
      <Text style={[cardStyles.nightTitle, { color: aura.color }]}>لحظة هدوء ليلية</Text>
      <Text style={[cardStyles.insightQuote, { color: T.onSurface }]}>{quote}</Text>
      <View style={[cardStyles.nightBar, { backgroundColor: aura.color + "30" }]}>
        <View style={[cardStyles.nightFill, { backgroundColor: aura.color, width: "72%" }]} />
      </View>
      <Text style={[cardStyles.nightLabel, { color: aura.color }]}>٧٢٪ من طاقة الهدوء</Text>
      <View style={cardStyles.cardFooter}>
        <Text style={cardStyles.footerCue}>مع أُنْس — رفيقك في الليل</Text>
      </View>
    </LinearGradient>
  );
}

const CARD_COMPONENTS = {
  aura: AuraCard,
  insight: InsightCard,
  streak: StreakCard,
  summary: SummaryCard,
  night: NightCard,
};

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const T = useTokens();
  const styles = makeStyles(T);
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedAura, setSelectedAura] = useState(0);
  const [cardType, setCardType] = useState<keyof typeof CARD_COMPONENTS>("aura");
  const [tone, setTone] = useState("calm");
  const [privacy, setPrivacy] = useState("public");
  const [quoteIdx, setQuoteIdx] = useState(0);

  const aura = AURA_STATES[selectedAura];
  const quotes = QUOTE_BANK[tone] || QUOTE_BANK.calm;
  const quote = quotes[quoteIdx % quotes.length];

  const regenerate = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuoteIdx(i => i + 1);
  }, []);

  const handleShare = useCallback(async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Share.share({
        message: `"${quote}"\n\n—من أُنْس، رفيقي العاطفي 🌿\nاكتشف بصمتك العاطفية على أُنْس`,
        title: "بصمتي العاطفية | أُنْس",
      });
    } catch (_) {}
  }, [quote]);

  const CardComponent = CARD_COMPONENTS[cardType];

  return (
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: webBottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: webTop + Spacing.md }]}>
        <Text style={styles.logo}>أُنْس</Text>
        <Text style={styles.headerTitle}>شارك حالتك</Text>
        <View style={styles.headerRight}>
          <View style={[styles.privacyBadge, { borderColor: T.accent + "40" }]}>
            <Feather name={PRIVACY.find(p => p.key === privacy)?.icon || "globe"} size={12} color={T.accent} />
            <Text style={styles.privacyBadgeText}>{PRIVACY.find(p => p.key === privacy)?.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardPreviewWrap}>
        <CardComponent aura={aura} quote={quote} />
      </View>

      <Pressable style={styles.regenBtn} onPress={regenerate}>
        <Feather name="refresh-cw" size={14} color={T.accent} />
        <Text style={styles.regenText}>توليد عبارة جديدة</Text>
      </Pressable>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>الحالة العاطفية</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {AURA_STATES.map((a, i) => (
            <Pressable
              key={a.key}
              style={[
                styles.auraPill,
                selectedAura === i && { backgroundColor: a.color + "20", borderColor: a.color },
              ]}
              onPress={() => {
                setSelectedAura(i);
                if (Platform.OS !== "web") Haptics.selectionAsync();
              }}
            >
              <View style={[styles.auraColorDot, { backgroundColor: a.color }]} />
              <Text style={[styles.pillText, selectedAura === i && { color: a.color }]}>{a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>نوع البطاقة</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          {CARD_TYPES.map(c => (
            <Pressable
              key={c.key}
              style={[
                styles.cardTypePill,
                cardType === c.key && styles.cardTypePillActive,
              ]}
              onPress={() => {
                setCardType(c.key as keyof typeof CARD_COMPONENTS);
                if (Platform.OS !== "web") Haptics.selectionAsync();
              }}
            >
              <Feather
                name={c.icon}
                size={14}
                color={cardType === c.key ? T.surface : T.muted}
              />
              <Text style={[styles.cardTypePillText, cardType === c.key && styles.cardTypePillTextActive]}>
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>نبرة العبارة</Text>
        <View style={styles.toneGrid}>
          {TONES.map(t => (
            <Pressable
              key={t.key}
              style={[styles.tonePill, tone === t.key && styles.tonePillActive]}
              onPress={() => { setTone(t.key); setQuoteIdx(0); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
            >
              <Text style={[styles.toneText, tone === t.key && styles.toneTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>مستوى الخصوصية</Text>
        <View style={styles.privacyRow}>
          {PRIVACY.map(p => (
            <Pressable
              key={p.key}
              style={[styles.privacyOption, privacy === p.key && styles.privacyOptionActive]}
              onPress={() => { setPrivacy(p.key); if (Platform.OS !== "web") Haptics.selectionAsync(); }}
            >
              <Feather name={p.icon} size={16} color={privacy === p.key ? T.accent : T.muted} />
              <Text style={[styles.privacyText, privacy === p.key && styles.privacyTextActive]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.privacyNote}>
          {privacy === "public" && "العبارة ومؤشر الحالة فقط — لا بيانات شخصية."}
          {privacy === "semi" && "مرئي للمتابعين فقط — لا بيانات حساسة."}
          {privacy === "private" && "لحفظك الشخصي فقط — لن يراه أحد."}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.saveBtn} onPress={regenerate}>
          <Feather name="download" size={18} color={T.accent} />
          <Text style={styles.saveBtnText}>حفظ</Text>
        </Pressable>
        <Pressable style={styles.shareBtn} onPress={handleShare}>
          <LinearGradient
            colors={[T.accent, T.onSurface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareBtnInner}
          >
            <Feather name="share-2" size={18} color={T.surface} />
            <Text style={styles.shareBtnText}>شارك بصمتك</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Text style={styles.footerNote}>
        لا تُكشف أي بيانات عاطفية خاصة عند المشاركة. تتحكم أنت دائماً فيما يُشارك.
      </Text>
    </ScrollView>
    </LinearGradient>
  );
}

// ─── Card Sub-styles ───────────────────────────────────────────────────────
function makeCardStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: Radius.xl,
    padding: 28,
    alignItems: "flex-end",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  brand: { ...Typography.h2, color: T.accent, textAlign: "right" },
  brandSub: { ...Typography.caption, color: T.muted, letterSpacing: 2, textTransform: "uppercase", textAlign: "right" },
  orbWrap: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%" },
  orbGlow: { position: "absolute", width: 150, height: 150, borderRadius: 75, opacity: 0.15 },
  orbCore: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(27,67,50,0.6)" },
  orbEmoji: { ...Typography.h2, fontFamily: "Tajawal_700Bold" },
  quote: { ...Typography.body, textAlign: "right", opacity: 0.9 },
  cardFooter: { alignItems: "flex-end" },
  footerCue: { ...Typography.label, fontSize: 9, color: T.muted, letterSpacing: 1.5, textTransform: "uppercase" },
  insightIconWrap: { alignItems: "center", width: "100%", marginVertical: 16 },
  bigQuote: { ...Typography.label, fontSize: 48, opacity: 0.3, alignSelf: "flex-end", lineHeight: 40 },
  insightQuote: { ...Typography.h2, textAlign: "right", opacity: 0.95 },
  quoteBar: { width: 40, height: 2, borderRadius: 1, marginTop: 12, alignSelf: "flex-end" },
  auraLabel: { ...Typography.bodySmall, fontFamily: "Tajawal_700Bold", textAlign: "right", marginTop: 6 },
  streakHeader: { alignItems: "flex-end", width: "100%" },
  streakCount: { ...Typography.display, fontSize: 72, lineHeight: 80, fontFamily: "Tajawal_700Bold" },
  streakUnit: { ...Typography.h1, color: T.primaryContainer, marginTop: -12 },
  streakLabel: { ...Typography.bodySmall, color: T.muted, marginTop: 2 },
  dotsRow: { flexDirection: "row", gap: Spacing.sm, justifyContent: "flex-end", marginVertical: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  smallQuote: { ...Typography.bodySmall, textAlign: "right", opacity: 0.7 },
  summaryTitle: { ...Typography.h3, textAlign: "right", marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, justifyContent: "flex-end", width: "100%" },
  statBox: { backgroundColor: "rgba(116,198,157,0.06)", borderRadius: Radius.sm, borderWidth: 1, padding: Spacing.md, minWidth: "44%", alignItems: "flex-end" },
  statValue: { ...Typography.h3, fontFamily: "Tajawal_700Bold" },
  statLabel: { ...Typography.caption, color: T.muted, marginTop: 2 },
  moonEmoji: { fontSize: 40, textAlign: "right", alignSelf: "flex-end" },
  nightTitle: { ...Typography.h3, textAlign: "right" },
  nightBar: { width: "100%", height: 6, borderRadius: 3, marginVertical: 12 },
  nightFill: { height: "100%", borderRadius: 3 },
  nightLabel: { ...Typography.label, textAlign: "right" },
  });
}

// ─── Screen Styles ─────────────────────────────────────────────────────────
function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.md,
  },
  logo: { ...Typography.h2, color: T.accent },
  headerTitle: { ...Typography.h2, color: T.onSurface },
  headerRight: {},
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  privacyBadgeText: { ...Typography.caption, color: T.accent },
  cardPreviewWrap: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  regenBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    backgroundColor: T.surfaceContainer,
    borderRadius: Radius.pill,
  },
  regenText: { ...Typography.bodySmall, color: T.accent },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionLabel: {
    ...Typography.label,
    fontSize: 14,
    color: T.onSurface,
    marginBottom: Spacing.md,
    textAlign: "right",
  },
  pillsRow: { gap: Spacing.sm, paddingVertical: 2 },
  auraPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: T.surfaceContainer,
  },
  auraColorDot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { ...Typography.bodySmall, color: T.muted },
  cardTypePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: T.surfaceContainer,
  },
  cardTypePillActive: {
    backgroundColor: T.accent,
  },
  cardTypePillText: { ...Typography.bodySmall, color: T.muted },
  cardTypePillTextActive: { color: T.surface },
  toneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  tonePill: {
    paddingHorizontal: 14,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: T.surfaceContainer,
  },
  tonePillActive: { backgroundColor: T.primaryContainer },
  toneText: { ...Typography.bodySmall, color: T.muted },
  toneTextActive: { color: T.accent },
  privacyRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  privacyOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: T.surfaceContainer,
  },
  privacyOptionActive: { backgroundColor: T.primaryContainer },
  privacyText: { ...Typography.bodySmall, color: T.muted },
  privacyTextActive: { color: T.accent },
  privacyNote: {
    ...Typography.caption,
    color: T.muted,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    backgroundColor: T.surfaceContainer,
    borderWidth: 1,
    borderColor: T.accent + "40",
  },
  saveBtnText: { ...Typography.h3, color: T.accent },
  shareBtn: {
    flex: 2,
    borderRadius: Radius.pill,
    overflow: "hidden",
  },
  shareBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: Radius.pill,
  },
  shareBtnText: { ...Typography.h3, color: T.surface },
  footerNote: {
    ...Typography.caption,
    color: T.muted,
    textAlign: "center",
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  });
}
