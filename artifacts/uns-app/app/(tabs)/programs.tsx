import React from "react";
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
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const CATEGORY_CONFIG: Record<string, { ar: string; color: string }> = {
  anxiety: { ar: "القلق", color: "#6B7FD7" },
  grief: { ar: "الحزن", color: "#8E7BB5" },
  sleep: { ar: "النوم", color: "#4A9EDD" },
  ramadan: { ar: "رمضان", color: Colors.accent },
  general: { ar: "عام", color: Colors.secondary },
  spiritual: { ar: "روحاني", color: Colors.primary },
};

interface Program {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  durationDays: number;
  category: string;
  tier: string;
  active: boolean;
  enrolledCount: number;
  completionRate: number;
}

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const cat = CATEGORY_CONFIG[program.category] ?? { ar: program.category, color: Colors.accent };
  const isPremium = program.tier === "premium";
  const completion = Math.round(program.completionRate * 100);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <Pressable style={styles.card} onPress={() => {}}>
        <View style={styles.cardTop}>
          <View style={[styles.categoryBadge, { backgroundColor: cat.color + "18" }]}>
            <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
            <Text style={[styles.categoryText, { color: cat.color }]}>{cat.ar}</Text>
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Feather name="star" size={10} color={Colors.accent} />
              <Text style={styles.premiumText}>متقدم</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardTitle}>{program.titleAr}</Text>
        {program.descriptionAr && (
          <Text style={styles.cardDesc} numberOfLines={2}>{program.descriptionAr}</Text>
        )}

        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Feather name="calendar" size={12} color={Colors.muted} />
            <Text style={styles.statText}>{program.durationDays} يوم</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="users" size={12} color={Colors.muted} />
            <Text style={styles.statText}>{program.enrolledCount.toLocaleString()}</Text>
          </View>
          <View style={styles.stat}>
            <Feather name="check-circle" size={12} color={Colors.accent} />
            <Text style={[styles.statText, { color: Colors.accent }]}>{completion}%</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${completion}%` as DimensionValue, backgroundColor: cat.color }]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { loadPrograms(); }, []);

  async function loadPrograms() {
    try {
      const res = await fetch(`${BASE}/api/admin/programs`);
      const data = await res.json();
      setPrograms(data.programs ?? []);
    } catch {
      setError("تعذر تحميل البرامج");
    } finally {
      setIsLoading(false);
    }
  }

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.surface }]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: webTop + 16 }]}>
        <Text style={styles.headerTitle}>برامج الرفاه</Text>
        <Text style={styles.headerSub}>رحلات مصممة لك</Text>
      </View>

      <View style={styles.filterRow}>
        {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
          <Pressable key={key} style={styles.filterChip}>
            <View style={[styles.filterDot, { backgroundColor: conf.color }]} />
            <Text style={styles.filterText}>{conf.ar}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={Colors.accent} />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : error ? (
          <Pressable style={styles.errorState} onPress={loadPrograms}>
            <Feather name="refresh-cw" size={24} color={Colors.muted} />
            <Text style={styles.errorText}>{error}</Text>
          </Pressable>
        ) : programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="book-open" size={40} color={Colors.muted} />
            <Text style={styles.emptyText}>لا توجد برامج بعد</Text>
          </View>
        ) : (
          programs.map((p, i) => <ProgramCard key={p.id} program={p} index={i} />)
        )}
      </View>
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
  headerTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 32,
    color: Colors.onSurface,
    textAlign: "right",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "flex-end",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.primary,
  },
  list: { paddingHorizontal: 16, gap: 12 },
  card: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryText: { fontFamily: "Tajawal_400Regular", fontSize: 11 },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent + "18",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 10,
    color: Colors.accent,
  },
  cardTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: Colors.onSurface,
    textAlign: "right",
    lineHeight: 32,
  },
  cardDesc: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "right",
    lineHeight: 22,
  },
  cardStats: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "flex-end",
  },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 2 },
  loadingState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  loadingText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
  },
  errorState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  errorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.error,
  },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 18,
    color: Colors.muted,
  },
});
