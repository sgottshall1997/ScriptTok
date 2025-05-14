import { Router } from "express";
import { storage } from "../storage";
import { getAllTrendingProducts } from "../scrapers";
import { ScraperPlatform, SCRAPER_PLATFORMS } from "../../shared/constants";
import { getAmazonTrending } from "../scrapers/amazon";
import { getTikTokTrending } from "../scrapers/tiktok";
import { getYouTubeTrending } from "../scrapers/youtube";
import { getInstagramTrending } from "../scrapers/instagram";
import { getRedditTrending } from "../scrapers/reddit";

const router = Router();

// Get all trending products
router.get("/", async (req, res) => {
  try {
    const trendingProducts = await storage.getTrendingProducts();
    res.json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ 
      error: "Failed to fetch trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Refresh trending products from all scrapers
router.post("/refresh", async (req, res) => {
  try {
    // Fetch fresh trending data from all scrapers
    const trendingData = await getAllTrendingProducts();
    
    // Clear existing trending products
    await storage.clearTrendingProducts();
    
    // Save new trending products
    if (trendingData && trendingData.products && Array.isArray(trendingData.products)) {
      for (const product of trendingData.products) {
        await storage.saveTrendingProduct(product);
      }
    }
    
    // Update scraper status
    if (trendingData && trendingData.platforms && Array.isArray(trendingData.platforms)) {
      for (const scraper of trendingData.platforms) {
        await storage.updateScraperStatus(scraper.name, scraper.status);
      }
    }
    
    res.json({ 
      success: true, 
      count: trendingData?.products?.length || 0,
      message: "Trending products refreshed successfully" 
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

export { router as trendingRouter };
