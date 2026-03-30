import { useColorScheme } from "react-native";

// Warm cream-sage light palette — feels like morning light through leaves
const LIGHT = {
  bg: ["#DCF0E6", "#F5EEE4"] as [string, string],
  surface: "#F8F4EF",
  surfaceContainer: "rgba(255,255,255,0.88)",
  surfaceContainerHigh: "rgba(255,255,255,0.68)",
  primaryContainer: "rgba(116,198,157,0.20)",
  primary: "#2D6B47",
  accent: "#74C69D",
  secondary: "#58AA7E",
  muted: "#7A9A8A",
  error: "#C0392B",
  onSurface: "#163A28",
  ghostBorder: "rgba(27,67,50,0.10)",
  ambientShadow: "rgba(27,67,50,0.06)",
  cardShadow: "rgba(27,67,50,0.12)",
  text: "#163A28",
  textSecondary: "#2D6B47",
  tabIconDefault: "#7A9A8A",
  tabIconSelected: "#74C69D",
  border: "rgba(27,67,50,0.10)",
  tint: "#74C69D",
};

// Deep forest night palette — warm, layered, never harsh
const DARK = {
  bg: ["#071C12", "#0D2A1B"] as [string, string],
  surface: "#071C12",
  surfaceContainer: "rgba(14,36,26,0.97)",
  surfaceContainerHigh: "rgba(22,50,36,0.94)",
  primaryContainer: "rgba(52,120,80,0.24)",
  primary: "#A8D8BB",
  accent: "#74C69D",
  secondary: "#85D7AD",
  muted: "#4D7A62",
  error: "#FFB4AB",
  onSurface: "#EAF6EE",
  ghostBorder: "rgba(116,198,157,0.16)",
  ambientShadow: "rgba(116,198,157,0.08)",
  cardShadow: "rgba(0,0,0,0.38)",
  text: "#EAF6EE",
  textSecondary: "#A8D8BB",
  tabIconDefault: "#4D7A62",
  tabIconSelected: "#74C69D",
  border: "rgba(116,198,157,0.16)",
  tint: "#74C69D",
};

export type ColorTokens = typeof LIGHT;

export const light = LIGHT;
export const dark = DARK;

export function useTokens(): ColorTokens {
  const scheme = useColorScheme();
  return scheme === "dark" ? DARK : LIGHT;
}

export default {
  ...LIGHT,
  dark: {
    text: DARK.onSurface,
    textSecondary: DARK.primary,
    background: DARK.surface,
    card: DARK.surfaceContainer,
    surface: DARK.surfaceContainerHigh,
    tint: DARK.accent,
    accent: DARK.secondary,
    border: DARK.border,
    tabIconDefault: DARK.tabIconDefault,
    tabIconSelected: DARK.tabIconSelected,
  },
  navyDeep: DARK.surface,
  navy: DARK.surface,
  navyCard: DARK.surfaceContainer,
  navySurface: DARK.surfaceContainerHigh,
  gold: DARK.accent,
  goldLight: DARK.secondary,
  terracotta: "#E57373",
  sage: DARK.secondary,
  nearWhite: DARK.onSurface,
};
