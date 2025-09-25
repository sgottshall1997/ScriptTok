import { Router } from "express";
import { getTrendForecast } from "../services/perplexity/trendForecaster";
import { Niche, NICHES } from "@shared/constants";

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
    
    const trends = await getTrendForecast(niche as Niche);
    
    res.json({
      success: true,
      data: {
        niche,
        trends,
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