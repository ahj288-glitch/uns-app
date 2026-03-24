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

type Phase = "inhale" | "hold" | "exhale" | "rest";

interface PhaseConfig {
  key: Phase;
  labelAr: string;
  subAr: string;
  duration: number;
  orbScale: number;
  orbGlow: number;
}

const PHASES: PhaseConfig[] = [
  { key: "inhale",  labelAr: "شهيق",          subAr: "استنشق ببطء...",    duration: 4, orbScale: 1.28, orbGlow: 0.9 },
  { key: "hold",    labelAr: "احتفظ بالنفس",   subAr: "ثبّت نفسك...",     duration: 4, orbScale: 1.28, orbGlow: 1.0 },
  { key: "exhale",  labelAr: "زفير",           subAr: "أخرج ببطء...",     duration: 6, orbScale: 1.0,  orbGlow: 0.4 },
  { key: "rest",    labelAr: "استرح",          subAr: "",                 duration: 1, orbScale: 1.0,  orbGlow: 0.3 },
];

const TOTAL_CYCLES = 5;
const PHASE_COLORS: Record<Phase, [string, string]> = {
  inhale:  ["#74C69D", "#9ECBFF"],
  hold:    ["#9ECBFF", "#D4B896"],
  exhale:  ["#85d7ad", "#6B7FD7"],
  rest:    ["#74C69D", "#1B4332"],
};

interface Props {
  visible: boolean;
  onClose: (completed: boolean) => void;
}

export default function BreathingSession({ visible, onClose }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(PHASES[0].duration);
  const [cycle, setCycle] = useState(1);
  const [done, setDone] = useState(false);

  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow  = useRef(new Animated.Value(0.3)).current;
  const phaseAnim = useRef(new Animated.Value(0)).current;

  const phase = PHASES[phaseIndex];

  const haptic = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  useEffect(() => {
    if (!visible) return;
    setPhaseIndex(0);
    setCounter(PHASES[0].duration);
    setCycle(1);
    setDone(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || done) return;
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
      setCounter(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    const phaseTimer = setTimeout(() => {
      clearInterval(countInterval);
      phaseAnim.setValue(0);
      const nextIndex = phaseIndex + 1;
      if (nextIndex >= PHASES.length) {
        if (cycle >= TOTAL_CYCLES) {
          setDone(true);
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
      orbScale.stopAnimation();
      orbGlow.stopAnimation();
      phaseAnim.stopAnimation();
    };
  }, [phaseIndex, cycle, visible, done]);

  const colors = PHASE_COLORS[phase.key];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={() => onClose(done)}
    >
      <View style={styles.overlay}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

        <LinearGradient
          colors={["#0a2318", "#041710"]}
          style={StyleSheet.absoluteFill}
        />

        <Pressable style={styles.closeBtn} onPress={() => onClose(done)}>
          <Feather name="x" size={22} color="rgba(255,255,255,0.5)" />
        </Pressable>

        <View style={styles.cycleRow}>
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cycleDot,
                i < cycle - (done ? 0 : 1) && styles.cycleDotDone,
                i === cycle - 1 && !done && styles.cycleDotActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.cycleLabel}>
          {done ? "اكتملت الجلسة" : `دورة ${cycle} من ${TOTAL_CYCLES}`}
        </Text>

        {!done ? (
          <>
            <View style={styles.orbContainer}>
              <Animated.View
                style={[
                  styles.orbGlow,
                  { opacity: orbGlow, transform: [{ scale: orbScale }] },
                ]}
              />
              <Animated.View style={[styles.orbOuter, { opacity: Animated.multiply(orbGlow, 0.3), transform: [{ scale: orbScale }] }]} />
              <Animated.View style={[styles.orbMid, { transform: [{ scale: orbScale }] }]}>
                <LinearGradient
                  colors={colors}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>

            <Animated.View style={[styles.phaseLabels, { opacity: phaseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }]}>
              <Text style={styles.phaseMain}>{phase.labelAr}</Text>
              {phase.subAr ? <Text style={styles.phaseSub}>{phase.subAr}</Text> : null}
            </Animated.View>

            <Text style={styles.counter}>
              {counter > 0 ? String(counter) : ""}
            </Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(((phaseIndex) * 25 + (phase.duration - counter) / phase.duration * 25))}%`,
                    backgroundColor: colors[0],
                  },
                ]}
              />
            </View>

            <Text style={styles.breatheHint}>
              {phase.key === "inhale" ? "شهيق... شهيق... شهيق..." :
               phase.key === "hold"   ? "ثبّت... ثبّت... ثبّت..." :
               phase.key === "exhale" ? "زفير... زفير... زفير..." : ""}
            </Text>
          </>
        ) : (
          <View style={styles.doneContainer}>
            <View style={styles.doneOrb}>
              <LinearGradient
                colors={["#74C69D", "#85d7ad"]}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.doneCheck}>✓</Text>
            </View>
            <Text style={styles.doneTitle}>أحسنت! 🌿</Text>
            <Text style={styles.doneText}>
              أكملت ٥ دورات من التنفس الواعي.{"\n"}جسدك يشكرك.
            </Text>
            <Pressable style={styles.doneBtn} onPress={() => onClose(true)}>
              <LinearGradient colors={["#74C69D", "#4a9e72"]} style={styles.doneBtnGrad}>
                <Text style={styles.doneBtnText}>العودة للرئيسية</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const ORB = 180;

const styles = StyleSheet.create({
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
  cycleDotDone: {
    backgroundColor: "#74C69D",
  },
  cycleDotActive: {
    backgroundColor: "#74C69D",
    width: 24,
  },
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
    backgroundColor: "#74C69D",
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
    fontSize: 14,
    color: "rgba(232,245,238,0.3)",
    letterSpacing: 2,
  },
  doneContainer: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  doneOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  doneCheck: {
    fontSize: 48,
    color: "#fff",
  },
  doneTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 28,
    color: "#e8f5ee",
  },
  doneText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: "rgba(232,245,238,0.65)",
    textAlign: "center",
    lineHeight: 26,
  },
  doneBtn: { marginTop: 16, borderRadius: 24, overflow: "hidden" },
  doneBtnGrad: { paddingHorizontal: 36, paddingVertical: 14 },
  doneBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: "#041710",
  },
});
