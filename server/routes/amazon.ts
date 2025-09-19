import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { getAmazonClient } from '../amazon/client';
import { getAmazonNormalizer, NormalizedItem } from '../amazon/normalize';
import { getAmazonCache } from '../cache';
import { features } from '../env';

const router = Router();

// Rate limiting for Amazon API calls
const amazonRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: { error: 'Too many Amazon API requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request validation schemas
const searchSchema = z.object({
  keywords: z.string().min(1).max(200),
  category: z.string().optional(),
  minRating: z.number().min(1).max(5).optional(),
  minReviews: z.number().min(0).optional(),
  primeOnly: z.boolean().default(false),
  sortBy: z.enum(['Featured', 'Price:LowToHigh', 'Price:HighToLow', 'Relevance', 'NewestArrivals', 'AvgCustomerReviews']).default('Featured'),
  store: z.string().default('www.amazon.com'),
  niche: z.string().default('general'),
  platform: z.string().default('web')
});

const itemsSchema = z.object({
  asins: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  store: z.string().default('www.amazon.com'),
  niche: z.string().default('general'),
  platform: z.string().default('web')
});

/**
 * GET /api/amazon/search
 * Search Amazon products with filters and caching
 */
router.get('/search', amazonRateLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check if Amazon features are enabled
    if (!features.amazon.enabled) {
      return res.status(503).json({
        success: false,
        error: 'Amazon PA-API not configured',
        message: features.amazon.message,
        items: [],
        notice: 'Amazon features are disabled. Please configure your Amazon PA-API credentials.'
      });
    }

    // Validate request
    const validation = searchSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search parameters',
        details: validation.error.errors
      });
    }

    const params = validation.data;
    
    // Generate cache key
    const cacheKey = `amazon:search:${JSON.stringify(params)}`;
    const cache = getAmazonCache();
    
    // Try cache first
    const cached = await cache.get<{ items: NormalizedItem[], timestamp: number }>(cacheKey);
    if (cached) {
      const age = Math.floor((Date.now() - cached.timestamp) / 1000 / 60); // minutes
      console.log(`💾 Cache hit for Amazon search (${age}m old)`);
      
      return res.json({
        success: true,
        items: cached.items,
        cached: true,
        cacheAge: `${age}m`
      });
    }

    // Make PA-API request
    const client = getAmazonClient();
    const response = await client.searchItems({
      keywords: params.keywords,
      category: params.category,
      minRating: params.minRating,
      minReviews: params.minReviews,
      primeOnly: params.primeOnly,
      sortBy: params.sortBy,
      maxResults: 10
    });

    if (!response.success) {
      // Check if we have stale cache as fallback
      const staleCache = await cache.get<{ items: NormalizedItem[], timestamp: number }>(cacheKey + ':stale');
      if (staleCache) {
        console.log('⚠️ PA-API failed, serving stale cache');
        return res.json({
          success: true,
          items: staleCache.items,
          cached: true,
          notice: 'Amazon temporarily unavailable; showing cached results.'
        });
      }

      return res.status(503).json({
        success: false,
        error: response.error,
        items: [],
        notice: 'Amazon temporarily unavailable; try again.'
      });
    }

    // Normalize and filter results
    const normalizer = getAmazonNormalizer();
    const normalizedItems = normalizer.normalizeSearchResponse(response.data, {
      niche: params.niche,
      platform: params.platform
    });

    const filteredItems = normalizer.filterItems(normalizedItems, {
      minRating: params.minRating,
      minReviews: params.minReviews,
      primeOnly: params.primeOnly
    });

    // Cache successful results
    const cacheData = {
      items: filteredItems,
      timestamp: Date.now()
    };
    
    await cache.set(cacheKey, cacheData);
    await cache.set(cacheKey + ':stale', cacheData, 7 * 24 * 60 * 60 * 1000); // 7 days stale cache

    const duration = Date.now() - startTime;
    console.log(`🔍 Amazon search: "${params.keywords}" → ${filteredItems.length} items (${duration}ms)`);

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes browser cache

    res.json({
      success: true,
      items: filteredItems,
      cached: false,
      meta: {
        query: params.keywords,
        category: params.category,
        filters: {
          minRating: params.minRating,
          minReviews: params.minReviews,
          primeOnly: params.primeOnly
        },
        resultCount: filteredItems.length,
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Amazon search error (${duration}ms):`, error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      items: [],
      notice: 'Search temporarily unavailable; try again.'
    });
  }
});

/**
 * GET /api/amazon/items
 * Get specific items by ASIN with caching
 */
router.get('/items', amazonRateLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check if Amazon features are enabled
    if (!features.amazon.enabled) {
      return res.status(503).json({
        success: false,
        error: 'Amazon PA-API not configured',
        message: features.amazon.message,
        items: []
      });
    }

    // Validate request
    const validation = itemsSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: validation.error.errors
      });
    }

    const params = validation.data;
    
    if (params.asins.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one ASIN is required'
      });
    }

    if (params.asins.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 ASINs allowed per request'
      });
    }

    // Generate cache key
    const cacheKey = `amazon:items:${params.asins.sort().join(',')}:${params.niche}:${params.platform}`;
    const cache = getAmazonCache();
    
    // Try cache first
    const cached = await cache.get<{ items: NormalizedItem[], timestamp: number }>(cacheKey);
    if (cached) {
      const age = Math.floor((Date.now() - cached.timestamp) / 1000 / 60); // minutes
      console.log(`💾 Cache hit for Amazon items (${age}m old)`);
      
      return res.json({
        success: true,
        items: cached.items,
        cached: true,
        cacheAge: `${age}m`
      });
    }

    // Make PA-API request
    const client = getAmazonClient();
    const response = await client.getItems({
      asins: params.asins
    });

    if (!response.success) {
      return res.status(503).json({
        success: false,
        error: response.error,
        items: [],
        notice: 'Amazon temporarily unavailable; try again.'
      });
    }

    // Normalize results
    const normalizer = getAmazonNormalizer();
    const normalizedItems = normalizer.normalizeItemsResponse(response.data, {
      niche: params.niche,
      platform: params.platform
    });

    // Cache successful results
    const cacheData = {
      items: normalizedItems,
      timestamp: Date.now()
    };
    
    await cache.set(cacheKey, cacheData);

    const duration = Date.now() - startTime;
    console.log(`📦 Amazon items: ${params.asins.length} ASINs → ${normalizedItems.length} items (${duration}ms)`);

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes browser cache

    res.json({
      success: true,
      items: normalizedItems,
      cached: false,
      meta: {
        requestedAsins: params.asins,
        returnedCount: normalizedItems.length,
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Amazon items error (${duration}ms):`, error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      items: []
    });
  }
});

/**
 * GET /api/amazon/health
 * Check Amazon PA-API health and configuration
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    amazon: {
      enabled: features.amazon.enabled,
      message: features.amazon.message
    },
    cache: {
      type: 'file', // TODO: detect Redis vs file cache
      status: 'active'
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 30
    }
  });
});

export { router as amazonRouter };