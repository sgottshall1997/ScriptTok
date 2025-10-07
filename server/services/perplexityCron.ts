import cron from 'node-cron';
import { log } from '../vite';

let perplexityCronJob: ReturnType<typeof cron.schedule> | null = null;

/**
 * Initialize the Automated Daily Trend Fetcher cron job
 * Runs daily at midnight UTC to fetch all trends and save to cache
 */
export function initializePerplexityCron() {
  // Stop existing job if running
  if (perplexityCronJob) {
    perplexityCronJob.stop();
    perplexityCronJob.destroy();
  }

  // Schedule daily at midnight UTC
  // Cron pattern: "0 0 * * *" = every day at midnight UTC
  perplexityCronJob = cron.schedule('0 0 * * *', async () => {
    try {
      log('🔄 DAILY TREND AUTOMATION: Starting daily trend fetch at midnight UTC');
      
      // Import and check safeguards
      const { getSafeguardStatus } = await import('../config/generation-safeguards');
      const safeguards = getSafeguardStatus();
      
      if (!safeguards.ALLOW_TREND_FETCHING) {
        log('🚫 DAILY TREND AUTOMATION: Trend fetching disabled - skipping');
        return;
      }

      // Import and trigger the new daily trend fetcher
      const { fetchDailyTrends } = await import('./dailyTrendFetcher');
      
      log('🎯 DAILY TREND AUTOMATION: Fetching trends for all niches...');
      
      // Run the comprehensive daily trend fetch
      const result = await fetchDailyTrends();
      
      log(`✅ DAILY TREND AUTOMATION: Completed - ${result.successCount} successful, ${result.failureCount} failed`);
      
    } catch (error) {
      console.error('❌ DAILY TREND AUTOMATION: Daily trend fetch failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  log('✅ DAILY TREND AUTOMATION: Daily cron job scheduled for midnight UTC');
}

/**
 * Stop the daily trend automation cron job
 */
export function stopPerplexityCron() {
  if (perplexityCronJob) {
    perplexityCronJob.stop();
    perplexityCronJob.destroy();
    perplexityCronJob = null;
    log('🚫 DAILY TREND AUTOMATION: Cron job stopped');
  }
}

/**
 * Get the status of the daily trend automation cron job
 */
export function getPerplexityCronStatus() {
  return {
    isRunning: perplexityCronJob !== null,
    scheduled: perplexityCronJob !== null,
    nextRun: perplexityCronJob ? 'Midnight UTC daily' : null
  };
}