import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";

const MOODS = [
  { word: "سعيد", en: "happy", color: Colors.gold, intensity: 4 },
  { word: "هادئ", en: "calm", color: Colors.sage, intensity: 3 },
  { word: "ممتنّ", en: "grateful", color: "#9B59B6", intensity: 4 },
  { word: "متعب", en: "tired", color: Colors.muted, intensity: 2 },
  { word: "قلق", en: "anxious", color: Colors.terracotta, intensity: 3 },
  { word: "حزين", en: "sad", color: "#5D6D8A", intensity: 2 },
  { word: "غاضب", en: "angry", color: "#C0392B", intensity: 2 },
  { word: "متفائل", en: "hopeful", color: "#27AE60", intensity: 4 },
];

const MICRO_WIN_LABELS: Record<string, string> = {
  first_checkin: "تسجيل المشاعر للمرة الأولى اليوم ✨",
  streak_3: "٣ أيام متتالية من الرعاية الذاتية 🔥",
  streak_7: "أسبوع كامل من الاهتمام بنفسك 💎",
  streak_14: "أسبوعان من الاستمرارية 🌟",
  streak_30: "شهر من التحول العاطفي 🏆",
};

function MoodChip({
  mood,
  selected,
  onPress,
}: {
  mood: (typeof MOODS)[0];
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSpring(0.92, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.moodChip,
          {
            backgroundColor: selected ? mood.color + "30" : Colors.navyCard,
            borderColor: selected ? mood.color : Colors.dark.border,
            borderWidth: selected ? 2 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.moodDot,
            { backgroundColor: mood.color, opacity: selected ? 1 : 0.4 },
          ]}
        />
        <Text
          style={[
            styles.moodWord,
            { color: selected ? mood.color : Colors.nearWhite },
          ]}
        >
          {mood.word}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface WinResult {
  xpEarned: number;
  streakDays: number;
  newWins: { type: string; points: number }[];
  levelUp?: { newLevel: string };
}

function MicroWinModal({ result, onClose }: { result: WinResult; onClose: () => void }) {
  const isLevelUp = !!result?.levelUp;

  const LEVEL_NAMES: Record<string, string> = {
    awareness: "الوعي",
    balance: "التوازن",
    tranquility: "الطمأنينة",
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.winModal}>
          {isLevelUp ? (
            <>
              <Text style={styles.winEmoji}>🌟</Text>
              <Text style={styles.winTitle}>ترقيت للمستوى التالي!</Text>
              <Text style={styles.winLevel}>{LEVEL_NAMES[result.levelUp!.newLevel] ?? result.levelUp!.newLevel}</Text>
            </>
          ) : (
            <>
              <Text style={styles.winEmoji}>✨</Text>
              <Text style={styles.winTitle}>+{result.xpEarned} نقطة</Text>
            </>
          )}

          {result.streakDays > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>🔥 {result.streakDays} أيام متتالية</Text>
            </View>
          )}

          {result.newWins?.map((win) => (
            <View key={win.type} style={styles.winRow}>
              <Text style={styles.winRowLabel}>{MICRO_WIN_LABELS[win.type] ?? win.type}</Text>
              <Text style={styles.winRowPoints}>+{win.points}</Text>
            </View>
          ))}

          <Text style={styles.winEncouragement}>
            استمر في رحلتك — كل يوم يُحدث فرقاً 🌱
          </Text>

          <Pressable style={styles.winCloseBtn} onPress={onClose}>
            <Text style={styles.winCloseBtnText}>شكراً ←</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [winResult, setWinResult] = useState<WinResult | null>(null);

  const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  async function saveCheckin() {
    if (!selectedMood || !sessionId) return;
    setIsSaving(true);
    try {
      await fetch(`${BASE}/api/moods/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          moodWord: selectedMood.en,
          moodWordArabic: selectedMood.word,
          intensity,
          notes: notes.trim() || undefined,
        }),
      });

      const progressRes = await fetch(`${BASE}/api/gamification/checkin-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, moodWord: selectedMood.en }),
      });
      const progressData = await progressRes.json();

      setSaved(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (progressData.xpEarned > 0 || progressData.newWins?.length > 0) {
        setTimeout(() => setWinResult(progressData), 800);
      }

      setTimeout(() => {
        setSaved(false);
        setSelectedMood(null);
        setNotes("");
        setIntensity(3);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: Colors.navy }]}
        contentContainerStyle={{ paddingBottom: webBottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: webTop + 16 }]}>
          <Text style={styles.headerTitle}>كيف تحس اليوم؟</Text>
          <Text style={styles.headerSub}>سجّل مشاعرك — كل مشاعر لها قيمة</Text>
        </View>

        {saved ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.savedCard}>
            <Text style={styles.savedIcon}>✓</Text>
            <Text style={styles.savedText}>تم حفظ مشاعرك</Text>
            <Text style={styles.savedSub}>شكراً لمشاركتي</Text>
          </Animated.View>
        ) : (
          <>
            <View style={styles.moodGrid}>
              {MOODS.map((mood) => (
                <MoodChip
                  key={mood.en}
                  mood={mood}
                  selected={selectedMood?.en === mood.en}
                  onPress={() => setSelectedMood(mood)}
                />
              ))}
            </View>

            {selectedMood && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.intensitySection}>
                <Text style={styles.sectionLabel}>شدة الشعور</Text>
                <View style={styles.intensityRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Pressable
                      key={i}
                      onPress={() => {
                        setIntensity(i);
                        if (Platform.OS !== "web") Haptics.selectionAsync();
                      }}
                      style={[
                        styles.intensityDot,
                        {
                          backgroundColor:
                            i <= intensity
                              ? selectedMood.color
                              : Colors.dark.border,
                          transform: [{ scale: i <= intensity ? 1 : 0.8 }],
                        },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.intensityLabels}>
                  <Text style={styles.intensityLabel}>خفيف</Text>
                  <Text style={styles.intensityLabel}>شديد</Text>
                </View>
              </Animated.View>
            )}

            {selectedMood && (
              <Animated.View entering={FadeInDown.duration(500)} style={styles.notesSection}>
                <Text style={styles.sectionLabel}>ملاحظات (اختياري)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="أخبرني أكثر عن شعورك..."
                  placeholderTextColor={Colors.muted}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              </Animated.View>
            )}

            {selectedMood && (
              <Animated.View entering={FadeInDown.duration(600)} style={styles.saveSection}>
                <Pressable
                  style={[
                    styles.saveBtn,
                    { backgroundColor: selectedMood.color, opacity: isSaving ? 0.7 : 1 },
                  ]}
                  onPress={saveCheckin}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color={Colors.navy} />
                  ) : (
                    <Text style={styles.saveBtnText}>حفظ المشاعر ✨</Text>
                  )}
                </Pressable>
              </Animated.View>
            )}
          </>
        )}

        <View style={styles.historySection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              تتبع مشاعرك اليومي يكسبك نقاطاً ويبني سلسلتك. كل يوم تسجّل فيه مشاعرك هو انتصار صغير.
            </Text>
          </View>
        </View>
      </ScrollView>

      {winResult && (
        <MicroWinModal result={winResult} onClose={() => setWinResult(null)} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 28,
    color: Colors.nearWhite,
    textAlign: "right",
  },
  headerSub: {
    fontFamily: "Amiri_400Regular",
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
    textAlign: "right",
  },
  savedCard: {
    margin: 24,
    backgroundColor: Colors.sage + "20",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.sage + "50",
  },
  savedIcon: {
    fontSize: 40,
    color: Colors.sage,
  },
  savedText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 22,
    color: Colors.nearWhite,
  },
  savedSub: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: Colors.muted,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 20,
    justifyContent: "flex-end",
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodWord: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
  },
  intensitySection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: "Amiri_700Bold",
    fontSize: 15,
    color: Colors.nearWhite,
    textAlign: "right",
    marginBottom: 12,
  },
  intensityRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  intensityDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  intensityLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  intensityLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  notesSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: Colors.navyCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    color: Colors.nearWhite,
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  saveBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 17,
    color: Colors.navy,
  },
  historySection: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: Colors.navyCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 22,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  winModal: {
    backgroundColor: Colors.navyCard,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gold + "30",
  },
  winEmoji: { fontSize: 52 },
  winTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 26,
    color: Colors.gold,
    textAlign: "center",
  },
  winLevel: {
    fontFamily: "Amiri_700Bold",
    fontSize: 22,
    color: "#F2EBD9",
    textAlign: "center",
  },
  streakBadge: {
    backgroundColor: "rgba(201,168,76,0.15)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
  },
  streakBadgeText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 15,
    color: Colors.gold,
  },
  winRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 12,
  },
  winRowLabel: {
    fontFamily: "Amiri_400Regular",
    fontSize: 13,
    color: "rgba(242,235,217,0.8)",
    flex: 1,
    textAlign: "right",
  },
  winRowPoints: {
    fontFamily: "Amiri_700Bold",
    fontSize: 14,
    color: Colors.gold,
    marginLeft: 12,
  },
  winEncouragement: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "rgba(242,235,217,0.5)",
    textAlign: "center",
    lineHeight: 22,
  },
  winCloseBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 4,
  },
  winCloseBtnText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 16,
    color: Colors.navy,
  },
});
