import { Request, Response, Router } from 'express';
import { 
  getGenerationAttempts, 
  getBlockedAttempts, 
  getAllowedAttempts,
  getGenerationStats,
  clearGenerationAttempts
} from '../config/global-generation-gatekeeper';

const router = Router();

/**
 * GET /api/gatekeeper/status
 * Get current gatekeeper status and configuration
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const stats = getGenerationStats();
    const recentAttempts = getGenerationAttempts().slice(-10);
    
    res.json({
      success: true,
      status: 'active',
      stats,
      recentAttempts,
      message: 'Global generation gatekeeper is active and monitoring all content generation requests'
    });
  } catch (error) {
    console.error('Error getting gatekeeper status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get gatekeeper status'
    });
  }
});

/**
 * GET /api/gatekeeper/attempts
 * Get all generation attempts
 */
router.get('/attempts', async (req: Request, res: Response) => {
  try {
    const attempts = getGenerationAttempts();
    
    res.json({
      success: true,
      attempts,
      count: attempts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting generation attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get generation attempts'
    });
  }
});

/**
 * GET /api/gatekeeper/blocked
 * Get all blocked generation attempts
 */
router.get('/blocked', async (req: Request, res: Response) => {
  try {
    const blockedAttempts = getBlockedAttempts();
    
    res.json({
      success: true,
      blocked: blockedAttempts,
      count: blockedAttempts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting blocked attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blocked attempts'
    });
  }
});

/**
 * GET /api/gatekeeper/allowed
 * Get all allowed generation attempts
 */
router.get('/allowed', async (req: Request, res: Response) => {
  try {
    const allowedAttempts = getAllowedAttempts();
    
    res.json({
      success: true,
      allowed: allowedAttempts,
      count: allowedAttempts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting allowed attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get allowed attempts'
    });
  }
});

/**
 * GET /api/gatekeeper/stats
 * Get generation statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = getGenerationStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting generation stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get generation stats'
    });
  }
});

/**
 * POST /api/gatekeeper/clear
 * Clear generation attempt history
 */
router.post('/clear', async (req: Request, res: Response) => {
  try {
    clearGenerationAttempts();
    
    res.json({
      success: true,
      message: 'Generation attempt history cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing generation attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear generation attempts'
    });
  }
});

export { router as globalGatekeeperRouter };