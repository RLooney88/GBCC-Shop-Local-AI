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
      console.log("Fetching analysis from OpenAI...");
      const analysis = await analyzeUserQuery(message);
      console.log("Query analysis:", analysis);

      if (!analysis) {
        throw new Error("Failed to analyze query");
      }

      // Search businesses
      console.log("Fetching businesses from SheetDB...");
      const response = await axios.get(SHEETDB_URL);
      console.log("SheetDB raw response:", response.data);

      const businesses = response.data;
      if (!Array.isArray(businesses)) {
        throw new Error("Invalid response from SheetDB: Expected an array");
      }

      console.log("Available businesses:", businesses.length);
      console.log("First business sample:", businesses[0]);

      // Enhanced matching logic with better logging
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

        console.log(`Checking business: ${business.name}`);
        console.log(`Business text to match against: ${businessText}`);

        // Match if any keyword is found in the combined business text
        const keywordMatch = analysis.keywords.some(keyword => {
          const matches = businessText.includes(keyword.toLowerCase());
          if (matches) console.log(`Matched keyword: ${keyword}`);
          return matches;
        });

        const categoryMatch = analysis.categories.some(category => {
          const matches = businessText.includes(category.toLowerCase());
          if (matches) console.log(`Matched category: ${category}`);
          return matches;
        });

        return keywordMatch || categoryMatch;
      });

      console.log("Matched businesses:", matches.length);
      if (matches.length > 0) {
        console.log("First match:", matches[0]);
      }

      let responseMessage: string;
      let businessInfo: any;

      if (matches.length === 0) {
        responseMessage = "I couldn't find any businesses matching your request. Could you try describing what you're looking for differently? For example, mention the type of service or industry you're interested in.";
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
        responseMessage = await generateBusinessDescription(businessInfo);
      } else {
        responseMessage = await generateRefinementQuestion(matches.map(business => ({
          name: business.name,
          primaryServices: business.primaryServices,
          categories: [business.category1, business.category2, business.category3].filter(Boolean)
        })));
      }

      // Add assistant message
      await storage.addMessage(chatId, {
        role: 'assistant',
        content: responseMessage,
        timestamp: Date.now()
      });

      res.json({ 
        message: responseMessage,
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