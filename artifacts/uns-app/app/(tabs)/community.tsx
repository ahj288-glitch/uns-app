import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import * as Haptics from "expo-haptics";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

const MOOD_THEME_COLORS: Record<string, string> = {
  anxiety: "#6B7FD7",
  gratitude: Colors.accent,
  reflection: Colors.secondary,
  support: "#D97757",
};

const MOOD_THEME_ICONS: Record<string, string> = {
  anxiety: "🌊",
  gratitude: "✨",
  reflection: "🌿",
  support: "🤝",
};

interface Session {
  id: string;
  titleAr: string;
  descriptionAr: string;
  moodTheme: string;
  participantCount: number;
  maxParticipants: number;
  durationMinutes: number;
}

interface Post {
  id: string;
  anonymousName: string;
  contentAr: string;
  moodTag?: string;
  hearts: number;
  createdAt: string;
}

function SessionCard({ session, onEnter }: { session: Session; onEnter: () => void }) {
  const color = MOOD_THEME_COLORS[session.moodTheme] ?? Colors.accent;
  const icon = MOOD_THEME_ICONS[session.moodTheme] ?? "💫";
  const isFull = session.participantCount >= session.maxParticipants;

  return (
    <Pressable style={styles.sessionCard} onPress={onEnter}>
      <View style={[styles.sessionIconCircle, { backgroundColor: color + "20" }]}>
        <Text style={styles.sessionIcon}>{icon}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{session.titleAr}</Text>
        <Text style={styles.sessionDesc} numberOfLines={2}>{session.descriptionAr}</Text>
        <View style={styles.sessionMeta}>
          <Feather name="users" size={11} color={color} />
          <Text style={[styles.sessionMetaText, { color }]}>{session.participantCount} مشارك</Text>
          <Feather name="clock" size={11} color={Colors.muted} />
          <Text style={styles.sessionMetaGrey}>{session.durationMinutes} دقيقة</Text>
        </View>
      </View>
      <View style={[styles.joinBtn, { backgroundColor: color + "20" }]}>
        <Text style={[styles.joinBtnText, { color }]}>{isFull ? "ممتلئ" : "ادخل"}</Text>
      </View>
    </Pressable>
  );
}

function PostCard({ post, onHeart }: { post: Post; onHeart: () => void }) {
  const [hearted, setHearted] = useState(false);
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postName}>{post.anonymousName}</Text>
        <Text style={styles.postTime}>
          {new Date(post.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
      <Text style={styles.postContent}>{post.contentAr}</Text>
      <Pressable
        style={styles.heartBtn}
        onPress={() => {
          if (!hearted) {
            setHearted(true);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onHeart();
          }
        }}
      >
        <Feather name="heart" size={16} color={hearted ? "#E94D6D" : Colors.muted} />
        <Text style={[styles.heartCount, hearted && { color: "#E94D6D" }]}>
          {hearted ? post.hearts + 1 : post.hearts}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { sessionId } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const webTop = Platform.OS === "web" ? 67 : insets.top;
  const webBottom = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    fetch(`${BASE_URL}/community/sessions`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const enterSession = async (session: Session) => {
    setActiveSession(session);
    setPostsLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/community/sessions/${session.id}/posts`);
      const d = await r.json();
      setPosts(d.posts ?? []);
    } catch { setPosts([]); }
    finally { setPostsLoading(false); }
  };

  const submitPost = async () => {
    if (!activeSession || !newPost.trim() || posting) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPosting(true);
    try {
      const r = await fetch(`${BASE_URL}/community/sessions/${activeSession.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentAr: newPost.trim(), sessionId }),
      });
      const d = await r.json();
      if (d.isFlagged) {
        Alert.alert("تنبيه", "نلاحظ أن رسالتك قد تشير إلى ضائقة شديدة. يرجى التواصل مع خط الدعم: 920033360");
      } else {
        setPosts(prev => [d, ...prev]);
        setNewPost("");
      }
    } catch { Alert.alert("خطأ", "تعذّر نشر الرسالة."); }
    finally { setPosting(false); }
  };

  if (activeSession) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: webTop }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 80}
      >
        <View style={styles.sessionHeader}>
          <Pressable onPress={() => setActiveSession(null)} style={styles.backBtn}>
            <Feather name="arrow-right" size={20} color={Colors.muted} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.sessionHeaderTitle}>{activeSession.titleAr}</Text>
            <Text style={styles.sessionHeaderSub}>
              {activeSession.participantCount} مشارك · مجهول الهوية تماماً
            </Text>
          </View>
        </View>

        <View style={styles.safetyBanner}>
          <Feather name="shield" size={13} color={Colors.accent} />
          <Text style={styles.safetyText}>مساحة آمنة · بدون هوية حقيقية · جميع المشاركات مراجَعة</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {postsLoading ? (
            <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
          ) : posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              onHeart={() => {
                fetch(`${BASE_URL}/community/sessions/${activeSession.id}/heart`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ postId: p.id }),
                });
              }}
            />
          ))}
        </ScrollView>

        <View style={[styles.postInputContainer, { paddingBottom: webBottom + 8 }]}>
          <TextInput
            style={styles.postInput}
            value={newPost}
            onChangeText={setNewPost}
            placeholder="شارك ما تشعر به... أنت في أمان هنا"
            placeholderTextColor={Colors.muted}
            multiline
            maxLength={500}
            textAlign="right"
          />
          <Pressable
            style={[styles.sendBtn, (!newPost.trim() || posting) && styles.sendBtnDisabled]}
            onPress={submitPost}
            disabled={!newPost.trim() || posting}
          >
            {posting
              ? <ActivityIndicator size="small" color={Colors.surface} />
              : <Feather name="send" size={18} color={Colors.surface} />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: webTop }]}
      contentContainerStyle={{ paddingBottom: webBottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.screenTitle}>المساحة الآمنة</Text>
        <Text style={styles.screenSubtitle}>لست وحدك في هذا</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.principlesCard}>
        {[
          { icon: "👤", text: "هوية مجهولة تماماً" },
          { icon: "🤝", text: "استماع بلا حكم" },
          { icon: "🛡️", text: "مراقبة ذكاء اصطناعي" },
        ].map(p => (
          <View key={p.text} style={styles.principleRow}>
            <Text style={styles.principleIcon}>{p.icon}</Text>
            <Text style={styles.principleText}>{p.text}</Text>
          </View>
        ))}
      </Animated.View>

      <Text style={styles.listTitle}>الدوائر المفتوحة</Text>

      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : sessions.map((session, i) => (
        <Animated.View key={session.id} entering={FadeInDown.duration(500).delay(150 + i * 80)}>
          <SessionCard session={session} onEnter={() => enterSession(session)} />
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.reflectionCard}>
        <Text style={styles.reflectionTitle}>✦ تذكّر</Text>
        <Text style={styles.reflectionText}>
          ما تشعر به الآن لا يُعرّفك. أنت أكثر مما تمر به في هذه اللحظة.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { padding: 24, paddingBottom: 8, alignItems: "flex-end" },
  screenTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 32,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.muted,
    marginTop: 4,
  },
  principlesCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  principleRow: { alignItems: "center", gap: 6, flex: 1 },
  principleIcon: { fontSize: 20 },
  principleText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.primary,
    textAlign: "center",
  },
  listTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: Colors.onSurface,
    textAlign: "right",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 20,
    padding: 16,
  },
  sessionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sessionIcon: { fontSize: 24 },
  sessionInfo: { flex: 1 },
  sessionTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 16,
    color: Colors.onSurface,
    textAlign: "right",
  },
  sessionDesc: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
    textAlign: "right",
    marginTop: 4,
    lineHeight: 18,
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 8,
  },
  sessionMetaText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
  },
  sessionMetaGrey: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
  },
  reflectionCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-end",
    gap: 8,
  },
  reflectionTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.accent,
    textAlign: "right",
  },
  reflectionText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 15,
    color: Colors.primary,
    textAlign: "right",
    lineHeight: 26,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  backBtn: { padding: 8 },
  sessionHeaderTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: Colors.onSurface,
  },
  sessionHeaderSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "flex-end",
  },
  safetyText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: Colors.accent,
  },
  postCard: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postName: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: Colors.accent,
  },
  postTime: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: Colors.muted,
  },
  postContent: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 22,
    textAlign: "right",
  },
  heartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  heartCount: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: Colors.muted,
  },
  postInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: Colors.surfaceContainer,
  },
  postInput: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    padding: 12,
    color: Colors.onSurface,
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    minHeight: 44,
    maxHeight: 100,
    textAlignVertical: "top",
    textAlign: "right",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
