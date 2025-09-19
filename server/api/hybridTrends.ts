import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { hybridTrendsEngine } from '../services/hybridTrends.js';
import { getAmazonConfig } from '../env.js';

const router = Router();

// Rate limiting for hybrid trends endpoints
const trendsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: 'Too many trend discovery requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.use(trendsRateLimit);

// Validation schema for trends discovery
const trendsQuerySchema = z.object({
  niche: z.string().optional(),
  maxKeywords: z.string().transform(Number).optional(),
  maxProducts: z.string().transform(Number).optional(),
  forceRefresh: z.string().transform(val => val === 'true').default('false'),
  source: z.enum(['all', 'perplexity', 'reddit', 'amazon']).default('all')
});

/**
 * GET /api/hybrid-trends/discover
 * Discover trending topics and products across multiple sources
 */
router.get('/discover', async (req, res) => {
  try {
    // Validate query parameters
    const validationResult = trendsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      });
    }

    const params = validationResult.data;

    // Check Amazon configuration if needed
    const amazonConfig = getAmazonConfig();
    const hasAmazonIntegration = amazonConfig.isConfigured;

    // Discover trends
    const trendsResult = await hybridTrendsEngine.discoverTrends({
      niche: params.niche,
      maxKeywords: params.maxKeywords || 30,
      maxProducts: params.maxProducts || 20,
      forceRefresh: params.forceRefresh
    });

    // Filter by source if specified
    let filteredKeywords = trendsResult.keywords;
    let filteredProducts = trendsResult.products;

    if (params.source !== 'all') {
      filteredKeywords = trendsResult.keywords.filter(k => k.source === params.source);
      filteredProducts = trendsResult.products.filter(p => p.sources.includes(params.source));
    }

    const response = {
      success: true,
      data: {
        keywords: filteredKeywords,
        products: filteredProducts,
        sources: trendsResult.sources,
        lastUpdated: trendsResult.lastUpdated,
        totalSources: trendsResult.totalSources,
        coverage: trendsResult.coverage
      },
      meta: {
        requestedNiche: params.niche,
        requestedSource: params.source,
        amazonIntegration: hasAmazonIntegration,
        totalKeywords: filteredKeywords.length,
        totalProducts: filteredProducts.length,
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Hybrid trends discovery error:', error);
    res.status(500).json({
      error: 'Trends discovery failed',
      message: 'An error occurred while discovering trends across sources'
    });
  }
});

/**
 * GET /api/hybrid-trends/keywords
 * Get trending keywords only (lighter endpoint)
 */
router.get('/keywords', async (req, res) => {
  try {
    const validationResult = z.object({
      niche: z.string().optional(),
      limit: z.string().transform(Number).min(1).max(100).default('20'),
      source: z.enum(['all', 'perplexity', 'reddit', 'amazon']).default('all')
    }).safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      });
    }

    const params = validationResult.data;

    const trendsResult = await hybridTrendsEngine.discoverTrends({
      niche: params.niche,
      maxKeywords: params.limit,
      maxProducts: 5 // Minimal products for performance
    });

    let keywords = trendsResult.keywords;
    if (params.source !== 'all') {
      keywords = keywords.filter(k => k.source === params.source);
    }

    res.json({
      success: true,
      data: {
        keywords: keywords.slice(0, params.limit),
        sources: trendsResult.sources.filter(s => s.enabled),
        lastUpdated: trendsResult.lastUpdated
      },
      meta: {
        total: keywords.length,
        limit: params.limit,
        niche: params.niche,
        source: params.source
      }
    });

  } catch (error) {
    console.error('Keywords discovery error:', error);
    res.status(500).json({
      error: 'Keywords discovery failed',
      message: 'An error occurred while fetching trending keywords'
    });
  }
});

/**
 * GET /api/hybrid-trends/products
 * Get trending products mapped from keywords
 */
router.get('/products', async (req, res) => {
  try {
    const validationResult = z.object({
      niche: z.string().optional(),
      limit: z.string().transform(Number).min(1).max(50).default('15'),
      minRating: z.string().transform(Number).min(1).max(5).optional(),
      priceRange: z.string().optional(), // "min-max" format
      sortBy: z.enum(['trendScore', 'rating', 'price']).default('trendScore')
    }).safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      });
    }

    const params = validationResult.data;

    // Check Amazon configuration
    const amazonConfig = getAmazonConfig();
    if (!amazonConfig.isConfigured) {
      return res.status(503).json({
        error: 'Amazon integration not configured',
        message: 'Product discovery requires Amazon PA-API configuration'
      });
    }

    const trendsResult = await hybridTrendsEngine.discoverTrends({
      niche: params.niche,
      maxKeywords: 15, // Moderate keywords for performance
      maxProducts: params.limit * 2 // Get extra to allow filtering
    });

    let products = trendsResult.products;

    // Apply filters
    if (params.minRating) {
      products = products.filter(p => p.reviews.rating >= params.minRating!);
    }

    if (params.priceRange) {
      const [min, max] = params.priceRange.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        products = products.filter(p => 
          p.price && p.price.current >= min && p.price.current <= max
        );
      }
    }

    // Sort products
    products.sort((a, b) => {
      switch (params.sortBy) {
        case 'rating':
          return b.reviews.rating - a.reviews.rating;
        case 'price':
          return (a.price?.current || 0) - (b.price?.current || 0);
        case 'trendScore':
        default:
          return b.trendScore - a.trendScore;
      }
    });

    const limitedProducts = products.slice(0, params.limit);

    res.json({
      success: true,
      data: {
        products: limitedProducts,
        totalFound: products.length,
        coverage: trendsResult.coverage,
        lastUpdated: trendsResult.lastUpdated
      },
      meta: {
        niche: params.niche,
        limit: params.limit,
        sortBy: params.sortBy,
        filters: {
          minRating: params.minRating,
          priceRange: params.priceRange
        },
        amazonConfig: {
          partnerTag: amazonConfig.partnerTag,
          region: amazonConfig.region
        }
      }
    });

  } catch (error) {
    console.error('Products discovery error:', error);
    res.status(500).json({
      error: 'Products discovery failed',
      message: 'An error occurred while discovering trending products'
    });
  }
});

/**
 * GET /api/hybrid-trends/sources
 * Get information about available trend sources
 */
router.get('/sources', async (req, res) => {
  try {
    const amazonConfig = getAmazonConfig();
    
    const sources = [
      {
        name: 'perplexity',
        displayName: 'Perplexity AI',
        description: 'AI-powered trend discovery across web content',
        enabled: true,
        priority: 1,
        dataTypes: ['keywords', 'topics', 'trending_searches'],
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'reddit',
        displayName: 'Reddit Communities',
        description: 'Trending discussions and viral content from Reddit',
        enabled: true, // Simulated for now
        priority: 2,
        dataTypes: ['keywords', 'viral_content', 'community_trends'],
        lastUpdated: new Date().toISOString()
      },
      {
        name: 'amazon',
        displayName: 'Amazon Product Trends',
        description: 'Trending products and search terms from Amazon marketplace',
        enabled: amazonConfig.isConfigured,
        priority: 3,
        dataTypes: ['products', 'search_terms', 'bestsellers'],
        lastUpdated: amazonConfig.isConfigured ? new Date().toISOString() : null,
        configuration: amazonConfig.isConfigured ? {
          partnerTag: amazonConfig.partnerTag,
          region: amazonConfig.region,
          marketplace: amazonConfig.storeDomain
        } : null
      }
    ];

    const enabledSources = sources.filter(s => s.enabled);

    res.json({
      success: true,
      data: {
        sources,
        enabledSources,
        totalSources: sources.length,
        activeSources: enabledSources.length
      },
      meta: {
        amazomIntegration: amazonConfig.isConfigured,
        capabilities: {
          keywordDiscovery: true,
          productMapping: amazonConfig.isConfigured,
          multiSourceAggregation: enabledSources.length > 1
        }
      }
    });

  } catch (error) {
    console.error('Sources info error:', error);
    res.status(500).json({
      error: 'Sources information failed',
      message: 'An error occurred while fetching source information'
    });
  }
});

/**
 * POST /api/hybrid-trends/refresh
 * Force refresh trends cache
 */
router.post('/refresh', async (req, res) => {
  try {
    const { niche } = req.body;

    const trendsResult = await hybridTrendsEngine.discoverTrends({
      niche,
      forceRefresh: true,
      maxKeywords: 50,
      maxProducts: 30
    });

    res.json({
      success: true,
      message: 'Trends cache refreshed successfully',
      data: {
        keywords: trendsResult.keywords.length,
        products: trendsResult.products.length,
        sources: trendsResult.totalSources,
        lastUpdated: trendsResult.lastUpdated
      }
    });

  } catch (error) {
    console.error('Trends refresh error:', error);
    res.status(500).json({
      error: 'Trends refresh failed',
      message: 'An error occurred while refreshing trends cache'
    });
  }
});

export default router;