import { Router } from 'express';
import { db } from '../db';
import { trendingProducts } from '../../shared/schema';
import { desc, gte, eq } from 'drizzle-orm';

const router = Router();

// Get cron job status and last run information
router.get('/', async (req, res) => {
  try {
    // Get Perplexity cron status
    const { getPerplexityCronStatus } = await import('../services/perplexityCron');
    const cronStatus = getPerplexityCronStatus();
    
    // Calculate next 5 AM ET run
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(5, 0, 0, 0); // 5:00 AM ET
    
    // If it's already past 5 AM today, schedule for tomorrow
    if (now.getHours() >= 5) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const status = {
      cronSchedule: "0 9 * * * (5:00 AM ET daily)",
      timezone: "America/New_York",
      nextScheduledRun: nextRun.toISOString(),
      systemStatus: cronStatus.isRunning ? "Running" : "Scheduled",
      cronJobActive: cronStatus.scheduled,
      perplexityAutomationEnabled: true
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