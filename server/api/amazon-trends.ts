/**
 * Amazon Trends API Endpoint
 * Provides endpoints for fetching trending products via Amazon PA-API
 */

import { Router } from 'express';
import { createAmazonClient } from '../services/amazon/client';
import { storage } from '../storage';

const router = Router();

/**
 * Search trending products for a specific niche using Amazon PA-API
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

    console.log(`🔍 API request: Fetching ${niche} trends from Amazon PA-API`);
    
    const products = await searchAmazonTrendingByNiche(niche);
    
    // Store products in database
    for (const product of products) {
      await storage.saveTrendingProduct({
        ...product,
        dataSource: 'amazon'
      });
    }

    res.json({
      success: true,
      niche,
      count: products.length,
      products,
      source: 'amazon'
    });

  } catch (error) {
    console.error('❌ Amazon trends API error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trends from Amazon'
    });
  }
});

/**
 * Fetch trending products for all niches using Amazon PA-API
 */
router.post('/refresh-all', async (req, res) => {
  try {
    console.log('🚀 API request: Refreshing all niche trends from Amazon PA-API');
    
    const result = await fetchAllNicheTrendsFromAmazon();
    
    // Store all products in database
    for (const product of result.products) {
      await storage.saveTrendingProduct({
        ...product,
        dataSource: 'amazon'
      });
    }

    res.json({
      success: true,
      totalProducts: result.products.length,
      status: result.status,
      source: 'amazon',
      message: 'Successfully refreshed trending products from Amazon PA-API'
    });

  } catch (error) {
    console.error('❌ Amazon refresh all error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh trends from Amazon'
    });
  }
});

/**
 * Test Amazon PA-API connection
 */
router.get('/test', async (req, res) => {
  try {
    const client = createAmazonClient();
    
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'Amazon PA-API credentials not configured'
      });
    }

    const status = await client.testConnection();

    // Test with a small search request
    const testProducts = await searchAmazonTrendingByNiche('tech');
    
    res.json({
      success: true,
      message: 'Amazon PA-API connection successful',
      testProducts: testProducts.length,
      sampleProduct: testProducts[0] || null,
      apiStatus: status
    });

  } catch (error) {
    console.error('❌ Amazon test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Amazon PA-API test failed'
    });
  }
});

/**
 * Search Amazon for trending products by niche
 */
async function searchAmazonTrendingByNiche(niche: string) {
  const client = createAmazonClient();
  
  if (!client) {
    throw new Error('Amazon PA-API not configured');
  }

  const searchTerms = getSearchTermsByNiche(niche);
  const allProducts = [];

  for (const searchTerm of searchTerms) {
    try {
      console.log(`🔍 Searching Amazon for: ${searchTerm}`);
      
      const results = await client.searchItems({
        Keywords: searchTerm,
        SearchIndex: getSearchIndexByNiche(niche),
        ItemCount: 10,
        Resources: [
          'ItemInfo.Title',
          'ItemInfo.Features',
          'ItemInfo.ProductInfo',
          'Images.Primary.Large',
          'Offers.Listings.Price',
          'BrowseNodeInfo.BrowseNodes',
          'CustomerReviews.Count',
          'CustomerReviews.StarRating'
        ]
      });

      if (results.searchResult?.items) {
        const formattedProducts = results.searchResult.items.map((item: any) => ({
          title: item.itemInfo?.title?.displayValue || 'Unknown Product',
          niche: niche,
          mentions: item.customerReviews?.count || 0,
          source: 'amazon',
          dataSource: 'amazon',
          reason: `Popular on Amazon in ${niche} category`,
          description: item.itemInfo?.features?.displayValues?.[0] || '',
          asin: item.asin,
          affiliateUrl: item.detailPageUrl || '',
          price: item.offers?.listings?.[0]?.price?.displayAmount || '',
          rating: item.customerReviews?.starRating?.value || 0,
          createdAt: new Date().toISOString()
        }));

        allProducts.push(...formattedProducts);
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error searching for ${searchTerm}:`, error);
      // Continue with other search terms even if one fails
    }
  }

  return allProducts.slice(0, 15); // Limit to 15 products per niche
}

/**
 * Fetch trending products for all niches from Amazon
 */
async function fetchAllNicheTrendsFromAmazon() {
  const niches = ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
  const allProducts = [];
  const status = [];

  for (const niche of niches) {
    try {
      console.log(`🔄 Fetching Amazon trends for: ${niche}`);
      const products = await searchAmazonTrendingByNiche(niche);
      allProducts.push(...products);
      status.push({ niche, success: true, count: products.length });
      
      // Add delay between niche requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to fetch ${niche} from Amazon:`, error);
      status.push({ niche, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  return {
    products: allProducts,
    status
  };
}

/**
 * Get search terms for each niche
 */
function getSearchTermsByNiche(niche: string): string[] {
  const searchTerms = {
    beauty: ['trending skincare', 'viral makeup', 'popular beauty products', 'best skincare 2024'],
    tech: ['trending tech gadgets', 'viral electronics', 'popular tech accessories', 'best tech 2024'],
    fashion: ['trending fashion', 'viral clothing', 'popular accessories', 'best fashion trends'],
    fitness: ['trending fitness gear', 'viral workout equipment', 'popular fitness accessories', 'best fitness 2024'],
    food: ['trending snacks', 'viral food products', 'popular kitchen gadgets', 'best food trends'],
    travel: ['trending travel gear', 'viral travel accessories', 'popular luggage', 'best travel products'],
    pets: ['trending pet products', 'viral pet accessories', 'popular pet toys', 'best pet supplies']
  };

  return searchTerms[niche as keyof typeof searchTerms] || [`trending ${niche}`, `popular ${niche}`, `best ${niche}`];
}

/**
 * Get Amazon search index for each niche
 */
function getSearchIndexByNiche(niche: string): string {
  const searchIndexes = {
    beauty: 'Beauty',
    tech: 'Electronics',
    fashion: 'Fashion',
    fitness: 'SportsAndOutdoors',
    food: 'GroceryAndGourmetFood',
    travel: 'Luggage',
    pets: 'PetSupplies'
  };

  return searchIndexes[niche as keyof typeof searchIndexes] || 'All';
}

export default router;