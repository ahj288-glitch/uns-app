import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

const DIALECTS = [
  { id: "gulf", ar: "خليجي", flag: "🇸🇦" },
  { id: "levant", ar: "شامي", flag: "🇱🇧" },
  { id: "egyptian", ar: "مصري", flag: "🇪🇬" },
  { id: "maghrebi", ar: "مغاربي", flag: "🇲🇦" },
  { id: "msa", ar: "فصحى", flag: "🌍" },
];

const PRIVACY_ITEMS = [
  "نحن لا نبيع بياناتك مطلقاً",
  "مشاعرك مشفرة ومؤمنة",
  "يمكنك حذف بياناتك في أي وقت",
  "لا نشارك معلوماتك مع أي طرف ثالث",
];

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
  return (
    <Pressable style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={[styles.settingIcon, { backgroundColor: danger ? Colors.error + "20" : Colors.surfaceContainerHigh }]}>
        <Feather name={icon} size={16} color={danger ? Colors.error : Colors.accent} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: Colors.error }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement ?? (onPress ? <Feather name="chevron-right" size={16} color={Colors.muted} /> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { dialect, setDialect } = useSession();
  const [notifications, setNotifications] = useState(true);
  const [spiritual, setSpiritual] = useState(true);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  async function clearSession() {
    Alert.alert(
      "إعادة البدء",
      "هل تريد إنشاء جلسة جديدة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "نعم",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("uns_session_id");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert("تم", "أعد تشغيل التطبيق لبدء جلسة جديدة.");
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.surface }]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: webTop + 16 }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>أ</Text>
          </View>
          <View style={styles.mintRing} />
        </View>
        <Text style={styles.userName}>مرحباً بك</Text>
        <Text style={styles.userSub}>رفيقك الخاص</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اللهجة المفضلة</Text>
        <View style={styles.dialectGrid}>
          {DIALECTS.map(d => (
            <Pressable
              key={d.id}
              style={[
                styles.dialectChip,
                dialect === d.id && styles.dialectChipActive,
              ]}
              onPress={() => {
                setDialect(d.id);
                Haptics.selectionAsync();
              }}
            >
              <Text style={styles.dialectFlag}>{d.flag}</Text>
              <Text style={[styles.dialectLabel, { color: dialect === d.id ? Colors.accent : Colors.primary }]}>
                {d.ar}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإعدادات</Text>
        <View style={styles.settingsList}>
          <SettingRow
            icon="bell"
            title="التذكيرات اليومية"
            subtitle="تذكير للتسجيل اليومي"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={v => { setNotifications(v); Haptics.selectionAsync(); }}
                trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.accent }}
                thumbColor={Colors.onSurface}
              />
            }
          />
          <SettingRow
            icon="moon"
            title="الطابع الروحاني"
            subtitle="تضمين أذكار ودعاء"
            rightElement={
              <Switch
                value={spiritual}
                onValueChange={v => { setSpiritual(v); Haptics.selectionAsync(); }}
                trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.accent }}
                thumbColor={Colors.onSurface}
              />
            }
          />
          <SettingRow
            icon="help-circle"
            title="الدعم والمساعدة"
            subtitle="تواصل معنا"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>خصوصيتك تهمنا</Text>
        <View style={styles.privacyCard}>
          {PRIVACY_ITEMS.map((item, i) => (
            <View key={i} style={styles.privacyItem}>
              <Feather name="shield" size={14} color={Colors.accent} />
              <Text style={styles.privacyText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أزمات نفسية؟</Text>
        <View style={styles.crisisCard}>
          <Feather name="phone" size={20} color={Colors.error} />
          <Text style={styles.crisisTitle}>خطوط الدعم النفسي</Text>
          {[
            { country: "السعودية", num: "920033360" },
            { country: "الإمارات", num: "800-4673" },
            { country: "مصر", num: "08008880700" },
          ].map(r => (
            <View key={r.country} style={styles.crisisLine}>
              <Text style={styles.crisisCountry}>{r.country}</Text>
              <Text style={styles.crisisNum}>{r.num}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SettingRow
          icon="refresh-cw"
          title="إعادة البدء"
          subtitle="إنشاء جلسة جديدة"
          onPress={clearSession}
          danger
        />
      </View>

      <Text style={styles.footer}>أُنْس  •  v1.0.0{"\n"}نحن لا نبيع مشاعرك.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 8,
  },
  avatarContainer: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  mintRing: {
    position: "absolute",
    top: -4,
    right: -4,
    bottom: -4,
    left: -4,
    borderRadius: 48,
  },
  avatarText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 36,
    color: Colors.accent,
  },
  userName: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 24,
    color: Colors.onSurface,
  },
  userSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.muted,
  },
  section: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  sectionTitle: {
    fontFamily: "Tajawal_500Medium",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "right",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dialectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  dialectChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dialectChipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  dialectFlag: { fontSize: 16 },
  dialectLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
  },
  settingsList: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    overflow: "hidden",
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
    color: Colors.onSurface,
    textAlign: "right",
  },
  settingSubtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  privacyCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    padding: 16,
    gap: 10,
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
    color: Colors.primary,
    flex: 1,
    textAlign: "right",
  },
  crisisCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    alignItems: "flex-end",
  },
  crisisTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: Colors.onSurface,
    textAlign: "right",
  },
  crisisLine: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  crisisCountry: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.muted,
  },
  crisisNum: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 14,
    color: Colors.error,
  },
  footer: {
    fontFamily: "BeVietnamPro_400Regular",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "center",
    paddingVertical: 32,
    lineHeight: 20,
  },
});
