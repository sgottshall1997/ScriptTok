import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cron from "node-cron";
import { pullPerplexityTrends } from "./services/perplexityTrendFetcher";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Initialize scheduled bulk generation jobs - DISABLED FOR PRODUCTION DEPLOYMENT
    // const { initializeScheduledJobs } = await import("./api/scheduled-bulk-generation");
    // await initializeScheduledJobs();
    
    // PART 4: Daily Cron Job - Run Perplexity trends at 5:00 AM ET
    cron.schedule("0 5 * * *", async () => {
      console.log('🕐 Running daily Perplexity trends fetch at 5:00 AM ET');
      try {
        // Import and validate trend fetching is allowed
        const { validateTrendFetchRequest } = await import("./config/generation-safeguards");
        const validation = validateTrendFetchRequest();
        
        if (!validation.allowed) {
          console.log(`🚫 TREND FETCH BLOCKED: ${validation.reason}`);
          return;
        }
        
        console.log('🟢 SAFEGUARD: Trend fetching validated - proceeding with Perplexity fetch (READ-ONLY)');
        const result = await pullPerplexityTrends();
        console.log(`✅ Daily trend fetch complete: ${result.message}, added ${result.productsAdded} products`);
        console.log('📊 IMPORTANT: This was a READ-ONLY data fetch - no content generation occurred');
      } catch (error) {
        console.error('❌ Daily Perplexity fetch failed:', error);
      }
    }, {
      timezone: "America/New_York"
    });
    
    console.log('📅 Daily Perplexity trend fetcher ENABLED at 5:00 AM ET (READ-ONLY DATA FETCH)');
  });
})();
