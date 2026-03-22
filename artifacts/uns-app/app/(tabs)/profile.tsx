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
  icon: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? Colors.terracotta + "20" : Colors.navySurface }]}>
        <Feather name={icon as any} size={16} color={danger ? Colors.terracotta : Colors.gold} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: Colors.terracotta }]}>{title}</Text>
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
      "هل تريد إنشاء جلسة جديدة؟ ستفقد تاريخ محادثتك.",
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
      style={[styles.container, { backgroundColor: Colors.navy }]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: webTop + 16 }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>أ</Text>
          </View>
          <View style={styles.goldRing} />
        </View>
        <Text style={styles.userName}>مرحباً بك</Text>
        <Text style={styles.userSub}>رفيقك الخاص</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اللهجة المفضلة</Text>
        <View style={styles.dialectGrid}>
          {DIALECTS.map((d) => (
            <Pressable
              key={d.id}
              style={[
                styles.dialectChip,
                dialect === d.id && {
                  borderColor: Colors.gold,
                  backgroundColor: Colors.gold + "15",
                },
              ]}
              onPress={() => {
                setDialect(d.id);
                Haptics.selectionAsync();
              }}
            >
              <Text style={styles.dialectFlag}>{d.flag}</Text>
              <Text
                style={[
                  styles.dialectLabel,
                  { color: dialect === d.id ? Colors.gold : Colors.nearWhite },
                ]}
              >
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
                onValueChange={(v) => {
                  setNotifications(v);
                  Haptics.selectionAsync();
                }}
                trackColor={{ false: Colors.dark.border, true: Colors.gold }}
                thumbColor={Colors.nearWhite}
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
                onValueChange={(v) => {
                  setSpiritual(v);
                  Haptics.selectionAsync();
                }}
                trackColor={{ false: Colors.dark.border, true: Colors.gold }}
                thumbColor={Colors.nearWhite}
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
              <Feather name="shield" size={14} color={Colors.sage} />
              <Text style={styles.privacyText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أزمات نفسية؟</Text>
        <View style={styles.crisisCard}>
          <Feather name="phone" size={20} color={Colors.terracotta} />
          <Text style={styles.crisisTitle}>خطوط الدعم النفسي</Text>
          {[
            { country: "السعودية", num: "920033360" },
            { country: "الإمارات", num: "800-4673" },
            { country: "مصر", num: "08008880700" },
          ].map((r) => (
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

      <Text style={styles.footer}>UNS | أُنس  •  v1.0.0{"\n"}نحن لا نبيع مشاعرك.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.navySurface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  goldRing: {
    position: "absolute",
    inset: -4,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: Colors.gold + "30",
  },
  avatarText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 36,
    color: Colors.gold,
  },
  userName: {
    fontFamily: "Amiri_700Bold",
    fontSize: 24,
    color: Colors.nearWhite,
  },
  userSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.muted,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "right",
    letterSpacing: 0.5,
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
    backgroundColor: Colors.navyCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  dialectFlag: {
    fontSize: 16,
  },
  dialectLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
  },
  settingsList: {
    backgroundColor: Colors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  settingTitle: {
    fontFamily: "Amiri_400Regular",
    fontSize: 16,
    color: Colors.nearWhite,
    textAlign: "right",
  },
  settingSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  privacyCard: {
    backgroundColor: Colors.sage + "10",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.sage + "30",
  },
  privacyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-end",
  },
  privacyText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    color: Colors.nearWhite,
    flex: 1,
    textAlign: "right",
  },
  crisisCard: {
    backgroundColor: Colors.terracotta + "10",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.terracotta + "30",
    alignItems: "flex-end",
  },
  crisisTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 18,
    color: Colors.nearWhite,
    textAlign: "right",
  },
  crisisLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  crisisCountry: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    color: Colors.muted,
  },
  crisisNum: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: Colors.terracotta,
  },
  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "center",
    paddingVertical: 32,
    lineHeight: 20,
  },
});
