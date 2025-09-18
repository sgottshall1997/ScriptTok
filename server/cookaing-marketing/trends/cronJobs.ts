import * as cron from 'node-cron';
import { trendingDetectorService } from './trendingDetector.js';
import { seasonalGeneratorService } from './seasonalGenerator.js';

export class TrendingCronJobs {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    // Initialize with default schedules but don't start yet
    this.initializeJobs();
  }

  private initializeJobs() {
    console.log('🕐 Initializing trending detection cron jobs...');
    
    // Daily trending detection at 6:00 AM
    const trendingJob = cron.schedule('0 6 * * *', async () => {
      console.log('🔍 Starting daily trending detection...');
      try {
        await trendingDetectorService.detectTrends();
        console.log('✅ Daily trending detection completed');
      } catch (error) {
        console.error('❌ Daily trending detection failed:', error);
      }
    }, false); // Don't start automatically

    // Daily seasonal content check at 7:00 AM
    const seasonalJob = cron.schedule('0 7 * * *', async () => {
      console.log('🎃 Starting seasonal content generation...');
      try {
        await seasonalGeneratorService.generateSeasonalContent();
        console.log('✅ Seasonal content generation completed');
      } catch (error) {
        console.error('❌ Seasonal content generation failed:', error);
      }
    }, false); // Don't start automatically

    this.jobs.set('trending_detector', trendingJob);
    this.jobs.set('seasonal_generator', seasonalJob);

    console.log('✅ Trending cron jobs initialized (not started)');
  }

  startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (!job) {
      console.error(`❌ Job '${jobName}' not found`);
      return false;
    }

    if (!job.running) {
      job.start();
      console.log(`▶️ Started job: ${jobName}`);
      return true;
    } else {
      console.log(`⏸️ Job '${jobName}' is already running`);
      return false;
    }
  }

  stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (!job) {
      console.error(`❌ Job '${jobName}' not found`);
      return false;
    }

    if (job.running) {
      job.stop();
      console.log(`⏹️ Stopped job: ${jobName}`);
      return true;
    } else {
      console.log(`▶️ Job '${jobName}' is already stopped`);
      return false;
    }
  }

  startAllJobs(): void {
    console.log('▶️ Starting all trending cron jobs...');
    for (const [jobName, job] of Array.from(this.jobs.entries())) {
      if (!job.running) {
        job.start();
        console.log(`✅ Started: ${jobName}`);
      }
    }
  }

  stopAllJobs(): void {
    console.log('⏹️ Stopping all trending cron jobs...');
    for (const [jobName, job] of Array.from(this.jobs.entries())) {
      if (job.running) {
        job.stop();
        console.log(`🛑 Stopped: ${jobName}`);
      }
    }
  }

  getJobStatus(): Record<string, { running: boolean; nextRun?: string }> {
    const status: Record<string, { running: boolean; nextRun?: string }> = {};
    
    for (const [jobName, job] of Array.from(this.jobs.entries())) {
      status[jobName] = {
        running: job.running || false,
        // nextRun would require additional tracking - simplified for now
      };
    }

    return status;
  }

  // Manual trigger methods for testing
  async triggerTrendingDetection(): Promise<void> {
    console.log('🔍 Manually triggering trending detection...');
    try {
      await trendingDetectorService.detectTrends();
      console.log('✅ Manual trending detection completed');
    } catch (error) {
      console.error('❌ Manual trending detection failed:', error);
      throw error;
    }
  }

  async triggerSeasonalGeneration(): Promise<void> {
    console.log('🎃 Manually triggering seasonal generation...');
    try {
      await seasonalGeneratorService.generateSeasonalContent();
      console.log('✅ Manual seasonal generation completed');
    } catch (error) {
      console.error('❌ Manual seasonal generation failed:', error);
      throw error;
    }
  }

  // Configuration management
  enableService(serviceName: 'trending_detector' | 'seasonal_generator'): void {
    if (serviceName === 'trending_detector') {
      trendingDetectorService.enable();
      this.startJob('trending_detector');
    } else if (serviceName === 'seasonal_generator') {
      seasonalGeneratorService.enable();
      this.startJob('seasonal_generator');
    }
  }

  disableService(serviceName: 'trending_detector' | 'seasonal_generator'): void {
    if (serviceName === 'trending_detector') {
      trendingDetectorService.disable();
      this.stopJob('trending_detector');
    } else if (serviceName === 'seasonal_generator') {
      seasonalGeneratorService.disable();
      this.stopJob('seasonal_generator');
    }
  }

  getServiceConfigs(): {
    trending_detector: any;
    seasonal_generator: any;
  } {
    return {
      trending_detector: trendingDetectorService.getConfig(),
      seasonal_generator: seasonalGeneratorService.getConfig()
    };
  }
}

export const trendingCronJobs = new TrendingCronJobs();