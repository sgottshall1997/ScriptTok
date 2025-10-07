import { Router } from "express";
import { getTrendForecast } from "../services/perplexity/trendForecaster";
import { Niche, NICHES } from "@shared/constants";
import { storage } from "../storage";

const router = Router();

// GET /api/trend-forecast/:niche - Get cached trend forecast for a specific niche
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

    console.log(`🔍 Reading cached trend forecast for niche: ${niche}`);
    
    // Read from trendHistory cache
    const cachedTrends = await storage.getTrendHistoryBySourceAndNiche(
      'trend_forecaster',
      niche,
      50,
      0
    );

    if (cachedTrends.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No cached trend forecast available for ${niche}. Run daily trend fetcher first.`,
        niche
      });
    }

    // Extract lastUpdated from newest entry
    const lastUpdated = cachedTrends[0].fetchedAt;
    
    // Reconstruct trends object from cached data
    const trends: any = {
      hot: [],
      rising: [],
      upcoming: [],
      declining: []
    };

    let dataSource = null;

    for (const entry of cachedTrends) {
      const category = entry.trendCategory || 'hot';
      
      if (!trends[category]) {
        trends[category] = [];
      }

      // Reconstruct trend object
      const trend: any = {
        name: entry.trendName || '',
        products: entry.productData || []
      };

      // Add category-specific fields from rawData
      if (entry.rawData) {
        const raw = entry.rawData as any;
        if (raw.volume) trend.volume = raw.volume;
        if (raw.growth) trend.growth = raw.growth;
        if (raw.when) trend.when = raw.when;
        if (raw.why) trend.why = raw.why;
        if (raw.reason) trend.reason = raw.reason;
        if (raw.opportunity) trend.opportunity = raw.opportunity;
        if (raw.prepNow) trend.prepNow = raw.prepNow;
        
        // Extract dataSource from first entry
        if (!dataSource && raw.dataSource) {
          dataSource = raw.dataSource;
        }
      }

      trends[category].push(trend);
    }

    res.json({
      success: true,
      data: {
        niche,
        trends,
        dataSource: dataSource || { type: 'cached', reliability: 'unknown' },
        lastUpdated: lastUpdated,
        source: 'cached'
      }
    });

  } catch (error) {
    console.error("Error reading trend forecast from cache:", error);
    res.status(500).json({
      success: false,
      error: "Failed to read cached trend forecast. Please try again later."
    });
  }
});

export { router as trendForecastRouter };