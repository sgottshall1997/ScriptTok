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

/**
 * POST /api/webhooks/test
 * Sends a test webhook notification using current configuration
 */
router.post('/test', async (req, res) => {
  try {
    const config = getWebhookConfig();
    
    if (!config.enabled || !config.url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook not configured or disabled'
      });
    }
    
    // Check for mock mode
    const isMockMode = process.env.NODE_ENV === 'development' || process.env.MOCK_MODE === 'true';
    
    if (isMockMode) {
      console.log('🧪 MOCK MODE: Test webhook would be sent to:', config.url);
      console.log('🧪 Test payload:', {
        event_type: 'webhook_test',
        timestamp: new Date().toISOString(),
        message: 'Test notification from CookAIng Content System',
        mode: 'test'
      });
      
      // Simulate successful webhook test in mock mode
      return res.json({
        success: true,
        message: 'Test webhook sent successfully (mock mode)',
        mockMode: true
      });
    }
    
    // Send actual test webhook
    const testPayload = {
      event_type: 'webhook_test',
      timestamp: new Date().toISOString(),
      message: 'Test notification from CookAIng Content System',
      source: 'manual_test'
    };
    
    const axios = require('axios');
    const response = await axios.post(config.url, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CookAIng-WebhookTester/1.0'
      },
      timeout: 10000
    });
    
    console.log('✅ Test webhook sent successfully:', response.status);
    
    res.json({
      success: true,
      message: 'Test webhook sent successfully',
      status: response.status,
      mockMode: false
    });
    
  } catch (error: any) {
    console.error('❌ Test webhook error:', error.message);
    res.status(500).json({
      success: false,
      message: `Failed to send test webhook: ${error.message}`,
      mockMode: false
    });
  }
});

export { router as webhooksRouter };