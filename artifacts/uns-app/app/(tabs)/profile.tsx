import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getRefreshToken, clearTokens } from "@/lib/secureTokens";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTokens } from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import { API_BASE } from "@/lib/api";
import { Typography } from "@/constants/typography";
import { Spacing, Radius, Shadow } from "@/constants/layout";

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const T = useTokens();
  const styles = makeStyles(T);
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// ─── Setting row ───────────────────────────────────────────────────────────────

function SettingRow({
  icon,
  title,
  subtitle,
  rightElement,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const T = useTokens();
  const styles = makeStyles(T);
  return (
    <Pressable
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "none"}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? T.error + "22" : T.surfaceContainerHigh }]}>
        <Feather name={icon} size={16} color={danger ? T.error : T.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: T.error }]}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ?? (onPress ? <Feather name="chevron-left" size={16} color={T.muted} /> : null)}
    </Pressable>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const T = useTokens();
  const styles = makeStyles(T);
  const { displayName, gender, authFetch, setDisplayName: syncDisplayName } = useSession();

  const [notifications, setNotifications] = useState(false);
  const [spiritual, setSpiritualState] = useState(false);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  // Load persisted toggle states
  useEffect(() => {
    AsyncStorage.multiGet(["uns_notifications", "uns_spiritual_mode"]).then(pairs => {
      const notifVal = pairs[0][1];
      const spiritVal = pairs[1][1];
      if (notifVal !== null) setNotifications(notifVal === "1");
      if (spiritVal !== null) setSpiritualState(spiritVal === "1");
    });
  }, []);

  async function toggleNotifications(_val: boolean) {
    // Notifications not yet implemented — inform user and save preference for future use
    if (Platform.OS !== "web") Haptics.selectionAsync();
    Alert.alert(
      "قريباً",
      "التذكيرات اليومية ستكون متاحة في تحديث قريب. سنُعلمك عند إطلاقها.",
      [{ text: "حسناً" }]
    );
  }

  async function toggleSpiritual(val: boolean) {
    setSpiritualState(val);
    await AsyncStorage.setItem("uns_spiritual_mode", val ? "1" : "0");
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }

  async function clearSession() {
    Alert.alert(
      "إعادة البدء",
      "هل تريد إنشاء جلسة جديدة؟ ستظل بياناتك محفوظة.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تسجيل الخروج",
          style: "destructive",
          onPress: async () => {
            // Revoke refresh token on backend before clearing local storage
            try {
              const refreshToken = await getRefreshToken();
              if (refreshToken) {
                await authFetch(`${API_BASE}/auth/logout`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ refreshToken }),
                });
              }
            } catch {
              // Silently continue — local cleanup is the priority
            }
            // Tokens live in SecureStore (not AsyncStorage) — clear both stores.
            await Promise.all([
              AsyncStorage.multiRemove(["uns_session_id"]),
              clearTokens(),
            ]);
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.replace("/");
          },
        },
      ]
    );
  }

  function confirmDeleteData() {
    Alert.alert(
      "حذف جميع البيانات",
      "سيتم حذف جميع بياناتك ومشاعرك المسجلة نهائياً. هل أنت متأكد؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف نهائياً",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "تأكيد الحذف",
              "لا يمكن التراجع عن هذا الإجراء. سيتم تسجيل خروجك وحذف حسابك بشكل دائم.",
              [
                { text: "إلغاء", style: "cancel" },
                {
                  text: "نعم، احذف الكل",
                  style: "destructive",
                  onPress: deleteAllData,
                },
              ]
            );
          },
        },
      ]
    );
  }

  async function deleteAllData() {
    try {
      await authFetch(`${API_BASE}/auth/account`, { method: "DELETE" });
    } catch {
      // API delete failed — still clear local data
    }
    // AsyncStorage.clear() does NOT touch SecureStore — clear tokens explicitly.
    await Promise.all([AsyncStorage.clear(), clearTokens()]);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    router.replace("/");
  }

  const avatarLetter = displayName ? displayName[0] : (gender === "female" ? "أ" : "أ");
  const greetingName = displayName || "مرحباً";
  const genderLabel = gender === "female" ? "أنثى" : "ذكر";

  return (
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: webBottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <LinearGradient
          colors={["rgba(116,198,157,0.18)", "rgba(116,198,157,0.04)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: webTop + 20 }]}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[T.accent, T.secondary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{greetingName}</Text>
          <Text style={styles.userSub}>رفيقك الخاص في أُنس · {genderLabel}</Text>
        </LinearGradient>

        {/* ── Section: التفضيلات ── */}
        <View style={styles.section}>
          <SectionHeader title="التفضيلات" />
          <View style={styles.settingsList}>
            <SettingRow
              icon="moon"
              title="الطابع الروحاني"
              subtitle="تضمين أذكار ودعاء في الجلسات"
              rightElement={
                <Switch
                  value={spiritual}
                  onValueChange={toggleSpiritual}
                  trackColor={{ false: T.surfaceContainerHigh, true: T.accent + "CC" }}
                  thumbColor={spiritual ? T.accent : T.muted}
                />
              }
            />
          </View>
        </View>

        {/* ── Section: التذكيرات ── */}
        <View style={styles.section}>
          <SectionHeader title="التذكيرات" />
          <View style={styles.settingsList}>
            <SettingRow
              icon="bell"
              title="التذكيرات اليومية"
              subtitle="قريباً — تذكيرات يومية لتسجيل مشاعرك"
              rightElement={
                <Switch
                  value={false}
                  onValueChange={toggleNotifications}
                  trackColor={{ false: T.surfaceContainerHigh, true: T.accent + "CC" }}
                  thumbColor={T.muted}
                  disabled
                />
              }
            />
          </View>
        </View>

        {/* ── Section: الاستكشاف ── */}
        <View style={styles.section}>
          <SectionHeader title="الاستكشاف" />
          <View style={styles.settingsList}>
            <SettingRow
              icon="layers"
              title="برامج الرعاية"
              subtitle="جلسات وبرامج علاجية موجّهة"
              onPress={() => router.push("/(tabs)/programs")}
            />
            <SettingRow
              icon="users"
              title="واحة المجتمع"
              subtitle="جلسات دعم جماعية آمنة"
              onPress={() => router.push("/(tabs)/community")}
            />
          </View>
        </View>

        {/* ── Section: خصوصيتك ── */}
        <View style={styles.section}>
          <SectionHeader title="خصوصيتك تهمنا" />
          <View style={styles.privacyCard}>
            {[
              "نحن لا نبيع بياناتك مطلقاً",
              "مشاعرك مشفرة ومؤمنة تماماً",
              "يمكنك حذف بياناتك في أي وقت",
              "لا نشارك معلوماتك مع أي طرف ثالث",
            ].map((item, i) => (
              <View key={i} style={styles.privacyItem}>
                <Feather name="shield" size={14} color={T.accent} />
                <Text style={styles.privacyText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.settingsList, { marginTop: Spacing.sm }]}>
            <SettingRow
              icon="trash-2"
              title="حذف جميع بياناتي"
              subtitle="يُحذف حسابك وجميع بياناتك نهائياً"
              onPress={confirmDeleteData}
              danger
            />
          </View>
        </View>

        {/* ── Section: الدعم النفسي ── */}
        <View style={styles.section}>
          <SectionHeader title="أزمات نفسية؟" />
          <View style={styles.crisisCard}>
            <View style={styles.crisisHeader}>
              <Feather name="phone" size={18} color={T.error} />
              <Text style={styles.crisisTitle}>خطوط الدعم النفسي</Text>
            </View>
            {[
              { country: "السعودية", num: "920033360" },
              { country: "الإمارات",  num: "800-4673" },
              { country: "مصر",       num: "08008880700" },
              { country: "الكويت",    num: "94005050" },
            ].map(r => (
              <View key={r.country} style={styles.crisisLine}>
                <Text style={styles.crisisCountry}>{r.country}</Text>
                <Text style={styles.crisisNum}>{r.num}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Section: إعدادات الحساب ── */}
        <View style={styles.section}>
          <SectionHeader title="الحساب" />
          <View style={styles.settingsList}>
            <SettingRow
              icon="refresh-cw"
              title="إعادة البدء"
              subtitle="إنشاء جلسة جديدة مع الاحتفاظ بالبيانات"
              onPress={clearSession}
              danger
            />
          </View>
        </View>

        <Text style={styles.footer}>
          أُنس  •  v1.0.0{"\n"}نحن لا نبيع مشاعرك.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      alignItems: "center",
      paddingBottom: 28,
      paddingHorizontal: 24,
      gap: 8,
      marginBottom: 4,
    },
    avatarContainer: { marginBottom: 8 },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: "center",
      justifyContent: "center",
      ...Shadow.glow,
    },
    avatarLetter: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 38,
      color: "#FFFFFF",
    },
    userName: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 24,
      lineHeight: 40,
      color: T.onSurface,
      textAlign: "center",
    },
    userSub: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 13,
      lineHeight: 22,
      color: T.muted,
      textAlign: "center",
    },
    section: { paddingHorizontal: 20, paddingTop: 20, gap: 10 },
    sectionTitle: {
      ...Typography.label,
      color: T.muted,
      textAlign: "right",
      textTransform: "uppercase",
    },
    settingsList: {
      backgroundColor: T.surfaceContainer,
      borderRadius: Radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: T.ghostBorder,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    settingContent: { flex: 1, alignItems: "flex-end" },
    settingTitle: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 16,
      lineHeight: 28,
      color: T.onSurface,
      textAlign: "right",
    },
    settingSubtitle: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 12,
      lineHeight: 20,
      color: T.muted,
      textAlign: "right",
    },
    privacyCard: {
      backgroundColor: T.primaryContainer,
      borderRadius: Radius.lg,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: T.ghostBorder,
    },
    privacyItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      justifyContent: "flex-end",
    },
    privacyText: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 14,
      lineHeight: 26,
      color: T.primary,
      flex: 1,
      textAlign: "right",
    },
    crisisCard: {
      backgroundColor: T.surfaceContainer,
      borderRadius: Radius.lg,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: T.ghostBorder,
    },
    crisisHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    crisisTitle: {
      fontFamily: "Tajawal_700Bold",
      fontSize: 17,
      lineHeight: 30,
      color: T.onSurface,
    },
    crisisLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    crisisCountry: {
      fontFamily: "Tajawal_400Regular",
      fontSize: 15,
      lineHeight: 28,
      color: T.muted,
    },
    crisisNum: {
      fontFamily: "BeVietnamPro_500Medium",
      fontSize: 14,
      lineHeight: 22,
      color: T.error,
    },
    footer: {
      fontFamily: "BeVietnamPro_400Regular",
      fontSize: 12,
      color: T.muted,
      textAlign: "center",
      paddingVertical: 32,
      lineHeight: 20,
    },
  });
}
