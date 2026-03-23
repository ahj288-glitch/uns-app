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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import * as Haptics from "expo-haptics";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

const MOOD_THEME_COLORS: Record<string, string> = {
  anxiety: "#6B7FD7",
  gratitude: "#C9A84C",
  reflection: "#10B981",
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
  const color = MOOD_THEME_COLORS[session.moodTheme] ?? "#C9A84C";
  const icon = MOOD_THEME_ICONS[session.moodTheme] ?? "💫";
  const isFull = session.participantCount >= session.maxParticipants;

  return (
    <Pressable style={[styles.sessionCard, { borderColor: color + "30" }]} onPress={onEnter}>
      <View style={[styles.sessionIconCircle, { backgroundColor: color + "15" }]}>
        <Text style={styles.sessionIcon}>{icon}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{session.titleAr}</Text>
        <Text style={styles.sessionDesc} numberOfLines={2}>{session.descriptionAr}</Text>
        <View style={styles.sessionMeta}>
          <View style={styles.sessionMetaItem}>
            <Feather name="users" size={12} color={color} />
            <Text style={[styles.sessionMetaText, { color: color }]}>
              {session.participantCount} مشارك
            </Text>
          </View>
          <View style={styles.sessionMetaItem}>
            <Feather name="clock" size={12} color="rgba(255,255,255,0.3)" />
            <Text style={styles.sessionMetaGrey}>
              {session.durationMinutes} دقيقة
            </Text>
          </View>
        </View>
      </View>
      <View style={[styles.joinBtn, { backgroundColor: color + "20", borderColor: color + "40" }]}>
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
        <Feather name="heart" size={16} color={hearted ? "#E94D6D" : "rgba(255,255,255,0.3)"} />
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
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
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
    } catch {
      Alert.alert("خطأ", "تعذّر نشر الرسالة. حاول مرة أخرى.");
    } finally {
      setPosting(false);
    }
  };

  if (activeSession) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 80}
      >
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <Pressable onPress={() => setActiveSession(null)} style={styles.backBtn}>
            <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.6)" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.sessionHeaderTitle}>{activeSession.titleAr}</Text>
            <Text style={styles.sessionHeaderSub}>
              {activeSession.participantCount} مشارك · مجهول الهوية تماماً
            </Text>
          </View>
        </View>

        {/* Safety Notice */}
        <View style={styles.safetyBanner}>
          <Feather name="shield" size={14} color={Colors.gold} />
          <Text style={styles.safetyText}>
            مساحة آمنة · بدون هوية حقيقية · جميع المشاركات مراجَعة
          </Text>
        </View>

        {/* Posts */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {postsLoading ? (
            <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
          ) : (
            posts.map(p => (
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
            ))
          )}
        </ScrollView>

        {/* Post Input */}
        <View style={[styles.postInputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.postInput}
            value={newPost}
            onChangeText={setNewPost}
            placeholder="شارك ما تشعر به... أنت في أمان هنا"
            placeholderTextColor="rgba(255,255,255,0.3)"
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
              ? <ActivityIndicator size="small" color="#0B0E18" />
              : <Feather name="send" size={18} color="#0B0E18" />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.screenTitle}>المساحة الآمنة</Text>
        <Text style={styles.screenSubtitle}>لست وحدك في هذا</Text>
      </Animated.View>

      {/* Principles */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.principlesCard}>
        {[
          { icon: "👤", text: "هوية مجهولة تماماً" },
          { icon: "🤝", text: "استماع بلا حكم" },
          { icon: "🛡️", text: "مراقبة ذكاء اصطناعي" },
        ].map((p) => (
          <View key={p.text} style={styles.principleRow}>
            <Text style={styles.principleIcon}>{p.icon}</Text>
            <Text style={styles.principleText}>{p.text}</Text>
          </View>
        ))}
      </Animated.View>

      <Text style={styles.listTitle}>الدوائر المفتوحة</Text>

      {loading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />
      ) : (
        sessions.map((session, i) => (
          <Animated.View
            key={session.id}
            entering={FadeInDown.duration(500).delay(150 + i * 80)}
          >
            <SessionCard session={session} onEnter={() => enterSession(session)} />
          </Animated.View>
        ))
      )}

      {/* Reflection Prompt */}
      <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.reflectionCard}>
        <Text style={styles.reflectionTitle}>تذكّر</Text>
        <Text style={styles.reflectionText}>
          ما تشعر به الآن لا يُعرّفك. أنت أكثر مما تمر به في هذه اللحظة.
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.navyDeep },
  header: { padding: 24, paddingBottom: 8, alignItems: "flex-end" },
  screenTitle: { fontFamily: "Amiri_700Bold", fontSize: 32, color: "#F2EBD9" },
  screenSubtitle: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    color: "rgba(242,235,217,0.5)",
    marginTop: 2,
  },
  principlesCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  principleRow: { alignItems: "center", gap: 6, flex: 1 },
  principleIcon: { fontSize: 20 },
  principleText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 11,
    color: "rgba(242,235,217,0.6)",
    textAlign: "center",
  },
  listTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 18,
    color: "#F2EBD9",
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
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
  },
  sessionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shrink: 0,
  } as any,
  sessionIcon: { fontSize: 24 },
  sessionInfo: { flex: 1 },
  sessionTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 16,
    color: "#F2EBD9",
    textAlign: "right",
  },
  sessionDesc: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(242,235,217,0.5)",
    textAlign: "right",
    marginTop: 4,
    lineHeight: 18,
  },
  sessionMeta: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  sessionMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  sessionMetaText: { fontFamily: "Amiri_400Regular", fontSize: 12 },
  sessionMetaGrey: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  joinBtnText: { fontFamily: "Amiri_700Bold", fontSize: 13 },
  reflectionCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "rgba(201,168,76,0.06)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.15)",
  },
  reflectionTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 14,
    color: Colors.gold,
    textAlign: "right",
    marginBottom: 8,
  },
  reflectionText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 15,
    color: "rgba(242,235,217,0.7)",
    textAlign: "right",
    lineHeight: 24,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  backBtn: { padding: 8 },
  sessionHeaderTitle: {
    fontFamily: "Amiri_700Bold",
    fontSize: 18,
    color: "#F2EBD9",
  },
  sessionHeaderSub: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(201,168,76,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201,168,76,0.1)",
    justifyContent: "flex-end",
  },
  safetyText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 12,
    color: "rgba(201,168,76,0.8)",
  },
  postCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postName: {
    fontFamily: "Amiri_700Bold",
    fontSize: 13,
    color: Colors.gold,
  },
  postTime: {
    fontFamily: "Amiri_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  postContent: {
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    color: "rgba(242,235,217,0.85)",
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
    fontFamily: "Amiri_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
  },
  postInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: Colors.navyDeep,
  },
  postInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 12,
    paddingTop: 12,
    color: "#F2EBD9",
    fontFamily: "Amiri_400Regular",
    fontSize: 14,
    minHeight: 48,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
