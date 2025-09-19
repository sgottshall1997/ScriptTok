import { Request, Response, Router } from "express";
import { z } from "zod";
import { db } from "../../db";
import { UnifiedContentService } from "../../../shared/services/contentService";
import { ContentListParamsSchema, ContentActionSchema } from "../../../shared/types/content";

const router = Router();

// Initialize the unified content service
const unifiedContentService = new UnifiedContentService(db);

// =============================================================================
// Unified Content Management Endpoints
// =============================================================================

/**
 * POST /api/cookaing-marketing/unified-content/save
 * Save content from either GlowBot or CookAIng using unified format
 */
router.post("/save", async (req: Request, res: Response) => {
  try {
    console.log("💾 Saving unified content:", req.body);
    
    const { sourceData, sourceApp, options = {} } = req.body;
    
    if (!sourceData || !sourceApp) {
      return res.status(400).json({
        success: false,
        error: "sourceData and sourceApp are required"
      });
    }
    
    if (!['glowbot', 'cookAIng'].includes(sourceApp)) {
      return res.status(400).json({
        success: false,
        error: "sourceApp must be 'glowbot' or 'cookAIng'"
      });
    }
    
    const result = await unifiedContentService.saveContent(
      sourceData,
      sourceApp,
      {
        checkDuplicate: options.checkDuplicate || false,
        skipIfExists: options.skipIfExists || false
      }
    );
    
    res.status(result.success ? 201 : 400).json(result);
    
  } catch (error) {
    console.error("Error saving unified content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to save content"
    });
  }
});

/**
 * GET /api/cookaing-marketing/unified-content/list
 * List content with filtering and pagination
 */
router.get("/list", async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const params = ContentListParamsSchema.parse(req.query);
    
    const result = await unifiedContentService.listContent(params);
    
    res.json(result);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid query parameters",
        details: error.issues
      });
    }
    
    console.error("Error listing unified content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to list content"
    });
  }
});

/**
 * GET /api/cookaing-marketing/unified-content/:id
 * Get specific content by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }
    
    const result = await unifiedContentService.getContent(id);
    
    res.status(result.success ? 200 : 404).json(result);
    
  } catch (error) {
    console.error("Error getting unified content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get content"
    });
  }
});

/**
 * POST /api/cookaing-marketing/unified-content/:id/rate
 * Rate content
 */
router.post("/:id/rate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }
    
    const result = await unifiedContentService.rateContent(id, rating);
    
    res.status(result.success ? 200 : 404).json(result);
    
  } catch (error) {
    console.error("Error rating unified content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to rate content"
    });
  }
});

/**
 * POST /api/cookaing-marketing/unified-content/:id/favorite
 * Toggle favorite status
 */
router.post("/:id/favorite", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }
    
    const result = await unifiedContentService.toggleFavorite(id);
    
    res.status(result.success ? 200 : 404).json(result);
    
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle favorite"
    });
  }
});

/**
 * DELETE /api/cookaing-marketing/unified-content/:id
 * Delete content by ID
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Content ID is required"
      });
    }
    
    const result = await unifiedContentService.deleteContent(id);
    
    res.status(result.success ? 200 : 404).json(result);
    
  } catch (error) {
    console.error("Error deleting unified content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete content"
    });
  }
});

/**
 * POST /api/cookaing-marketing/unified-content/bulk-delete
 * Bulk delete content by IDs
 */
router.post("/bulk-delete", async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "ids array is required and must not be empty"
      });
    }
    
    // Validate that all IDs are strings
    if (!ids.every(id => typeof id === 'string')) {
      return res.status(400).json({
        success: false,
        error: "All IDs must be strings"
      });
    }
    
    const result = await unifiedContentService.bulkDeleteContent(ids);
    
    res.json(result);
    
  } catch (error) {
    console.error("Error bulk deleting unified content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to bulk delete content"
    });
  }
});

/**
 * GET /api/cookaing-marketing/unified-content/stats
 * Get content statistics
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { source_app } = req.query;
    
    let sourceApp: 'glowbot' | 'cookAIng' | undefined;
    if (source_app) {
      if (!['glowbot', 'cookAIng'].includes(source_app as string)) {
        return res.status(400).json({
          success: false,
          error: "source_app must be 'glowbot' or 'cookAIng'"
        });
      }
      sourceApp = source_app as 'glowbot' | 'cookAIng';
    }
    
    const stats = await unifiedContentService.getContentStats(sourceApp);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error("Error getting unified content stats:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get content stats"
    });
  }
});

// =============================================================================
// Content Migration Endpoints
// =============================================================================

/**
 * POST /api/cookaing-marketing/unified-content/migrate-glowbot
 * Migrate existing GlowBot content to unified system
 */
router.post("/migrate-glowbot", async (req: Request, res: Response) => {
  try {
    console.log("🚀 Starting GlowBot content migration to unified system");
    
    // This would be implemented to read existing GlowBot content and migrate it
    // For now, return a placeholder response
    res.json({
      success: true,
      message: "GlowBot content migration endpoint ready (implementation pending)",
      migrated: 0
    });
    
  } catch (error) {
    console.error("Error migrating GlowBot content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to migrate GlowBot content"
    });
  }
});

/**
 * POST /api/cookaing-marketing/unified-content/migrate-cookaing
 * Migrate existing CookAIng content to unified system
 */
router.post("/migrate-cookaing", async (req: Request, res: Response) => {
  try {
    console.log("🚀 Starting CookAIng content migration to unified system");
    
    // This would be implemented to read existing CookAIng content and migrate it
    // For now, return a placeholder response
    res.json({
      success: true,
      message: "CookAIng content migration endpoint ready (implementation pending)",
      migrated: 0
    });
    
  } catch (error) {
    console.error("Error migrating CookAIng content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to migrate CookAIng content"
    });
  }
});

// =============================================================================
// Testing & Debugging Endpoints
// =============================================================================

/**
 * POST /api/cookaing-marketing/unified-content/test-save
 * Test endpoint for saving mock content
 */
router.post("/test-save", async (req: Request, res: Response) => {
  try {
    const { sourceApp = 'cookAIng' } = req.body;
    
    // Create mock content for testing
    const mockContent = {
      id: `test-${Date.now()}`,
      title: "Test Content",
      body: "This is test content generated for unified system testing",
      blocks: {
        main: "Test main content",
        platforms: {
          instagram: "Test Instagram caption #test",
          tiktok: "Test TikTok script"
        }
      },
      metadata: {
        niche: "test",
        template: "test_template",
        platform: "instagram",
        aiModel: "test-model"
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const result = await unifiedContentService.saveContent(
      mockContent,
      sourceApp as 'glowbot' | 'cookAIng'
    );
    
    res.json({
      ...result,
      testData: mockContent
    });
    
  } catch (error) {
    console.error("Error testing unified content save:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to test save"
    });
  }
});

export default router;