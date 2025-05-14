import { Router } from "express";
import { z } from "zod";
import { TEMPLATE_TYPES, TONE_OPTIONS } from "@shared/constants";
import { storage } from "../storage";
import { generateContent, estimateVideoDuration } from "../services/contentGenerator";

const router = Router();

// Validate request body schema
const generateContentSchema = z.object({
  product: z.string().trim().min(1, "Product name is required"),
  templateType: z.enum(TEMPLATE_TYPES).default("original"),
  tone: z.enum(TONE_OPTIONS).default("friendly"),
});

// Simple in-memory cache for generation results
const contentCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 3600000; // Cache for 1 hour

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
    
    // Check cache first (using product+templateType+tone as key)
    const cacheKey = `${product}|${templateType}|${tone}`;
    const cached = contentCache.get(cacheKey);
    
    // If we have a valid cached result, return it
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      // Estimate video duration for cached content too
      const videoDuration = estimateVideoDuration(cached.content, tone, templateType);
      
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
    
    // Store in cache
    contentCache.set(cacheKey, { 
      content, 
      timestamp: Date.now() 
    });
    
    // Save to database
    await storage.saveContentGeneration({
      product,
      templateType,
      tone,
      content
    });
    
    // Increment API usage counter
    await storage.incrementApiUsage();
    
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
