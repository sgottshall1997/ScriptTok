/**
 * Enhanced Viral Research API
 * Comprehensive TikTok viral content analysis endpoint
 * 
 * Moved to correct path to match frontend expectations:
 * Frontend calls: /api/perplexity-trends/viral-research
 * Backend serves: /server/api/perplexity-trends/viral-research.ts
 */

import { Request, Response } from 'express';
import { researchTikTokViralContent, extractViralTemplate, clearExpiredCache, getCacheStats } from '../../services/tiktokViralResearch';

interface ViralResearchRequest {
  product: string;
  niche: string;
  includeTemplate?: boolean;
}

/**
 * Main endpoint for comprehensive TikTok viral content research
 * Route: POST /api/perplexity-trends/viral-research
 */
export const getTikTokViralResearch = async (req: Request, res: Response) => {
  try {
    const { product, niche, includeTemplate = true }: ViralResearchRequest = req.body;

    if (!product || !niche) {
      return res.status(400).json({
        success: false,
        error: 'Product name and niche are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    console.log(`🎯 Enhanced viral research request for "${product}" in ${niche} niche`);

    // Clear expired cache entries periodically
    clearExpiredCache();

    // Perform comprehensive viral research
    const viralResearch = await researchTikTokViralContent(product, niche);

    if (!viralResearch) {
      return res.status(404).json({
        success: false,
        error: 'No viral content found for this product in the specified niche',
        code: 'NO_VIRAL_CONTENT_FOUND',
        fallbackAvailable: true
      });
    }

    // Extract template data if requested
    const templateData = includeTemplate ? extractViralTemplate(viralResearch) : null;

    const response = {
      success: true,
      data: {
        research: viralResearch,
        template: templateData,
        cacheStats: getCacheStats(),
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: 'N/A', // Could add timing if needed
          apiVersion: '1.0'
        }
      }
    };

    console.log('✅ Successfully completed enhanced viral research');
    res.json(response);

  } catch (error) {
    console.error('❌ Error in enhanced viral research:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during viral research',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

/**
 * Get viral template data only (lighter endpoint)
 * Route: POST /api/perplexity-trends/viral-template
 */
export const getViralTemplate = async (req: Request, res: Response) => {
  try {
    const { product, niche }: ViralResearchRequest = req.body;

    if (!product || !niche) {
      return res.status(400).json({
        success: false,
        error: 'Product name and niche are required'
      });
    }

    console.log(`🎨 Viral template request for "${product}" in ${niche} niche`);

    const viralResearch = await researchTikTokViralContent(product, niche);
    
    if (!viralResearch) {
      return res.status(404).json({
        success: false,
        error: 'No viral templates available for this product',
        template: null
      });
    }

    const templateData = extractViralTemplate(viralResearch);

    res.json({
      success: true,
      template: templateData,
      confidence: viralResearch.templateRecommendations.confidenceScore,
      source: viralResearch.searchMetadata.source
    });

  } catch (error) {
    console.error('❌ Error getting viral template:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get viral template',
      template: null
    });
  }
};

/**
 * Get viral research progress/status
 * Route: GET /api/perplexity-trends/viral-status
 */
export const getViralResearchStatus = async (req: Request, res: Response) => {
  try {
    const cacheStats = getCacheStats();
    
    res.json({
      success: true,
      status: {
        cache: cacheStats,
        apiHealth: 'operational',
        lastUpdated: new Date().toISOString(),
        supportedNiches: [
          'beauty', 'skincare', 'fashion', 'fitness', 'tech', 
          'travel', 'food', 'pets', 'home', 'lifestyle'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error getting viral research status:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get status'
    });
  }
};

/**
 * Clear viral research cache (admin function)
 * Route: POST /api/perplexity-trends/viral-cache/clear
 */
export const clearViralResearchCache = async (req: Request, res: Response) => {
  try {
    const beforeStats = getCacheStats();
    clearExpiredCache();
    
    // Clear all cache if requested
    const { clearAll = false } = req.body;
    let clearedCount = beforeStats.expired;
    
    if (clearAll) {
      // Clear all cache entries (for testing/admin purposes)
      const { viralDataCache } = await import('../../services/tiktokViralResearch');
      const allKeys = Object.keys(viralDataCache);
      allKeys.forEach(key => delete viralDataCache[key]);
      clearedCount = allKeys.length;
    }

    res.json({
      success: true,
      message: `Cleared ${clearedCount} cache entries`,
      before: beforeStats,
      after: getCacheStats()
    });

  } catch (error) {
    console.error('❌ Error clearing viral research cache:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
};

// Default export for the main research endpoint
export default getTikTokViralResearch;