import { Router } from "express";
import { getTrendForecast } from "../services/perplexity/trendForecaster";
import { Niche, NICHES } from "@shared/constants";
import { storage } from "../storage";

const router = Router();

// GET /api/trend-forecast/:niche - Get trend forecast for a specific niche
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

    console.log(`🔍 Fetching trend forecast for niche: ${niche}`);
    
    const forecastResult = await getTrendForecast(niche as Niche);
    
    // Extract trends and dataSource metadata
    const { dataSource, ...trends } = forecastResult;
    
    // Save trend forecast results to history
    try {
      // Clear existing trend forecast data for this niche to keep only the latest generation
      console.log(`🗑️ Clearing existing trend forecast data for ${niche}...`);
      await storage.clearTrendHistoryBySourceAndNiche('trend_forecaster', niche);
      
      // Save each trend category (hot, rising, upcoming, declining)
      const savePromises = [];
      
      for (const [category, trendList] of Object.entries(trends)) {
        if (Array.isArray(trendList)) {
          for (const trend of trendList) {
            const historyEntry = {
              sourceType: 'trend_forecaster' as const,
              niche: niche,
              trendCategory: category,
              trendName: trend.name,
              trendDescription: trend.why || trend.reason || trend.opportunity || trend.prepNow || 'No description available',
              // Store products as JSON for forecaster trends (plain objects, not strings)
              productData: trend.products || null,
                      // Additional metadata as JSON (plain object, not string)
              rawData: {
                volume: trend.volume,
                growth: trend.growth,
                when: trend.when,
                why: trend.why,
                reason: trend.reason,
                opportunity: trend.opportunity,
                prepNow: trend.prepNow,
                // Include dataSource metadata for transparency
                dataSource: dataSource || null
              }
            };
            
            savePromises.push(storage.saveTrendHistory(historyEntry));
          }
        }
      }
      
      await Promise.all(savePromises);
      console.log(`💾 Saved ${savePromises.length} new trend forecast entries to history for ${niche} (replaced previous generation)`);
      
    } catch (saveError) {
      console.error('Error saving trend forecast to history:', saveError);
      // Don't fail the request if saving to history fails
    }
    
    res.json({
      success: true,
      data: {
        niche,
        trends,
        dataSource: dataSource || null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in trend forecast API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trend forecast. Please try again later."
    });
  }
});

export { router as trendForecastRouter };