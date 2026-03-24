import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import { useThemeContext } from "@/contexts/ThemeContext";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface WeeklyDay {
  day: string;
  value: number;
  mood: string;
  moodAr: string;
  hasEntry: boolean;
}

interface MoodEntry {
  mood: string;
  moodArabic: string;
  count: number;
  color: string;
}

interface GamificationData {
  xp: number;
  level: { key: string; labelAr: string; color: string; xpProgress: number; maxXp: number; minXp: number };
  nextLevel: { labelAr: string };
  totalCheckins: number;
  longestStreak: number;
  totalLoopsCompleted: number;
}

interface RecentWin {
  id: string;
  winType: string;
  labelAr: string;
  points: number;
  earnedAt: string;
}

interface InsightsData {
  weeklyPattern: string;
  message: string;
  streakDays: number;
  topMoods: MoodEntry[];
  weeklyDays: WeeklyDay[];
  gamification: GamificationData;
  recentWins: RecentWin[];
}

function MiniBar({ value, day, moodAr, hasEntry }: { value: number; day: string; moodAr: string; hasEntry: boolean }) {
  const maxH = 88;
  const fillH = Math.max(value * maxH, hasEntry ? 8 : 4);
  const color = hasEntry ? Colors.accent : Colors.surfaceContainerHigh;

  return (
    <View style={styles.barItem}>
      <Text style={styles.barMoodLabel}>{hasEntry ? moodAr : ""}</Text>
      <View style={[styles.barTrack, { height: maxH }]}>
        <View style={[styles.barFill, { height: fillH, backgroundColor: color }]} />
      </View>
      <Text style={styles.barDayLabel}>{day}</Text>
    </View>
  );
}

function XpBar({ progress, color }: { progress: number; color: string }) {
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={styles.xpTrack}>
      <View style={[styles.xpFill, { width: `${Math.round(pct * 100)}%` as DimensionValue, backgroundColor: color }]} />
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const { theme } = useThemeContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightsData | null>(null);
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/api/insights?sessionId=${encodeURIComponent(sessionId)}`);
      if (!r.ok) throw new Error("fetch failed");
      const d = await r.json();
      setData(d);
    } catch (e) {
      console.error("Insights fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  const g = data?.gamification;
  const streak = data?.streakDays ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }]}>
      {theme.surfaceTint !== "transparent" && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceTint, pointerEvents: "none" }]} />
      )}
    <ScrollView
      style={[styles.scrollContainer]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { paddingTop: webTop + 16 }]}>
        <Text style={styles.screenTitle}>رؤاك الأسبوعية</Text>
        <Text style={styles.screenSubtitle}>تحليل مشاعرك وأنماطك</Text>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>جاري تحليل مشاعرك...</Text>
        </View>
      ) : (
        <>
          {g && (
            <Animated.View entering={FadeInDown.duration(500).delay(60)} style={styles.gamifCard}>
              <LinearGradient
                colors={[Colors.primaryContainer, Colors.surfaceContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gamifGrad}
              >
                <View style={styles.gamifRow}>
                  <View style={styles.gamifLeft}>
                    <View style={[styles.levelBadge, { backgroundColor: g.level.color + "33", borderColor: g.level.color + "55" }]}>
                      <Text style={[styles.levelText, { color: g.level.color }]}>{g.level.labelAr}</Text>
                    </View>
                    <Text style={styles.gamifXp}>{g.xp} <Text style={styles.gamifXpUnit}>XP</Text></Text>
                    <XpBar progress={g.level.xpProgress} color={g.level.color} />
                    <Text style={styles.gamifNextLevel}>
                      المرحلة التالية: {g.nextLevel.labelAr}
                    </Text>
                  </View>

                  <View style={styles.gamifStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{streak}</Text>
                      <Text style={styles.statLabel}>يوم متواصل</Text>
                      <Text style={styles.statIcon}>🔥</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{g.totalCheckins}</Text>
                      <Text style={styles.statLabel}>تسجيل كلي</Text>
                      <Text style={styles.statIcon}>✦</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{g.longestStreak}</Text>
                      <Text style={styles.statLabel}>أطول سلسلة</Text>
                      <Text style={styles.statIcon}>🌿</Text>
                    </View>
                  </View>
                </View>

                {data?.recentWins && data.recentWins.length > 0 && (
                  <View style={styles.winsRow}>
                    {data.recentWins.slice(0, 3).map(w => (
                      <View key={w.id} style={styles.winChip}>
                        <Text style={styles.winText}>{w.labelAr}</Text>
                        <Text style={styles.winPts}>+{w.points}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.duration(500).delay(120)} style={styles.chartCard}>
            <Text style={styles.chartTitle}>مستوى الهدوء — آخر ٧ أيام</Text>
            <View style={styles.barChart}>
              {(data?.weeklyDays ?? []).map((d, i) => (
                <MiniBar key={i} value={d.value} day={d.day} moodAr={d.moodAr} hasEntry={d.hasEntry} />
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
              <Text style={styles.legendText}>مستوى الطمأنينة</Text>
            </View>
          </Animated.View>

          {(data?.topMoods?.length ?? 0) > 0 && (
            <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>نمط المشاعر</Text>
              <View style={styles.moodPatternCard}>
                {data!.topMoods.map(m => {
                  const total = data!.topMoods.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? m.count / total : 0;
                  return (
                    <View key={m.mood} style={styles.moodPatternRow}>
                      <View style={styles.moodBarTrack}>
                        <View style={[styles.moodBarFill, { width: `${Math.round(pct * 100)}%` as DimensionValue, backgroundColor: m.color }]} />
                      </View>
                      <Text style={styles.moodPatternLabel}>{m.moodArabic}</Text>
                      <Text style={[styles.moodPatternPct, { color: m.color }]}>
                        {Math.round(pct * 100)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>أبرز الأفكار</Text>
            <View style={styles.insightsList}>
              {[
                data?.weeklyPattern && { icon: "📊", text: data.weeklyPattern },
                data?.message && { icon: "💚", text: data.message },
                streak >= 3 && { icon: "🔥", text: `${streak} أيام متتالية — استمر في هذا الاتساق الجميل` },
              ].filter(Boolean).map((ins: any, i: number) => (
                <Animated.View
                  key={i}
                  entering={FadeInDown.duration(400).delay(360 + i * 80)}
                  style={styles.insightCard}
                >
                  <Text style={styles.insightIcon}>{ins.icon}</Text>
                  <Text style={styles.insightText}>{ins.text}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.quoteCard}>
            <Text style={styles.quoteIcon}>✦</Text>
            <Text style={styles.quoteText}>
              "الصحة النفسية ليست وجهة — إنها رحلة يومية من الرعاية الذاتية."
            </Text>
          </Animated.View>
        </>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "flex-end",
  },
  screenTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 32,
    color: Colors.onSurface,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    marginTop: 4,
    textAlign: "right",
  },
  loadingBox: {
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
  },
  loadingText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
  },
  gamifCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  gamifGrad: {
    padding: 18,
    gap: 14,
  },
  gamifRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
  },
  gamifLeft: {
    flex: 1,
    gap: 8,
    alignItems: "flex-end",
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
  },
  gamifXp: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -1,
    lineHeight: 38,
    textAlign: "right",
  },
  gamifXpUnit: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 14,
    color: Colors.muted,
  },
  xpTrack: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 3,
  },
  gamifNextLevel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.muted,
    textAlign: "right",
  },
  gamifStats: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    alignItems: "center",
    gap: 2,
    minWidth: 46,
  },
  statIcon: { fontSize: 16 },
  statValue: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    color: Colors.onSurface,
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 9,
    color: Colors.muted,
    textAlign: "center",
  },
  winsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-end",
  },
  winChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  winText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.onSurface,
  },
  winPts: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 10,
    color: Colors.accent,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  chartTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 15,
    color: Colors.onSurface,
    textAlign: "right",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barMoodLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 8,
    color: Colors.muted,
    textAlign: "center",
  },
  barTrack: {
    width: "100%",
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 6,
    justifyContent: "flex-end",
  },
  barFill: {
    borderRadius: 6,
    minHeight: 4,
  },
  barDayLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 9,
    color: Colors.muted,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "flex-end",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: Colors.onSurface,
    textAlign: "right",
    marginBottom: 4,
  },
  insightsList: { gap: 8 },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    justifyContent: "flex-end",
  },
  insightIcon: { fontSize: 22 },
  insightText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
    textAlign: "right",
    lineHeight: 22,
  },
  moodPatternCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  moodPatternRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-end",
  },
  moodBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  moodBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  moodPatternLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.primary,
    width: 55,
    textAlign: "right",
  },
  moodPatternPct: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    width: 36,
    textAlign: "right",
  },
  quoteCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-end",
    gap: 10,
  },
  quoteIcon: {
    fontSize: 18,
    color: Colors.accent,
  },
  quoteText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.primary,
    textAlign: "right",
    lineHeight: 26,
  },
});
