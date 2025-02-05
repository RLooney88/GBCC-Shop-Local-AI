import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { storage, processInactiveChats } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { findMatchingBusinesses } from "./openai";
import { z } from "zod";
import { ZodError } from "zod";
import { sendToGHL } from "./ghl";

const SHEETDB_URL = "https://sheetdb.io/api/v1/aifpp2z9ktyie";

export function registerRoutes(app: Express): Server {
  let businessCache: { data: any[]; timestamp: number } | null = null;
  const CACHE_DURATION = 5 * 60 * 1000;

  async function getBusinesses() {
    if (businessCache && Date.now() - businessCache.timestamp < CACHE_DURATION) {
      return businessCache.data;
    }

    const response = await axios.get(SHEETDB_URL);
    const businesses = response.data;
    businessCache = { data: businesses, timestamp: Date.now() };
    return businesses;
  }

  app.get("/api/chat/:chatId", async (req, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const chat = await storage.getChat(chatId);

      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      res.json(chat);
    } catch (error) {
      console.error("Error fetching chat:", error);
      res.status(500).json({ error: "Failed to fetch chat" });
    }
  });

  app.post("/api/chat/start", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const chat = await storage.createChat({
        userId: user.id,
        messages: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
        sentToGHL: false
      });

      await storage.addMessage(chat.id, {
        role: 'assistant',
        content: "What kind of business/organization are you looking for?",
        timestamp: Date.now()
      });

      res.json({ chatId: chat.id, userId: user.id });
    } catch (error) {
      console.error("Error in chat start:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid input data", details: error.errors });
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { chatId, message } = z.object({
        chatId: z.number(),
        message: z.string()
      }).parse(req.body);

      const chat = await storage.getChat(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      const user = await storage.getUser(chat.userId);
      if (!user) {
        throw new Error('User not found');
      }

      await storage.addMessage(chatId, {
        role: 'user',
        content: message,
        timestamp: Date.now()
      });

      const businesses = await getBusinesses();
      const { message: responseMessage, matches, isClosing } = await findMatchingBusinesses(
        message,
        businesses,
        Array.isArray(chat.messages) ? chat.messages : []
      );

      await storage.addMessage(chatId, {
        role: 'assistant',
        content: responseMessage,
        timestamp: Date.now()
      });

      if (isClosing) {
        const updatedChat = await storage.getChat(chatId);
        if (updatedChat && !updatedChat.sentToGHL) {
          await sendToGHL({
            user,
            messages: Array.isArray(updatedChat.messages) ? updatedChat.messages : []
          });
          await storage.markChatSentToGHL(updatedChat.id);
        }
      }

      res.json({
        message: responseMessage,
        businesses: matches.length === 1 ? matches[0] : null,
        multipleMatches: matches.length > 1,
        matchCount: matches.length,
        isClosing
      });

    } catch (error) {
      console.error("Error processing message:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid input data", details: error.errors });
      } else {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  setInterval(async () => {
    try {
      await processInactiveChats();
    } catch (error) {
      console.error("Error processing inactive chats:", error);
    }
  }, 60 * 1000);

  const httpServer = createServer(app);
  return httpServer;
}