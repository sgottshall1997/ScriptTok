import { Router } from "express";
import { getProductResearch, getCompetitorIntel } from "../services/perplexity/productResearch";
import { Niche, NICHES } from "@shared/constants";

const router = Router();

// POST /api/product-research/research - Get product research data
router.post("/research", async (req, res) => {
  try {
    const { product, niche } = req.body;
    
    // Validate input
    if (!product || typeof product !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Product name is required"
      });
    }

    if (!niche || !NICHES.includes(niche as Niche)) {
      return res.status(400).json({
        success: false,
        error: "Valid niche is required. Must be one of: " + NICHES.join(", ")
      });
    }

    console.log(`🔍 Researching product: ${product} in ${niche} niche`);
    
    const research = await getProductResearch(product.trim(), niche as Niche);
    
    res.json({
      success: true,
      data: {
        product,
        niche,
        research,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in product research API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product research. Please try again later."
    });
  }
});

// POST /api/product-research/competitors - Get competitor intelligence
router.post("/competitors", async (req, res) => {
  try {
    const { product, niche } = req.body;
    
    // Validate input
    if (!product || typeof product !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Product name is required"
      });
    }

    if (!niche || !NICHES.includes(niche as Niche)) {
      return res.status(400).json({
        success: false,
        error: "Valid niche is required. Must be one of: " + NICHES.join(", ")
      });
    }

    console.log(`🎯 Analyzing competitors for: ${product} in ${niche} niche`);
    
    const competitors = await getCompetitorIntel(product.trim(), niche as Niche);
    
    res.json({
      success: true,
      data: {
        product,
        niche,
        competitors,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Error in competitor intel API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch competitor intelligence. Please try again later."
    });
  }
});

export { router as productResearchRouter };