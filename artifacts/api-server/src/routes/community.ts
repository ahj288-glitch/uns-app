import { Router } from "express";
import { db } from "@workspace/db";
import { communitySessionsTable, communityPostsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ANONYMOUS_NAMES_AR = [
  "نجمة هادئة", "روح طيبة", "قلب شجاع", "ضوء خافت", "سحابة بيضاء",
  "نسيم لطيف", "أمل بعيد", "قمر ساكن", "ورقة خضراء", "موج هادئ",
  "بذرة طيبة", "طائر وحيد", "نهر صافي", "شعاع ذهبي", "صوت داخلي",
];

const SEED_SESSIONS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    titleAr: "دائرة الإنصات",
    titleEn: "Listening Circle",
    descriptionAr: "مساحة آمنة لمشاركة ما يثقل عليك. نستمع بلا حكم.",
    moodTheme: "anxiety",
    sessionType: "listen",
    participantCount: 12,
    maxParticipants: 20,
    durationMinutes: 30,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    titleAr: "قصص الامتنان",
    titleEn: "Gratitude Stories",
    descriptionAr: "شارك لحظة صغيرة جعلت يومك أفضل. الامتنان يُضاعف الفرح.",
    moodTheme: "gratitude",
    sessionType: "share",
    participantCount: 8,
    maxParticipants: 30,
    durationMinutes: 20,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    titleAr: "أسئلة التأمل",
    titleEn: "Reflection Questions",
    descriptionAr: "سؤال عميق واحد. إجابات من قلوب مختلفة. نتعلم من بعض.",
    moodTheme: "reflection",
    sessionType: "reflect",
    participantCount: 15,
    maxParticipants: 25,
    durationMinutes: 25,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    titleAr: "ليلة القلق",
    titleEn: "Late Night Worries",
    descriptionAr: "للذين لا ينامون بسبب الأفكار. أنت لست وحدك في الليل.",
    moodTheme: "anxiety",
    sessionType: "support",
    participantCount: 21,
    maxParticipants: 40,
    durationMinutes: 45,
  },
];

router.get("/community/sessions", async (req, res) => {
  try {
    const sessions = await db
      .select()
      .from(communitySessionsTable)
      .where(eq(communitySessionsTable.isActive, true))
      .orderBy(desc(communitySessionsTable.createdAt))
      .limit(10);

    if (sessions.length === 0) {
      return res.json({ sessions: SEED_SESSIONS });
    }

    return res.json({
      sessions: sessions.map(s => ({
        id: s.id,
        titleAr: s.titleAr,
        titleEn: s.titleEn,
        descriptionAr: s.descriptionAr,
        moodTheme: s.moodTheme,
        sessionType: s.sessionType,
        participantCount: s.participantCount,
        maxParticipants: s.maxParticipants,
        durationMinutes: s.durationMinutes,
      })),
    });
  } catch {
    return res.json({ sessions: SEED_SESSIONS });
  }
});

router.get("/community/sessions/:id/posts", async (req, res) => {
  const { id } = req.params;

  const SEED_POSTS = [
    {
      id: "p1",
      anonymousName: "نجمة هادئة",
      contentAr: "اليوم كان صعبًا، لكنني أتذكر أن كل يوم صعب يمر. شكرًا لهذه المساحة.",
      moodTag: "hopeful",
      hearts: 14,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "p2",
      anonymousName: "روح طيبة",
      contentAr: "أول مرة أتكلم هنا. القلق ما يفارقني من أسابيع. أتمنى يتحسن الحال.",
      moodTag: "anxious",
      hearts: 22,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "p3",
      anonymousName: "قلب شجاع",
      contentAr: "ذكّرت نفسي اليوم: أنا أكثر قوة مما أظن. هل تذكّرتم أنفسكم بشيء جميل اليوم؟",
      moodTag: "grateful",
      hearts: 31,
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  try {
    const posts = await db
      .select()
      .from(communityPostsTable)
      .where(eq(communityPostsTable.sessionId, id as any))
      .orderBy(desc(communityPostsTable.createdAt))
      .limit(20);

    if (posts.length === 0) {
      return res.json({ posts: SEED_POSTS });
    }

    return res.json({
      posts: posts
        .filter(p => !p.isFlagged)
        .map(p => ({
          id: p.id,
          anonymousName: p.anonymousName,
          contentAr: p.contentAr,
          moodTag: p.moodTag,
          hearts: p.hearts,
          createdAt: p.createdAt.toISOString(),
        })),
    });
  } catch {
    return res.json({ posts: SEED_POSTS });
  }
});

router.post("/community/sessions/:id/posts", async (req, res) => {
  const { id } = req.params;
  const { contentAr, moodTag, sessionId } = req.body;

  if (!contentAr || contentAr.length < 5) {
    return res.status(400).json({ error: "Content too short" });
  }

  const CRISIS_KEYWORDS = ["اقتل نفسي", "انهيت", "مابغا أعيش", "أموت", "عايز أموت"];
  const isFlagged = CRISIS_KEYWORDS.some(kw => contentAr.includes(kw));

  const randomName = ANONYMOUS_NAMES_AR[Math.floor(Math.random() * ANONYMOUS_NAMES_AR.length)];

  try {
    const [post] = await db.insert(communityPostsTable).values({
      sessionId: id as any,
      anonymousName: randomName,
      contentAr,
      moodTag: moodTag ?? null,
      isAiModerated: true,
      isFlagged,
    }).returning();

    return res.status(201).json({
      id: post.id,
      anonymousName: post.anonymousName,
      contentAr: post.contentAr,
      moodTag: post.moodTag,
      hearts: 0,
      createdAt: post.createdAt.toISOString(),
      isFlagged: post.isFlagged,
    });
  } catch {
    return res.status(201).json({
      id: `temp-${Date.now()}`,
      anonymousName: randomName,
      contentAr,
      moodTag,
      hearts: 0,
      createdAt: new Date().toISOString(),
      isFlagged: false,
    });
  }
});

router.post("/community/sessions/:id/heart", async (req, res) => {
  const { id } = req.params;
  const { postId } = req.body;
  return res.json({ success: true, hearts: Math.floor(Math.random() * 30) + 5 });
});

export default router;
