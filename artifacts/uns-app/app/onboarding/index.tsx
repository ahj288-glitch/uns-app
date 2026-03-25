import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/layout";

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
  const [intention, setIntention] = useState("");

  const handleNext = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 1) {
      setStep(step + 1);
    } else {
      await AsyncStorage.setItem("@uns_onboarding_complete", "1");
      await AsyncStorage.setItem("@uns_dialect", "auto");
      await AsyncStorage.setItem("@uns_intention", intention || "explore");
      router.replace("/(tabs)");
    }
  };

  const canProceed =
    step === 0 ||
    (step === 1 && intention !== "");

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm, paddingBottom: insets.bottom + Spacing.xxl },
      ]}
    >
      <View style={styles.progressRow}>
        {[0, 1].map(i => (
          <View
            key={i}
            style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
          />
        ))}
      </View>

      {step === 0 && (
        <Animated.View entering={FadeInDown.duration(700)} style={styles.stepContent}>
          <Text style={styles.brandMark}>أُنْس</Text>
          <Text style={styles.heroTitle}>رفيقك العاطفي{"\n"}الأول من نوعه</Text>
          <Text style={styles.heroSub}>
            لست وحدك. أُنْس هنا معك كل يوم —{"\n"}يستمع، يتذكر، ويكون معك.
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
          <Text style={styles.stepNumLabel}>١ / ١</Text>
          <Text style={styles.heroTitle}>لماذا أنت{"\n"}هنا اليوم؟</Text>
          <Text style={styles.heroSub}>لا إجابة خاطئة — أريد أن أبدأ معك من حيث أنت</Text>
          <View style={styles.intentionsList}>
            {INTENTIONS.map(int => (
              <Pressable
                key={int.key}
                style={[
                  styles.intentionCard,
                  intention === int.key && styles.intentionCardActive,
                ]}
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
          style={{ borderRadius: Radius.pill, overflow: "hidden", opacity: canProceed ? 1 : 0.35 }}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <LinearGradient
            colors={["#74C69D", "#1B4332"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {step === 1 ? "ابدأ رحلتك مع أُنْس ←" : "التالي ←"}
            </Text>
          </LinearGradient>
        </Pressable>
        {step > 0 && (
          <Pressable onPress={() => setStep(step - 1)} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>→ رجوع</Text>
          </Pressable>
        )}
        {step === 0 && (
          <Pressable onPress={() => router.push("/onboarding/login")} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>لديّ حساب بالفعل</Text>
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
    paddingHorizontal: Spacing.xxl,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
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
  dotDone: {
    backgroundColor: Colors.primaryContainer,
  },
  stepContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  brandMark: {
    ...Typography.display,
    fontSize: 80,
    lineHeight: 100,
    color: Colors.accent,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  heroTitle: {
    ...Typography.display,
    color: Colors.onSurface,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroSub: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: "center",
    marginBottom: Spacing.xxl,
    maxWidth: 310,
  },
  stepNumLabel: {
    ...Typography.label,
    color: Colors.accent,
    marginBottom: Spacing.md,
    letterSpacing: 2,
  },
  featureRow: {
    flexDirection: "row",
    gap: Spacing.md - 2,
    marginTop: Spacing.sm,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureIcon: { fontSize: 24 },
  featureLabel: {
    ...Typography.bodySmall,
    color: Colors.primary,
    textAlign: "center",
  },
  intentionsList: { width: "100%", gap: Spacing.md },
  intentionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    padding: Spacing.cardPad,
  },
  intentionCardActive: {
    backgroundColor: Colors.primaryContainer,
  },
  intentionIcon: { fontSize: 22 },
  intentionLabel: {
    ...Typography.body,
    color: Colors.primary,
    flex: 1,
    textAlign: "right",
  },
  footer: {
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  nextBtn: {
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: "center",
  },
  nextBtnText: {
    ...Typography.h3,
    color: Colors.surface,
  },
  secondaryBtn: { alignItems: "center", paddingVertical: Spacing.md },
  secondaryBtnText: {
    ...Typography.body,
    color: Colors.muted,
    textDecorationLine: "underline",
  },
});
