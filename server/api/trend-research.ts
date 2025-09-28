import { Router } from "express";
import { getTrendResearch, getTrendCompetitors } from "../services/perplexity/trendResearch";
import { Niche, NICHES } from "@shared/constants";

const router = Router();

// POST /api/trend-research/research - Get trend research data
router.post("/research", async (req, res) => {
  try {
    const { topic, niche } = req.body;
    
    // Validate input
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Trend topic is required"
      });
    }

    // Niche is optional for viral trends, but validate if provided
    if (niche && niche !== 'universal' && !NICHES.includes(niche as Niche)) {
      return res.status(400).json({
        success: false,
        error: "Invalid niche. Must be one of: " + NICHES.join(", ") + ", or 'universal'"
      });
    }

    console.log(`🔥 Researching viral trend: ${topic}${niche ? ` in ${niche} niche` : ' (universal)'}`);
    
    const research = await getTrendResearch(topic.trim(), niche);
    
    res.json({
      success: true,
      data: {
        topic,
        niche: niche || 'universal',
        research,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in trend research API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trend research. Please try again later."
    });
  }
});

// POST /api/trend-research/competitors - Get trending competitor videos
router.post("/competitors", async (req, res) => {
  try {
    const { topic, niche } = req.body;
    
    // Validate input
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Trend topic is required"
      });
    }

    // Niche is optional for viral trends, but validate if provided
    if (niche && niche !== 'universal' && !NICHES.includes(niche as Niche)) {
      return res.status(400).json({
        success: false,
        error: "Invalid niche. Must be one of: " + NICHES.join(", ") + ", or 'universal'"
      });
    }

    console.log(`🎯 Analyzing competitors for trend: ${topic}${niche ? ` in ${niche} niche` : ' (universal)'}`);
    
    const competitors = await getTrendCompetitors(topic.trim(), niche);
    
    res.json({
      success: true,
      data: {
        topic,
        niche: niche || 'universal',
        competitors,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in trend competitor intel API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trend competitor intelligence. Please try again later."
    });
  }
});

export { router as trendResearchRouter };