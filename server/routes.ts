import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { findMatchingBusinesses } from "./openai";
import { z } from "zod";
import { ZodError } from "zod";

const SHEETDB_URL = "https://sheetdb.io/api/v1/aifpp2z9ktyie";

export function registerRoutes(app: Express): Server {
  // Business data cache with expiration
  let businessCache: { data: any[]; timestamp: number } | null = null;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async function getBusinesses() {
    if (businessCache && Date.now() - businessCache.timestamp < CACHE_DURATION) {
      return businessCache.data;
    }

    const response = await axios.get(SHEETDB_URL);
    const businesses = response.data;
    businessCache = { data: businesses, timestamp: Date.now() };
    return businesses;
  }

  app.post("/api/chat/start", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const chat = await storage.createChat({
        userId: user.id,
        messages: [],
        createdAt: new Date()
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

      // Get the chat history
      const chat = await storage.getChat(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Add user message to chat history
      await storage.addMessage(chatId, {
        role: 'user',
        content: message,
        timestamp: Date.now()
      });

      // Get businesses and find matches using OpenAI
      const businesses = await getBusinesses();
      console.log(`Retrieved ${businesses.length} businesses from directory`);

      // Pass the entire chat history to OpenAI for context
      const { message: responseMessage, matches } = await findMatchingBusinesses(
        message, 
        businesses,
        Array.isArray(chat.messages) ? chat.messages : []
      );
      console.log(`Found ${matches.length} matching businesses`);

      // Add assistant message to chat history
      await storage.addMessage(chatId, {
        role: 'assistant',
        content: responseMessage,
        timestamp: Date.now()
      });

      res.json({
        message: responseMessage,
        businesses: matches.length === 1 ? matches[0] : null,
        multipleMatches: matches.length > 1,
        matchCount: matches.length
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

  const httpServer = createServer(app);
  return httpServer;
}