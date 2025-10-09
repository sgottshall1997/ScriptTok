import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { requestTrackingMiddleware, errorTrackingMiddleware, performanceMonitoringMiddleware } from "./middleware/observability.middleware";
import cron from "node-cron";
import { pullPerplexityTrends } from "./services/perplexityTrendFetcher";

const app = express();

// Stripe webhook needs raw body for signature verification
// This MUST come before express.json() to intercept the webhook route
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Wire observability middleware globally
app.use(requestTrackingMiddleware('api'));
app.use(performanceMonitoringMiddleware({ 
  trackDetailedMetrics: true, 
  slowRequestThreshold: 2000, 
  service: 'api' 
}));

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
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Serve sitemap.xml and robots.txt before Vite's catch-all route
  app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.resolve(import.meta.dirname, '..', 'client', 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.setHeader('Content-Type', 'application/xml');
      res.sendFile(sitemapPath);
    } else {
      res.status(404).send('Sitemap not found');
    }
  });

  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.resolve(import.meta.dirname, '..', 'client', 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.sendFile(robotsPath);
    } else {
      res.status(404).send('Robots.txt not found');
    }
  });

  // Wire error tracking middleware
  app.use(errorTrackingMiddleware('api'));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment port or default to 5000
  // This allows deployment platforms to assign their own port
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // 🛑 DISABLED: Automatic scheduled job initialization to prevent unauthorized job creation
    console.log('🚫 DISABLED: Automatic scheduled job initialization disabled to prevent unauthorized job creation');
    
    // Bulk job functionality removed for streamlined TikTok Viral Product Generator
    
    // ✅ Initialize Perplexity automation cron job
    try {
      const { initializePerplexityCron } = await import('./services/perplexityCron');
      initializePerplexityCron();
    } catch (error) {
      console.error('❌ Failed to initialize Perplexity automation:', error);
    }
    
    console.log('   ℹ️  Scheduled jobs must be manually activated through the UI');
    
    // OLD SCHEDULED SYSTEM REMOVED - using simplified unified scheduling
  });
})();
