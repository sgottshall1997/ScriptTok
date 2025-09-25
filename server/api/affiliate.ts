import { Router } from "express";
import { storage } from "../storage";
import { affiliateLinkInjector } from "../services/affiliateLinkInjector";
import { z } from "zod";

const router = Router();

// Inject affiliate links into content
const injectLinksSchema = z.object({
  content: z.string().min(1),
  contentId: z.number(),
  contentType: z.string(),
  userId: z.number(),
  niche: z.string().optional(),
  maxLinksPerContent: z.number().min(1).max(10).optional(),
  onlyFirstMention: z.boolean().optional(),
  skipIfExists: z.boolean().optional()
});

router.post("/inject-links", async (req, res) => {
  try {
    const data = injectLinksSchema.parse(req.body);
    
    const result = await affiliateLinkInjector.injectAffiliateLinksSmart(
      data.content,
      data.contentId,
      data.contentType,
      data.userId,
      {
        niche: data.niche,
        maxLinksPerContent: data.maxLinksPerContent,
        onlyFirstMention: data.onlyFirstMention,
        skipIfExists: data.skipIfExists
      }
    );

    res.json({
      success: true,
      data: result,
      message: `Successfully injected ${result.linksInjected} affiliate links`
    });
  } catch (error) {
    console.error("❌ Error injecting affiliate links:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to inject affiliate links"
    });
  }
});

// Bulk process existing content for affiliate links
const bulkProcessSchema = z.object({
  contentItems: z.array(z.object({
    id: z.number(),
    content: z.string(),
    type: z.string(),
    userId: z.number(),
    niche: z.string().optional()
  })),
  maxLinksPerContent: z.number().min(1).max(10).optional(),
  onlyFirstMention: z.boolean().optional(),
  skipIfExists: z.boolean().optional(),
  batchSize: z.number().min(1).max(50).optional()
});

router.post("/bulk-process", async (req, res) => {
  try {
    const data = bulkProcessSchema.parse(req.body);
    
    const result = await affiliateLinkInjector.processBulkContent(
      data.contentItems,
      {
        maxLinksPerContent: data.maxLinksPerContent,
        onlyFirstMention: data.onlyFirstMention,
        skipIfExists: data.skipIfExists,
        batchSize: data.batchSize
      }
    );

    res.json({
      success: true,
      data: result,
      message: `Processed ${result.processed} content items, ${result.successful} successful`
    });
  } catch (error) {
    console.error("❌ Error processing bulk content:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to process bulk content"
    });
  }
});

// Get affiliate links for specific content
router.get("/links/:contentType/:contentId", async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    
    const links = await storage.getAffiliateLinksByContent(
      parseInt(contentId), 
      contentType
    );

    res.json({
      success: true,
      data: links,
      count: links.length
    });
  } catch (error) {
    console.error("❌ Error fetching affiliate links:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch affiliate links"
    });
  }
});

// Track affiliate link click
router.post("/track-click/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    await storage.incrementAffiliateLinkClicks(trackingId);
    
    // Get the affiliate link to redirect
    const affiliateLink = await storage.getAffiliateLinkByTrackingId(trackingId);
    
    if (!affiliateLink) {
      return res.status(404).json({
        success: false,
        error: "Affiliate link not found"
      });
    }

    res.json({
      success: true,
      redirectUrl: affiliateLink.affiliateUrl,
      message: "Click tracked successfully"
    });
  } catch (error) {
    console.error("❌ Error tracking click:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to track click"
    });
  }
});

// Get affiliate link analytics
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform, isActive, limit } = req.query;
    
    const links = await storage.getAffiliateLinks({
      userId: parseInt(userId),
      platform: platform as string,
      isActive: isActive === 'true',
      limit: limit ? parseInt(limit as string) : undefined
    });

    // Calculate analytics
    const analytics = {
      totalLinks: links.length,
      activeLinks: links.filter(l => l.isActive).length,
      totalClicks: links.reduce((sum, l) => sum + l.clickCount, 0),
      totalConversions: links.reduce((sum, l) => sum + l.conversionCount, 0),
      totalEarnings: links.reduce((sum, l) => sum + l.totalEarnings, 0),
      averageConversionRate: links.length > 0 
        ? links.reduce((sum, l) => sum + (l.clickCount > 0 ? l.conversionCount / l.clickCount : 0), 0) / links.length 
        : 0,
      topPerformingLinks: links
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 10)
    };

    res.json({
      success: true,
      data: {
        analytics,
        links: links.slice(0, 100) // Limit response size
      }
    });
  } catch (error) {
    console.error("❌ Error fetching affiliate analytics:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics"
    });
  }
});

// Update affiliate link
const updateLinkSchema = z.object({
  affiliateUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  conversionCount: z.number().min(0).optional(),
  totalEarnings: z.number().min(0).optional()
});

router.patch("/links/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    const updates = updateLinkSchema.parse(req.body);
    
    const updatedLink = await storage.updateAffiliateLink(
      parseInt(linkId),
      updates
    );

    if (!updatedLink) {
      return res.status(404).json({
        success: false,
        error: "Affiliate link not found"
      });
    }

    res.json({
      success: true,
      data: updatedLink,
      message: "Affiliate link updated successfully"
    });
  } catch (error) {
    console.error("❌ Error updating affiliate link:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update affiliate link"
    });
  }
});

// Delete affiliate link
router.delete("/links/:linkId", async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const success = await storage.deleteAffiliateLink(parseInt(linkId));
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: "Affiliate link not found"
      });
    }

    res.json({
      success: true,
      message: "Affiliate link deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting affiliate link:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete affiliate link"
    });
  }
});

// Get revenue tracking for user
router.get("/revenue/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get total revenue
    const totalRevenue = await storage.getTotalRevenue(parseInt(userId));
    
    // Get monthly revenue if dates provided
    let monthlyRevenue = 0;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      const revenues = await storage.getRevenueTrackingByDateRange(start, end);
      monthlyRevenue = revenues
        .filter(r => !r.isReturned)
        .reduce((sum, r) => sum + r.commissionAmount, 0);
    }
    
    // Get top earning products
    const topProducts = await storage.getTopEarningProducts(10);

    res.json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        topProducts,
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error("❌ Error fetching revenue data:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch revenue data"
    });
  }
});

export default router;