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
import { sendToMakeRouter } from "./api/sendToMake";
import { sendBatchRouter } from "./api/sendBatch";
import { setupFeedbackRoutes } from "./api/feedback";
import { rewriteContent } from "./api/rewrite-content";
import { generateMultiPlatformContent, scheduleMultiPlatformContent } from "./api/multi-platform-generate";
import { rewriteCaption } from "./api/post/rewrite-caption";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes
  app.use('/api/generate-content', generateContentRouter);
  app.use('/api/trending', trendingRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/template-test', templateTestRouter);
  app.use('/api/templates', templateRouter);
  app.use('/api/scraper-status', scraperStatusRouter);
  app.use('/api/custom-template', customTemplateTestRouter);
  app.use('/api/ai-model-config', aiModelConfigRouter);
  app.use('/api/hashtag-emoji', hashtagEmojiRouter);
  app.use('/api/social-media-optimization', socialMediaOptimizationRouter);
  app.use('/api/video-script', videoScriptRouter);
  app.use('/api/claude-content', claudeContentRouter);
  app.use('/api/trending-emojis-hashtags', trendingEmojisHashtagsRouter);
  app.use('/api/integrations', apiIntegrationRouter);
  app.use('/api/options', optionsRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/usage-summary', usageSummaryRouter);
  app.use('/api/webhooks', webhooksRouter);
  app.use('/api/webhooks/test', webhookTestRouter);
  app.use('/api/post/send-to-make', sendToMakeRouter);
  app.use('/api/post/send-batch', sendBatchRouter);
  
  // Rewrite content endpoint
  app.post('/api/post/rewrite-content', rewriteContent);
  
  // Caption rewrite endpoint
  app.post('/api/post/rewrite-caption', rewriteCaption);
  
  // Multi-platform content generation endpoints
  app.post('/api/multi-platform/generate', generateMultiPlatformContent);
  app.post('/api/multi-platform/schedule', scheduleMultiPlatformContent);
  
  // Setup feedback logging routes
  setupFeedbackRoutes(app);
  
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

  // Daily content showcase endpoint
  app.get('/api/daily-showcase', async (req, res) => {
    try {
      const { getDailyShowcase } = await import('./services/dailyShowcase.js');
      const showcaseData = await getDailyShowcase();
      
      res.json({ 
        success: true, 
        data: showcaseData 
      });
      
    } catch (error) {
      console.error('Daily showcase error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate daily showcase' 
      });
    }
  });

  // Amazon Beauty Products endpoint
  app.get('/api/trending-amazon-beauty', async (req, res) => {
    try {
      const { getTrendingAmazonProducts } = await import('./scrapers/amazonBeauty.js');
      const products = await getTrendingAmazonProducts();
      
      res.json({ 
        success: true, 
        data: products,
        count: products.length,
        niches: 7,
        productsPerNiche: 4
      });
      
    } catch (error) {
      console.error('Amazon beauty scraping error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch Amazon beauty products' 
      });
    }
  });

  // Amazon Beauty Products by specific niche
  app.get('/api/trending-amazon-beauty/:niche', async (req, res) => {
    try {
      const { getTrendingAmazonProductsByNiche } = await import('./scrapers/amazonBeauty.js');
      const { niche } = req.params;
      const products = await getTrendingAmazonProductsByNiche(niche);
      
      res.json({ 
        success: true, 
        data: products,
        niche: niche,
        count: products.length
      });
      
    } catch (error) {
      console.error(`Amazon beauty scraping error for ${req.params.niche}:`, error);
      res.status(500).json({ 
        success: false, 
        error: `Failed to fetch Amazon beauty products for ${req.params.niche}` 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
