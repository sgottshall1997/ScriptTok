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
import redirectRouter from "./api/redirect";
import platformContentRouter from "./api/platform-content";
import hooksRouter from "./api/hooks";
import schedulingRouter from "./api/scheduling";
import metricsRouter from "./api/metrics";
import affiliateNetworksRouter from "./api/affiliate-networks";
import perplexityTrendsRouter from "./api/perplexity-trends";
import { pullPerplexityTrends } from "./services/perplexityTrendFetcher";
import { refreshIndividualProduct } from "./api/perplexity-individual-refresh";
import { generateSpartanFormatContent, checkSpartanAvailability } from "./api/spartan-content";
import { scheduleContent, getScheduledPosts, processScheduledPosts } from "./api/cross-platform-scheduling";
import { startBulkGeneration, getBulkJobStatus, getBulkJobs } from "./api/bulk-content-generation";
import { startAutomatedBulkGeneration, getBulkJobDetails, getBulkContentByJobId } from "./api/automated-bulk-generation";
import { getScheduledJobs, createScheduledJob, updateScheduledJob, deleteScheduledJob, triggerScheduledJob, initializeScheduledJobs } from "./api/scheduled-bulk-generation";
import { cronStatusRouter } from "./api/cron-status";
import perplexityStatusRouter from "./api/perplexity-status";
import aiAnalyticsRouter from "./api/ai-analytics";
import generateContentUnifiedRouter from "./api/generateContentUnified";
import favoritesRouter from "./api/favorites";
import { bulkGeneratedContent } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  saveRating, 
  getRating, 
  generatePatterns,
  getPreferences,
  updatePreferences,
  getSuggestions,
  trackApplication,
  getRatingStats
} from "./api/rating";

import { createRedirect, handleRedirect, getRedirectStats } from "./api/create-redirect";
import { enhanceCompliance, validateCompliance, getGuidelines, getSupportedPlatforms } from "./api/compliance";

export async function registerRoutes(app: Express): Promise<Server> {
  // Redirect system for affiliate tracking
  app.use('/api/redirect', redirectRouter);
  app.use('/go', redirectRouter);
  
  // Platform-specific content generation
  app.use('/api/platform-content', platformContentRouter);
  
  // Hook engine
  app.use('/api/hooks', hooksRouter);
  
  // Scheduling system
  app.use('/api/scheduling', schedulingRouter);
  
  // Performance metrics
  app.use('/api/metrics', metricsRouter);
  
  // Affiliate networks
  app.use('/api/affiliate-networks', affiliateNetworksRouter);
  
  // Perplexity trends
  app.use('/api/perplexity-trends', perplexityTrendsRouter);
  app.post('/api/perplexity-trends/refresh-individual', refreshIndividualProduct);
  
  // Cron job status monitoring
  app.use('/api', cronStatusRouter);
  
  // Perplexity status monitoring
  app.use('/api/perplexity-status', perplexityStatusRouter);
  
  // Compliance API routes
  app.post('/api/compliance/enhance', enhanceCompliance);
  app.post('/api/compliance/validate', validateCompliance);
  app.get('/api/compliance/guidelines/:platform', getGuidelines);
  app.get('/api/compliance/platforms', getSupportedPlatforms);
  // Register API routes
  // Legacy endpoint (deprecated - use /api/generate-unified instead)
  app.use('/api/generate-content', generateContentRouter);
  
  // New unified content generation endpoint
  app.use('/api/generate-unified', generateContentUnifiedRouter);
  app.use('/api/trending', trendingRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/template-test', templateTestRouter);
  app.use('/api/templates', templateRouter);
  
  // Enhanced template management API
  app.get('/api/templates', async (req, res) => {
    const { getTemplates } = await import('./api/templates');
    await getTemplates(req, res);
  });
  
  app.get('/api/templates/popular', async (req, res) => {
    const { getPopularTemplates } = await import('./api/templates');
    await getPopularTemplates(req, res);
  });
  
  app.get('/api/templates/recommendations', async (req, res) => {
    const { getTemplateRecommendations } = await import('./api/templates');
    await getTemplateRecommendations(req, res);
  });
  
  app.get('/api/templates/:id', async (req, res) => {
    const { getTemplateById } = await import('./api/templates');
    await getTemplateById(req, res);
  });
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
  app.use('/api/ai-analytics', aiAnalyticsRouter);
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
        "test_field_2": "beauty",
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
  
  // AI Models API routes
  const { registerAIModelsRoutes } = await import('./api/ai-models');
  registerAIModelsRoutes(app);
  
  // Import rating API functions
  const { 
    saveRating, 
    getRating, 
    generatePatterns, 
    getPreferences, 
    updatePreferences, 
    getSuggestions, 
    trackApplication, 
    getRatingStats,
    getSmartStyleRecommendations
  } = await import('./api/rating');

  // Rating system endpoints
  app.post('/api/rating/save', saveRating);
  app.get('/api/rating/:contentHistoryId', getRating);
  app.post('/api/rating/patterns/generate', generatePatterns);
  app.get('/api/rating/preferences/:userId', getPreferences);
  app.put('/api/rating/preferences/:userId', updatePreferences);
  app.get('/api/rating/suggestions', getSuggestions);
  app.post('/api/rating/track-application', trackApplication);
  app.get('/api/rating/stats', getRatingStats);
  app.get('/api/rating/smart-style', getSmartStyleRecommendations);
  
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

  // PART 2: Perplexity Trend Fetcher API Route - Now using niche-specific modules
  app.post('/api/pull-perplexity-trends', async (req, res) => {
    try {
      console.log('🔄 Manual Perplexity trends fetch triggered - using new niche-specific modules');
      const { runAllPerplexityFetchers } = await import('./services/perplexity/runAllFetchers');
      const result = await runAllPerplexityFetchers();
      
      let totalProductsAdded = 0;
      
      // Store products from each niche in database
      for (const nicheResult of result.results) {
        if (nicheResult.success && nicheResult.products.length > 0) {
          try {
            const { trendingProducts } = await import('@shared/schema');
            const { db } = await import('./db');
            
            for (const product of nicheResult.products) {
              await db.insert(trendingProducts).values({
                title: product.product,
                source: 'perplexity',
                mentions: product.mentions,
                niche: nicheResult.niche,
                dataSource: 'perplexity',
                reason: product.reason || null
              });
              totalProductsAdded++;
              console.log(`✅ Added ${nicheResult.niche} product: ${product.product} (reason: "${product.reason || 'no reason provided'}")`);
            }
          } catch (dbError) {
            console.error(`❌ Database error for ${nicheResult.niche}:`, dbError);
          }
        }
      }
      
      res.json({
        success: true,
        message: `Niche-specific fetch completed. Added ${totalProductsAdded} products from ${result.summary.successful}/${result.summary.totalFetchers} fetchers`,
        productsAdded: totalProductsAdded,
        fetcherResults: result.summary,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in niche-specific Perplexity fetch:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
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

  // Test all niche-specific Perplexity fetchers
  app.post('/api/test-niche-fetchers', async (req, res) => {
    try {
      const { runAllPerplexityFetchers } = await import('./services/perplexity/runAllFetchers');
      const result = await runAllPerplexityFetchers();
      res.json({
        success: true,
        message: `Tested ${result.summary.totalFetchers} fetchers: ${result.summary.successful} successful, ${result.summary.failed} failed`,
        summary: result.summary,
        results: result.results
      });
    } catch (error) {
      console.error("❌ Error testing niche fetchers:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to test niche fetchers",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Test individual niche fetcher
  app.post('/api/test-niche-fetcher/:niche', async (req, res) => {
    try {
      const { niche } = req.params;
      const validNiches = ['fitness', 'beauty', 'travel', 'tech', 'fashion', 'food', 'pets'];
      
      if (!validNiches.includes(niche)) {
        return res.status(400).json({
          success: false,
          message: `Invalid niche. Must be one of: ${validNiches.join(', ')}`
        });
      }

      const startTime = Date.now();
      
      // Dynamic import based on niche
      const fetcherMap = {
        fitness: () => import('./services/perplexity/perplexityFetchFitness').then(m => m.fetchTrendingFitnessProducts),
        beauty: () => import('./services/perplexity/perplexityFetchBeauty').then(m => m.fetchTrendingBeautyProducts),
        travel: () => import('./services/perplexity/perplexityFetchTravel').then(m => m.fetchTrendingTravelProducts),
        tech: () => import('./services/perplexity/perplexityFetchTech').then(m => m.fetchTrendingTechProducts),
        fashion: () => import('./services/perplexity/perplexityFetchFashion').then(m => m.fetchTrendingFashionProducts),
        food: () => import('./services/perplexity/perplexityFetchFood').then(m => m.fetchTrendingFoodProducts),
        pets: () => import('./services/perplexity/perplexityFetchPets').then(m => m.fetchTrendingPetsProducts)
      };

      const fetcherFunction = await fetcherMap[niche as keyof typeof fetcherMap]();
      const products = await fetcherFunction();
      const duration = Date.now() - startTime;

      res.json({
        success: true,
        niche,
        products,
        count: products.length,
        duration: `${duration}ms`,
        message: `Successfully fetched ${products.length} ${niche} products`
      });

    } catch (error) {
      console.error(`❌ Error testing ${req.params.niche} fetcher:`, error);
      res.status(500).json({ 
        success: false, 
        niche: req.params.niche,
        message: `Failed to test ${req.params.niche} fetcher`,
        error: error instanceof Error ? error.message : String(error)
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

  // NEW FEATURES: Cross-platform scheduling, bulk generation, and performance analytics
  
  // Cross-Platform Scheduling
  app.post('/api/scheduling/schedule-content', scheduleContent);
  app.get('/api/scheduling/posts', getScheduledPosts);
  app.post('/api/scheduling/process', processScheduledPosts);
  
  // Legacy Bulk Content Generation (deprecated - use /api/generate-unified instead)
  app.post('/api/bulk/start-generation', (req, res) => {
    console.log('⚠️ Deprecated endpoint /api/bulk/start-generation called - use /api/generate-unified instead');
    startBulkGeneration(req, res);
  });
  app.get('/api/bulk/job/:jobId', getBulkJobStatus);
  app.get('/api/bulk/jobs', getBulkJobs);
  app.get('/api/bulk/content/:jobId', getBulkContentByJobId);
  
  // Legacy Automated bulk generation (deprecated - use /api/generate-unified instead)
  app.post('/api/automated-bulk/start', (req, res) => {
    console.log('⚠️ Deprecated endpoint /api/automated-bulk/start called - use /api/generate-unified instead');
    startAutomatedBulkGeneration(req, res);
  });
  app.get('/api/automated-bulk/details/:jobId', getBulkJobDetails);
  
  // Scheduled bulk generation
  app.get('/api/scheduled-bulk/jobs', getScheduledJobs);
  app.post('/api/scheduled-bulk/jobs', createScheduledJob);
  app.put('/api/scheduled-bulk/jobs/:id', updateScheduledJob);
  app.delete('/api/scheduled-bulk/jobs/:id', deleteScheduledJob);
  app.post('/api/scheduled-bulk/jobs/:id/trigger', triggerScheduledJob);
  
  // Spartan content generation endpoints
  app.post('/api/spartan/generate', generateSpartanFormatContent);
  app.get('/api/spartan/availability', checkSpartanAvailability);
  
  // Performance Analytics & ROI Tracking


  // Smart Redirect API
  app.post('/api/create-redirect', createRedirect);
  app.get('/r/:id', handleRedirect);
  app.get('/api/redirect-stats', getRedirectStats);
  
  // Favorites API
  app.use('/api/favorites', favoritesRouter);

  const httpServer = createServer(app);
  return httpServer;
}
