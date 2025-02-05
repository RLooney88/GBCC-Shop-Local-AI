import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { analyzeUserQuery, generateBusinessDescription, generateRefinementQuestion } from "./openai";
import { z } from "zod";
import { ZodError } from "zod";

const SHEETDB_URL = "https://sheetdb.io/api/v1/aifpp2z9ktyie";

// Utility function for business text normalization
function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

// Utility function to create searchable business text
function createSearchableBusinessText(business: any): string {
  const fields = [
    business['Company Name'],
    business['Primary Services'],
    business['Category 1'],
    business['Category 2'],
    business['Category 3'],
    business['Company Overview']
  ];
  return fields.filter(Boolean).join(' ').toLowerCase();
}

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

      // Add user message to chat history
      await storage.addMessage(chatId, {
        role: 'user',
        content: message,
        timestamp: Date.now()
      });

      // Step 1: Analyze user query
      const analysis = await analyzeUserQuery(message);
      console.log("Query analysis:", { keywords: analysis.keywords, categories: analysis.categories });

      // Step 2: Get and process businesses
      const businesses = await getBusinesses();
      console.log(`Processing ${businesses.length} businesses`);

      // Step 3: Score and rank matches
      const scoredMatches = businesses.map(business => {
        const searchableText = createSearchableBusinessText(business);
        let score = 0;

        // Score based on keywords
        analysis.keywords.forEach(keyword => {
          if (searchableText.includes(normalizeText(keyword))) score += 2;
        });

        // Score based on categories
        analysis.categories.forEach(category => {
          if (searchableText.includes(normalizeText(category))) score += 1;
        });

        return { business, score };
      }).filter(match => match.score > 0)
        .sort((a, b) => b.score - a.score);

      console.log(`Found ${scoredMatches.length} potential matches`);

      // Step 4: Process matches and generate response
      let responseMessage: string;
      let businessInfo = null;

      if (scoredMatches.length === 0) {
        responseMessage = "I couldn't find any businesses matching your request. Could you try describing what you're looking for differently? For example, what type of service or help do you need?";
      } else if (scoredMatches.length === 1) {
        const match = scoredMatches[0].business;
        businessInfo = {
          name: match['Company Name'],
          primaryServices: match['Primary Services'],
          categories: [match['Category 1'], match['Category 2'], match['Category 3']].filter(Boolean),
          phone: match['Phone Number'],
          email: match['Email'],
          website: match['Website']
        };
        responseMessage = await generateBusinessDescription(businessInfo);
      } else {
        // Group similar businesses for better refinement questions
        const topMatches = scoredMatches.slice(0, 5).map(match => ({
          name: match.business['Company Name'],
          primaryServices: match.business['Primary Services'],
          categories: [
            match.business['Category 1'],
            match.business['Category 2'],
            match.business['Category 3']
          ].filter(Boolean)
        }));

        console.log("Top matches for refinement:", topMatches);
        responseMessage = await generateRefinementQuestion(topMatches);
      }

      // Add assistant message to chat history
      await storage.addMessage(chatId, {
        role: 'assistant',
        content: responseMessage,
        timestamp: Date.now()
      });

      res.json({
        message: responseMessage,
        businesses: businessInfo,
        multipleMatches: scoredMatches.length > 1,
        matchCount: scoredMatches.length
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