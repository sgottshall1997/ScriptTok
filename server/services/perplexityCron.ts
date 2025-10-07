import cron from 'node-cron';
import { log } from '../vite';

let perplexityCronJob: cron.ScheduledTask | null = null;

/**
 * Initialize the Perplexity automation cron job
 * Runs daily at 5:00 AM ET to fetch trending products
 */
export function initializePerplexityCron() {
  // Stop existing job if running
  if (perplexityCronJob) {
    perplexityCronJob.stop();
    perplexityCronJob.destroy();
  }

  // Schedule daily at 5:00 AM ET (09:00 UTC)
  // Cron pattern: "0 9 * * *" = every day at 9:00 AM UTC (5:00 AM ET)
  perplexityCronJob = cron.schedule('0 9 * * *', async () => {
    try {
      log('🔄 PERPLEXITY AUTOMATION: Starting daily trend fetch at 5:00 AM ET');
      
      // Import and check safeguards
      const { getSafeguardStatus } = await import('../config/generation-safeguards');
      const safeguards = getSafeguardStatus();
      
      if (!safeguards.ALLOW_TREND_FETCHING) {
        log('🚫 PERPLEXITY AUTOMATION: Trend fetching disabled - skipping');
        return;
      }

      // Import and trigger all niche fetchers
      const { fetchTrendingProducts } = await import('../api/trending');
      
      log('🎯 PERPLEXITY AUTOMATION: Fetching trending products for all niches...');
      
      // Fetch trending products (this will automatically fetch for all niches)
      await fetchTrendingProducts();
      
      log('✅ PERPLEXITY AUTOMATION: Daily trend fetch completed successfully');
      
    } catch (error) {
      console.error('❌ PERPLEXITY AUTOMATION: Daily trend fetch failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York' // ET timezone
  });

  log('✅ PERPLEXITY AUTOMATION: Daily cron job scheduled for 5:00 AM ET');
}

/**
 * Stop the Perplexity automation cron job
 */
export function stopPerplexityCron() {
  if (perplexityCronJob) {
    perplexityCronJob.stop();
    perplexityCronJob.destroy();
    perplexityCronJob = null;
    log('🚫 PERPLEXITY AUTOMATION: Daily cron job stopped');
  }
}

/**
 * Get the status of the Perplexity cron job
 */
export function getPerplexityCronStatus() {
  return {
    isRunning: perplexityCronJob ? perplexityCronJob.running : false,
    scheduled: perplexityCronJob !== null,
    nextRun: perplexityCronJob ? '5:00 AM ET daily' : null
  };
}