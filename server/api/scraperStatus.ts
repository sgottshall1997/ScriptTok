import { Router } from 'express';
import { db } from '../db';
import { trendingProducts } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = Router();

type ScraperStatus = {
  name: string;
  status: string;
  lastCheck: string;
  lastSuccess?: string;
  errorMessage?: string;
  successCount: number;
  failureCount: number;
  realData?: any[];
};

// Get scraper status information
router.get('/', async (req, res) => {
  try {
    // Get the most recent Perplexity product to determine last run time
    const lastPerplexityProduct = await db
      .select()
      .from(trendingProducts)
      .where(eq(trendingProducts.source, 'perplexity'))
      .orderBy(desc(trendingProducts.createdAt))
      .limit(1);

    // Get count of perplexity products
    const perplexityCount = await db
      .select({ count: trendingProducts.id })
      .from(trendingProducts)
      .where(eq(trendingProducts.source, 'perplexity'))
      .then(result => result.length);

    const now = new Date();
    let perplexityStatus: ScraperStatus;

    if (lastPerplexityProduct.length === 0) {
      perplexityStatus = {
        name: 'perplexity',
        status: 'no-data',
        lastCheck: now.toISOString(),
        errorMessage: 'No Perplexity runs found',
        successCount: 0,
        failureCount: 0
      };
    } else {
      const lastProduct = lastPerplexityProduct[0];
      const lastRunUTC = new Date(lastProduct.createdAt);
      
      // Calculate time since last run
      const diffMs = now.getTime() - lastRunUTC.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      // Determine status based on how recent the last run was
      let status = 'active';
      if (diffHours > 48) {
        status = 'degraded'; // Haven't run in over 2 days
      } else if (diffHours > 24) {
        status = 'warning'; // Haven't run in over 1 day
      }

      perplexityStatus = {
        name: 'perplexity',
        status,
        lastCheck: lastProduct.createdAt.toISOString(),
        lastSuccess: lastProduct.createdAt.toISOString(),
        successCount: perplexityCount,
        failureCount: 0
      };
    }

    // Return array of scraper statuses
    const scraperStatuses: ScraperStatus[] = [perplexityStatus];

    res.json(scraperStatuses);

  } catch (error) {
    console.error('Error fetching scraper status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scraper status'
    });
  }
});

export { router as scraperStatusRouter };