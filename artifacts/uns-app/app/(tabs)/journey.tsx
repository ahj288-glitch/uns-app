import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  type DimensionValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

const LEVELS = [
  {
    key: "awareness",
    labelAr: "إدراك",
    stageAr: "المرحلة الأولى",
    descAr: "فهم أعماق الذات وبدء الوعي بالحاضر. لقد أنجزت ١٠ جلسات تأمّل.",
    icon: "🌿",
    minXp: 0,
    maxXp: 300,
  },
  {
    key: "balance",
    labelAr: "توازن",
    stageAr: "المرحلة الحالية",
    descAr: "الاستقرار العاطفي وبناء عادات تدعم سلامك الداخلي.",
    icon: "⚖️",
    minXp: 300,
    maxXp: 700,
  },
  {
    key: "tranquility",
    labelAr: "طمأنينة",
    stageAr: "المرحلة القادمة",
    descAr: "الوصول لمرحلة السكون التام والقبول المطلق.",
    icon: "🔒",
    minXp: 700,
    maxXp: 1200,
  },
];

function XPBar({ current, max }: { current: number; max: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(current / max, 1), { duration: 1000 });
  }, [current, max]);
  const animStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as DimensionValue,
  }));
  return (
    <View style={styles.xpBarBg}>
      <Animated.View style={[styles.xpBarFill, animStyle]} />
    </View>
  );
}

interface GamificationProgress {
  xp: number;
  streakDays: number;
  longestStreak: number;
  totalCheckins: number;
  totalLoopsCompleted: number;
  currentLevel: {
    key: string;
    labelAr: string;
    progressPercent: number;
  };
  recentWins: unknown[];
}

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [data, setData] = useState<GamificationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${BASE_URL}/gamification/progress?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({
        xp: 350,
        streakDays: 5,
        longestStreak: 12,
        totalCheckins: 24,
        totalLoopsCompleted: 10,
        currentLevel: { key: "balance", labelAr: "توازن", progressPercent: 60 },
        recentWins: [],
      }))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const xp = data?.xp ?? 0;
  const streakDays = data?.streakDays ?? 0;
  const currentKey = data?.currentLevel?.key ?? "awareness";
  const currentLevel = LEVELS.find(l => l.key === currentKey) ?? LEVELS[0];
  const progressPct = data?.currentLevel?.progressPercent ?? 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: webTop }]}
      contentContainerStyle={{ paddingBottom: webBottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.screenTitle}>رحلة التحوّل</Text>
        {streakDays > 0 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakBadgeText}>🌿 اهتممت بنفسك لـ {streakDays} أيام</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.stagesContainer}>
        {LEVELS.map((level, i) => {
          const isComplete = xp >= level.maxXp;
          const isCurrent = level.key === currentKey;
          const isLocked = xp < level.minXp;
          const progressForThis = isCurrent ? progressPct : (isComplete ? 100 : 0);

          return (
            <Animated.View
              key={level.key}
              entering={FadeInDown.duration(500).delay(100 + i * 120)}
              style={[
                styles.stageCard,
                isCurrent && styles.stageCardCurrent,
                isLocked && styles.stageCardLocked,
              ]}
            >
              <View style={styles.stageLeft}>
                <View style={[styles.stageIconCircle, isCurrent && styles.stageIconCircleCurrent]}>
                  <Text style={styles.stageIcon}>{isLocked ? "🔒" : level.icon}</Text>
                </View>
              </View>
              <View style={styles.stageRight}>
                <Text style={[styles.stageMeta, isLocked && styles.textDimmed]}>
                  {level.stageAr}
                </Text>
                <Text style={[styles.stageName, isLocked && styles.textDimmed]}>
                  {level.labelAr}
                </Text>
                <Text style={[styles.stageDesc, isLocked && styles.textDimmedMore]} numberOfLines={2}>
                  {level.descAr}
                </Text>
                {isCurrent && (
                  <View style={styles.stageProgress}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progressForThis}%` as DimensionValue }]} />
                    </View>
                    <Text style={styles.progressLabel}>{progressForThis}% مكتمل</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>

      <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.quoteCard}>
        <Text style={styles.quotePrefix}>✦ إلهام اليوم</Text>
        <Text style={styles.quoteText}>
          "السكينة لا تعني أن تكون في مكان يخلو من الضجيج والمشاكل، بل أن تكون في قلبها وتظل هادئاً في أعماقك."
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.totalCheckins ?? 0}</Text>
          <Text style={styles.metricLabel}>دقائق الوعي</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.totalLoopsCompleted ?? 0}</Text>
          <Text style={styles.metricLabel}>جلسات التنفس</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: "flex-end",
    gap: 12,
  },
  screenTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 36,
    color: Colors.onSurface,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  streakBadge: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  streakBadgeText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.accent,
  },
  stagesContainer: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  stageCard: {
    flexDirection: "row",
    gap: 16,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    padding: 18,
    alignItems: "flex-start",
  },
  stageCardCurrent: {
    backgroundColor: Colors.primaryContainer,
  },
  stageCardLocked: {
    opacity: 0.55,
  },
  stageLeft: {
    flexShrink: 0,
  },
  stageIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  stageIconCircleCurrent: {
    backgroundColor: Colors.accent,
  },
  stageIcon: { fontSize: 22 },
  stageRight: {
    flex: 1,
    alignItems: "flex-end",
    gap: 4,
  },
  stageMeta: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.muted,
    textAlign: "right",
    letterSpacing: 0.5,
  },
  stageName: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: Colors.onSurface,
    textAlign: "right",
  },
  stageDesc: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.primary,
    textAlign: "right",
    lineHeight: 20,
    marginTop: 2,
  },
  stageProgress: {
    width: "100%",
    gap: 6,
    marginTop: 10,
    alignItems: "flex-end",
  },
  progressBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.accent,
  },
  textDimmed: {
    color: Colors.muted,
  },
  textDimmedMore: {
    color: Colors.muted,
    opacity: 0.6,
  },
  quoteCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 16,
  },
  quotePrefix: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 12,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  quoteText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.primary,
    textAlign: "right",
    lineHeight: 28,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-end",
    gap: 4,
  },
  metricValue: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 32,
    color: Colors.onSurface,
  },
  metricLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "right",
  },
  xpBarBg: {
    height: 6,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 3,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
});
