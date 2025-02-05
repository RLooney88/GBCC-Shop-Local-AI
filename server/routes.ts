import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { analyzeUserQuery, generateBusinessDescription, generateRefinementQuestion } from "./openai";
import { z } from "zod";
import { ZodError } from "zod";

const SHEETDB_URL = "https://sheetdb.io/api/v1/aifpp2z9ktyie";

export function registerRoutes(app: Express): Server {
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
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid input data", details: error.errors });
      } else {
        console.error("Error in /api/chat/start:", error);
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

      // Add user message
      await storage.addMessage(chatId, {
        role: 'user',
        content: message,
        timestamp: Date.now()
      });

      // Analyze query
      const analysis = await analyzeUserQuery(message);
      console.log("Query analysis:", analysis); // Debug log

      if (!analysis) {
        throw new Error("Failed to analyze query");
      }

      // Search businesses
      const { data: businesses } = await axios.get(SHEETDB_URL);
      if (!Array.isArray(businesses)) {
        throw new Error("Invalid response from SheetDB");
      }

      console.log("Available businesses:", businesses.length); // Debug log

      // Enhanced matching logic
      const matches = businesses.filter((business: any) => {
        const businessText = [
          business.name,
          business.primaryServices,
          business.category1,
          business.category2,
          business.category3
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        // Match if any keyword is found in the combined business text
        return analysis.keywords.some(keyword => businessText.includes(keyword.toLowerCase())) ||
               analysis.categories.some(category => businessText.includes(category.toLowerCase()));
      });

      console.log("Matched businesses:", matches.length); // Debug log

      let response: string;
      let businessInfo: any;

      if (matches.length === 0) {
        response = "I couldn't find any businesses matching your request. Could you try describing what you're looking for differently? For example, mention the type of service or industry you're interested in.";
      } else if (matches.length === 1) {
        const business = matches[0];
        businessInfo = {
          name: business.name,
          primaryServices: business.primaryServices,
          categories: [business.category1, business.category2, business.category3].filter(Boolean),
          phone: business.phone,
          email: business.email,
          website: business.website
        };
        response = await generateBusinessDescription(businessInfo);
      } else {
        response = await generateRefinementQuestion(matches.map(business => ({
          name: business.name,
          primaryServices: business.primaryServices,
          categories: [business.category1, business.category2, business.category3].filter(Boolean)
        })));
      }

      // Add assistant message
      await storage.addMessage(chatId, {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      });

      res.json({ 
        message: response,
        businesses: businessInfo,
        multipleMatches: matches.length > 1
      });
    } catch (error) {
      console.error("Error in /api/chat/message:", error);
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