import { Router } from 'express';
import { socialService } from '../../cookaing-marketing/services/social.service.js';
import { z } from 'zod';

const router = Router();

// Request validation schemas
const publishRequestSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  caption: z.string().min(1, 'Caption is required'),
  mediaUrls: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  scheduledAt: z.string().optional()
});

const multiPlatformPublishSchema = z.object({
  platforms: z.array(z.string()).min(1, 'At least one platform required'),
  caption: z.string().min(1, 'Caption is required'),
  mediaUrls: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  scheduledAt: z.string().optional()
});

const engagementRequestSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  actions: z.array(z.object({
    type: z.enum(['like', 'comment', 'reply', 'share', 'follow']),
    targetUrl: z.string().min(1, 'Target URL is required'),
    text: z.string().optional(),
    parentCommentId: z.string().optional()
  })).min(1, 'At least one action required')
});

const hashtagRequestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  platform: z.string().optional(),
  limit: z.number().min(1).max(50).optional()
});

const timingRequestSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  segmentId: z.string().optional(),
  contentType: z.string().optional(),
  targetAudience: z.string().optional()
});

// Social Publishing Routes
router.post('/publish', async (req, res) => {
  try {
    const validated = publishRequestSchema.parse(req.body);
    
    const result = await socialService.publishToSocial({
      platform: validated.platform,
      caption: validated.caption,
      mediaUrls: validated.mediaUrls,
      hashtags: validated.hashtags,
      mentions: validated.mentions,
      scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : undefined
    });

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Publishing failed'
    });
  }
});

router.post('/publish/bulk', async (req, res) => {
  try {
    const validated = multiPlatformPublishSchema.parse(req.body);
    
    const result = await socialService.publishToMultiplePlatforms(
      validated.platforms,
      {
        caption: validated.caption,
        mediaUrls: validated.mediaUrls,
        hashtags: validated.hashtags,
        mentions: validated.mentions,
        scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : undefined
      }
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bulk publishing failed'
    });
  }
});

router.get('/publish/:postId/status', async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform } = req.query;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required'
      });
    }

    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.getPostStatus(platform, postId);

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get post status'
    });
  }
});

router.delete('/publish/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { platform } = req.query;
    
    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required'
      });
    }

    if (!platform || typeof platform !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const success = await socialService.deletePost(platform, postId);

    res.json({
      success: true,
      data: { deleted: success },
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete post'
    });
  }
});

// Queue Management Routes
router.post('/queue', async (req, res) => {
  try {
    const validated = publishRequestSchema.parse(req.body);
    
    // Force scheduling for queue endpoint
    const scheduledAt = validated.scheduledAt ? 
      new Date(validated.scheduledAt) : 
      new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const result = await socialService.publishToSocial({
      platform: validated.platform,
      caption: validated.caption,
      mediaUrls: validated.mediaUrls,
      hashtags: validated.hashtags,
      mentions: validated.mentions,
      scheduledAt
    });

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Queueing failed'
    });
  }
});

// Engagement Automation Routes
router.post('/engage', async (req, res) => {
  try {
    const validated = engagementRequestSchema.parse(req.body);
    
    const result = await socialService.runEngagement({
      platform: validated.platform,
      actions: validated.actions
    });

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Engagement failed'
    });
  }
});

router.post('/engage/single', async (req, res) => {
  try {
    const { platform, action } = req.body;
    
    if (!platform || !action) {
      return res.status(400).json({
        success: false,
        error: 'Platform and action are required'
      });
    }

    const result = await socialService.performSingleEngagement(platform, action);

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Single engagement failed'
    });
  }
});

router.get('/engage/:platform/history', async (req, res) => {
  try {
    const { platform } = req.params;
    const { limit } = req.query;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.getEngagementHistory(
      platform, 
      limit ? parseInt(limit as string) : undefined
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get engagement history'
    });
  }
});

// Hashtag Research Routes
router.post('/hashtags', async (req, res) => {
  try {
    const validated = hashtagRequestSchema.parse(req.body);
    
    const result = await socialService.suggestHashtags({
      topic: validated.topic,
      platform: validated.platform,
      limit: validated.limit
    });

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Hashtag research failed'
    });
  }
});

router.post('/hashtags/analyze', async (req, res) => {
  try {
    const { tags, platform } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tags array is required'
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.analyzeHashtagPerformance(tags, platform);

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Hashtag analysis failed'
    });
  }
});

router.get('/hashtags/trending', async (req, res) => {
  try {
    const { platform, category } = req.query;
    
    const result = await socialService.getTrendingHashtags(
      platform as string,
      category as string
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get trending hashtags'
    });
  }
});

router.post('/hashtags/optimize', async (req, res) => {
  try {
    const { tags, platform } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tags array is required'
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.optimizeHashtagSet(tags, platform);

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Hashtag optimization failed'
    });
  }
});

// Optimal Timing Routes
router.post('/optimal-times', async (req, res) => {
  try {
    const validated = timingRequestSchema.parse(req.body);
    
    const result = await socialService.getOptimalTimes({
      platform: validated.platform,
      segmentId: validated.segmentId,
      contentType: validated.contentType,
      targetAudience: validated.targetAudience
    });

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Timing optimization failed'
    });
  }
});

router.get('/optimal-times/analyze/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { days } = req.query;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.analyzeHistoricalTiming(
      platform,
      days ? parseInt(days as string) : undefined
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Historical timing analysis failed'
    });
  }
});

router.post('/optimal-times/predict', async (req, res) => {
  try {
    const { platform, contentType } = req.body;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.predictBestSlots(platform, contentType);

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Timing prediction failed'
    });
  }
});

router.get('/optimal-times/timezones/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { targetAudience } = req.query;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.getTimezoneRecommendations(
      platform,
      targetAudience as string
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Timezone recommendation failed'
    });
  }
});

// Comprehensive Workflow Routes
router.post('/create-optimized-post', async (req, res) => {
  try {
    const { platforms, content, topic, scheduledAt } = req.body;
    
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Platforms array is required'
      });
    }

    if (!content || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Content and topic are required'
      });
    }

    const result = await socialService.createOptimizedPost(
      platforms,
      content,
      topic,
      scheduledAt ? new Date(scheduledAt) : undefined
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Optimized post creation failed'
    });
  }
});

router.post('/engagement-campaign', async (req, res) => {
  try {
    const { platform, targetUrls, engagementTypes } = req.body;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    if (!targetUrls || !Array.isArray(targetUrls) || targetUrls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Target URLs array is required'
      });
    }

    const result = await socialService.runFullEngagementCampaign(
      platform,
      targetUrls,
      engagementTypes
    );

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Engagement campaign failed'
    });
  }
});

// Analytics and Stats Routes
router.get('/stats', async (req, res) => {
  try {
    const result = await socialService.getSocialAutomationStats();

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    });
  }
});

router.get('/stats/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: 'Platform is required'
      });
    }

    const result = await socialService.getPlatformStats(platform);

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get platform stats'
    });
  }
});

router.get('/kpis', async (req, res) => {
  try {
    const result = await socialService.getAutomationKPIs();

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get KPIs'
    });
  }
});

// Health Check Routes
router.get('/health', async (req, res) => {
  try {
    const result = await socialService.getProviderHealth();

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

router.get('/health/simple', async (req, res) => {
  try {
    const result = await socialService.checkSocialAutomationHealth();

    res.json({
      success: true,
      data: result,
      mode: 'mock'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Simple health check failed'
    });
  }
});

export default router;