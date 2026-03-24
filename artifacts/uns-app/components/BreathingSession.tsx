import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTokens } from "@/constants/colors";

type FlowStep = "pre" | "prep" | "countdown" | "session" | "done";
type Phase = "inhale" | "hold" | "exhale";

interface PhaseConfig {
  key: Phase;
  labelAr: string;
  subAr: string;
  duration: number;
  orbScale: number;
  orbGlow: number;
}

const PHASES: PhaseConfig[] = [
  { key: "inhale",  labelAr: "شهيق",         subAr: "استنشق ببطء...",  duration: 4, orbScale: 1.28, orbGlow: 0.9 },
  { key: "hold",    labelAr: "احتفظ بالنفس",  subAr: "ثبّت نفسك...",   duration: 4, orbScale: 1.28, orbGlow: 1.0 },
  { key: "exhale",  labelAr: "زفير",          subAr: "أخرج ببطء...",   duration: 6, orbScale: 1.0,  orbGlow: 0.4 },
];

const TOTAL_CYCLES = 5;

const PHASE_COLORS: Record<Phase, [string, string]> = {
  inhale:  ["#74C69D", "#9ECBFF"],
  hold:    ["#9ECBFF", "#D4B896"],
  exhale:  ["#85d7ad", "#6B7FD7"],
};

const MID_SESSION_PHRASES = [
  "خذ نفس بعمق",
  "لا تستعجل",
  "أخرج التوتر مع الزفير",
  "جسدك يشكرك",
  "أنت في مكان آمن",
];

const MOOD_CHIPS = [
  { word: "هادئ",    en: "calm",     color: "#74C69D" },
  { word: "مرتاح",  en: "relaxed",  color: "#85d7ad" },
  { word: "ممتنّ",   en: "grateful", color: "#9B59B6" },
  { word: "متعب",   en: "tired",    color: "#7A9A8A" },
  { word: "أفضل",   en: "better",   color: "#D4A87C" },
];

interface Props {
  visible: boolean;
  onClose: (completed: boolean, postMood?: string) => void;
}

export default function BreathingSession({ visible, onClose }: Props) {
  const T = useTokens();
  const styles = makeStyles(T);
  const [step, setStep] = useState<FlowStep>("pre");
  const [countdown, setCountdown] = useState(3);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(PHASES[0].duration);
  const [cycle, setCycle] = useState(1);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow  = useRef(new Animated.Value(0.3)).current;
  const phaseAnim = useRef(new Animated.Value(0)).current;
  const prepFade = useRef(new Animated.Value(0)).current;

  const haptic = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const reset = useCallback(() => {
    setStep("pre");
    setCountdown(3);
    setPhaseIndex(0);
    setCounter(PHASES[0].duration);
    setCycle(1);
    setPhraseIdx(0);
    setSelectedMood(null);
    orbScale.setValue(1);
    orbGlow.setValue(0.3);
    phaseAnim.setValue(0);
    prepFade.setValue(0);
  }, [orbScale, orbGlow, phaseAnim, prepFade]);

  useEffect(() => {
    if (!visible) return;
    reset();
  }, [visible]);

  useEffect(() => {
    if (!visible || step !== "prep") return;

    Animated.timing(prepFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => {
      setStep("countdown");
      setCountdown(3);
    }, 1500);
    return () => clearTimeout(t);
  }, [step, visible]);

  useEffect(() => {
    if (!visible || step !== "countdown") return;
    if (countdown <= 0) {
      setStep("session");
      return;
    }
    haptic();
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, step, visible]);

  useEffect(() => {
    if (!visible || step !== "session") return;
    haptic();

    const currentPhase = PHASES[phaseIndex];

    Animated.parallel([
      Animated.timing(orbScale, {
        toValue: currentPhase.orbScale,
        duration: currentPhase.duration * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(orbGlow, {
        toValue: currentPhase.orbGlow,
        duration: currentPhase.duration * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(phaseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setCounter(currentPhase.duration);

    const countInterval = setInterval(() => {
      setCounter(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const phraseInterval = setInterval(() => {
      setPhraseIdx(i => (i + 1) % MID_SESSION_PHRASES.length);
    }, 4000);

    const phaseTimer = setTimeout(() => {
      clearInterval(countInterval);
      clearInterval(phraseInterval);
      phaseAnim.setValue(0);

      const nextIndex = phaseIndex + 1;
      if (nextIndex >= PHASES.length) {
        if (cycle >= TOTAL_CYCLES) {
          setStep("done");
        } else {
          setCycle(c => c + 1);
          setPhaseIndex(0);
          setCounter(PHASES[0].duration);
        }
      } else {
        setPhaseIndex(nextIndex);
        setCounter(PHASES[nextIndex].duration);
      }
    }, currentPhase.duration * 1000);

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(countInterval);
      clearInterval(phraseInterval);
      orbScale.stopAnimation();
      orbGlow.stopAnimation();
      phaseAnim.stopAnimation();
    };
  }, [phaseIndex, cycle, step, visible]);

  const phase = PHASES[phaseIndex];
  const colors = PHASE_COLORS[phase.key];

  function handleClose() {
    const isCompleted = step === "done";
    onClose(isCompleted, selectedMood ?? undefined);
  }

  function handleMoodSelect(mood: string) {
    setSelectedMood(mood);
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTimeout(() => onClose(true, mood), 400);
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={["#0a2318", "#041710"]}
          style={StyleSheet.absoluteFill}
        />

        <Pressable style={styles.closeBtn} onPress={handleClose}>
          <Feather name="x" size={22} color="rgba(255,255,255,0.5)" />
        </Pressable>

        {step === "pre" && (
          <View style={styles.preContainer}>
            <View style={styles.preIconWrap}>
              <LinearGradient colors={["#74C69D", "#4a9e72"]} style={styles.preIconGrad}>
                <Text style={styles.preIconEmoji}>🌿</Text>
              </LinearGradient>
            </View>
            <Text style={styles.preTitle}>تنفّس</Text>
            <Text style={styles.preSub}>جلسة هدوء لمدة دقيقة{"\n"}٥ دورات من التنفس الواعي</Text>
            <View style={styles.preDetails}>
              <View style={styles.preDetailRow}>
                <Text style={styles.preDetailText}>شهيق ٤ ث · احتفظ ٤ ث · زفير ٦ ث</Text>
              </View>
            </View>
            <Pressable
              style={styles.preStartBtn}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setStep("prep");
                prepFade.setValue(0);
              }}
            >
              <LinearGradient colors={["#74C69D", "#4a9e72"]} style={styles.preStartBtnGrad}>
                <Text style={styles.preStartBtnText}>ابدأ</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {(step === "prep" || step === "countdown") && (
          <Animated.View style={[styles.prepContainer, { opacity: prepFade }]}>
            {step === "prep" && (
              <Text style={styles.prepText}>خلنا نبدأ بهدوء…</Text>
            )}
            {step === "countdown" && (
              <>
                <Text style={styles.prepText}>خلنا نبدأ بهدوء…</Text>
                <Text style={styles.countdownNumber}>{countdown}</Text>
              </>
            )}
          </Animated.View>
        )}

        {step === "session" && (
          <>
            <View style={styles.cycleRow}>
              {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.cycleDot,
                    i < cycle - 1 && styles.cycleDotDone,
                    i === cycle - 1 && styles.cycleDotActive,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.cycleLabel}>دورة {cycle} من {TOTAL_CYCLES}</Text>

            <View style={styles.orbContainer}>
              <Animated.View
                style={[styles.orbGlow, { opacity: orbGlow, transform: [{ scale: orbScale }] }]}
              />
              <Animated.View
                style={[styles.orbOuter, { opacity: Animated.multiply(orbGlow, 0.3), transform: [{ scale: orbScale }] }]}
              />
              <Animated.View style={[styles.orbMid, { transform: [{ scale: orbScale }] }]}>
                <LinearGradient
                  colors={colors}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.phaseLabels,
                { opacity: phaseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ]}
            >
              <Text style={styles.phaseMain}>{phase.labelAr}</Text>
              {phase.subAr ? <Text style={styles.phaseSub}>{phase.subAr}</Text> : null}
            </Animated.View>

            <Text style={styles.counter}>{counter > 0 ? String(counter) : ""}</Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((phaseIndex + (phase.duration - counter) / phase.duration) / PHASES.length * 100)}%`,
                    backgroundColor: colors[0],
                  },
                ]}
              />
            </View>

            <Text style={styles.breatheHint}>{MID_SESSION_PHRASES[phraseIdx]}</Text>
          </>
        )}

        {step === "done" && (
          <View style={styles.doneContainer}>
            <View style={styles.doneOrb}>
              <LinearGradient colors={["#74C69D", "#85d7ad"]} style={StyleSheet.absoluteFill} />
              <Text style={styles.doneCheck}>✓</Text>
            </View>
            <Text style={styles.doneTitle}>أحسنت! 🌿</Text>
            <Text style={styles.doneText}>
              أكملت ٥ دورات من التنفس الواعي.{"\n"}جسدك يشكرك.
            </Text>

            <Text style={styles.moodQuestion}>كيف تشعر الآن؟</Text>
            <View style={styles.moodRow}>
              {MOOD_CHIPS.map(m => (
                <Pressable
                  key={m.en}
                  style={[
                    styles.moodChip,
                    selectedMood === m.en && { backgroundColor: m.color + "33", borderColor: m.color },
                  ]}
                  onPress={() => handleMoodSelect(m.en)}
                >
                  <Text style={[styles.moodChipText, selectedMood === m.en && { color: m.color }]}>
                    {m.word}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.doneBtn} onPress={() => onClose(true, selectedMood ?? undefined)}>
              <Text style={styles.doneBtnText}>العودة للرئيسية</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const ORB = 180;

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(4,23,16,0.97)",
  },
  closeBtn: {
    position: "absolute",
    top: 56,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  preContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  preIconWrap: {
    borderRadius: 40,
    overflow: "hidden",
    marginBottom: 8,
  },
  preIconGrad: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  preIconEmoji: { fontSize: 36 },
  preTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 42,
    color: "#e8f5ee",
    letterSpacing: -1,
  },
  preSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: "rgba(232,245,238,0.65)",
    textAlign: "center",
    lineHeight: 28,
  },
  preDetails: { gap: 8 },
  preDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  preDetailText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: "rgba(232,245,238,0.45)",
    textAlign: "center",
  },
  preStartBtn: {
    marginTop: 16,
    borderRadius: 999,
    overflow: "hidden",
    width: "100%",
  },
  preStartBtnGrad: {
    paddingVertical: 18,
    alignItems: "center",
  },
  preStartBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    color: "#041710",
  },

  prepContainer: {
    alignItems: "center",
    gap: 24,
  },
  prepText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 22,
    color: "rgba(232,245,238,0.75)",
    textAlign: "center",
  },
  countdownNumber: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 96,
    color: T.accent,
    letterSpacing: -4,
    lineHeight: 110,
  },

  cycleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  cycleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  cycleDotDone: { backgroundColor: T.accent },
  cycleDotActive: { backgroundColor: T.accent, width: 24 },
  cycleLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 48,
  },
  orbContainer: {
    width: ORB + 80,
    height: ORB + 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  orbGlow: {
    position: "absolute",
    width: ORB + 60,
    height: ORB + 60,
    borderRadius: (ORB + 60) / 2,
    backgroundColor: T.accent,
  },
  orbOuter: {
    position: "absolute",
    width: ORB + 30,
    height: ORB + 30,
    borderRadius: (ORB + 30) / 2,
    backgroundColor: "#9ECBFF",
  },
  orbMid: {
    width: ORB,
    height: ORB,
    borderRadius: ORB / 2,
    overflow: "hidden",
  },
  phaseLabels: {
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  phaseMain: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 38,
    color: "#e8f5ee",
    letterSpacing: -0.5,
  },
  phaseSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: "rgba(232,245,238,0.55)",
  },
  counter: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 52,
    color: "#74C69D",
    marginBottom: 32,
    minHeight: 64,
    letterSpacing: -2,
  },
  progressBar: {
    width: 200,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  breatheHint: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: "rgba(232,245,238,0.45)",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  doneContainer: {
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 32,
  },
  doneOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  doneCheck: { fontSize: 48, color: "#fff" },
  doneTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 28,
    color: "#e8f5ee",
  },
  doneText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: "rgba(232,245,238,0.6)",
    textAlign: "center",
    lineHeight: 26,
  },
  moodQuestion: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: "#e8f5ee",
    marginTop: 8,
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  moodChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  moodChipText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: "rgba(232,245,238,0.8)",
  },
  doneBtn: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  doneBtnText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: "rgba(232,245,238,0.6)",
  },
  });
}
