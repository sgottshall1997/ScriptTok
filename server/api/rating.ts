import { Request, Response } from 'express';
import { 
  saveContentRating, 
  getContentRating, 
  extractContentPatterns,
  getUserPreferences,
  updateUserPreferences,
  getContentSuggestions,
  trackPatternApplication
} from '../services/ratingSystem';
import { insertContentRatingSchema } from '@shared/schema';
import { z } from 'zod';

// Save or update content rating
export async function saveRating(req: Request, res: Response) {
  try {
    const validatedData = insertContentRatingSchema.parse(req.body);
    
    const rating = await saveContentRating(validatedData);
    
    res.json({
      success: true,
      rating,
      message: 'Rating saved successfully'
    });
  } catch (error) {
    console.error('Error saving rating:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save rating'
    });
  }
}

// Get rating for specific content
export async function getRating(req: Request, res: Response) {
  try {
    const contentHistoryId = parseInt(req.params.contentHistoryId);
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    if (isNaN(contentHistoryId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content history ID'
      });
    }
    
    const rating = await getContentRating(contentHistoryId, userId);
    
    res.json({
      success: true,
      rating
    });
  } catch (error) {
    console.error('Error getting rating:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rating'
    });
  }
}

// Extract patterns from high-rated content
export async function generatePatterns(req: Request, res: Response) {
  try {
    const { minRating = 70 } = req.body;
    
    const patterns = await extractContentPatterns(minRating);
    
    res.json({
      success: true,
      patterns,
      count: patterns.length,
      message: `Generated ${patterns.length} content patterns from high-rated content`
    });
  } catch (error) {
    console.error('Error generating patterns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate patterns'
    });
  }
}

// Get user learning preferences
export async function getPreferences(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    const preferences = await getUserPreferences(userId);
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences'
    });
  }
}

// Update user learning preferences
export async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    const preferencesSchema = z.object({
      useSmartLearning: z.boolean().optional(),
      learningIntensity: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
      minOverallRating: z.number().min(1).max(100).optional(),
      minPlatformRating: z.number().min(1).max(100).optional(),
      personalizedWeights: z.any().optional(),
    });
    
    const validatedData = preferencesSchema.parse(req.body);
    
    const preferences = await updateUserPreferences(userId, validatedData);
    
    res.json({
      success: true,
      preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preferences'
    });
  }
}

// Get content generation suggestions based on patterns
export async function getSuggestions(req: Request, res: Response) {
  try {
    const { niche, tone, templateType } = req.query;
    
    if (!niche || !tone || !templateType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: niche, tone, templateType'
      });
    }
    
    const suggestions = await getContentSuggestions(
      niche as string,
      tone as string,
      templateType as string
    );
    
    res.json({
      success: true,
      suggestions,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
}

// Track pattern application for A/B testing
export async function trackApplication(req: Request, res: Response) {
  try {
    const trackingSchema = z.object({
      contentHistoryId: z.number(),
      patternId: z.number().optional(),
      applicationStrength: z.number().min(0).max(1).optional(),
      modifiedAttributes: z.array(z.string()).optional(),
    });
    
    const validatedData = trackingSchema.parse(req.body);
    
    const application = await trackPatternApplication(validatedData);
    
    res.json({
      success: true,
      application,
      message: 'Pattern application tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking application:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track application'
    });
  }
}

// Get user rating statistics
export async function getRatingStats(req: Request, res: Response) {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    
    // This would normally query the database for comprehensive stats
    // For now, returning a basic structure
    const stats = {
      totalRatings: 0,
      averageOverallRating: 0,
      averagePlatformRatings: {
        instagram: 0,
        tiktok: 0,
        youtube: 0,
        twitter: 0,
      },
      topPerformingNiches: [],
      topPerformingTones: [],
      ratingTrends: [],
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting rating stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rating statistics'
    });
  }
}

// Get smart style recommendations for content generation
export async function getSmartStyleRecommendations(req: Request, res: Response) {
  try {
    const { userId, niche, templateType, tone, platform } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { getSmartStyleRecommendations: getRecommendations } = await import('../services/ratingSystem');
    
    const recommendations = await getRecommendations(
      parseInt(userId as string),
      niche as string,
      templateType as string,
      tone as string,
      platform as string
    );

    res.json({
      success: true,
      recommendations,
      hasRecommendations: !!recommendations
    });
  } catch (error) {
    console.error('Error getting smart style recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get smart style recommendations'
    });
  }
}