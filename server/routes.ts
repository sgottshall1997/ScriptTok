import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateContentRouter } from "./api/generateContent";
import { trendingRouter } from "./api/trending";
import { analyticsRouter } from "./api/analytics";
import { templateTestRouter } from "./api/templateTest";
import { templateRouter } from "./api/templates";
import { scraperStatusRouter } from "./api/scraperStatus";
import { customTemplateTestRouter } from "./api/customTemplateTest";
import { aiModelConfigRouter } from "./api/aiModelConfig";
import { hashtagEmojiRouter } from "./api/hashtagEmoji";
import { socialMediaOptimizationRouter } from "./api/socialMediaOptimization";
import { videoScriptRouter } from "./api/videoScript";
import { claudeContentRouter } from "./api/claudeContent";
import { trendingEmojisHashtagsRouter } from "./api/trendingEmojisHashtags";
import apiIntegrationRouter from "./api/apiIntegration";
import optionsRouter from "./api/options";
import { historyRouter } from "./api/history";
import { usageSummaryRouter } from "./api/usageSummary";
import { webhooksRouter } from "./api/webhooks";
import { webhookTestRouter } from "./api/webhook-test";
import authRouter from "./api/auth";
import protectedRouter from "./api/protected-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes
  
  // Authentication routes (non-protected)
  app.use('/api/auth', authRouter);
  
  // Public routes that don't require authentication
  app.use('/api/trending', trendingRouter);
  app.use('/api/template-test', templateTestRouter);
  app.use('/api/templates', templateRouter);
  app.use('/api/scraper-status', scraperStatusRouter);
  app.use('/api/hashtag-emoji', hashtagEmojiRouter);
  app.use('/api/trending-emojis-hashtags', trendingEmojisHashtagsRouter);
  app.use('/api/options', optionsRouter);
  
  // Apply protected routes (requires authentication)
  app.use('/api', protectedRouter);
  
  // These routes are now handled through the protected router
  // app.use('/api/generate', generateContentRouter);
  // app.use('/api/analytics', analyticsRouter);
  // app.use('/api/custom-template', customTemplateTestRouter);
  // app.use('/api/ai-model-config', aiModelConfigRouter);
  // app.use('/api/social-media-optimization', socialMediaOptimizationRouter);
  // app.use('/api/video-script', videoScriptRouter);
  // app.use('/api/claude-content', claudeContentRouter);
  // app.use('/api/integrations', apiIntegrationRouter);
  // app.use('/api/history', historyRouter);
  // app.use('/api/usage-summary', usageSummaryRouter);
  // app.use('/api/webhooks', webhooksRouter);
  // app.use('/api/webhooks/test', webhookTestRouter);
  
  // Get scraper health endpoint
  app.get('/api/scraper-health', async (req, res) => {
    try {
      const scraperHealth = await storage.getScraperStatus();
      res.json(scraperHealth);
    } catch (error) {
      console.error("Error fetching scraper health:", error);
      res.status(500).json({ error: "Failed to fetch scraper health" });
    }
  });
  
  // Get API usage endpoint
  app.get('/api/usage', async (req, res) => {
    try {
      const apiUsage = await storage.getApiUsage();
      const today = await storage.getTodayApiUsage();
      const weeklyUsage = await storage.getWeeklyApiUsage();
      const monthlyUsage = await storage.getMonthlyApiUsage();
      
      res.json({
        today,
        weekly: weeklyUsage,
        monthly: monthlyUsage,
        limit: 500 // Monthly limit
      });
    } catch (error) {
      console.error("Error fetching API usage:", error);
      res.status(500).json({ error: "Failed to fetch API usage" });
    }
  });
  
  // Analytics endpoints are now handled by analyticsRouter

  const httpServer = createServer(app);
  return httpServer;
}
