import { Router, Request, Response } from 'express';
import { integrationHealthService } from '../../../services/integrationHealthService';

export const integrationsHealthRouter = Router();

/**
 * GET /api/cookaing-marketing/integrations/health
 * Get comprehensive health status for all integrations
 */
integrationsHealthRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const healthSummary = await integrationHealthService.getHealthSummary();
    
    res.json({
      success: true,
      data: healthSummary
    });
  } catch (error) {
    console.error('Error fetching integration health summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration health summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/cookaing-marketing/integrations/health/:integrationId
 * Get health status for a specific integration
 */
integrationsHealthRouter.get('/:integrationId', async (req: Request, res: Response) => {
  try {
    const { integrationId } = req.params;
    
    if (!integrationId) {
      return res.status(400).json({
        success: false,
        error: 'Integration ID is required'
      });
    }
    
    const integrationHealth = await integrationHealthService.getIntegrationHealth(integrationId);
    
    if (!integrationHealth) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found',
        message: `No integration found with ID: ${integrationId}`
      });
    }
    
    res.json({
      success: true,
      data: integrationHealth
    });
  } catch (error) {
    console.error(`Error fetching health for integration ${req.params.integrationId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration health status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/cookaing-marketing/integrations/health/refresh
 * Force refresh health status for all integrations
 */
integrationsHealthRouter.post('/refresh', async (_req: Request, res: Response) => {
  try {
    // Clear any potential caches and get fresh status
    const healthSummary = await integrationHealthService.getHealthSummary();
    
    res.json({
      success: true,
      message: 'Integration health status refreshed successfully',
      data: healthSummary
    });
  } catch (error) {
    console.error('Error refreshing integration health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh integration health status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default integrationsHealthRouter;