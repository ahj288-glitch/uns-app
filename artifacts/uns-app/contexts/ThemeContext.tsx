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
  calm: {
    key: "calm",
    surfaceTint: "rgba(116,198,157,0.06)",
    surfaceOverlay: "rgba(116,198,157,0.04)",
    bubbleTint: "rgba(116,198,157,0.04)",
    orbColors: ["#74C69D", "#D4B896", "#9ECBFF"],
    homeGradient: ["#C8E8D8", "#D8EEE0", "#EAE4D8", "#F4EDE4"],
    blurIntensity: 40,
    animSpeedFactor: 1,
  },
  anxious: {
    key: "anxious",
    surfaceTint: "rgba(107,127,215,0.06)",
    surfaceOverlay: "rgba(107,127,215,0.04)",
    bubbleTint: "rgba(107,127,215,0.04)",
    orbColors: ["#6B9FD4", "#9ECBFF", "#74C69D"],
    homeGradient: ["#D0DFEE", "#D8E6F0", "#EAE4D8", "#F4EDE4"],
    blurIntensity: 45,
    animSpeedFactor: 1.2,
  },
  sad: {
    key: "sad",
    surfaceTint: "rgba(200,160,100,0.06)",
    surfaceOverlay: "rgba(200,160,100,0.04)",
    bubbleTint: "rgba(200,160,100,0.04)",
    orbColors: ["#D4A87C", "#E8C49A", "#74C69D"],
    homeGradient: ["#E6E4D8", "#EDE8DC", "#F0EAE0", "#F4EDE4"],
    blurIntensity: 50,
    animSpeedFactor: 0.8,
  },
  night: {
    key: "night",
    surfaceTint: "rgba(100,80,160,0.08)",
    surfaceOverlay: "rgba(80,60,140,0.06)",
    bubbleTint: "rgba(80,60,140,0.04)",
    orbColors: ["#8B7FD4", "#6B5FA8", "#4A3A8A"],
    homeGradient: ["#C8C8E0", "#D0C8D8", "#DDD0DC", "#F4EDE4"],
    blurIntensity: 60,
    animSpeedFactor: 0.7,
  },
  default: {
    key: "default",
    surfaceTint: "transparent",
    surfaceOverlay: "transparent",
    bubbleTint: "transparent",
    orbColors: ["#74C69D", "#D4B896", "#9ECBFF"],
    homeGradient: ["#E6F4EE", "#EEF5EC", "#F0EDE6", "#F4EDE4"],
    blurIntensity: 40,
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
