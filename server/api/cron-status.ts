import { Router } from 'express';
import { db } from '../db';
import { trendingProducts } from '../../shared/schema';
import { desc, gte, eq } from 'drizzle-orm';

const router = Router();

// Get cron job status and last run information
router.get('/cron-status', async (req, res) => {
  try {
    // Get last Perplexity products added
    const lastPerplexityProducts = await db
      .select()
      .from(trendingProducts)
      .where(trendingProducts.source.eq('perplexity'))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(10);

    // Get today's Perplexity products
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysProducts = await db
      .select()
      .from(trendingProducts)
      .where(trendingProducts.source.eq('perplexity'))
      .where(trendingProducts.createdAt.gte(today))
      .orderBy(desc(trendingProducts.createdAt));

    // Calculate next 5 AM ET run
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(5, 0, 0, 0); // 5:00 AM ET
    
    // If it's already past 5 AM today, schedule for tomorrow
    if (now.getHours() >= 5) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const lastRunDate = lastPerplexityProducts.length > 0 
      ? lastPerplexityProducts[0].createdAt 
      : null;

    const status = {
      cronSchedule: "0 5 * * * (5:00 AM ET daily)",
      timezone: "America/New_York",
      nextScheduledRun: nextRun.toISOString(),
      lastRunDate: lastRunDate,
      todaysProductCount: todaysProducts.length,
      lastTenProducts: lastPerplexityProducts.map(p => ({
        title: p.title,
        niche: p.niche,
        createdAt: p.createdAt,
        mentions: p.mentions
      })),
      systemStatus: "Active",
      isRunning: false // This would need to be tracked globally if needed
    };

    res.json({ success: true, status });
  } catch (error) {
    console.error('Error fetching cron status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch cron status' 
    });
  }
});

export { router as cronStatusRouter };