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
      // Set headers explicitly for CORS and caching
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'public, max-age=0');
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

// Enhanced CORS and security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('X-Frame-Options', 'ALLOW-FROM *');
  res.header('Content-Security-Policy', "frame-ancestors *");

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Static file serving with proper headers
app.use(express.static(path.join(process.cwd(), "client", "public"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  },
  fallthrough: true
}));

// Logging middleware with improved error handling
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
        const stringified = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${stringified.length > 100 ? stringified.slice(0, 100) + '...' : stringified}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = registerRoutes(app);

    // Global error handler with improved logging
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error handling request: ${err.message}`);
      res.status(status).json({ message });
    });

    // Set up environment-specific configuration
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT || 5000;
    server.listen(parseInt(PORT.toString()), "0.0.0.0", () => {
      log(`Server running in ${app.get("env")} mode on port ${PORT}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();