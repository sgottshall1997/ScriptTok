import { Router } from 'express';
import { db } from '../db';
import { trendingProducts } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// Get last Perplexity fetch status with Eastern Time formatting
router.get('/last-run', async (req, res) => {
  try {
    // Get the most recent Perplexity product to determine last run time
    const lastPerplexityProduct = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.source, 'perplexity'))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(1);

    if (lastPerplexityProduct.length === 0) {
      return res.json({
        success: true,
        lastRun: null,
        message: "No Perplexity runs found",
        nextScheduled: "Daily at 5:00 AM ET"
      });
    }

    const lastProduct = lastPerplexityProduct[0];
    const lastRunUTC = new Date(lastProduct.createdAt);
    
    // Convert to Eastern Time
    const lastRunET = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(lastRunUTC);

    // Calculate time since last run
    const now = new Date();
    const diffMs = now.getTime() - lastRunUTC.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    let timeSince = '';
    if (diffDays > 0) {
      timeSince = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      timeSince = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      timeSince = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }

    // Calculate next scheduled run (5:00 AM ET next day)
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 1);
    const nextRunET = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(nextRun);

    res.json({
      success: true,
      lastRun: lastRunET,
      lastRunUTC: lastProduct.createdAt,
      timeSince,
      nextScheduled: `Tomorrow at 5:00 AM ET (${nextRunET.split(',')[0]} 5:00 AM)`,
      totalProducts: await db
        .select({ count: trendingProducts.id })
        .from(trendingProducts)
        .where(eq(trendingProducts.source, 'perplexity'))
        .then(result => result.length)
    });

  } catch (error) {
    console.error('Error fetching Perplexity status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Perplexity status'
    });
  }
});

export default router;