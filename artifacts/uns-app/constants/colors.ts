import { useColorScheme } from "react-native";

const LIGHT = {
  bg: ["#E6F4EE", "#F4EDE4"] as [string, string],
  surface: "#F2EDE4",
  surfaceContainer: "rgba(255,255,255,0.75)",
  surfaceContainerHigh: "rgba(255,255,255,0.55)",
  primaryContainer: "rgba(116,198,157,0.15)",
  primary: "#3B7A57",
  accent: "#74C69D",
  secondary: "#5AAC80",
  muted: "#7A9A8A",
  error: "#C0392B",
  onSurface: "#1B4332",
  ghostBorder: "rgba(27,67,50,0.12)",
  ambientShadow: "rgba(27,67,50,0.08)",
  cardShadow: "rgba(27,67,50,0.08)",
  text: "#1B4332",
  textSecondary: "#3B7A57",
  tabIconDefault: "#7A9A8A",
  tabIconSelected: "#74C69D",
  border: "rgba(27,67,50,0.12)",
  tint: "#74C69D",
};

const DARK = {
  bg: ["#041710", "#0a2318"] as [string, string],
  surface: "#041710",
  surfaceContainer: "#10231c",
  surfaceContainerHigh: "#1a2e26",
  primaryContainer: "#1B4332",
  primary: "#a5d0b9",
  accent: "#74C69D",
  secondary: "#85d7ad",
  muted: "#4a7a5e",
  error: "#ffb4ab",
  onSurface: "#e8f5ee",
  ghostBorder: "rgba(116,198,157,0.15)",
  ambientShadow: "rgba(255,255,255,0.06)",
  cardShadow: "rgba(0,0,0,0.25)",
  text: "#e8f5ee",
  textSecondary: "#a5d0b9",
  tabIconDefault: "#4a7a5e",
  tabIconSelected: "#74C69D",
  border: "rgba(116,198,157,0.15)",
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
