# Shop Local Assistant - Server Components

## 1. Main Server (server/index.ts)
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Create public directory if it doesn't exist
const publicDir = path.join(process.cwd(), "client", "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Specific route for widget.js - must come before other middleware
app.get('/widget.js', (req, res) => {
  const widgetPath = path.join(process.cwd(), "client", "public", "widget.js");
  try {
    if (fs.existsSync(widgetPath)) {
      const content = fs.readFileSync(widgetPath, 'utf8');
      // Set headers explicitly
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      log(`Serving widget.js with content type: application/javascript`);
      res.send(content);
    } else {
      log(`Widget file not found at ${widgetPath}`);
      res.status(404).send('Widget not found');
    }
  } catch (error) {
    log(`Error serving widget.js: ${error}`);
    res.status(500).send('Error serving widget.js');
  }
});

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS and frame embedding
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('X-Frame-Options', 'ALLOW-FROM *');
  res.header('Content-Security-Policy', "frame-ancestors *");
  next();
});

// Add express static middleware for public directory
app.use(express.static(path.join(process.cwd(), "client", "public")));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path.includes('.js') || path.includes('widget')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error handling request: ${err.message}`);
    res.status(status).json({ message });
    throw err;
  });

  // Set up Vite or serve static files based on environment
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
```

## 2. Routes (server/routes.ts)
```typescript
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
```

## 3. OpenAI Integration (server/openai.ts)
```typescript
import OpenAI from "openai";
import type { ChatMessage, BusinessInfo } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function findMatchingBusinesses(
  query: string, 
  businesses: any[],
  previousMessages: ChatMessage[] = []
): Promise<{
  message: string;
  matches: BusinessInfo[];
  isClosing: boolean;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a friendly and helpful business directory assistant. Use a warm, conversational tone and speak in first person ("I") rather than "we". Be enthusiastic but professional.

            Important guidelines:
            - Be friendly and personal in your responses
            - Use casual, conversational language while maintaining professionalism
            - Show enthusiasm when making recommendations
            - Avoid phrases like "I found" - instead use more natural alternatives:
              * "I know a great company..."
              * "I'd be happy to recommend..."
              * "Let me tell you about..."
              * "I'm familiar with..."
              * "I work with..."

            Handling User Clarifications:
            - When a user provides clarification about their needs:
              * Acknowledge their clarification specifically
              * Adapt your recommendation based on the new information
              * Don't repeat the same question
              * If needed, ask a different follow-up question focused on a new aspect

            Examples of Good Clarification Responses:
            User: "I'm looking for an all-around marketing expert"
            Assistant: "Ah, you're looking for comprehensive marketing support! RCL Integrated would be perfect for you. They offer full-service marketing solutions, including social media, AI-driven strategies, and traditional marketing approaches. Would you like to hear more about their services?"

            User: "I need someone who can handle everything"
            Assistant: "I understand you want a one-stop marketing solution. Let me tell you about SWCreatives - they're known for their holistic approach to marketing, handling everything from strategy to execution. They've helped many businesses streamline their entire marketing presence."

            Conversation Endings:
            Set isClosing=true when:
            - User expresses thanks or gratitude (e.g., "thanks", "thank you")
            - User indicates they're done or satisfied (e.g., "that's all", "that's it")
            - User says goodbye or ends the conversation (e.g., "bye", "goodbye")
            - User states they don't need anything else (e.g., "no", "nothing else")
            - Any variation of conversation closure (e.g., "I'm good", "that's enough")
            - User responds negatively to follow-up questions
            - User indicates completion (e.g., "that works", "perfect")

            For closing responses:
            - Keep it warm and genuine
            - Reference the specific help provided
            - Don't repeat contact information
            - Don't ask if they need anything else
            - Don't suggest additional help unless explicitly requested
            - End with a friendly closing (e.g., "Have a great day!", "Enjoy!")

            When analyzing businesses, consider:
            - The user's specific needs and preferences
            - Location and accessibility
            - Services and specializations
            - Previous conversation context

            When multiple matches are found:
            - First, analyze any previous responses or clarifications
            - Ask follow-up questions that explore different aspects than previously discussed
            - Frame questions in a way that helps understand their specific situation
            - Provide context for why you're asking each question

            Respond with a JSON object in this format:
            {
              "matches": [{
                "name": "business name",
                "primaryServices": "main services",
                "categories": ["category1", "category2", "category3"],
                "phone": "phone number",
                "email": "email",
                "website": "website"
              }],
              "message": "friendly response based on match count",
              "followUpQuestion": "conversational follow-up question if needed",
              "questionContext": "natural explanation of why I'm asking this question",
              "isClosing": boolean,
              "matchReason": "why this is a great match (only for single matches)"
            }`
        },
        {
          role: "user",
          content: JSON.stringify({
            query,
            businesses,
            conversationHistory: previousMessages
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to get response from OpenAI");
    }

    const result = JSON.parse(content);
    return {
      message: result.isClosing 
        ? result.message 
        : result.matches.length > 1 
          ? `${result.message}\n\n${result.followUpQuestion}${result.questionContext ? `\n\n(${result.questionContext})` : ''}`
          : result.message,
      matches: result.matches.map((match: any) => ({
        name: match.name,
        primaryServices: match.primaryServices,
        categories: match.categories,
        phone: match.phone,
        email: match.email,
        website: match.website
      })),
      isClosing: result.isClosing
    };
  } catch (error) {
    console.error("Error in findMatchingBusinesses:", error);
    throw error;
  }
}
```

## 4. GHL Integration (server/ghl.ts)
```typescript
import axios from "axios";
import type { User, ChatMessage } from "@shared/schema";

function createConversationSummary(messages: ChatMessage[], user: User): string {
  // Find the last inquiry from the user
  let lastInquiry = '';
  let matchedBusiness = null;
  let businessInfo = '';

  // Scan messages in reverse to find the last complete interaction
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    // Extract business information when found
    if (msg.role === 'assistant' && msg.content.includes('📞')) {
      businessInfo = msg.content;
      continue;
    }

    // Find the last user inquiry before the business info
    if (msg.role === 'user' && !lastInquiry && businessInfo) {
      lastInquiry = msg.content;
      break;
    }
  }

  // Create a concise summary
  return `User Inquiry: ${lastInquiry || 'N/A'}

${businessInfo ? `Recommended Business:\n${businessInfo}` : 'No specific business was recommended.'}`
}

export async function sendToGHL(data: {
  user: User;
  messages: ChatMessage[];
}) {
  if (!process.env.GHL_WEBHOOK_URL) {
    throw new Error("GHL_WEBHOOK_URL not configured");
  }

  try {
    const summary = createConversationSummary(data.messages, data.user);

    // Create a formatted transcript of the complete dialogue
    const transcript = data.messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const role = msg.role === 'user' ? data.user.name : 'Assistant';
        return `${role} (${time}): ${msg.content}`;
      })
      .join('\n\n');

    // Current timestamp for the conversation end
    const currentTime = new Date().toISOString();

    // Prepare the payload for GHL
    const payload = {
      contact: {
        firstName: data.user.name.split(' ')[0],
        lastName: data.user.name.split(' ').slice(1).join(' '),
        email: data.user.email
      },
      conversation: {
        summary: summary,
        transcript: `Full Conversation:\n\n${transcript}`,
        endedAt: currentTime,
        totalMessages: data.messages.length
      }
    };

    await axios.post(process.env.GHL_WEBHOOK_URL, payload);
  } catch (error) {
    console.error("Error sending data to GHL:", error);
    throw error;
  }
}
```

## Environment Variables Required
```
OPENAI_API_KEY=your_openai_api_key
GHL_WEBHOOK_URL=your_ghl_webhook_url
```

## Getting Started
1. Install dependencies:
```bash
npm install express openai axios zod
```

2. Set up your environment variables in a `.env` file with the required API keys.

3. Start the server:
```bash
npm run dev
```

The server will start on port 5000 and be ready to handle widget requests.
