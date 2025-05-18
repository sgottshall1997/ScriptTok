import { Router } from 'express';
import { storage } from '../../storage';
import { sql } from 'drizzle-orm';
import { db } from '../../db';
import { contentHistory } from '@shared/schema';
import { AuthRequest } from '../../middleware/auth';

const router = Router();

// GET /api/analytics/user - Get analytics for the current user
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const userId = req.user.id;
    const timeRange = req.query.timeRange as string || '7d';
    
    // Determine date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '7d':
      default:
        startDate.setDate(now.getDate() - 7);
        break;
    }
    
    const startDateStr = startDate.toISOString();
    const todayStr = now.toISOString();

    // Get total generations and tokens for this user
    const [totals] = await db
      .select({
        totalGenerations: sql<number>`count(*)`,
        totalTokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(sql`${contentHistory.userId} = ${userId} AND ${contentHistory.createdAt} >= ${startDateStr} AND ${contentHistory.createdAt} <= ${todayStr}`);

    // Get usage by niche
    const byNiche = await db
      .select({
        niche: contentHistory.niche,
        generations: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(sql`${contentHistory.userId} = ${userId} AND ${contentHistory.createdAt} >= ${startDateStr} AND ${contentHistory.createdAt} <= ${todayStr}`)
      .groupBy(contentHistory.niche)
      .orderBy(sql`count(*) desc`);

    // Get usage by content type
    const byContentType = await db
      .select({
        contentType: contentHistory.contentType,
        generations: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(sql`${contentHistory.userId} = ${userId} AND ${contentHistory.createdAt} >= ${startDateStr} AND ${contentHistory.createdAt} <= ${todayStr}`)
      .groupBy(contentHistory.contentType)
      .orderBy(sql`count(*) desc`);

    // Get usage by tone
    const byTone = await db
      .select({
        tone: contentHistory.tone,
        generations: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(sql`${contentHistory.userId} = ${userId} AND ${contentHistory.createdAt} >= ${startDateStr} AND ${contentHistory.createdAt} <= ${todayStr}`)
      .groupBy(contentHistory.tone)
      .orderBy(sql`count(*) desc`);

    // Get most used niche, content type, and tone
    let mostUsed = {
      niche: byNiche.length > 0 ? byNiche[0].niche : 'N/A',
      contentType: byContentType.length > 0 ? byContentType[0].contentType : 'N/A',
      tone: byTone.length > 0 ? byTone[0].tone : 'N/A'
    };

    // Get activity for the last 7 days regardless of the selected time range
    // This is for the chart which always shows the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const last7Days = await db
      .select({
        date: sql<string>`date_trunc('day', ${contentHistory.createdAt})`,
        generations: sql<number>`count(*)`,
        tokens: sql<number>`sum(${contentHistory.tokenCount})`
      })
      .from(contentHistory)
      .where(sql`${contentHistory.userId} = ${userId} AND ${contentHistory.createdAt} >= ${sevenDaysAgoStr} AND ${contentHistory.createdAt} <= ${todayStr}`)
      .groupBy(sql`date_trunc('day', ${contentHistory.createdAt})`)
      .orderBy(sql`date_trunc('day', ${contentHistory.createdAt})`);

    // Get recent content history for this user
    const recentContent = await db
      .select({
        id: contentHistory.id,
        niche: contentHistory.niche,
        contentType: contentHistory.contentType,
        tone: contentHistory.tone,
        productName: contentHistory.productName,
        modelUsed: contentHistory.modelUsed,
        createdAt: contentHistory.createdAt
      })
      .from(contentHistory)
      .where(sql`${contentHistory.userId} = ${userId}`)
      .orderBy(sql`${contentHistory.createdAt} desc`)
      .limit(10);

    res.json({
      totalGenerations: totals.totalGenerations || 0,
      totalTokens: totals.totalTokens || 0,
      byNiche,
      byContentType,
      byTone,
      mostUsed,
      last7Days,
      recentContent
    });
  } catch (error) {
    console.error("Error getting user analytics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get user analytics", 
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export { router as userAnalyticsRouter };