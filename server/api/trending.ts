import { Router } from "express";
import { storage } from "../storage";
import { getAllTrendingProducts } from "../scrapers";
import { ScraperPlatform, SCRAPER_PLATFORMS } from "../../shared/constants";
import { getAmazonTrending } from "../scrapers/amazon";
import { getTikTokTrending } from "../scrapers/tiktok";
import { getYouTubeTrending } from "../scrapers/youtube";
import { getInstagramTrending } from "../scrapers/instagram";
import { getRedditTrending } from "../scrapers/reddit";
import { getGoogleTrendingProducts } from "../scrapers/googleTrends";
import { 
  getRefreshedTrendingProducts, 
  refreshTrendingProducts 
} from "../services/trendRefresher";

const router = Router();

// Get all trending products
router.get("/", async (req, res) => {
  try {
    console.log("🔄 API request: Getting fresh trending products");
    
    // Force refresh to get latest categorized data
    await refreshTrendingProducts();
    const freshData = await getRefreshedTrendingProducts();
    
    console.log("📊 Fresh data structure:", JSON.stringify(freshData, null, 2));
    
    res.json(freshData);
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
    console.log("Manual refresh requested - this will force a full refresh regardless of time");
    
    // Use the refreshTrendingProducts which handles everything including storage updates
    await refreshTrendingProducts();
    const trendingProducts = await getRefreshedTrendingProducts();
    
    res.json({ 
      success: true, 
      count: trendingProducts.count,
      message: "Trending products refreshed successfully", 
      lastRefresh: new Date().toLocaleString(),
      nextScheduledRefresh: "Next automatic refresh at midnight"
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
    switch (scraperName) {
      case 'amazon':
        scraperResult = await getAmazonTrending();
        break;
      case 'tiktok':
        scraperResult = await getTikTokTrending();
        break;
      case 'youtube':
        scraperResult = await getYouTubeTrending();
        break;
      case 'instagram':
        scraperResult = await getInstagramTrending();
        break;
      case 'reddit':
        scraperResult = await getRedditTrending();
        break;
      case 'google-trends':
        scraperResult = await getGoogleTrendingProducts();
        break;
      default:
        return res.status(400).json({ error: "Unsupported platform" });
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
