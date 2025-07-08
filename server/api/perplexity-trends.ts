/**
 * Perplexity Trends API Endpoint
 * Provides endpoints for fetching real-time trending products via Perplexity
 */

import { Router } from 'express';
import { fetchTrendingProductsFromPerplexity, fetchAllNicheTrendsFromPerplexity } from '../services/perplexityTrends';
import { storage } from '../storage';

const router = Router();

/**
 * Fetch trending products for a specific niche using Perplexity
 */
router.get('/niche/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    
    if (!niche) {
      return res.status(400).json({
        success: false,
        error: 'Niche parameter is required'
      });
    }

    console.log(`🔍 API request: Fetching ${niche} trends from Perplexity`);
    
    const products = await fetchTrendingProductsFromPerplexity(niche);
    
    // Store products in database
    for (const product of products) {
      await storage.storeTrendingProduct({
        ...product,
        dataSource: 'perplexity'
      });
    }

    res.json({
      success: true,
      niche,
      count: products.length,
      products,
      source: 'perplexity'
    });

  } catch (error) {
    console.error('❌ Perplexity trends API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trends from Perplexity'
    });
  }
});

/**
 * Fetch trending products for all niches using Perplexity
 */
router.post('/refresh-all', async (req, res) => {
  try {
    console.log('🚀 API request: Refreshing all niche trends from Perplexity');
    
    const result = await fetchAllNicheTrendsFromPerplexity();
    
    // Store all products in database
    for (const product of result.products) {
      await storage.storeTrendingProduct({
        ...product,
        dataSource: 'perplexity'
      });
    }

    res.json({
      success: true,
      totalProducts: result.products.length,
      status: result.status,
      source: 'perplexity',
      message: 'Successfully refreshed trending products from Perplexity'
    });

  } catch (error) {
    console.error('❌ Perplexity refresh all error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh trends from Perplexity'
    });
  }
});

/**
 * Test Perplexity API connection
 */
router.get('/test', async (req, res) => {
  try {
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'PERPLEXITY_API_KEY not configured'
      });
    }

    // Test with a small request
    const testProducts = await fetchTrendingProductsFromPerplexity('tech');
    
    res.json({
      success: true,
      message: 'Perplexity API connection successful',
      testProducts: testProducts.length,
      sampleProduct: testProducts[0] || null
    });

  } catch (error) {
    console.error('❌ Perplexity test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Perplexity API test failed'
    });
  }
});

export default router;