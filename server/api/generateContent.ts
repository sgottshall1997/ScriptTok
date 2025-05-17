import { Router } from "express";
import { z } from "zod";
import { TEMPLATE_TYPES, TONE_OPTIONS, NICHES } from "@shared/constants";
import { storage } from "../storage";
import { generateContent, estimateVideoDuration } from "../services/contentGenerator";
import { CacheService } from "../services/cacheService";
import { insertContentHistorySchema } from "@shared/schema";
import { sendWebhookNotification } from "../services/webhookService";
import rateLimit from "express-rate-limit";

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
    // If user is authenticated, use their userId as the key, otherwise use IP
    return req.user?.userId?.toString() || req.ip || 'unknown';
  }
});

// Import tone definitions
import { TONES } from '../prompts/tones';
import { loadPromptTemplates } from '../prompts/templates';

// Validate request body schema with basic type checking
const generateContentSchema = z.object({
  product: z.string().trim().min(1, "Product name is required"),
  templateType: z.enum(TEMPLATE_TYPES).default("original"),
  tone: z.enum(TONE_OPTIONS).default("friendly"),
  niche: z.enum(NICHES).default("skincare"),
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
      return res.status(400).json({ 
        error: "Invalid request", 
        details: result.error.format() 
      });
    }
    
    // Get the validated data
    const validatedData = result.data;
    
    // Check if the requested tone exists in the system
    if (!isValidTone(validatedData.tone)) {
      const availableTones = getAvailableTones();
      return res.status(400).json({
        error: "Invalid tone selected",
        message: `The tone "${validatedData.tone}" is not available. Please choose from: ${availableTones.join(", ")}`
      });
    }
    
    // Check if the template type exists for the requested niche
    const templateExists = await isValidTemplateType(validatedData.templateType, validatedData.niche);
    if (!templateExists) {
      const availableTemplates = await getAvailableTemplateTypes(validatedData.niche);
      return res.status(400).json({
        error: "Invalid template type selected",
        message: `The template type "${validatedData.templateType}" is not available for the "${validatedData.niche}" niche. Available templates: ${availableTemplates.join(", ")}`
      });
    }
    
    const { product, templateType, tone, niche } = result.data;
    
    // Create cache parameters object
    const cacheParams = {
      product: product.toLowerCase().trim(),
      templateType,
      tone,
      niche
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
        product, 
        templateType, 
        tone, 
        niche,
        content: cached.content,
        fallbackLevel: cached.fallbackLevel || 'exact', // Include cached fallback level
        fromCache: true,
        videoDuration
      });
    }
    
    // Get niche-specific trending data for context enrichment
    const trendingProducts = await storage.getTrendingProductsByNiche(niche);
    
    // Generate content using OpenAI - now includes fallbackLevel and additional metadata
    const { content, fallbackLevel, prompt, model, tokens } = await generateContent(product, templateType, tone, trendingProducts, niche);
    
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
    
    // Save detailed content history record with all metadata
    const contentHistoryEntry = await storage.saveContentHistory({
      userId: req.user?.userId, // If user is authenticated
      niche,
      contentType: templateType,
      tone,
      productName: product,
      promptText: prompt || `Generate ${templateType} content for ${product} with ${tone} tone in ${niche} niche`,
      outputText: content,
      modelUsed: model || "gpt-4o",
      tokenCount: tokens || 0
    });
    
    // Increment API usage counter with template and tone tracking
    await storage.incrementApiUsage(templateType, tone, niche, req.user?.userId);
    
    // Send webhook notification if available
    if (contentHistoryEntry) {
      try {
        // Fire and forget - don't await to avoid holding up the response
        sendWebhookNotification(contentHistoryEntry)
          .then(result => {
            if (result.success) {
              console.log(`Webhook notification sent successfully for content #${contentHistoryEntry.id}`);
            } else {
              console.warn(`Webhook notification failed: ${result.message}`);
            }
          })
          .catch(error => {
            console.error('Error in webhook notification:', error);
          });
      } catch (error) {
        // Log webhook errors but don't block the response
        console.error('Error triggering webhook notification:', error);
      }
    }
    
    // Estimate video duration
    const videoDuration = estimateVideoDuration(content, tone, templateType);
    
    // Return generated content with video duration estimation and fallback information
    res.json({
      product,
      templateType,
      tone,
      niche,
      content,
      fallbackLevel,
      fromCache: false,
      videoDuration
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ 
      error: "Failed to generate content", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export { router as generateContentRouter };
