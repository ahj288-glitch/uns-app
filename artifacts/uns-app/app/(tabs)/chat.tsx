import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import * as Haptics from "expo-haptics";

interface Message {
  id: string;
  role: "user" | "companion";
  content: string;
  createdAt: Date;
  emotion?: string;
  crisisDetected?: boolean;
}

const CRISIS_RESOURCES = [
  { country: "السعودية", number: "920033360" },
  { country: "الإمارات", number: "800-4673" },
  { country: "مصر", number: "08008880700" },
];

const QUICK_REPLIES = ["أحتاج هدوء", "تفريغ", "تعزيز الطاقة"];

function TimestampPill({ date }: { date: Date }) {
  const label = date.toLocaleDateString("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <View style={styles.timestampPillWrap}>
      <View style={styles.timestampPill}>
        <Text style={styles.timestampText}>{label}</Text>
      </View>
    </View>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperCompanion]}
    >
      {!isUser && (
        <View style={styles.avatarDot}>
          <Text style={styles.avatarText}>أ</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCompanion]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextCompanion]}>
          {message.content}
        </Text>
        {message.crisisDetected && (
          <View style={styles.crisisBox}>
            <Feather name="phone" size={11} color={Colors.error} />
            <Text style={styles.crisisText}>
              {CRISIS_RESOURCES.map(r => `${r.country}: ${r.number}`).join("  |  ")}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, greeting } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || !sessionId || isSending) return;
    setInput("");
    setShowWelcome(false);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, createdAt: new Date() };
    setMessages(prev => [userMsg, ...prev]);
    setIsSending(true);

    try {
      const res = await fetch(`${BASE}/api/companion/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: msg }),
      });
      const data = await res.json();
      const companionMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "companion",
        content: data.response,
        createdAt: new Date(),
        emotion: data.emotion,
        crisisDetected: data.crisisDetected,
      };
      setMessages(prev => [companionMsg, ...prev]);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setMessages(prev => [{ id: (Date.now() + 1).toString(), role: "companion", content: "عذراً، حدث خطأ. حاول مرة أخرى.", createdAt: new Date() }, ...prev]);
    } finally {
      setIsSending(false);
    }
  }

  const canSend = input.trim().length > 0 && !isSending;

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }]}>
      <View style={[styles.header, { paddingTop: webTop + 12 }]}>
        <View style={styles.headerOnlineDot} />
        <Text style={styles.headerTitle}>أُنْس</Text>
        <Feather name="menu" size={20} color={Colors.muted} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
        {showWelcome && messages.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.welcomeContainer}>
            <TimestampPill date={new Date()} />
            <View style={styles.companionWelcome}>
              <View style={styles.avatarDot}>
                <Text style={styles.avatarText}>أ</Text>
              </View>
              <View style={styles.welcomeBubble}>
                <Text style={styles.welcomeText}>{greeting || "أهلاً بك في مساحتك الهادئة."}</Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted
            contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListFooterComponent={
              isSending ? (
                <View style={styles.typingRow}>
                  <View style={styles.avatarDot}>
                    <Text style={styles.avatarText}>أ</Text>
                  </View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={Colors.accent} />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {QUICK_REPLIES.length > 0 && (
          <View style={styles.quickRepliesRow}>
            {QUICK_REPLIES.map(q => (
              <Pressable key={q} style={styles.quickChip} onPress={() => sendMessage(q)}>
                <Text style={styles.quickChipText}>{q}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: Math.max(webBottom + 72, 80) }]}>
          <View style={styles.inputBar}>
            <Pressable style={styles.attachBtn}>
              <Feather name="plus" size={20} color={Colors.muted} />
            </Pressable>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="اكتب ما يدور في خاطرك..."
              placeholderTextColor={Colors.muted}
              multiline
              maxLength={500}
              textAlign="right"
            />
          </View>
          <Pressable
            style={{ borderRadius: 21, overflow: "hidden", opacity: canSend ? 1 : 0.45 }}
            onPress={() => sendMessage()}
            disabled={!canSend}
          >
            <LinearGradient
              colors={["#74C69D", "#1B4332"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendBtn}
            >
              <Feather name="arrow-right" size={18} color={Colors.surface} />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  headerTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 22,
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  timestampPillWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  timestampPill: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  timestampText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  companionWelcome: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  avatarDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: Colors.accent,
  },
  welcomeBubble: {
    flex: 1,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
  },
  welcomeText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 16,
    color: Colors.onSurface,
    lineHeight: 26,
    textAlign: "right",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
    gap: 8,
  },
  bubbleWrapperUser: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  bubbleWrapperCompanion: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "76%",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.primaryContainer,
    borderBottomRightRadius: 4,
  },
  bubbleCompanion: {
    backgroundColor: Colors.surfaceContainer,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: "right",
  },
  bubbleTextUser: {
    fontFamily: "Tajawal_400Regular",
    color: Colors.primary,
  },
  bubbleTextCompanion: {
    fontFamily: "Tajawal_400Regular",
    color: Colors.onSurface,
  },
  crisisBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    paddingTop: 8,
  },
  crisisText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 10,
    color: Colors.error,
    flex: 1,
    textAlign: "right",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  typingBubble: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 4,
  },
  quickRepliesRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: "flex-end",
  },
  quickChip: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickChipText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.surface,
  },
  inputBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  attachBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
    fontFamily: "Tajawal_400Regular",
    minHeight: 32,
    maxHeight: 120,
    textAlign: "right",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
});
