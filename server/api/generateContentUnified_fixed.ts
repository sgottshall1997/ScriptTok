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

// Rate limiter for content generation
const contentGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
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

// Enhanced Spartan format enforcer
function enforceSpartanFormat(text: string): string {
  if (!text) return '';
  
  let cleanedText = text;
  
  // Define word replacements for Spartan format
  const spartanReplacements = {
    'just ': 'only ',
    ' just ': ' only ',
    'literally': '',
    ' literally': '',
    'literally ': '',
    'really ': '',
    ' really ': ' ',
    'very ': '',
    ' very ': ' ',
    'actually ': '',
    ' actually ': ' ',
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

// Test endpoints
router.get('/test', (req, res) => {
  res.json({ message: 'Unified router is working', timestamp: new Date().toISOString() });
});

router.post('/test', (req, res) => {
  console.log('🔵 POST TEST ENDPOINT HIT');
  res.json({ message: 'POST test endpoint working', body: req.body });
});

// Unified generation schema
const unifiedGenerationSchema = z.object({
  mode: z.enum(['manual', 'automated']).default('manual'),
  productName: z.string().optional(),
  niche: z.string().optional(),
  template: z.string().optional(),
  tone: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  useSpartanFormat: z.boolean().default(false),
  aiModel: z.string().default('claude'),
  testText: z.string().optional() // For testing Spartan format
});

// Generation configuration interface
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
  aiModel: 'claude';
  mode: 'manual' | 'automated';
  jobId?: string;
}

// Single content generation function
async function generateSingleContent(config: GenerationConfig): Promise<any> {
  console.log(`🎯 Generating content: ${config.productName} (${config.niche}) - AI: ${config.aiModel}`);
  
  const unifiedConfig: ContentGenerationConfig = {
    productName: config.productName,
    niche: config.niche as any,
    templateType: config.templateType as any,
    tone: config.tone as any,
    platforms: config.platforms as any[],
    contentType: config.contentType as any,
    affiliateUrl: config.affiliateUrl,
    customHook: config.customHook,
    useSmartStyle: config.useSmartStyle,
    useSpartanFormat: config.useSpartanFormat,
    aiModel: config.aiModel
  };

  const unifiedResult = await generateUnifiedContent(unifiedConfig);
  const mainContent = unifiedResult.demoScript || unifiedResult.productDescription || "Content generation failed";

  // Sanitize Unicode characters
  function sanitizeUnicode(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\uD800-\uDFFF]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/\uFEFF/g, '')
      .trim();
  }

  // Apply Spartan format enforcement if needed
  let script = sanitizeUnicode(mainContent);
  if (config.useSpartanFormat) {
    script = enforceSpartanFormat(script);
    console.log(`🏛️ SPARTAN ENFORCEMENT: Applied automatic content cleaning to main script`);
  }

  // Use platform captions from unified generator and apply Spartan format if needed
  const platformCaptions: Record<string, string> = {
    tiktok: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.tiktokCaption)) : sanitizeUnicode(unifiedResult.tiktokCaption),
    instagram: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.instagramCaption)) : sanitizeUnicode(unifiedResult.instagramCaption),
    youtube: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.youtubeCaption)) : sanitizeUnicode(unifiedResult.youtubeCaption),
    twitter: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.xCaption)) : sanitizeUnicode(unifiedResult.xCaption),
    facebook: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.facebookCaption)) : sanitizeUnicode(unifiedResult.facebookCaption)
  };

  const result = {
    script,
    content: script,
    productName: config.productName,
    niche: config.niche,
    templateType: config.templateType,
    tone: config.tone,
    platforms: config.platforms,
    platformCaptions,
    productDescription: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.productDescription)) : sanitizeUnicode(unifiedResult.productDescription),
    demoScript: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.demoScript)) : sanitizeUnicode(unifiedResult.demoScript),
    instagramCaption: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.instagramCaption)) : sanitizeUnicode(unifiedResult.instagramCaption),
    tiktokCaption: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.tiktokCaption)) : sanitizeUnicode(unifiedResult.tiktokCaption),
    youtubeCaption: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.youtubeCaption)) : sanitizeUnicode(unifiedResult.youtubeCaption),
    xCaption: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.xCaption)) : sanitizeUnicode(unifiedResult.xCaption),
    facebookCaption: config.useSpartanFormat ? enforceSpartanFormat(sanitizeUnicode(unifiedResult.facebookCaption)) : sanitizeUnicode(unifiedResult.facebookCaption),
    affiliateLink: sanitizeUnicode(unifiedResult.affiliateLink),
    model: 'Claude',
    aiModel: config.aiModel,
    useSpartanFormat: config.useSpartanFormat,
    tokens: Math.floor(mainContent.length / 4),
    generatedAt: new Date().toISOString()
  };

  return result;
}

// Main unified content generation endpoint
router.post("/", contentGenerationLimiter, async (req: Request, res: Response) => {
  console.log('🔵 UNIFIED GENERATION ENDPOINT HIT:', req.body);
  
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
    
    // Handle test requests for Spartan format
    if (data.testText) {
      const spartanResult = data.useSpartanFormat ? enforceSpartanFormat(data.testText) : data.testText;
      console.log(`🏛️ SPARTAN TEST: "${data.testText}" → "${spartanResult}"`);
      
      return res.json({
        success: true,
        message: 'Spartan format test completed',
        original: data.testText,
        spartanResult: spartanResult,
        spartanEnabled: data.useSpartanFormat,
        timestamp: new Date().toISOString()
      });
    }

    // Require productName for actual content generation
    if (!data.productName) {
      return res.status(400).json({
        success: false,
        error: "productName is required for content generation"
      });
    }

    const startTime = Date.now();
    console.log(`🚀 Starting unified content generation in ${data.mode} mode`);
    console.log(`🔥 CLAUDE-ONLY SYSTEM: Using Claude AI exclusively (aiModel: ${data.aiModel})`);

    // Create generation configuration
    const config: GenerationConfig = {
      productName: data.productName,
      niche: data.niche || 'tech',
      templateType: data.template || 'Short-Form Video Script',
      tone: data.tone || 'Professional',
      platforms: data.platforms || ['tiktok'],
      contentType: 'video',
      useSmartStyle: false,
      useSpartanFormat: data.useSpartanFormat,
      aiModel: 'claude', // Always Claude
      mode: data.mode
    };

    console.log(`🏛️ SPARTAN FORMAT: ${config.useSpartanFormat ? 'ENABLED' : 'DISABLED'}`);

    // Generate content
    const contentResult = await generateSingleContent(config);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Content generation completed in ${duration}ms`);
    if (config.useSpartanFormat) {
      console.log(`🏛️ SPARTAN ENFORCEMENT: All content cleaned and formatted according to Spartan standards`);
    }

    return res.json({
      success: true,
      data: {
        mode: data.mode,
        duration,
        results: [contentResult],
        spartanFormatApplied: config.useSpartanFormat
      },
      error: null
    });
    
  } catch (error) {
    console.error("Unified content generation error:", error);
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate content",
      data: null
    });
  }
});

export default router;