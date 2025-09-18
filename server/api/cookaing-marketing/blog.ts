import { Request, Response, Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { notionService, publishBlogSchema } from "../../cookaing-marketing/integrations/blog.notion";

const router = Router();

// POST /api/cookaing-marketing/blog/publish
router.post("/publish", async (req: Request, res: Response) => {
  console.log('📝 Blog publish request received:', req.body);
  
  try {
    const validatedData = publishBlogSchema.parse(req.body);
    const { campaignId, title, status = 'Draft' } = validatedData;
    
    // Get campaign
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    // Get blog content from campaign artifacts
    const artifacts = await storage.getCampaignArtifacts(campaignId);
    const blogArtifact = artifacts.find((a: any) => a.channel === "blog");
    
    // In development mode, allow publishing even without content (mock mode)
    if (!blogArtifact && process.env.NODE_ENV !== 'development') {
      return res.status(400).json({ 
        error: "No blog content found for this campaign. Please generate blog content first." 
      });
    }
    
    // Generate mock content if no artifact exists (development mode)
    let content;
    if (!blogArtifact && process.env.NODE_ENV === 'development') {
      console.log('🔄 No blog artifact found, using mock content for development');
      content = {
        title: campaign.name,
        content: `This is a comprehensive blog post about ${campaign.name}. This campaign represents our latest marketing initiative designed to engage our audience with compelling content and drive meaningful results.\n\nKey highlights of this campaign include innovative strategies, targeted messaging, and measurable outcomes that will help grow our brand presence.`,
        body: `## About ${campaign.name}\n\nThis campaign showcases our commitment to excellence in marketing communications.`
      };
    } else {
      content = blogArtifact?.payloadJson as any || {};
    }
    
    const blogTitle = title || content.title || campaign.name;
    const blogContent = content.content || content.body || '';
    
    if (!blogContent) {
      return res.status(400).json({ 
        error: "Blog content is empty. Please generate blog content first." 
      });
    }
    
    try {
      // Prepare metadata
      const metadata = {
        campaign_id: campaignId,
        channel: blogArtifact?.channel || 'blog',
        variant: blogArtifact?.variant || 'A',
        tags: content.tags || [],
        author: content.author || 'CookAIng Team',
        publishDate: status === 'Published' ? new Date().toISOString() : undefined,
        ...content.metadata
      };
      
      // Create Notion page
      console.log('📝 Creating Notion page:', { title: blogTitle, status });
      const notionPage = await notionService.createBlogPage(
        blogTitle,
        blogContent,
        status,
        metadata
      );
      
      console.log('✅ Notion page created:', notionPage.id);
      
      // Update campaign metadata with published blog information
      const currentMeta = campaign.metaJson || {};
      const updatedMeta = {
        ...currentMeta,
        blog_publishing: {
          ...currentMeta.blog_publishing,
          notion_page_id: notionPage.id,
          notion_url: notionPage.url,
          public_url: notionPage.public_url,
          title: blogTitle,
          status: status,
          published_at: new Date().toISOString(),
          artifact_id: blogArtifact?.id || 'mock-blog-artifact',
          variant: blogArtifact?.variant || 'A'
        }
      };
      
      await storage.updateCampaign(campaignId, {
        metaJson: updatedMeta
      });
      
      // Record analytics event - skip in development mode
      if (process.env.NODE_ENV !== 'development') {
        try {
          await storage.createAnalyticsEvent({
            eventType: 'blog_published',
            metadata: {
              orgId: campaign.orgId,
              campaign_id: campaignId,
              platform: 'notion',
              page_id: notionPage.id,
              title: blogTitle,
              status: status,
              url: notionPage.url,
              public_url: notionPage.public_url
            }
          });
        } catch (error) {
          console.warn('⚠️ Failed to log analytics event:', error);
        }
      }
      
      res.json({
        success: true,
        campaign_id: campaignId,
        notion_page: {
          id: notionPage.id,
          url: notionPage.url,
          public_url: notionPage.public_url,
          title: blogTitle,
          status: status,
          created_time: notionPage.created_time
        }
      });
      
    } catch (error) {
      console.error('❌ Notion page creation failed:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Blog publishing error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }
    
    return res.status(500).json({
      error: "Failed to publish blog",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// PATCH /api/cookaing-marketing/blog/status
router.patch("/status", async (req: Request, res: Response) => {
  console.log('📝 Blog status update request:', req.body);
  
  try {
    const { campaignId, status } = req.body;
    
    if (!campaignId || !status) {
      return res.status(400).json({ 
        error: "campaignId and status are required" 
      });
    }
    
    const storage = getStorage();
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const meta = campaign.metaJson || {};
    const blogPublishing = meta.blog_publishing;
    
    if (!blogPublishing?.notion_page_id) {
      return res.status(400).json({ 
        error: "No published blog found for this campaign" 
      });
    }
    
    // Update Notion page status
    const updatedPage = await notionService.updatePageStatus(
      blogPublishing.notion_page_id,
      status
    );
    
    // Update campaign metadata
    const updatedMeta = {
      ...meta,
      blog_publishing: {
        ...blogPublishing,
        status: status,
        last_updated: new Date().toISOString()
      }
    };
    
    await storage.updateCampaign(campaignId, {
      metaJson: updatedMeta
    });
    
    // Record analytics event - skip in development mode
    if (process.env.NODE_ENV !== 'development') {
      try {
        await storage.createAnalyticsEvent({
          eventType: 'blog_status_updated',
          metadata: {
            orgId: campaign.orgId,
            campaign_id: campaignId,
            platform: 'notion',
            page_id: blogPublishing.notion_page_id,
            old_status: blogPublishing.status,
            new_status: status
          }
        });
      } catch (error) {
        console.warn('⚠️ Failed to log analytics event:', error);
      }
    }
    
    res.json({
      success: true,
      campaign_id: campaignId,
      page_id: blogPublishing.notion_page_id,
      status: status,
      updated_at: updatedPage.last_edited_time
    });
    
  } catch (error) {
    console.error('❌ Blog status update error:', error);
    res.status(500).json({
      error: "Failed to update blog status",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/blog/status/:campaignId
router.get("/status/:campaignId", async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const storage = getStorage();
    
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const meta = campaign.metaJson || {};
    const blogPublishing = meta.blog_publishing;
    
    if (!blogPublishing) {
      return res.json({
        campaign_id: campaignId,
        status: 'not_published',
        blog: null
      });
    }
    
    res.json({
      campaign_id: campaignId,
      status: 'published',
      blog: {
        notion_page_id: blogPublishing.notion_page_id,
        notion_url: blogPublishing.notion_url,
        public_url: blogPublishing.public_url,
        title: blogPublishing.title,
        status: blogPublishing.status,
        published_at: blogPublishing.published_at,
        last_updated: blogPublishing.last_updated,
        artifact_id: blogPublishing.artifact_id,
        variant: blogPublishing.variant
      }
    });
    
  } catch (error) {
    console.error('❌ Blog status check error:', error);
    res.status(500).json({
      error: "Failed to check blog status",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;