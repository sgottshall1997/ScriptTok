import { Router } from "express";
import { storage } from "../storage";

const router = Router();

/**
 * GET /api/analytics
 * Retrieves all analytics data for the dashboard
 */
router.get("/", async (_req, res) => {
  try {
    // Gather all analytics data from storage
    const [
      templateUsage,
      toneUsage,
      generationTrends,
      popularProducts
    ] = await Promise.all([
      storage.getTemplateUsageStats(),
      storage.getToneUsageStats(),
      storage.getGenerationTrends(),
      storage.getPopularProducts()
    ]);
    
    // Return combined analytics data
    res.json({
      templateUsage,
      toneUsage,
      generationTrends,
      popularProducts
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ 
      error: "Failed to fetch analytics data", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * GET /api/analytics/usage
 * Retrieves API usage statistics
 */
router.get("/usage", async (_req, res) => {
  try {
    // Gather usage metrics
    const [
      today,
      weekly,
      monthly,
      allUsage
    ] = await Promise.all([
      storage.getTodayApiUsage(),
      storage.getWeeklyApiUsage(),
      storage.getMonthlyApiUsage(),
      storage.getApiUsage()
    ]);
    
    res.json({
      today,
      weekly,
      monthly,
      history: allUsage
    });
  } catch (error) {
    console.error("Error fetching API usage data:", error);
    res.status(500).json({ 
      error: "Failed to fetch API usage data", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export { router as analyticsRouter };