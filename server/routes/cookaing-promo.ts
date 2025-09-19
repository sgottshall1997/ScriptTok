import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generatePromo, PromoInputSchema } from '../../packages/cookaing-promo';

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

    res.json(generatedContent);

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

export default router;