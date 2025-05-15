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
      popularProducts,
      nicheUsage
    ] = await Promise.all([
      storage.getTemplateUsageStats(),
      storage.getToneUsageStats(),
      storage.getGenerationTrends(),
      storage.getPopularProducts(),
      storage.getNicheUsageStats()
    ]);
    
    // Return combined analytics data
    res.json({
      templateUsage,
      toneUsage,
      generationTrends,
      popularProducts,
      nicheUsage
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

/**
 * GET /api/analytics/niche/:niche
 * Retrieves analytics data for a specific niche
 */
router.get("/niche/:niche", async (req, res) => {
  try {
    const { niche } = req.params;
    
    // Gather niche-specific analytics
    const [
      templateUsage,
      toneUsage,
      generationTrends,
      popularProducts
    ] = await Promise.all([
      storage.getTemplateUsageByNiche(niche),
      storage.getToneUsageByNiche(niche),
      storage.getGenerationTrendsByNiche(niche),
      storage.getPopularProductsByNiche(niche)
    ]);
    
    res.json({
      niche,
      templateUsage,
      toneUsage,
      generationTrends,
      popularProducts
    });
  } catch (error) {
    console.error(`Error fetching analytics for niche ${req.params.niche}:`, error);
    res.status(500).json({ 
      error: "Failed to fetch niche analytics data", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * GET /api/analytics/templates/custom
 * Retrieves all custom templates
 */
router.get("/templates/custom", async (_req, res) => {
  try {
    const customTemplates = await storage.getCustomTemplates();
    res.json(customTemplates);
  } catch (error) {
    console.error("Error fetching custom templates:", error);
    res.status(500).json({ 
      error: "Failed to fetch custom templates", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * POST /api/analytics/templates/custom
 * Saves a new custom template
 */
router.post("/templates/custom", async (req, res) => {
  try {
    const { name, content, niche } = req.body;
    
    if (!name || !content || !niche) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        details: "Name, content, and niche are required" 
      });
    }
    
    const customTemplate = await storage.saveCustomTemplate({ name, content, niche });
    res.status(201).json(customTemplate);
  } catch (error) {
    console.error("Error saving custom template:", error);
    res.status(500).json({ 
      error: "Failed to save custom template", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * DELETE /api/analytics/templates/custom/:id
 * Deletes a custom template
 */
router.delete("/templates/custom/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: "Invalid ID", 
        details: "ID must be a number" 
      });
    }
    
    const success = await storage.deleteCustomTemplate(id);
    
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ 
        error: "Template not found", 
        details: `No template found with ID ${id}` 
      });
    }
  } catch (error) {
    console.error(`Error deleting custom template ${req.params.id}:`, error);
    res.status(500).json({ 
      error: "Failed to delete custom template", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export { router as analyticsRouter };