import { Request, Response } from 'express';
import { db } from '../db.js';
import { performanceAnalytics, contentGenerations, scheduledPosts, clickLogs, insertPerformanceAnalyticsSchema } from '@shared/schema';
import { eq, and, gte, lte, sum, avg, count, desc } from 'drizzle-orm';
import { z } from 'zod';

const analyticsDataSchema = z.object({
  contentId: z.number().optional(),
  scheduledPostId: z.number().optional(),
  platform: z.string(),
  views: z.number().default(0),
  likes: z.number().default(0),
  comments: z.number().default(0),
  shares: z.number().default(0),
  saves: z.number().default(0),
  clicks: z.number().default(0),
  conversions: z.number().default(0),
  revenue: z.string().default("0"),
  commission: z.string().default("0"),
  adSpend: z.string().default("0"),
  dateRange: z.string().optional(),
});

// Record performance analytics data
export async function recordAnalytics(req: Request, res: Response) {
  try {
    const validatedData = analyticsDataSchema.parse(req.body);
    
    // Calculate derived metrics
    const clickThroughRate = validatedData.views > 0 
      ? (validatedData.clicks / validatedData.views * 100).toFixed(2)
      : "0";
    
    const conversionRate = validatedData.clicks > 0 
      ? (validatedData.conversions / validatedData.clicks * 100).toFixed(2)
      : "0";
    
    const revenue = parseFloat(validatedData.revenue);
    const adSpend = parseFloat(validatedData.adSpend);
    const roi = adSpend > 0 
      ? ((revenue - adSpend) / adSpend * 100).toFixed(2)
      : "0";

    const cpc = validatedData.clicks > 0 
      ? (adSpend / validatedData.clicks).toFixed(2)
      : "0";

    const cpm = validatedData.views > 0 
      ? (adSpend / validatedData.views * 1000).toFixed(2)
      : "0";

    // Record analytics
    const [analytics] = await db.insert(performanceAnalytics).values({
      contentId: validatedData.contentId,
      scheduledPostId: validatedData.scheduledPostId,
      platform: validatedData.platform,
      views: validatedData.views,
      likes: validatedData.likes,
      comments: validatedData.comments,
      shares: validatedData.shares,
      saves: validatedData.saves,
      clicks: validatedData.clicks,
      clickThroughRate,
      conversions: validatedData.conversions,
      conversionRate,
      revenue: validatedData.revenue,
      commission: validatedData.commission,
      roi,
      adSpend: validatedData.adSpend,
      cpc,
      cpm,
      dateRange: validatedData.dateRange || new Date().toISOString().split('T')[0],
    }).returning();

    res.json({
      success: true,
      analytics,
      message: 'Performance analytics recorded successfully',
    });

  } catch (error) {
    console.error('Record analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to record analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get comprehensive ROI dashboard
export async function getROIDashboard(req: Request, res: Response) {
  try {
    const { 
      startDate, 
      endDate, 
      platform, 
      niche,
      limit = 50 
    } = req.query;

    // Base date range (default to last 30 days)
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get performance analytics with content details
    let analyticsQuery = db.select({
      id: performanceAnalytics.id,
      contentId: performanceAnalytics.contentId,
      platform: performanceAnalytics.platform,
      views: performanceAnalytics.views,
      likes: performanceAnalytics.likes,
      comments: performanceAnalytics.comments,
      shares: performanceAnalytics.shares,
      saves: performanceAnalytics.saves,
      clicks: performanceAnalytics.clicks,
      clickThroughRate: performanceAnalytics.clickThroughRate,
      conversions: performanceAnalytics.conversions,
      conversionRate: performanceAnalytics.conversionRate,
      revenue: performanceAnalytics.revenue,
      commission: performanceAnalytics.commission,
      roi: performanceAnalytics.roi,
      adSpend: performanceAnalytics.adSpend,
      cpc: performanceAnalytics.cpc,
      cpm: performanceAnalytics.cpm,
      recordedAt: performanceAnalytics.recordedAt,
      content: {
        product: contentGenerations.product,
        niche: contentGenerations.niche,
        templateType: contentGenerations.templateType,
        tone: contentGenerations.tone,
      }
    })
    .from(performanceAnalytics)
    .leftJoin(contentGenerations, eq(performanceAnalytics.contentId, contentGenerations.id))
    .where(
      and(
        gte(performanceAnalytics.recordedAt, start),
        lte(performanceAnalytics.recordedAt, end)
      )
    )
    .orderBy(desc(performanceAnalytics.recordedAt))
    .limit(Number(limit));

    // Apply filters
    if (platform) {
      analyticsQuery = analyticsQuery.where(
        and(
          gte(performanceAnalytics.recordedAt, start),
          lte(performanceAnalytics.recordedAt, end),
          eq(performanceAnalytics.platform, platform as string)
        )
      );
    }

    const analytics = await analyticsQuery;

    // Filter by niche if specified (post-query filtering since niche is in joined table)
    const filteredAnalytics = niche 
      ? analytics.filter(item => item.content?.niche === niche)
      : analytics;

    // Calculate summary metrics
    const totalRevenue = filteredAnalytics.reduce((sum, item) => sum + parseFloat(item.revenue || '0'), 0);
    const totalAdSpend = filteredAnalytics.reduce((sum, item) => sum + parseFloat(item.adSpend || '0'), 0);
    const totalROI = totalAdSpend > 0 ? ((totalRevenue - totalAdSpend) / totalAdSpend * 100) : 0;
    const totalClicks = filteredAnalytics.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const totalConversions = filteredAnalytics.reduce((sum, item) => sum + (item.conversions || 0), 0);
    const totalViews = filteredAnalytics.reduce((sum, item) => sum + (item.views || 0), 0);
    
    const avgCTR = totalViews > 0 ? (totalClicks / totalViews * 100) : 0;
    const avgConversionRate = totalClicks > 0 ? (totalConversions / totalClicks * 100) : 0;

    // Platform breakdown
    const platformStats = filteredAnalytics.reduce((acc, item) => {
      const platform = item.platform;
      if (!acc[platform]) {
        acc[platform] = { revenue: 0, clicks: 0, conversions: 0, views: 0, adSpend: 0 };
      }
      acc[platform].revenue += parseFloat(item.revenue || '0');
      acc[platform].clicks += item.clicks || 0;
      acc[platform].conversions += item.conversions || 0;
      acc[platform].views += item.views || 0;
      acc[platform].adSpend += parseFloat(item.adSpend || '0');
      return acc;
    }, {} as Record<string, any>);

    // Top performing content
    const topContent = filteredAnalytics
      .sort((a, b) => parseFloat(b.revenue || '0') - parseFloat(a.revenue || '0'))
      .slice(0, 10);

    res.json({
      success: true,
      dashboard: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalAdSpend: totalAdSpend.toFixed(2),
          totalROI: totalROI.toFixed(2),
          totalClicks,
          totalConversions,
          totalViews,
          avgCTR: avgCTR.toFixed(2),
          avgConversionRate: avgConversionRate.toFixed(2),
        },
        platformStats,
        topContent,
        analytics: filteredAnalytics,
        dateRange: { start, end },
      },
    });

  } catch (error) {
    console.error('Get ROI dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to get ROI dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get performance trends over time
export async function getPerformanceTrends(req: Request, res: Response) {
  try {
    const { 
      metric = 'revenue', 
      platform, 
      niche,
      days = 30 
    } = req.query;

    const endDate = new Date();
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    // Get daily aggregated data
    const trendsQuery = db.select({
      date: performanceAnalytics.recordedAt,
      platform: performanceAnalytics.platform,
      totalRevenue: sum(performanceAnalytics.revenue),
      totalClicks: sum(performanceAnalytics.clicks),
      totalConversions: sum(performanceAnalytics.conversions),
      totalViews: sum(performanceAnalytics.views),
      avgROI: avg(performanceAnalytics.roi),
      avgCTR: avg(performanceAnalytics.clickThroughRate),
      avgConversionRate: avg(performanceAnalytics.conversionRate),
      niche: contentGenerations.niche,
    })
    .from(performanceAnalytics)
    .leftJoin(contentGenerations, eq(performanceAnalytics.contentId, contentGenerations.id))
    .where(
      and(
        gte(performanceAnalytics.recordedAt, startDate),
        lte(performanceAnalytics.recordedAt, endDate)
      )
    )
    .groupBy(performanceAnalytics.recordedAt, performanceAnalytics.platform, contentGenerations.niche);

    const trends = await trendsQuery;

    // Group by date for trend visualization
    const trendsByDate = trends.reduce((acc, item) => {
      const dateKey = item.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, revenue: 0, clicks: 0, conversions: 0, views: 0 };
      }
      acc[dateKey].revenue += parseFloat(item.totalRevenue || '0');
      acc[dateKey].clicks += Number(item.totalClicks || 0);
      acc[dateKey].conversions += Number(item.totalConversions || 0);
      acc[dateKey].views += Number(item.totalViews || 0);
      return acc;
    }, {} as Record<string, any>);

    const trendData = Object.values(trendsByDate).sort((a: any, b: any) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      trends: trendData,
      metric,
      dateRange: { start: startDate, end: endDate },
      platformFilter: platform,
      nicheFilter: niche,
    });

  } catch (error) {
    console.error('Get performance trends error:', error);
    res.status(500).json({ 
      error: 'Failed to get performance trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get content performance comparison
export async function getContentComparison(req: Request, res: Response) {
  try {
    const { contentIds, metric = 'roi' } = req.query;
    
    if (!contentIds) {
      return res.status(400).json({ error: 'Content IDs are required' });
    }

    const ids = (contentIds as string).split(',').map(id => parseInt(id));

    const comparison = await db.select({
      contentId: performanceAnalytics.contentId,
      platform: performanceAnalytics.platform,
      totalRevenue: sum(performanceAnalytics.revenue),
      totalClicks: sum(performanceAnalytics.clicks),
      totalConversions: sum(performanceAnalytics.conversions),
      totalViews: sum(performanceAnalytics.views),
      avgROI: avg(performanceAnalytics.roi),
      avgCTR: avg(performanceAnalytics.clickThroughRate),
      avgConversionRate: avg(performanceAnalytics.conversionRate),
      content: {
        product: contentGenerations.product,
        niche: contentGenerations.niche,
        templateType: contentGenerations.templateType,
        tone: contentGenerations.tone,
      }
    })
    .from(performanceAnalytics)
    .leftJoin(contentGenerations, eq(performanceAnalytics.contentId, contentGenerations.id))
    .where(eq(performanceAnalytics.contentId, ids[0])) // Start with first ID
    .groupBy(
      performanceAnalytics.contentId, 
      performanceAnalytics.platform,
      contentGenerations.product,
      contentGenerations.niche,
      contentGenerations.templateType,
      contentGenerations.tone
    );

    // Group by content for comparison
    const comparisonData = comparison.reduce((acc, item) => {
      const contentId = item.contentId!;
      if (!acc[contentId]) {
        acc[contentId] = {
          contentId,
          content: item.content,
          platforms: {},
          totals: { revenue: 0, clicks: 0, conversions: 0, views: 0 },
        };
      }
      
      acc[contentId].platforms[item.platform] = {
        revenue: parseFloat(item.totalRevenue || '0'),
        clicks: Number(item.totalClicks || 0),
        conversions: Number(item.totalConversions || 0),
        views: Number(item.totalViews || 0),
        roi: parseFloat(item.avgROI || '0'),
        ctr: parseFloat(item.avgCTR || '0'),
        conversionRate: parseFloat(item.avgConversionRate || '0'),
      };

      acc[contentId].totals.revenue += parseFloat(item.totalRevenue || '0');
      acc[contentId].totals.clicks += Number(item.totalClicks || 0);
      acc[contentId].totals.conversions += Number(item.totalConversions || 0);
      acc[contentId].totals.views += Number(item.totalViews || 0);

      return acc;
    }, {} as Record<number, any>);

    res.json({
      success: true,
      comparison: Object.values(comparisonData),
      metric,
      contentIds: ids,
    });

  } catch (error) {
    console.error('Get content comparison error:', error);
    res.status(500).json({ 
      error: 'Failed to get content comparison',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Update analytics from external sources (webhook endpoint)
export async function updateAnalyticsFromWebhook(req: Request, res: Response) {
  try {
    const { 
      platform, 
      contentId, 
      scheduledPostId, 
      metrics 
    } = req.body;

    // Validate required fields
    if (!platform || (!contentId && !scheduledPostId) || !metrics) {
      return res.status(400).json({ 
        error: 'Platform, content/scheduled post ID, and metrics are required' 
      });
    }

    // Record the updated analytics
    const analyticsData = {
      contentId,
      scheduledPostId,
      platform,
      ...metrics,
    };

    const mockReq = { body: analyticsData } as Request;
    const result = await recordAnalytics(mockReq, res);

    res.json({
      success: true,
      message: 'Analytics updated from webhook',
      result,
    });

  } catch (error) {
    console.error('Update analytics from webhook error:', error);
    res.status(500).json({ 
      error: 'Failed to update analytics from webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}