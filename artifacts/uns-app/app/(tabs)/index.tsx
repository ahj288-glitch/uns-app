import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

// ─── Time-of-day logic ────────────────────────────────────────────────────
function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const TIME_GREETINGS = {
  morning: { ar: "صباح الهدوء ☀️", sub: "ابدأ يومك بنفس واعٍ." },
  afternoon: { ar: "كيف حالك الآن؟ 🌿", sub: "خذ دقيقة لنفسك وسط الزحام." },
  evening: { ar: "مساء التأمل 🌙", sub: "اسمح لنفسك بالراحة." },
  night: { ar: "ليلة هادئة 🌌", sub: "الليل وقت لترتاح، لا للتفكير." },
};

const TIME_ORB_COLORS: Record<string, [string, string]> = {
  morning: ["#74C69D", "#1B4332"],
  afternoon: ["#85d7ad", "#1a2e26"],
  evening: ["#5a9e7e", "#10231c"],
  night: ["#3a7d5e", "#041710"],
};

// ─── Moods ────────────────────────────────────────────────────────────────
const MOODS = [
  { word: "مرهقة", emoji: "😔", color: Colors.muted },
  { word: "متوترة", emoji: "😟", color: "#6B7FD7" },
  { word: "حزينة", emoji: "😢", color: "#5D6D8A" },
  { word: "طبيعية", emoji: "🙂", color: Colors.primary },
  { word: "مسترخية", emoji: "😌", color: Colors.accent },
];

// ─── BreathingOrb ─────────────────────────────────────────────────────────
function BreathingOrb({ timeOfDay }: { timeOfDay: ReturnType<typeof getTimeOfDay> }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.3)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breatheIn = Animated.timing(pulse, {
      toValue: 1.08,
      duration: 4000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    const breatheOut = Animated.timing(pulse, {
      toValue: 1,
      duration: 4000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    const glowIn = Animated.timing(glow, {
      toValue: 0.9,
      duration: 4000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    const glowOut = Animated.timing(glow, {
      toValue: 0.3,
      duration: 4000,
      easing: Easing.inOut(Easing.sin),
      useNativeDriver: true,
    });
    const slowRotate = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([breatheIn, glowIn]),
        Animated.parallel([breatheOut, glowOut]),
      ])
    );

    breathe.start();
    slowRotate.start();

    return () => {
      breathe.stop();
      slowRotate.stop();
    };
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const orbColors = TIME_ORB_COLORS[timeOfDay];

  return (
    <Pressable
      style={styles.orbContainer}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }}
    >
      <Animated.View style={[styles.orbRing, { opacity: glow, transform: [{ rotate: spin }] }]} />
      <Animated.View style={[styles.orbOuter, { opacity: Animated.multiply(glow, 0.35) }]} />
      <Animated.View style={[styles.orbMid, { transform: [{ scale: pulse }] }]}>
        <LinearGradient
          colors={orbColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        >
          <Feather name="feather" size={28} color={Colors.onSurface} />
          <Text style={styles.orbLabel}>BREATHE</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ─── Quick Action Cards ───────────────────────────────────────────────────
function QuickAction({ icon, label, sub, onPress }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; sub: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.quickCard, { transform: [{ scale }] }]}>
        <View style={styles.quickIcon}>
          <Feather name={icon} size={18} color={Colors.accent} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={styles.quickSub}>{sub}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { greeting } = useSession();
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const timeOfDay = getTimeOfDay();
  const timeGreeting = TIME_GREETINGS[timeOfDay];

  const handleMoodSelect = (idx: number) => {
    setSelectedMood(idx);
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTimeout(() => router.push("/(tabs)/mood"), 300);
  };

  const handleShare = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/share");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.surface }]}
      contentContainerStyle={{ paddingBottom: webBottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: webTop + 12 }]}>
        <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.avatarBtn}>
          <LinearGradient
            colors={[Colors.primaryContainer, Colors.surfaceContainerHigh]}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>أ</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.headerLogo}>أُنْس</Text>
        <Pressable onPress={handleShare} style={styles.shareHeaderBtn}>
          <Feather name="share-2" size={18} color={Colors.accent} />
        </Pressable>
      </View>

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>
          {greeting || timeGreeting.ar}
        </Text>
        <Text style={styles.greetingSubtitle}>{timeGreeting.sub}</Text>
      </View>

      {/* Breathing Orb */}
      <BreathingOrb timeOfDay={timeOfDay} />
      <Text style={styles.breatheLabel}>اضغط للتنفس</Text>

      {/* Mood Chips */}
      <View style={styles.moodSection}>
        <Text style={styles.moodQuestion}>كيف تشعر الآن؟</Text>
        <View style={styles.moodChipsRow}>
          {MOODS.map((m, i) => (
            <Pressable
              key={m.word}
              style={[
                styles.moodChip,
                selectedMood === i && { borderColor: m.color, borderWidth: 1 },
              ]}
              onPress={() => handleMoodSelect(i)}
            >
              <View style={[styles.moodIconBox, selectedMood === i && { backgroundColor: m.color + "22" }]}>
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
              </View>
              <Text style={[styles.moodWord, selectedMood === i && { color: m.color }]}>{m.word}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickRow}>
        <QuickAction
          icon="message-circle"
          label="تحدث مع أُنْس"
          sub="مرافقك الآن"
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            router.push("/(tabs)/chat");
          }}
        />
        <QuickAction
          icon="trending-up"
          label="أنماطك العاطفية"
          sub="رؤى هذا الأسبوع"
          onPress={() => {
            if (Platform.OS !== "web") Haptics.selectionAsync();
            router.push("/(tabs)/insights");
          }}
        />
      </View>

      {/* Featured Card */}
      <Pressable
        style={styles.featuredCard}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/(tabs)/chat");
        }}
      >
        <View style={styles.featuredTextCol}>
          <Text style={styles.featuredLabel}>
            {timeOfDay === "night" ? "تأمل الليلة" : timeOfDay === "morning" ? "ابدأ صباحك" : "لحظة هدوء"}
          </Text>
          <Text style={styles.featuredDesc}>
            {timeOfDay === "night"
              ? "رحلة صوتية لمدة ١٠ دقائق لتهدئة العقل قبل النوم."
              : timeOfDay === "morning"
              ? "ثلاث أنفاس عميقة لبداية يوم واعٍ."
              : "دقيقة واحدة تكفي لإعادة ضبط حالتك."}
          </Text>
        </View>
        <LinearGradient
          colors={["#74C69D", "#1B4332"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredBtn}
        >
          <Feather name="play" size={14} color={Colors.surface} />
        </LinearGradient>
      </Pressable>

      {/* Share CTA */}
      <Pressable style={styles.shareCta} onPress={handleShare}>
        <View style={styles.shareCtaContent}>
          <Text style={styles.shareCtaLabel}>شارك بصمتك العاطفية ✨</Text>
          <Text style={styles.shareCtaSub}>أنشئ بطاقة فريدة تعبّر عن حالتك اليوم</Text>
        </View>
        <View style={styles.shareCtaArrow}>
          <Feather name="arrow-left" size={16} color={Colors.accent} />
        </View>
      </Pressable>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>٨٤٪</Text>
          <Text style={styles.metricLabel}>تحسّن في النوم</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>١٢</Text>
          <Text style={styles.metricLabel}>يوماً من الهدوء</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>٣</Text>
          <Text style={styles.metricLabel}>جلسات هذا الأسبوع</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  avatarBtn: {},
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Tajawal_700Bold", fontSize: 16, color: Colors.accent },
  headerLogo: { fontFamily: "Tajawal_700Bold", fontSize: 22, color: Colors.accent, letterSpacing: -0.5 },
  shareHeaderBtn: { padding: 6 },
  greetingSection: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4, alignItems: "flex-end" },
  greetingTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 26,
    color: Colors.onSurface,
    textAlign: "right",
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "right",
    marginTop: 4,
    lineHeight: 22,
  },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 210,
    marginTop: 8,
  },
  orbRing: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: Colors.accent + "30",
    borderStyle: "dashed",
  },
  orbOuter: {
    position: "absolute",
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: Colors.accent,
  },
  orbMid: {
    width: 148,
    height: 148,
    borderRadius: 74,
    overflow: "hidden",
  },
  orbGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  orbLabel: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 10,
    color: Colors.onSurface + "CC",
    letterSpacing: 3,
  },
  breatheLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  moodSection: { paddingHorizontal: 20, marginBottom: 20, alignItems: "flex-end" },
  moodQuestion: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    color: Colors.onSurface,
    textAlign: "right",
    marginBottom: 12,
  },
  moodChipsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  moodChip: {
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0,
    borderColor: "transparent",
  },
  moodIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: { fontSize: 18 },
  moodWord: { fontFamily: "Tajawal_400Regular", fontSize: 11, color: Colors.primary, textAlign: "center" },
  quickRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 18,
    padding: 14,
    alignItems: "flex-end",
    gap: 4,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickLabel: { fontFamily: "Tajawal_700Bold", fontSize: 13, color: Colors.onSurface, textAlign: "right" },
  quickSub: { fontFamily: "Tajawal_400Regular", fontSize: 11, color: Colors.muted, textAlign: "right" },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featuredTextCol: { flex: 1, alignItems: "flex-end", gap: 4 },
  featuredLabel: { fontFamily: "Tajawal_700Bold", fontSize: 17, color: Colors.onSurface, textAlign: "right" },
  featuredDesc: { fontFamily: "Tajawal_400Regular", fontSize: 13, color: Colors.primary, textAlign: "right", lineHeight: 20 },
  featuredBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  shareCta: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.accent + "25",
  },
  shareCtaContent: { flex: 1, alignItems: "flex-end" },
  shareCtaLabel: { fontFamily: "Tajawal_700Bold", fontSize: 14, color: Colors.accent, textAlign: "right" },
  shareCtaSub: { fontFamily: "Tajawal_400Regular", fontSize: 12, color: Colors.muted, textAlign: "right", marginTop: 2 },
  shareCtaArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  metricsRow: { flexDirection: "row", gap: 8, marginHorizontal: 20, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 14,
    padding: 12,
    alignItems: "flex-end",
    gap: 2,
  },
  metricValue: { fontFamily: "Tajawal_700Bold", fontSize: 22, color: Colors.accent },
  metricLabel: { fontFamily: "Tajawal_400Regular", fontSize: 10, color: Colors.muted, textAlign: "right", lineHeight: 16 },
});
