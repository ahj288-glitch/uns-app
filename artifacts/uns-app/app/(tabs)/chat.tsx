import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { ERRORS, LIMITS, formatError } from "@/constants/errors";
import { useSession } from "@/contexts/SessionContext";
import { getContextualSuggestions } from "@/lib/gender";
import * as Haptics from "expo-haptics";
import ErrorToast from "@/components/ui/ErrorToast";
import NetworkBanner from "@/components/ui/NetworkBanner";
import CharCounter from "@/components/ui/CharCounter";
import LimitBlocker from "@/components/ui/LimitBlocker";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "companion";
  content: string;
  createdAt: Date;
  crisisDetected?: boolean;
  isError?: boolean;
}

type ToastState = {
  visible: boolean;
  message: string;
  severity: "info" | "warning" | "error" | "critical" | "safety" | "limit";
  actionLabel?: string;
  onAction?: () => void;
};

// ─── Constants ─────────────────────────────────────────────────────────────

const CRISIS_RESOURCES = [
  { country: "السعودية", number: "920033360" },
  { country: "الإمارات", number: "800-4673" },
  { country: "مصر", number: "08008880700" },
];


// Daily limit loaded from shared config (admin-configurable)
const DAILY_LIMIT = LIMITS.CHAT_MAX_DAILY_MESSAGES;
const DAILY_WARN = LIMITS.CHAT_WARN_AT_MESSAGES;
const MAX_CHARS = LIMITS.CHAT_MAX_CHARS;
const WARN_CHARS = LIMITS.CHAT_WARN_AT_CHARS;
const RATE_LIMIT_SECONDS = LIMITS.CHAT_RATE_LIMIT_SECONDS;

// ─── Helpers ───────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getResetTimeLabel(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const hours = Math.floor((midnight.getTime() - now.getTime()) / 3600000);
  const mins = Math.floor(((midnight.getTime() - now.getTime()) % 3600000) / 60000);
  if (hours === 0) return `يتجدد خلال ${mins} دقيقة`;
  return `يتجدد خلال ${hours} ساعة و${mins} دقيقة`;
}

// ─── Sub-components ────────────────────────────────────────────────────────

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
        <View style={[styles.avatarDot, message.isError && styles.avatarDotError]}>
          <Text style={styles.avatarText}>أ</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleCompanion, message.isError && styles.bubbleError]}>
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

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId, greeting, gender, lastMoodWord } = useSession();
  const quickReplies = getContextualSuggestions(gender, lastMoodWord, new Date().getHours());

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Limit tracking
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  // Network state
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", severity: "error" });

  const rateLimitTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentAt = useRef<number>(0);
  const offlineCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  const charCount = input.length;
  const isOverCharLimit = charCount > MAX_CHARS;
  const remaining = MAX_CHARS - charCount;
  const dailyRemaining = DAILY_LIMIT - dailyCount;

  // ─── Toast helper ─────────────────────────────────────────────────────

  const showToast = useCallback((
    message: string,
    severity: ToastState["severity"] = "error",
    actionLabel?: string,
    onAction?: () => void
  ) => {
    setToast({ visible: true, message, severity, actionLabel, onAction });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // ─── Rate limit countdown ─────────────────────────────────────────────

  function startRateLimit(seconds: number) {
    setRateLimitCountdown(seconds);
    rateLimitTimer.current = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(rateLimitTimer.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ─── Offline detection (polling) ──────────────────────────────────────

  useEffect(() => {
    if (Platform.OS === "web") return;
    offlineCheckRef.current = setInterval(async () => {
      try {
        await fetch(`${BASE}/api/health`, { method: "HEAD" });
        if (isOffline) {
          setIsReconnecting(true);
          setIsOffline(false);
          setTimeout(() => setIsReconnecting(false), 2000);
          if (pendingMessage) {
            const msg = pendingMessage;
            setPendingMessage(null);
            sendMessage(msg);
          }
        }
      } catch {
        if (!isOffline) setIsOffline(true);
      }
    }, 5000);
    return () => {
      if (offlineCheckRef.current) clearInterval(offlineCheckRef.current);
    };
  }, [isOffline, pendingMessage]);

  // ─── Send message ─────────────────────────────────────────────────────

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) {
      showToast(ERRORS.EMPTY_MESSAGE.ar, "info");
      return;
    }
    if (!sessionId || isSending) return;

    // Character limit
    if (charCount > MAX_CHARS) {
      showToast(ERRORS.MESSAGE_TOO_LONG.ar, "warning");
      return;
    }

    // Daily limit
    if (dailyLimitReached || dailyCount >= DAILY_LIMIT) {
      setDailyLimitReached(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Rate limit
    const now = Date.now();
    const elapsed = (now - lastSentAt.current) / 1000;
    if (elapsed < RATE_LIMIT_SECONDS && lastSentAt.current > 0) {
      const wait = Math.ceil(RATE_LIMIT_SECONDS - elapsed);
      showToast(
        formatError(ERRORS.RATE_LIMIT, { seconds: wait }),
        "warning"
      );
      startRateLimit(wait);
      return;
    }

    // Offline
    if (isOffline) {
      setPendingMessage(msg);
      showToast(ERRORS.NETWORK_OFFLINE.ar, "warning");
      return;
    }

    setInput("");
    setShowWelcome(false);
    lastSentAt.current = Date.now();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      createdAt: new Date(),
    };
    setMessages(prev => [userMsg, ...prev]);
    setIsSending(true);

    const newCount = dailyCount + 1;
    setDailyCount(newCount);

    // Warn when approaching daily limit
    if (newCount === DAILY_WARN) {
      showToast(
        formatError(ERRORS.DAILY_LIMIT_WARNING, { remaining: DAILY_LIMIT - newCount }),
        "warning"
      );
    }

    // Attempt send with one auto-retry on AI timeout
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(`${BASE}/api/companion/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: msg }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          // Server error — not a network issue
          const companionErr: Message = {
            id: (Date.now() + 1).toString(),
            role: "companion",
            content: ERRORS.AI_PROVIDER_ERROR.ar,
            createdAt: new Date(),
            isError: true,
          };
          setMessages(prev => [companionErr, ...prev]);
          showToast(ERRORS.AI_PROVIDER_ERROR.ar, "error", "حاول مجدداً", () => {
            setDailyCount(c => c - 1);
            sendMessage(msg);
          });
          break;
        }

        const data = await res.json();

        if (!data.response) {
          setMessages(prev => [
            {
              id: (Date.now() + 1).toString(),
              role: "companion",
              content: ERRORS.AI_INVALID_RESPONSE.ar,
              createdAt: new Date(),
              isError: true,
            },
            ...prev,
          ]);
          showToast(ERRORS.AI_INVALID_RESPONSE.ar, "error");
          break;
        }

        const companionMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "companion",
          content: data.response,
          createdAt: new Date(),
          crisisDetected: data.crisisDetected,
        };
        setMessages(prev => [companionMsg, ...prev]);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        const isNetwork = err instanceof TypeError;

        if (isNetwork) {
          // Actual network failure
          setIsOffline(true);
          setPendingMessage(msg);
          showToast(ERRORS.NETWORK_OFFLINE.ar, "warning");
          setDailyCount(c => c - 1);
          break;
        }

        if (isAbort && attempt < maxAttempts) {
          // Timeout — show auto-retry toast and loop
          showToast(ERRORS.AI_TIMEOUT.ar, "warning");
          continue;
        }

        // All retries exhausted
        const companionErr: Message = {
          id: (Date.now() + 1).toString(),
          role: "companion",
          content: ERRORS.AI_ALL_PROVIDERS_DOWN.ar,
          createdAt: new Date(),
          isError: true,
        };
        setMessages(prev => [companionErr, ...prev]);
        showToast(ERRORS.AI_ALL_PROVIDERS_DOWN.ar, "critical", "حاول لاحقاً", hideToast);
        setDailyCount(c => c - 1);
        break;
      }
    }

    setIsSending(false);
  }

  // ─── Input guard ──────────────────────────────────────────────────────

  const canSend =
    input.trim().length > 0 &&
    !isSending &&
    !isOverCharLimit &&
    !dailyLimitReached &&
    rateLimitCountdown === 0 &&
    dailyCount < DAILY_LIMIT;

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }]}>
      <NetworkBanner offline={isOffline} reconnecting={isReconnecting} />

      <View style={[styles.header, { paddingTop: webTop + 12 }]}>
        <Pressable onPress={() => router.push("/(tabs)/community")} style={styles.headerBtn}>
          <Feather name="users" size={18} color={Colors.muted} />
        </Pressable>
        <Text style={styles.headerTitle}>أُنْس</Text>
        <View style={styles.headerRight}>
          {dailyCount > 0 && !dailyLimitReached && (
            <View style={[styles.msgCountPill, dailyCount >= DAILY_WARN && styles.msgCountPillWarn]}>
              <Feather name="message-circle" size={10} color={dailyCount >= DAILY_WARN ? "#F4B942" : Colors.muted} />
              <Text style={[styles.msgCountText, dailyCount >= DAILY_WARN && styles.msgCountTextWarn]}>
                {dailyRemaining}
              </Text>
            </View>
          )}
          <View style={styles.headerOnlineDot} />
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
        {dailyLimitReached ? (
          <LimitBlocker
            icon="moon"
            title="وصلت لحد اليوم"
            message={ERRORS.DAILY_LIMIT_REACHED.ar}
            resetLabel={getResetTimeLabel()}
            actionLabel="جرّب تمرين التنفس"
            onAction={() => router.push("/(tabs)/journey")}
          />
        ) : showWelcome && messages.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.welcomeContainer}>
            <TimestampPill date={new Date()} />
            <View style={styles.companionWelcome}>
              <View style={styles.avatarDot}>
                <Text style={styles.avatarText}>أ</Text>
              </View>
              <View style={styles.welcomeBubble}>
                <Text style={styles.welcomeText}>
                  {greeting || "أهلاً بك في مساحتك الهادئة."}
                </Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={m => m.id}
            renderItem={({ item, index }) => {
              const olderMsg = messages[index + 1];
              const showSep =
                olderMsg && !isSameDay(new Date(item.createdAt), new Date(olderMsg.createdAt));
              return (
                <>
                  <MessageBubble message={item} />
                  {showSep && <TimestampPill date={new Date(olderMsg.createdAt)} />}
                </>
              );
            }}
            inverted
            contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListHeaderComponent={
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
            ListFooterComponent={
              messages.length > 0 ? (
                <TimestampPill date={new Date(messages[messages.length - 1].createdAt)} />
              ) : null
            }
          />
        )}

        {!dailyLimitReached && quickReplies.length > 0 && (
          <View style={styles.quickRepliesRow}>
            {quickReplies.map(q => (
              <Pressable
                key={q}
                style={[styles.quickChip, rateLimitCountdown > 0 && styles.quickChipDisabled]}
                onPress={() => sendMessage(q)}
                disabled={rateLimitCountdown > 0 || isSending}
              >
                <Text style={styles.quickChipText}>{q}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {!dailyLimitReached && (
          <>
            <CharCounter current={charCount} max={MAX_CHARS} warnAt={WARN_CHARS} />

            <View style={[styles.inputContainer, { paddingBottom: Math.max(webBottom + 72, 80) }]}>
              <BlurView
                intensity={Platform.OS === "ios" ? 40 : 0}
                tint="dark"
                style={[styles.inputBar, isOverCharLimit && styles.inputBarError]}
              >
                <Pressable style={styles.attachBtn}>
                  <Feather name="plus" size={20} color={Colors.muted} />
                </Pressable>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={text => {
                    if (text.length > MAX_CHARS + 20) return;
                    setInput(text);
                  }}
                  placeholder={
                    rateLimitCountdown > 0
                      ? `انتظر ${rateLimitCountdown}ث...`
                      : "اكتب ما يدور في خاطرك..."
                  }
                  placeholderTextColor={Colors.muted}
                  multiline
                  textAlign="right"
                  editable={!isSending && rateLimitCountdown === 0}
                  accessibilityLabel="حقل الرسالة"
                  accessibilityHint={`الحد الأقصى ${MAX_CHARS} حرف، ${remaining} متبقٍ`}
                />
              </BlurView>
              <Pressable
                style={{ borderRadius: 21, overflow: "hidden", opacity: canSend ? 1 : 0.4 }}
                onPress={() => sendMessage()}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel="إرسال الرسالة"
                accessibilityState={{ disabled: !canSend }}
              >
                <LinearGradient
                  colors={["#74C69D", "#1B4332"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendBtn}
                >
                  {rateLimitCountdown > 0 ? (
                    <Text style={styles.countdownText}>{rateLimitCountdown}</Text>
                  ) : (
                    <Feather name="arrow-right" size={18} color={Colors.surface} />
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      <ErrorToast
        visible={toast.visible}
        message={toast.message}
        severity={toast.severity}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
        onDismiss={hideToast}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

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
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  msgCountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  msgCountPillWarn: {
    backgroundColor: "#F4B94222",
  },
  msgCountText: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 11,
    color: Colors.muted,
  },
  msgCountTextWarn: {
    color: "#F4B942",
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  timestampPillWrap: {
    alignItems: "center",
    marginVertical: 10,
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
  avatarDotError: {
    backgroundColor: Colors.error + "22",
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
  bubbleError: {
    backgroundColor: Colors.error + "18",
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
  quickChipDisabled: {
    opacity: 0.4,
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
    backgroundColor: Platform.OS === "ios" ? "rgba(26,46,38,0.85)" : Colors.surfaceContainerHigh,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    overflow: "hidden",
  },
  inputBarError: {
    borderWidth: 1,
    borderColor: Colors.error + "66",
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
  countdownText: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 14,
    color: Colors.surface,
  },
});
