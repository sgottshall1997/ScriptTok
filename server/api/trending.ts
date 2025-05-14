import { Router } from "express";
import { storage } from "../storage";
import { getAllTrendingProducts } from "../scrapers";

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

export { router as trendingRouter };
