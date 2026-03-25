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
import { router } from "expo-router";
import Colors, { useTokens } from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import EmptyState from "@/components/EmptyState";
import { Typography } from "@/constants/typography";
import { Spacing, Radius, Shadow } from "@/constants/layout";

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
  const T = useTokens();
  const styles = makeStyles(T);
  const maxH = 88;
  const fillH = Math.max(value * maxH, hasEntry ? 8 : 4);
  const color = hasEntry ? T.accent : T.surfaceContainerHigh;

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
  const T = useTokens();
  const styles = makeStyles(T);
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={styles.xpTrack}>
      <View style={[styles.xpFill, { width: `${Math.round(pct * 100)}%` as DimensionValue, backgroundColor: color }]} />
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, authFetch } = useSession();
  const { theme } = useThemeContext();
  const T = useTokens();
  const styles = makeStyles(T);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightsData | null>(null);
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const r = await authFetch(`${BASE}/api/insights?sessionId=${encodeURIComponent(sessionId)}`);
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
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      {theme.surfaceTint !== "transparent" && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.surfaceTint, pointerEvents: "none" }]} />
      )}
    <ScrollView
      style={[styles.scrollContainer]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { paddingTop: webTop + Spacing.lg }]}>
        <Text style={styles.screenTitle}>رؤاك الأسبوعية</Text>
        <Text style={styles.screenSubtitle}>تحليل مشاعرك وأنماطك</Text>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={T.primary} size="large" />
          <Text style={styles.loadingText}>جاري تحليل مشاعرك...</Text>
        </View>
      ) : !data || (!data.gamification && (!data.weeklyDays || data.weeklyDays.every(d => !d.hasEntry))) ? (
        <EmptyState
          icon="bar-chart-2"
          title="لا توجد إحصائيات بعد"
          subtitle="سجّل حالتك المزاجية لأول مرة لترى تقدمك هنا"
          ctaLabel="سجّل حالتك الآن"
          onCta={() => router.push("/(tabs)/mood")}
        />
      ) : (
        <>
          {g && (
            <Animated.View entering={FadeInDown.duration(500).delay(60)} style={styles.gamifCard}>
              <LinearGradient
                colors={[T.primaryContainer, T.surfaceContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gamifGrad}
              >
                <View style={styles.gamifRow}>
                  <View style={styles.gamifLeft}>
                    <View style={[styles.levelBadge, { backgroundColor: g.level.color + "33", borderColor: g.level.color + "55" }]}>
                      <Text style={[styles.levelText, { color: g.level.color }]}>{g.level.labelAr}</Text>
                    </View>
                    <Text style={styles.gamifXp}>{g.xp} <Text style={styles.gamifXpUnit}>نقاط</Text></Text>
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
              <View style={[styles.legendDot, { backgroundColor: T.accent }]} />
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
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.lg,
    alignItems: "flex-end",
  },
  screenTitle: {
    ...Typography.display,
    color: T.onSurface,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    ...Typography.body,
    color: T.muted,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  loadingBox: {
    alignItems: "center",
    paddingTop: 60,
    gap: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: T.muted,
    textAlign: "center",
  },
  gamifCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: "hidden",
    ...Shadow.card,
  },
  gamifGrad: {
    padding: 18,
    gap: 14,
  },
  gamifRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    alignItems: "flex-start",
  },
  gamifLeft: {
    flex: 1,
    gap: Spacing.sm,
    alignItems: "flex-end",
  },
  levelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.xl,
    borderWidth: 1,
  },
  levelText: {
    ...Typography.bodySmall,
    fontFamily: "Tajawal_700Bold",
  },
  gamifXp: {
    ...Typography.display,
    color: T.onSurface,
    letterSpacing: -1,
    textAlign: "right",
  },
  gamifXpUnit: {
    ...Typography.label,
    color: T.muted,
  },
  xpTrack: {
    width: "100%",
    height: 6,
    backgroundColor: T.surfaceContainerHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    borderRadius: 3,
  },
  gamifNextLevel: {
    ...Typography.caption,
    color: T.muted,
    textAlign: "right",
  },
  gamifStats: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statItem: {
    alignItems: "center",
    gap: 2,
    minWidth: 46,
  },
  statIcon: { fontSize: 16 },
  statValue: {
    ...Typography.h2,
    color: T.onSurface,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: T.muted,
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
    gap: Spacing.xs,
    backgroundColor: T.surfaceContainerHigh,
    borderRadius: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  winText: {
    ...Typography.caption,
    color: T.onSurface,
  },
  winPts: {
    ...Typography.label,
    fontSize: 10,
    color: T.accent,
  },
  chartCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: T.surfaceContainer,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  chartTitle: {
    ...Typography.h3,
    color: T.onSurface,
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
    gap: Spacing.xs,
  },
  barMoodLabel: {
    ...Typography.caption,
    fontSize: 8,
    color: T.muted,
    textAlign: "center",
  },
  barTrack: {
    width: "100%",
    backgroundColor: T.surfaceContainerHigh,
    borderRadius: 6,
    justifyContent: "flex-end",
  },
  barFill: {
    borderRadius: 6,
    minHeight: 4,
  },
  barDayLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: T.muted,
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
    ...Typography.label,
    color: T.muted,
  },
  section: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    color: T.onSurface,
    textAlign: "right",
    marginBottom: Spacing.xs,
  },
  insightsList: { gap: Spacing.sm },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: T.surfaceContainer,
    borderRadius: Radius.lg,
    padding: Spacing.cardPad,
    justifyContent: "flex-end",
  },
  insightIcon: { fontSize: 22 },
  insightText: {
    ...Typography.body,
    color: T.primary,
    flex: 1,
    textAlign: "right",
  },
  moodPatternCard: {
    backgroundColor: T.surfaceContainer,
    borderRadius: Radius.lg,
    padding: Spacing.cardPad,
    gap: 14,
  },
  moodPatternRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    justifyContent: "flex-end",
  },
  moodBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: T.surfaceContainerHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  moodBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  moodPatternLabel: {
    ...Typography.bodySmall,
    color: T.primary,
    width: 55,
    textAlign: "right",
  },
  moodPatternPct: {
    ...Typography.bodySmall,
    fontFamily: "Tajawal_700Bold",
    width: 36,
    textAlign: "right",
  },
  quoteCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: T.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "flex-end",
    gap: Spacing.md,
  },
  quoteIcon: {
    fontSize: 18,
    color: T.accent,
  },
  quoteText: {
    ...Typography.body,
    color: T.primary,
    textAlign: "right",
  },
  });
}
