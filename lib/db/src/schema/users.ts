import { text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { privateSchema } from "./schemas";

export const usersTable = privateSchema.table("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  dob: text("dob").notNull(),
  gender: text("gender").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
