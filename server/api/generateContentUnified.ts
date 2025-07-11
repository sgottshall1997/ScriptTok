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
  productName: z.string().optional(),
  template: z.string().optional(),
  tone: z.string().optional(),
  niche: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  contentType: z.string().optional(),
  videoDuration: z.string().optional(),
  affiliateUrl: z.string().optional(),
  customHook: z.string().optional(),
  useSmartStyle: z.boolean().default(false),
  useSpartanFormat: z.boolean().default(false),
  aiModel: z.enum(['chatgpt', 'claude']).default('chatgpt'),
  
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
  useSpartanFormat: boolean;
  aiModel: 'chatgpt' | 'claude';
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

    // Check if Spartan format should be used
    const shouldUseSpartan = config.useSpartanFormat;
    
    // Generate main content with Spartan format if enabled
    let mainContent;
    if (shouldUseSpartan) {
      // Use Spartan content generation for main content
      const { generateSpartanContent } = await import('../services/spartanContentGenerator');
      const spartanContentType = config.templateType === 'spartan_video_script' ? 'spartanVideoScript' : 'shortCaptionSpartan';
      
      const spartanResult = await generateSpartanContent({
        productName: config.productName,
        niche: config.niche,
        contentType: spartanContentType,
        useSpartanFormat: true,
        additionalContext: `Template: ${config.templateType}`
      });
      
      if (spartanResult.success) {
        mainContent = spartanResult.content;
      } else {
        // Fallback to regular generation if Spartan fails
        mainContent = await generateContent(
          config.productName,
          config.templateType as any,
          config.tone as any,
          trendingProductsData,
          config.niche as any,
          config.aiModel === 'claude' ? 'claude-sonnet-4-20250514' : "gpt-4o",
          viralInspiration,
          config.useSmartStyle ? { useSmartStyle: true } : undefined,
          config.aiModel
        );
      }
    } else {
      // Standard content generation
      mainContent = await generateContent(
        config.productName,
        config.templateType as any,
        config.tone as any,
        trendingProductsData,
        config.niche as any,
        config.aiModel === 'claude' ? 'claude-sonnet-4-20250514' : "gpt-4o",
        viralInspiration,
        config.useSmartStyle ? { useSmartStyle: true } : undefined,
        config.aiModel
      );
    }

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
        mainContent: typeof mainContent === 'string' ? mainContent : mainContent.content,
        viralInspiration,
        affiliateId,
        useSpartanFormat: shouldUseSpartan,
        aiModel: config.aiModel
      });
    }

    // Estimate video duration
    const videoDuration = config.contentType === "video" ? 
      estimateVideoDuration(typeof mainContent === 'string' ? mainContent : mainContent.content, config.videoDuration) : undefined;

    // Create response structure
    const result = {
      content: typeof mainContent === 'string' ? mainContent : mainContent.content,
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
      model: config.aiModel === 'claude' ? 'Claude' : 'ChatGPT',
      tokens: (typeof mainContent === 'string') ? 0 : (
        typeof mainContent.tokens === 'object' && mainContent.tokens?.total 
          ? mainContent.tokens.total 
          : (typeof mainContent.tokens === 'number' ? mainContent.tokens : 0)
      ),
      fallbackLevel: (typeof mainContent === 'string') ? 'exact' : (mainContent.fallbackLevel || 'exact'),
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
      outputText: typeof mainContent === 'string' ? mainContent : mainContent.content,
      platformsSelected: config.platforms,
      generatedOutput: {
        hook: config.customHook || viralInspiration?.hook || `Amazing ${config.productName}!`,
        niche: config.niche,
        content: typeof mainContent === 'string' ? mainContent : mainContent.content,
        platformCaptions,
        hashtags: viralInspiration?.hashtags || [`#${config.niche}`, '#trending'],
        callToAction: `Get your ${config.productName} now!`,
        affiliateUrl: config.affiliateUrl
      },
      affiliateLink: config.affiliateUrl,
      viralInspo: viralInspiration,
      modelUsed: (typeof mainContent === 'string') ? "gpt-4o" : (mainContent.model || "gpt-4o"),
      tokenCount: (typeof mainContent === 'string') ? 0 : (
        typeof mainContent.tokens === 'object' && mainContent.tokens?.total 
          ? mainContent.tokens.total 
          : (typeof mainContent.tokens === 'number' ? mainContent.tokens : 0)
      )
    });

    console.log(`✅ Content generated successfully for ${config.productName}`);
    
    // Perform AI evaluation BEFORE sending webhooks for ALL modes
    let aiEvaluationData = null;
    try {
      // Get the content history ID from the database
      const { contentHistory } = await import('@shared/schema');
      const sessionId = config.jobId || `single_${Date.now()}`;
      
      const recentContent = await db.select()
        .from(contentHistory)
        .where(eq(contentHistory.sessionId, sessionId))
        .orderBy(desc(contentHistory.createdAt))
        .limit(1);
      
      if (recentContent.length > 0) {
        const contentHistoryId = recentContent[0].id;
        console.log(`🤖 Starting dual-model AI evaluation BEFORE webhook for content ID: ${contentHistoryId} (${config.mode} mode)`);
        
        // Import and call the evaluation service
        const { evaluateContentWithBothModels, createContentEvaluationData } = await import('../services/aiEvaluationService');
        const { contentEvaluations } = await import('@shared/schema');
        
        const fullContent = `${typeof mainContent === 'string' ? mainContent : mainContent.content}\n\nPlatform Captions:\n${JSON.stringify(platformCaptions, null, 2)}`;
        
        const evaluationResults = await evaluateContentWithBothModels(fullContent);
        
        // Save ChatGPT evaluation
        const chatgptEvalData = createContentEvaluationData(contentHistoryId, 'chatgpt', evaluationResults.chatgptEvaluation);
        await db.insert(contentEvaluations).values(chatgptEvalData);
        
        // Save Claude evaluation
        const claudeEvalData = createContentEvaluationData(contentHistoryId, 'claude', evaluationResults.claudeEvaluation);
        await db.insert(contentEvaluations).values(claudeEvalData);
        
        console.log(`✅ Dual-model AI evaluation completed BEFORE webhook for content ID: ${contentHistoryId}`);
        console.log(`   🤖 ChatGPT Overall Score: ${evaluationResults.chatgptEvaluation.overallScore}/10`);
        console.log(`   🎭 Claude Overall Score: ${evaluationResults.claudeEvaluation.overallScore}/10`);
        
        // Prepare AI evaluation data for webhook
        const averageScore = ((evaluationResults.chatgptEvaluation.overallScore || 0) + (evaluationResults.claudeEvaluation.overallScore || 0)) / 2;
        
        aiEvaluationData = {
          chatgpt: {
            viralityScore: evaluationResults.chatgptEvaluation.viralityScore,
            clarityScore: evaluationResults.chatgptEvaluation.clarityScore,
            persuasivenessScore: evaluationResults.chatgptEvaluation.persuasivenessScore,
            creativityScore: evaluationResults.chatgptEvaluation.creativityScore,
            overallScore: evaluationResults.chatgptEvaluation.overallScore,
            viralityJustification: evaluationResults.chatgptEvaluation.viralityJustification,
            clarityJustification: evaluationResults.chatgptEvaluation.clarityJustification,
            persuasivenessJustification: evaluationResults.chatgptEvaluation.persuasivenessJustification,
            creativityJustification: evaluationResults.chatgptEvaluation.creativityJustification
          },
          claude: {
            viralityScore: evaluationResults.claudeEvaluation.viralityScore,
            clarityScore: evaluationResults.claudeEvaluation.clarityScore,
            persuasivenessScore: evaluationResults.claudeEvaluation.persuasivenessScore,
            creativityScore: evaluationResults.claudeEvaluation.creativityScore,
            overallScore: evaluationResults.claudeEvaluation.overallScore,
            viralityJustification: evaluationResults.claudeEvaluation.viralityJustification,
            clarityJustification: evaluationResults.claudeEvaluation.clarityJustification,
            persuasivenessJustification: evaluationResults.claudeEvaluation.persuasivenessJustification,
            creativityJustification: evaluationResults.claudeEvaluation.creativityJustification
          },
          averageScore: parseFloat(averageScore.toFixed(1)),
          evaluationCompleted: true
        };
      }
    } catch (evaluationError) {
      console.error('⚠️ AI evaluation failed (content generation still successful):', evaluationError);
      aiEvaluationData = {
        chatgpt: { viralityScore: null, clarityScore: null, persuasivenessScore: null, creativityScore: null, overallScore: null },
        claude: { viralityScore: null, clarityScore: null, persuasivenessScore: null, creativityScore: null, overallScore: null },
        averageScore: null,
        evaluationCompleted: false
      };
    }
    
    // FAIL-SAFE: Only send webhook if AI evaluation is complete
    if (config.platforms && config.platforms.length > 0 && platformCaptions) {
      // Check if AI evaluation is complete before sending webhook
      if (!aiEvaluationData || !aiEvaluationData.evaluationCompleted) {
        console.error('🚨 FAIL-SAFE TRIGGERED: AI evaluation incomplete - blocking webhook delivery');
        console.error('   This prevents sending content without proper dual-model evaluation');
        throw new Error('AI evaluation must be completed before webhook delivery');
      }
      
      try {
        console.log(`📤 Sending content to Make.com for platforms: ${config.platforms.join(', ')}`);
        console.log(`🛡️ FAIL-SAFE PASSED: AI evaluation complete - allowing webhook delivery`);
        const webhookService = new WebhookService();
        
        // Create platform content object
        const platformContent: any = {};
        config.platforms.forEach(platform => {
          platformContent[platform] = {
            caption: platformCaptions[platform] || '',
            script: typeof mainContent === 'string' ? mainContent : mainContent.content,
            type: 'content',
            postInstructions: `Post this ${platform} content for ${config.productName}`,
            hashtags: viralInspiration?.hashtags || [`#${config.niche}`, '#trending']
          };
        });
        
        // AI evaluation data is already available from the evaluation step above

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
            affiliateUrl: config.affiliateUrl,
            topRatedStyleUsed: (typeof mainContent === 'string') ? '' : (mainContent.topRatedStyleUsed || '')
          },
          contentData: {
            fullOutput: typeof mainContent === 'string' ? mainContent : mainContent.content,
            platformCaptions: platformCaptions,
            viralInspiration: viralInspiration,
            aiEvaluation: aiEvaluationData
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

// Get existing trending products for automated mode - EXACTLY 1 per niche
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
      console.error(`❌ CRITICAL: No products found for niche "${niche}" - this will cause missing content!`);
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
  
  console.log(`📊 FINAL DISTRIBUTION: ${products.length} products total - ${products.map(p => `${p.niche}:${p.name.substring(0,20)}...`).join(', ')}`);
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
      console.log(`🔍 DEBUG Manual mode: productName="${data.productName}", products=${data.products?.length || 0}`);
      
      // Single product manual generation
      if (data.productName) {
        configs.push({
          productName: data.productName,
          niche: data.niche || 'beauty',
          templateType: data.template || 'Short-Form Video Script',
          tone: data.tone || 'Enthusiastic',
          platforms: data.platforms || [],
          contentType: data.contentType || 'video',
          videoDuration: data.videoDuration,
          affiliateUrl: data.affiliateUrl,
          customHook: data.customHook,
          useSmartStyle: data.useSmartStyle,
          useSpartanFormat: data.useSpartanFormat,
          aiModel: data.aiModel,
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
                useSpartanFormat: data.useSpartanFormat,
                aiModel: data.aiModel,
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

      // Create configurations for automated generation - EXACTLY 1 per niche
      const tones = data.tones || ['Enthusiastic'];
      const templates = data.templates || ['Short-Form Video Script'];
      
      console.log(`🎭 GENERATION CONFIG: ${tones.length} tone(s), ${templates.length} template(s), AI Model: ${data.aiModel || 'chatgpt'}`);
      
      // For scheduled generation, use exactly 1 tone and 1 template to ensure 1 content per niche
      const selectedTone = tones[0]; // Use first tone for consistency
      const selectedTemplate = templates[0]; // Use first template for consistency
      
      console.log(`🎯 SCHEDULED MODE: Using single tone "${selectedTone}" and template "${selectedTemplate}" for 1 content per niche`);
      
      for (const product of products) { // Use ALL products (exactly 1 per niche)
        configs.push({
          productName: product.name,
          niche: product.niche,
          templateType: selectedTemplate,
          tone: selectedTone,
          platforms: data.platforms || ['tiktok', 'instagram'],
          contentType: 'video',
          affiliateUrl: product.affiliateUrl,
          useSmartStyle: data.useSmartStyle,
          useSpartanFormat: data.useSpartanFormat,
          aiModel: data.aiModel || 'chatgpt', // Ensure model is passed through
          mode: 'automated',
          jobId
        });
        
        console.log(`📋 CONFIG CREATED: ${product.niche} - "${product.name}" - ${selectedTone}/${selectedTemplate} - Model: ${data.aiModel || 'chatgpt'}`);
      }
      
      // CRITICAL VALIDATION: Ensure exactly 1 config per niche
      const configsByNiche = configs.reduce((acc, config) => {
        acc[config.niche] = (acc[config.niche] || 0) + 1;
        return acc;
      }, {});
      
      const duplicateNiches = Object.entries(configsByNiche).filter(([niche, count]) => count > 1);
      if (duplicateNiches.length > 0) {
        console.error(`❌ CRITICAL ERROR: Duplicate configurations detected!`, configsByNiche);
        throw new Error(`Niche distribution error: ${duplicateNiches.map(([n, c]) => `${n}:${c}`).join(', ')}`);
      }
      
      console.log(`✅ VALIDATION PASSED: Exactly 1 config per niche:`, configsByNiche);
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

    // Webhooks are already sent individually per content piece in generateSingleContent
    // No bulk webhook needed since we send one webhook per generated content piece
    console.log(`📊 Webhook Summary: ${results.length} individual webhooks sent to Make.com (one per content piece)`);
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} content pieces failed generation and did not send webhooks`);
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