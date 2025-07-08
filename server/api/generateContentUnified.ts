import { Router, Request, Response } from "express";
import { z } from "zod";
import { TEMPLATE_TYPES, TONE_OPTIONS, NICHES } from "@shared/constants";
import { storage } from "../storage";
import { generateContent, estimateVideoDuration } from "../services/contentGenerator";
import { generatePlatformCaptions } from "../services/platformContentGenerator";
import { CacheService } from "../services/cacheService";
import { insertContentHistorySchema, trendingProducts } from "@shared/schema";
import { sendWebhookNotification, WebhookService } from "../services/webhookService";
import rateLimit from "express-rate-limit";
import { logFeedback } from "../database/feedbackLogger";
import { selectBestTemplate } from "../services/surpriseMeSelector";
import { db } from '../db.js';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

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
  templateType: z.string().optional(),
  tone: z.string().optional(),
  niche: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  contentType: z.string().optional(),
  videoDuration: z.string().optional(),
  affiliateUrl: z.string().optional(),
  customHook: z.string().optional(),
  useSmartStyle: z.boolean().default(false),
  
  // Bulk/automated fields
  products: z.array(z.object({
    name: z.string(),
    niche: z.string(),
    affiliateUrl: z.string().optional()
  })).optional(),
  tones: z.array(z.string()).optional(),
  templates: z.array(z.string()).optional(),
  selectedNiches: z.array(z.string()).optional(),
  useExistingProducts: z.boolean().default(false),
  generateAffiliateLinks: z.boolean().default(false),
  affiliateId: z.string().optional(),
  
  // Webhook and scheduling
  makeWebhookUrl: z.string().url().optional(),
  scheduleAfterGeneration: z.boolean().default(false),
  scheduledTime: z.string().datetime().optional()
});

// Configuration object for each generation task
interface GenerationConfig {
  productName: string;
  niche: string;
  templateType: string;
  tone: string;
  platforms: string[];
  contentType: string;
  videoDuration?: string;
  affiliateUrl?: string;
  customHook?: string;
  useSmartStyle: boolean;
  mode: 'manual' | 'automated';
  jobId?: string;
}

// Generate content for a single configuration
async function generateSingleContent(config: GenerationConfig): Promise<any> {
  try {
    console.log(`🔄 Generating content: ${config.productName} (${config.niche}) - ${config.templateType}/${config.tone}`);
    
    // Get trending products for context
    const trendingProductsData = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.niche, config.niche))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(5);

    // Fetch viral inspiration for the product
    let viralInspiration = null;
    try {
      const viralUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/perplexity-trends/viral-inspiration`;
      const viralResponse = await fetch(viralUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: config.productName, niche: config.niche })
      });
      
      if (viralResponse.ok) {
        const viralData = await viralResponse.json();
        if (viralData.success) {
          viralInspiration = viralData.data;
        }
      }
    } catch (error) {
      console.log('Viral inspiration fetch failed, continuing without it');
    }

    // Generate main content
    const mainContent = await generateContent(
      config.productName,
      config.templateType as any,
      config.tone as any,
      trendingProductsData,
      config.niche as any,
      "gpt-4o",
      viralInspiration,
      config.useSmartStyle ? { useSmartStyle: true } : undefined
    );

    // Generate platform-specific captions if platforms are specified
    let platformCaptions: Record<string, string> = {};
    if (config.platforms && config.platforms.length > 0) {
      // Extract affiliate ID from config.affiliateUrl or use default
      const affiliateId = config.affiliateUrl ? 
        config.affiliateUrl.match(/tag=([^&]+)/)?.[1] || "sgottshall107-20" : 
        "sgottshall107-20";
      
      platformCaptions = await generatePlatformCaptions({
        productName: config.productName,
        platforms: config.platforms,
        tone: config.tone,
        niche: config.niche,
        mainContent: mainContent.content,
        viralInspiration,
        affiliateId
      });
    }

    // Estimate video duration
    const videoDuration = config.contentType === "video" ? 
      estimateVideoDuration(mainContent.content, config.videoDuration) : undefined;

    // Create response structure
    const result = {
      content: mainContent.content,
      productName: config.productName,
      niche: config.niche,
      templateType: config.templateType,
      tone: config.tone,
      platforms: config.platforms,
      platformCaptions,
      videoDuration,
      viralInspiration,
      affiliateUrl: config.affiliateUrl,
      customHook: config.customHook,
      model: mainContent.model || "gpt-4o",
      tokens: mainContent.tokens || 0,
      fallbackLevel: mainContent.fallbackLevel || 'exact',
      generatedAt: new Date().toISOString()
    };

    // Save to content history
    await storage.saveContentHistory({
      userId: 1, // Default user ID
      sessionId: config.jobId || `single_${Date.now()}`,
      niche: config.niche,
      contentType: config.templateType,
      tone: config.tone,
      productName: config.productName,
      promptText: `Generated ${config.templateType} content for ${config.productName} in ${config.niche} niche using ${config.tone} tone`,
      outputText: mainContent.content,
      platformsSelected: config.platforms,
      generatedOutput: {
        hook: config.customHook || viralInspiration?.hook || `Amazing ${config.productName}!`,
        niche: config.niche,
        content: mainContent.content,
        platformCaptions,
        hashtags: viralInspiration?.hashtags || [`#${config.niche}`, '#trending'],
        callToAction: `Get your ${config.productName} now!`,
        affiliateUrl: config.affiliateUrl
      },
      affiliateLink: config.affiliateUrl,
      viralInspo: viralInspiration
    });

    console.log(`✅ Content generated successfully for ${config.productName}`);
    
    // Send to Make.com webhook if platforms are selected
    if (config.platforms && config.platforms.length > 0 && platformCaptions) {
      try {
        console.log(`📤 Sending content to Make.com for platforms: ${config.platforms.join(', ')}`);
        const webhookService = new WebhookService();
        
        // Create platform content object
        const platformContent: any = {};
        config.platforms.forEach(platform => {
          platformContent[platform] = {
            caption: platformCaptions[platform] || '',
            script: mainContent.content,
            type: 'content',
            postInstructions: `Post this ${platform} content for ${config.productName}`,
            hashtags: viralInspiration?.hashtags || [`#${config.niche}`, '#trending']
          };
        });
        
        await webhookService.sendMultiPlatformContent({
          platformContent,
          platformSchedules: {},
          metadata: {
            product: config.productName,
            niche: config.niche,
            tone: config.tone,
            templateType: config.templateType,
            affiliateUrl: config.affiliateUrl
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
async function getExistingTrendingProducts(niches: string[], limit: number = 3): Promise<any[]> {
  const products = [];
  
  for (const niche of niches) {
    const nicheProducts = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.niche, niche))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(limit);
    
    products.push(...nicheProducts.map(p => ({
      name: p.title,
      niche: p.niche,
      affiliateUrl: undefined
    })));
  }
  
  return products;
}

// Main unified content generation endpoint
router.post("/", contentGenerationLimiter, async (req: Request, res: Response) => {
  try {
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
      // Single product manual generation
      if (data.product) {
        configs.push({
          productName: data.product,
          niche: data.niche || 'beauty',
          templateType: data.templateType || 'Short-Form Video Script',
          tone: data.tone || 'Enthusiastic',
          platforms: data.platforms || [],
          contentType: data.contentType || 'video',
          videoDuration: data.videoDuration,
          affiliateUrl: data.affiliateUrl,
          customHook: data.customHook,
          useSmartStyle: data.useSmartStyle,
          mode: 'manual',
          jobId
        });
      }
      
      // Multi-product manual generation (bulk)
      if (data.products && data.tones && data.templates) {
        for (const product of data.products) {
          for (const tone of data.tones) {
            for (const template of data.templates) {
              configs.push({
                productName: product.name,
                niche: product.niche,
                templateType: template,
                tone,
                platforms: data.platforms || [],
                contentType: data.contentType || 'video',
                affiliateUrl: product.affiliateUrl || data.affiliateUrl,
                useSmartStyle: data.useSmartStyle,
                mode: 'manual',
                jobId
              });
            }
          }
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
      
      for (const product of products.slice(0, 5)) { // Limit to 5 products for performance
        for (const tone of tones) {
          for (const template of templates) {
            configs.push({
              productName: product.name,
              niche: product.niche,
              templateType: template,
              tone,
              platforms: data.platforms || ['tiktok', 'instagram'],
              contentType: 'video',
              affiliateUrl: product.affiliateUrl,
              useSmartStyle: data.useSmartStyle,
              mode: 'automated',
              jobId
            });
          }
        }
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

    // Send webhook notification if configured
    if (data.makeWebhookUrl && results.length > 0) {
      try {
        await sendWebhookNotification(data.makeWebhookUrl, {
          type: 'bulk_content_generated',
          jobId,
          totalGenerated: results.length,
          totalErrors: errors.length,
          duration,
          results: results.slice(0, 3) // Send first 3 results as sample
        });
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError);
      }
    }

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
        results: data.mode === 'manual' && results.length === 1 ? results[0] : results,
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