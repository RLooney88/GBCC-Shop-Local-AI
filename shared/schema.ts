import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull()
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  messages: jsonb("messages").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  sentToGHL: boolean("sent_to_ghl").notNull().default(false)
});

export const usersRelations = relations(users, ({ many }) => ({
  chats: many(chats)
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id]
  })
}));

export const insertUserSchema = createInsertSchema(users);
export const insertChatSchema = createInsertSchema(chats);

export type User = typeof users.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type BusinessInfo = {
  name: string;
  primaryServices: string;
  categories: string[];
  phone?: string;
  email?: string;
  website?: string;
};