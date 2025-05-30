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
import { testMakeWebhookRouter } from "./api/testMakeWebhook";
import { setupFeedbackRoutes } from "./api/feedback";
import { rewriteContent } from "./api/rewrite-content";
import { generateMultiPlatformContent, scheduleMultiPlatformContent } from "./api/multi-platform-generate";
import { rewriteCaption } from "./api/post/rewrite-caption";
import { generateDailyBatch } from "./api/daily-batch";
import { forceRefreshRouter } from "./api/force-refresh";
import { amazonLinksRouter } from "./api/amazonLinks";
import { testEnhancedPayloads } from "./api/test-enhanced-payloads";
import { cookingPipeline } from "./services/cookingContentPipeline";

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
  app.use('/api/force-refresh', forceRefreshRouter);
  app.use('/api/amazon-links', amazonLinksRouter);
  // Direct webhook test route
  app.get('/api/post/test-make-webhook', async (req, res) => {
    try {
      const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
      
      if (!makeWebhookUrl) {
        return res.status(400).json({
          error: 'Webhook not configured',
          details: 'Make.com webhook URL is not configured. Please set MAKE_WEBHOOK_URL environment variable.'
        });
      }

      // Simple test payload
      const mockPayload = {
        "test_field_1": "Hello from GlowBot",
        "test_field_2": "skincare",
        "test_field_3": "instagram",
        "caption": "This is a test caption",
        "hashtags": "#test #glowbot",
        "timestamp": new Date().toISOString()
      };

      const axios = require('axios');
      const response = await axios.post(makeWebhookUrl, mockPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return res.json({
        status: 'Webhook sent successfully',
        payload: mockPayload,
        response_status: response.status,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      return res.status(500).json({
        error: 'Webhook failed',
        details: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  });
  
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

  // Cooking content endpoints
  app.get('/api/cooking/ingredient-of-day', async (req, res) => {
    try {
      const ingredient = await cookingPipeline.selectTrendingIngredientOfDay();
      res.json(ingredient);
    } catch (error) {
      console.error("Error getting ingredient of day:", error);
      res.status(500).json({ error: "Failed to get ingredient of day" });
    }
  });

  app.post('/api/cooking/generate-recipe', async (req, res) => {
    try {
      const { ingredient, method } = req.body;
      
      if (!ingredient || !method) {
        return res.status(400).json({ error: "Ingredient and method are required" });
      }

      const ingredientData = { 
        name: ingredient, 
        popularity: 85, 
        seasonality: 'year-round', 
        nutritionFacts: 'Nutritious and delicious' 
      };
      
      const recipes = await cookingPipeline.generateRecipeContent(ingredientData, method);
      res.json({ recipes });
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ error: "Failed to generate recipe content" });
    }
  });

  app.post('/api/cooking/run-daily-pipeline', async (req, res) => {
    try {
      const result = await cookingPipeline.runDailyPipeline();
      res.json(result);
    } catch (error) {
      console.error("Error running daily cooking pipeline:", error);
      res.status(500).json({ error: "Failed to run daily cooking pipeline" });
    }
  });

  app.post('/api/cooking/generate-daily-batch', async (req, res) => {
    try {
      const batchRecipes = await cookingPipeline.generateDailyBatch();
      
      // Group recipes by skill level for better organization
      const groupedBySkill = {
        'Elite Chef': batchRecipes.filter(recipe => recipe.script.includes('elite chefs')),
        'Skilled Home Chef': batchRecipes.filter(recipe => recipe.script.includes('skilled home chefs')),
        'Beginner': batchRecipes.filter(recipe => recipe.script.includes('beginners'))
      };
      
      res.json({ batchRecipes: groupedBySkill });
    } catch (error) {
      console.error("Error generating daily batch:", error);
      res.status(500).json({ error: "Failed to generate daily batch content" });
    }
  });

  app.post('/api/cooking/generate-ad-video', async (req, res) => {
    try {
      const adContent = await cookingPipeline.generateCookAIngAdContent();
      res.json({ adContent });
    } catch (error) {
      console.error("Error generating ad content:", error);
      res.status(500).json({ error: "Failed to generate ad content" });
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

  // Daily batch content generation endpoint
  app.post('/api/generate/daily-batch', generateDailyBatch);
  
  // Test enhanced payloads endpoint
  app.post('/api/test/enhanced-payloads', testEnhancedPayloads);

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
