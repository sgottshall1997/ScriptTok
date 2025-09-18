import { Request, Response, Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { bufferService, schedulePostSchema } from "../../cookaing-marketing/integrations/social.buffer";

const router = Router();

// POST /api/cookaing-marketing/social/schedule
router.post("/schedule", async (req: Request, res: Response) => {
  console.log('📱 Social schedule request received:', req.body);
  
  try {
    const validatedData = schedulePostSchema.parse(req.body);
    const { campaignId, scheduledAt, profileIds } = validatedData;
    
    // Get campaign
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    // Get social content from campaign artifacts
    const artifacts = await storage.getCampaignArtifacts(campaignId);
    const socialArtifacts = artifacts.filter((a: any) => a.channel === "social");
    
    if (socialArtifacts.length === 0) {
      return res.status(400).json({ 
        error: "No social content found for this campaign. Please generate social content first." 
      });
    }
    
    // Get Buffer profiles to use
    let targetProfiles = profileIds;
    if (!targetProfiles || targetProfiles.length === 0) {
      const profiles = await bufferService.getProfiles();
      targetProfiles = profiles.map(p => p.id);
    }
    
    const scheduledPosts = [];
    
    // Schedule each social artifact
    for (const artifact of socialArtifacts) {
      const content = artifact.payloadJson as any;
      const postText = content.content || content.text || content.caption || '';
      
      if (!postText) {
        console.warn('⚠️ Empty content for artifact:', artifact.id);
        continue;
      }
      
      try {
        const updateRequest = {
          text: postText,
          profile_ids: targetProfiles,
          scheduled_at: scheduledAt ? Math.floor(new Date(scheduledAt).getTime() / 1000) : undefined,
          shorten: true,
          // Add media if available
          media: content.media ? {
            link: content.media.url,
            description: content.media.description,
            title: content.media.title
          } : undefined
        };
        
        const bufferUpdates = await bufferService.scheduleUpdate(updateRequest);
        
        scheduledPosts.push({
          artifact: {
            id: artifact.id,
            variant: artifact.variant,
            channel: artifact.channel
          },
          buffer_updates: bufferUpdates,
          scheduled_at: scheduledAt,
          profiles: targetProfiles
        });
        
        console.log('✅ Scheduled Buffer updates:', bufferUpdates.length);
        
      } catch (error) {
        console.error('❌ Failed to schedule artifact:', artifact.id, error);
        // Continue with other artifacts
      }
    }
    
    // Update campaign metadata with scheduled post information
    const currentMeta = campaign.metaJson || {};
    const updatedMeta = {
      ...currentMeta,
      social_scheduling: {
        ...currentMeta.social_scheduling,
        scheduled_at: scheduledAt,
        posts: scheduledPosts,
        last_scheduled: new Date().toISOString()
      }
    };
    
    await storage.updateCampaign(campaignId, {
      metaJson: updatedMeta
    });
    
    // Record analytics event
    await storage.insertAnalyticsEvent({
      orgId: campaign.orgId,
      eventType: 'social_scheduled',
      eventData: {
        campaign_id: campaignId,
        platform: 'buffer',
        posts_scheduled: scheduledPosts.length,
        profiles: targetProfiles,
        scheduled_at: scheduledAt
      }
    });
    
    res.json({
      success: true,
      campaign_id: campaignId,
      posts_scheduled: scheduledPosts.length,
      scheduled_posts: scheduledPosts,
      scheduled_at: scheduledAt
    });
    
  } catch (error) {
    console.error('❌ Social scheduling error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }
    
    return res.status(500).json({
      error: "Failed to schedule social posts",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/social/status/:campaignId
router.get("/status/:campaignId", async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const meta = campaign.metaJson || {};
    const socialScheduling = meta.social_scheduling;
    
    if (!socialScheduling?.posts) {
      return res.json({
        campaign_id: campaignId,
        status: 'not_scheduled',
        posts: []
      });
    }
    
    // Check status of scheduled posts
    const postsStatus = [];
    
    for (const post of socialScheduling.posts) {
      const postStatus = {
        artifact_id: post.artifact.id,
        variant: post.artifact.variant,
        updates: []
      };
      
      // Check each Buffer update status
      for (const update of post.buffer_updates) {
        try {
          const bufferStatus = await bufferService.getUpdate(update.id);
          postStatus.updates.push({
            id: update.id,
            profile_id: update.profile_id,
            status: bufferStatus.status,
            sent_at: bufferStatus.sent_at,
            due_time: bufferStatus.due_time
          });
        } catch (error) {
          console.error('❌ Failed to check Buffer update status:', update.id, error);
          postStatus.updates.push({
            id: update.id,
            profile_id: update.profile_id,
            status: 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      postsStatus.push(postStatus);
    }
    
    res.json({
      campaign_id: campaignId,
      status: 'scheduled',
      scheduled_at: socialScheduling.scheduled_at,
      last_scheduled: socialScheduling.last_scheduled,
      posts: postsStatus
    });
    
  } catch (error) {
    console.error('❌ Social status check error:', error);
    res.status(500).json({
      error: "Failed to check social status",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;