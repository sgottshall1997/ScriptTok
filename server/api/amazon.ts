import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { createAmazonClient, AmazonAPIError } from '../services/amazon/client.js';
import { normalizeAmazonSearchResponse, normalizeAmazonProduct, filterProducts, sortProducts, NormalizedProduct } from '../services/amazon/normalize.js';
import { getCache, CACHE_TTL, CACHE_KEYS } from '../cache/index.js';
import { getAmazonConfig } from '../env.js';

const router = Router();
const cache = getCache();

// Rate limiting for Amazon API endpoints
const amazonRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute (Amazon has strict limits)
  message: { error: 'Too many Amazon API requests. Please try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all Amazon routes
router.use(amazonRateLimit);

// Validation schemas
const searchQuerySchema = z.object({
  keywords: z.string().min(1).max(200).optional(),
  category: z.string().optional(),
  browseNodeId: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  minRating: z.string().optional().transform(val => val ? Math.max(1, Math.min(5, Number(val))) : undefined),
  page: z.string().default('1').transform(val => Math.max(1, Math.min(10, Number(val)))),
  itemCount: z.string().default('20').transform(val => Math.max(1, Math.min(50, Number(val)))),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'rating', 'reviews', 'newest']).default('relevance'),
  inStockOnly: z.string().transform(val => val === 'true').default('false'),
  primeOnly: z.string().transform(val => val === 'true').default('false'),
  brands: z.string().optional().transform(val => val ? val.split(',').map(b => b.trim()) : undefined),
  merchant: z.enum(['Amazon', 'All']).default('All'),
  condition: z.enum(['New', 'Used', 'Collectible', 'Refurbished', 'Any']).default('New')
});

const getItemsQuerySchema = z.object({
  asins: z.string().min(1).transform(val => val.split(',').map(asin => asin.trim())),
  condition: z.enum(['New', 'Used', 'Collectible', 'Refurbished', 'Any']).default('New'),
  merchant: z.enum(['Amazon', 'All']).default('All')
});

/**
 * GET /api/amazon/search
 * Search Amazon products with filtering and caching
 */
router.get('/search', async (req, res) => {
  try {
    // Check if Amazon is configured
    const amazonConfig = getAmazonConfig();
    if (!amazonConfig.isConfigured) {
      return res.status(503).json({
        error: 'Amazon affiliate integration not configured',
        message: 'Amazon PA-API credentials are required for product search',
        monetizationStatus: 'disabled'
      });
    }

    // Validate query parameters
    const validationResult = searchQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid search parameters',
        details: validationResult.error.errors
      });
    }

    const params = validationResult.data;

    // Validate that at least one search criterion is provided
    if (!params.keywords && !params.category && !params.browseNodeId) {
      return res.status(400).json({
        error: 'Search criteria required',
        message: 'Please provide keywords, category, or browse node ID'
      });
    }

    // Generate cache key
    const cacheKey = `${CACHE_KEYS.AMAZON_SEARCH}:${JSON.stringify(params)}`;

    // Try to get from cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Create Amazon client
    const amazonClient = createAmazonClient();
    if (!amazonClient) {
      return res.status(503).json({
        error: 'Amazon client initialization failed',
        message: 'Unable to connect to Amazon PA-API'
      });
    }

    // Build search request
    const searchRequest: any = {
      ItemCount: params.itemCount,
      ItemPage: params.page,
      Merchant: params.merchant,
      Condition: params.condition
    };

    // Add search criteria
    if (params.keywords) {
      searchRequest.Keywords = params.keywords;
    }
    if (params.browseNodeId) {
      searchRequest.BrowseNodeId = params.browseNodeId;
    }
    if (params.category) {
      // Map category to search index
      const searchIndexes = amazonClient.getSearchIndexesForNiche(params.category);
      searchRequest.SearchIndex = searchIndexes[0] || 'All';
    }

    // Add price filters
    if (typeof params.minPrice === 'number') {
      searchRequest.MinPrice = Math.round(params.minPrice * 100); // Amazon expects cents
    }
    if (typeof params.maxPrice === 'number') {
      searchRequest.MaxPrice = Math.round(params.maxPrice * 100);
    }

    // Perform Amazon search
    const amazonResponse = await amazonClient.searchItems(searchRequest);
    
    // Normalize response
    const normalizedResult = normalizeAmazonSearchResponse(
      amazonResponse,
      amazonConfig.partnerTag!,
      {
        keywords: params.keywords,
        category: params.category,
        page: params.page
      }
    );

    // Apply additional filters
    let filteredProducts = filterProducts(normalizedResult.products, {
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      minRating: params.minRating,
      inStockOnly: params.inStockOnly,
      primeOnly: params.primeOnly,
      brands: params.brands
    });

    // Sort products
    filteredProducts = sortProducts(filteredProducts, params.sortBy);

    const result = {
      ...normalizedResult,
      products: filteredProducts,
      totalResults: filteredProducts.length,
      cached: false,
      timestamp: new Date().toISOString(),
      filters: {
        minPrice: params.minPrice as number | undefined,
        maxPrice: params.maxPrice as number | undefined,
        minRating: params.minRating as number | undefined,
        inStockOnly: params.inStockOnly as boolean,
        primeOnly: params.primeOnly as boolean,
        brands: params.brands as string[] | undefined,
        sortBy: params.sortBy as string
      }
    };

    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL.AMAZON_SEARCH);

    res.json(result);

  } catch (error) {
    console.error('Amazon search error:', error);

    if (error instanceof AmazonAPIError) {
      return res.status(error.statusCode).json({
        error: 'Amazon API error',
        message: error.message,
        statusCode: error.statusCode
      });
    }

    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching products'
    });
  }
});

/**
 * GET /api/amazon/items
 * Get detailed information for specific products by ASIN
 */
router.get('/items', async (req, res) => {
  try {
    // Check if Amazon is configured
    const amazonConfig = getAmazonConfig();
    if (!amazonConfig.isConfigured) {
      return res.status(503).json({
        error: 'Amazon affiliate integration not configured',
        message: 'Amazon PA-API credentials are required for product details'
      });
    }

    // Validate query parameters
    const validationResult = getItemsQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      });
    }

    const params = validationResult.data;

    // Limit number of ASINs to prevent abuse
    if (params.asins.length > 10) {
      return res.status(400).json({
        error: 'Too many ASINs',
        message: 'Maximum 10 ASINs allowed per request'
      });
    }

    // Generate cache key
    const cacheKey = `${CACHE_KEYS.AMAZON_PRODUCT}:${params.asins.sort().join(',')}:${params.condition}:${params.merchant}`;

    // Try to get from cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        ...cachedResult,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }

    // Create Amazon client
    const amazonClient = createAmazonClient();
    if (!amazonClient) {
      return res.status(503).json({
        error: 'Amazon client initialization failed',
        message: 'Unable to connect to Amazon PA-API'
      });
    }

    // Perform Amazon lookup
    const amazonResponse = await amazonClient.getItems({
      ItemIds: params.asins,
      Condition: params.condition,
      Merchant: params.merchant
    });

    // Normalize response
    const items = amazonResponse?.ItemsResult?.Items || [];
    const normalizedProducts: NormalizedProduct[] = items
      .map((item: any) => normalizeAmazonProduct(item, amazonConfig.partnerTag!))
      .filter((product: NormalizedProduct | null): product is NormalizedProduct => product !== null);

    const result = {
      products: normalizedProducts,
      totalResults: normalizedProducts.length,
      requestedAsins: params.asins,
      foundAsins: normalizedProducts.map(p => p.asin),
      cached: false,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL.AMAZON_PRODUCT);

    res.json(result);

  } catch (error) {
    console.error('Amazon items error:', error);

    if (error instanceof AmazonAPIError) {
      return res.status(error.statusCode).json({
        error: 'Amazon API error',
        message: error.message,
        statusCode: error.statusCode
      });
    }

    res.status(500).json({
      error: 'Items lookup failed',
      message: 'An error occurred while fetching product details'
    });
  }
});

/**
 * GET /api/amazon/browse-nodes
 * Get browse node information for category navigation
 */
router.get('/browse-nodes', async (req, res) => {
  try {
    const amazonConfig = getAmazonConfig();
    if (!amazonConfig.isConfigured) {
      return res.status(503).json({
        error: 'Amazon affiliate integration not configured'
      });
    }

    const { nodeIds } = req.query;
    if (!nodeIds || typeof nodeIds !== 'string') {
      return res.status(400).json({
        error: 'Browse node IDs required',
        message: 'Provide comma-separated browse node IDs'
      });
    }

    const browseNodeIds = nodeIds.split(',').map(id => id.trim());
    if (browseNodeIds.length > 5) {
      return res.status(400).json({
        error: 'Too many browse nodes',
        message: 'Maximum 5 browse nodes per request'
      });
    }

    const cacheKey = `${CACHE_KEYS.AMAZON_BROWSE}:${browseNodeIds.sort().join(',')}`;
    
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        ...cachedResult,
        cached: true
      });
    }

    const amazonClient = createAmazonClient();
    if (!amazonClient) {
      return res.status(503).json({
        error: 'Amazon client initialization failed'
      });
    }

    const response = await amazonClient.getBrowseNodes({
      BrowseNodeIds: browseNodeIds
    });

    const result = {
      browseNodes: response?.BrowseNodesResult?.BrowseNodes || [],
      cached: false,
      timestamp: new Date().toISOString()
    };

    await cache.set(cacheKey, result, CACHE_TTL.BROWSE_NODES);
    res.json(result);

  } catch (error) {
    console.error('Browse nodes error:', error);
    res.status(500).json({
      error: 'Browse nodes lookup failed',
      message: 'An error occurred while fetching category information'
    });
  }
});

/**
 * GET /api/amazon/test
 * Simple test with minimal API call to verify credentials
 */
router.get('/test', async (req, res) => {
  try {
    const amazonConfig = getAmazonConfig();
    
    if (!amazonConfig.isConfigured) {
      return res.json({
        success: false,
        configured: false,
        message: 'Amazon PA-API credentials not configured'
      });
    }

    const amazonClient = createAmazonClient();
    if (!amazonClient) {
      return res.json({
        success: false,
        configured: true,
        message: 'Amazon client initialization failed'
      });
    }

    // Make a single, minimal test request
    try {
      console.log('🧪 Making minimal Amazon API test request...');
      const testResponse = await amazonClient.getItems({
        ItemIds: ['B08N5WRWNW'], // Known ASIN for testing
        Resources: ['ItemInfo.Title'] // Minimal resource request
      });
      
      return res.json({
        success: true,
        configured: true,
        message: 'PA-API access confirmed',
        testResponse: testResponse ? 'Product data received' : 'No data returned'
      });
      
    } catch (error) {
      console.log('🔍 Amazon API test error:', error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof AmazonAPIError) {
        // Check for specific error types
        if (error.message.includes('TooManyRequests')) {
          return res.json({
            success: true, // TooManyRequests means credentials work!
            configured: true,
            message: 'PA-API access confirmed (rate limited)',
            note: 'TooManyRequests error confirms valid credentials'
          });
        }
        
        return res.json({
          success: false,
          configured: true,
          message: `Amazon API error: ${error.message}`,
          statusCode: error.statusCode
        });
      }
      
      return res.json({
        success: false,
        configured: true,
        message: 'API test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    console.error('Amazon test error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/amazon/status
 * Check Amazon API connectivity and configuration
 */
router.get('/status', async (req, res) => {
  try {
    const amazonConfig = getAmazonConfig();
    const cacheStats = await cache.getStats();
    
    let apiStatus: { connected: boolean; error: string | null } = { connected: false, error: null };
    
    if (amazonConfig.isConfigured) {
      const amazonClient = createAmazonClient();
      if (amazonClient) {
        const testResult = await amazonClient.testConnection();
        apiStatus = {
          connected: testResult.success,
          error: testResult.error ?? null
        };
      }
    }

    res.json({
      configured: amazonConfig.isConfigured,
      partnerTag: amazonConfig.partnerTag,
      region: amazonConfig.region,
      apiHost: amazonConfig.apiHost,
      apiStatus,
      cache: cacheStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: 'Unable to check Amazon API status'
    });
  }
});

export default router;