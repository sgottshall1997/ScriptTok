import { Router } from 'express';
import { IntelligenceService } from '../../cookaing-marketing/services/intelligenceService';

const router = Router();
const intelligenceService = new IntelligenceService();

// Competitor Analysis
router.post('/competitor/analyze', async (req, res) => {
  try {
    const { brand, platform, dateRange, metrics } = req.body;
    
    if (!brand || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Brand and platform are required'
      });
    }

    const result = await intelligenceService.fetchCompetitorPosts(
      platform,
      brand,
      10
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Competitor analysis failed'
    });
  }
});

router.get('/competitor/:competitorId/summary', async (req, res) => {
  try {
    const { competitorId } = req.params;
    const { timeframe } = req.query;
    
    if (!competitorId) {
      return res.status(400).json({
        success: false,
        error: 'Competitor ID is required'
      });
    }

    // Mock competitor summary response
    const result = {
      success: true,
      data: {
        competitorId,
        timeframe: timeframe || 'last_30_days',
        summary: 'Mock competitor summary data'
      },
      mode: 'mock'
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get competitor summary'
    });
  }
});

// Sentiment Analysis
router.post('/sentiment/analyze', async (req, res) => {
  try {
    const { text, scope, context, versionId } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const result = await intelligenceService.analyzeSentiment(
      text,
      scope || 'post',
      versionId || 1
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Sentiment analysis failed'
    });
  }
});

router.post('/sentiment/batch', async (req, res) => {
  try {
    const { texts, scope, context } = req.body;
    
    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        error: 'Texts array is required'
      });
    }

    const batchItems = texts.map((text: string, index: number) => ({
      text,
      scope: scope || 'post',
      refId: index + 1
    }));
    const result = await intelligenceService.batchAnalyzeSentiment(batchItems);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch sentiment analysis failed'
    });
  }
});

// Viral Prediction
router.post('/viral/predict', async (req, res) => {
  try {
    const { contentId, features, platform } = req.body;
    
    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: 'Content ID is required'
      });
    }

    // Mock viral prediction response
    const result = {
      success: true,
      data: {
        contentId,
        platform: platform || 'instagram',
        viralScore: Math.random() * 100,
        factors: ['timing', 'hashtags', 'engagement_potential']
      },
      mode: 'mock'
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Viral prediction failed'
    });
  }
});

// Trend Analysis
router.get('/trends/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    const { timeframe } = req.query;
    
    if (!niche) {
      return res.status(400).json({
        success: false,
        error: 'Niche is required'
      });
    }

    // Mock trend analysis response
    const result = {
      success: true,
      data: {
        niche,
        timeframe: timeframe || 'last_7_days',
        trends: ['Mock trend data']
      },
      mode: 'mock'
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Trend analysis failed'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const result = await intelligenceService.getHealthStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

export default router;