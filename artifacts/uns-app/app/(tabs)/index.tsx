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
import { Feather, Ionicons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
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
  { country: "السعودية", name: "إتصال", number: "920033360" },
  { country: "الإمارات", name: "800HOPE", number: "800-4673" },
  { country: "مصر", name: "دعم الصحة النفسية", number: "08008880700" },
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[
        styles.bubbleWrapper,
        isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperCompanion,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarDot}>
          <Text style={styles.avatarText}>أ</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleCompanion,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.bubbleTextUser : styles.bubbleTextCompanion,
          ]}
        >
          {message.content}
        </Text>
        {message.crisisDetected && (
          <View style={styles.crisisBox}>
            <Feather name="phone" size={12} color={Colors.terracotta} />
            <Text style={styles.crisisText}>
              {CRISIS_RESOURCES.map(r => `${r.country}: ${r.number}`).join("  |  ")}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const MOOD_PROMPTS = [
  "كيف تحس اليوم؟",
  "ايش الذي يشغل بالك؟",
  "كيف مر يومك؟",
  "شاركني شيء من مشاعرك",
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, greeting, isReady } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const inputRef = useRef<TextInput>(null);

  const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  const promptIndex = Math.floor(Date.now() / 86400000) % MOOD_PROMPTS.length;
  const todayPrompt = MOOD_PROMPTS[promptIndex];

  async function sendMessage() {
    if (!input.trim() || !sessionId || isSending) return;
    const text = input.trim();
    setInput("");
    setShowGreeting(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
    setMessages(prev => [userMsg, ...prev]);
    setIsSending(true);

    try {
      const res = await fetch(`${BASE}/api/companion/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "companion",
        content: "عذراً، حدث خطأ. حاول مرة أخرى.",
        createdAt: new Date(),
      };
      setMessages(prev => [errMsg, ...prev]);
    } finally {
      setIsSending(false);
    }
  }

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: Colors.navy }]}>
      <View style={[styles.header, { paddingTop: webTop + 8 }]}>
        <Text style={styles.headerTitle}>أُنس</Text>
        <Text style={styles.headerSub}>رفيقك دايماً</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {showGreeting && messages.length === 0 ? (
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={styles.greetingContainer}
          >
            <View style={styles.orb} />
            <View style={styles.greetingCard}>
              <Text style={styles.greetingCalligraphy}>أُنس</Text>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.greetingPrompt}>{todayPrompt}</Text>
            </View>
            <View style={styles.quickPrompts}>
              {["تعبان اليوم", "مبسوط", "قلقان", "محتاج أتكلم"].map((q) => (
                <Pressable
                  key={q}
                  style={styles.quickChip}
                  onPress={() => { setInput(q); inputRef.current?.focus(); }}
                >
                  <Text style={styles.quickChipText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted
            contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!!messages.length}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListFooterComponent={
              isSending ? (
                <View style={styles.typingIndicator}>
                  <View style={styles.avatarDot}>
                    <Text style={styles.avatarText}>أ</Text>
                  </View>
                  <View style={styles.typingDots}>
                    <ActivityIndicator size="small" color={Colors.gold} />
                    <Text style={styles.typingText}>يكتب...</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(webBottom, 12) },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="اكتب هنا..."
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={500}
            textAlign="right"
            onSubmitEditing={sendMessage}
          />
          <Pressable
            style={[
              styles.sendBtn,
              { opacity: input.trim() && !isSending ? 1 : 0.4 },
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || isSending}
          >
            <Ionicons name="arrow-up" size={20} color={Colors.navy} />
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
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 28,
    color: Colors.gold,
    letterSpacing: 1,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  greetingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  orb: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.gold,
    opacity: 0.04,
    top: "20%",
  },
  greetingCard: {
    alignItems: "center",
    gap: 12,
  },
  greetingCalligraphy: {
    fontFamily: "Amiri_700Bold",
    fontSize: 56,
    color: Colors.gold,
    opacity: 0.9,
  },
  greetingText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 22,
    color: Colors.nearWhite,
    textAlign: "center",
    lineHeight: 34,
  },
  greetingPrompt: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
  },
  quickPrompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.navyCard,
  },
  quickChipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.nearWhite,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 8,
  },
  bubbleWrapperUser: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  bubbleWrapperCompanion: {
    justifyContent: "flex-start",
  },
  avatarDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: "Amiri_700Bold",
    fontSize: 16,
    color: Colors.navy,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
  },
  bubbleUser: {
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  bubbleCompanion: {
    backgroundColor: Colors.navyCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "right",
  },
  bubbleTextUser: {
    fontFamily: "Amiri_400Regular",
    color: Colors.navy,
  },
  bubbleTextCompanion: {
    fontFamily: "Amiri_400Regular",
    color: Colors.nearWhite,
  },
  crisisBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  crisisText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.terracotta,
    flex: 1,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.navyCard,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  typingText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.muted,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.navy,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.navyCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.nearWhite,
    fontFamily: "Amiri_400Regular",
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    textAlign: "right",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
});
