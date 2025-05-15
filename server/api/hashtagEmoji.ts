/**
 * Hashtag and Emoji Recommendations API
 * 
 * Provides intelligent hashtag and emoji recommendations for social media content
 * based on niche, content text, and current trends.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { NICHES } from '@shared/constants';
import { getRecommendedHashtagsAndEmojis } from '../services/hashtagEmojiRecommender';

export const hashtagEmojiRouter = Router();

// Validate request schema
const hashtagEmojiRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  niche: z.enum(NICHES).default("skincare"),
  product: z.string().min(1, "Product name is required"),
});

/**
 * POST /api/hashtag-emoji
 * Get hashtag and emoji recommendations for the provided content and niche
 */
hashtagEmojiRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const result = hashtagEmojiRequestSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: result.error.format()
      });
    }
    
    const { content, niche, product } = result.data;
    
    // Get recommendations
    const recommendations = await getRecommendedHashtagsAndEmojis(content, niche, product);
    
    // Return recommendations
    return res.json({
      niche,
      product,
      recommendations
    });
  } catch (error) {
    console.error('Error in hashtag/emoji recommendations endpoint:', error);
    return res.status(500).json({
      error: "Failed to generate recommendations",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * GET /api/hashtag-emoji/:niche
 * Get basic hashtag and emoji recommendations for a specific niche
 * Useful for previewing recommendations without content analysis
 */
hashtagEmojiRouter.get('/:niche', async (req: Request, res: Response) => {
  try {
    const niche = req.params.niche as typeof NICHES[number];
    
    // Validate niche parameter
    if (!NICHES.includes(niche as any)) {
      return res.status(400).json({
        error: "Invalid niche",
        valid_niches: NICHES
      });
    }
    
    // Use a simple placeholder content for demo purposes
    const placeholderContent = `This is a placeholder content for ${niche}`;
    const placeholderProduct = `Example ${niche} product`;
    
    // Get recommendations
    const recommendations = await getRecommendedHashtagsAndEmojis(placeholderContent, niche, placeholderProduct);
    
    // Return recommendations
    return res.json({
      niche,
      recommendations,
      note: "These are example recommendations. For content-specific recommendations, use the POST endpoint."
    });
  } catch (error) {
    console.error('Error in hashtag/emoji recommendations preview:', error);
    return res.status(500).json({
      error: "Failed to generate recommendations",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});