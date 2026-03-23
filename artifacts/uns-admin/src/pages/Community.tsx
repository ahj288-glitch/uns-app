import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Shield,
  ShieldCheck,
  Flag,
  CheckCircle,
  XCircle,
  Heart,
  Clock,
} from "lucide-react";

const BASE = "/api";

interface Session {
  id: string;
  titleAr: string;
  descriptionAr: string;
  moodTheme: string;
  participantCount: number;
  maxParticipants: number;
  durationMinutes: number;
  scheduledAt: string;
}

interface Post {
  id: string;
  sessionId: string;
  anonymousName: string;
  contentAr: string;
  hearts: number;
  isFlagged: boolean;
  isApproved: boolean;
  createdAt: string;
}

const MOOD_LABELS: Record<string, string> = {
  anxiety: "قلق",
  gratitude: "امتنان",
  reflection: "تأمل",
  support: "دعم",
};

const MOOD_COLORS: Record<string, string> = {
  anxiety: "#6B7FD7",
  gratitude: "#74C69D",
  reflection: "#10B981",
  support: "#D97757",
};

export default function Community() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<"sessions" | "posts" | "flagged">("sessions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/community/sessions`).then(r => r.json()).catch(() => ({ sessions: [] })),
    ]).then(([sessionsData]) => {
      setSessions(sessionsData.sessions ?? []);
      setLoading(false);
    });
  }, []);

  const totalParticipants = sessions.reduce((sum, s) => sum + s.participantCount, 0);
  const totalPosts = 0;
  const flaggedCount = flaggedPosts.length;

  const stats = [
    { label: "الدوائر النشطة", value: sessions.length, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "إجمالي المشاركين", value: totalParticipants, icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
    { label: "مشاركات اليوم", value: totalPosts, icon: MessageSquare, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "تحتاج مراجعة", value: flaggedCount, icon: Flag, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  const tabs = [
    { key: "sessions", label: "الدوائر", count: sessions.length },
    { key: "flagged", label: "تحتاج مراجعة", count: flaggedCount },
    { key: "posts", label: "كل المشاركات", count: totalPosts },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-arabic">المساحة الآمنة</h1>
        <p className="text-muted-foreground text-sm mt-1 font-arabic">إشراف على الدوائر المجتمعية والمشاركات</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-4"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-muted-foreground text-sm font-arabic">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value.toLocaleString("ar-SA")}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* Safety Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3"
      >
        <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold font-arabic text-emerald-400">الحماية التلقائية نشطة</h3>
          <p className="text-muted-foreground text-sm mt-1 font-arabic">
            نظام الذكاء الاصطناعي يكتشف تلقائياً المشاركات ذات الضائقة الشديدة ويحيل صاحبها لخطوط الدعم.
            خط الدعم السعودي: <span className="text-foreground font-mono">920033360</span>
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 font-arabic text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? "bg-primary/20" : "bg-muted"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-arabic">
              لا توجد دوائر نشطة حالياً
            </div>
          ) : (
            sessions.map((session, i) => {
              const color = MOOD_COLORS[session.moodTheme] ?? "#74C69D";
              const fullPercent = Math.round((session.participantCount / session.maxParticipants) * 100);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card border border-border rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-arabic font-medium"
                        style={{ backgroundColor: color + "20", color }}
                      >
                        {MOOD_LABELS[session.moodTheme] ?? session.moodTheme}
                      </span>
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.durationMinutes} دقيقة
                      </span>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold font-arabic text-foreground">{session.titleAr}</h3>
                      <p className="text-muted-foreground text-sm mt-1 font-arabic">{session.descriptionAr}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{fullPercent}% ممتلئ</span>
                      <span className="text-xs font-arabic text-foreground">
                        {session.participantCount} / {session.maxParticipants} مشارك
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${fullPercent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* Flagged Posts Tab */}
      {activeTab === "flagged" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {flaggedPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="font-arabic text-muted-foreground text-lg">لا توجد مشاركات تحتاج مراجعة 🎉</p>
              <p className="font-arabic text-muted-foreground text-sm mt-2">المجتمع في حالة سلامة جيدة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flaggedPosts.map((post) => (
                <div key={post.id} className="bg-card border border-amber-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-green-400 hover:bg-green-400/10 px-3 py-1.5 rounded-lg transition-colors text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-arabic">قبول</span>
                      </button>
                      <button className="flex items-center gap-1 text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors text-sm">
                        <XCircle className="w-4 h-4" />
                        <span className="font-arabic">حذف</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="font-arabic text-sm font-medium text-amber-400">{post.anonymousName}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {new Date(post.createdAt).toLocaleString("ar-SA")}
                      </span>
                    </div>
                  </div>
                  <p className="font-arabic text-foreground text-right leading-relaxed">{post.contentAr}</p>
                  <div className="flex items-center justify-end gap-3 mt-3">
                    <div className="flex items-center gap-1 text-rose-400 text-sm">
                      <Heart className="w-3.5 h-3.5" />
                      <span>{post.hearts}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-amber-400/15 text-amber-400 rounded-full font-arabic">
                      مُبلَّغ عنه
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* All Posts Tab */}
      {activeTab === "posts" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-arabic">لا توجد مشاركات بعد</p>
            <p className="font-arabic text-sm mt-2">ستظهر هنا مشاركات المجتمع عند بدء الدوائر</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
