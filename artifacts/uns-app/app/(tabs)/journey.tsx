import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors, { useTokens } from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import EmptyState from "@/components/EmptyState";
import { Typography } from "@/constants/typography";
import { Spacing, Radius, Shadow } from "@/constants/layout";
import { API_BASE } from "@/lib/api";

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

function ProgressBar({ current, max, trackColor, fillColor }: { current: number; max: number; trackColor: string; fillColor: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(current / max, 1), { duration: 1000 });
  }, [current, max]);
  const animStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as DimensionValue,
  }));
  return (
    <View style={[barStyles.track, { backgroundColor: trackColor }]}>
      <Animated.View style={[barStyles.fill, { backgroundColor: fillColor }, animStyle]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, overflow: "hidden" as const },
  fill: { height: "100%" as const, borderRadius: 4 },
});

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
  const T = useTokens();
  const styles = useMemo(() => makeStyles(T), [T]);
  const [data, setData] = useState<GamificationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!sessionId) {
      // No session yet — don't spin forever, fall through to empty state
      setLoading(false);
      return;
    }
    // Safety timeout: if the request hangs for >8s, stop the spinner
    const timeoutId = setTimeout(() => setLoading(false), 8000);
    fetch(`${API_BASE}/gamification/progress?sessionId=${sessionId}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => { clearTimeout(timeoutId); setLoading(false); });
    return () => clearTimeout(timeoutId);
  }, [sessionId]);

  if (loading) {
    return (
      <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={T.accent} size="large" />
      </LinearGradient>
    );
  }

  const xp = data?.xp ?? 0;
  const streakDays = data?.streakDays ?? 0;
  const currentKey = data?.currentLevel?.key ?? "awareness";
  const currentLevel = LEVELS.find(l => l.key === currentKey) ?? LEVELS[0];
  const progressPct = data?.currentLevel?.progressPercent ?? 0;

  const isEmpty = xp === 0 && (!data?.recentWins || data.recentWins.length === 0);

  if (isEmpty) {
    return (
      <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
        <EmptyState
          icon="map"
          title="رحلتك تبدأ الآن"
          subtitle="ابدأ بتسجيل مشاعرك لتبني مسيرتك نحو التوازن"
          ctaLabel="ابدأ الرحلة"
          onCta={() => router.push("/(tabs)/mood")}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
    <ScrollView
      style={[{ flex: 1, paddingTop: webTop }]}
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
              {isCurrent && (
                <LinearGradient
                  colors={["rgba(116,198,157,0.24)", "rgba(52,180,110,0.06)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              )}
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
        <LinearGradient
          colors={["rgba(116,198,157,0.13)", "rgba(212,184,150,0.07)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Text style={styles.quotePrefix}>✦ إلهام اليوم</Text>
        <Text style={styles.quoteText}>
          "السكينة لا تعني أن تكون في مكان يخلو من الضجيج والمشاكل، بل أن تكون في قلبها وتظل هادئاً في أعماقك."
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <LinearGradient
            colors={["rgba(116,198,157,0.10)", "rgba(116,198,157,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Text style={styles.metricValue}>{data?.totalCheckins ?? 0}</Text>
          <Text style={styles.metricLabel}>دقائق الوعي</Text>
        </View>
        <View style={styles.metricCard}>
          <LinearGradient
            colors={["rgba(116,198,157,0.10)", "rgba(116,198,157,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Text style={styles.metricValue}>{data?.totalLoopsCompleted ?? 0}</Text>
          <Text style={styles.metricLabel}>جلسات التنفس</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.pathsCardWrapper}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/programs");
          }}
        >
          <LinearGradient
            colors={["#3AAFA9", "#2C6B9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pathsCard}
          >
            <View style={styles.pathsIllustration}>
              <Text style={styles.pathsEmoji}>🌿</Text>
            </View>
            <View style={styles.pathsTextCol}>
              <Text style={styles.pathsTitle}>مسارات أُنْس</Text>
              <Text style={styles.pathsSub}>برامج موجّهة لرحلة التعافي والنمو</Text>
            </View>
            <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </ScrollView>
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: Spacing.xxl,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.lg,
      alignItems: "flex-end",
      gap: Spacing.md,
    },
    screenTitle: {
      ...Typography.display,
      color: T.onSurface,
      textAlign: "right",
    },
    streakBadge: {
      backgroundColor: T.primaryContainer,
      borderRadius: Radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    streakBadgeText: {
      ...Typography.bodySmall,
      color: T.accent,
    },
    stagesContainer: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    stageCard: {
      flexDirection: "row",
      gap: Spacing.lg,
      backgroundColor: T.surfaceContainer,
      borderRadius: Radius.lg,
      padding: 18,
      alignItems: "flex-start",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: T.ghostBorder,
      ...Shadow.subtle,
    },
    stageCardCurrent: {
      backgroundColor: T.primaryContainer,
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
      backgroundColor: T.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    stageIconCircleCurrent: {
      backgroundColor: T.accent,
    },
    stageIcon: { fontSize: 22 },
    stageRight: {
      flex: 1,
      alignItems: "flex-end",
      gap: Spacing.xs,
    },
    stageMeta: {
      ...Typography.caption,
      color: T.muted,
      textAlign: "right",
    },
    stageName: {
      ...Typography.h1,
      color: T.onSurface,
      textAlign: "right",
    },
    stageDesc: {
      ...Typography.bodySmall,
      color: T.primary,
      textAlign: "right",
      marginTop: 2,
    },
    stageProgress: {
      width: "100%",
      gap: 6,
      marginTop: Spacing.md,
      alignItems: "flex-end",
    },
    progressBarBg: {
      width: "100%",
      height: 4,
      backgroundColor: T.surfaceContainerHigh,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: T.accent,
      borderRadius: 2,
    },
    progressLabel: {
      ...Typography.caption,
      color: T.accent,
    },
    textDimmed: {
      color: T.muted,
    },
    textDimmedMore: {
      color: T.muted,
      opacity: 0.6,
    },
    quoteCard: {
      marginHorizontal: Spacing.lg,
      backgroundColor: T.surfaceContainer,
      borderRadius: Radius.lg,
      padding: Spacing.xl,
      alignItems: "flex-end",
      gap: Spacing.md,
      marginBottom: Spacing.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: T.ghostBorder,
    },
    quotePrefix: {
      ...Typography.label,
      color: T.accent,
    },
    quoteText: {
      ...Typography.body,
      color: T.primary,
      textAlign: "right",
    },
    metricsRow: {
      flexDirection: "row",
      gap: Spacing.md,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    metricCard: {
      flex: 1,
      backgroundColor: T.surfaceContainerHigh,
      borderRadius: Radius.lg,
      padding: Spacing.xl,
      alignItems: "flex-end",
      gap: Spacing.xs,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: T.ghostBorder,
    },
    metricValue: {
      ...Typography.display,
      color: T.onSurface,
    },
    metricLabel: {
      ...Typography.label,
      color: T.muted,
      textAlign: "right",
    },
    pathsCardWrapper: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      borderRadius: Radius.lg,
      overflow: "hidden",
      ...Shadow.card,
    },
    pathsCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      gap: 14,
    },
    pathsIllustration: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    pathsEmoji: { fontSize: 26 },
    pathsTextCol: {
      flex: 1,
      alignItems: "flex-end",
      gap: Spacing.xs,
    },
    pathsTitle: {
      ...Typography.h2,
      color: "#FFFFFF",
      textAlign: "right",
    },
    pathsSub: {
      ...Typography.bodySmall,
      color: "rgba(255,255,255,0.8)",
      textAlign: "right",
    },
  });
}
