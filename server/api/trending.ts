import { Router } from "express";
import { storage } from "../storage";
// import { getAllTrendingProducts } from "../scrapers"; // TODO: Implement scrapers
import { ScraperPlatform, SCRAPER_PLATFORMS } from "../../shared/constants";
// import { getAmazonTrending } from "../scrapers/amazon"; // TODO: Implement amazon scraper
// import { getTikTokTrending } from "../scrapers/tiktok"; // TODO: Implement tiktok scraper
// import { getYouTubeTrending } from "../scrapers/youtube"; // TODO: Implement youtube scraper
// import { getInstagramTrending } from "../scrapers/instagram"; // TODO: Implement instagram scraper
// import { getRedditTrending } from "../scrapers/reddit"; // TODO: Implement reddit scraper
// import { getGoogleTrendingProducts } from "../scrapers/googleTrends"; // TODO: Implement google trends scraper
import {
  getTrendingData,
  refreshTrendingCache
} from "../services/scraperCacheManager";

const router = Router();

// Define niches and some constants
const NICHES = ['beauty', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
type Niche = typeof NICHES[number];

// GET /api/trending - Get trending products organized by niche
router.get("/", async (req, res) => {
  try {
    console.log("🔄 API request: Getting trending products organized by niche");

    const organizedProducts: Record<string, any[]> = {};
    let totalCount = 0;

    // Fetch products for each niche
    for (const niche of NICHES) {
      console.log(`🔄 Fetching ${niche} products...`);

      // Get products for this niche, limited to 3 for balance
      const products = await storage.getTrendingProductsByNiche(niche as Niche, 3);

      console.log(`📊 ${niche}: ${products.length} products`);
      if (products.length > 0) {
        console.log(`   First ${niche} product: ${products[0].title} (${products[0].createdAt})`);
      }

      organizedProducts[niche] = products;
      totalCount += products.length;

      // Save AI trending picks to trend history if we have new products
      if (products.length > 0) {
        try {
          // Check if we already have recent entries for this niche to avoid duplicates
          const recentHistory = await storage.getTrendHistoryBySourceAndNiche(
            'ai_trending_picks',
            niche,
            1,
            0
          );

          const lastSavedTime = recentHistory.length > 0
            ? new Date(recentHistory[0].fetchedAt).getTime()
            : 0;

          const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

          // Only save if we don't have recent entries (within 24 hours)
          if (lastSavedTime < oneDayAgo) {
            console.log(`💾 Saving ${niche} AI trending picks to history...`);
            console.log(`🔍 Debug pricing for ${niche}:`, products.map(p => ({
              title: p.title,
              price: p.price,
              priceNumeric: p.priceNumeric,
              asin: p.asin
            })));

            for (const product of products) {
              const historyEntry = {
                sourceType: 'ai_trending_picks' as const,
                niche: niche,
                productTitle: product.title,
                productMentions: product.mentions || 0,
                productEngagement: product.engagement || 0,
                productSource: product.dataSource || 'perplexity',
                productReason: product.reason || '',
                productDescription: product.description || '',
                viralKeywords: product.viralKeywords || [],
                // Store additional product data as JSON with proper pricing info
                productData: {
                  price: product.price || null,
                  priceNumeric: product.priceNumeric || null,
                  priceCurrency: product.priceCurrency || 'USD',
                  priceType: product.priceType || 'one-time',
                  asin: product.asin || null,
                  trendCategory: product.trendCategory || null,
                  videoCount: product.videoCount || null,
                  growthPercentage: product.growthPercentage || null,
                  trendMomentum: product.trendMomentum || null,
                  // Ensure we capture all available pricing data
                  title: product.title,
                  source: product.source,
                  mentions: product.mentions,
                  engagement: product.engagement,
                  dataSource: product.dataSource
                },
                rawData: {
                  sourceUrl: product.sourceUrl || null,
                  perplexityNotes: product.perplexityNotes || null,
                  fetchedAt: product.fetchedAt || product.createdAt,
                  // Include the complete product object for debugging
                  fullProduct: product
                }
              };

              await storage.saveTrendHistory(historyEntry);
            }

            console.log(`✅ Saved ${products.length} AI trending picks for ${niche} to history`);
          } else {
            console.log(`⏭️ Skipping ${niche} - recent AI trending picks already saved`);
          }
        } catch (saveError) {
          console.error(`❌ Error saving ${niche} AI trending picks to history:`, saveError);
          // Don't fail the main request if saving fails
        }
      }
    }

    // Set cache-control headers to prevent browser caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    console.log(`📊 Total organized products: ${totalCount}`);

    res.json({
      success: true,
      count: totalCount,
      data: organizedProducts,
      lastUpdated: new Date().toISOString(),
      nextScheduledRefresh: "5:00 AM daily"
    });
  } catch (error) {
    console.error("❌ Error in trending API:", error);
    res.status(500).json({
      error: "Failed to fetch trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Force refresh trending products from all scrapers
router.post("/refresh", async (req, res) => {
  try {
    console.log("Manual refresh requested - this will force a full refresh regardless of cache");

    // Import the correct function
    const { refreshTrendingCache } = await import("../services/scraperCacheManager");

    // Use the refreshTrendingCache which bypasses cache and runs fresh scrapers
    const trendingProducts = await refreshTrendingCache();

    res.json({
      success: true,
      count: trendingProducts.length,
      message: "Trending products refreshed successfully",
      lastRefresh: new Date().toLocaleString(),
      nextScheduledRefresh: "Next automatic refresh at 5:00 AM"
    });
  } catch (error) {
    console.error("Error refreshing trending products:", error);
    res.status(500).json({
      error: "Failed to refresh trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Refresh trending products from a specific platform
router.post("/refresh/:platform", async (req, res) => {
  try {
    const { platform } = req.params;

    // Validate platform name
    if (!SCRAPER_PLATFORMS.includes(platform as ScraperPlatform)) {
      return res.status(400).json({
        error: "Invalid platform",
        message: `Platform must be one of: ${SCRAPER_PLATFORMS.join(', ')}`
      });
    }

    let scraperResult;
    let scraperName = platform as ScraperPlatform;

    // Call the appropriate scraper based on platform
    // Note: These scraper functions are commented out as they are not fully implemented in the provided snippet.
    // Uncomment and implement them as needed.
    switch (scraperName) {
      // case 'amazon':
      //   scraperResult = await getAmazonTrending();
      //   break;
      // case 'tiktok':
      //   scraperResult = await getTikTokTrending();
      //   break;
      // case 'youtube':
      //   scraperResult = await getYouTubeTrending();
      //   break;
      // case 'instagram':
      //   scraperResult = await getInstagramTrending();
      //   break;
      // case 'reddit':
      //   scraperResult = await getRedditTrending();
      //   break;
      // case 'google-trends':
      //   scraperResult = await getGoogleTrendingProducts();
      //   break;
      default:
        // If the platform is not one of the above, return an error.
        // This part assumes the SCRAPER_PLATFORMS array is correctly defined elsewhere.
        // If a platform is in SCRAPER_PLATFORMS but not in this switch, it's an oversight.
        return res.status(400).json({ error: "Unsupported platform or platform not implemented yet" });
    }

    // Update scraper status
    if (scraperResult) {
      await storage.updateScraperStatus(
        scraperName,
        scraperResult.status.status,
        scraperResult.status.errorMessage
      );

      // Save new trending products from this platform
      if (scraperResult.products && Array.isArray(scraperResult.products)) {
        // First, remove existing products for this platform
        await storage.clearTrendingProductsByPlatform(scraperName);

        // Then save the new products
        for (const product of scraperResult.products) {
          await storage.saveTrendingProduct(product);
        }
      }
    }

    res.json({
      success: true,
      platform: scraperName,
      count: scraperResult?.products?.length || 0,
      message: `${scraperName} trending products refreshed successfully`
    });
  } catch (error) {
    console.error(`Error refreshing specific platform:`, error);
    res.status(500).json({
      error: "Failed to refresh platform",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get trending products from trendHistory cache
router.get("/products", async (req, res) => {
  try {
    console.log("🔄 Reading cached AI trending picks from trendHistory");

    // Get specific niche if provided
    const niche = req.query.niche as string;

    let cachedProducts: any[] = [];
    let lastUpdated: Date | null = null;

    if (niche) {
      // Get products for specific niche from cache
      const cached = await storage.getTrendHistoryBySourceAndNiche(
        'ai_trending_picks',
        niche,
        50,
        0
      );

      if (cached.length > 0) {
        lastUpdated = cached[0].fetchedAt;
        
        // Reconstruct product objects from cached data
        cachedProducts = cached.map(entry => {
          const productData = entry.productData as any || {};
          return {
            id: entry.id,
            title: entry.productTitle || 'Unknown Product',
            mentions: entry.productMentions || 0,
            engagement: entry.productEngagement || 0,
            source: entry.productSource || 'perplexity',
            reason: entry.productReason || '',
            description: entry.productDescription || '',
            viralKeywords: entry.viralKeywords || [],
            niche: entry.niche,
            // Extract from productData JSON
            price: productData.price || null,
            priceNumeric: productData.priceNumeric || null,
            priceCurrency: productData.priceCurrency || 'USD',
            priceType: productData.priceType || 'one-time',
            asin: productData.asin || null,
            brand: productData.brand || null,
            // Metadata
            fetchedAt: entry.fetchedAt,
            dataSource: entry.productSource || 'perplexity',
            sourceType: 'cached'
          };
        });
      }
    } else {
      // Get products for all niches from cache
      for (const nicheItem of NICHES) {
        const cached = await storage.getTrendHistoryBySourceAndNiche(
          'ai_trending_picks',
          nicheItem,
          10,
          0
        );

        if (cached.length > 0) {
          if (!lastUpdated || cached[0].fetchedAt > lastUpdated) {
            lastUpdated = cached[0].fetchedAt;
          }

          // Add products from this niche
          const nicheProducts = cached.map(entry => {
            const productData = entry.productData as any || {};
            return {
              id: entry.id,
              title: entry.productTitle || 'Unknown Product',
              mentions: entry.productMentions || 0,
              engagement: entry.productEngagement || 0,
              source: entry.productSource || 'perplexity',
              reason: entry.productReason || '',
              description: entry.productDescription || '',
              viralKeywords: entry.viralKeywords || [],
              niche: entry.niche,
              price: productData.price || null,
              priceNumeric: productData.priceNumeric || null,
              priceCurrency: productData.priceCurrency || 'USD',
              priceType: productData.priceType || 'one-time',
              asin: productData.asin || null,
              brand: productData.brand || null,
              fetchedAt: entry.fetchedAt,
              dataSource: entry.productSource || 'perplexity',
              sourceType: 'cached'
            };
          });

          cachedProducts.push(...nicheProducts);
        }
      }
    }

    if (cachedProducts.length === 0) {
      return res.status(404).json({
        error: "No cached AI trending picks available. Run daily trend fetcher first.",
        niche: niche || 'all'
      });
    }

    console.log(`📦 Returning ${cachedProducts.length} cached products, last updated: ${lastUpdated}`);

    res.json({
      success: true,
      count: cachedProducts.length,
      data: cachedProducts,
      lastUpdated: lastUpdated?.toISOString() || new Date().toISOString(),
      source: 'cached'
    });
  } catch (error) {
    console.error("Error reading AI trending picks from cache:", error);
    res.status(500).json({
      error: "Failed to read cached trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/trends/status - Get status of cached trends
router.get("/status", async (req, res) => {
  try {
    console.log("🔍 Checking trends cache status");

    // Get the most recent entry from trendHistory to determine last update
    const allHistory = await storage.getTrendHistory(1, 0);
    
    if (allHistory.length === 0) {
      return res.json({
        lastUpdate: null,
        trendsInCache: 0,
        status: 'empty',
        message: 'No trends cached yet. Run daily trend fetcher first.',
        niches: []
      });
    }

    const lastUpdate = allHistory[0].fetchedAt;
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    const hoursSinceUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);

    // Check status based on age
    let status: 'healthy' | 'stale' | 'outdated';
    if (hoursSinceUpdate < 24) {
      status = 'healthy';
    } else if (hoursSinceUpdate < 48) {
      status = 'stale';
    } else {
      status = 'outdated';
    }

    // Get counts per niche and source type
    const nicheStats: any[] = [];
    
    for (const niche of NICHES) {
      // Count trend forecaster entries
      const forecasterEntries = await storage.getTrendHistoryBySourceAndNiche(
        'trend_forecaster',
        niche,
        1000,
        0
      );

      // Count AI trending picks entries
      const aiPicksEntries = await storage.getTrendHistoryBySourceAndNiche(
        'ai_trending_picks',
        niche,
        1000,
        0
      );

      nicheStats.push({
        niche,
        trendForecasterCount: forecasterEntries.length,
        aiTrendingPicksCount: aiPicksEntries.length,
        totalCount: forecasterEntries.length + aiPicksEntries.length,
        lastUpdate: forecasterEntries.length > 0 
          ? forecasterEntries[0].fetchedAt 
          : (aiPicksEntries.length > 0 ? aiPicksEntries[0].fetchedAt : null)
      });
    }

    const totalTrends = nicheStats.reduce((sum, stat) => sum + stat.totalCount, 0);

    res.json({
      lastUpdate: lastUpdate,
      hoursSinceUpdate: Math.round(hoursSinceUpdate * 10) / 10,
      trendsInCache: totalTrends,
      status,
      message: status === 'healthy' 
        ? 'Trends are up to date' 
        : status === 'stale' 
          ? 'Trends are getting old, consider refreshing'
          : 'Trends are outdated, refresh recommended',
      niches: nicheStats
    });

  } catch (error) {
    console.error("Error checking trends cache status:", error);
    res.status(500).json({
      error: "Failed to check trends cache status",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// POST /api/trends/fetch-daily - Manually trigger daily trend fetch (for testing)
router.post("/fetch-daily", async (req, res) => {
  try {
    console.log("🚀 Manual trigger: Starting daily trend fetch...");

    const { fetchDailyTrends } = await import("../services/dailyTrendFetcher");
    
    const status = await fetchDailyTrends();

    res.json({
      success: true,
      message: "Daily trend fetch completed",
      status
    });
  } catch (error) {
    console.error("Error in manual daily trend fetch:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch daily trends",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as trendingRouter };