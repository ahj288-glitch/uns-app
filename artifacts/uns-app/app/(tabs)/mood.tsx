import React, { useEffect, useMemo, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import Colors, { useTokens } from "@/constants/colors";
import { ERRORS, LIMITS } from "@/constants/errors";
import { useSession } from "@/contexts/SessionContext";
import ErrorToast from "@/components/ui/ErrorToast";
import CharCounter from "@/components/ui/CharCounter";
import { Typography } from "@/constants/typography";
import { Spacing, Radius } from "@/constants/layout";
import { API_BASE } from "@/lib/api";
import {
  MOOD_OPTIONS,
  getMoodQuestion,
  findMoodByEn,
  type MoodOption,
} from "@/lib/gender";

const MICRO_WIN_LABELS: Record<string, string> = {
  first_checkin: "تسجيل المشاعر للمرة الأولى اليوم ✨",
  streak_3: "٣ أيام متتالية من الرعاية الذاتية 🌿",
  streak_7: "أسبوع كامل من الاهتمام بنفسك 💚",
  streak_14: "أسبوعان من الاستمرارية 🌱",
  streak_30: "شهر من التحول العاطفي 🏡",
};

function MoodChip({
  mood,
  selected,
  onPress,
}: {
  mood: MoodOption;
  selected: boolean;
  onPress: () => void;
}) {
  const T = useTokens();
  const styles = makeStyles(T);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    scale.value = withSpring(0.93, {}, () => { scale.value = withSpring(1); });
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
            backgroundColor: selected ? mood.color + "22" : T.surfaceContainer,
          },
        ]}
      >
        <View style={[styles.moodDot, { backgroundColor: mood.color, opacity: selected ? 1 : 0.5 }]} />
        <Text style={[styles.moodWord, { color: selected ? mood.color : T.primary }]}>
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
  const T = useTokens();
  const styles = makeStyles(T);
  const isLevelUp = !!result?.levelUp;
  const LEVEL_NAMES: Record<string, string> = {
    awareness: "الإدراك",
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
              <Text style={styles.winTitle}>+{result.xpEarned} نقاط</Text>
            </>
          )}
          {result.streakDays > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>🌿 {result.streakDays} أيام متتالية</Text>
            </View>
          )}
          {result.newWins?.map((win) => (
            <View key={win.type} style={styles.winRow}>
              <Text style={styles.winRowLabel}>{MICRO_WIN_LABELS[win.type] ?? win.type}</Text>
              <Text style={styles.winRowPoints}>+{win.points}</Text>
            </View>
          ))}
          <Text style={styles.winEncouragement}>استمر في رحلتك — كل يوم يُحدث فرقاً 🌱</Text>
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
  const { sessionId, authFetch, gender, lastMoodWord, setLastMoodWord } = useSession();
  const T = useTokens();
  const styles = makeStyles(T);
  // Single source of truth — derived from gender so the user always
  // sees the grammatically correct form (مرتاح / مرتاحة, etc).
  const MOODS = useMemo(() => MOOD_OPTIONS[gender], [gender]);
  const moodQuestion = getMoodQuestion(gender);
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; severity: "info" | "warning" | "error" | "limit" | "critical" | "safety" }>({
    visible: false,
    message: "",
    severity: "error",
  });

  const NOTES_MAX = LIMITS.MOOD_NOTES_MAX_CHARS;
  const NOTES_WARN = LIMITS.MOOD_NOTES_WARN_AT_CHARS;

  // ── Pre-select from home ────────────────────────────────────────────
  // When the user taps a mood chip on the home screen, SessionContext
  // stores its `en` key in lastMoodWord. We honour that here so the
  // user lands on the mood screen with their choice already selected,
  // then clear it so the selection doesn't persist across unrelated
  // future visits.
  useEffect(() => {
    if (!lastMoodWord || selectedMood) return;
    const match = findMoodByEn(gender, lastMoodWord);
    if (match) {
      setSelectedMood(match);
      setIntensity(match.intensity);
      setLastMoodWord(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMoodWord, gender]);

  function showToast(message: string, severity: typeof toast.severity = "error") {
    setToast({ visible: true, message, severity });
  }

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  async function saveCheckin() {
    if (!selectedMood) {
      showToast(ERRORS.MOOD_NOT_SELECTED.ar, "info");
      return;
    }
    if (!sessionId) {
      showToast(ERRORS.SESSION_INVALID.ar, "error");
      return;
    }
    if (notes.length > NOTES_MAX) {
      showToast(ERRORS.NOTES_TOO_LONG.ar, "warning");
      return;
    }

    setIsSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/moods/checkin`, {
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
      if (!res.ok && res.status !== 201) throw new Error("checkin_failed");

      const progressRes = await authFetch(`${API_BASE}/gamification/checkin-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, moodWord: selectedMood.en }),
      });
      // ── REL-4 fix ──────────────────────────────────────────────────────
      // The gamification endpoint can fail independently of the mood
      // checkin. We must not crash the success flow if it returns an
      // error JSON: the mood IS saved, the user shouldn't see an error.
      let progressData: WinResult | null = null;
      if (progressRes.ok) {
        try {
          progressData = await progressRes.json();
        } catch {
          progressData = null;
        }
      }
      setSaved(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (progressData && (progressData.xpEarned > 0 || (progressData.newWins?.length ?? 0) > 0)) {
        const win = progressData;
        setTimeout(() => setWinResult(win), 800);
      }
      setTimeout(() => {
        setSaved(false);
        setSelectedMood(null);
        setNotes("");
        setIntensity(3);
      }, 2000);
    } catch (err: unknown) {
      const isNetwork = err instanceof TypeError;
      if (isNetwork) {
        showToast(ERRORS.NETWORK_FAILED_RETRY.ar, "error");
      } else {
        showToast(ERRORS.UNKNOWN_ERROR.ar, "error");
      }
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: webBottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: webTop + Spacing.lg }]}>
          <Text style={styles.headerTitle}>{moodQuestion}</Text>
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
              {MOODS.map(mood => (
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
                  {[1, 2, 3, 4, 5].map(i => (
                    <Pressable
                      key={i}
                      onPress={() => {
                        setIntensity(i);
                        if (Platform.OS !== "web") Haptics.selectionAsync();
                      }}
                      style={[
                        styles.intensityDot,
                        {
                          backgroundColor: i <= intensity ? T.accent : T.surfaceContainerHigh,
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
                  style={[styles.notesInput, notes.length > NOTES_MAX && styles.notesInputError]}
                  value={notes}
                  onChangeText={text => {
                    if (text.length > NOTES_MAX + 20) return;
                    setNotes(text);
                  }}
                  placeholder="أخبرني أكثر عن شعورك..."
                  placeholderTextColor={T.muted}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                  accessibilityLabel="ملاحظات المزاج"
                  accessibilityHint={`الحد الأقصى ${NOTES_MAX} حرف`}
                />
                <CharCounter current={notes.length} max={NOTES_MAX} warnAt={NOTES_WARN} />
              </Animated.View>
            )}

            {selectedMood && (
              <Animated.View entering={FadeInDown.duration(600)} style={styles.saveSection}>
                <Pressable
                  style={{ borderRadius: Radius.pill, overflow: "hidden", opacity: isSaving ? 0.7 : 1 }}
                  onPress={saveCheckin}
                  disabled={isSaving}
                >
                  <LinearGradient
                    colors={["#74C69D", "#1B4332"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtn}
                  >
                    {isSaving ? (
                      <ActivityIndicator color={T.surface} />
                    ) : (
                      <Text style={styles.saveBtnText}>حفظ المشاعر ✨</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            )}
          </>
        )}

        <View style={styles.historySection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              تتبع مشاعرك اليومي يبني رحلتك العاطفية ويساعدك على فهم نفسك أعمق.
            </Text>
          </View>
        </View>
      </ScrollView>
      {winResult && <MicroWinModal result={winResult} onClose={() => setWinResult(null)} />}
      <ErrorToast
        visible={toast.visible}
        message={toast.message}
        severity={toast.severity}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xl,
    alignItems: "flex-end",
  },
  headerTitle: {
    ...Typography.h1,
    color: T.onSurface,
    textAlign: "right",
    letterSpacing: -0.3,
  },
  headerSub: {
    ...Typography.body,
    color: T.muted,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  savedCard: {
    margin: Spacing.xxl,
    backgroundColor: T.primaryContainer,
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  savedIcon: { fontSize: 40, color: T.accent },
  savedText: {
    ...Typography.h1,
    color: T.onSurface,
  },
  savedSub: {
    ...Typography.body,
    color: T.muted,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    padding: Spacing.xl,
    justifyContent: "flex-end",
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.cardPad,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
  },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodWord: {
    ...Typography.body,
  },
  intensitySection: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg },
  sectionLabel: {
    ...Typography.h3,
    color: T.onSurface,
    textAlign: "right",
    marginBottom: Spacing.md,
  },
  intensityRow: { flexDirection: "row", gap: Spacing.md, justifyContent: "flex-end" },
  intensityDot: { width: 32, height: 32, borderRadius: 16 },
  intensityLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: Spacing.sm },
  intensityLabel: {
    ...Typography.label,
    color: T.muted,
  },
  notesSection: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg },
  notesInput: {
    backgroundColor: T.surfaceContainerHigh,
    borderRadius: Radius.md,
    padding: Spacing.cardPad,
    color: T.onSurface,
    ...Typography.body,
    minHeight: 100,
    textAlignVertical: "top",
  },
  notesInputError: {
    borderWidth: 1,
    borderColor: T.error + "66",
  },
  saveSection: { paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg },
  saveBtn: {
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: "center",
  },
  saveBtnText: {
    ...Typography.h3,
    color: T.surface,
  },
  historySection: { paddingHorizontal: Spacing.xxl, marginTop: Spacing.sm },
  infoCard: {
    backgroundColor: T.surfaceContainer,
    borderRadius: Radius.md,
    padding: Spacing.cardPad,
  },
  infoText: {
    ...Typography.body,
    color: T.muted,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4,23,16,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
  },
  winModal: {
    backgroundColor: T.surfaceContainer,
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    gap: Spacing.md,
  },
  winEmoji: { fontSize: 52 },
  winTitle: {
    ...Typography.h1,
    color: T.onSurface,
  },
  winLevel: {
    ...Typography.h2,
    color: T.accent,
  },
  streakBadge: {
    backgroundColor: T.primaryContainer,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  streakBadgeText: {
    ...Typography.bodySmall,
    color: T.accent,
  },
  winRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: Spacing.xs,
  },
  winRowLabel: {
    ...Typography.body,
    color: T.primary,
    flex: 1,
    textAlign: "right",
  },
  winRowPoints: {
    ...Typography.h3,
    color: T.accent,
  },
  winEncouragement: {
    ...Typography.body,
    color: T.muted,
    textAlign: "center",
  },
  winCloseBtn: {
    backgroundColor: T.accent,
    borderRadius: Radius.pill,
    paddingHorizontal: 28,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  winCloseBtnText: {
    ...Typography.h3,
    color: T.surface,
  },
  });
}
