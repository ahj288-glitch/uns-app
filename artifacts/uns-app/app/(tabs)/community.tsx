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
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Colors, { useTokens } from "@/constants/colors";
import { useSession } from "@/contexts/SessionContext";
import * as Haptics from "expo-haptics";
import EmptyState from "@/components/EmptyState";

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

const MOOD_THEME_COLORS: Record<string, string> = {
  anxiety: "#6B7FD7",
  gratitude: "#74C69D",
  reflection: "#A8C5B2",
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

const AVATAR_COLORS = ["#9BD4C0", "#A8C8E8", "#F4B8A0", "#C4A8D8", "#E8C4A0"];

function GroupAvatars() {
  const T = useTokens();
  const liveCardStyles = makeLiveCardStyles(T);
  return (
    <View style={liveCardStyles.avatarStack}>
      {AVATAR_COLORS.map((color, i) => (
        <View
          key={i}
          style={[
            liveCardStyles.avatarCircle,
            {
              backgroundColor: color,
              marginRight: i > 0 ? -10 : 0,
              zIndex: 5 - i,
            },
          ]}
        >
          <Text style={liveCardStyles.avatarEmoji}>🧍</Text>
        </View>
      ))}
    </View>
  );
}

function LiveSessionCard({ session, onEnter }: { session: Session; onEnter: () => void }) {
  const T = useTokens();
  const liveCardStyles = makeLiveCardStyles(T);
  return (
    <Pressable style={[liveCardStyles.card, { backgroundColor: T.surfaceContainer }]} onPress={onEnter}>
      <GroupAvatars />
      <Text style={[liveCardStyles.title, { color: T.onSurface }]} numberOfLines={2}>{session.titleAr}</Text>
      <View style={liveCardStyles.hostRow}>
        <Feather name="mic" size={12} color="#6B7FD7" />
        <Text style={liveCardStyles.hostText}>{session.participantCount} مشارك</Text>
      </View>
      <LinearGradient
        colors={["#3AAFA9", "#2C7873"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={liveCardStyles.joinBtn}
      >
        <Text style={liveCardStyles.joinBtnText}>
          {session.participantCount >= session.maxParticipants ? "ممتلئ" : "انضم"}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function makeLiveCardStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: T.surfaceContainer,
    borderRadius: 20,
    padding: 14,
    marginLeft: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarStack: {
    flexDirection: "row",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F5F0E8",
  },
  avatarEmoji: { fontSize: 14 },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: T.onSurface,
    textAlign: "right",
    lineHeight: 20,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "flex-end",
  },
  hostText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: "#6B7FD7",
  },
  joinBtn: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  joinBtnText: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  });
}

const MOOD_AUTHOR_LABELS: Record<string, string> = {
  anxiety: "في دائرة القلق",
  gratitude: "مع الامتنان",
  reflection: "لحظة تأمل",
  support: "طلب دعم",
};

function ReflectionPostCard({ post, onHeart }: { post: Post; onHeart: () => void }) {
  const [hearted, setHearted] = useState(false);
  const T = useTokens();
  const reflStyles = makeReflStyles(T);
  const initial = post.anonymousName?.charAt(0) ?? "أ";
  const bgColors = ["#9BD4C0", "#A8C8E8", "#F4B8A0", "#C4A8D8", "#E8C4A0"];
  const bgColor = bgColors[post.anonymousName?.charCodeAt(0) % bgColors.length] ?? "#9BD4C0";
  const authorLabel = post.moodTag
    ? (MOOD_AUTHOR_LABELS[post.moodTag] ?? post.anonymousName)
    : post.anonymousName;

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={[reflStyles.card, { backgroundColor: T.surfaceContainer }]}>
      <View style={reflStyles.row}>
        <View style={reflStyles.textCol}>
          <Text style={[reflStyles.title, { color: T.onSurface }]} numberOfLines={1}>{post.anonymousName}</Text>
          <Text style={reflStyles.author}>{authorLabel}</Text>
          <Text style={[reflStyles.preview, { color: T.muted }]} numberOfLines={2}>{post.contentAr}</Text>
          <View style={reflStyles.footerRow}>
            <Pressable
              style={reflStyles.actionBtn}
              onPress={() => {
                if (!hearted) {
                  setHearted(true);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onHeart();
                }
              }}
            >
              <Feather name="heart" size={14} color={hearted ? "#E94D6D" : "#AAAAAA"} />
              <Text style={[reflStyles.actionCount, hearted && { color: "#E94D6D" }]}>
                {hearted ? post.hearts + 1 : post.hearts}
              </Text>
            </Pressable>
            <View style={reflStyles.actionBtn}>
              <Feather name="message-circle" size={14} color="#AAAAAA" />
              <Text style={reflStyles.actionCount}>0</Text>
            </View>
          </View>
        </View>
        <View style={[reflStyles.avatarCircle, { backgroundColor: bgColor }]}>
          <Text style={reflStyles.avatarInitial}>{initial}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function makeReflStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  card: {
    backgroundColor: T.surfaceContainer,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  textCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarInitial: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  title: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 14,
    color: T.onSurface,
    textAlign: "right",
  },
  author: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: "#888888",
    textAlign: "right",
    marginTop: 1,
  },
  preview: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 13,
    color: T.muted,
    textAlign: "right",
    lineHeight: 20,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionCount: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: "#AAAAAA",
  },
  });
}

function PostCard({ post, onHeart }: { post: Post; onHeart: () => void }) {
  const [hearted, setHearted] = useState(false);
  const T = useTokens();
  const inSessionStyles = makeInSessionStyles(T);
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={[inSessionStyles.postCard, { backgroundColor: T.surfaceContainer }]}>
      <View style={inSessionStyles.postHeader}>
        <Text style={[inSessionStyles.postName, { color: T.accent }]}>{post.anonymousName}</Text>
        <Text style={inSessionStyles.postTime}>
          {new Date(post.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
      <Text style={[inSessionStyles.postContent, { color: T.onSurface }]}>{post.contentAr}</Text>
      <Pressable
        style={inSessionStyles.heartBtn}
        onPress={() => {
          if (!hearted) {
            setHearted(true);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onHeart();
          }
        }}
      >
        <Feather name="heart" size={16} color={hearted ? "#E94D6D" : "#7A9A8A"} />
        <Text style={[inSessionStyles.heartCount, hearted && { color: "#E94D6D" }]}>
          {hearted ? post.hearts + 1 : post.hearts}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function makeInSessionStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  postCard: {
    backgroundColor: T.surfaceContainer,
    borderRadius: 20,
    padding: 14,
    gap: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postName: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 13,
    color: T.accent,
  },
  postTime: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 11,
    color: "#888888",
  },
  postContent: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 14,
    color: T.onSurface,
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
    color: "#888888",
  },
  });
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const T = useTokens();
  const styles = makeStyles(T);
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
        style={[styles.containerActive, { paddingTop: webTop }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 80}
      >
        <View style={styles.sessionHeader}>
          <Pressable onPress={() => setActiveSession(null)} style={styles.backBtn}>
            <Feather name="arrow-right" size={20} color="#555555" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={styles.sessionHeaderTitle}>{activeSession.titleAr}</Text>
            <Text style={styles.sessionHeaderSub}>
              {activeSession.participantCount} مشارك · مجهول الهوية تماماً
            </Text>
          </View>
        </View>

        <View style={styles.safetyBanner}>
          <Feather name="shield" size={13} color={"#74C69D"} />
          <Text style={styles.safetyText}>مساحة آمنة · بدون هوية حقيقية · جميع المشاركات مراجَعة</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {postsLoading ? (
            <ActivityIndicator color={"#74C69D"} style={{ marginTop: 40 }} />
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
            placeholderTextColor="#AAAAAA"
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
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Feather name="send" size={18} color="#FFFFFF" />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const sessionReflections: Post[] = sessions.map(s => ({
    id: s.id,
    anonymousName: s.titleAr,
    contentAr: s.descriptionAr,
    moodTag: s.moodTheme,
    hearts: s.participantCount,
    createdAt: new Date().toISOString(),
  }));

  return (
    <LinearGradient colors={T.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: webBottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBar, { paddingTop: webTop + 8 }]}>
        <Pressable style={styles.headerBtn}>
          <Feather name="chevron-right" size={20} color="#555555" />
        </Pressable>
        <Text style={styles.headerTitle}>أُنْس: واحة الأمان</Text>
        <Pressable style={styles.headerBtn}>
          <Feather name="user" size={20} color="#555555" />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionSeeAll}>عرض الكل</Text>
        <Text style={styles.sectionTitle}>حلقات مباشرة</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={"#74C69D"} style={{ marginLeft: 16, marginTop: 40, marginBottom: 20 }} />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="users"
          title="لا توجد دوائر حالياً"
          subtitle="ستظهر هنا دوائر المجتمع الآمنة عند إضافتها"
        />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.liveScrollContent}
          style={styles.liveScroll}
        >
          {sessions.map(session => (
            <LiveSessionCard key={session.id} session={session} onEnter={() => enterSession(session)} />
          ))}
        </ScrollView>
      )}

      {sessionReflections.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTrending}>الأبرز</Text>
            <Text style={styles.sectionTitle}>تأملات يومية</Text>
          </View>

          <View style={styles.reflectionsList}>
            {sessionReflections.map(post => (
              <ReflectionPostCard
                key={post.id}
                post={post}
                onHeart={() => {}}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
    </LinearGradient>
  );
}

function makeStyles(T: import("@/constants/colors").ColorTokens) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  containerActive: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: T.onSurface,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: T.onSurface,
    textAlign: "right",
  },
  sectionSeeAll: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 12,
    color: T.accent,
  },
  sectionTrending: {
    fontFamily: "BeVietnamPro_500Medium",
    fontSize: 12,
    color: T.muted,
  },
  liveScroll: {
    marginBottom: 4,
  },
  liveScrollContent: {
    paddingRight: 16,
    paddingLeft: 4,
  },
  reflectionsList: {
    paddingHorizontal: 16,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: T.surface,
  },
  backBtn: { padding: 8 },
  sessionHeaderTitle: {
    fontFamily: "Tajawal_700Bold",
    fontSize: 18,
    color: T.onSurface,
  },
  sessionHeaderSub: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "flex-end",
  },
  safetyText: {
    fontFamily: "Tajawal_400Regular",
    fontSize: 12,
    color: T.accent,
  },
  postInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: T.surfaceContainer,
    shadowColor: T.cardShadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  postInput: {
    flex: 1,
    backgroundColor: T.surface,
    borderRadius: 20,
    padding: 12,
    color: T.onSurface,
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
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  });
}
