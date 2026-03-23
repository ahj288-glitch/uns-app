import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

const MOOD_LABELS: Record<string, string> = {
  happy: "سعيد",
  calm: "هادئ",
  grateful: "ممتنّ",
  tired: "متعب",
  anxious: "قلق",
  sad: "حزين",
  angry: "غاضب",
  hopeful: "متفائل",
};

const WEEK_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const MOCK_WEEK = [
  { day: "الأحد", value: 0.6, mood: "قلق" },
  { day: "الإثنين", value: 0.75, mood: "طبيعي" },
  { day: "الثلاثاء", value: 0.5, mood: "متعب" },
  { day: "الأربعاء", value: 0.85, mood: "هادئ" },
  { day: "الخميس", value: 0.9, mood: "مسرور" },
  { day: "الجمعة", value: 0.8, mood: "ممتنّ" },
  { day: "اليوم", value: 0.7, mood: "طبيعي" },
];

const KEY_INSIGHTS = [
  { icon: "🌙", text: "تحسّن نومك بنسبة ٨٤٪ خلال الأسبوع الماضي" },
  { icon: "🌱", text: "١٢ يوماً متتالياً من الرعاية الذاتية" },
  { icon: "📊", text: "مزاجك في أفضل حالاته بعد جلسات التأمل" },
];

function MiniBar({ value, day, mood }: { value: number; day: string; mood: string }) {
  const maxH = 90;
  const fillH = Math.max(value * maxH, 8);

  return (
    <View style={styles.barItem}>
      <Text style={styles.barMoodLabel}>{mood}</Text>
      <View style={[styles.barTrack, { height: maxH }]}>
        <View style={[styles.barFill, { height: fillH }]} />
      </View>
      <Text style={styles.barDayLabel}>{day}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [loading, setLoading] = useState(false);
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.surface }]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { paddingTop: webTop + 16 }]}>
        <Text style={styles.screenTitle}>رؤاك الأسبوعية</Text>
        <Text style={styles.screenSubtitle}>تحليل مشاعرك وأنماطك</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.chartCard}>
        <Text style={styles.chartTitle}>مستوى الهدوء — آخر ٧ أيام</Text>
        <View style={styles.barChart}>
          {MOCK_WEEK.map((d, i) => (
            <MiniBar key={i} value={d.value} day={d.day} mood={d.mood} />
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.legendText}>مستوى الطمأنينة</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
        <Text style={styles.sectionTitle}>أبرز الأفكار</Text>
        <View style={styles.insightsList}>
          {KEY_INSIGHTS.map((ins, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(400).delay(300 + i * 80)}
              style={styles.insightCard}
            >
              <Text style={styles.insightIcon}>{ins.icon}</Text>
              <Text style={styles.insightText}>{ins.text}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>نمط المشاعر</Text>
        <View style={styles.moodPatternCard}>
          {[
            { label: "القلق", pct: 0.28, color: "#6B7FD7" },
            { label: "الهدوء", pct: 0.42, color: Colors.accent },
            { label: "الامتنان", pct: 0.20, color: Colors.secondary },
            { label: "التعب", pct: 0.10, color: Colors.muted },
          ].map((item) => (
            <View key={item.label} style={styles.moodPatternRow}>
              <View style={styles.moodBarTrack}>
                <View style={[styles.moodBarFill, { width: `${item.pct * 100}%` as any, backgroundColor: item.color }]} />
              </View>
              <Text style={styles.moodPatternLabel}>{item.label}</Text>
              <Text style={[styles.moodPatternPct, { color: item.color }]}>
                {Math.round(item.pct * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.quoteCard}>
        <Text style={styles.quoteIcon}>✦</Text>
        <Text style={styles.quoteText}>
          "الصحة النفسية ليست وجهة — إنها رحلة يومية من الرعاية الذاتية."
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    backgroundColor: Colors.accent,
    borderRadius: 6,
    minHeight: 8,
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
