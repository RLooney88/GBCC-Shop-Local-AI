import { type User, type Chat, type InsertUser, type InsertChat, type ChatMessage } from "@shared/schema";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  getChat(id: number): Promise<Chat | undefined>;
  addMessage(chatId: number, message: ChatMessage): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private currentUserId: number;
  private currentChatId: number;

  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.currentUserId = 1;
    this.currentChatId = 1;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentChatId++;
    const chat: Chat = {
      id,
      userId: insertChat.userId,
      messages: insertChat.messages || [],
      createdAt: insertChat.createdAt || new Date()
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async addMessage(chatId: number, message: ChatMessage): Promise<void> {
    const chat = this.chats.get(chatId);
    if (!chat) throw new Error('Chat not found');

    const messages = Array.isArray(chat.messages) ? chat.messages : [];
    chat.messages = [...messages, message];
    this.chats.set(chatId, chat);
  }
}

export const storage = new MemStorage();