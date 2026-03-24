import React, { useEffect, useState } from "react";
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
  track: { height: 6, borderRadius: 3, overflow: "hidden" as const },
  fill: { height: "100%" as const, borderRadius: 3 },
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
  const styles = makeStyles(T);
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
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 16,
      alignItems: "flex-end",
      gap: 12,
    },
    screenTitle: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 36,
      color: T.onSurface,
      textAlign: "right",
      letterSpacing: -0.5,
    },
    streakBadge: {
      backgroundColor: T.primaryContainer,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    streakBadgeText: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 13,
      color: T.accent,
    },
    stagesContainer: {
      paddingHorizontal: 16,
      gap: 12,
      marginBottom: 16,
    },
    stageCard: {
      flexDirection: "row",
      gap: 16,
      backgroundColor: T.surfaceContainer,
      borderRadius: 20,
      padding: 18,
      alignItems: "flex-start",
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
      gap: 4,
    },
    stageMeta: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 11,
      color: T.muted,
      textAlign: "right",
      letterSpacing: 0.5,
    },
    stageName: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 22,
      color: T.onSurface,
      textAlign: "right",
    },
    stageDesc: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 13,
      color: T.primary,
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
      fontFamily: "Tajawal_400Regular",
      fontSize: 11,
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
      marginHorizontal: 16,
      backgroundColor: T.surfaceContainer,
      borderRadius: 20,
      padding: 20,
      alignItems: "flex-end",
      gap: 10,
      marginBottom: 16,
    },
    quotePrefix: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 12,
      color: T.accent,
      letterSpacing: 0.5,
    },
    quoteText: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 15,
      color: T.primary,
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
      backgroundColor: T.surfaceContainerHigh,
      borderRadius: 20,
      padding: 20,
      alignItems: "flex-end",
      gap: 4,
    },
    metricValue: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 32,
      color: T.onSurface,
    },
    metricLabel: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 12,
      color: T.muted,
      textAlign: "right",
    },
    pathsCardWrapper: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: T.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 6,
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
      gap: 4,
    },
    pathsTitle: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 20,
      color: "#FFFFFF",
      textAlign: "right",
    },
    pathsSub: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 13,
      color: "rgba(255,255,255,0.8)",
      textAlign: "right",
    },
  });
}

