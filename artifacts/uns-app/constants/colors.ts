const SURFACE = "#041710";
const SURFACE_CONTAINER = "#10231c";
const SURFACE_CONTAINER_HIGH = "#1a2e26";
const PRIMARY_CONTAINER = "#1B4332";
const PRIMARY = "#a5d0b9";
const ACCENT = "#74C69D";
const SECONDARY = "#85d7ad";
const MUTED = "#4a7a5e";
const ERROR = "#ffb4ab";
const ON_SURFACE = "#e8f5ee";

export default {
  surface: SURFACE,
  surfaceContainer: SURFACE_CONTAINER,
  surfaceContainerHigh: SURFACE_CONTAINER_HIGH,
  primaryContainer: PRIMARY_CONTAINER,
  primary: PRIMARY,
  accent: ACCENT,
  secondary: SECONDARY,
  muted: MUTED,
  error: ERROR,
  onSurface: ON_SURFACE,

  ghostBorder: "rgba(116,198,157,0.15)",
  ambientShadow: "rgba(255,255,255,0.06)",

  dark: {
    text: ON_SURFACE,
    textSecondary: PRIMARY,
    background: SURFACE,
    card: SURFACE_CONTAINER,
    surface: SURFACE_CONTAINER_HIGH,
    tint: ACCENT,
    accent: SECONDARY,
    border: "rgba(116,198,157,0.15)",
    tabIconDefault: MUTED,
    tabIconSelected: ACCENT,
  },

  navyDeep: SURFACE,
  navy: SURFACE,
  navyCard: SURFACE_CONTAINER,
  navySurface: SURFACE_CONTAINER_HIGH,
  gold: ACCENT,
  goldLight: SECONDARY,
  terracotta: "#E57373",
  sage: SECONDARY,
  nearWhite: ON_SURFACE,
};
