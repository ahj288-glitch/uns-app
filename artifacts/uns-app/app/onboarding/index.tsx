import React, { useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/layout";

// ─── Data ──────────────────────────────────────────────────────────────────

const MOODS = [
  { key: "exhausted",  ar: "متعب ومرهق",          emoji: "😔", response: "أنا هنا معك — لست وحدك الليلة." },
  { key: "anxious",    ar: "قلق أو متوتر",          emoji: "😰", response: "خذ نفساً عميقاً. أنت بأمان هنا." },
  { key: "okay",       ar: "بخير، أريد أن أتحدث",   emoji: "🙂", response: "رائع — أنا أسمعك." },
  { key: "lonely",     ar: "أشعر بالوحدة",           emoji: "🤍", response: "شكراً لأنك قلت ذلك. أنا هنا." },
  { key: "unknown",    ar: "لا أعرف كيف أصف شعوري", emoji: "🌫️", response: "لا بأس — سنكتشف ذلك معاً." },
];

const INTENTIONS = [
  { key: "cope",     ar: "للتعامل مع الضغط والقلق",    emoji: "🌬️" },
  { key: "grow",     ar: "للنمو والوعي الذاتي",          emoji: "🌱" },
  { key: "connect",  ar: "لأشعر بأنني لست وحدي",        emoji: "🤝" },
  { key: "habits",   ar: "لبناء عادات صحية للعقل",       emoji: "✨" },
  { key: "reflect",  ar: "لأفهم مشاعري أكثر",            emoji: "🔍" },
  { key: "explore",  ar: "فقط أستكشف",                  emoji: "🔭" },
];

const TOTAL_STEPS = 3;

// ─── Step indicator ─────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={si.row}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[si.dot, i === current && si.dotActive, i < current && si.dotDone]}
        />
      ))}
    </View>
  );
}

const si = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  dotActive: { width: 28, backgroundColor: Colors.accent },
  dotDone:   { backgroundColor: Colors.primaryContainer },
});

// ─── Step counter label ──────────────────────────────────────────────────────

function StepLabel({ current }: { current: number }) {
  const labels = ["١ من ٣", "٢ من ٣", "٣ من ٣"];
  return (
    <Text style={styles.stepLabel}>{labels[current]}</Text>
  );
}

// ─── Primary CTA ─────────────────────────────────────────────────────────────

function PrimaryBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      style={{ borderRadius: Radius.pill, overflow: "hidden", opacity: disabled ? 0.35 : 1 }}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={["#74C69D", "#1B4332"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Step 0: Mood baseline ───────────────────────────────────────────────────

function MoodStep({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <Animated.View entering={SlideInRight.duration(350)} exiting={SlideOutLeft.duration(250)} style={styles.stepContent}>
      <StepLabel current={0} />
      <Text style={styles.stepTitle}>كيف حالك{"\n"}الآن؟</Text>
      <Text style={styles.stepSub}>لا توجد إجابة خاطئة.</Text>
      {selected !== "" && (
        <Animated.Text entering={FadeIn.duration(300)} style={styles.moodResponse}>
          {MOODS.find(m => m.key === selected)?.response}
        </Animated.Text>
      )}
      <View style={styles.moodList}>
        {MOODS.map(mood => (
          <Pressable
            key={mood.key}
            style={[styles.moodTile, mood.key === selected && styles.moodTileActive]}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.selectionAsync();
              onSelect(mood.key);
            }}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, mood.key === selected && styles.moodLabelActive]}>
              {mood.ar}
            </Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Step 1: Intent multi-select ────────────────────────────────────────────

function IntentStep({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <Animated.View entering={SlideInRight.duration(350)} exiting={SlideOutLeft.duration(250)} style={styles.stepContent}>
      <StepLabel current={1} />
      <Text style={styles.stepTitle}>ما الذي{"\n"}تبحث عنه؟</Text>
      <Text style={styles.stepSub}>اختر كل ما ينطبق عليك.</Text>
      <View style={styles.intentionsList}>
        {INTENTIONS.map(intent => {
          const active = selected.includes(intent.key);
          return (
            <Pressable
              key={intent.key}
              style={[styles.intentionCard, active && styles.intentionCardActive]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync();
                onToggle(intent.key);
              }}
            >
              <Text style={styles.intentionEmoji}>{intent.emoji}</Text>
              <Text style={[styles.intentionLabel, active && styles.intentionLabelActive]}>
                {intent.ar}
              </Text>
              {active && (
                <View style={styles.checkDot} />
              )}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ─── Step 2: Name ────────────────────────────────────────────────────────────

function NameStep({
  name,
  onChangeName,
}: {
  name: string;
  onChangeName: (v: string) => void;
}) {
  const inputRef = useRef<TextInput>(null);
  return (
    <Animated.View entering={SlideInRight.duration(350)} exiting={SlideOutLeft.duration(250)} style={styles.stepContent}>
      <StepLabel current={2} />
      <Text style={styles.stepTitle}>ما اسمك؟</Text>
      <Text style={styles.stepSub}>أُنس سيناديك به — لا حاجة لاسمك الكامل.</Text>
      {name.trim().length > 0 && (
        <Animated.Text entering={FadeIn.duration(300)} style={styles.nameGreeting}>
          أهلاً {name.trim()} 👋
        </Animated.Text>
      )}
      <Pressable style={styles.nameInputWrap} onPress={() => inputRef.current?.focus()}>
        <TextInput
          ref={inputRef}
          style={styles.nameInput}
          value={name}
          onChangeText={onChangeName}
          placeholder="اكتب اسمك أو أي اسم تحب"
          placeholderTextColor={Colors.muted}
          autoFocus
          textAlign="right"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          maxLength={30}
        />
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState("");
  const [intentions, setIntentions] = useState<string[]>([]);
  const [name, setName] = useState("");

  function toggleIntention(key: string) {
    setIntentions(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  const canProceed =
    (step === 0 && mood !== "") ||
    (step === 1 && intentions.length > 0) ||
    (step === 2 && name.trim().length > 0);

  async function handleNext() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
      return;
    }

    // Final step — persist and proceed to registration
    await Promise.all([
      AsyncStorage.setItem("@uns_onboarding_complete", "1"),
      AsyncStorage.setItem("@uns_dialect", "auto"),
      AsyncStorage.setItem("@uns_mood_baseline", mood),
      AsyncStorage.setItem("@uns_intentions", JSON.stringify(intentions)),
      AsyncStorage.setItem("@uns_intention", intentions[0] ?? "explore"),
      AsyncStorage.setItem("@uns_display_name", name.trim()),
    ]);

    router.push("/onboarding/register");
  }

  function handleBack() {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s - 1);
  }

  const ctaLabel =
    step === 0 ? "التالي ←" :
    step === 1 ? "التالي ←" :
    `ابدأ مع أُنس ←`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }]}>
      <StepIndicator current={step} />

      {step === 0 && (
        <MoodStep selected={mood} onSelect={setMood} />
      )}
      {step === 1 && (
        <IntentStep selected={intentions} onToggle={toggleIntention} />
      )}
      {step === 2 && (
        <NameStep name={name} onChangeName={setName} />
      )}

      <Animated.View entering={FadeIn.duration(400)} style={styles.footer}>
        <PrimaryBtn label={ctaLabel} onPress={handleNext} disabled={!canProceed} />

        {step > 0 ? (
          <Pressable onPress={handleBack} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>→ رجوع</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push("/onboarding/login")} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>لديّ حساب بالفعل</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xxl,
  },
  stepContent: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  stepLabel: {
    ...Typography.label,
    color: Colors.accent,
    textAlign: "right",
  },
  stepTitle: {
    ...Typography.display,
    color: Colors.onSurface,
    textAlign: "right",
  },
  stepSub: {
    ...Typography.body,
    color: Colors.muted,
    textAlign: "right",
    marginBottom: Spacing.sm,
  },
  // Mood step
  moodResponse: {
    ...Typography.body,
    color: Colors.accent,
    textAlign: "right",
    fontFamily: "Tajawal_500Medium",
  },
  moodList: { width: "100%", gap: Spacing.sm },
  moodTile: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: Spacing.cardPad,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  moodTileActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.accent,
  },
  moodEmoji: { fontSize: 22 },
  moodLabel: {
    ...Typography.body,
    color: Colors.primary,
    flex: 1,
    textAlign: "right",
  },
  moodLabelActive: { color: Colors.accent },
  // Intent step
  intentionsList: { width: "100%", gap: Spacing.sm },
  intentionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    padding: Spacing.cardPad,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  intentionCardActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.accent,
  },
  intentionEmoji: { fontSize: 20 },
  intentionLabel: {
    ...Typography.body,
    color: Colors.primary,
    flex: 1,
    textAlign: "right",
  },
  intentionLabelActive: { color: Colors.accent },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  // Name step
  nameGreeting: {
    ...Typography.h2,
    color: Colors.accent,
    textAlign: "right",
  },
  nameInputWrap: {
    width: "100%",
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  nameInput: {
    ...Typography.h2,
    color: Colors.onSurface,
    textAlign: "right",
    minHeight: 44,
  },
  // Footer
  footer: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  primaryBtn: {
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: {
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
