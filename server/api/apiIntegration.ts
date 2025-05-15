import { Router } from 'express';
import { apiIntegrationService } from '../services/apiIntegrationService';
import { 
  insertApiIntegrationSchema, 
  insertIntegrationWebhookSchema,
  insertSocialMediaPlatformSchema
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get all supported social media platforms
router.get('/platforms', async (req, res) => {
  try {
    const platforms = await apiIntegrationService.getAllPlatforms();
    return res.status(200).json(platforms);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return res.status(500).json({ message: 'Failed to fetch platforms' });
  }
});

// Get platform by ID
router.get('/platforms/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid platform ID' });
    }
    
    const platform = await apiIntegrationService.getPlatformById(id);
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }

    return res.status(200).json(platform);
  } catch (error) {
    console.error('Error fetching platform:', error);
    return res.status(500).json({ message: 'Failed to fetch platform' });
  }
});

// Get all user integrations
router.get('/integrations', async (req, res) => {
  try {
    // In a real auth system, get user ID from session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const integrations = await apiIntegrationService.getUserIntegrations(userId);
    return res.status(200).json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return res.status(500).json({ message: 'Failed to fetch integrations' });
  }
});

// Get integration by ID
router.get('/integrations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // In a real auth system, get user ID from session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid integration or user ID' });
    }

    const integration = await apiIntegrationService.getIntegrationById(id, userId);
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    return res.status(200).json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    return res.status(500).json({ message: 'Failed to fetch integration' });
  }
});

// Create new integration
router.post('/integrations', async (req, res) => {
  try {
    const validatedData = insertApiIntegrationSchema.parse(req.body);
    
    const newIntegration = await apiIntegrationService.createIntegration({
      ...validatedData,
      // In a real auth system, get user ID from session if not provided
      userId: validatedData.userId || 1
    });

    return res.status(201).json(newIntegration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid integration data', errors: error.errors });
    }
    console.error('Error creating integration:', error);
    return res.status(500).json({ message: 'Failed to create integration' });
  }
});

// Update integration
router.put('/integrations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // In a real auth system, get user ID from session
    const userId = req.body.userId ? parseInt(req.body.userId) : 1;

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid integration or user ID' });
    }

    // Remove userId from update data
    const { userId: _, ...updateData } = req.body;

    const updatedIntegration = await apiIntegrationService.updateIntegration(id, userId, updateData);
    if (!updatedIntegration) {
      return res.status(404).json({ message: 'Integration not found or you do not have permission to update it' });
    }

    return res.status(200).json(updatedIntegration);
  } catch (error) {
    console.error('Error updating integration:', error);
    return res.status(500).json({ message: 'Failed to update integration' });
  }
});

// Delete integration
router.delete('/integrations/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // In a real auth system, get user ID from session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid integration or user ID' });
    }

    const deleted = await apiIntegrationService.deleteIntegration(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Integration not found or you do not have permission to delete it' });
    }

    return res.status(200).json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return res.status(500).json({ message: 'Failed to delete integration' });
  }
});

// Get webhooks for an integration
router.get('/integrations/:integrationId/webhooks', async (req, res) => {
  try {
    const integrationId = parseInt(req.params.integrationId);
    // In a real auth system, get user ID from session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;

    if (isNaN(integrationId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid integration or user ID' });
    }

    const webhooks = await apiIntegrationService.getIntegrationWebhooks(integrationId, userId);
    return res.status(200).json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return res.status(500).json({ message: 'Failed to fetch webhooks' });
  }
});

// Create webhook
router.post('/webhooks', async (req, res) => {
  try {
    const validatedData = insertIntegrationWebhookSchema.parse(req.body);
    
    const newWebhook = await apiIntegrationService.createWebhook({
      ...validatedData,
      // In a real auth system, get user ID from session if not provided
      userId: validatedData.userId || 1
    });

    return res.status(201).json(newWebhook);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid webhook data', errors: error.errors });
    }
    console.error('Error creating webhook:', error);
    return res.status(500).json({ message: 'Failed to create webhook' });
  }
});

// Update webhook
router.put('/webhooks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // In a real auth system, get user ID from session
    const userId = req.body.userId ? parseInt(req.body.userId) : 1;

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid webhook or user ID' });
    }

    // Remove userId from update data
    const { userId: _, ...updateData } = req.body;

    const updatedWebhook = await apiIntegrationService.updateWebhook(id, userId, updateData);
    if (!updatedWebhook) {
      return res.status(404).json({ message: 'Webhook not found or you do not have permission to update it' });
    }

    return res.status(200).json(updatedWebhook);
  } catch (error) {
    console.error('Error updating webhook:', error);
    return res.status(500).json({ message: 'Failed to update webhook' });
  }
});

// Delete webhook
router.delete('/webhooks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // In a real auth system, get user ID from session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid webhook or user ID' });
    }

    const deleted = await apiIntegrationService.deleteWebhook(id, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Webhook not found or you do not have permission to delete it' });
    }

    return res.status(200).json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return res.status(500).json({ message: 'Failed to delete webhook' });
  }
});

// Publish content to a platform
router.post('/publish', async (req, res) => {
  try {
    const schema = z.object({
      contentId: z.number(),
      platformId: z.number(),
      integrationId: z.number(),
      userId: z.number().optional(),
      scheduleTime: z.string().optional(),
      metadata: z.record(z.any()).optional()
    });

    const validatedData = schema.parse(req.body);
    const userId = validatedData.userId || 1; // In a real auth system, get from session

    const publishRecord = await apiIntegrationService.publishContent(
      validatedData.contentId,
      validatedData.platformId,
      validatedData.integrationId,
      userId,
      validatedData.scheduleTime ? new Date(validatedData.scheduleTime) : undefined,
      validatedData.metadata
    );

    return res.status(201).json(publishRecord);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid publish data', errors: error.errors });
    }
    console.error('Error publishing content:', error);
    return res.status(500).json({ message: 'Failed to publish content' });
  }
});

// Get published content history
router.get('/published', async (req, res) => {
  try {
    // In a real auth system, get user ID from session
    const userId = req.query.userId ? parseInt(req.query.userId as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const history = await apiIntegrationService.getUserPublishedContent(userId, limit);
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching published content:', error);
    return res.status(500).json({ message: 'Failed to fetch published content history' });
  }
});

export default router;