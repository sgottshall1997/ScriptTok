import { Router } from 'express';
import { trendingDetectorService } from '../../cookaing-marketing/trends/trendingDetector.js';
import { seasonalGeneratorService } from '../../cookaing-marketing/trends/seasonalGenerator.js';
import { referralGeneratorService } from '../../cookaing-marketing/trends/referralGenerator.js';
import { trendingCronJobs } from '../../cookaing-marketing/trends/cronJobs.js';
import { storage } from '../../storage.js';

const router = Router();

// Trending detector endpoints
router.get('/detector/status', async (req, res) => {
  try {
    const config = trendingDetectorService.getConfig();
    const jobStatus = trendingCronJobs.getJobStatus();
    
    res.json({
      success: true,
      config,
      cronJob: jobStatus.trending_detector || { running: false }
    });
  } catch (error) {
    console.error('❌ Failed to get trending detector status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending detector status'
    });
  }
});

router.post('/detector/enable', async (req, res) => {
  try {
    trendingCronJobs.enableService('trending_detector');
    
    res.json({
      success: true,
      message: 'Trending detector enabled and scheduled'
    });
  } catch (error) {
    console.error('❌ Failed to enable trending detector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable trending detector'
    });
  }
});

router.post('/detector/disable', async (req, res) => {
  try {
    trendingCronJobs.disableService('trending_detector');
    
    res.json({
      success: true,
      message: 'Trending detector disabled'
    });
  } catch (error) {
    console.error('❌ Failed to disable trending detector:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable trending detector'
    });
  }
});

router.post('/detector/trigger', async (req, res) => {
  try {
    await trendingCronJobs.triggerTrendingDetection();
    
    res.json({
      success: true,
      message: 'Trending detection triggered successfully'
    });
  } catch (error) {
    console.error('❌ Manual trending detection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger trending detection'
    });
  }
});

// Seasonal generator endpoints
router.get('/seasonal/status', async (req, res) => {
  try {
    const config = seasonalGeneratorService.getConfig();
    const upcomingEvents = seasonalGeneratorService.getUpcomingEventsPreview();
    const jobStatus = trendingCronJobs.getJobStatus();
    
    res.json({
      success: true,
      config,
      upcomingEvents,
      cronJob: jobStatus.seasonal_generator || { running: false }
    });
  } catch (error) {
    console.error('❌ Failed to get seasonal generator status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get seasonal generator status'
    });
  }
});

router.post('/seasonal/enable', async (req, res) => {
  try {
    trendingCronJobs.enableService('seasonal_generator');
    
    res.json({
      success: true,
      message: 'Seasonal generator enabled and scheduled'
    });
  } catch (error) {
    console.error('❌ Failed to enable seasonal generator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable seasonal generator'
    });
  }
});

router.post('/seasonal/disable', async (req, res) => {
  try {
    trendingCronJobs.disableService('seasonal_generator');
    
    res.json({
      success: true,
      message: 'Seasonal generator disabled'
    });
  } catch (error) {
    console.error('❌ Failed to disable seasonal generator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable seasonal generator'
    });
  }
});

router.post('/seasonal/trigger', async (req, res) => {
  try {
    await trendingCronJobs.triggerSeasonalGeneration();
    
    res.json({
      success: true,
      message: 'Seasonal generation triggered successfully'
    });
  } catch (error) {
    console.error('❌ Manual seasonal generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger seasonal generation'
    });
  }
});

// Referral generator endpoints
router.get('/referral/status', async (req, res) => {
  try {
    const config = referralGeneratorService.getConfig();
    const templates = referralGeneratorService.listTemplates();
    
    res.json({
      success: true,
      config,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        platform: t.platform,
        ctaText: t.ctaText
      }))
    });
  } catch (error) {
    console.error('❌ Failed to get referral generator status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get referral generator status'
    });
  }
});

router.post('/referral/enable', async (req, res) => {
  try {
    referralGeneratorService.enable();
    
    res.json({
      success: true,
      message: 'Referral generator enabled'
    });
  } catch (error) {
    console.error('❌ Failed to enable referral generator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable referral generator'
    });
  }
});

router.post('/referral/disable', async (req, res) => {
  try {
    referralGeneratorService.disable();
    
    res.json({
      success: true,
      message: 'Referral generator disabled'
    });
  } catch (error) {
    console.error('❌ Failed to disable referral generator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable referral generator'
    });
  }
});

router.post('/referral/generate', async (req, res) => {
  try {
    const { templateId, contentData } = req.body;
    
    if (!templateId || !contentData) {
      return res.status(400).json({
        success: false,
        error: 'templateId and contentData are required'
      });
    }

    const result = await referralGeneratorService.generateReferralContent(templateId, contentData);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Failed to generate referral content:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate referral content'
    });
  }
});

// Combined status endpoint
router.get('/status', async (req, res) => {
  try {
    const configs = trendingCronJobs.getServiceConfigs();
    const jobStatuses = trendingCronJobs.getJobStatus();
    const upcomingEvents = seasonalGeneratorService.getUpcomingEventsPreview();
    
    res.json({
      success: true,
      services: {
        trending_detector: {
          ...configs.trending_detector,
          cronJob: jobStatuses.trending_detector || { running: false }
        },
        seasonal_generator: {
          ...configs.seasonal_generator,
          cronJob: jobStatuses.seasonal_generator || { running: false },
          upcomingEvents
        },
        referral_generator: {
          ...referralGeneratorService.getConfig(),
          templatesCount: referralGeneratorService.listTemplates().length
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get trends status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trends status'
    });
  }
});

// Analytics endpoints
router.get('/analytics/trending', async (req, res) => {
  try {
    // Get recent trending content generations
    const recentGenerations = await storage.getRecentContentGenerations(20);
    const trendingGenerations = recentGenerations.filter(gen => 
      gen.metadata?.source === 'trending_detector'
    );

    res.json({
      success: true,
      data: {
        totalTrendingContent: trendingGenerations.length,
        recentGenerations: trendingGenerations.slice(0, 10).map(gen => ({
          id: gen.id,
          niche: gen.niche,
          selectedProduct: gen.selectedProduct,
          createdAt: gen.createdAt,
          platform: gen.metadata?.platform,
          trendScore: gen.metadata?.trend_score
        }))
      }
    });
  } catch (error) {
    console.error('❌ Failed to get trending analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending analytics'
    });
  }
});

export default router;