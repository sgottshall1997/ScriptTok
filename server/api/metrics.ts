import { Router, Request, Response } from 'express';
import { db } from '../db';
import { clickLogs } from '@shared/schema';
import { eq, and, gte, count, sum, desc } from 'drizzle-orm';
import { openai, OPENAI_MODELS } from '../services/openai';

const router = Router();

// Add manual performance metrics
router.post('/manual', async (req: Request, res: Response) => {
  try {
    const { 
      contentId, 
      platform, 
      views, 
      likes, 
      shares, 
      comments, 
      clickThrough,
      conversions,
      revenue 
    } = req.body;

    if (!contentId || !platform) {
      return res.status(400).json({ error: 'Content ID and platform required' });
    }

    // Update click log with manual metrics
    const [updated] = await db
      .update(clickLogs)
      .set({
        views: views || 0,
        likes: likes || 0,
        shares: shares || 0,
        comments: comments || 0,
        clickThrough: clickThrough || 0,
        conversions: conversions || 0,
        revenue: revenue || 0,
        updatedAt: new Date()
      })
      .where(and(
        eq(clickLogs.contentId, contentId),
        eq(clickLogs.platform, platform)
      ))
      .returning();

    res.json({
      success: true,
      metrics: updated
    });

  } catch (error) {
    console.error('Error adding manual metrics:', error);
    res.status(500).json({ error: 'Failed to add metrics' });
  }
});

// Get performance analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { timeframe = '7d', platform, niche } = req.query;
    
    // Calculate date range
    const days = timeframe === '30d' ? 30 : timeframe === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = db
      .select({
        totalClicks: sum(clickLogs.clicks),
        totalViews: sum(clickLogs.views),
        totalRevenue: sum(clickLogs.revenue),
        avgConversion: sum(clickLogs.conversions)
      })
      .from(clickLogs)
      .where(gte(clickLogs.createdAt, startDate));

    if (platform) {
      query = query.where(eq(clickLogs.platform, platform as string));
    }

    if (niche) {
      query = query.where(eq(clickLogs.niche, niche as string));
    }

    const [analytics] = await query;

    // Get top performers
    const topPerformers = await db
      .select()
      .from(clickLogs)
      .where(gte(clickLogs.createdAt, startDate))
      .orderBy(desc(clickLogs.clicks))
      .limit(10);

    res.json({
      analytics,
      topPerformers,
      timeframe,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// AI feedback analyzer
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { contentId, platform } = req.body;

    // Get metrics for the content
    const [metrics] = await db
      .select()
      .from(clickLogs)
      .where(and(
        eq(clickLogs.contentId, contentId),
        eq(clickLogs.platform, platform)
      ));

    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    // Generate AI feedback
    const feedback = await generatePerformanceFeedback(metrics);

    res.json({
      success: true,
      feedback,
      metrics
    });

  } catch (error) {
    console.error('Error analyzing performance:', error);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
});

async function generatePerformanceFeedback(metrics: any): Promise<string> {
  const prompt = `Analyze this content performance data and provide actionable feedback:

Platform: ${metrics.platform}
Niche: ${metrics.niche}
Product: ${metrics.product}

Metrics:
- Views: ${metrics.views || 0}
- Clicks: ${metrics.clicks || 0}
- Likes: ${metrics.likes || 0}
- Shares: ${metrics.shares || 0}
- Comments: ${metrics.comments || 0}
- Click-through rate: ${metrics.clickThrough || 0}%
- Conversions: ${metrics.conversions || 0}
- Revenue: $${metrics.revenue || 0}

Provide:
1. Performance assessment (excellent/good/average/poor)
2. Key strengths and weaknesses
3. 3 specific optimization recommendations
4. Content strategy adjustments for this niche/platform

Keep response concise and actionable.`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODELS.PRIMARY,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  return response.choices[0].message.content || 'Unable to generate feedback';
}

export default router;