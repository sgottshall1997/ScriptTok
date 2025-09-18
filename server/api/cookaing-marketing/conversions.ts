import express from "express";
import { storage } from "../../storage";

const router = express.Router();

/**
 * POST /api/cookaing-marketing/conversions
 * Track conversions with attribution data
 */
router.post("/", async (req, res) => {
  try {
    const { 
      conversionType, 
      value, 
      firstTouchAttribution, 
      lastTouchAttribution, 
      metadata 
    } = req.body;

    if (!conversionType) {
      return res.status(400).json({ error: "conversionType is required" });
    }

    console.log(`🎯 Conversion Tracked with Attribution:`, {
      conversionType,
      value,
      firstTouch: firstTouchAttribution?.utmSource || 'direct',
      lastTouch: lastTouchAttribution?.utmSource || 'direct',
      timestamp: new Date().toISOString()
    });

    // Track conversion in analytics (non-fatal)
    try {
      await storage.createAnalyticsEvent({
        orgId: 1, // Default org
        eventType: 'conversion_attribution',
        entityType: 'conversion',
        entityId: 0, // No specific entity
        metaJson: {
          conversionType,
          value,
          firstTouchAttribution,
          lastTouchAttribution,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
    } catch (analyticsError) {
      console.warn('⚠️ Failed to log conversion analytics:', analyticsError);
      // Don't fail the conversion tracking if analytics fails
    }

    res.json({
      success: true,
      message: `Conversion '${conversionType}' tracked successfully`,
      data: {
        conversionType,
        value,
        firstTouchAttribution,
        lastTouchAttribution,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Conversion Tracking Error:', error);
    res.status(500).json({
      error: "Failed to track conversion",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;