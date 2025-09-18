import { Request, Response, Router } from "express";
import { z } from "zod";
import { storage } from "../../storage";
import { oneSignalService, sendPushSchema } from "../../cookaing-marketing/integrations/push.onesignal";

const router = Router();

// POST /api/cookaing-marketing/push/send
router.post("/send", async (req: Request, res: Response) => {
  console.log('🔔 Push notification send request received:', req.body);
  
  try {
    const validatedData = sendPushSchema.parse(req.body);
    const { campaignId, segmentName = 'All', scheduledAt, customData } = validatedData;
    
    // Get campaign
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    // Get push content from campaign artifacts
    const artifacts = await storage.getCampaignArtifacts(campaignId);
    const pushArtifact = artifacts.find((a: any) => a.channel === "push");
    
    // In development mode, allow sending even without content (mock mode)
    if (!pushArtifact && process.env.NODE_ENV !== 'development') {
      return res.status(400).json({ 
        error: "No push notification content found for this campaign. Please generate push content first." 
      });
    }
    
    // Generate mock content if no artifact exists (development mode)
    let content;
    if (!pushArtifact && process.env.NODE_ENV === 'development') {
      console.log('🔄 No push artifact found, using mock content for development');
      content = {
        title: `📱 ${campaign.name}`,
        message: `Don't miss out on ${campaign.name}! Check out our latest updates and exciting offers.`,
        actionUrl: 'https://example.com/campaign'
      };
    } else {
      content = pushArtifact?.payloadJson as any || {};
    }
    
    // Validate required push content
    if (!content.title && !content.contents?.en) {
      return res.status(400).json({ 
        error: "Push notification content must have either title or contents.en field" 
      });
    }
    
    try {
      // Prepare OneSignal notification
      const notification: any = {
        contents: content.contents || { en: content.title || content.message },
        headings: content.headings || (content.title ? { en: content.title } : undefined),
        subtitle: content.subtitle ? { en: content.subtitle } : undefined,
        data: {
          campaign_id: campaignId,
          channel: 'push',
          variant: pushArtifact?.variant || 'A',
          ...customData,
          ...content.data
        }
      };
      
      // Set targeting
      if (segmentName === 'All') {
        notification.included_segments = ['All'];
      } else if (segmentName === 'Active Users') {
        notification.included_segments = ['Active Users'];
      } else {
        // Custom segment
        notification.included_segments = [segmentName];
      }
      
      // Add media and styling if available
      if (content.image) {
        notification.big_picture = content.image;
        notification.chrome_web_image = content.image;
        notification.ios_attachments = { id1: content.image };
      }
      
      if (content.icon) {
        notification.chrome_web_icon = content.icon;
        notification.chrome_icon = content.icon;
        notification.firefox_icon = content.icon;
      }
      
      if (content.url) {
        notification.url = content.url;
        notification.web_url = content.url;
        notification.app_url = content.url;
      }
      
      // Set scheduling if provided
      if (scheduledAt) {
        notification.send_after = new Date(scheduledAt).toISOString();
      }
      
      // Add sound and other options
      if (content.sound) {
        notification.ios_sound = content.sound;
        notification.android_sound = content.sound;
      }
      
      if (content.badge_count) {
        notification.ios_badgeCount = content.badge_count;
      }
      
      if (content.android_accent_color) {
        notification.android_accent_color = content.android_accent_color;
      }
      
      console.log('🔔 Sending OneSignal notification:', {
        campaign_id: campaignId,
        segment: segmentName,
        scheduled: !!scheduledAt
      });
      
      const oneSignalResponse = await oneSignalService.sendNotification(notification);
      
      console.log('✅ OneSignal notification sent:', oneSignalResponse.id);
      
      // Update campaign metadata with push information
      const currentMeta = campaign.metaJson || {};
      const updatedMeta = {
        ...currentMeta,
        push_notifications: {
          ...currentMeta.push_notifications,
          onesignal_id: oneSignalResponse.id,
          recipients: oneSignalResponse.recipients,
          segment: segmentName,
          sent_at: scheduledAt || new Date().toISOString(),
          artifact_id: pushArtifact?.id || 'mock-push-artifact',
          variant: pushArtifact?.variant || 'A',
          external_id: oneSignalResponse.external_id
        }
      };
      
      await storage.updateCampaign(campaignId, {
        metaJson: updatedMeta
      });
      
      // Record analytics event for delivery - skip in development mode
      if (process.env.NODE_ENV !== 'development') {
        try {
          await storage.createAnalyticsEvent({
            eventType: 'push_sent',
            metadata: {
              orgId: campaign.orgId,
              campaign_id: campaignId,
              platform: 'onesignal',
              notification_id: oneSignalResponse.id,
              recipients: oneSignalResponse.recipients,
              segment: segmentName,
              scheduled: !!scheduledAt
            }
          });
        } catch (error) {
          console.warn('⚠️ Failed to log analytics event:', error);
        }
      }
      
      // If not scheduled, get initial delivery stats
      let deliveryStats = null;
      if (!scheduledAt) {
        try {
          // Wait a moment for initial stats
          setTimeout(async () => {
            try {
              const stats = await oneSignalService.getNotificationStats(oneSignalResponse.id);
              // Skip analytics in development
              if (process.env.NODE_ENV !== 'development') {
                await storage.createAnalyticsEvent({
                  eventType: 'push_delivered',
                  metadata: {
                    orgId: campaign.orgId,
                    campaign_id: campaignId,
                    notification_id: oneSignalResponse.id,
                    successful: stats.successful,
                    failed: stats.failed,
                    errored: stats.errored
                  }
                });
              }
            } catch (error) {
              console.error('❌ Failed to record delivery stats:', error);
            }
          }, 5000); // Wait 5 seconds for delivery stats
        } catch (error) {
          console.error('❌ Failed to get delivery stats:', error);
        }
      }
      
      res.json({
        success: true,
        campaign_id: campaignId,
        notification: {
          id: oneSignalResponse.id,
          recipients: oneSignalResponse.recipients,
          segment: segmentName,
          sent_at: scheduledAt || new Date().toISOString(),
          external_id: oneSignalResponse.external_id
        },
        delivery_stats: deliveryStats
      });
      
    } catch (error) {
      console.error('❌ OneSignal notification send failed:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Push notification error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors
      });
    }
    
    return res.status(500).json({
      error: "Failed to send push notification",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/push/status/:campaignId
router.get("/status/:campaignId", async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.campaignId);
    const storage = getStorage();
    
    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    const meta = campaign.metaJson || {};
    const pushNotifications = meta.push_notifications;
    
    if (!pushNotifications?.onesignal_id) {
      return res.json({
        campaign_id: campaignId,
        status: 'not_sent',
        notification: null
      });
    }
    
    // Get current delivery stats
    let deliveryStats = null;
    try {
      deliveryStats = await oneSignalService.getNotificationStats(pushNotifications.onesignal_id);
      
      // Record updated stats to analytics - skip in development mode
      if (process.env.NODE_ENV !== 'development') {
        try {
          await storage.createAnalyticsEvent({
            eventType: 'push_stats_updated',
            metadata: {
              orgId: campaign.orgId,
              campaign_id: campaignId,
              notification_id: pushNotifications.onesignal_id,
              ...deliveryStats
            }
          });
        } catch (error) {
          console.warn('⚠️ Failed to log analytics event:', error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to get notification stats:', error);
    }
    
    res.json({
      campaign_id: campaignId,
      status: 'sent',
      notification: {
        id: pushNotifications.onesignal_id,
        recipients: pushNotifications.recipients,
        segment: pushNotifications.segment,
        sent_at: pushNotifications.sent_at,
        external_id: pushNotifications.external_id,
        artifact_id: pushNotifications.artifact_id,
        variant: pushNotifications.variant
      },
      delivery_stats: deliveryStats
    });
    
  } catch (error) {
    console.error('❌ Push status check error:', error);
    res.status(500).json({
      error: "Failed to check push status",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// GET /api/cookaing-marketing/push/app-info
router.get("/app-info", async (req: Request, res: Response) => {
  try {
    const appInfo = await oneSignalService.getAppInfo();
    
    res.json({
      success: true,
      app: {
        id: appInfo.id,
        name: appInfo.name,
        total_players: appInfo.players,
        messageable_players: appInfo.messageable_players,
        updated_at: appInfo.updated_at
      }
    });
    
  } catch (error) {
    console.error('❌ OneSignal app info error:', error);
    res.status(500).json({
      error: "Failed to get app info",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;