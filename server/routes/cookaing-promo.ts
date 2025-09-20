import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generatePromo, PromoInputSchema } from '../../packages/cookaing-promo';
import { storage } from '../storage';
import { 
  insertCookaingContentVersionSchema, 
  insertCookaingContentRatingSchema,
  CookaingContentVersion,
  CookaingContentRating
} from '@shared/schema';

const router = Router();

/**
 * POST /api/cookaing-promo/generate
 * Generate CookAIng promotional content using Spartan format
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    console.log('🍳 CookAIng Promo generation request received');
    
    // Validate request body against PromoInputSchema
    const validationResult = PromoInputSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: validationResult.error.errors
      });
    }

    const promoInput = validationResult.data;
    console.log(`🎯 Generating promo for ${promoInput.channels.length} channel(s): ${promoInput.channels.join(', ')}`);
    console.log(`📝 Objective: ${promoInput.objective}`);
    console.log(`👥 Audience: ${promoInput.audiencePersona}`);

    // Generate content using the shared promo package
    const generatedContent = await generatePromo(promoInput);

    if (!generatedContent || generatedContent.length === 0) {
      console.error('❌ No content generated');
      return res.status(500).json({
        success: false,
        error: 'Failed to generate content'
      });
    }

    console.log(`✅ Successfully generated content for ${generatedContent.length} channel(s)`);
    console.log(`📊 Total word count: ${generatedContent.reduce((sum, content) => sum + (content.metadata.wordCount || 0), 0)}`);

    // Persist each generated content piece to database for history and rating
    const persistedContent: CookaingContentVersion[] = [];
    
    try {
      for (const content of generatedContent) {
        // Map the generated content to the database schema
        const contentToSave = {
          // CookAIng-specific fields
          channel: content.channel,
          platform: content.platform || null,
          title: `${promoInput.objective} - ${content.channel}`,
          summary: content.hook.substring(0, 200) + (content.hook.length > 200 ? '...' : ''),
          template: promoInput.objective,
          metadataJson: content.metadata,
          payloadJson: content,
          createdBy: 'promo-generator',
          
          // GlowBot parity fields
          userId: req.user?.id || null,
          sessionId: content.id,
          niche: 'food', // CookAIng is food-focused
          contentType: promoInput.objective,
          tone: promoInput.tone || 'friendly',
          productName: promoInput.productName || 'CookAIng',
          promptText: `Generate ${promoInput.objective} content for ${content.channel} targeting ${promoInput.audiencePersona}`,
          outputText: content.hook,
          platformsSelected: promoInput.channels,
          generatedOutput: generatedContent,
          affiliateLink: promoInput.utmParams ? `https://cookaing.app?${new URLSearchParams(promoInput.utmParams).toString()}` : null,
          viralInspo: null,
          model: 'claude-3-sonnet',
          modelUsed: 'claude-3-sonnet',
          tokenCount: content.metadata.wordCount * 4, // Rough estimate
          fallbackLevel: null,
          aiModel: 'claude',
          contentFormat: 'Spartan Format',
          topRatedStyleUsed: false
        };

        const saved = await storage.saveCookaingContentVersion(contentToSave);
        persistedContent.push(saved);
        console.log(`💾 Persisted content for ${content.channel} with ID: ${saved.id}`);
      }
    } catch (persistError) {
      console.error('⚠️ Failed to persist content, but returning generated content:', persistError);
      // Don't fail the request if persistence fails, just log it
    }

    // Return the generated content with persisted IDs for frontend use
    const responseContent = generatedContent.map((content, index) => ({
      ...content,
      persistedId: persistedContent[index]?.id || null
    }));

    res.json(responseContent);

  } catch (error) {
    console.error('❌ CookAIng promo generation error:', error);
    
    // Log full error details server-side but don't expose to client
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    
    // Check for specific error types and provide helpful messages
    let userMessage = 'Failed to generate promo content';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        userMessage = 'AI service configuration error. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        userMessage = 'AI service temporarily unavailable. Please try again in a few minutes.';
        statusCode = 429;
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again with simpler parameters.';
        statusCode = 408;
      }
    }
    
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      // Only include error details in development
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    });
  }
});

/**
 * GET /api/cookaing-promo/templates
 * Get available templates for objectives and channels (derived from TEMPLATE_REGISTRY)
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { TEMPLATE_REGISTRY } = await import('../../packages/cookaing-promo/templateRegistry');
    
    // Derive objectives and channels dynamically from registry to prevent drift
    const objectives = Object.keys(TEMPLATE_REGISTRY);
    const channels = Object.keys(TEMPLATE_REGISTRY[objectives[0] as keyof typeof TEMPLATE_REGISTRY]);

    res.json({
      success: true,
      data: {
        objectives,
        channels,
        combinations: objectives.length * channels.length,
        registry: TEMPLATE_REGISTRY // Optional: include full registry for UI to use
      }
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch templates'
    });
  }
});

/**
 * GET /api/cookaing-promo/spartan-rules
 * Get Spartan format rules for reference
 */
router.get('/spartan-rules', async (req: Request, res: Response) => {
  try {
    const { getSpartanFormatRules } = await import('../../packages/cookaing-promo/promptFactory');
    
    const rules = getSpartanFormatRules();
    
    res.json({
      success: true,
      data: {
        rules,
        description: "Spartan format enforces clear, simple, direct language optimized for conversion",
        wordLimits: {
          "tiktok_reel": 40,
          "instagram_reel": 40,
          "x_thread": 280,
          "linkedin_post": 200,
          "email": 150,
          "blog": 800,
          "ads_google": 30,
          "ads_meta": 125,
          "ads_tiktok": 40
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching Spartan rules:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Spartan rules'
    });
  }
});

/**
 * GET /api/cookaing-promo/history
 * Get content generation history with optional filtering
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { limit = 50, niche, template, platform, channel } = req.query;
    
    const filter: any = {};
    if (niche) filter.niche = niche as string;
    if (template) filter.template = template as string;
    if (platform) filter.platform = platform as string;
    if (channel) filter.channel = channel as string;

    const history = await storage.getCookaingContentVersions(filter);
    
    res.json({
      success: true,
      data: history.slice(0, Number(limit)),
      count: history.length,
      filters: filter
    });
  } catch (error) {
    console.error('❌ Error fetching content history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch content history'
    });
  }
});

/**
 * GET /api/cookaing-promo/history/:id
 * Get specific content version by ID
 */
router.get('/history/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content ID'
      });
    }

    const content = await storage.getCookaingContentVersionById(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    // Also fetch ratings for this content
    const ratings = await storage.getCookaingContentRatingsByVersion(id);

    res.json({
      success: true,
      data: {
        content,
        ratings,
        avgRating: ratings.length > 0 ? 
          ratings.reduce((sum, r) => sum + (r.userScore || 0), 0) / ratings.length : 0
      }
    });
  } catch (error) {
    console.error('❌ Error fetching content by ID:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch content'
    });
  }
});

/**
 * POST /api/cookaing-promo/rating
 * Save or update content rating
 */
router.post('/rating', async (req: Request, res: Response) => {
  try {
    // Validate the rating data
    const validatedData = insertCookaingContentRatingSchema.parse(req.body);
    
    const rating = await storage.saveCookaingContentRating(validatedData);
    
    console.log(`⭐ Rating saved for content version ${validatedData.versionId}: ${validatedData.userScore || validatedData.overallRating}/100`);
    
    res.json({
      success: true,
      data: rating,
      message: 'Rating saved successfully'
    });
  } catch (error) {
    console.error('❌ Error saving rating:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating data',
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save rating'
    });
  }
});

/**
 * GET /api/cookaing-promo/rating/:versionId
 * Get ratings for a specific content version
 */
router.get('/rating/:versionId', async (req: Request, res: Response) => {
  try {
    const versionId = parseInt(req.params.versionId);
    
    if (isNaN(versionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content version ID'
      });
    }

    const ratings = await storage.getCookaingContentRatingsByVersion(versionId);
    
    // Calculate average ratings
    const avgUserScore = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + (r.userScore || 0), 0) / ratings.length : 0;
    
    const avgOverallRating = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + (r.overallRating || 0), 0) / ratings.length : 0;

    res.json({
      success: true,
      data: {
        ratings,
        averages: {
          userScore: Math.round(avgUserScore * 10) / 10,
          overallRating: Math.round(avgOverallRating * 10) / 10,
          ratingCount: ratings.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch ratings'
    });
  }
});

/**
 * GET /api/cookaing-promo/top-rated
 * Get top-rated content versions for learning and inspiration
 */
router.get('/top-rated', async (req: Request, res: Response) => {
  try {
    const { minRating = 70, limit = 20, niche } = req.query;
    
    const filter: any = { minRating: Number(minRating) };
    if (niche) filter.niche = niche as string;

    const topRated = await storage.getTopRatedCookaingContent(filter);
    
    res.json({
      success: true,
      data: topRated.slice(0, Number(limit)),
      filters: filter,
      message: `Found ${topRated.length} highly-rated content pieces`
    });
  } catch (error) {
    console.error('❌ Error fetching top-rated content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top-rated content'
    });
  }
});

export default router;