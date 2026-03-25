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
import { LinearGradient } from "expo-linear-gradient";
import Colors, { useTokens } from "@/constants/colors";
import EmptyState from "@/components/EmptyState";
import { useSession } from "@/contexts/SessionContext";
import { Typography } from "@/constants/typography";
import { Spacing, Radius, Shadow } from "@/constants/layout";

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const CATEGORY_CONFIG: Record<string, { ar: string; color: string }> = {
  anxiety: { ar: "القلق", color: "#6B7FD7" },
  grief: { ar: "الحزن", color: "#8E7BB5" },
  sleep: { ar: "النوم", color: "#4A9EDD" },
  ramadan: { ar: "رمضان", color: "#74C69D" },
  general: { ar: "عام", color: "#A8C5B2" },
  spiritual: { ar: "روحاني", color: "#1B4332" },
};

const CARD_GRADIENTS: Record<string, [string, string]> = {
  anxiety: ["#74C69D", "#2C6B9E"],
  grief: ["#7B68B5", "#4A3A8A"],
  sleep: ["#2D5A6B", "#3D5A7A"],
  ramadan: ["#D4776A", "#E8936A"],
  general: ["#D4776A", "#E8936A"],
  spiritual: ["#3A8A6B", "#2C6B50"],
};

const CARD_ILLUSTRATIONS: Record<string, string> = {
  anxiety: "🧘",
  grief: "🌸",
  sleep: "🌙",
  ramadan: "🌙",
  general: "💫",
  spiritual: "🌿",
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

function HeroBanner() {
  const T = useTokens();
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={heroStyles.container}>
      <LinearGradient
        colors={T.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={heroStyles.gradient}
      >
        <View style={heroStyles.illustrationArea}>
          <Text style={heroStyles.illustrationEmoji}>🌿</Text>
          <Text style={heroStyles.illustrationSmall}>✨</Text>
        </View>
        <View style={heroStyles.textArea}>
          <Text style={[heroStyles.heroTitle, { color: T.onSurface }]}>{"رحلتك نحو\nالصحة النفسية\nتبدأ هنا"}</Text>
          <Text style={[heroStyles.heroSub, { color: T.muted }]}>اختر برنامجاً يناسبك</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const heroStyles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.subtle,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    minHeight: 130,
  },
  illustrationArea: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  illustrationEmoji: { fontSize: 36 },
  illustrationSmall: {
    fontSize: 18,
    position: "absolute",
    top: -4,
    right: -4,
  },
  textArea: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: Spacing.md,
  },
  heroTitle: {
    ...Typography.h2,
    textAlign: "right",
  },
  heroSub: {
    ...Typography.bodySmall,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
});

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const cat = CATEGORY_CONFIG[program.category] ?? { ar: program.category, color: "#74C69D" };
  const gradientColors = CARD_GRADIENTS[program.category] ?? ["#3AAFA9", "#2C7873"] as [string, string];
  const illustration = CARD_ILLUSTRATIONS[program.category] ?? "💫";
  const completion = Math.round(program.completionRate * 100);
  const durationWeeks = Math.max(1, Math.round(program.durationDays / 7));
  const weekLabels: Record<number, string> = { 1: "١", 2: "٢", 3: "٣", 4: "٤", 5: "٥", 6: "٦", 7: "٧", 8: "٨" };
  const weekLabel = weekLabels[durationWeeks] ?? String(durationWeeks);
  const hasProgress = completion > 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)} style={cardStyles.wrapper}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyles.card}
      >
        <View style={cardStyles.illustrationCircle}>
          <Text style={cardStyles.illustrationEmoji}>{illustration}</Text>
        </View>

        <View style={cardStyles.contentArea}>
          <Text style={cardStyles.title}>{program.titleAr}</Text>

          {hasProgress && (
            <View style={cardStyles.progressSection}>
              <View style={cardStyles.progressBarBg}>
                <View
                  style={[
                    cardStyles.progressBarFill,
                    { width: `${completion}%` as DimensionValue },
                  ]}
                />
              </View>
              <Text style={cardStyles.progressLabel}>{completion}%</Text>
            </View>
          )}

          <View style={cardStyles.bottomRow}>
            <Text style={cardStyles.durationLabel}>برنامج {weekLabel} أسابيع</Text>
            <Pressable style={cardStyles.ctaBtn}>
              <Text style={cardStyles.ctaBtnText}>{hasProgress ? "تابع" : "ابدأ الآن"}</Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.lg,
    marginBottom: 14,
    borderRadius: Radius.lg,
    overflow: "hidden",
    ...Shadow.card,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  illustrationCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  illustrationEmoji: { fontSize: 36 },
  contentArea: {
    flex: 1,
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: "#FFFFFF",
    textAlign: "right",
  },
  progressSection: {
    width: "100%",
    gap: Spacing.xs,
    alignItems: "flex-end",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  progressLabel: {
    ...Typography.label,
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  durationLabel: {
    ...Typography.label,
    color: "rgba(255,255,255,0.75)",
  },
  ctaBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  ctaBtnText: {
    ...Typography.bodySmall,
    fontFamily: "Tajawal_700Bold",
    color: "#FFFFFF",
  },
});

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const T = useTokens();
  const styles = makeStyles(T);
  const { authFetch } = useSession();
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { loadPrograms(); }, []);

  async function loadPrograms() {
    try {
      const res = await authFetch(`${BASE}/api/admin/programs`);
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
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBar, { paddingTop: webTop + Spacing.sm }]}>
        <Pressable style={styles.headerBtn}>
          <Feather name="settings" size={18} color="#555555" />
        </Pressable>
        <Text style={styles.headerTitle}>مسارات أُنْس</Text>
        <Pressable style={styles.headerBtn}>
          <Feather name="chevron-right" size={20} color="#555555" />
        </Pressable>
      </View>

      <HeroBanner />

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={T.accent} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : error ? (
        <Pressable style={styles.errorState} onPress={loadPrograms}>
          <Feather name="refresh-cw" size={24} color={T.muted} />
          <Text style={styles.errorText}>{error}</Text>
        </Pressable>
      ) : programs.length === 0 ? (
        <EmptyState
          icon="layers"
          title="لا توجد برامج متاحة"
          subtitle="ستظهر هنا البرامج العلاجية عند إطلاقها"
        />
      ) : (
        programs.map((p, i) => <ProgramCard key={p.id} program={p} index={i} />)
      )}
    </ScrollView>
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.subtle,
  },
  headerTitle: {
    ...Typography.h2,
    color: T.onSurface,
    textAlign: "center",
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.body,
    color: T.muted,
  },
  errorState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: T.error,
  },
  });
}
