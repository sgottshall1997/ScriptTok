import { Router, Request, Response } from "express";
import { z } from "zod";
import { validateGenerationRequest, detectGenerationContext, logGenerationAttempt } from '../config/generation-safeguards';
import { validateContentGenerationRequest } from '../config/global-generation-gatekeeper';
import { TEMPLATE_TYPES, TONE_OPTIONS, NICHES } from "@shared/constants";
import { storage } from "../storage";
import { generateContent, estimateVideoDuration } from "../services/contentGenerator";
import { generatePlatformCaptions } from "../services/platformContentGenerator";
import { generateUnifiedContent, ContentGenerationConfig } from "../services/unifiedContentGenerator";
import { CacheService } from "../services/cacheService";
import { insertContentHistorySchema, trendingProducts } from "@shared/schema";
import { sendWebhookNotification, WebhookService } from "../services/webhookService";
import rateLimit from "express-rate-limit";
import { logFeedback } from "../database/feedbackLogger";
import { selectBestTemplate } from "../services/surpriseMeSelector";
import { db } from '../db.js';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

// Simple test endpoint to verify router works
router.get('/test', (req, res) => {
  res.json({ message: 'Unified router is working', timestamp: new Date().toISOString() });
});

// Simple POST test endpoint
router.post('/test', (req, res) => {
  console.log('🔵 POST TEST ENDPOINT HIT');
  res.json({ message: 'POST test endpoint working', body: req.body });
});

// Rate limiter for content generation
const contentGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Increased limit for bulk operations
  message: {
    error: "Too many generations — please wait a minute and try again."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip || 'unknown';
  }
});

// Unified generation schema supporting both single and bulk operations
const unifiedGenerationSchema = z.object({
  mode: z.enum(['manual', 'automated']).default('manual'),
  
  // Single product fields
  product: z.string().optional(),
  productName: z.string().optional(),
  template: z.string().optional(),
  tone: z.string().optional().default("friendly"),
  niche: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  contentType: z.string().optional().default("main_content"),
  videoDuration: z.string().optional(),
  affiliateUrl: z.string().optional(),
  customHook: z.string().optional(),
  topRatedStyleUsed: z.boolean().default(false),
  useSpartanFormat: z.boolean().default(false),
  aiModel: z.enum(['claude']).default('claude'),
  
  // Bulk/automated fields
  products: z.array(z.object({
    name: z.string(),
    niche: z.string(),
    affiliateUrl: z.string().optional()
  })).optional(),
  tones: z.array(z.string()).optional().default(["friendly"]).transform(arr => arr && arr.length > 0 ? arr : ["friendly"]),
  templates: z.array(z.string()).optional(),
  selectedNiches: z.array(z.string()).optional(),
  useExistingProducts: z.boolean().default(false),
  generateAffiliateLinks: z.boolean().default(false),
  affiliateId: z.string().nullable().optional(),
  
  // Scheduling fields
  scheduledJobId: z.string().optional(),
  scheduledJobName: z.string().optional(),
  aiModels: z.array(z.string()).optional(),
  contentFormats: z.array(z.string()).optional().default(["main_content"]).transform(arr => arr && arr.length > 0 ? arr : ["main_content"]),
  
  // Webhook fields
  webhookUrl: z.string().nullable().optional(),
  sendToMakeWebhook: z.boolean().default(false)
});

// Type definitions for content generation
interface GenerationConfig {
  productName: string;
  niche: string;
  templateType: string;
  tone: string;
  platforms: string[];
  contentType?: string;
  videoDuration?: string;
  affiliateUrl?: string;
  topRatedStyleUsed?: boolean;
  useSpartanFormat?: boolean;
  aiModel: string;
  mode: 'manual' | 'automated';
  jobId?: string;
  userId?: number;
}

// Enhanced validation function for generated content
function validateGeneratedContent(content: any, config: GenerationConfig): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Convert content to string if it's an object
  let script = '';
  if (typeof content === 'object' && content !== null) {
    script = content.script || content.content || JSON.stringify(content);
  } else {
    script = String(content || '');
  }
  
  const scriptLower = script.toLowerCase();
  
  // Basic validation
  if (!script || script.trim().length === 0) {
    errors.push('Content is empty');
    return { isValid: false, errors, warnings };
  }
  
  if (script.length < 50) {
    errors.push('Content is too short (minimum 50 characters)');
  }
  
  if (script.length > 5000) {
    errors.push('Content is too long (maximum 5000 characters)');
  }
  
  // Check for product mention
  const productWords = config.productName.toLowerCase().split(' ').filter(word => word.length > 2);
  const hasProductReference = productWords.some(word => scriptLower.includes(word));
  
  if (!hasProductReference) {
    errors.push('Content does not mention the product');
  }
  
  // Spartan format validation
  if (config.useSpartanFormat) {
    const bannedWords = ['just', 'literally', 'really', 'very', 'actually', 'basically', 'totally', 'super', 'quite', 'rather'];
    const foundBannedWords = bannedWords.filter(word => 
      scriptLower.includes(` ${word} `) || 
      scriptLower.startsWith(`${word} `) || 
      scriptLower.endsWith(` ${word}`)
    );
    
    if (foundBannedWords.length > 0) {
      warnings.push(`Spartan format violation: Contains banned words: ${foundBannedWords.join(', ')}`);
    }

    // Check word count for Spartan format
    const wordCount = script.trim().split(/\s+/).length;
    if (wordCount > 120) {
      warnings.push(`Spartan format violation: Exceeds 120 words (${wordCount} words)`);
    }

    // Check for emojis in Spartan format
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]/gu;
    if (emojiPattern.test(script)) {
      warnings.push('Spartan format violation: Contains emojis');
    }

    // Check for casual phrases
    const casualPhrases = ['hey there', 'check this out', 'you guys', 'super cool', 'mind blown'];
    const foundCasualPhrases = casualPhrases.filter(phrase => scriptLower.includes(phrase));
    if (foundCasualPhrases.length > 0) {
      warnings.push(`Spartan format violation: Contains casual phrases: ${foundCasualPhrases.join(', ')}`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

// Generate content for a single configuration
async function generateSingleContent(config: GenerationConfig): Promise<any> {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 GENERATING CONTENT: ${config.productName} (${config.niche}) - ${config.templateType}/${config.tone}`);
    console.log(`🤖 USING AI MODEL: ${config.aiModel?.toUpperCase() || 'CLAUDE'} | 🏛️ SPARTAN FORMAT: ${config.useSpartanFormat}`);
    
    // Get trending products for context
    const trendingProductsData = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.niche, config.niche))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(5);

    // Get smart style recommendations if enabled
    let smartStyleRecommendations = null;
    if (config.topRatedStyleUsed && config.userId) {
      try {
        const { getSmartStyleRecommendations } = await import('../services/ratingSystem');
        smartStyleRecommendations = await getSmartStyleRecommendations(
          config.userId,
          config.niche,
          config.templateType,
          config.tone,
          config.platforms[0] // Use first platform for recommendations
        );
        
        if (smartStyleRecommendations) {
          console.log(`🎯 Smart style recommendations found for user ${config.userId}: ${smartStyleRecommendations.recommendation}`);
        } else {
          console.log(`ℹ️ No smart style recommendations available for user ${config.userId} (need 80+ rated content)`);
        }
      } catch (error) {
        console.error('Error fetching smart style recommendations:', error);
      }
    }

    // Use unified content generator
    const contentFormat = config.useSpartanFormat ? 'spartan' : 'standard';
    console.log(`📝 Content generation mode: ${contentFormat.toUpperCase()}`);
    
    // Prepare unified content generation config
    const unifiedConfig: ContentGenerationConfig = {
      productName: config.productName,
      niche: config.niche,
      templateType: config.templateType,
      tone: config.tone,
      platforms: config.platforms || ['tiktok', 'instagram'],
      contentFormat: contentFormat,
      aiModel: config.aiModel,
      trendingProducts: trendingProductsData,
      viralInspiration: null,
      smartStyleRecommendations: smartStyleRecommendations
    };

    // Generate content using unified generator
    const unifiedResult = await generateUnifiedContent(unifiedConfig);
    
    // Extract main content from unified result
    const mainContent = unifiedResult.script;
    
    console.log(`✅ Unified content generated successfully (${mainContent.length} chars)`);
    
    // Validate generated content
    const validation = validateGeneratedContent(mainContent, config);
    
    if (!validation.isValid) {
      console.log(`❌ Content validation failed: ${validation.errors.join(', ')}`);
      throw new Error(`Content generation failed validation: ${validation.errors.join(', ')}`);
    }
    
    console.log(`✅ Content validation passed`);
    if (validation.warnings.length > 0) {
      console.log(`⚠️ Warnings: ${validation.warnings.join(', ')}`);
    }

    // Use platform captions from unified generator
    const platformCaptions: Record<string, string> = {
      tiktok: unifiedResult.tiktokCaption || '',
      instagram: unifiedResult.instagramCaption || '',
      youtube: unifiedResult.youtubeCaption || '',
      twitter: unifiedResult.xCaption || '',
      facebook: unifiedResult.facebookCaption || ''
    };

    // Estimate video duration
    const videoDuration = config.contentType === "video" ? 
      estimateVideoDuration(mainContent, config.videoDuration) : undefined;

    // Sanitize Unicode characters
    function sanitizeUnicode(text: string): string {
      if (!text) return '';
      return text
        .replace(/[\uD800-\uDFFF]/g, '') // Remove lone surrogates
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\uFEFF/g, '') // Remove BOM
        .trim();
    }

    // Use mainContent directly as it's already validated
    let script = sanitizeUnicode(mainContent);
    
    console.log(`🔍 UNIFIED GENERATOR OUTPUT: Script length: ${script.length} chars`);
    console.log(`✅ Using unified content generator - validation completed`);

    const executionTime = Date.now() - startTime;
    console.log(`⏱️ Content generation completed in ${executionTime}ms`);

    // Create response structure
    const result = {
      script,
      content: script,
      productName: config.productName,
      niche: config.niche,
      templateType: config.templateType,
      tone: config.tone,
      platforms: config.platforms,
      platformCaptions,
      videoDuration,
      productDescription: sanitizeUnicode(unifiedResult.productDescription || ''),
      demoScript: sanitizeUnicode(unifiedResult.demoScript || ''),
      instagramCaption: sanitizeUnicode(unifiedResult.instagramCaption || ''),
      tiktokCaption: sanitizeUnicode(unifiedResult.tiktokCaption || ''),
      youtubeCaption: sanitizeUnicode(unifiedResult.youtubeCaption || ''),
      xCaption: sanitizeUnicode(unifiedResult.xCaption || ''),
      facebookCaption: sanitizeUnicode(unifiedResult.facebookCaption || ''),
      affiliateLink: sanitizeUnicode(unifiedResult.affiliateLink || ''),
      affiliateUrl: config.affiliateUrl,
      executionTime,
      aiModel: config.aiModel,
      contentFormat: config.useSpartanFormat ? 'Spartan Format' : 'Standard Format',
      validation: validation
    };

    // Save to content history
    try {
      const { contentHistory } = await import('@shared/schema');
      
      // Save content to database with correct field mapping
      await db.insert(contentHistory).values({
        userId: config.userId || 1, // Use provided user ID or default to 1
        sessionId: config.jobId || `manual_${Date.now()}`,
        niche: config.niche,
        contentType: config.templateType,
        tone: config.tone,
        productName: config.productName,
        promptText: `Manual generated content for ${config.productName} in ${config.niche} niche using ${config.tone} tone and ${config.templateType} template`,
        outputText: mainContent,
        platformsSelected: config.platforms,
        generatedOutput: {
          content: mainContent,
          script: mainContent,
          platforms: config.platforms,
          niche: config.niche,
          ...platformCaptions
        },
        affiliateLink: config.affiliateUrl || '',
        viralInspo: null,
        modelUsed: config.aiModel,
        tokenCount: Math.floor(Math.random() * 500) + 200,
        contentFormat: config.useSpartanFormat ? 'Spartan Format' : 'Standard Format',
        topRatedStyleUsed: config.useSmartStyle || false
      });

      console.log(`✅ Content saved to database successfully`);
    } catch (saveError) {
      console.error(`⚠️ Failed to save content to database:`, saveError);
      // Don't fail the whole request if database save fails
    }

    // Send webhook notification
    if (config.platforms && config.platforms.length > 0) {
      try {
        console.log(`📤 Sending content to Make.com for platforms: ${config.platforms.join(', ')}`);
        const webhookService = new WebhookService();
        
        // Create platform content object
        const platformContent: any = {};
        config.platforms.forEach(platform => {
          platformContent[platform] = {
            caption: platformCaptions[platform] || '',
            script: script,
            type: 'content',
            postInstructions: `Post this ${platform} content for ${config.productName}`,
            hashtags: [`#${config.niche}`, '#trending']
          };
        });

        await webhookService.sendMultiPlatformContent({
          platformContent,
          platformSchedules: {},
          metadata: {
            product: config.productName,
            productName: config.productName,
            niche: config.niche,
            tone: config.tone,
            aiModel: config.aiModel,
            contentFormat: config.useSpartanFormat ? 'Spartan Format' : 'Regular Format',
            template: config.templateType,
            templateType: config.templateType,
            useSmartStyle: config.useSmartStyle || false,
            affiliateUrl: config.affiliateUrl
          },
          contentData: {
            fullOutput: script,
            platformCaptions: platformCaptions
          }
        });
        console.log(`✅ Content sent to Make.com successfully`);
      } catch (webhookError) {
        console.error(`⚠️ Webhook failed but content generation succeeded:`, webhookError);
        // Don't fail the whole request if webhook fails
      }
    }
    
    return result;

  } catch (error) {
    console.error(`❌ Error generating content for ${config.productName}:`, error);
    throw error;
  }
}

// Get existing trending products for automated mode
async function getExistingTrendingProducts(niches: string[], limit: number = 1): Promise<any[]> {
  const products = [];
  
  console.log(`🎯 NICHE DISTRIBUTION: Fetching exactly ${limit} product(s) per niche from: [${niches.join(', ')}]`);
  
  for (const niche of niches) {
    const nicheProducts = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.niche, niche))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(limit);
    
    if (nicheProducts.length === 0) {
      console.error(`❌ CRITICAL: No products found for niche "${niche}"`);
      throw new Error(`No trending products available for niche: ${niche}. Please refresh trending data first.`);
    }
    
    const nicheProduct = {
      name: nicheProducts[0].title,
      niche: nicheProducts[0].niche,
      affiliateUrl: undefined
    };
    
    products.push(nicheProduct);
    console.log(`✅ NICHE "${niche}": Selected product "${nicheProduct.name}"`);
  }
  
  console.log(`📊 FINAL PRODUCT DISTRIBUTION: ${products.length} products selected (${products.map(p => p.niche).join(', ')})`);
  return products;
}

// Enforce Spartan format by cleaning text
function enforceSpartanFormat(text: string): string {
  if (!text) return '';
  
  let cleanedText = text;
  
  // Remove banned words and replace with alternatives
  const spartanReplacements = {
    'just ': '',
    ' just ': ' ',
    'literally ': '',
    ' literally ': ' ',
    'really ': 'truly ',
    ' really ': ' truly ',
    'very ': 'extremely ',
    ' very ': ' extremely ',
    'actually ': '',
    ' actually ': ' ',
    'basically ': 'essentially ',
    ' basically ': ' essentially ',
    'totally ': 'completely ',
    ' totally ': ' completely ',
    'super ': 'extremely ',
    ' super ': ' extremely ',
    'quite ': 'remarkably ',
    ' quite ': ' remarkably ',
    'rather ': 'notably ',
    ' rather ': ' notably ',
    'that ': 'this ',
    ' that ': ' this ',
    'can ': 'will ',
    ' can ': ' will ',
    'may ': 'will ',
    ' may ': ' will ',
    'amazing ': 'excellent ',
    ' amazing': ' excellent',
    'incredible ': 'exceptional ',
    ' incredible': ' exceptional',
    'awesome ': 'excellent ',
    ' awesome': ' excellent'
  };
  
  // Apply replacements
  Object.entries(spartanReplacements).forEach(([banned, replacement]) => {
    const regex = new RegExp(banned, 'gi');
    cleanedText = cleanedText.replace(regex, replacement);
  });
  
  // Remove multiple spaces
  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  
  // Remove emojis
  const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]/gu;
  cleanedText = cleanedText.replace(emojiPattern, '');
  
  return cleanedText.trim();
}

// Main unified content generation endpoint
router.post("/", contentGenerationLimiter, async (req: Request, res: Response) => {
  console.log('🔵 UNIFIED GENERATION ENDPOINT HIT:', req.body);
  try {
    // Global gatekeeper validation
    const gatekeeperValidation = validateContentGenerationRequest(req, '/api/generate-unified');
    if (!gatekeeperValidation.allowed) {
      console.log(`🚫 GLOBAL GATEKEEPER: Generation blocked - ${gatekeeperValidation.reason}`);
      return res.status(403).json({
        success: false,
        error: 'Content generation blocked by security safeguards',
        reason: gatekeeperValidation.reason,
        source: gatekeeperValidation.source
      });
    }
    
    // Generation safeguard check
    const context = detectGenerationContext(req);
    const validation = validateGenerationRequest(context);
    
    logGenerationAttempt(context, '/api/generate-unified', validation.allowed, validation.reason);
    
    if (!validation.allowed) {
      console.log(`🚫 GENERATION BLOCKED: ${validation.reason}`);
      return res.status(403).json({
        success: false,
        error: 'Content generation blocked by security safeguards',
        reason: validation.reason,
        source: context.source
      });
    }
    
    const result = unifiedGenerationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request parameters",
        details: result.error.errors
      });
    }

    const data = result.data;
    const startTime = Date.now();
    
    console.log(`🚀 Starting unified content generation in ${data.mode} mode`);

    // Prepare generation configurations
    let configs: GenerationConfig[] = [];
    let jobId = `unified_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (data.mode === 'manual') {
      // Manual generation for single product
      const productName = data.productName || data.product;
      if (!productName) {
        return res.status(400).json({
          success: false,
          error: "Product name is required for manual generation"
        });
      }

      const selectedTones = data.tones || [data.tone || 'Enthusiastic'];
      const selectedTemplates = data.templates || [data.template || 'Short-Form Video Script'];
      const selectedAiModel = data.aiModel || 'claude';
      
      console.log(`🎯 MANUAL MODE: Using AI model "${selectedAiModel}"`);
      
      // Create configurations for all combinations
      for (const tone of selectedTones) {
        for (const template of selectedTemplates) {
          configs.push({
            productName,
            niche: data.niche || 'beauty',
            templateType: template,
            tone: tone,
            platforms: data.platforms || ['tiktok', 'instagram'],
            contentType: data.contentType || 'video',
            videoDuration: data.videoDuration,
            affiliateUrl: data.affiliateUrl,
            topRatedStyleUsed: data.topRatedStyleUsed,
            useSpartanFormat: data.useSpartanFormat,
            aiModel: selectedAiModel,
            mode: 'manual',
            jobId,
            userId: data.userId || 1
          });
        }
      }
    } else if (data.mode === 'automated') {
      // Automated generation using existing trending products
      let products = [];
      
      if (data.useExistingProducts && data.selectedNiches) {
        products = await getExistingTrendingProducts(data.selectedNiches);
      } else if (data.products) {
        products = data.products;
      }

      if (products.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No products available for automated generation"
        });
      }

      // Generate affiliate links if requested
      if (data.generateAffiliateLinks && data.affiliateId) {
        products = products.map(product => ({
          ...product,
          affiliateUrl: `https://amazon.com/dp/PRODUCT_ID?tag=${data.affiliateId}`
        }));
      }

      // Create configurations for automated generation
      const tones = data.tones || ['Enthusiastic'];
      const templates = data.templates || ['Short-Form Video Script'];
      
      // Claude enforcement for automated mode
      let selectedAiModel = data.aiModel || 'claude';
      if (data.aiModels && data.aiModels.length > 0) {
        selectedAiModel = data.aiModels[0];
      }
      
      console.log(`🎯 AUTOMATED MODE: Using AI model "${selectedAiModel}"`);
      
      // Use first tone and template for consistency
      const selectedTone = tones[0];
      const selectedTemplate = templates[0];
      
      console.log(`🎯 AUTOMATED MODE: Using tone "${selectedTone}" and template "${selectedTemplate}"`);
      
      for (const product of products) {
        configs.push({
          productName: product.name,
          niche: product.niche,
          templateType: selectedTemplate,
          tone: selectedTone,
          platforms: data.platforms || ['tiktok', 'instagram'],
          contentType: 'video',
          affiliateUrl: product.affiliateUrl,
          topRatedStyleUsed: data.topRatedStyleUsed,
          useSpartanFormat: data.useSpartanFormat,
          aiModel: selectedAiModel,
          mode: 'automated',
          jobId,
          userId: data.userId || 1
        });
      }
    }

    if (configs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid generation configurations found"
      });
    }

    // Generate content for all configurations
    const results = [];
    const errors = [];
    
    console.log(`📊 Processing ${configs.length} generation configurations`);
    
    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];
      try {
        const result = await generateSingleContent(config);
        results.push(result);
        
        // Progress logging
        console.log(`✅ Completed ${i + 1}/${configs.length}: ${config.productName}`);
        
      } catch (error) {
        const errorMsg = `Failed to generate content for ${config.productName}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`📊 Content generation completed: ${results.length} successful, ${errors.length} failed`);

    // Return unified response
    return res.json({
      success: true,
      data: {
        mode: data.mode,
        jobId,
        totalConfigurations: configs.length,
        successfulGenerations: results.length,
        errors: errors.length,
        duration,
        results: results,
        errorDetails: errors.length > 0 ? errors : undefined
      },
      error: null
    });

  } catch (error) {
    console.error("Unified content generation error:", error);
    
    if (res.headersSent) {
      console.error("Headers already sent, cannot send error response");
      return;
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content",
      data: null
    });
  }
});

export default router;