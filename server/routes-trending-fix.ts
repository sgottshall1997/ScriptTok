import { Router } from "express";
import { getRefreshedTrendingProducts, refreshTrendingProducts } from "./services/trendRefresher";

const router = Router();

// Get all trending products
router.get("/", async (req, res) => {
  try {
    // Use the trend refresher service to get dynamically updated trending products
    const trendingProducts = await getRefreshedTrendingProducts();
    res.json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ 
      error: "Failed to fetch trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get trending products from storage
router.get("/products", async (req, res) => {
  try {
    // Use the same trend refresher service to maintain consistency
    const trendingProducts = await getRefreshedTrendingProducts();
    res.json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
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

export { router as trendingApiRouter };