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
  anxiety: ["#3AAFA9", "#2C6B9E"],
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
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
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
    paddingRight: 12,
  },
  heroTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    textAlign: "right",
    lineHeight: 32,
  },
  heroSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    textAlign: "right",
    marginTop: 4,
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
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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
    gap: 8,
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "right",
  },
  progressSection: {
    width: "100%",
    gap: 4,
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
    fontFamily: "BeVietnamPro_500Medium",
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
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  ctaBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  ctaBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
});

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  const T = useTokens();
  const styles = makeStyles(T);
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
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBar, { paddingTop: webTop + 8 }]}>
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
        <View style={styles.emptyState}>
          <Feather name="book-open" size={40} color={T.muted} />
          <Text style={styles.emptyText}>لا توجد برامج بعد</Text>
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 20,
    color: T.onSurface,
    textAlign: "center",
  },
  loadingState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: T.muted,
  },
  errorState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  errorText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: T.error,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 18,
    color: T.muted,
  },
  });
}
