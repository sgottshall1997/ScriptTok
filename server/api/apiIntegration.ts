import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertApiIntegrationSchema, insertIntegrationWebhookSchema } from '@shared/schema';

export const apiIntegrationRouter = Router();

/**
 * GET /api/integrations/platforms
 * Get all available social media platforms
 */
apiIntegrationRouter.get('/platforms', async (_req: Request, res: Response) => {
  try {
    const platforms = await storage.getSocialMediaPlatforms();
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching social media platforms:', error);
    res.status(500).json({ error: 'Failed to fetch social media platforms' });
  }
});

/**
 * GET /api/integrations/integrations
 * Get all integrations for a user
 */
apiIntegrationRouter.get('/integrations', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1; // Default to user ID 1 for demo
    
    const integrations = await storage.getApiIntegrationsByUser(userId);
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching user integrations:', error);
    res.status(500).json({ error: 'Failed to fetch user integrations' });
  }
});

/**
 * GET /api/integrations/integrations/:id
 * Get a specific integration
 */
apiIntegrationRouter.get('/integrations/:id', async (req: Request, res: Response) => {
  try {
    const integrationId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string) || 1; // Default to user ID 1 for demo
    
    if (isNaN(integrationId)) {
      return res.status(400).json({ error: 'Invalid integration ID' });
    }
    
    const integration = await storage.getApiIntegrationById(integrationId);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    // For security, ensure the integration belongs to the user
    if (integration.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this integration' });
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Error fetching integration details:', error);
    res.status(500).json({ error: 'Failed to fetch integration details' });
  }
});

/**
 * POST /api/integrations/integrations
 * Create a new integration
 */
apiIntegrationRouter.post('/integrations', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const integrationInput = insertApiIntegrationSchema.parse({
      userId: req.body.userId || 1, // Default to user ID 1 for demo
      name: req.body.name,
      provider: req.body.provider,
      apiKey: req.body.apiKey || null,
      apiSecret: req.body.apiSecret || null,
      accessToken: req.body.accessToken || null,
      refreshToken: req.body.refreshToken || null,
      tokenExpiresAt: req.body.tokenExpiresAt ? new Date(req.body.tokenExpiresAt) : null,
    });
    
    // Check if user already has an integration with this provider
    const existingIntegration = await storage.getApiIntegrationByProvider(
      integrationInput.userId,
      integrationInput.provider
    );
    
    if (existingIntegration) {
      return res.status(409).json({ 
        error: 'User already has an integration with this provider',
        existingIntegration
      });
    }
    
    const newIntegration = await storage.saveApiIntegration(integrationInput);
    
    // Log activity
    try {
      await storage.logUserActivity({
        userId: integrationInput.userId,
        action: 'api_integration_created',
        metadata: { provider: integrationInput.provider, integrationId: newIntegration.id }
      });
    } catch (logError) {
      console.warn('Failed to log user activity:', logError);
    }
    
    res.status(201).json(newIntegration);
  } catch (error) {
    console.error('Error creating integration:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid integration data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create integration' });
    }
  }
});

/**
 * DELETE /api/integrations/integrations/:id
 * Delete an integration
 */
apiIntegrationRouter.delete('/integrations/:id', async (req: Request, res: Response) => {
  try {
    const integrationId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId as string) || 1; // Default to user ID 1 for demo
    
    if (isNaN(integrationId)) {
      return res.status(400).json({ error: 'Invalid integration ID' });
    }
    
    // Verify the integration belongs to the user before deleting
    const integration = await storage.getApiIntegrationById(integrationId);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    if (integration.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this integration' });
    }
    
    const success = await storage.deleteApiIntegration(integrationId);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete integration' });
    }
    
    // Log activity
    try {
      await storage.logUserActivity({
        userId,
        action: 'api_integration_deleted',
        metadata: { provider: integration.provider, integrationId }
      });
    } catch (logError) {
      console.warn('Failed to log user activity:', logError);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

/**
 * GET /api/integrations/published
 * Get published content history for a user
 */
apiIntegrationRouter.get('/published', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1; // Default to user ID 1 for demo
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const publishedContent = await storage.getPublishedContentByUser(userId, limit, offset);
    
    // Enhance the response with platform details
    for (const content of publishedContent) {
      if (content.platformId) {
        try {
          const platform = await storage.getSocialMediaPlatformById(content.platformId);
          if (platform) {
            (content as any).platformDetails = platform;
          }
        } catch (platformError) {
          console.warn(`Failed to fetch platform details for ID ${content.platformId}:`, platformError);
        }
      }
    }
    
    res.json(publishedContent);
  } catch (error) {
    console.error('Error fetching published content:', error);
    res.status(500).json({ error: 'Failed to fetch published content' });
  }
});

/**
 * POST /api/integrations/webhooks
 * Create a new webhook for an integration
 */
apiIntegrationRouter.post('/webhooks', async (req: Request, res: Response) => {
  try {
    // Parse and validate input
    const webhookInput = insertIntegrationWebhookSchema.parse({
      userId: req.body.userId || 1, // Default to user ID 1 for demo
      name: req.body.name,
      integrationId: req.body.integrationId,
      url: req.body.url,
      isActive: req.body.isActive ?? true,
      events: req.body.events || null,
      secretKey: req.body.secretKey || null,
    });
    
    // Verify the integration exists and belongs to the user
    const integration = await storage.getApiIntegrationById(webhookInput.integrationId);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    if (integration.userId !== webhookInput.userId) {
      return res.status(403).json({ error: 'Unauthorized access to this integration' });
    }
    
    const newWebhook = await storage.saveIntegrationWebhook(webhookInput);
    
    res.status(201).json(newWebhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid webhook data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  }
});

/**
 * GET /api/integrations/webhooks
 * Get webhooks for a user/integration
 */
apiIntegrationRouter.get('/webhooks', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string) || 1; // Default to user ID 1 for demo
    const integrationId = req.query.integrationId ? parseInt(req.query.integrationId as string) : undefined;
    
    let webhooks;
    if (integrationId) {
      // Check if integration belongs to user
      const integration = await storage.getApiIntegrationById(integrationId);
      if (!integration || integration.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized access to this integration' });
      }
      
      webhooks = await storage.getIntegrationWebhooksByIntegration(integrationId);
    } else {
      webhooks = await storage.getIntegrationWebhooksByUser(userId);
    }
    
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

export default apiIntegrationRouter;