import { Request, Response } from 'express';
import { db } from '../db';
import { scheduledBulkJobs, insertScheduledBulkJobSchema } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import cron from 'node-cron';

// Store for active cron jobs
const activeCronJobs = new Map<number, cron.ScheduledTask>();

// Get all scheduled jobs for a user
export async function getScheduledJobs(req: Request, res: Response) {
  try {
    const userId = 1; // For now, hardcode user ID
    
    const jobs = await db
      .select()
      .from(scheduledBulkJobs)
      .where(eq(scheduledBulkJobs.userId, userId))
      .orderBy(scheduledBulkJobs.createdAt);

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled jobs'
    });
  }
}

// Create a new scheduled job
export async function createScheduledJob(req: Request, res: Response) {
  try {
    const userId = 1; // For now, hardcode user ID
    
    // Validate request body
    const validatedData = insertScheduledBulkJobSchema.parse({
      ...req.body,
      userId
    });

    // Calculate next run time
    const nextRunAt = calculateNextRunTime(validatedData.scheduleTime, validatedData.timezone);

    // Insert the job
    const [newJob] = await db
      .insert(scheduledBulkJobs)
      .values({
        ...validatedData,
        nextRunAt
      })
      .returning();

    // Start the cron job
    await startCronJob(newJob);

    res.json({
      success: true,
      job: newJob
    });
  } catch (error) {
    console.error('Error creating scheduled job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scheduled job'
    });
  }
}

// Update a scheduled job
export async function updateScheduledJob(req: Request, res: Response) {
  try {
    const jobId = parseInt(req.params.id);
    const userId = 1; // For now, hardcode user ID

    // Stop existing cron job if it exists
    if (activeCronJobs.has(jobId)) {
      activeCronJobs.get(jobId)?.stop();
      activeCronJobs.delete(jobId);
    }

    // Update the job
    const [updatedJob] = await db
      .update(scheduledBulkJobs)
      .set({
        ...req.body,
        nextRunAt: req.body.scheduleTime ? calculateNextRunTime(req.body.scheduleTime, req.body.timezone || 'America/New_York') : undefined,
        updatedAt: new Date()
      })
      .where(and(
        eq(scheduledBulkJobs.id, jobId),
        eq(scheduledBulkJobs.userId, userId)
      ))
      .returning();

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled job not found'
      });
    }

    // Restart cron job if it's active
    if (updatedJob.isActive) {
      await startCronJob(updatedJob);
    }

    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating scheduled job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scheduled job'
    });
  }
}

// Delete a scheduled job
export async function deleteScheduledJob(req: Request, res: Response) {
  try {
    const jobId = parseInt(req.params.id);
    const userId = 1; // For now, hardcode user ID

    // Stop the cron job if it exists
    if (activeCronJobs.has(jobId)) {
      activeCronJobs.get(jobId)?.stop();
      activeCronJobs.delete(jobId);
    }

    // Delete the job
    const deletedJob = await db
      .delete(scheduledBulkJobs)
      .where(and(
        eq(scheduledBulkJobs.id, jobId),
        eq(scheduledBulkJobs.userId, userId)
      ))
      .returning();

    if (deletedJob.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled job not found'
      });
    }

    res.json({
      success: true,
      message: 'Scheduled job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheduled job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete scheduled job'
    });
  }
}

// Manually trigger a scheduled job
export async function triggerScheduledJob(req: Request, res: Response) {
  try {
    const jobId = parseInt(req.params.id);
    const userId = 1; // For now, hardcode user ID

    // Get the job
    const [job] = await db
      .select()
      .from(scheduledBulkJobs)
      .where(and(
        eq(scheduledBulkJobs.id, jobId),
        eq(scheduledBulkJobs.userId, userId)
      ));

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled job not found'
      });
    }

    // Execute the job
    const result = await executeScheduledJob(job);

    res.json({
      success: true,
      message: 'Job triggered manually',
      result
    });
  } catch (error) {
    console.error('Error triggering scheduled job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scheduled job'
    });
  }
}

// Helper function to calculate next run time
function calculateNextRunTime(scheduleTime: string, timezone: string): Date {
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  const now = new Date();
  const nextRun = new Date();
  
  nextRun.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun;
}

// Helper function to start a cron job
async function startCronJob(job: any) {
  if (!job.isActive) return;

  // 🚫 CRITICAL SAFEGUARD: Check if scheduled generation is allowed
  const { validateGenerationRequest } = await import('../config/generation-safeguards');
  const mockRequest = {
    headers: {
      'user-agent': 'scheduled-job-runner',
      'x-generation-source': 'scheduled_job'
    }
  };
  
  const validation = validateGenerationRequest(mockRequest);
  
  if (!validation.allowed) {
    console.log(`🚫 SCHEDULED JOB STARTUP BLOCKED: ${validation.reason}`);
    console.log(`   Job "${job.name}" will not be started due to safeguard restrictions`);
    return;
  }

  // Convert schedule time to cron format (minute hour * * *)
  const [hours, minutes] = job.scheduleTime.split(':').map(Number);
  const cronExpression = `${minutes} ${hours} * * *`;

  console.log(`📅 Starting scheduled job "${job.name}" with cron: ${cronExpression}`);

  const task = cron.schedule(cronExpression, async () => {
    console.log(`🔄 Executing scheduled job: ${job.name}`);
    try {
      await executeScheduledJob(job);
    } catch (error) {
      console.error(`❌ Error executing scheduled job ${job.name}:`, error);
    }
  }, {
    scheduled: true,
    timezone: job.timezone
  });

  activeCronJobs.set(job.id, task);
}

// Helper function to execute a scheduled job
async function executeScheduledJob(job: any) {
  try {
    console.log(`🚀 Attempting scheduled bulk generation: ${job.name}`);
    
    // 🚫 CRITICAL SAFEGUARD: Apply generation safeguards to scheduled jobs
    const { validateGenerationRequest } = await import('../config/generation-safeguards');
    const mockRequest = {
      headers: {
        'user-agent': 'scheduled-job-runner',
        'x-generation-source': 'scheduled_job'
      }
    };
    
    const validation = validateGenerationRequest(mockRequest);
    
    if (!validation.allowed) {
      console.log(`🚫 SCHEDULED JOB BLOCKED: ${validation.reason}`);
      
      // Update job with blocked status
      await db
        .update(scheduledBulkJobs)
        .set({
          lastRunAt: new Date(),
          lastError: `Blocked by safeguards: ${validation.reason}`,
          consecutiveFailures: job.consecutiveFailures + 1
        })
        .where(eq(scheduledBulkJobs.id, job.id));
      
      throw new Error(`Scheduled job blocked by safeguards: ${validation.reason}`);
    }
    
    console.log(`🟢 SAFEGUARD: Scheduled job "${job.name}" validated - proceeding with generation`);
    
    // Update last run time and increment total runs
    await db
      .update(scheduledBulkJobs)
      .set({
        lastRunAt: new Date(),
        totalRuns: job.totalRuns + 1,
        nextRunAt: calculateNextRunTime(job.scheduleTime, job.timezone),
        consecutiveFailures: 0, // Reset on successful start
        lastError: null
      })
      .where(eq(scheduledBulkJobs.id, job.id));

    // Prepare the request payload for the unified generator
    const payload = {
      mode: 'automated',
      selectedNiches: job.selectedNiches,
      tones: job.tones,
      templates: job.templates,
      platforms: job.platforms,
      useExistingProducts: job.useExistingProducts,
      generateAffiliateLinks: job.generateAffiliateLinks,
      useSpartanFormat: job.useSpartanFormat,
      useSmartStyle: job.useSmartStyle,
      aiModel: job.aiModel || 'claude', // CRITICAL FIX: Pass AI model from scheduled job
      affiliateId: job.affiliateId,
      webhookUrl: job.webhookUrl,
      sendToMakeWebhook: job.sendToMakeWebhook,
      userId: job.userId,
      scheduledJobId: job.id, // Track that this was from a scheduled job
      scheduledJobName: job.name
    };

    console.log(`🤖 SCHEDULED JOB AI MODEL: "${payload.aiModel}" (from job.aiModel: "${job.aiModel}")`);
    console.log(`🎯 NICHE LIST: [${payload.selectedNiches.join(', ')}] - Expecting exactly ${payload.selectedNiches.length} outputs`);
    console.log(`🎭 GENERATION PARAMS: Tones: [${payload.tones.join(', ')}], Templates: [${payload.templates.join(', ')}]`);

    // Call the unified content generator
    const response = await fetch('http://localhost:5000/api/generate-unified', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-generation-source': 'scheduled_job'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Content generation failed');
    }

    console.log(`✅ Scheduled job "${job.name}" completed successfully`);
    return result;

  } catch (error) {
    console.error(`❌ Error executing scheduled job ${job.name}:`, error);
    
    // Update failure count and error
    await db
      .update(scheduledBulkJobs)
      .set({
        consecutiveFailures: job.consecutiveFailures + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      })
      .where(eq(scheduledBulkJobs.id, job.id));

    throw error;
  }
}

// Initialize all active scheduled jobs on server start
export async function initializeScheduledJobs() {
  try {
    console.log('📅 Initializing scheduled bulk generation jobs...');
    
    // 🚫 CRITICAL SAFEGUARD: Check if scheduled generation is allowed
    const { validateGenerationRequest } = await import('../config/generation-safeguards');
    const mockRequest = {
      headers: {
        'user-agent': 'scheduled-job-init',
        'x-generation-source': 'scheduled_job'
      }
    };
    
    const validation = validateGenerationRequest(mockRequest);
    
    if (!validation.allowed) {
      console.log(`🚫 SCHEDULED JOB INITIALIZATION BLOCKED: ${validation.reason}`);
      console.log('   No scheduled jobs will be started due to safeguard restrictions');
      return;
    }
    
    const activeJobs = await db
      .select()
      .from(scheduledBulkJobs)
      .where(eq(scheduledBulkJobs.isActive, true));

    for (const job of activeJobs) {
      await startCronJob(job);
    }

    console.log(`📅 Initialized ${activeJobs.length} scheduled jobs`);
  } catch (error) {
    console.error('Error initializing scheduled jobs:', error);
  }
}