import { Router } from "express";
import { z } from "zod";
import { TEMPLATE_TYPES, TONE_OPTIONS, NICHES } from "@shared/constants";
import { storage } from "../storage";
import { generateContent, estimateVideoDuration } from "../services/contentGenerator";
import { generateVideoContent } from "../services/videoContentGenerator";
// import { generatePlatformSpecificContent } from "../services/platformContentGenerator"; // TODO: Implement platform content generator
import { CacheService } from "../services/cacheService";
import { insertContentHistorySchema } from "@shared/schema";
import rateLimit from "express-rate-limit";
import { logFeedback } from "../database/feedbackLogger";
import { selectBestTemplate } from "../services/surpriseMeSelector";

// Helper function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}

// Helper function to extract hook from generated content
function extractHook(content: string): string {
  // Look for common hook patterns in the content
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    // Return the first meaningful line as the hook
    const firstLine = lines[0].trim();
    // Remove common prefixes and return clean hook
    return firstLine.replace(/^(Hook:|Intro:|Opening:)\s*/i, '').trim();
  }
  return 'Generated content';
}

// Helper function to generate platform-specific caption for saving to history
function generatePlatformCaptionForSaving(platform: string, contentData: any, productName: string, linkUrl: string, niche: string): string {
  if (!contentData || !productName) return '';
  
  // TikTok configuration only
  const config = {
    cta: "Link in bio! 🔗✨",
    hashtags: ["#fyp", "#viral", `#${niche}`, "#trending", "#musthave"],
    maxLength: 200
  };

  // Create a completely different social media style caption
  const socialCaptions = [
    `Just tried the ${productName} and I'm SHOOK! 😱 This is why everyone's talking about it. Definitely adding to cart! 🛒`,
    `POV: You found the perfect ${productName} and your ${niche} routine is about to be elite ✨ Thank me later!`,
    `This ${productName} has been all over my FYP and now I see why! The reviews don't lie 🔥`,
    `Guys... this ${productName} is IT! Been using it for a week and I'm obsessed 💕 Had to share!`,
    `Not me gatekeeping this ${productName} until now 🤫 But y'all deserve to know about this gem!`,
    `The ${productName} that everyone's been raving about? Yeah, it lives up to the hype! 🙌`,
    `Okay but why did nobody tell me about this ${productName} sooner?! Game changer! ⚡`,
    `This ${productName} just hit different 💯 Perfect for my ${niche} girlies who get it!`
  ];
  
  // Pick a random social caption
  const caption = socialCaptions[Math.floor(Math.random() * socialCaptions.length)];
  
  // Add CTA and hashtags
  const fullCaption = `${caption}\n\n${config.cta}\n\n${config.hashtags.join(' ')}`;

  return fullCaption;
}

const router = Router();

// Create a rate limiter middleware that limits to 5 requests per minute
const contentGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many generations — please wait a minute and try again."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests, including successful ones
  keyGenerator: (req) => {
    // If user is authenticated, use their ID as the key, otherwise use IP
    return req.ip || 'unknown';
  }
});

// Import tone definitions
import { TONES } from '../prompts/tones';
import { loadPromptTemplates } from '../prompts/templates';
import { ViralInspiration } from '../services/contentGenerator';
import { evaluateContentWithBothModels, createContentEvaluationData } from '../services/aiEvaluationService';
import { db } from '../db';
import { calculateViralScore } from '../services/viralScoreCalculator';
import { analyzeViralScore } from '../services/viralScoreAnalyzer';

// Viral inspiration schema
const viralInspirationSchema = z.object({
  hook: z.string(),
  format: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
}).optional();

// Validate request body schema with basic type checking
const generateContentSchema = z.object({
  product: z.string().trim().min(1, "Product name is required"),
  templateType: z.string().default("original"),
  tone: z.string().default("friendly"),
  niche: z.string().default("skincare"),
  platforms: z.array(z.string()).min(1, "At least one platform is required").default(["Instagram"]),
  contentType: z.enum(["video", "photo"]).default("video"),
  improvementInstructions: z.string().optional(), // NEW: For AI-powered improvements
  isVideoContent: z.boolean().optional().default(false),
  videoDuration: z.enum(["30", "45", "60"]).optional(),
  customHook: z.string().optional(),
  affiliateUrl: z.string().optional(),
  aiModel: z.enum(["chatgpt", "claude", "both"]).optional().default("claude"), // AI model selection
  viralInspiration: viralInspirationSchema,
  productResearch: z.object({
    viralHooks: z.array(z.string()).optional(),
    targetAudience: z.string().optional(),
    trendingAngles: z.array(z.string()).optional(),
    bestTimeToPost: z.array(z.string()).optional(),
  }).optional(),
  competitorStyle: z.object({
    hook: z.string().optional(),
    structure: z.string().optional(),
    creator: z.string().optional(),
    whatWorked: z.string().optional(),
  }).optional(),
  templateSource: z.string().optional(),
  useSmartStyle: z.boolean().optional().default(false),
  userId: z.number().optional(),
});

// Helper functions to check if tone and template exist in the system
async function isValidTemplateType(templateType: string, niche: string): Promise<boolean> {
  try {
    // Load available templates
    const templates = await loadPromptTemplates();

    // Check if the template exists in the niche-specific templates
    if (templates[niche] && templateType in templates[niche]) {
      return true;
    }

    // If not in niche-specific, check if it exists in default templates
    if (templates.default && templateType in templates.default) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking template validity:", error);
    return false;
  }
}

function isValidTone(tone: string): boolean {
  return tone in TONES;
}

// Helper to get all available tones
function getAvailableTones(): string[] {
  return Object.keys(TONES);
}

// Helper to get all available template types
async function getAvailableTemplateTypes(niche: string): Promise<string[]> {
  try {
    const templates = await loadPromptTemplates();
    const nicheTemplates = templates[niche] || {};
    const defaultTemplates = templates.default || {};

    // Combine niche-specific and default templates without using Set
    const allTemplates: string[] = [];

    // Add niche-specific templates
    Object.keys(nicheTemplates).forEach(key => {
      if (!allTemplates.includes(key)) {
        allTemplates.push(key);
      }
    });

    // Add default templates (if not already added)
    Object.keys(defaultTemplates).forEach(key => {
      if (!allTemplates.includes(key)) {
        allTemplates.push(key);
      }
    });

    return allTemplates;
  } catch (error) {
    console.error("Error getting available templates:", error);
    return [];
  }
}

// Create a cache service for content generation
interface CachedContent {
  content: string;
  fallbackLevel?: 'exact' | 'default' | 'generic';
  generatedAt: number;
}

const contentCache = new CacheService<CachedContent>({
  defaultTtl: 1000 * 60 * 60 * 24, // 24 hour cache
  maxSize: 500 // Store up to 500 generations
});

router.post("/", contentGenerationLimiter, async (req, res) => {
  try {
    // Validate request body against schema
    const result = generateContentSchema.safeParse(req.body);

    if (!result.success) {
      console.error('Validation failed:', result.error.issues);
      return res.status(400).json({
        success: false,
        data: null,
        error: "Invalid request parameters",
        details: result.error.issues
      });
    }

    // Get the validated data
    const validatedData = result.data;

    // Check if the requested tone exists in the system
    if (!isValidTone(validatedData.tone)) {
      const availableTones = getAvailableTones();
      return res.status(400).json({
        success: false,
        data: null,
        error: `Invalid tone "${validatedData.tone}". Available: ${availableTones.join(", ")}`
      });
    }

    // Handle template type mapping and validation
    let finalTemplateType = validatedData.templateType;
    let surpriseMeReasoning = '';

    // Map legacy template names to current ones
    const templateMappings: Record<string, string> = {
      'comparison': 'product_comparison',
      'review': 'product_comparison',
      'caption': 'influencer_caption',
      'pros_cons': 'product_comparison',
      'routine': 'routine_kit',
      'beginner_kit': 'routine_kit',
      'demo_script': 'short_video',
      'drugstore_dupe': 'product_comparison',
      'personal_review': 'product_comparison',
      'tiktok_breakdown': 'short_video',
      'dry_skin_list': 'beauty',
      'top5_under25': 'product_comparison',
      'original': 'short_video',
      'video_script': 'short_video',
      'social_post': 'influencer_caption',
      'blog_post': 'seo_blog'
    };

    if (templateMappings[validatedData.templateType]) {
      finalTemplateType = templateMappings[validatedData.templateType];
      console.log(`Template mapped: ${validatedData.templateType} → ${finalTemplateType}`);
    }

    if (validatedData.templateType === 'surprise_me') {
      console.log('🎲 Surprise Me mode activated - using AI to select optimal template');
      try {
        const aiSelection = await selectBestTemplate(
          validatedData.product,
          validatedData.niche,
          validatedData.platforms,
          validatedData.tone
        );
        finalTemplateType = aiSelection.selectedTemplate;
        surpriseMeReasoning = aiSelection.reasoning;
        console.log(`🎯 AI selected template: ${finalTemplateType} (confidence: ${aiSelection.confidence})`);
      } catch (error) {
        console.error('Surprise Me selection failed, using fallback:', error);
        finalTemplateType = 'influencer_caption'; // Safe fallback
      }
    } else {
      // Check if the template type exists for the requested niche, with automatic fallback
      const templateExists = await isValidTemplateType(validatedData.templateType, validatedData.niche);
      if (!templateExists) {
        // If requested template doesn't exist, use the first available template for the niche
        const availableTemplates = await getAvailableTemplateTypes(validatedData.niche);
        if (availableTemplates.length > 0) {
          finalTemplateType = availableTemplates[0];
          console.log(`Template "${validatedData.templateType}" not found for ${validatedData.niche}, using fallback: ${finalTemplateType}`);
        } else {
          // If no templates available, use skincare_routine as ultimate fallback
          finalTemplateType = "skincare_routine";
          console.log(`No templates found for ${validatedData.niche}, using ultimate fallback: ${finalTemplateType}`);
        }
      }
    }

    const { product, tone, niche, platforms, contentType, isVideoContent, videoDuration: videoLength, useSmartStyle, userId } = result.data;
    const templateType = finalTemplateType;

    // Get smart style recommendations if enabled
    let smartStyleRecommendations = null;
    if (useSmartStyle && userId) {
      try {
        // Note: Smart style recommendations functionality to be implemented
        console.log(`ℹ️ Smart style feature is enabled for user ${userId}`);
      } catch (error) {
        console.error('Error with smart style feature:', error);
      }
    }

    // Log smart style toggle usage for analytics
    if (useSmartStyle !== undefined) {
      try {
        // Note: Analytics logging to be implemented
        console.log(`📊 Smart style usage logged for ${niche} niche`);
      } catch (error) {
        console.error('Error logging smart style usage:', error);
      }
    }

    // Create cache parameters object
    const cacheParams = {
      product: product.toLowerCase().trim(),
      templateType,
      tone,
      niche,
      useSmartStyle: useSmartStyle || false
    };

    // Generate cache key from parameters
    const cacheKey = contentCache.generateKey(cacheParams);

    // Check if we have a cached result
    const cached = contentCache.get(cacheKey);

    // If we have a valid cached result, return it
    if (cached && cached.content) {
      // Estimate video duration for cached content too
      const videoDuration = estimateVideoDuration(cached.content, tone, templateType);

      console.log(`Using cached content for ${product}, template: ${templateType}, tone: ${tone}`);

      return res.json({
        success: true,
        data: {
          content: cached.content,
          summary: `${templateType} content for ${product} (${tone} tone)`,
          tags: [niche, templateType, tone, "cached"],
          product,
          templateType,
          tone,
          niche,
          fallbackLevel: cached.fallbackLevel || 'exact',
          fromCache: true,
          videoDuration
        },
        error: null
      });
    }

    // Get niche-specific trending data for context enrichment
    const trendingProducts = await storage.getTrendingProductsByNiche(niche);

    // Handle video content generation - automatically enabled when contentType is "video"
    if ((isVideoContent || contentType === "video") && videoLength) {
      try {
        const videoResult = await generateVideoContent({
          productName: product,
          niche,
          tone,
          duration: videoLength,
          trendingData: trendingProducts
        });

        // Return video content with separate script and caption - no duplicate content
        return res.json({
          success: true,
          data: {
            content: "", // Empty to prevent duplicate display
            videoScript: videoResult.script,
            videoCaption: videoResult.caption,
            hashtags: videoResult.hashtags,
            estimatedDuration: videoResult.estimatedDuration,
            summary: `${videoLength}-second video content for ${product}`,
            tags: [niche, "video", tone, videoLength + "s"],
            product,
            templateType: "video_script",
            tone,
            niche,
            isVideoContent: true,
            videoDuration: videoLength,
            fromCache: false
          },
          error: null
        });
      } catch (error: any) {
        console.error('Video content generation error:', error);
        return res.status(500).json({
          success: false,
          data: null,
          error: "Video content generation failed. Please try again."
        });
      }
    }

    // Generate regular content using OpenAI with error handling and model fallback
    let content, fallbackLevel, prompt, model, tokens;

    try {
      // Log template source for debugging
      if (validatedData.templateSource) {
        console.log('🎯 Template source:', validatedData.templateSource);
      }

      // Map user-friendly AI model names to actual model IDs
      const getActualModelId = (userModel: string) => {
        switch (userModel) {
          case 'chatgpt':
            return 'gpt-4o';
          case 'claude':
            return 'claude-3-5-sonnet';
          default:
            return 'claude-3-5-sonnet'; // Default fallback
        }
      };

      const actualModelId = getActualModelId(validatedData.aiModel);

      // Handle improvement instructions for AI-powered regeneration
      let enhancedViralInspiration = validatedData.viralInspiration;
      if (validatedData.improvementInstructions) {
        // Create base inspiration object if not provided
        const baseInspiration = validatedData.viralInspiration || {
          hook: '',
          format: '',
          caption: '',
          hashtags: []
        };

        // Enhance viral inspiration with improvement instructions
        enhancedViralInspiration = {
          ...baseInspiration,
          improvementPrompt: validatedData.improvementInstructions,
          format: `Apply these improvements: ${validatedData.improvementInstructions}`,
          hook: `Enhanced content with: ${validatedData.improvementInstructions.substring(0, 100)}...`
        };
        console.log('🔧 Applying improvement instructions:', validatedData.improvementInstructions);
      }

      const result = await generateContent(
        product,
        templateType,
        tone,
        trendingProducts,
        niche,
        actualModelId, // Use mapped AI model ID
        enhancedViralInspiration, // Pass enhanced viral inspiration with improvements
        smartStyleRecommendations // Pass smart style recommendations
      );
      content = result.content;
      fallbackLevel = result.fallbackLevel;
      prompt = result.prompt;
      model = result.model;
      tokens = result.tokens;
      const videoDuration = result.videoDuration;

      // Ensure we have valid content
      if (!content || content.trim().length === 0) {
        throw new Error('Generated content is empty');
      }

    } catch (error: any) {
      console.error('Content generation error:', error);

      // Handle OpenAI quota exceeded errors gracefully
      if (error.status === 429 || error.code === 'insufficient_quota') {
        console.log('OpenAI quota exceeded, attempting fallback to GPT-3.5-turbo...');

        try {
          // Retry with GPT-3.5-turbo, including viral inspiration
          // Use proper fallback model based on user's selection
          const fallbackModelId = validatedData.aiModel === 'claude' ? 'claude-3-haiku' : 'gpt-3.5-turbo';

          const fallbackResult = await generateContent(
            product,
            templateType,
            tone,
            trendingProducts,
            niche,
            fallbackModelId, // Use proper fallback model ID
            enhancedViralInspiration // Use enhanced viral inspiration with improvements
          );
          content = fallbackResult.content;
          fallbackLevel = fallbackResult.fallbackLevel;
          prompt = fallbackResult.prompt;
          model = 'gpt-3.5-turbo';
          tokens = fallbackResult.tokens;
          const videoDuration = fallbackResult.videoDuration;

          if (!content || content.trim().length === 0) {
            throw new Error('Fallback generation also returned empty content');
          }

        } catch (fallbackError: any) {
          console.error('Both GPT-4 and GPT-3.5-turbo failed:', fallbackError);

          // Return a meaningful fallback content instead of error
          content = `✨ ${product} - ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Content ✨

This ${product} is a fantastic choice for your ${niche} journey! With its exceptional quality and ${tone} appeal, it's become a trending favorite.

Key highlights:
🌟 Perfect for ${niche} enthusiasts
💫 ${tone.charAt(0).toUpperCase() + tone.slice(1)} user experience
✨ Trending among community members

Experience the difference today! #${niche} #trending`;

          fallbackLevel = 'generic';
          prompt = `Fallback content for ${product}`;
          model = 'fallback';
          tokens = 0;
        }
      } else {
        // For other errors, provide meaningful fallback content
        content = `✨ ${product} - ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Content ✨

This ${product} is a fantastic choice for your ${niche} journey! With its exceptional quality and ${tone} appeal, it's become a trending favorite.

Key highlights:
🌟 Perfect for ${niche} enthusiasts
💫 ${tone.charAt(0).toUpperCase() + tone.slice(1)} user experience
✨ Trending among community members

Experience the difference today! #${niche} #trending`;

        fallbackLevel = 'generic';
        prompt = `Fallback content for ${product}`;
        model = 'fallback';
        tokens = 0;
      }
    }

    // Generate platform-specific content if platforms are specified
    let platformContent = null;
    // TODO: Implement platform content generator
    // if (platforms && platforms.length > 0) {
    //   try {
    //     console.log(`Generating platform-specific content for: ${platforms.join(", ")}`);
    //     platformContent = await generatePlatformSpecificContent({
    //       product,
    //       niche,
    //       platforms,
    //       contentType,
    //       templateType,
    //       tone,
    //       videoDuration: videoLength,
    //       trendingData: trendingProducts
    //     });
    //   } catch (error) {
    //     console.error("Platform content generation failed:", error);
    //     // Continue without platform content if it fails
    //   }
    // }

    // Store in cache with optimized parameters
    contentCache.set(cacheKey, {
      content,
      fallbackLevel,
      generatedAt: Date.now()
    });

    console.log(`Cached new content for ${product}, template: ${templateType}, tone: ${tone}`);

    // Save to database
    await storage.saveContentGeneration({
      product,
      templateType,
      tone,
      niche,
      content
    });

    // Prepare webhook-ready platform data for Make.com automation
    const webhookData = [];
    if (platformContent && platformContent.socialCaptions) {
      for (const [platform, contentData] of Object.entries(platformContent.socialCaptions)) {
        // Generate TikTok caption for saving to history
        const tiktokCaption = generatePlatformCaptionForSaving('tiktok', contentData, product, '', niche);
        const platformCaptions = {
          tiktok: tiktokCaption,
          tiktokCaption: tiktokCaption // Keep legacy format for backward compatibility
        };

        webhookData.push({
          platform,
          contentType,
          caption: contentData.caption,
          postInstructions: contentData.postInstructions,
          videoScript: platformContent.videoScript || null,
          photoDescription: platformContent.photoDescription || null,
          product,
          niche,
          tone,
          templateType,
          hashtags: extractHashtags(contentData.caption),
          mediaUrl: null, // Ready for user to add media URL
          scheduledTime: null, // Ready for scheduling
          makeWebhookReady: true,
          // Include platform-specific captions here
          platformCaptions: platformCaptions
        });
      }
    }

    // 🎯 Calculate viral score using product research and competitor insights
    let viralScore = null;
    let viralAnalysis = null;
    try {
      // Pass the content string to the viral score calculator
      viralScore = calculateViralScore(content);
      console.log('🎯 Viral score calculated:', viralScore.overall);

      // Generate AI analysis of the viral score
      if (viralScore) {
        viralAnalysis = await analyzeViralScore(
          content,
          viralScore,
          product,
          niche
        );
        console.log('🤖 AI analysis completed');
      }
    } catch (scoreError) {
      console.error('Error calculating viral score or AI analysis:', scoreError);
      // Continue without viral score if calculation fails
    }

    // Save detailed content history record with all metadata including hook and platform content
    const contentHistoryEntry = await storage.saveContentHistory({
      userId: req.user?.id, // If user is authenticated
      sessionId: `session_${Date.now()}`,
      niche,
      contentType: templateType,
      tone,
      productName: product,
      promptText: prompt || `Generate ${templateType} content for ${product} with ${tone} tone in ${niche} niche`,
      outputText: content,
      platformsSelected: platforms || ['tiktok'],
      generatedOutput: {
        content,
        hook: extractHook(content), // Extract hook from content
        platform: 'tiktok',
        platformContent: platformContent,
        webhookData: webhookData,
        viralScore: viralScore, // Include viral score in generated output
        // Generate TikTok caption for saving - different from script content
        tiktokCaption: generatePlatformCaptionForSaving('tiktok', { content }, product, '', niche)
      },
      affiliateLink: validatedData.affiliateUrl || null,
      viralInspo: validatedData.viralInspiration || null,
      modelUsed: model || "gpt-4o",
      tokenCount: tokens || 0,
      fallbackLevel: fallbackLevel || null,
      aiModel: model || "gpt-4o",
      contentFormat: "Regular Format",
      topRatedStyleUsed: validatedData.useSmartStyle || false,
      // Add viral score fields to database
      viralScore: viralScore, // Full viral score object
      viralScoreOverall: viralScore?.overall || null, // Overall score for easy querying
      viralAnalysis: viralAnalysis // AI analysis of viral score with improvement suggestions
    });

    // API usage tracking (storage method needs to be implemented)
    console.log(`📊 Content generated: ${templateType} for ${niche} niche`);

    // Webhook notifications removed for streamlined TikTok Viral Product Generator

    // Calculate video duration from the generated content
    const estimatedVideoDuration = estimateVideoDuration(content);

    // 📊 Log feedback to SQLite database
    try {
      const feedbackId = await logFeedback(product, templateType, tone, content);
      console.log(`📊 Feedback logged successfully with ID: ${feedbackId}`);
    } catch (feedbackError) {
      // Log error but don't block the response
      console.error('Error logging feedback to database:', feedbackError);
    }

    // 🤖 AUTOMATIC AI EVALUATION - Add evaluation trigger placeholder
    // Note: This will be implemented after content history is saved to avoid duplicates

    // Return success response with clean JSON structure including platform content
    res.json({
      success: true,
      data: {
        content,
        summary: `Fresh ${templateType} content for ${product} (${tone} tone)`,
        tags: [niche, templateType, tone, model || "gpt-4o"],
        product,
        templateType,
        tone,
        niche,
        fallbackLevel,
        fromCache: false,
        videoDuration: estimatedVideoDuration,
        model: model || "gpt-4o",
        // Platform-specific content
        platforms: platforms || [],
        contentType,
        platformContent: platformContent || null,
        // Webhook automation ready data
        webhookData,
        // Enhanced template system data
        ...(surpriseMeReasoning && { surpriseMeReasoning }),
        affiliateUrl: validatedData.affiliateUrl || null,
        customHook: validatedData.customHook || null,
        // Viral score from Perplexity Intelligence System
        ...(viralScore && { viralScore }),
        // AI analysis of viral score with improvement suggestions
        ...(viralAnalysis && { viralAnalysis }),
        // Return history ID for reference
        historyId: contentHistoryEntry.id
      },
      error: null
    });
  } catch (error) {
    console.error("Error generating content:", error);

    // Ensure we always return valid JSON, never HTML
    const errorMessage = error instanceof Error ? error.message : "Failed to generate content";

    // Check if response headers are already sent
    if (res.headersSent) {
      console.error("Headers already sent, cannot send error response");
      return;
    }

    // Set proper content type to ensure JSON response
    res.setHeader('Content-Type', 'application/json');

    res.status(500).json({
      success: false,
      data: null,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7)
    });
  }
});

export { router as generateContentRouter };