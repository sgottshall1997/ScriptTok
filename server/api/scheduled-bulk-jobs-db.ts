import { Request, Response } from 'express';
import { db } from '../db.js';
import { scheduledBulkJobs, insertScheduledBulkJobSchema } from '@shared/schema';
import { eq } from 'drizzle-orm';
import * as cron from 'node-cron';
import { startAutomatedBulkGeneration } from './automated-bulk-generation.js';

// Store for active scheduled jobs (in-memory cron jobs)
const activeScheduledJobs = new Map<string, any>();

// Initialize scheduled jobs from database on server start
export async function initializeScheduledJobs() {
  try {
    const activeJobs = await db.select()
      .from(scheduledBulkJobs)
      .where(eq(scheduledBulkJobs.isActive, true));
    
    console.log(`🔄 INITIALIZING ${activeJobs.length} scheduled jobs from database`);
    
    for (const job of activeJobs) {
      await startCronJob(job);
    }
    
    console.log(`✅ INITIALIZED ${activeJobs.length} scheduled jobs successfully`);
  } catch (error) {
    console.error('❌ Failed to initialize scheduled jobs:', error);
  }
}

// Start a cron job for a scheduled bulk job
async function startCronJob(job: any) {
  try {
    const [hours, minutes] = job.scheduleTime.split(':').map(Number);
    const cronPattern = `${minutes} ${hours} * * *`;
    
    const cronJob = cron.schedule(cronPattern, async () => {
      console.log(`⏰ EXECUTING SCHEDULED BULK JOB: ${job.id}`);
      
      try {
        // Update last run timestamp
        await db.update(scheduledBulkJobs)
          .set({ 
            lastRunAt: new Date(),
            totalRuns: job.totalRuns + 1 
          })
          .where(eq(scheduledBulkJobs.id, job.id));
        
        // Execute the bulk generation
        const mockReq = {
          body: {
            selectedNiches: job.selectedNiches,
            tones: job.tones,
            templates: job.templates,
            platforms: job.platforms,
            useExistingProducts: job.useExistingProducts,
            generateAffiliateLinks: job.generateAffiliateLinks,
            useSpartanFormat: job.useSpartanFormat,
            useSmartStyle: job.useSmartStyle,
            aiModels: [job.aiModel],
            contentFormats: ['Regular Format'],
            affiliateId: job.affiliateId,
            webhookUrl: job.webhookUrl,
            sendToMakeWebhook: job.sendToMakeWebhook,
            isScheduled: false
          },
          headers: {
            'x-generation-source': 'scheduled_job',
            'user-agent': 'GlowBot-Scheduler/1.0',
            'x-forwarded-for': '127.0.0.1'
          },
          get: function(headerName: string) {
            return this.headers[headerName.toLowerCase()] || '';
          }
        } as Request;
        
        let executionSuccess = false;
        
        const mockRes = {
          json: (data: any) => {
            executionSuccess = data.success;
            console.log(`✅ SCHEDULED BULK COMPLETED: ${job.id}`, data.success ? 'SUCCESS' : 'FAILED');
          },
          status: (code: number) => ({
            json: (data: any) => {
              executionSuccess = false;
              console.error(`❌ SCHEDULED BULK ERROR: ${job.id} - Status ${code}`, data);
            }
          })
        } as any;
        
        await startAutomatedBulkGeneration(mockReq, mockRes);
        
        // Update job statistics
        if (executionSuccess) {
          await db.update(scheduledBulkJobs)
            .set({ 
              consecutiveFailures: 0,
              lastError: null
            })
            .where(eq(scheduledBulkJobs.id, job.id));
        } else {
          await db.update(scheduledBulkJobs)
            .set({ 
              consecutiveFailures: job.consecutiveFailures + 1,
              lastError: `Execution failed at ${new Date().toISOString()}`
            })
            .where(eq(scheduledBulkJobs.id, job.id));
        }
        
      } catch (error) {
        console.error(`❌ SCHEDULED BULK EXECUTION ERROR: ${job.id}`, error);
        
        await db.update(scheduledBulkJobs)
          .set({ 
            consecutiveFailures: job.consecutiveFailures + 1,
            lastError: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
          .where(eq(scheduledBulkJobs.id, job.id));
      }
    }, {
      scheduled: true,
      timezone: job.timezone
    });
    
    // Store cron job in memory
    activeScheduledJobs.set(job.id.toString(), {
      cronJob,
      jobData: job
    });
    
    console.log(`✅ Started cron job for scheduled bulk job: ${job.id}`);
  } catch (error) {
    console.error(`❌ Failed to start cron job for ${job.id}:`, error);
  }
}

// Database-persistent scheduling function
export async function createScheduledBulkJob(req: Request, res: Response) {
  try {
    const validatedData = req.body;
    
    if (!validatedData.scheduleTime) {
      return res.status(400).json({
        success: false,
        error: 'Schedule time required for scheduled generation'
      });
    }

    // Convert time format (HH:mm) to cron format
    const [hours, minutes] = validatedData.scheduleTime.split(':').map(Number);
    const cronPattern = `${minutes} ${hours} * * *`;
    
    // Check if the scheduled time is in the future today
    const now = new Date();
    const scheduledToday = new Date();
    scheduledToday.setHours(hours, minutes, 0, 0);
    
    const isScheduledForFuture = scheduledToday > now;
    
    console.log(`📅 SCHEDULING: Creating scheduled bulk job for ${validatedData.scheduleTime} (${cronPattern})`);
    console.log(`⏰ Current time: ${now.toLocaleTimeString()}, Scheduled time today: ${scheduledToday.toLocaleTimeString()}`);
    console.log(`🔮 Will ${isScheduledForFuture ? 'run today at' : 'run tomorrow at'} ${validatedData.scheduleTime}`);
    
    // Calculate next run time
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, set for tomorrow
    const willRunToday = nextRun > now;
    if (!willRunToday) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    // Generate name for the job
    const niches = validatedData.selectedNiches || [];
    const tones = validatedData.tones || [];
    const nicheText = niches.length === 1 ? niches[0] : `${niches.length} niches`;
    const toneText = tones.length === 1 ? tones[0] : `${tones.length} tones`;
    const jobName = `Daily ${nicheText} content (${toneText})`;
    
    // Save to database
    const [savedJob] = await db.insert(scheduledBulkJobs).values({
      userId: 1, // Default user ID for now
      name: jobName,
      scheduleTime: validatedData.scheduleTime,
      timezone: validatedData.timezone || 'America/New_York',
      isActive: true,
      selectedNiches: validatedData.selectedNiches,
      tones: validatedData.tones,
      templates: validatedData.templates,
      platforms: validatedData.platforms,
      useExistingProducts: validatedData.useExistingProducts || true,
      generateAffiliateLinks: validatedData.generateAffiliateLinks || false,
      useSpartanFormat: validatedData.useSpartanFormat || false,
      useSmartStyle: validatedData.useSmartStyle || false,
      aiModel: validatedData.aiModels?.[0] || 'claude',
      affiliateId: validatedData.affiliateId || 'sgottshall107-20',
      webhookUrl: validatedData.webhookUrl,
      sendToMakeWebhook: validatedData.sendToMakeWebhook || true,
      nextRunAt: nextRun,
      totalRuns: 0,
      consecutiveFailures: 0
    }).returning();
    
    // Start the cron job
    await startCronJob(savedJob);
    
    const nextRunTime = willRunToday ? 'today' : 'tomorrow';
    
    res.json({
      success: true,
      scheduledJobId: savedJob.id,
      scheduleTime: validatedData.scheduleTime,
      timezone: validatedData.timezone,
      cronPattern,
      willRunToday,
      nextRun: willRunToday ? `Today at ${validatedData.scheduleTime}` : `Tomorrow at ${validatedData.scheduleTime}`,
      message: `Bulk generation scheduled for daily execution. Next run: ${nextRunTime} at ${validatedData.scheduleTime} ${validatedData.timezone}`
    });
    
  } catch (error) {
    console.error('❌ Create scheduled bulk generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create scheduled bulk generation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get active scheduled jobs from database
export async function getScheduledBulkJobs(req: Request, res: Response) {
  try {
    const jobs = await db.select()
      .from(scheduledBulkJobs)
      .where(eq(scheduledBulkJobs.isActive, true));
    
    const jobsWithNextRun = jobs.map(job => {
      // Calculate next run time
      const [hours, minutes] = job.scheduleTime.split(':').map(Number);
      const nextRun = new Date();
      nextRun.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, set for tomorrow
      if (nextRun <= new Date()) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      return {
        id: job.id,
        name: job.name,
        scheduleTime: job.scheduleTime,
        timezone: job.timezone,
        createdAt: job.createdAt,
        isActive: activeScheduledJobs.has(job.id.toString()),
        nextRunAt: nextRun.toISOString(),
        totalRuns: job.totalRuns || 0,
        consecutiveFailures: job.consecutiveFailures || 0,
        lastError: job.lastError || null,
        config: {
          selectedNiches: job.selectedNiches,
          tones: job.tones,
          templates: job.templates,
          platforms: job.platforms,
          aiModels: [job.aiModel],
          contentFormats: ['Regular Format']
        }
      };
    });
    
    res.json({
      success: true,
      jobs: jobsWithNextRun,
      total: jobsWithNextRun.length
    });
    
  } catch (error) {
    console.error('❌ Get scheduled bulk jobs error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get scheduled bulk jobs'
    });
  }
}

// Stop and delete a scheduled job
export async function stopScheduledBulkJob(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    
    // Find job in database
    const [job] = await db.select()
      .from(scheduledBulkJobs)
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)))
      .limit(1);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled job not found'
      });
    }
    
    // Stop the cron job if it exists
    const cronJobData = activeScheduledJobs.get(jobId);
    if (cronJobData) {
      cronJobData.cronJob.stop();
      cronJobData.cronJob.destroy();
      activeScheduledJobs.delete(jobId);
    }
    
    // Mark job as inactive in database
    await db.update(scheduledBulkJobs)
      .set({ isActive: false })
      .where(eq(scheduledBulkJobs.id, parseInt(jobId)));
    
    console.log(`🛑 STOPPED SCHEDULED BULK JOB: ${jobId}`);
    
    res.json({
      success: true,
      message: `Scheduled bulk job ${jobId} stopped successfully`
    });
    
  } catch (error) {
    console.error('❌ Stop scheduled bulk job error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to stop scheduled bulk job'
    });
  }
}