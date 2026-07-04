import { uuid, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { privateSchema } from "./schemas";

export const userProgressTable = privateSchema.table("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull().unique(),
  level: text("level").notNull().default("awareness"),
  xp: integer("xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCheckinDate: text("last_checkin_date"),
  totalCheckins: integer("total_checkins").notNull().default(0),
  totalLoopsCompleted: integer("total_loops_completed").notNull().default(0),
  milestones: jsonb("milestones").default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const microWinsTable = privateSchema.table("micro_wins", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  winType: text("win_type").notNull(),
  winLabelAr: text("win_label_ar").notNull(),
  points: integer("points").notNull().default(10),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const dailyLoopsTable = privateSchema.table("daily_loops", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(),
  loopDate: text("loop_date").notNull(),
  state: text("state").notNull().default("pending"),
  microExperienceType: text("micro_experience_type"),
  microExperienceTitleAr: text("micro_experience_title_ar"),
  checkinMood: text("checkin_mood"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
