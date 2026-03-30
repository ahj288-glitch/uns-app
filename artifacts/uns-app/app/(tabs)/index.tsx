import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import BreathingSession from "@/components/BreathingSession";
import { getHomeQuickPickMoods, getMoodQuestion } from "@/lib/gender";
import { useGetDailyRecipe, useRecordMoodCheckin } from "@workspace/api-client-react";
import { Typography } from "@/constants/typography";
import { Spacing, Radius, Shadow } from "@/constants/layout";

const CATEGORY_EMOJI: Record<string, string> = {
  "هدوء": "🌅",
  "تحفيز": "✨",
  "تأمل": "🌿",
  "نمو ذاتي": "🌱",
};


// ─── IridescentOrb ────────────────────────────────────────────────────────
function IridescentOrb({ orbColors }: { orbColors: [string, string, string] }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.3)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const layer2Rotate = useRef(new Animated.Value(0)).current;

  const glowHalf = useRef(Animated.multiply(glow, 0.5)).current;
  const glowFour = useRef(Animated.multiply(glow, 0.4)).current;
  const glowThreeFive = useRef(Animated.multiply(glow, 0.35)).current;

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
    const slowRotate2 = Animated.loop(
      Animated.timing(layer2Rotate, {
        toValue: 1,
        duration: 14000,
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
    slowRotate2.start();

    return () => {
      breathe.stop();
      slowRotate.stop();
      slowRotate2.stop();
    };
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const spinReverse = layer2Rotate.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });

  return (
    <Pressable
      style={orbStyles.container}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      }}
      accessibilityLabel="ابدأ جلسة التنفس"
      accessibilityRole="button"
      accessibilityHint="اضغط لفتح جلسة التنفس العميق"
    >
      <Animated.View style={[orbStyles.outerRing, { opacity: glow, transform: [{ rotate: spin }], borderColor: orbColors[0] }]} />
      <Animated.View style={[orbStyles.greenLayer, { opacity: glowHalf, backgroundColor: orbColors[0] }]} />
      <Animated.View
        style={[
          orbStyles.goldLayer,
          { opacity: glowFour, transform: [{ rotate: spinReverse }], backgroundColor: orbColors[1] },
        ]}
      />
      <Animated.View style={[orbStyles.orbMid, { transform: [{ scale: pulse }] }]}>
        <LinearGradient
          colors={orbColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={orbStyles.orbGradient}
        >
          <Animated.View
            style={[
              orbStyles.pearlOverlay,
              { opacity: glowThreeFive, transform: [{ rotate: spin }] },
            ]}
          />
          <Text style={orbStyles.orbLabel}>تنفّس</Text>
          <Text style={orbStyles.orbSub}>جلسة هدوء</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const orbStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 264,
    marginTop: Spacing.sm,
  },
  outerRing: {
    position: "absolute",
    width: 238,
    height: 238,
    borderRadius: 119,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  greenLayer: {
    position: "absolute",
    width: 218,
    height: 218,
    borderRadius: 109,
  },
  goldLayer: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  orbMid: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
    ...Shadow.glow,
  },
  orbGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  pearlOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F0F8FF",
    borderRadius: 90,
  },
  orbLabel: {
    ...Typography.h2,
    color: "rgba(255,255,255,0.97)",
    textAlign: "center",
  },
  orbSub: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

// ─── Home Screen ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { greeting, gender, sessionId, setLastMoodWord, authFetch } = useSession();
  const { theme } = useThemeContext();
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [breathingOpen, setBreathingOpen] = useState(false);

  const { data: recipeData } = useGetDailyRecipe();
  const recipe = recipeData?.recipe ?? null;

  const { mutate: recordMood } = useRecordMoodCheckin();

  // Home strip shows a curated 5-mood quick-pick. Tapping one navigates
  // to the full mood screen (which shows all 9 from MOOD_OPTIONS) with
  // the chip pre-selected via SessionContext.lastMoodWord.
  const MOODS = useMemo(() => getHomeQuickPickMoods(gender), [gender]);

  const handleMoodSelect = (idx: number) => {
    setSelectedMood(idx);
    const moodEn = MOODS[idx]?.en ?? null;
    setLastMoodWord(moodEn);
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTimeout(() => router.push("/(tabs)/mood"), 300);
  };

  const handleShare = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/share");
  };

  const moodQuestion = getMoodQuestion(gender);
  const recipeEmoji = CATEGORY_EMOJI[recipe?.category ?? ""] ?? "🌅";

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={theme.homeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={styles.gradientBg}
      >
        <BreathingSession
          visible={breathingOpen}
          onClose={(completed, postMood) => {
            setBreathingOpen(false);
            if (completed && postMood && sessionId) {
              recordMood({ data: { sessionId, moodWord: postMood, intensity: 3, notes: "بعد جلسة التنفس" } });
              setLastMoodWord(postMood);
            }
            if (completed) router.push("/(tabs)/insights");
          }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: webBottom + 90 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: webTop + Spacing.md }]}>
            <Pressable onPress={() => router.push("/(tabs)/profile")} style={styles.avatarBtn}>
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.15)"]}
                style={styles.avatarCircle}
              >
                <Text style={styles.avatarText}>س</Text>
              </LinearGradient>
            </Pressable>
            <Text style={styles.headerLogo}>أُنْس</Text>
            <Pressable onPress={handleShare} style={styles.shareHeaderBtn}>
              <Feather name="share-2" size={18} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>

          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>
              {greeting || "أهلاً بك في مساحتك الخاصة"}
            </Text>
          </View>

          <IridescentOrb orbColors={theme.orbColors} />

          <View style={styles.breatheSubRow}>
            <Text style={styles.breatheLabel}>جلسة هدوء لمدة دقيقة</Text>
            <Pressable
              style={styles.startNowBtn}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setBreathingOpen(true);
              }}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.15)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startNowBtnGrad}
              >
                <Text style={styles.startNowText}>ابدأ الآن</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {Platform.OS !== "web" ? (
            <BlurView intensity={theme.blurIntensity} tint="light" style={styles.moodCard}>
              <Text style={styles.moodQuestion}>{moodQuestion}</Text>
              <View style={styles.moodChipsRow}>
                {MOODS.map((m, i) => (
                  <Pressable
                    key={m.word}
                    style={[
                      styles.moodChip,
                      selectedMood === i && { backgroundColor: m.color + "33" },
                    ]}
                    onPress={() => handleMoodSelect(i)}
                    accessibilityLabel={m.word}
                    accessibilityRole="button"
                  >
                    <View style={[styles.moodIconBox, { backgroundColor: m.color + "40" }]}>
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    </View>
                    <Text style={[styles.moodWord, selectedMood === i && { color: m.color, fontFamily: "Tajawal_700Bold" }]}>
                      {m.word}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </BlurView>
          ) : (
            <View style={[styles.moodCard, styles.moodCardWeb]}>
              <Text style={styles.moodQuestion}>{moodQuestion}</Text>
              <View style={styles.moodChipsRow}>
                {MOODS.map((m, i) => (
                  <Pressable
                    key={m.word}
                    style={[
                      styles.moodChip,
                      selectedMood === i && { backgroundColor: m.color + "33" },
                    ]}
                    onPress={() => handleMoodSelect(i)}
                    accessibilityLabel={m.word}
                    accessibilityRole="button"
                  >
                    <View style={[styles.moodIconBox, { backgroundColor: m.color + "40" }]}>
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    </View>
                    <Text style={[styles.moodWord, selectedMood === i && { color: m.color, fontFamily: "Tajawal_700Bold" }]}>
                      {m.word}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <LinearGradient
            colors={["#0C2C1E", "#1A4030"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dailyFlashCard}
          >
            <LinearGradient
              colors={["#C8A882", "#D4B896"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dailyThumbnail}
            >
              <Text style={styles.dailyThumbnailEmoji}>{recipeEmoji}</Text>
            </LinearGradient>
            <View style={styles.dailyContent}>
              <Text style={styles.dailyTitle}>{recipe?.title ?? "الومضة اليومية"}</Text>
              <Text style={styles.dailyQuote} numberOfLines={3}>
                "{recipe?.summary ?? "لا تحمل الهمّ، فكل عسر يتبعه يسر."}"
              </Text>
              {recipe?.source ? (
                <Text style={styles.dailyAttrib}>— {recipe.source}</Text>
              ) : !recipe ? (
                <Text style={styles.dailyAttrib}>— حكمة عربية</Text>
              ) : null}
              <Pressable
                style={styles.dailyCTA}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const isBreathingCategory = recipe?.category === "تأمل" || recipe?.category === "هدوء" || !recipe;
                  if (isBreathingCategory) {
                    setBreathingOpen(true);
                  } else {
                    router.push("/(tabs)/chat");
                  }
                }}
                accessibilityLabel={
                  recipe?.category === "تأمل" || recipe?.category === "هدوء" || !recipe
                    ? "تأمل لمدة ٥ دقائق"
                    : "تحدّث مع رفيقك"
                }
                accessibilityRole="button"
              >
                <Text style={styles.dailyCTAText}>
                  {recipe?.category === "تأمل" || recipe?.category === "هدوء" || !recipe
                    ? "تأمل لمدة ٥ دقائق"
                    : "تحدّث مع رفيقك"}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>

          <Pressable
            style={styles.communityCard}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/community");
            }}
          >
            <LinearGradient
              colors={["rgba(116,198,157,0.18)", "rgba(133,215,173,0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.communityCardInner}
            >
              <View style={styles.communityLeft}>
                <Text style={styles.communityEmoji}>🌿</Text>
              </View>
              <View style={styles.communityTextCol}>
                <Text style={styles.communityTitle}>واحة المجتمع</Text>
                <Text style={styles.communitySub}>شارك في جلسات دعم جماعية آمنة</Text>
              </View>
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradientBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.screenH,
    paddingBottom: Spacing.sm,
  },
  avatarBtn: {},
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    ...Typography.h2,
    color: "#FFFFFF",
  },
  headerLogo: {
    ...Typography.h1,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  shareHeaderBtn: { padding: 6 },
  greetingSection: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    alignItems: "flex-end",
  },
  greetingTitle: {
    ...Typography.h1,
    color: "#FFFFFF",
    textAlign: "right",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  breatheSubRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginTop: 6,
    paddingHorizontal: Spacing.xxl,
  },
  breatheLabel: {
    ...Typography.body,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  startNowBtn: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    ...Shadow.glow,
  },
  startNowBtnGrad: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.xl,
  },
  startNowText: {
    ...Typography.h2,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  moodCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.xl,
    padding: 18,
    overflow: "hidden",
  },
  moodCardWeb: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  moodQuestion: {
    ...Typography.h3,
    color: "#FFFFFF",
    textAlign: "right",
    marginBottom: 14,
  },
  moodChipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.xs,
  },
  moodChip: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
  },
  moodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: { fontSize: 18 },
  moodWord: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  dailyFlashCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Spacing.xl,
    overflow: "hidden",
    padding: Spacing.cardPad,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(116,198,157,0.22)",
    ...Shadow.card,
  },
  dailyThumbnail: {
    width: 72,
    height: 90,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dailyThumbnailEmoji: { fontSize: 32 },
  dailyContent: {
    flex: 1,
    alignItems: "flex-end",
    gap: 6,
  },
  dailyTitle: {
    ...Typography.h3,
    color: "#e8f5ee",
    textAlign: "right",
  },
  dailyQuote: {
    ...Typography.bodySmall,
    color: "#a5d0b9",
    textAlign: "right",
  },
  dailyAttrib: {
    ...Typography.caption,
    color: "#4a7a5e",
    textAlign: "right",
  },
  dailyCTA: {
    backgroundColor: Colors.accent,
    borderRadius: Spacing.xl,
    paddingHorizontal: Spacing.cardPad,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  dailyCTAText: {
    ...Typography.label,
    color: "#FFFFFF",
  },
  communityCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Spacing.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(116,198,157,0.25)",
  },
  communityCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.cardPad,
    gap: Spacing.md,
  },
  communityLeft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  communityEmoji: { fontSize: 22 },
  communityTextCol: {
    flex: 1,
    alignItems: "flex-end",
    gap: 3,
  },
  communityTitle: {
    ...Typography.h3,
    color: "#FFFFFF",
    textAlign: "right",
  },
  communitySub: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
  },
});
