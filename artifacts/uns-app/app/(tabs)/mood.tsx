import React, { useState } from "react";
import {
  ActivityIndicator,
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
    Haptics.selectionAsync();
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

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.navy }]}
      contentContainerStyle={{ paddingBottom: webBottom + 80 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: webTop + 16 }]}>
        <Text style={styles.headerTitle}>كيف تحس اليوم؟</Text>
        <Text style={styles.headerSub}>سجّل مشاعرك اليومية</Text>
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
                      Haptics.selectionAsync();
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
                  <Text style={styles.saveBtnText}>حفظ المشاعر</Text>
                )}
              </Pressable>
            </Animated.View>
          )}
        </>
      )}

      <View style={styles.historySection}>
        <Text style={styles.sectionLabel}>أهمية التتبع</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            تتبع مشاعرك اليومي يساعدك على فهم نفسك أكثر. كل مشاعر لها قيمة.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.muted,
    marginTop: 4,
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
    fontSize: 24,
    color: Colors.nearWhite,
  },
  savedSub: {
    fontFamily: "Inter_400Regular",
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodWord: {
    fontFamily: "Amiri_400Regular",
    fontSize: 16,
  },
  intensitySection: {
    paddingHorizontal: 20,
    marginBottom: 8,
    alignItems: "flex-end",
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 12,
    textAlign: "right",
    letterSpacing: 0.5,
  },
  intensityRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  intensityDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  intensityLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  intensityLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.muted,
  },
  notesSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: Colors.navyCard,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: Colors.nearWhite,
    fontFamily: "Amiri_400Regular",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 80,
    textAlign: "right",
  },
  saveSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.navy,
  },
  historySection: {
    paddingHorizontal: 20,
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
    fontSize: 16,
    color: Colors.muted,
    textAlign: "right",
    lineHeight: 26,
  },
});
