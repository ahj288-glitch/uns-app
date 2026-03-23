import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const PROMPTS = [
  "ما الذي يشغل تفكيرك الآن؟",
  "ماذا أردت أن تقول اليوم ولم تقله؟",
  "ما الشيء الذي تشعر بالامتنان له هذه اللحظة؟",
  "صِف يومك بكلمة واحدة. لماذا هذه الكلمة؟",
  "ما الذي تحتاجه اليوم دون أن تطلبه من أحد؟",
  "أيّ لحظة من اليوم تريد أن تتذكرها؟",
  "ما الشيء الصغير الذي أضحكك أو لفت نظرك اليوم؟",
  "ما الذي يُقلقك، وما الذي تُريد أن يحدث بدلاً منه؟",
];

const MOODS = [
  { key: "happy", label: "سعيد", emoji: "😊", color: "#74C69D" },
  { key: "calm", label: "هادئ", emoji: "😌", color: "#74C69D" },
  { key: "grateful", label: "ممتنّ", emoji: "🙏", color: "#85d7ad" },
  { key: "tired", label: "متعب", emoji: "😔", color: "#a0b0a8" },
  { key: "anxious", label: "قلق", emoji: "😟", color: "#e9c46a" },
  { key: "sad", label: "حزين", emoji: "😢", color: "#8db4d4" },
  { key: "reflective", label: "متأمّل", emoji: "🌙", color: "#b8a9d4" },
  { key: "hopeful", label: "متفائل", emoji: "✨", color: "#74C69D" },
];

const SAMPLE_ENTRIES = [
  {
    id: "1",
    date: "اليوم",
    time: "10:32 م",
    mood: { label: "هادئ", emoji: "😌" },
    preview: "كان يوماً هادئاً. لاحظت أنني أقل توتراً من المعتاد...",
    wordCount: 147,
    hasReflection: true,
  },
  {
    id: "2",
    date: "أمس",
    time: "9:15 م",
    mood: { label: "قلق", emoji: "😟" },
    preview: "لم أنم جيداً الليلة الماضية. الأفكار كانت تتقافز...",
    wordCount: 89,
    hasReflection: false,
  },
  {
    id: "3",
    date: "الثلاثاء",
    time: "8:50 م",
    mood: { label: "ممتنّ", emoji: "🙏" },
    preview: "تذكرت اليوم لحظة صغيرة جعلتني أبتسم. كانت قهوتي ساخنة...",
    wordCount: 213,
    hasReflection: true,
  },
];

type View = "list" | "write" | "entry";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<View>("list");
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [showSaved, setShowSaved] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const saveScale = useSharedValue(1);

  const charCount = text.length;
  const MAX_CHARS = 3000;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSave = useCallback(() => {
    if (!text.trim()) return;
    saveScale.value = withSpring(0.95, { damping: 12 }, () => {
      saveScale.value = withSpring(1);
    });
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
      setView("list");
      setText("");
      setSelectedMood(null);
    }, 1400);
    Keyboard.dismiss();
  }, [text]);

  const refreshPrompt = () => {
    const current = PROMPTS.indexOf(prompt);
    const next = (current + 1) % PROMPTS.length;
    setPrompt(PROMPTS[next]);
  };

  const saveAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveScale.value }] }));

  if (view === "write") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={[styles.writeHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => { setView("list"); setText(""); setSelectedMood(null); }} style={styles.backBtn}>
            <Feather name="x" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.writeTitle}>تدوينة جديدة</Text>
          <Animated.View style={saveAnimStyle}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, !text.trim() && styles.saveBtnDisabled]}
              disabled={!text.trim()}
            >
              <Text style={[styles.saveBtnText, !text.trim() && { color: Colors.textMuted }]}>حفظ</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Mood selector */}
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Text style={styles.sectionLabel}>كيف تشعر؟</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setSelectedMood(m.key === selectedMood ? null : m.key)}
                  style={[styles.moodChip, selectedMood === m.key && { backgroundColor: Colors.primaryContainer, borderColor: Colors.primary }]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, selectedMood === m.key && { color: Colors.primary }]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Prompt */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.promptBox}>
            <View style={styles.promptRow}>
              <TouchableOpacity onPress={refreshPrompt} style={styles.promptRefreshBtn}>
                <Feather name="refresh-cw" size={13} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.promptLabel}>اقتراح</Text>
            </View>
            <Text style={styles.promptText} dir="rtl">{prompt}</Text>
          </Animated.View>

          {/* Text input */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <TextInput
              ref={inputRef}
              style={styles.journalInput}
              value={text}
              onChangeText={setText}
              placeholder="ابدأ بكتابة أفكارك هنا... لا أحد سيقرأ هذا سواك"
              placeholderTextColor={Colors.textMuted + "80"}
              multiline
              textAlign="right"
              maxLength={MAX_CHARS}
              autoFocus
            />
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.writeFooter, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.footerLeft}>
            <Feather name="lock" size={12} color={Colors.textMuted} />
            <Text style={styles.footerPrivate}>خاص تماماً</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.wordCountText}>{wordCount} كلمة</Text>
            {charCount > MAX_CHARS * 0.85 && (
              <Text style={[styles.charCountText, charCount > MAX_CHARS * 0.95 && { color: "#ffb4ab" }]}>
                {MAX_CHARS - charCount} متبقٍ
              </Text>
            )}
          </View>
        </View>

        {showSaved && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.savedToast}>
            <Feather name="check-circle" size={16} color={Colors.primary} />
            <Text style={styles.savedToastText}>تم حفظ تدوينتك ✓</Text>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>مفكّرتي</Text>
          <Text style={styles.headerSub}>مساحتك الخاصة — لا أحد يقرأها سواك</Text>
        </View>
        <TouchableOpacity onPress={() => setView("write")} style={styles.newEntryBtn}>
          <Feather name="edit-3" size={16} color={Colors.background} />
          <Text style={styles.newEntryBtnText}>تدوينة</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
      >
        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.statsRow}>
          {[
            { label: "تدوينات", value: "14" },
            { label: "سلسلة أيام", value: "5" },
            { label: "هذا الشهر", value: "8" },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Today prompt if no entry */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.todayPromptCard}>
          <View style={styles.todayPromptTop}>
            <Feather name="sun" size={16} color={Colors.primary} />
            <Text style={styles.todayPromptLabel}>سؤال اليوم</Text>
          </View>
          <Text style={styles.todayPromptText} dir="rtl">{PROMPTS[0]}</Text>
          <TouchableOpacity onPress={() => setView("write")} style={styles.writeNowBtn}>
            <Text style={styles.writeNowBtnText}>اكتب الآن</Text>
            <Feather name="arrow-left" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Entries */}
        <Text style={styles.sectionHeading}>آخر التدوينات</Text>
        {SAMPLE_ENTRIES.map((entry, i) => (
          <Animated.View key={entry.id} entering={FadeInDown.delay(150 + i * 60).springify()}>
            <TouchableOpacity style={styles.entryCard} activeOpacity={0.75}>
              <View style={styles.entryTop}>
                <View style={styles.entryMeta}>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>
                <View style={styles.entryMoodPill}>
                  <Text style={styles.entryMoodEmoji}>{entry.mood.emoji}</Text>
                  <Text style={styles.entryMoodLabel}>{entry.mood.label}</Text>
                </View>
              </View>
              <Text style={styles.entryPreview} dir="rtl" numberOfLines={2}>{entry.preview}</Text>
              <View style={styles.entryFooter}>
                <Text style={styles.entryWordCount}>{entry.wordCount} كلمة</Text>
                {entry.hasReflection && (
                  <View style={styles.reflectionBadge}>
                    <Feather name="message-circle" size={11} color={Colors.primary} />
                    <Text style={styles.reflectionBadgeText}>رد المرافق</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Privacy notice */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.privacyNotice}>
          <Feather name="shield" size={14} color={Colors.textMuted} />
          <Text style={styles.privacyNoticeText}>تدويناتك مشفّرة ولا يمكن لأحد من فريق أُنْس قراءتها</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 24,
    color: Colors.text,
    textAlign: "right",
  },
  headerSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 2,
  },
  newEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newEntryBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.background,
  },
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: Colors.primary,
  },
  statLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  todayPromptCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  todayPromptTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  todayPromptLabel: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 12,
    color: Colors.primary,
  },
  todayPromptText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 14,
  },
  writeNowBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  writeNowBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.primary,
  },
  sectionHeading: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  entryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryMeta: {
    alignItems: "flex-start",
  },
  entryDate: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 12,
    color: Colors.text,
  },
  entryTime: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
  },
  entryMoodPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  entryMoodEmoji: {
    fontSize: 13,
  },
  entryMoodLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.primary,
  },
  entryPreview: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 10,
  },
  entryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  entryWordCount: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
  },
  reflectionBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryContainer + "80",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  reflectionBadgeText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.primary,
  },
  privacyNotice: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.card + "80",
    borderRadius: 14,
  },
  privacyNoticeText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "right",
    flex: 1,
  },

  // Write view
  writeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 0,
  },
  backBtn: {
    padding: 6,
  },
  writeTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.card,
  },
  saveBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.background,
  },
  sectionLabel: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "right",
    marginBottom: 10,
  },
  moodChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  moodEmoji: {
    fontSize: 15,
  },
  moodLabel: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  promptBox: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  promptRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 8,
  },
  promptLabel: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 11,
    color: Colors.primary,
  },
  promptRefreshBtn: {
    padding: 4,
  },
  promptText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: "right",
  },
  journalInput: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.text,
    lineHeight: 26,
    textAlign: "right",
    minHeight: 200,
    padding: 0,
  },
  writeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.card,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerPrivate: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wordCountText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
  },
  charCountText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: "#e9c46a",
  },
  savedToast: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  savedToastText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.primary,
  },
});
