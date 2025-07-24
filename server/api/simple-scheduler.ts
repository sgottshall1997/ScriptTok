/**
 * SIMPLE SCHEDULED BULK GENERATOR
 * Just the automated bulk generator with timing functionality
 */

import { Request, Response } from 'express';
import { db } from '../db.js';
import { scheduledBulkJobs } from '@shared/schema';
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
    
    console.log(`⏰ SCHEDULING JOB ${job.id} for ${job.scheduleTime} (${cronPattern})`);
    
    const cronJob = cron.schedule(cronPattern, async () => {
      console.log(`⏰ EXECUTING SCHEDULED BULK JOB: ${job.id} at ${new Date().toLocaleTimeString()}`);
      
      try {
        // CRITICAL FIX: Re-fetch fresh job data from database before execution
        const [freshJob] = await db.select()
          .from(scheduledBulkJobs)
          .where(eq(scheduledBulkJobs.id, job.id));
        
        if (!freshJob) {
          console.error(`❌ SCHEDULED JOB ${job.id} NOT FOUND IN DATABASE`);
          return;
        }
        
        console.log(`🎯 FRESH JOB PARAMETERS: topRatedStyleUsed=${freshJob.topRatedStyleUsed}, useSpartanFormat=${freshJob.useSpartanFormat}`);
        console.log(`🎯 FULL FRESH JOB OBJECT:`, JSON.stringify(freshJob, null, 2));
        
        // Update last run timestamp
        await db.update(scheduledBulkJobs)
          .set({ 
            lastRunAt: new Date(),
            totalRuns: freshJob.totalRuns + 1 
          })
          .where(eq(scheduledBulkJobs.id, freshJob.id));
        
        // Create exact same request as manual bulk generator using FRESH data
        const scheduledRequest = {
          body: {
            selectedNiches: freshJob.selectedNiches,
            tones: freshJob.tones,
            templates: freshJob.templates,
            platforms: freshJob.platforms,
            aiModels: [freshJob.aiModel],
            contentFormats: freshJob.useSpartanFormat ? ['Spartan Format'] : ['Regular Format'],
            useExistingProducts: freshJob.useExistingProducts,
            generateAffiliateLinks: freshJob.generateAffiliateLinks,
            useSpartanFormat: freshJob.useSpartanFormat,
            topRatedStyleUsed: freshJob.topRatedStyleUsed,
            affiliateId: freshJob.affiliateId || "sgottshall107-20",
            userId: 1
          },
          headers: {
            'x-generation-source': 'scheduled_job',
            'user-agent': 'GlowBot-Scheduler/1.0'
          },
          get: function(headerName: string) {
            return this.headers[headerName.toLowerCase()] || '';
          }
        } as Request;
        
        console.log(`🔍 PARAMETER VERIFICATION - REQUEST BODY:`, {
          useSpartanFormat: scheduledRequest.body.useSpartanFormat,
          topRatedStyleUsed: scheduledRequest.body.topRatedStyleUsed,
          contentFormats: scheduledRequest.body.contentFormats
        });

        const scheduledResponse = {
          json: (data: any) => {
            console.log(`✅ SCHEDULED JOB ${job.id} COMPLETED:`, data.success ? 'SUCCESS' : 'FAILED');
            if (!data.success) {
              console.error(`❌ SCHEDULED JOB ${job.id} ERROR:`, data.error);
            }
          },
          status: (code: number) => ({
            json: (data: any) => {
              console.log(`⚠️ SCHEDULED JOB ${job.id} STATUS ${code}:`, data);
            }
          })
        } as Response;

        // Call the exact same function as manual bulk generator
        await startAutomatedBulkGeneration(scheduledRequest, scheduledResponse);
        
      } catch (executionError) {
        console.error(`❌ SCHEDULED JOB ${job.id} EXECUTION FAILED:`, executionError);
        
        // Update error count using fresh job data
        const currentJob = await db.select()
          .from(scheduledBulkJobs)
          .where(eq(scheduledBulkJobs.id, job.id));
        
        if (currentJob.length > 0) {
          await db.update(scheduledBulkJobs)
            .set({ 
              consecutiveFailures: currentJob[0].consecutiveFailures + 1,
              lastError: String(executionError)
            })
            .where(eq(scheduledBulkJobs.id, job.id));
        }
      }
    }, {
      scheduled: true,
      timezone: job.timezone || 'America/New_York'
    });
    
    activeScheduledJobs.set(job.id.toString(), cronJob);
    console.log(`✅ SCHEDULED JOB ${job.id} ACTIVE (${cronPattern})`);
    
  } catch (error) {
    console.error(`❌ Failed to start scheduled job ${job.id}:`, error);
  }
}

// Create new scheduled job
export async function createScheduledBulkJob(req: Request, res: Response) {
  try {
    const {
      selectedNiches,
      tones,
      templates,
      platforms,
      aiModel,
      useSpartanFormat,
      topRatedStyleUsed,
      useExistingProducts,
      generateAffiliateLinks,
      affiliateId,
      scheduleTime,
      timezone
    } = req.body;

    // Validate required fields
    if (!selectedNiches?.length || !tones?.length || !templates?.length || !platforms?.length || !scheduleTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: selectedNiches, tones, templates, platforms, scheduleTime'
      });
    }

    // Create job in database
    const [newJob] = await db.insert(scheduledBulkJobs).values({
      userId: 1,
      name: `Daily ${selectedNiches.join(', ')} content (${tones.join(', ')})`,
      selectedNiches,
      tones,
      templates,
      platforms,
      aiModel: aiModel || 'claude',
      useSpartanFormat: useSpartanFormat || false,
      topRatedStyleUsed: topRatedStyleUsed || false,
      useExistingProducts: useExistingProducts !== false,
      generateAffiliateLinks: generateAffiliateLinks || false,
      affiliateId: affiliateId || "sgottshall107-20",
      scheduleTime,
      timezone: timezone || 'America/New_York',
      isActive: true,
      totalRuns: 0,
      consecutiveFailures: 0,
      sendToMakeWebhook: true,
      createdAt: new Date()
    }).returning();

    // Start the cron job
    await startCronJob(newJob);

    // Calculate next run time
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    res.json({
      success: true,
      message: 'Scheduled job created successfully',
      jobId: newJob.id,
      scheduleTime,
      nextRun: nextRun.toISOString(),
      willRunToday: nextRun.toDateString() === now.toDateString()
    });

  } catch (error) {
    console.error('Error creating scheduled bulk job:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create scheduled job'
    });
  }
}

// Get all scheduled jobs
export async function getScheduledBulkJobs(req: Request, res: Response) {
  try {
    const jobs = await db.select().from(scheduledBulkJobs);
    
    const jobsWithStatus = jobs.map(job => {
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
          contentFormats: job.useSpartanFormat ? ['Spartan Format'] : ['Regular Format'],
          topRatedStyleUsed: job.topRatedStyleUsed,
          useSpartanFormat: job.useSpartanFormat
        }
      };
    });

    res.json({
      success: true,
      jobs: jobsWithStatus,
      total: jobsWithStatus.length
    });
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled jobs'
    });
  }
}

// Delete scheduled job
export async function deleteScheduledBulkJob(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    // Stop the cron job if running
    const cronJob = activeScheduledJobs.get(jobId);
    if (cronJob) {
      cronJob.stop();
      cronJob.destroy();
      activeScheduledJobs.delete(jobId);
    }

    // Delete from database
    await db.delete(scheduledBulkJobs).where(eq(scheduledBulkJobs.id, parseInt(jobId)));

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

// Helper function to calculate next run time
function calculateNextRun(scheduleTime: string, timezone: string = 'America/New_York'): string {
  const now = new Date();
  const [hours, minutes] = scheduleTime.split(':').map(Number);
  const nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun.toISOString();
}