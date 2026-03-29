// Arabic-first typography system.
// Rules enforced here:
//   letterSpacing is NEVER set — it breaks Arabic ligatures.
//   lineHeight ratios are ≥ 1.7 to clear diacritics (أُ، ِ، ً etc.)
//   writingDirection and textAlign are applied at the component level,
//   not here, because StyleSheet doesn't carry direction to native.

export const Typography = {
  // 80px hero — used on the splash brand mark only
  hero:      { fontFamily: "Tajawal_700Bold",         fontSize: 80, lineHeight: 120 },
  // Section/screen display titles
  display:   { fontFamily: "Tajawal_700Bold",         fontSize: 32, lineHeight: 56 },
  h1:        { fontFamily: "Tajawal_700Bold",         fontSize: 26, lineHeight: 46 },
  h2:        { fontFamily: "Tajawal_700Bold",         fontSize: 20, lineHeight: 36 },
  h3:        { fontFamily: "Tajawal_700Bold",         fontSize: 17, lineHeight: 30 },
  body:      { fontFamily: "Tajawal_400Regular",      fontSize: 15, lineHeight: 28 },
  bodySmall: { fontFamily: "Tajawal_400Regular",      fontSize: 13, lineHeight: 24 },
  caption:   { fontFamily: "Tajawal_400Regular",      fontSize: 11, lineHeight: 20 },
  label:     { fontFamily: "Tajawal_500Medium",       fontSize: 12, lineHeight: 22 },
  // Numeric-only display (streaks, XP counts) — BeVietnamPro aligns numbers well
  numeric:   { fontFamily: "BeVietnamPro_700Bold",    fontSize: 32, lineHeight: 40 },
  numericSm: { fontFamily: "BeVietnamPro_500Medium",  fontSize: 14, lineHeight: 22 },
};
