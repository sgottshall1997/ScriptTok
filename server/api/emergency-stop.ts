import { Request, Response } from 'express';
import { db } from '../db.js';
import { bulkContentJobs, scheduledBulkJobs } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Emergency stop all generation processes
export async function emergencyStopAll(req: Request, res: Response) {
  try {
    console.log('🚨 EMERGENCY STOP: Halting all content generation processes');
    
    // Stop all bulk content jobs
    const pendingBulkJobs = await db.update(bulkContentJobs)
      .set({ 
        status: 'cancelled',
        errorMessage: 'Emergency stop activated',
        updatedAt: new Date()
      })
      .where(eq(bulkContentJobs.status, 'processing'))
      .returning();

    // Stop all scheduled jobs
    const scheduledJobs = await db.update(scheduledBulkJobs)
      .set({ 
        isActive: false,
        errorMessage: 'Emergency stop activated',
        updatedAt: new Date()
      })
      .where(eq(scheduledBulkJobs.isActive, true))
      .returning();

    // Stop all active cron jobs
    const { stopAllCronJobs } = await import('./scheduled-bulk-generation.js');
    await stopAllCronJobs();

    console.log(`✅ Emergency stop completed: ${pendingBulkJobs.length} bulk jobs cancelled, ${scheduledJobs.length} scheduled jobs stopped`);

    res.json({
      success: true,
      message: 'Emergency stop completed successfully',
      bulkJobsCancelled: pendingBulkJobs.length,
      scheduledJobsStopped: scheduledJobs.length
    });

  } catch (error) {
    console.error('❌ Emergency stop error:', error);
    res.status(500).json({
      success: false,
      error: 'Emergency stop failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get system status
export async function getSystemStatus(req: Request, res: Response) {
  try {
    const activeBulkJobs = await db.select()
      .from(bulkContentJobs)
      .where(eq(bulkContentJobs.status, 'processing'));

    const activeScheduledJobs = await db.select()
      .from(scheduledBulkJobs)
      .where(eq(scheduledBulkJobs.isActive, true));

    res.json({
      success: true,
      systemStatus: {
        activeBulkJobs: activeBulkJobs.length,
        activeScheduledJobs: activeScheduledJobs.length,
        totalActiveProcesses: activeBulkJobs.length + activeScheduledJobs.length,
        lastCheck: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ System status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}