import { uuid, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { privateSchema, apiSchema } from "./schemas";

export const communitySessionsTable = apiSchema.table("community_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  moodTheme: text("mood_theme").notNull(),
  sessionType: text("session_type").notNull().default("listen"),
  participantCount: integer("participant_count").notNull().default(0),
  maxParticipants: integer("max_participants").notNull().default(50),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  isActive: boolean("is_active").notNull().default(true),
  scheduledAt: timestamp("scheduled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// community_posts contains session_id linkage and moderation flags — private schema
export const communityPostsTable = privateSchema.table("community_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  anonymousName: text("anonymous_name").notNull(),
  contentAr: text("content_ar").notNull(),
  moodTag: text("mood_tag"),
  hearts: integer("hearts").notNull().default(0),
  isAiModerated: boolean("is_ai_moderated").notNull().default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
