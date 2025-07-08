import { Router, Request, Response } from "express";
import { WebhookService } from "../services/webhookService";

const router = Router();

// Test webhook endpoint
router.post("/test", async (req: Request, res: Response) => {
  try {
    const webhookService = new WebhookService();
    
    // Test payload
    const testPayload = {
      platformContent: {
        tiktok: {
          caption: "Test caption for TikTok",
          script: "This is a test script",
          type: "content",
          postInstructions: "Test post instructions",
          hashtags: ["#test", "#webhook"]
        }
      },
      platformSchedules: {},
      metadata: {
        product: "Test Product",
        productName: "Test Product",
        niche: "beauty",
        tone: "Enthusiastic",
        template: "Short-Form Video Script",
        templateType: "Short-Form Video Script",
        useSmartStyle: false,
        affiliateUrl: "https://example.com/affiliate",
        topRatedStyleUsed: ""
      },
      contentData: {
        fullOutput: "This is test content",
        platformCaptions: {
          tiktok: "Test TikTok caption",
          instagram: "Test Instagram caption",
          youtube: "Test YouTube caption",
          twitter: "Test Twitter caption"
        },
        viralInspiration: null
      }
    };

    const result = await webhookService.sendMultiPlatformContent(testPayload);
    
    res.json({
      success: true,
      message: "Test webhook sent successfully",
      result: result
    });
    
  } catch (error: any) {
    console.error("Test webhook error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || error.stack
    });
  }
});

// Get webhook configuration
router.get("/config", (req: Request, res: Response) => {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  res.json({
    success: true,
    config: {
      webhookUrl: webhookUrl || "Not configured",
      enabled: !!webhookUrl
    }
  });
});

export default router;