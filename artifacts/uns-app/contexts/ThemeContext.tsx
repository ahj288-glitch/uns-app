import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSession } from "./SessionContext";

export type MoodThemeKey = "calm" | "anxious" | "sad" | "night" | "default";

export interface MoodTheme {
  key: MoodThemeKey;
  surfaceTint: string;
  surfaceOverlay: string;
  orbColors: [string, string, string];
  homeGradient: [string, string, string, string];
  blurIntensity: number;
  animSpeedFactor: number;
  bubbleTint: string;
}

const THEMES: Record<MoodThemeKey, MoodTheme> = {
  // 🌿 Calm — sage morning light, fresh and grounded
  calm: {
    key: "calm",
    surfaceTint: "rgba(116,198,157,0.09)",
    surfaceOverlay: "rgba(116,198,157,0.05)",
    bubbleTint: "rgba(116,198,157,0.07)",
    orbColors: ["#74C69D", "#A0DEC0", "#B8D8FF"],
    homeGradient: ["#9ACFB2", "#B8DECE", "#DDEADB", "#F4EFE6"],
    blurIntensity: 50,
    animSpeedFactor: 1,
  },
  // 💙 Anxious — soft blue, cooling and spacious
  anxious: {
    key: "anxious",
    surfaceTint: "rgba(107,159,212,0.09)",
    surfaceOverlay: "rgba(107,159,212,0.05)",
    bubbleTint: "rgba(107,159,212,0.06)",
    orbColors: ["#6B9FD4", "#8EC0E8", "#74C69D"],
    homeGradient: ["#9ABCD8", "#B4CEDF", "#D8DEE8", "#F4EFE6"],
    blurIntensity: 52,
    animSpeedFactor: 1.2,
  },
  // 🌅 Sad — warm amber, gentle and embracing
  sad: {
    key: "sad",
    surfaceTint: "rgba(210,168,110,0.09)",
    surfaceOverlay: "rgba(210,168,110,0.05)",
    bubbleTint: "rgba(210,168,110,0.06)",
    orbColors: ["#D4A87C", "#E8C49A", "#8EC8B4"],
    homeGradient: ["#CCBCA0", "#DACCB0", "#EAE0D2", "#F4EFE6"],
    blurIntensity: 55,
    animSpeedFactor: 0.8,
  },
  // 🌙 Night — deep violet, mystical and restful
  night: {
    key: "night",
    surfaceTint: "rgba(120,100,200,0.11)",
    surfaceOverlay: "rgba(80,60,150,0.07)",
    bubbleTint: "rgba(100,80,180,0.07)",
    orbColors: ["#9B8FE4", "#7B6FC8", "#5A4FB0"],
    homeGradient: ["#A4A0C8", "#B8B0D4", "#CEC8DC", "#F0ECF8"],
    blurIntensity: 65,
    animSpeedFactor: 0.7,
  },
  // ✨ Default — balanced sage-cream, open and welcoming
  default: {
    key: "default",
    surfaceTint: "transparent",
    surfaceOverlay: "transparent",
    bubbleTint: "transparent",
    orbColors: ["#74C69D", "#C4B89A", "#9ECBFF"],
    homeGradient: ["#AACED8", "#C4DEDC", "#E0EAE0", "#F4EFE6"],
    blurIntensity: 42,
    animSpeedFactor: 1,
  },
};

function deriveMoodThemeKey(lastMoodWord: string | null, hour: number): MoodThemeKey {
  if (hour >= 21 || hour < 6) return "night";
  if (!lastMoodWord) return "default";
  if (lastMoodWord === "stressed" || lastMoodWord === "anxious") return "anxious";
  if (lastMoodWord === "sad") return "sad";
  if (lastMoodWord === "calm" || lastMoodWord === "peaceful" || lastMoodWord === "happy") return "calm";
  return "default";
}

interface ThemeContextType {
  theme: MoodTheme;
  themeKey: MoodThemeKey;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.default,
  themeKey: "default",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { lastMoodWord } = useSession();
  const [hour, setHour] = useState(() => new Date().getHours());

  const targetKey = deriveMoodThemeKey(lastMoodWord, hour);

  const [activeTheme, setActiveTheme] = useState<MoodTheme>(() => THEMES[targetKey]);
  const [activeKey, setActiveKey] = useState<MoodThemeKey>(targetKey);

  const crossFadeAnim = useRef(new Animated.Value(1)).current;
  const prevKeyRef = useRef<MoodThemeKey>(targetKey);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (prevKeyRef.current === targetKey) return;
    if (isAnimatingRef.current) {
      prevKeyRef.current = targetKey;
      setActiveTheme(THEMES[targetKey]);
      setActiveKey(targetKey);
      return;
    }

    prevKeyRef.current = targetKey;
    isAnimatingRef.current = true;

    Animated.timing(crossFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setActiveTheme(THEMES[targetKey]);
      setActiveKey(targetKey);

      Animated.timing(crossFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        isAnimatingRef.current = false;
      });
    });
  }, [targetKey, crossFadeAnim]);

  const overlayColor = activeTheme.surfaceTint;
  const hasOverlay = overlayColor !== "transparent";

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, themeKey: activeKey }}>
      <Animated.View style={[styles.container, { opacity: crossFadeAnim }]}>
        {children}
      </Animated.View>
      {hasOverlay && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: overlayColor,
              opacity: crossFadeAnim,
              pointerEvents: "none",
            },
          ]}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export { THEMES };
