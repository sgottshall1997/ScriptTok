import { Router } from 'express';
import { z } from 'zod';
import { configureWebhook, getWebhookConfig } from '../services/webhookService';

const router = Router();

// Webhook configuration validation schema
const webhookConfigSchema = z.object({
  url: z.string().url('Invalid webhook URL format'),
  enabled: z.boolean().default(true),
  secret: z.string().optional(),
});

/**
 * GET /api/webhooks/config
 * Returns the current webhook configuration
 */
router.get('/config', (req, res) => {
  try {
    const config = getWebhookConfig();
    
    // Hide secret if present for security
    const safeConfig = {
      ...config,
      secret: config.secret ? '********' : undefined,
    };
    
    res.json({
      success: true,
      config: safeConfig
    });
  } catch (error) {
    console.error('Error retrieving webhook config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve webhook configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/webhooks/config
 * Updates the webhook configuration
 */
router.post('/config', (req, res) => {
  try {
    // Validate incoming webhook configuration
    const result = webhookConfigSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook configuration',
        validation: result.error.format()
      });
    }
    
    // Update webhook configuration
    configureWebhook(result.data);
    
    res.json({
      success: true,
      message: 'Webhook configuration updated successfully',
      config: {
        url: result.data.url,
        enabled: result.data.enabled,
        // Hide secret for security
        secret: result.data.secret ? '********' : undefined
      }
    });
  } catch (error) {
    console.error('Error updating webhook config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update webhook configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/webhooks/config
 * Disables the webhook
 */
router.delete('/config', (req, res) => {
  try {
    // Disable the webhook by setting enabled to false
    configureWebhook({
      url: '',
      enabled: false
    });
    
    res.json({
      success: true,
      message: 'Webhook configuration disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to disable webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as webhooksRouter };