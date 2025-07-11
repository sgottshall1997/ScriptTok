/**
 * 🔄 PERPLEXITY AUTOMATION CONTROL
 * API endpoints for controlling the daily 5:00 AM Perplexity trend fetching
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/perplexity-automation/status
 * Get current Perplexity automation status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Import safeguards to check current trend fetching status
    const { getSafeguardStatus } = await import('../config/generation-safeguards');
    const safeguards = getSafeguardStatus();
    
    res.json({
      success: true,
      enabled: safeguards.ALLOW_TREND_FETCHING,
      schedule: "Daily at 5:00 AM ET",
      description: "Automatic Perplexity trend data fetching (read-only)",
      status: safeguards.ALLOW_TREND_FETCHING ? "enabled" : "disabled",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting Perplexity automation status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/perplexity-automation/toggle
 * Toggle Perplexity automation on/off
 */
router.post('/toggle', async (req: Request, res: Response) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: enabled must be a boolean',
        timestamp: new Date().toISOString()
      });
    }
    
    // Import safeguard functions
    const { getSafeguardStatus, enableTrendFetching, disableTrendFetching } = await import('../config/generation-safeguards');
    
    // Toggle the trend fetching setting
    if (enabled) {
      enableTrendFetching();
      console.log('✅ Perplexity automation ENABLED - Daily 5:00 AM ET trend fetching activated');
    } else {
      disableTrendFetching();
      console.log('🚫 Perplexity automation DISABLED - Daily trend fetching stopped');
    }
    
    // Get updated status
    const updatedSafeguards = getSafeguardStatus();
    
    res.json({
      success: true,
      enabled: updatedSafeguards.ALLOW_TREND_FETCHING,
      message: enabled ? 
        'Perplexity automation enabled - Daily trend fetching at 5:00 AM ET' : 
        'Perplexity automation disabled - No automatic trend fetching',
      schedule: "Daily at 5:00 AM ET",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error toggling Perplexity automation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as perplexityAutomationRouter };