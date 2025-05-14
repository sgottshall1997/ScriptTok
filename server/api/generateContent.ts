import { Router } from "express";
import { z } from "zod";
import { TEMPLATE_TYPES, TONE_OPTIONS } from "@shared/constants";
import { storage } from "../storage";
import { generateContent, estimateVideoDuration } from "../services/contentGenerator";
import { CacheService } from "../services/cacheService";

const router = Router();

// Validate request body schema
const generateContentSchema = z.object({
  product: z.string().trim().min(1, "Product name is required"),
  templateType: z.enum(TEMPLATE_TYPES).default("original"),
  tone: z.enum(TONE_OPTIONS).default("friendly"),
});

// Create a cache service for content generation
interface CachedContent {
  content: string;
  generatedAt: number;
}

const contentCache = new CacheService<CachedContent>({
  defaultTtl: 1000 * 60 * 60 * 24, // 24 hour cache
  maxSize: 500 // Store up to 500 generations
});

router.post("/", async (req, res) => {
  try {
    // Validate request body
    const result = generateContentSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: result.error.format() 
      });
    }
    
    const { product, templateType, tone } = result.data;
    
    // Create cache parameters object
    const cacheParams = {
      product: product.toLowerCase().trim(),
      templateType,
      tone
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
        content: cached.content,
        fromCache: true,
        videoDuration
      });
    }
    
    // Get trending data for context enrichment
    const trendingProducts = await storage.getTrendingProducts();
    
    // Generate content using OpenAI
    const content = await generateContent(product, templateType, tone, trendingProducts);
    
    // Store in cache with optimized parameters
    contentCache.set(cacheKey, { 
      content, 
      generatedAt: Date.now() 
    });
    
    console.log(`Cached new content for ${product}, template: ${templateType}, tone: ${tone}`);
    
    // Save to database
    await storage.saveContentGeneration({
      product,
      templateType,
      tone,
      content
    });
    
    // Increment API usage counter with template and tone tracking
    await storage.incrementApiUsage(templateType, tone);
    
    // Estimate video duration
    const videoDuration = estimateVideoDuration(content, tone, templateType);
    
    // Return generated content with video duration estimation
    res.json({
      product,
      templateType,
      tone,
      content,
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
