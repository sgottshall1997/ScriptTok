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
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined
    });
  }
});

/**
 * GET /api/cookaing-promo/templates
 * Get available templates for objectives and channels
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { getTemplate } = await import('../../packages/cookaing-promo/templateRegistry');
    
    // Return available objectives and channels
    const objectives = [
      "feature_highlight", "how_to_demo", "user_scenario", "before_after",
      "launch_announcement", "new_feature_alert", "newsletter", "winback",
      "seo_article", "deep_dive", "comparison", "testimonial_script",
      "explainer_script", "ad_copy", "challenge", "quiz_poll", "ugc_prompt"
    ];

    const channels = [
      "tiktok_reel", "instagram_reel", "x_thread", "linkedin_post",
      "email", "blog", "ads_google", "ads_meta", "ads_tiktok"
    ];

    res.json({
      success: true,
      data: {
        objectives,
        channels,
        combinations: objectives.length * channels.length
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