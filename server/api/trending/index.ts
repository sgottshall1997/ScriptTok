import express from 'express';
import { getAllTrendingProducts } from '../../scrapers';
import { refreshTrendingProducts, getTrendingProductsRefreshTime } from '../../services/trendRefresher';
import { getAllNichesTrendingProducts } from './all';

const router = express.Router();

// Get trending products for a specific niche
router.get('/:niche', async (req, res) => {
  try {
    const niche = req.params.niche;
    const { products, platforms } = await getAllTrendingProducts(niche);
    
    // Get refresh time information
    const { lastRefresh, nextRefresh } = getTrendingProductsRefreshTime();
    
    res.json({
      products,
      platforms,
      lastRefresh: lastRefresh.toISOString(),
      nextScheduledRefresh: nextRefresh
    });
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ 
      error: "Failed to fetch trending products",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get trending products for all niches (for dashboard)
router.get('/', getAllNichesTrendingProducts);

// Manually trigger a refresh of trending products
router.post('/refresh', async (req, res) => {
  try {
    await refreshTrendingProducts();
    
    // Get refresh time information
    const { lastRefresh, nextRefresh } = getTrendingProductsRefreshTime();
    
    res.json({
      success: true,
      message: "Trending products refreshed successfully",
      lastRefresh: lastRefresh.toISOString(),
      nextScheduledRefresh: nextRefresh
    });
  } catch (error) {
    console.error("Error refreshing trending products:", error);
    res.status(500).json({ 
      error: "Failed to refresh trending products",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export const trendingRouter = router;