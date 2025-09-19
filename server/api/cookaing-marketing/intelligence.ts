/**
 * Intelligence API Routes
 * Phase 3: Advanced Analytics & Intelligence API endpoints
 */

import { Router } from 'express';
import { intelligenceService } from '../../cookaing-marketing/services/intelligence.service';
import { featuresService } from '../../cookaing-marketing/services/features.service';
import { z } from 'zod';

const router = Router();

// ================================================================
// VALIDATION SCHEMAS
// ================================================================

const analyzeContentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.enum(['tiktok', 'instagram', 'youtube', 'twitter', 'facebook']).default('instagram'),
  mediaType: z.enum(['text', 'image', 'video', 'carousel']).default('text'),
  niche: z.string().optional(),
  includeCompetitor: z.boolean().default(false),
  includeSentiment: z.boolean().default(false),
  includeViral: z.boolean().default(false),
  includeFatigue: z.boolean().default(false)
});

// ================================================================
// CORE INTELLIGENCE ROUTES
// ================================================================

/**
 * POST /api/cookaing-marketing/intelligence/analyze
 * Analyze single content piece across all intelligence providers
 */
router.post('/analyze', async (req, res) => {
  try {
    const validatedData = analyzeContentSchema.parse(req.body);
    
    const result = await intelligenceService.analyzeContent({
      content: {
        text: validatedData.content,
        platform: validatedData.platform,
        mediaType: validatedData.mediaType,
        niche: validatedData.niche
      },
      options: {
        includeCompetitorAnalysis: validatedData.includeCompetitor,
        includeSentimentAnalysis: validatedData.includeSentiment,
        includeViralPrediction: validatedData.includeViral,
        includeFatigueDetection: validatedData.includeFatigue,
        generateRecommendations: true
      }
    });

    res.json({
      success: true,
      data: result,
      metadata: {
        processingTime: result.metadata.analysisTime,
        providersUsed: result.metadata.providersUsed.length,
        cacheHit: result.metadata.cacheHit,
        confidence: result.metadata.confidence
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Content analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Content analysis failed'
    });
  }
});

/**
 * POST /api/cookaing-marketing/intelligence/competitor/analyze
 * Analyze competitor landscape
 */
router.post('/competitor/analyze', async (req, res) => {
  try {
    const { content, platform = 'instagram', niche } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for competitor analysis'
      });
    }

    const result = await intelligenceService.analyzeContent({
      content: {
        text: content,
        platform,
        mediaType: 'text',
        niche
      },
      options: {
        includeCompetitorAnalysis: true,
        generateRecommendations: true
      }
    });

    res.json({
      success: true,
      data: {
        competitorInsights: result.competitor || null,
        recommendations: result.insights?.strategicRecommendations || [],
        overallScore: result.overallScore
      },
      metadata: {
        analysisTime: result.metadata.analysisTime,
        cacheHit: result.metadata.cacheHit
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Competitor analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Competitor analysis failed'
    });
  }
});

/**
 * POST /api/cookaing-marketing/intelligence/sentiment/analyze
 * Analyze content sentiment
 */
router.post('/sentiment/analyze', async (req, res) => {
  try {
    const { content, platform = 'instagram', niche } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for sentiment analysis'
      });
    }

    const result = await intelligenceService.analyzeContent({
      content: {
        text: content,
        platform,
        mediaType: 'text',
        niche
      },
      options: {
        includeSentimentAnalysis: true,
        generateRecommendations: true
      }
    });

    res.json({
      success: true,
      data: {
        sentiment: result.sentiment || null,
        recommendations: result.sentiment?.recommendations || [],
        insights: result.insights?.keyStrengths || []
      },
      metadata: {
        analysisTime: result.metadata.analysisTime,
        cacheHit: result.metadata.cacheHit
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Sentiment analysis failed'
    });
  }
});

/**
 * POST /api/cookaing-marketing/intelligence/viral/predict
 * Predict viral potential for content
 */
router.post('/viral/predict', async (req, res) => {
  try {
    const { content, platform = 'instagram', niche } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for viral prediction'
      });
    }

    const result = await intelligenceService.analyzeContent({
      content: {
        text: content,
        platform,
        mediaType: 'text',
        niche
      },
      options: {
        includeViralPrediction: true,
        generateRecommendations: true
      }
    });

    res.json({
      success: true,
      data: {
        viral: result.viral || null,
        optimizations: result.viral?.optimizations || [],
        estimatedReach: result.viral?.estimatedReach || null
      },
      metadata: {
        analysisTime: result.metadata.analysisTime,
        cacheHit: result.metadata.cacheHit
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Viral prediction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Viral prediction failed'
    });
  }
});

/**
 * POST /api/cookaing-marketing/intelligence/fatigue/detect
 * Detect audience fatigue for content themes
 */
router.post('/fatigue/detect', async (req, res) => {
  try {
    const { content, platform = 'instagram', niche } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for fatigue detection'
      });
    }

    const result = await intelligenceService.analyzeContent({
      content: {
        text: content,
        platform,
        mediaType: 'text',
        niche
      },
      options: {
        includeFatigueDetection: true,
        generateRecommendations: true
      }
    });

    res.json({
      success: true,
      data: {
        fatigue: result.fatigue || null,
        recommendations: result.fatigue?.recommendations || [],
        diversificationSuggestions: result.insights?.strategicRecommendations || []
      },
      metadata: {
        analysisTime: result.metadata.analysisTime,
        cacheHit: result.metadata.cacheHit
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Fatigue detection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Fatigue detection failed'
    });
  }
});

// ================================================================
// FEATURE EXTRACTION ROUTES
// ================================================================

/**
 * POST /api/cookaing-marketing/intelligence/features/extract
 * Extract content features for analysis
 */
router.post('/features/extract', async (req, res) => {
  try {
    const { content, platform = 'instagram', mediaType = 'text', metrics, context, options } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for feature extraction'
      });
    }

    const result = await featuresService.extractFeatures({
      content: {
        text: content,
        platform,
        mediaType,
        hashtags: req.body.hashtags,
        mentions: req.body.mentions,
        urls: req.body.urls
      },
      metrics: metrics ? {
        ...metrics,
        timestamp: metrics.timestamp ? new Date(metrics.timestamp) : undefined
      } : undefined,
      context,
      options
    });

    res.json({
      success: true,
      data: result,
      metadata: {
        extractionTime: result.metadata.extractionTime,
        featuresExtracted: result.metadata.featuresExtracted,
        confidence: result.metadata.confidence
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Feature extraction error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Feature extraction failed'
    });
  }
});

// ================================================================
// UTILITY ROUTES
// ================================================================

/**
 * GET /api/cookaing-marketing/intelligence/health
 * Health check for intelligence services
 */
router.get('/health', async (req, res) => {
  try {
    const intelligenceStatus = intelligenceService.getStatus();
    const featuresStatus = featuresService.getStatus();

    res.json({
      success: true,
      data: {
        intelligence: {
          config: intelligenceStatus.config,
          providers: intelligenceStatus.providers,
          cache: intelligenceStatus.cache
        },
        features: {
          capabilities: featuresStatus.capabilities,
          supportedPlatforms: featuresStatus.supportedPlatforms,
          supportedMediaTypes: featuresStatus.supportedMediaTypes
        },
        overall: 'healthy',
        timestamp: new Date().toISOString()
      },
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('[Intelligence API] Health check error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

/**
 * GET /api/cookaing-marketing/intelligence/status
 * Get detailed status of intelligence providers
 */
router.get('/status', async (req, res) => {
  try {
    const status = intelligenceService.getStatus();

    res.json({
      success: true,
      data: {
        config: status.config,
        providers: status.providers,
        cache: status.cache,
        mode: process.env.OPENAI_API_KEY ? 'live' : 'mock',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Status check failed'
    });
  }
});

/**
 * GET /api/cookaing-marketing/intelligence/providers
 * Get available intelligence providers and their capabilities
 */
router.get('/providers', async (req, res) => {
  try {
    const status = intelligenceService.getStatus();

    res.json({
      success: true,
      data: {
        providers: Object.entries(status.providers).map(([name, config]) => ({
          name,
          enabled: true,
          mode: config.mode,
          capabilities: {
            realtime: config.mode === 'live',
            caching: status.cache.enabled,
            rateLimited: 'rateLimits' in config && typeof config.rateLimits === 'object' && 'enabled' in config.rateLimits ? config.rateLimits.enabled : false
          }
        })),
        totalProviders: Object.keys(status.providers).length
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Providers error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Providers check failed'
    });
  }
});

// ================================================================
// SUGGESTIONS ROUTE
// ================================================================

/**
 * POST /api/cookaing-marketing/intelligence/suggestions
 * Get AI-powered content suggestions based on intelligence analysis
 */
router.post('/suggestions', async (req, res) => {
  try {
    const { content, platform = 'instagram', niche, goal = 'engagement' } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for suggestions'
      });
    }

    const result = await intelligenceService.analyzeContent({
      content: {
        text: content,
        platform,
        mediaType: 'text',
        niche
      },
      options: {
        includeViralPrediction: true,
        includeSentimentAnalysis: true,
        includeFatigueDetection: true,
        generateRecommendations: true
      }
    });

    res.json({
      success: true,
      data: {
        recommendation: result.recommendation,
        quickWins: result.insights?.quickWins || [],
        strategicSuggestions: result.insights?.strategicRecommendations || [],
        optimizationScore: result.overallScore,
        keyStrengths: result.insights?.keyStrengths || [],
        majorConcerns: result.insights?.majorConcerns || []
      },
      metadata: {
        analysisTime: result.metadata.analysisTime,
        providersUsed: result.metadata.providersUsed,
        cacheHit: result.metadata.cacheHit
      }
    });
  } catch (error) {
    console.error('[Intelligence API] Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Suggestions failed'
    });
  }
});

export default router;