import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

const { width } = Dimensions.get("window");

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

const LEVELS = [
  {
    key: "awareness",
    labelAr: "الوعي",
    descAr: "أنت تبدأ رحلة الاكتشاف. كل خطوة صغيرة تُحدث فرقاً.",
    icon: "🌱",
    color: "#6B7FD7",
    minXp: 0,
    maxXp: 300,
  },
  {
    key: "balance",
    labelAr: "التوازن",
    descAr: "أنت تجد مركزك. الأعاصير تمر والجذور تثبت.",
    icon: "⚖️",
    color: "#C9A84C",
    minXp: 300,
    maxXp: 700,
  },
  {
    key: "tranquility",
    labelAr: "الطمأنينة",
    descAr: "أنت تحيا في الحاضر. السلام ليس غياب المشكلات بل القوة في مواجهتها.",
    icon: "🌙",
    color: "#10B981",
    minXp: 700,
    maxXp: 1200,
  },
];

const MILESTONES = [
  { xp: 50, labelAr: "أول تسجيل مشاعر ✨", icon: "✨" },
  { xp: 100, labelAr: "٣ أيام من الرعاية 🔥", icon: "🔥" },
  { xp: 200, labelAr: "اكتشفت نمطك الأول 💡", icon: "💡" },
  { xp: 300, labelAr: "انتقلت للتوازن ⚖️", icon: "⚖️" },
  { xp: 500, labelAr: "أسبوع كامل من الاهتمام 💎", icon: "💎" },
  { xp: 700, labelAr: "وصلت للطمأنينة 🌙", icon: "🌙" },
];

function XPBar({ current, max, color }: { current: number; max: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(current / max, 1), { duration: 1000 });
  }, [current, max]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <View style={styles.xpBarBg}>
      <Animated.View style={[styles.xpBarFill, { backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`${BASE_URL}/gamification/progress?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({
        xp: 0, streakDays: 0, longestStreak: 0, totalCheckins: 0, totalLoopsCompleted: 0,
        currentLevel: { key: "awareness", labelAr: "الوعي", color: "#6B7FD7", progressPercent: 0 },
        recentWins: [],
      }))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    );
  }

  const currentLevelData = LEVELS.find(l => l.key === data?.currentLevel?.key) ?? LEVELS[0];
  const nextLevelData = LEVELS.find(l => l.minXp > (data?.xp ?? 0));
  const progressPct = data?.currentLevel?.progressPercent ?? 0;
  const xp = data?.xp ?? 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.screenTitle}>رحلتك</Text>
        <Text style={styles.screenSubtitle}>خريطة نموّك العاطفي</Text>
      </Animated.View>

      {/* Level Card */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.levelCard, { borderColor: currentLevelData.color + "40" }]}>
        <View style={styles.levelCardTop}>
          <View style={[styles.levelIconCircle, { backgroundColor: currentLevelData.color + "20" }]}>
            <Text style={styles.levelIcon}>{currentLevelData.icon}</Text>
          </View>
          <View style={styles.levelTextGroup}>
            <Text style={styles.levelTag}>المرحلة الحالية</Text>
            <Text style={[styles.levelName, { color: currentLevelData.color }]}>
              {currentLevelData.labelAr}
            </Text>
            <Text style={styles.levelDesc}>{currentLevelData.descAr}</Text>
          </View>
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>{xp} نقطة</Text>
          {nextLevelData && (
            <Text style={styles.xpNext}>
              {nextLevelData.minXp - xp} نقطة للمستوى التالي
            </Text>
          )}
        </View>
        <XPBar
          current={xp - currentLevelData.minXp}
          max={currentLevelData.maxXp - currentLevelData.minXp}
          color={currentLevelData.color}
        />
      </Animated.View>

      {/* Streak Card */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.streakDays ?? 0}</Text>
          <Text style={styles.statLabel}>سلسلة{"\n"}الأيام 🔥</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.totalCheckins ?? 0}</Text>
          <Text style={styles.statLabel}>تسجيل{"\n"}مشاعر ✨</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.totalLoopsCompleted ?? 0}</Text>
          <Text style={styles.statLabel}>دورات{"\n"}مكتملة 💫</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{data?.longestStreak ?? 0}</Text>
          <Text style={styles.statLabel}>أطول{"\n"}سلسلة 💎</Text>
        </View>
      </Animated.View>

      {/* Level Journey */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>خريطة المراحل</Text>
        <View style={styles.journeyContainer}>
          {LEVELS.map((level, i) => {
            const isComplete = xp >= level.maxXp;
            const isCurrent = level.key === currentLevelData.key;
            const isLocked = xp < level.minXp;
            return (
              <View key={level.key} style={styles.journeyStep}>
                <View style={styles.journeyLine}>
                  {i > 0 && <View style={[styles.journeyConnector, isComplete && styles.journeyConnectorDone]} />}
                  <View style={[
                    styles.journeyDot,
                    { borderColor: level.color },
                    isCurrent && { backgroundColor: level.color },
                    isLocked && styles.journeyDotLocked,
                  ]}>
                    {isLocked
                      ? <Feather name="lock" size={14} color="rgba(255,255,255,0.3)" />
                      : <Text style={styles.journeyDotIcon}>{level.icon}</Text>
                    }
                  </View>
                </View>
                <View style={styles.journeyContent}>
                  <Text style={[styles.journeyLabel, { color: isLocked ? "rgba(255,255,255,0.3)" : level.color }]}>
                    {level.labelAr}
                  </Text>
                  <Text style={[styles.journeyDesc, isLocked && { color: "rgba(255,255,255,0.2)" }]}>
                    {level.descAr}
                  </Text>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: level.color + "20", borderColor: level.color + "40" }]}>
                      <Text style={[styles.currentBadgeText, { color: level.color }]}>أنت هنا</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Recent Wins */}
      {data?.recentWins?.length > 0 && (
        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>إنجازاتك الأخيرة</Text>
          <View style={styles.winsList}>
            {data.recentWins.slice(0, 5).map((win: any) => (
              <View key={win.id} style={styles.winCard}>
                <View style={styles.winLeft}>
                  <Text style={styles.winLabel}>{win.labelAr}</Text>
                  <Text style={styles.winDate}>
                    {new Date(win.earnedAt).toLocaleDateString("ar-SA", { month: "long", day: "numeric" })}
                  </Text>
                </View>
                <View style={styles.winPoints}>
                  <Text style={styles.winPointsText}>+{win.points}</Text>
                  <Text style={styles.winPointsLabel}>نقطة</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Milestones */}
      <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.section}>
        <Text style={styles.sectionTitle}>المحطات القادمة</Text>
        <View style={styles.milestoneList}>
          {MILESTONES.filter(m => m.xp > xp).slice(0, 3).map((m) => (
            <View key={m.xp} style={styles.milestoneCard}>
              <Text style={styles.milestoneIcon}>{m.icon}</Text>
              <View style={styles.milestoneTextGroup}>
                <Text style={styles.milestoneLabel}>{m.labelAr}</Text>
                <Text style={styles.milestoneXp}>عند {m.xp} نقطة</Text>
              </View>
              <Feather name="lock" size={16} color="rgba(255,255,255,0.2)" />
            </View>
          ))}
          {MILESTONES.filter(m => m.xp <= xp).map((m) => (
            <View key={m.xp} style={[styles.milestoneCard, styles.milestoneCardDone]}>
              <Text style={styles.milestoneIcon}>{m.icon}</Text>
              <View style={styles.milestoneTextGroup}>
                <Text style={[styles.milestoneLabel, { color: Colors.gold }]}>{m.labelAr}</Text>
                <Text style={[styles.milestoneXp, { color: Colors.gold + "80" }]}>مكتمل ✓</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navyDeep },
  header: {
    padding: 24,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  screenTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 32,
    color: "#F2EBD9",
  },
  screenSubtitle: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    color: "rgba(242,235,217,0.5)",
    marginTop: 2,
  },
  levelCard: {
    margin: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    gap: 16,
  },
  levelCardTop: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  levelIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  levelIcon: { fontSize: 28 },
  levelTextGroup: { flex: 1 },
  levelTag: {
    fontFamily: "Amiri_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "right",
  },
  levelName: {
    fontFamily: "Amiri_700Bold",
    fontSize: 26,
    textAlign: "right",
    marginTop: 2,
  },
  levelDesc: {
    fontFamily: "Amiri_400Regular",
    fontSize: 13,
    color: "rgba(242,235,217,0.6)",
    lineHeight: 20,
    textAlign: "right",
    marginTop: 4,
  },
  xpRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpLabel: {
    fontFamily: "Amiri_700Bold",
    fontSize: 14,
    color: Colors.gold,
  },
  xpNext: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  xpBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBarFill: { height: "100%", borderRadius: 4 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: {
    fontFamily: "Amiri_700Bold",
    fontSize: 24,
    color: Colors.gold,
  },
  statLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 11,
    color: "rgba(242,235,217,0.5)",
    textAlign: "center",
    marginTop: 4,
  },
  section: { margin: 16, marginTop: 8 },
  sectionTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 18,
    color: "#F2EBD9",
    textAlign: "right",
    marginBottom: 12,
  },
  journeyContainer: { gap: 0 },
  journeyStep: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  journeyLine: { alignItems: "center", width: 48 },
  journeyConnector: {
    width: 2,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 4,
  },
  journeyConnectorDone: { backgroundColor: Colors.gold + "60" },
  journeyDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  journeyDotLocked: { borderColor: "rgba(255,255,255,0.1)" },
  journeyDotIcon: { fontSize: 22 },
  journeyContent: { flex: 1, paddingBottom: 24, alignItems: "flex-end" },
  journeyLabel: {
    fontFamily: "Amiri_700Bold",
    fontSize: 18,
    textAlign: "right",
  },
  journeyDesc: {
    fontFamily: "Amiri_400Regular",
    fontSize: 13,
    color: "rgba(242,235,217,0.5)",
    lineHeight: 20,
    textAlign: "right",
    marginTop: 4,
  },
  currentBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  currentBadgeText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
  },
  winsList: { gap: 8 },
  winCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  winLeft: { flex: 1, alignItems: "flex-end" },
  winLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "#F2EBD9",
    textAlign: "right",
  },
  winDate: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(242,235,217,0.4)",
    marginTop: 2,
    textAlign: "right",
  },
  winPoints: { alignItems: "center", marginLeft: 12 },
  winPointsText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 18,
    color: Colors.gold,
  },
  winPointsLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 10,
    color: "rgba(201,168,76,0.6)",
  },
  milestoneList: { gap: 8 },
  milestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  milestoneCardDone: {
    borderColor: "rgba(201,168,76,0.2)",
    backgroundColor: "rgba(201,168,76,0.05)",
  },
  milestoneIcon: { fontSize: 22 },
  milestoneTextGroup: { flex: 1, alignItems: "flex-end" },
  milestoneLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "rgba(242,235,217,0.7)",
    textAlign: "right",
  },
  milestoneXp: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    marginTop: 2,
  },
});
