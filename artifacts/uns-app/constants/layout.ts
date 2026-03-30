export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screenH: 20,
  cardPad: 16,
  sectionGap: 24,
};

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

export const Shadow = {
  // Subtle depth for inline cards
  subtle: {
    shadowColor: "#071C12",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  // Standard card elevation
  card: {
    shadowColor: "#071C12",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 6,
  },
  // Floating elements (FABs, modals)
  float: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.20,
    shadowRadius: 30,
    elevation: 12,
  },
  // Sage glow — for orbs, active buttons
  glow: {
    shadowColor: "#74C69D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.40,
    shadowRadius: 24,
    elevation: 10,
  },
};
