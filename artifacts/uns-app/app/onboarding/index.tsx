import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

const DIALECTS = [
  { key: "gulf", labelAr: "خليجية", icon: "🌊" },
  { key: "levant", labelAr: "شامية", icon: "🌿" },
  { key: "egyptian", labelAr: "مصرية", icon: "🌙" },
  { key: "maghrebi", labelAr: "مغاربية", icon: "⭐" },
  { key: "msa", labelAr: "فصحى", icon: "📖" },
];

const INTENTIONS = [
  { key: "cope", labelAr: "للتعامل مع الضغط والقلق", icon: "🌬️" },
  { key: "grow", labelAr: "للنمو والوعي الذاتي", icon: "🌱" },
  { key: "connect", labelAr: "لأشعر بأنني لست وحدي", icon: "🤝" },
  { key: "habits", labelAr: "لبناء عادات صحية للعقل", icon: "✨" },
  { key: "explore", labelAr: "فقط أستكشف", icon: "🔭" },
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
    step === 0 ||
    (step === 1 && dialect !== "") ||
    (step === 2 && intention !== "");

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.progressRow}>
        {[0, 1, 2].map(i => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotComplete]}
          />
        ))}
      </View>

      {step === 0 && (
        <Animated.View entering={FadeInDown.duration(700)} style={styles.stepContent}>
          <Text style={styles.brandMark}>أُنْس</Text>
          <Text style={styles.heroTitle}>رفيقك العاطفي{"\n"}الأول من نوعه</Text>
          <Text style={styles.heroSub}>
            لست وحدك. أُنس هنا معك كل يوم —{"\n"}يستمع، يتذكر، ويكون معك.
          </Text>
          <View style={styles.featureRow}>
            {[
              { icon: "🧠", text: "يتذكر قصتك" },
              { icon: "💬", text: "يتحدث بلهجتك" },
              { icon: "🔒", text: "يحمي خصوصيتك" },
            ].map(f => (
              <View key={f.text} style={styles.featureCard}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {step === 1 && (
        <Animated.View entering={SlideInRight.duration(400)} style={styles.stepContent}>
          <Text style={styles.stepNumLabel}>١ / ٢</Text>
          <Text style={styles.heroTitle}>ما هي لهجتك{"\n"}المفضّلة؟</Text>
          <Text style={styles.heroSub}>أُنس يتكيّف معك — اختر ما تشعر فيه بالراحة</Text>
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
                <Text style={styles.optionIcon}>{d.icon}</Text>
                <Text style={[styles.optionLabel, dialect === d.key && { color: Colors.accent }]}>
                  {d.labelAr}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {step === 2 && (
        <Animated.View entering={SlideInRight.duration(400)} style={styles.stepContent}>
          <Text style={styles.stepNumLabel}>٢ / ٢</Text>
          <Text style={styles.heroTitle}>لماذا أنت{"\n"}هنا اليوم؟</Text>
          <Text style={styles.heroSub}>لا إجابة خاطئة — أريد أن أبدأ معك من حيث أنت</Text>
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
                <Text style={styles.intentionIcon}>{int.icon}</Text>
                <Text
                  style={[styles.intentionLabel, intention === int.key && { color: Colors.accent }]}
                >
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
          <Pressable onPress={() => setStep(step - 1)} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>→ رجوع</Text>
          </Pressable>
        )}
        {step === 0 && (
          <Pressable onPress={handleNext} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>تخطي الآن</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.accent,
  },
  dotComplete: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.accent + "60",
  },
  stepContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    gap: 8,
  },
  brandMark: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 80,
    color: Colors.accent,
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 100,
  },
  heroTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 30,
    color: Colors.onSurface,
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 24,
    maxWidth: 310,
  },
  stepNumLabel: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 12,
    color: Colors.accent,
    marginBottom: 12,
    letterSpacing: 2,
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  featureIcon: { fontSize: 24 },
  featureLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.primary,
    textAlign: "center",
    lineHeight: 18,
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
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionCardActive: {
    borderColor: Colors.accent + "80",
    backgroundColor: Colors.primaryContainer,
  },
  optionIcon: { fontSize: 28 },
  optionLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
  },
  intentionsList: { width: "100%", gap: 10 },
  intentionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  intentionCardActive: {
    borderColor: Colors.accent + "80",
    backgroundColor: Colors.primaryContainer,
  },
  intentionIcon: { fontSize: 22 },
  intentionLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.primary,
    flex: 1,
    textAlign: "right",
    lineHeight: 22,
  },
  footer: {
    gap: 10,
    paddingBottom: 8,
    paddingTop: 8,
  },
  nextBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: "center",
  },
  nextBtnDisabled: { opacity: 0.35 },
  nextBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 17,
    color: Colors.surface,
  },
  secondaryBtn: { alignItems: "center", paddingVertical: 10 },
  secondaryBtnText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
  },
});
