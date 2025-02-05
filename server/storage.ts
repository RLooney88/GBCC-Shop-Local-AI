import { type User, type Chat, type InsertUser, type InsertChat, type ChatMessage, users, chats } from "@shared/schema";
import { db } from "./db";
import { eq, and, lt } from "drizzle-orm";
import { sendToGHL } from "./ghl";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: number): Promise<Chat | undefined>;
  addMessage(chatId: number, message: ChatMessage): Promise<void>;
  getInactiveChats(): Promise<Chat[]>;
  markChatSentToGHL(chatId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(insertChat).returning();
    return chat;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat;
  }

  async addMessage(chatId: number, message: ChatMessage): Promise<void> {
    const chat = await this.getChat(chatId);
    if (!chat) throw new Error('Chat not found');

    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    await db
      .update(chats)
      .set({ 
        messages: [...messages, message],
        lastActivityAt: new Date()
      })
      .where(eq(chats.id, chatId));
  }

  async getInactiveChats(): Promise<Chat[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.sentToGHL, false),
          lt(chats.lastActivityAt, fiveMinutesAgo)
        )
      );
  }

  async markChatSentToGHL(chatId: number): Promise<void> {
    await db
      .update(chats)
      .set({ sentToGHL: true })
      .where(eq(chats.id, chatId));
  }
}

export const storage = new DatabaseStorage();

// Function to periodically check for inactive chats and send to GHL
export async function processInactiveChats(): Promise<void> {
  const inactiveChats = await storage.getInactiveChats();

  for (const chat of inactiveChats) {
    try {
      const user = await storage.getUser(chat.userId);
      if (!user) continue;

      await sendToGHL({ 
        user,
        messages: Array.isArray(chat.messages) ? chat.messages : []
      });

      await storage.markChatSentToGHL(chat.id);
    } catch (error) {
      console.error(`Failed to process inactive chat ${chat.id}:`, error);
    }
  }
}