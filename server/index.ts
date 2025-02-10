import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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

// Determine the correct static files directory based on environment
const staticDir = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), "dist", "public")
  : path.join(process.cwd(), "client", "public");

// Ensure static directory exists
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Static file serving with proper headers
app.use(express.static(staticDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Specific route for widget.js in production
if (process.env.NODE_ENV === 'production') {
  app.get('/widget.js', (req, res) => {
    const widgetPath = path.join(staticDir, 'widget.js');
    try {
      if (fs.existsSync(widgetPath)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(widgetPath);
      } else {
        log(`Widget file not found at ${widgetPath}`);
        res.status(404).send('Widget not found');
      }
    } catch (error) {
      log(`Error serving widget.js: ${error}`);
      res.status(500).send('Error serving widget.js');
    }
  });
}

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
    log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
  });

  next();
});

(async () => {
  try {
    const server = registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error handling request: ${err.message}`);
      res.status(status).json({ message });
    });

    // Set up environment-specific configuration
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    } else {
      // Serve static files from the dist/public directory
      const distDir = path.join(process.cwd(), "dist", "public");
      app.use(express.static(distDir));

      // Special handling for widget.js
      app.get('/widget.js', (req, res) => {
        const widgetPath = path.join(distDir, 'widget.js');
        try {
          if (fs.existsSync(widgetPath)) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'no-cache');
            res.sendFile(widgetPath);
          } else {
            log(`Widget file not found at ${widgetPath}`);
            res.status(404).send('Widget not found');
          }
        } catch (error) {
          log(`Error serving widget.js: ${error}`);
          res.status(500).send('Error serving widget.js');
        }
      });

      // Handle client-side routing by serving index.html for non-API routes
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }

    // Use port from environment variable for Cloud Run compatibility
    const PORT = process.env.PORT || 5000;
    server.listen(parseInt(PORT.toString()), "0.0.0.0", () => {
      log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
})();