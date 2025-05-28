import cron from 'node-cron';
import { runAllScrapersAndCache, cleanupOldCache } from './scraperCacheManager';

let schedulerInitialized = false;

/**
 * Initializes the daily scraper scheduler
 * Runs at 5:00 AM every day to refresh all scraper data
 */
export function initializeDailyScraperScheduler(): void {
  if (schedulerInitialized) {
    console.log('📅 Daily scraper scheduler already initialized');
    return;
  }

  // Schedule scraper run at 5:00 AM every day
  cron.schedule('0 5 * * *', async () => {
    console.log('\n🌅 Daily scraper job started at 5:00 AM');
    
    try {
      // Run all scrapers and cache results
      const results = await runAllScrapersAndCache();
      
      // Log summary
      const successfulScrapers = Object.entries(results)
        .filter(([_, result]) => result.success)
        .map(([source, _]) => source);
      
      const failedScrapers = Object.entries(results)
        .filter(([_, result]) => !result.success)
        .map(([source, _]) => source);

      console.log(`✅ Daily scraper job completed successfully`);
      console.log(`   Successful: ${successfulScrapers.join(', ')}`);
      if (failedScrapers.length > 0) {
        console.log(`   Failed: ${failedScrapers.join(', ')}`);
      }

      // Clean up old cache entries
      await cleanupOldCache();
      
    } catch (error) {
      console.error('❌ Daily scraper job failed:', error);
    }
  }, {
    timezone: "America/New_York" // Server timezone
  });

  // Also run cleanup at midnight every Sunday
  cron.schedule('0 0 * * 0', async () => {
    console.log('🧹 Running weekly cache cleanup...');
    await cleanupOldCache();
  }, {
    timezone: "America/New_York"
  });

  schedulerInitialized = true;
  console.log('📅 Daily scraper scheduler initialized - runs at 5:00 AM daily');
}

/**
 * Manually trigger the daily scraper job (for testing or immediate refresh)
 */
export async function triggerManualScraperRun(): Promise<void> {
  console.log('🔄 Manual scraper run triggered...');
  
  try {
    const results = await runAllScrapersAndCache();
    
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`✅ Manual scraper run completed: ${successCount}/${totalCount} successful`);
    
  } catch (error) {
    console.error('❌ Manual scraper run failed:', error);
    throw error;
  }
}

/**
 * Gets the next scheduled run time
 */
export function getNextScheduledRun(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(5, 0, 0, 0);
  
  return tomorrow.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}