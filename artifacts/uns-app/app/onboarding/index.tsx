import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

const DIALECTS = [
  { key: "gulf", labelAr: "خليجية", emoji: "🌊" },
  { key: "levant", labelAr: "شامية", emoji: "🌿" },
  { key: "egyptian", labelAr: "مصرية", emoji: "🌙" },
  { key: "maghrebi", labelAr: "مغاربية", emoji: "⭐" },
  { key: "msa", labelAr: "فصحى", emoji: "📖" },
];

const INTENTIONS = [
  { key: "cope", labelAr: "للتعامل مع الضغط والقلق", emoji: "🌬️" },
  { key: "grow", labelAr: "للنمو والوعي الذاتي", emoji: "🌱" },
  { key: "connect", labelAr: "لأشعر بأنني لست وحدي", emoji: "🤝" },
  { key: "habits", labelAr: "لبناء عادات صحية للعقل", emoji: "✨" },
  { key: "explore", labelAr: "فقط أستكشف", emoji: "🔭" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [dialect, setDialect] = useState("");
  const [intention, setIntention] = useState("");

  const handleNext = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 2) {
      setStep(step + 1);
    } else {
      await AsyncStorage.setItem("@uns_onboarding_complete", "1");
      await AsyncStorage.setItem("@uns_dialect", dialect || "msa");
      await AsyncStorage.setItem("@uns_intention", intention || "explore");
      router.replace("/(tabs)");
    }
  };

  const canProceed =
    (step === 0) ||
    (step === 1 && dialect !== "") ||
    (step === 2 && intention !== "");

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive]}
          />
        ))}
      </View>

      {/* Step content */}
      {step === 0 && (
        <Animated.View entering={FadeInDown.duration(600)} style={styles.stepContent}>
          <Text style={styles.brandGold}>أُنس</Text>
          <Text style={styles.bigTitle}>
            رفيقك العاطفي{"\n"}الأول من نوعه
          </Text>
          <Text style={styles.subtitle}>
            لست وحدك. أُنس هنا معك كل يوم — يستمع، يتذكر، ويكون معك.
          </Text>

          <View style={styles.cardsRow}>
            {[
              { icon: "🧠", labelAr: "يتذكر قصتك" },
              { icon: "💬", labelAr: "يتحدث بلهجتك" },
              { icon: "🔒", labelAr: "يحمي خصوصيتك" },
            ].map((c) => (
              <View key={c.labelAr} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{c.icon}</Text>
                <Text style={styles.featureLabel}>{c.labelAr}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {step === 1 && (
        <Animated.View entering={SlideInRight.duration(400)} style={styles.stepContent}>
          <Text style={styles.stepNum}>١ / ٢</Text>
          <Text style={styles.bigTitle}>ما هي لهجتك{"\n"}المفضّلة؟</Text>
          <Text style={styles.subtitle}>
            أُنس يتكيّف معك — اختر اللهجة التي تشعر فيها بالراحة
          </Text>
          <View style={styles.optionsGrid}>
            {DIALECTS.map(d => (
              <Pressable
                key={d.key}
                style={[styles.optionCard, dialect === d.key && styles.optionCardActive]}
                onPress={() => {
                  setDialect(d.key);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
              >
                <Text style={styles.optionEmoji}>{d.emoji}</Text>
                <Text style={[styles.optionLabel, dialect === d.key && styles.optionLabelActive]}>
                  {d.labelAr}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {step === 2 && (
        <Animated.View entering={SlideInRight.duration(400)} style={styles.stepContent}>
          <Text style={styles.stepNum}>٢ / ٢</Text>
          <Text style={styles.bigTitle}>لماذا أنت{"\n"}هنا اليوم؟</Text>
          <Text style={styles.subtitle}>
            لا إجابة خاطئة. أريد أن أبدأ معك من حيث أنت
          </Text>
          <View style={styles.intentionsList}>
            {INTENTIONS.map(int => (
              <Pressable
                key={int.key}
                style={[styles.intentionCard, intention === int.key && styles.intentionCardActive]}
                onPress={() => {
                  setIntention(int.key);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
              >
                <Text style={styles.intentionEmoji}>{int.emoji}</Text>
                <Text style={[styles.intentionLabel, intention === int.key && styles.intentionLabelActive]}>
                  {int.labelAr}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.duration(400)} style={styles.footer}>
        <Pressable
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextBtnText}>
            {step === 2 ? "ابدأ رحلتك مع أُنس ←" : "التالي ←"}
          </Text>
        </Pressable>
        {step > 0 && (
          <Pressable onPress={() => setStep(step - 1)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>→ رجوع</Text>
          </Pressable>
        )}
        {step === 0 && (
          <Pressable onPress={handleNext} style={styles.skipBtn}>
            <Text style={styles.skipBtnText}>تخطي الآن</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navyDeep,
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.gold,
  },
  stepContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  brandGold: {
    fontFamily: "Amiri_700Bold",
    fontSize: 72,
    color: Colors.gold,
    marginBottom: 12,
    textAlign: "center",
  },
  bigTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 30,
    color: "#F2EBD9",
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Amiri_400Regular",
    fontSize: 16,
    color: "rgba(242,235,217,0.6)",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
    maxWidth: 300,
  },
  stepNum: {
    fontFamily: "Amiri_400Regular",
    fontSize: 13,
    color: Colors.gold,
    marginBottom: 16,
    letterSpacing: 2,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  featureIcon: { fontSize: 24 },
  featureLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(242,235,217,0.7)",
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
  optionCard: {
    width: (width - 68) / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  optionCardActive: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(201,168,76,0.12)",
  },
  optionEmoji: { fontSize: 28 },
  optionLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "rgba(242,235,217,0.7)",
    textAlign: "center",
  },
  optionLabelActive: { color: Colors.gold },
  intentionsList: { width: "100%", gap: 10 },
  intentionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  intentionCardActive: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(201,168,76,0.10)",
  },
  intentionEmoji: { fontSize: 22 },
  intentionLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    color: "rgba(242,235,217,0.8)",
    flex: 1,
    textAlign: "right",
  },
  intentionLabelActive: { color: Colors.gold },
  footer: {
    gap: 12,
    paddingBottom: 8,
  },
  nextBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 17,
    color: "#0B0E18",
  },
  backBtn: { alignItems: "center", paddingVertical: 8 },
  backBtnText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "rgba(242,235,217,0.5)",
  },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipBtnText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "rgba(242,235,217,0.4)",
  },
});
