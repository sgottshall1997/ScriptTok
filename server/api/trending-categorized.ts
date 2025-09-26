import { Router } from "express";
import { getTrendForecast, TrendForecast, TrendData } from "../services/perplexity/trendForecaster";
import { storage } from "../storage";
import { Niche, NICHES } from "@shared/constants";

const router = Router();

// Transform trend data to match the required API format
function transformTrendToApiFormat(trend: TrendData, category: 'hot' | 'rising' | 'upcoming' | 'declining') {
  const baseFormat = {
    trend: trend.name,
    reason: trend.why || trend.reason || trend.opportunity || trend.prepNow || "Trending on TikTok",
    volume: trend.volume || trend.growth || trend.when || "Growing engagement",
    products: trend.products || []
  };

  return baseFormat;
}

// GET /api/trending-categorized/:niche - Get categorized trending data with products and pricing
router.get("/:niche", async (req, res) => {
  try {
    const { niche } = req.params;
    
    // Validate niche parameter
    if (!NICHES.includes(niche as Niche)) {
      return res.status(400).json({
        success: false,
        error: "Invalid niche. Must be one of: " + NICHES.join(", ")
      });
    }

    console.log(`🔍 Fetching categorized trending data for niche: ${niche}`);
    
    // Get trend forecast data from Perplexity
    const trendForecast = await getTrendForecast(niche as Niche);
    
    // Transform the data to the required API format
    const categorizedTrends = {
      hot: trendForecast.hot.map(trend => transformTrendToApiFormat(trend, 'hot')),
      rising: trendForecast.rising.map(trend => transformTrendToApiFormat(trend, 'rising')),
      upcoming: trendForecast.upcoming.map(trend => transformTrendToApiFormat(trend, 'upcoming')),
      declining: trendForecast.declining.map(trend => transformTrendToApiFormat(trend, 'declining'))
    };

    // Optional: Enhance with database products if available
    try {
      const dbProducts = await storage.getTrendingProductsByNiche(niche, 10);
      console.log(`📊 Found ${dbProducts.length} database products for ${niche}`);
      
      // Enhance trends with database products that have pricing
      const enhanceWithDbProducts = (trends: any[]) => {
        return trends.map(trend => {
          // Find related products from database
          const relatedProducts = dbProducts.filter(product => {
            return product.title.toLowerCase().includes(trend.trend.toLowerCase()) ||
                   trend.trend.toLowerCase().includes(product.title.toLowerCase());
          });

          // Add database products to the trend if they have pricing
          const dbProductsWithPricing = relatedProducts
            .filter(product => product.price || product.priceNumeric)
            .map(product => ({
              name: product.title,
              price: product.price || `$${product.priceNumeric || 'N/A'}`,
              asin: product.asin,
              priceNumeric: product.priceNumeric,
              priceType: product.priceType || 'one-time'
            }));

          return {
            ...trend,
            products: [...(trend.products || []), ...dbProductsWithPricing]
          };
        });
      };

      categorizedTrends.hot = enhanceWithDbProducts(categorizedTrends.hot);
      categorizedTrends.rising = enhanceWithDbProducts(categorizedTrends.rising);
      categorizedTrends.upcoming = enhanceWithDbProducts(categorizedTrends.upcoming);
      categorizedTrends.declining = enhanceWithDbProducts(categorizedTrends.declining);

    } catch (dbError) {
      console.log(`⚠️ Could not enhance with database products: ${dbError}`);
    }
    
    res.json({
      success: true,
      niche,
      data: categorizedTrends,
      timestamp: new Date().toISOString(),
      stats: {
        hot: categorizedTrends.hot.length,
        rising: categorizedTrends.rising.length,
        upcoming: categorizedTrends.upcoming.length,
        declining: categorizedTrends.declining.length,
        totalProducts: [
          ...categorizedTrends.hot,
          ...categorizedTrends.rising,
          ...categorizedTrends.upcoming,
          ...categorizedTrends.declining
        ].reduce((acc, trend) => acc + (trend.products?.length || 0), 0)
      }
    });

  } catch (error) {
    console.error("Error in categorized trending API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categorized trending data. Please try again later."
    });
  }
});

// GET /api/trending-categorized - Get categorized trending data for all niches
router.get("/", async (req, res) => {
  try {
    console.log(`🔍 Fetching categorized trending data for all niches`);
    
    const allNicheData: Record<string, any> = {};
    
    // Fetch data for all niches
    for (const niche of NICHES) {
      try {
        const trendForecast = await getTrendForecast(niche as Niche);
        
        allNicheData[niche] = {
          hot: trendForecast.hot.map(trend => transformTrendToApiFormat(trend, 'hot')),
          rising: trendForecast.rising.map(trend => transformTrendToApiFormat(trend, 'rising')),
          upcoming: trendForecast.upcoming.map(trend => transformTrendToApiFormat(trend, 'upcoming')),
          declining: trendForecast.declining.map(trend => transformTrendToApiFormat(trend, 'declining'))
        };
      } catch (nicheError) {
        console.log(`⚠️ Error fetching data for ${niche}: ${nicheError}`);
        allNicheData[niche] = { hot: [], rising: [], upcoming: [], declining: [] };
      }
    }
    
    res.json({
      success: true,
      data: allNicheData,
      timestamp: new Date().toISOString(),
      niches: NICHES
    });

  } catch (error) {
    console.error("Error in all niches categorized trending API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categorized trending data for all niches. Please try again later."
    });
  }
});

export { router as trendingCategorizedRouter };