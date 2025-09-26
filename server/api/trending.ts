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
                // Store additional product data as JSON
                productData: {
                  price: product.price,
                  priceNumeric: product.priceNumeric,
                  priceCurrency: product.priceCurrency,
                  priceType: product.priceType,
                  asin: product.asin,
                  trendCategory: product.trendCategory,
                  videoCount: product.videoCount,
                  growthPercentage: product.growthPercentage,
                  trendMomentum: product.trendMomentum
                },
                rawData: {
                  sourceUrl: product.sourceUrl,
                  perplexityNotes: product.perplexityNotes,
                  fetchedAt: product.fetchedAt
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

// Get trending products from storage
router.get("/products", async (req, res) => {
  try {
    // Get product limit from query param or use default
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    // Get specific niche if provided
    const niche = req.query.niche as string;

    let trendingProducts;
    if (niche) {
      // Always get exactly 3 products per niche when a specific niche is requested
      const EXACT_NICHE_PRODUCT_COUNT = 3;
      trendingProducts = await storage.getTrendingProductsByNiche(niche, EXACT_NICHE_PRODUCT_COUNT);

      // If we don't have exactly 3 products, make sure we get exactly 3
      if (trendingProducts.length !== EXACT_NICHE_PRODUCT_COUNT) {
        // If we have more than 3, truncate to exactly 3
        if (trendingProducts.length > EXACT_NICHE_PRODUCT_COUNT) {
          trendingProducts = trendingProducts.slice(0, EXACT_NICHE_PRODUCT_COUNT);
        }
        // If we have fewer than 3, we need to make sure we have exactly 3
        else if (trendingProducts.length < EXACT_NICHE_PRODUCT_COUNT) {
          // Get all products of this niche from all scrapers to ensure we have enough options
          const allProducts = await storage.getTrendingProductsByNiche(niche, 100);

          // If we have enough products, just take the top 3
          if (allProducts.length >= EXACT_NICHE_PRODUCT_COUNT) {
            trendingProducts = allProducts.slice(0, EXACT_NICHE_PRODUCT_COUNT);
          }
          // If we still don't have enough, we'll need to fill in with products from other niches
          else {
            // Get all products and filter for those that could be relevant to this niche
            const allAvailableProducts = await storage.getTrendingProducts(100);

            // Prioritize products with matching niche, then add additional ones until we have 3
            const existingIds = new Set(trendingProducts.map(p => p.id));

            for (const product of allAvailableProducts) {
              // Skip products we already have
              if (existingIds.has(product.id)) continue;

              // Add this product
              trendingProducts.push(product);
              existingIds.add(product.id);

              // Stop when we reach the target count
              if (trendingProducts.length >= EXACT_NICHE_PRODUCT_COUNT) break;
            }

            // Limit to exactly 3 (just in case)
            trendingProducts = trendingProducts.slice(0, EXACT_NICHE_PRODUCT_COUNT);
          }
        }
      }
    } else {
      trendingProducts = await storage.getTrendingProducts(limit);
    }

    // Save to trend history if we have products and haven't saved recently
    if (trendingProducts.length > 0) {
      try {
        // Group products by niche for history saving
        const productsByNiche: Record<string, any[]> = {};

        trendingProducts.forEach(product => {
          const niche = product.niche || 'unknown';
          if (!productsByNiche[niche]) {
            productsByNiche[niche] = [];
          }
          productsByNiche[niche].push(product);
        });

        // Save each niche separately, checking for recent entries
        for (const [niche, nicheProducts] of Object.entries(productsByNiche)) {
          const recentHistory = await storage.getTrendHistoryBySourceAndNiche(
            'ai_trending_picks',
            niche,
            1,
            0
          );

          const lastSavedTime = recentHistory.length > 0
            ? new Date(recentHistory[0].fetchedAt).getTime()
            : 0;

          const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);

          // Only save if we don't have recent entries (within 6 hours for this endpoint)
          if (lastSavedTime < sixHoursAgo) {
            for (const product of nicheProducts.slice(0, 5)) { // Limit to 5 products per niche
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
                productData: {
                  price: product.price,
                  priceNumeric: product.priceNumeric,
                  priceCurrency: product.priceCurrency,
                  priceType: product.priceType,
                  asin: product.asin,
                  trendCategory: product.trendCategory,
                  videoCount: product.videoCount,
                  growthPercentage: product.growthPercentage,
                  trendMomentum: product.trendMomentum
                },
                rawData: {
                  sourceUrl: product.sourceUrl,
                  perplexityNotes: product.perplexityNotes,
                  fetchedAt: product.fetchedAt
                }
              };

              await storage.saveTrendHistory(historyEntry);
            }
            console.log(`💾 Saved AI trending picks for ${niche} to history via /products endpoint`);
          }
        }
      } catch (saveError) {
        console.error('❌ Error saving AI trending picks to history via /products endpoint:', saveError);
        // Don't fail the main request if saving fails
      }
    }

    res.json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products from storage:", error);
    res.status(500).json({
      error: "Failed to fetch trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as trendingRouter };