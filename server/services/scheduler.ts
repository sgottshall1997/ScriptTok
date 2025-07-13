/**
 * UNIFIED SCHEDULER MODULE
 * Handles creation, management, and execution of all scheduled content generation jobs
 */

import * as cron from 'node-cron';
import { db } from '../db';
import { scheduledBulkJobs } from '../../shared/schema';
import { generateUnifiedContent, ContentGenerationConfig } from './unifiedContentGenerator';
import { sendToWebhook } from './webhookDispatcher';
import { eq, and } from 'drizzle-orm';

export interface ScheduleConfig {
  jobName: string;
  niches: string[];
  tones: string[];
  templates: string[];
  platforms: string[];
  aiModel: 'chatgpt' | 'claude';
  contentFormat: 'regular' | 'spartan';
  useSmartStyle: boolean;
  cronExpression: string;
  isActive: boolean;
  affiliateId?: string;
}

export interface ScheduledJob {
  id: string;
  jobName: string;
  cronExpression: string;
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
  config: ScheduleConfig;
  consecutiveFailures: number;
  lastError?: string;
}

// Store active cron jobs
const activeCronJobs = new Map<string, any>();

/**
 * INITIALIZE SCHEDULER ON SERVER START
 */
export async function initializeScheduler(): Promise<void> {
  console.log('🔄 Initializing content generation scheduler...');
  
  try {
    const existingJobs = await db.select().from(scheduledBulkJobs).where(eq(scheduledBulkJobs.isActive, true));
    
    for (const job of existingJobs) {
      await startScheduledJob(job);
    }
    
    console.log(`✅ Scheduler initialized with ${existingJobs.length} active jobs`);
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
  }
}

/**
 * CREATE NEW SCHEDULED JOB
 */
export async function createScheduledJob(config: ScheduleConfig): Promise<string> {
  console.log(`📝 Creating scheduled job: ${config.jobName}`);
  
  // Validate cron expression
  if (!cron.validate(config.cronExpression)) {
    throw new Error(`Invalid cron expression: ${config.cronExpression}`);
  }

  try {
    const [newJob] = await db.insert(scheduledBulkJobs).values({
      jobName: config.jobName,
      niches: config.niches,
      tones: config.tones,
      templates: config.templates,
      platforms: config.platforms,
      aiModel: config.aiModel,
      useSpartanFormat: config.contentFormat === 'spartan',
      useSmartStyle: config.useSmartStyle,
      cronExpression: config.cronExpression,
      isActive: config.isActive,
      affiliateId: config.affiliateId || 'sgottshall107-20',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    if (config.isActive) {
      await startScheduledJob(newJob);
    }

    console.log(`✅ Created scheduled job with ID: ${newJob.id}`);
    return newJob.id.toString();
  } catch (error) {
    console.error('❌ Failed to create scheduled job:', error);
    throw error;
  }
}

/**
 * START SCHEDULED JOB (add to cron)
 */
export async function startScheduledJob(jobData: any): Promise<void> {
  const jobId = jobData.id.toString();
  
  try {
    // Stop existing job if running
    if (activeCronJobs.has(jobId)) {
      activeCronJobs.get(jobId).stop();
      activeCronJobs.delete(jobId);
    }

    // Create new cron job
    const cronJob = cron.schedule(jobData.cronExpression, async () => {
      await executeScheduledJob(jobData);
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    activeCronJobs.set(jobId, cronJob);
    
    console.log(`⏰ Started scheduled job: ${jobData.jobName} (${jobData.cronExpression})`);
  } catch (error) {
    console.error(`❌ Failed to start scheduled job ${jobId}:`, error);
    throw error;
  }
}

/**
 * STOP SCHEDULED JOB
 */
export async function stopScheduledJob(jobId: string): Promise<void> {
  try {
    if (activeCronJobs.has(jobId)) {
      activeCronJobs.get(jobId).stop();
      activeCronJobs.delete(jobId);
    }

    await db.update(scheduledBulkJobs)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)));

    console.log(`⏹️ Stopped scheduled job: ${jobId}`);
  } catch (error) {
    console.error(`❌ Failed to stop scheduled job ${jobId}:`, error);
    throw error;
  }
}

/**
 * EXECUTE SCHEDULED JOB
 */
async function executeScheduledJob(jobData: any): Promise<void> {
  const jobId = jobData.id.toString();
  const startTime = Date.now();
  
  console.log(`🚀 Executing scheduled job: ${jobData.jobName} (ID: ${jobId})`);

  try {
    // Update last run time
    await db.update(scheduledBulkJobs)
      .set({ lastRun: new Date(), updatedAt: new Date() })
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)));

    // Get trending products for each niche
    const trendingProducts = await getTrendingProductsForNiches(jobData.niches);
    
    const generatedContent = [];
    
    // Generate content for each niche
    for (const niche of jobData.niches) {
      const products = trendingProducts[niche] || [];
      
      if (products.length === 0) {
        console.log(`⚠️ No trending products found for niche: ${niche}`);
        continue;
      }

      // Select random product for this niche
      const selectedProduct = products[Math.floor(Math.random() * products.length)];
      
      // Generate random combinations
      const tone = jobData.tones[Math.floor(Math.random() * jobData.tones.length)];
      const template = jobData.templates[Math.floor(Math.random() * jobData.templates.length)];
      
      const config: ContentGenerationConfig = {
        productName: selectedProduct.title,
        niche: niche,
        templateType: template,
        tone: tone,
        platforms: jobData.platforms,
        contentFormat: jobData.useSpartanFormat ? 'spartan' : 'regular',
        aiModel: jobData.aiModel,
        affiliateId: jobData.affiliateId,
        trendingProducts: products
      };

      try {
        console.log(`🔄 Generating content for ${selectedProduct.title} (${niche})`);
        const content = await generateUnifiedContent(config);
        
        // Store in database
        const contentEntry = await storeGeneratedContent(content, config, jobId);
        generatedContent.push({ content, config, contentId: contentEntry.id });
        
        console.log(`✅ Generated content for ${selectedProduct.title}`);
      } catch (error) {
        console.error(`❌ Failed to generate content for ${selectedProduct.title}:`, error);
      }
    }

    // Send webhook for each generated content
    for (const item of generatedContent) {
      try {
        await sendToWebhook(item.content, item.config, 'scheduled_bulk');
        console.log(`📤 Webhook sent for ${item.config.productName}`);
      } catch (error) {
        console.error(`❌ Webhook failed for ${item.config.productName}:`, error);
      }
    }

    // Reset consecutive failures on success
    await db.update(scheduledBulkJobs)
      .set({ consecutiveFailures: 0, lastError: null, updatedAt: new Date() })
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)));

    const duration = Date.now() - startTime;
    console.log(`✅ Scheduled job completed: ${jobData.jobName} (${generatedContent.length} items, ${duration}ms)`);

  } catch (error) {
    console.error(`❌ Scheduled job failed: ${jobData.jobName}`, error);
    
    // Update failure count
    const currentFailures = jobData.consecutiveFailures || 0;
    const newFailureCount = currentFailures + 1;
    
    await db.update(scheduledBulkJobs)
      .set({ 
        consecutiveFailures: newFailureCount,
        lastError: error.message,
        updatedAt: new Date(),
        // Disable job after 5 consecutive failures
        isActive: newFailureCount < 5
      })
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)));

    if (newFailureCount >= 5) {
      await stopScheduledJob(jobId);
      console.log(`⏹️ Disabled job ${jobData.jobName} after 5 consecutive failures`);
    }
  }
}

/**
 * GET ALL SCHEDULED JOBS
 */
export async function getScheduledJobs(): Promise<ScheduledJob[]> {
  try {
    const jobs = await db.select().from(scheduledBulkJobs);
    
    return jobs.map(job => ({
      id: job.id.toString(),
      jobName: job.jobName,
      cronExpression: job.cronExpression,
      isActive: job.isActive,
      nextRun: getNextRunTime(job.cronExpression),
      lastRun: job.lastRun?.toISOString(),
      consecutiveFailures: job.consecutiveFailures || 0,
      lastError: job.lastError,
      config: {
        jobName: job.jobName,
        niches: job.niches,
        tones: job.tones,
        templates: job.templates,
        platforms: job.platforms,
        aiModel: job.aiModel,
        contentFormat: job.useSpartanFormat ? 'spartan' : 'regular',
        useSmartStyle: job.useSmartStyle,
        cronExpression: job.cronExpression,
        isActive: job.isActive,
        affiliateId: job.affiliateId
      }
    }));
  } catch (error) {
    console.error('❌ Failed to get scheduled jobs:', error);
    return [];
  }
}

/**
 * UPDATE SCHEDULED JOB
 */
export async function updateScheduledJob(jobId: string, updates: Partial<ScheduleConfig>): Promise<void> {
  try {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (updates.jobName) updateData.jobName = updates.jobName;
    if (updates.niches) updateData.niches = updates.niches;
    if (updates.tones) updateData.tones = updates.tones;
    if (updates.templates) updateData.templates = updates.templates;
    if (updates.platforms) updateData.platforms = updates.platforms;
    if (updates.aiModel) updateData.aiModel = updates.aiModel;
    if (updates.contentFormat !== undefined) updateData.useSpartanFormat = updates.contentFormat === 'spartan';
    if (updates.useSmartStyle !== undefined) updateData.useSmartStyle = updates.useSmartStyle;
    if (updates.cronExpression) updateData.cronExpression = updates.cronExpression;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.affiliateId) updateData.affiliateId = updates.affiliateId;

    await db.update(scheduledBulkJobs)
      .set(updateData)
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)));

    // Restart job if active and cron expression changed
    if (updates.isActive && updates.cronExpression) {
      const jobData = await db.select().from(scheduledBulkJobs).where(eq(scheduledBulkJobs.id, parseInt(jobId)));
      if (jobData.length > 0) {
        await startScheduledJob(jobData[0]);
      }
    }

    console.log(`✅ Updated scheduled job: ${jobId}`);
  } catch (error) {
    console.error(`❌ Failed to update scheduled job ${jobId}:`, error);
    throw error;
  }
}

/**
 * DELETE SCHEDULED JOB
 */
export async function deleteScheduledJob(jobId: string): Promise<void> {
  try {
    // Stop the cron job
    await stopScheduledJob(jobId);
    
    // Delete from database
    await db.delete(scheduledBulkJobs).where(eq(scheduledBulkJobs.id, parseInt(jobId)));
    
    console.log(`🗑️ Deleted scheduled job: ${jobId}`);
  } catch (error) {
    console.error(`❌ Failed to delete scheduled job ${jobId}:`, error);
    throw error;
  }
}

/**
 * MANUALLY TRIGGER SCHEDULED JOB
 */
export async function triggerScheduledJob(jobId: string): Promise<void> {
  try {
    const jobData = await db.select().from(scheduledBulkJobs).where(eq(scheduledBulkJobs.id, parseInt(jobId)));
    
    if (jobData.length === 0) {
      throw new Error(`Scheduled job not found: ${jobId}`);
    }

    console.log(`🔄 Manually triggering scheduled job: ${jobData[0].jobName}`);
    await executeScheduledJob(jobData[0]);
  } catch (error) {
    console.error(`❌ Failed to trigger scheduled job ${jobId}:`, error);
    throw error;
  }
}

/**
 * HELPER FUNCTIONS
 */

async function getTrendingProductsForNiches(niches: string[]): Promise<Record<string, any[]>> {
  try {
    // Import the storage dynamically to avoid circular dependencies
    const { storage } = await import('../storage');
    
    const allProducts = await storage.getAllTrendingProducts();
    const productsByNiche: Record<string, any[]> = {};
    
    for (const niche of niches) {
      productsByNiche[niche] = allProducts.filter(p => p.niche === niche).slice(0, 5);
    }
    
    return productsByNiche;
  } catch (error) {
    console.error('❌ Failed to get trending products:', error);
    return {};
  }
}

async function storeGeneratedContent(content: any, config: ContentGenerationConfig, jobId: string): Promise<any> {
  try {
    // Import storage dynamically
    const { storage } = await import('../storage');
    
    return await storage.saveContentGeneration({
      productName: config.productName,
      niche: config.niche,
      templateType: config.templateType,
      tone: config.tone,
      platforms: config.platforms.join(','),
      content: content.script,
      platformContent: JSON.stringify({
        instagram: content.instagramCaption,
        tiktok: content.tiktokCaption,
        youtube: content.youtubeCaption,
        twitter: content.xCaption,
        facebook: content.facebookCaption
      }),
      affiliateLink: content.affiliateLink,
      modelUsed: config.aiModel,
      sessionId: `scheduled_${jobId}_${Date.now()}`,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('❌ Failed to store generated content:', error);
    throw error;
  }
}

function getNextRunTime(cronExpression: string): string {
  try {
    // Simple next run calculation (could be enhanced with a proper cron library)
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: 24 hours from now
    return nextRun.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}