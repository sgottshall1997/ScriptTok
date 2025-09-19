import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateContentRouter } from "./api/generateContent";
import { trendingRouter } from "./api/trending";
import { analyticsRouter } from "./api/analytics";
import { templateRouter } from "./api/templates";
import { scraperStatusRouter } from "./api/scraperStatus";
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
import { sendToMakeRouter } from "./api/sendToMake";
import { sendBatchRouter } from "./api/sendBatch";
import { setupFeedbackRoutes } from "./api/feedback";
import { rewriteContent } from "./api/rewrite-content";
import { generateMultiPlatformContent, scheduleMultiPlatformContent } from "./api/multi-platform-generate";
import { rewriteCaption } from "./api/post/rewrite-caption";
import { generateDailyBatch } from "./api/daily-batch";

import { amazonLinksRouter } from "./api/amazonLinks";

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
import { createScheduledBulkJob, getScheduledBulkJobs, deleteScheduledBulkJob, initializeScheduledJobs } from "./api/simple-scheduler";
import trendsRouter from "./api/cookaing-marketing/trends";
import affiliateAutoInsertRouter from "./api/cookaing-marketing/affiliate-auto-insert";
import cookAIngPromoRouter from "./routes/cookaing-promo";
// Old scheduled-bulk-generation system removed - using simplified automated-bulk scheduling

import { cronStatusRouter } from "./api/cron-status";
import perplexityStatusRouter from "./api/perplexity-status";
import aiAnalyticsRouter from "./api/ai-analytics-fixed";
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
import syncRatingsRouter from "./api/sync-ratings";
import { registerContentEvaluationRoutes } from "./api/content-evaluation";
import claudeAiSuggestionsRouter from "./api/claudeAiSuggestions";

import { perplexityAutomationRouter } from "./api/perplexity-automation";
import safeguardMonitorRouter from "./api/safeguard-monitor";
import amazonRouter from "./api/amazon";
import amazonTrendsRouter from "./api/amazon-trends";
import hybridTrendsRouter from "./api/hybridTrends";

// CookAIng Marketing Engine routers
import organizationsRouter from "./api/organizations";
import contactsRouter from "./api/contacts";
import campaignsRouter from "./api/campaigns";
import workflowsRouter from "./api/workflows";
import formsRouter from "./api/forms";
import publicFormsRouter from "./api/public-forms";
import affiliateProductsRouter from "./api/affiliate-products";
import emailRouter from "./api/cookaing-marketing/email";
import socialRouter from "./api/cookaing-marketing/social";
import blogRouter from "./api/cookaing-marketing/blog";
import pushRouter from "./api/cookaing-marketing/push";
import abRouter from "./api/cookaing-marketing/ab";
import conversionsRouter from "./api/cookaing-marketing/conversions";
import reportsRouter from "./api/cookaing-marketing/reports";
import integrationsHealthRouter from "./api/cookaing-marketing/integrations/health";
import observabilityRouter from "./api/cookaing-marketing/observability";
import contentRouter from "./api/cookaing-marketing/content";
import contentEnhancementRouter from "./api/cookaing-marketing/content-enhancement";
import unifiedContentRouter from "./api/cookaing-marketing/unified-content";
import intelligenceRouter from "./api/cookaing-marketing/intelligence";
import socialAutomationRouter from "./api/cookaing-marketing/social-automation";
import complianceRouter from "./api/cookaing-marketing/compliance";
import enhanceRouter from "./api/cookaing-marketing/enhance";
import { seedDataRouter } from "./api/seed-data";
import phase5Router from "./api/cookaing-marketing";
import glowbotAdminRouter from "./api/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // GlowBot Admin routes (for comprehensive testing)
  app.use('/api/glowbot/admin', glowbotAdminRouter);
  
  // CookAIng Marketing Engine routes
  app.use('/api/cookaing-marketing/organizations', organizationsRouter);
  app.use('/api/cookaing-marketing/contacts', contactsRouter);
  app.use('/api/cookaing-marketing/campaigns', campaignsRouter);
  app.use('/api/cookaing-marketing/workflows', workflowsRouter);
  app.use('/api/cookaing-marketing/forms', formsRouter);
  app.use('/api/cookaing-marketing/affiliate-products', affiliateProductsRouter);
  
  // Public forms access (limited to public endpoints only)
  app.use('/api/forms', publicFormsRouter);
  app.use('/api/cookaing-marketing/email', emailRouter);
  app.use('/api/cookaing-marketing/social', socialRouter);
  app.use('/api/cookaing-marketing/blog', blogRouter);
  app.use('/api/cookaing-marketing/push', pushRouter);
  app.use('/api/cookaing-marketing/ab', abRouter);
  app.use('/api/cookaing-marketing/conversions', conversionsRouter);
  app.use('/api/cookaing-marketing/reports', reportsRouter);
  app.use('/api/cookaing-marketing/integrations/health', integrationsHealthRouter);
  app.use('/api/cookaing-marketing/observability', observabilityRouter);
  app.use('/api/cookaing-marketing/content', contentRouter);
  app.use('/api/cookaing-marketing/content-enhancement', contentEnhancementRouter);
  app.use('/api/cookaing-marketing/unified-content', unifiedContentRouter);
  app.use('/api/cookaing-marketing/intel', intelligenceRouter);
  app.use('/api/cookaing-marketing/social-automation', socialAutomationRouter);
  app.use('/api/cookaing-marketing/compliance', complianceRouter);
  app.use('/api/cookaing-marketing/enhance', enhanceRouter);
  
  // Phase 5: Advanced Personalization and Collaboration
  app.use('/api/cookaing-marketing', phase5Router);
  app.use('/api/cookaing-marketing/trends', trendsRouter);
  app.use('/api/cookaing-marketing/affiliate-auto-insert', affiliateAutoInsertRouter);
  app.use('/api/cookaing-promo', cookAIngPromoRouter);
  app.use('/api/cookaing-marketing/seed-data', seedDataRouter);
  
  // CookAIng Marketing Engine authentication
  app.post('/api/cookaing-marketing/auth/login', (req, res) => {
    const { password } = req.body;
    const expectedPassword = process.env.COOKAING_SECTION_PASSWORD;
    
    if (!expectedPassword) {
      return res.json({ success: true }); // No password protection configured
    }
    
    if (password === expectedPassword) {
      return res.json({ success: true });
    }
    
    return res.status(401).json({ success: false, error: 'Invalid password' });
  });
  
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
  app.use('/api/cron-status', cronStatusRouter);
  
  // Perplexity status monitoring
  app.use('/api/perplexity-status', perplexityStatusRouter);
  
  // New unified content generation endpoint (moved earlier to prevent conflicts)
  app.use('/api/generate-unified', generateContentUnifiedRouter);
  
  // Compliance API routes
  app.post('/api/compliance/enhance', enhanceCompliance);
  app.post('/api/compliance/validate', validateCompliance);
  app.get('/api/compliance/guidelines/:platform', getGuidelines);
  app.get('/api/compliance/platforms', getSupportedPlatforms);
  // Register API routes
  // Legacy endpoint (deprecated - use /api/generate-unified instead)
  app.use('/api/generate-content', generateContentRouter);
  app.use('/api/trending', trendingRouter);
  app.use('/api/analytics', analyticsRouter);

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

  app.use('/api/ai-model-config', aiModelConfigRouter);
  app.use('/api/hashtag-emoji', hashtagEmojiRouter);
  app.use('/api/social-media-optimization', socialMediaOptimizationRouter);
  app.use('/api/video-script', videoScriptRouter);
  app.use('/api/claude-content', claudeContentRouter);
  app.use('/api/trending-emojis-hashtags', trendingEmojisHashtagsRouter);
  app.use('/api/integrations', apiIntegrationRouter);
  app.use('/api/options', optionsRouter);
  app.use('/api/history', historyRouter);
  
  // Content history alias endpoint
  app.get('/api/content-history', async (req, res) => {
    const { getAllContentHistory } = await import('./storage');
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const history = await storage.getAllContentHistory(limit, offset);
      
      res.json({
        success: true,
        history,
        pagination: {
          limit,
          offset,
          total: history.length
        }
      });
    } catch (error: any) {
      console.error('Error fetching content history:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch content history',
        message: error.message
      });
    }
  });
  app.use('/api/usage-summary', usageSummaryRouter);
  app.use('/api/ai-analytics', aiAnalyticsRouter);
  app.use('/api/webhooks', webhooksRouter);
  // Webhook test endpoints removed due to missing router definitions
  app.use('/api/sync-ratings', syncRatingsRouter);
  app.use('/api/post/send-to-make', sendToMakeRouter);
  app.use('/api/post/send-batch', sendBatchRouter);

  app.use('/api/amazon-links', amazonLinksRouter);
  app.use('/api/amazon', amazonRouter);
  app.use('/api/amazon-trends', amazonTrendsRouter);
  app.use('/api/hybrid-trends', hybridTrendsRouter);
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

  // Prompt structure endpoint for Template Explorer transparency
  app.post('/api/prompt-structure', async (req, res) => {
    try {
      const { templateType, niche, tone, productName } = req.body;
      
      if (!templateType || !niche || !tone) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['templateType', 'niche', 'tone']
        });
      }

      // Import prompt factory to get the actual prompt structure
      const { generatePrompt } = await import('./services/promptFactory');
      
      const promptConfig = {
        niche,
        templateType,
        tone,
        productName: productName || 'Sample Product',
        contentFormat: 'standard' as const
      };

      const promptStructure = generatePrompt(promptConfig);
      
      res.json({
        success: true,
        systemPrompt: promptStructure.systemPrompt,
        userPrompt: promptStructure.userPrompt,
        templateType: promptStructure.templateMetadata.templateType,
        niche: promptStructure.templateMetadata.niche,
        tone: promptStructure.templateMetadata.tone,
        contentFormat: promptStructure.templateMetadata.contentFormat
      });
    } catch (error) {
      console.error('Error generating prompt structure:', error);
      res.status(500).json({
        error: 'Failed to generate prompt structure',
        details: error.message
      });
    }
  });
  
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

  // PART 2: Amazon Trend Fetcher API Route
  app.post('/api/pull-amazon-trends', async (req, res) => {
    try {
      console.log('🔄 Manual Amazon trends fetch triggered');
      const { default: amazonTrendsRouter } = await import('./api/amazon-trends');
      const amazonTrendsService = require('./api/amazon-trends');
      
      // Call the refresh-all endpoint
      const mockRequest = { method: 'POST', url: '/refresh-all' };
      const mockResponse = {
        json: (data: any) => data,
        status: (code: number) => ({
          json: (data: any) => ({ ...data, statusCode: code })
        })
      };
      
      // Simulated API call to refresh all Amazon trends
      const result = await fetch('http://localhost:5000/api/amazon-trends/refresh-all', {
        method: 'POST'
      });
      
      const data = await result.json();
      
      res.json({
        success: true,
        message: `Amazon fetch completed. Added ${data.totalProducts || 0} products`,
        productsAdded: data.totalProducts || 0,
        source: 'amazon',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error in Amazon trends fetch:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  });

  // PART 3: Perplexity Trend Fetcher API Route - Now using niche-specific modules
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
  
  // OLD SCHEDULED BULK GENERATION ROUTES REMOVED
  // Now using simplified scheduling: /api/automated-bulk/schedule
  
  // NEW: Database-persistent scheduling system
  app.post('/api/automated-bulk/schedule', createScheduledBulkJob);
  app.get('/api/automated-bulk/scheduled-jobs', getScheduledBulkJobs);
  app.delete('/api/automated-bulk/scheduled-jobs/:jobId', deleteScheduledBulkJob);
  
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



  
  // 🛑 SAFEGUARD MONITORING ENDPOINTS
  app.use('/api/safeguards', safeguardMonitorRouter);
  
  // 🚫 GLOBAL GATEKEEPER MONITORING ENDPOINTS

  
  // 🧪 SAFEGUARD TESTING ENDPOINTS

  
  // 🚨 EMERGENCY SHUTDOWN ENDPOINTS

  
  // 🔄 PERPLEXITY AUTOMATION CONTROL
  app.use('/api/perplexity-automation', perplexityAutomationRouter);

  // Register content evaluation routes
  registerContentEvaluationRoutes(app);
  
  // Claude AI Suggestions system for niche-specific content optimization
  app.use('/api/claude-suggestions', claudeAiSuggestionsRouter);

  // Test endpoint for scheduled generation validation - DEVELOPMENT ONLY
  app.get('/api/test/scheduled-generation', async (req, res) => {
    // 🚫 PRODUCTION BLOCK: No tests in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Test endpoints are disabled in production',
        message: 'This endpoint is only available in development mode',
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log('🧪 Starting scheduled generation test via API...');
      const testPassed = await testScheduledGeneration();
      
      res.json({
        success: true,
        testPassed,
        message: testPassed ? 'All scheduled generation tests passed!' : 'Some tests failed - check console logs',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Test endpoint error:', error);
      res.status(500).json({
        success: false,
        testPassed: false,
        error: error.message || 'Test execution failed',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // 🧪 COMPREHENSIVE SAFEGUARD TEST ENDPOINT - DEVELOPMENT ONLY
  app.get('/api/test/comprehensive-safeguards', async (req, res) => {
    // 🚫 PRODUCTION BLOCK: No tests in production
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Test endpoints are disabled in production',
        message: 'This endpoint is only available in development mode',
        timestamp: new Date().toISOString()
      });
    }

    try {
      console.log('🧪 Starting comprehensive safeguard test suite...');
      const { runComprehensiveSafeguardTest } = await import('./tests/comprehensive-safeguard-test');
      const testResults = await runComprehensiveSafeguardTest();
      
      res.json({
        success: true,
        testResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Comprehensive safeguard test error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Test execution failed',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Test endpoint removed to fix deployment - was causing missing import error
  
  // 🏥 HEALTH CHECK ENDPOINT FOR DEPLOYMENT DIAGNOSTICS
  app.get('/api/health', async (req, res) => {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        database: {
          connected: false,
          error: null
        },
        dependencies: {
          openai: !!process.env.OPENAI_API_KEY,
          anthropic: !!process.env.ANTHROPIC_API_KEY,
          database: !!process.env.DATABASE_URL,
          webhook: !!process.env.MAKE_WEBHOOK_URL
        }
      };
      
      // Test database connection
      try {
        await db.execute('SELECT 1');
        healthStatus.database.connected = true;
      } catch (dbError) {
        healthStatus.database.connected = false;
        healthStatus.database.error = dbError.message;
        healthStatus.status = 'degraded';
      }
      
      // Check if any critical dependencies are missing
      const criticalDeps = ['openai', 'anthropic', 'database'];
      const missingDeps = criticalDeps.filter(dep => !healthStatus.dependencies[dep]);
      
      if (missingDeps.length > 0) {
        healthStatus.status = 'degraded';
        healthStatus.missingDependencies = missingDeps;
      }
      
      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
      
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Health check failed'
      });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize scheduled jobs from database
  initializeScheduledJobs().catch(error => {
    console.error('❌ Failed to initialize scheduled jobs:', error);
  });
  
  return httpServer;
}
