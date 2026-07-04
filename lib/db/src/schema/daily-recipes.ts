import { uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { apiSchema } from "./schemas";

export const dailyRecipesTable = apiSchema.table("daily_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("هدوء"),
  scheduledFor: text("scheduled_for"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type DailyRecipe = typeof dailyRecipesTable.$inferSelect;
