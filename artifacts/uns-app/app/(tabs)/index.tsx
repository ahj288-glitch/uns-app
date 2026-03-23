import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

const MOODS = [
  { word: "مرهقة", emoji: "😔" },
  { word: "متوترة", emoji: "😟" },
  { word: "حزينة", emoji: "😢" },
  { word: "طبيعية", emoji: "🙂" },
  { word: "مسترخية", emoji: "😌" },
];

function BreathingOrb() {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 2800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2800, useNativeDriver: true }),
      ])
    );
    const glowAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.85, duration: 2800, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.4, duration: 2800, useNativeDriver: true }),
      ])
    );
    pulseAnim.start();
    glowAnim.start();
    return () => { pulseAnim.stop(); glowAnim.stop(); };
  }, []);

  return (
    <View style={styles.orbContainer}>
      <Animated.View style={[styles.orbOuter, { transform: [{ scale: pulse }], opacity: glow }]} />
      <Animated.View style={[styles.orbInner, { transform: [{ scale: pulse }] }]}>
        <Feather name="feather" size={32} color={Colors.surface} />
        <Text style={styles.orbLabel}>BREATHE</Text>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { greeting } = useSession();
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.surface }]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: webTop + 12 }]}>
        <Pressable
          style={styles.avatarBtn}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>أ</Text>
          </View>
        </Pressable>
        <Text style={styles.headerLogo}>أُنْس</Text>
        <Feather name="align-right" size={20} color={Colors.muted} />
      </View>

      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>
          {greeting ? greeting : "أهلاً بك في مساحتك\nالخاصة"}
        </Text>
        <Text style={styles.greetingSubtitle}>دعنا نبدأ رحلة الهدوء اليوم.</Text>
      </View>

      <BreathingOrb />
      <Text style={styles.breatheLabel}>تنفّس بعمق</Text>

      <View style={styles.moodSection}>
        <Text style={styles.moodQuestion}>كيف تشعر اليوم؟</Text>
        <View style={styles.moodChipsRow}>
          {MOODS.map(m => (
            <Pressable
              key={m.word}
              style={styles.moodChip}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                router.push("/(tabs)/mood");
              }}
            >
              <View style={styles.moodIconBox}>
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
              </View>
              <Text style={styles.moodWord}>{m.word}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.featuredCard}>
        <View style={styles.featuredCardInner}>
          <Text style={styles.featuredLabel}>تأمل الليلة</Text>
          <Text style={styles.featuredDesc}>
            رحلة صوتية لمدة ١٠ دقائق لتهدئة العقل قبل النوم.
          </Text>
          <Pressable
            style={styles.featuredBtn}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/chat");
            }}
          >
            <Feather name="play" size={14} color={Colors.surface} />
            <Text style={styles.featuredBtnText}>ابدأ الآن</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>٨٤%</Text>
          <Text style={styles.metricLabel}>تحسّن في النوم</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>١٢</Text>
          <Text style={styles.metricLabel}>يوماً من الهدوء</Text>
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
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.ghostBorder,
  },
  avatarText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: Colors.accent,
  },
  headerLogo: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  greetingSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  greetingTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 30,
    color: Colors.onSurface,
    textAlign: "right",
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.muted,
    textAlign: "right",
    marginTop: 6,
    lineHeight: 24,
  },
  orbContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    marginTop: 8,
  },
  orbOuter: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.accent,
    opacity: 0.15,
  },
  orbInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.ghostBorder,
  },
  orbLabel: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 2,
  },
  breatheLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  moodSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: "flex-end",
  },
  moodQuestion: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: Colors.onSurface,
    textAlign: "right",
    marginBottom: 14,
  },
  moodChipsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  moodChip: {
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  moodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: { fontSize: 18 },
  moodWord: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.primary,
    textAlign: "center",
  },
  featuredCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.surfaceContainerHigh,
  },
  featuredCardInner: {
    padding: 20,
    alignItems: "flex-end",
    gap: 8,
  },
  featuredLabel: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    color: Colors.onSurface,
    textAlign: "right",
  },
  featuredDesc: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.primary,
    textAlign: "right",
    lineHeight: 22,
  },
  featuredBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 4,
  },
  featuredBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 14,
    color: Colors.surface,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    alignItems: "flex-end",
    gap: 4,
  },
  metricValue: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 28,
    color: Colors.accent,
  },
  metricLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "right",
  },
});
