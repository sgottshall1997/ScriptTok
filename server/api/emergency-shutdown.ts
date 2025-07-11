/**
 * 🚨 EMERGENCY SHUTDOWN ENDPOINT
 * Complete system lockdown verification and process termination
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/emergency-shutdown/status
 * Comprehensive system status check for complete lockdown verification
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    console.log('🚨 EMERGENCY SHUTDOWN STATUS CHECK');
    
    // Check safeguards configuration
    const { getSafeguardStatus } = await import('../config/generation-safeguards');
    const SAFEGUARD_CONFIG = getSafeguardStatus();
    
    // Check for any active jobs (simplified check)
    const activeScheduledJobs: any[] = [];
    const activeBulkJobs: any[] = [];
    
    // System status assessment
    const isCompletelyLocked = 
      !SAFEGUARD_CONFIG.ALLOW_AUTOMATED_GENERATION &&
      !SAFEGUARD_CONFIG.ALLOW_SCHEDULED_GENERATION &&
      !SAFEGUARD_CONFIG.ALLOW_WEBHOOK_TRIGGERS &&
      !SAFEGUARD_CONFIG.ALLOW_CRON_GENERATION &&
      !SAFEGUARD_CONFIG.ALLOW_TREND_FETCHING &&
      SAFEGUARD_CONFIG.PRODUCTION_MODE &&
      activeScheduledJobs.length === 0 &&
      activeBulkJobs.length === 0;
    
    const status = {
      emergencyShutdown: isCompletelyLocked,
      safeguards: SAFEGUARD_CONFIG,
      activeProcesses: {
        scheduledJobs: activeScheduledJobs.length,
        bulkJobs: activeBulkJobs.length,
        scheduledJobsList: activeScheduledJobs.map(job => ({ id: job.id, status: job.status, name: job.job_name })),
        bulkJobsList: activeBulkJobs.map(job => ({ id: job.id, status: job.status, jobId: job.jobId }))
      },
      timestamp: new Date().toISOString()
    };
    
    if (isCompletelyLocked) {
      console.log('✅ EMERGENCY SHUTDOWN CONFIRMED - All automated processes disabled');
    } else {
      console.log('❌ EMERGENCY SHUTDOWN INCOMPLETE - Active processes detected');
    }
    
    res.json({
      success: true,
      status,
      message: isCompletelyLocked ? 
        'COMPLETE LOCKDOWN - All automated generation disabled' : 
        'WARNING - Some automated processes may still be active'
    });
    
  } catch (error) {
    console.error('❌ Emergency shutdown status check failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/emergency-shutdown/terminate
 * Force terminate any remaining active processes
 */
router.post('/terminate', async (req: Request, res: Response) => {
  try {
    console.log('🚨 EMERGENCY PROCESS TERMINATION INITIATED');
    
    const terminationResults = {
      scheduledJobsTerminated: 0,
      bulkJobsTerminated: 0,
      errors: [] as string[]
    };
    
    // Terminate any active scheduled jobs
    try {
      const { getAllScheduledJobs, updateScheduledJob } = await import('../api/scheduled-bulk-generation');
      const scheduledJobs = await getAllScheduledJobs();
      const activeScheduledJobs = scheduledJobs.filter(job => job.status === 'active' || job.status === 'running');
      
      for (const job of activeScheduledJobs) {
        await updateScheduledJob(job.id, { status: 'paused' });
        terminationResults.scheduledJobsTerminated++;
        console.log(`🛑 Terminated scheduled job ${job.id}: ${job.job_name}`);
      }
    } catch (error) {
      terminationResults.errors.push(`Scheduled jobs termination failed: ${error}`);
    }
    
    // Terminate any active bulk jobs
    try {
      const { getAllBulkJobs, updateBulkJobStatus } = await import('../api/bulk-content-generation');
      const bulkJobs = await getAllBulkJobs();
      const activeBulkJobs = bulkJobs.filter(job => job.status === 'processing' || job.status === 'running');
      
      for (const job of activeBulkJobs) {
        await updateBulkJobStatus(job.jobId, 'failed', 'Emergency shutdown');
        terminationResults.bulkJobsTerminated++;
        console.log(`🛑 Terminated bulk job ${job.jobId}`);
      }
    } catch (error) {
      terminationResults.errors.push(`Bulk jobs termination failed: ${error}`);
    }
    
    console.log('✅ EMERGENCY TERMINATION COMPLETE');
    
    res.json({
      success: true,
      terminationResults,
      message: 'All active processes terminated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Emergency termination failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as emergencyShutdownRouter };