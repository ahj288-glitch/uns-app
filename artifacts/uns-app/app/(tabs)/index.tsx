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
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import BreathingSession from "@/components/BreathingSession";
import { MOOD_OPTIONS, getMoodQuestion } from "@/lib/gender";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface DailyRecipe {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  category: string;
}

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
    >
      <Animated.View style={[orbStyles.outerRing, { opacity: glow, transform: [{ rotate: spin }], borderColor: orbColors[0] }]} />
      <Animated.View style={[orbStyles.greenLayer, { opacity: Animated.multiply(glow, 0.5), backgroundColor: orbColors[0] }]} />
      <Animated.View
        style={[
          orbStyles.goldLayer,
          { opacity: Animated.multiply(glow, 0.4), transform: [{ rotate: spinReverse }], backgroundColor: orbColors[1] },
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
              { opacity: Animated.multiply(glow, 0.35), transform: [{ rotate: spin }] },
            ]}
          />
          <Feather name="feather" size={28} color="rgba(255,255,255,0.9)" />
          <Text style={orbStyles.orbLabel}>BREATHE</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const orbStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginTop: 8,
  },
  outerRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  greenLayer: {
    position: "absolute",
    width: 184,
    height: 184,
    borderRadius: 92,
  },
  goldLayer: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
  },
  orbMid: {
    width: 152,
    height: 152,
    borderRadius: 76,
    overflow: "hidden",
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
    backgroundColor: "#F8F0FF",
    borderRadius: 76,
  },
  orbLabel: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 3,
  },
});

// ─── Home Screen ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { greeting, gender, setLastMoodWord } = useSession();
  const { theme } = useThemeContext();
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [recipe, setRecipe] = useState<DailyRecipe | null>(null);

  const MOODS = MOOD_OPTIONS[gender];

  useEffect(() => {
    fetch(`${BASE}/api/daily-recipe`)
      .then(r => r.json())
      .then(d => { if (d.recipe) setRecipe(d.recipe); })
      .catch(() => {});
  }, []);

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
          onClose={(completed) => {
            setBreathingOpen(false);
            if (completed) router.push("/(tabs)/insights");
          }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: webBottom + 90 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: webTop + 12 }]}>
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
            <Pressable
              style={styles.playBtn}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setBreathingOpen(true);
              }}
            >
              <Feather name="play" size={14} color="rgba(255,255,255,0.9)" />
            </Pressable>
            <Text style={styles.breatheLabel}>تنفس بعمق... شهيق، زفير</Text>
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

          <View style={styles.dailyFlashCard}>
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
              <Text style={styles.dailyAttrib}>- حكمة عربية</Text>
              <Pressable
                style={styles.dailyCTA}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setBreathingOpen(true);
                }}
              >
                <Text style={styles.dailyCTAText}>تأمل لمدة ٥ دقائق</Text>
              </Pressable>
            </View>
          </View>

          {/* Community Entry Card */}
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
    paddingHorizontal: 20,
    paddingBottom: 8,
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
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  headerLogo: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  shareHeaderBtn: { padding: 6 },
  greetingSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "flex-end",
  },
  greetingTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 26,
    color: "#FFFFFF",
    textAlign: "right",
    lineHeight: 42,
    letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  breatheSubRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    marginTop: 6,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  breatheLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  moodCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
  },
  moodCardWeb: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  moodQuestion: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "right",
    marginBottom: 14,
  },
  moodChipsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  moodChip: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    paddingVertical: 8,
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
    fontFamily: "Tajawal_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  dailyFlashCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  dailyThumbnail: {
    width: 72,
    height: 90,
    borderRadius: 14,
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
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: "#2D2D2D",
    textAlign: "right",
  },
  dailyQuote: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: "#555555",
    textAlign: "right",
    lineHeight: 22,
  },
  dailyAttrib: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: "#AAAAAA",
    textAlign: "right",
  },
  dailyCTA: {
    backgroundColor: "#3AAFA9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  dailyCTAText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  communityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(116,198,157,0.25)",
  },
  communityCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
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
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    color: "#FFFFFF",
    textAlign: "right",
  },
  communitySub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
  },
});
