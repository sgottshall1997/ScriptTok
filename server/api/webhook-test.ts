import { Router } from 'express';
import { sendWebhookNotification, getWebhookConfig } from '../services/webhookService';

const router = Router();

/**
 * POST /api/webhooks/test
 * Sends a test webhook notification
 */
router.post('/', async (req, res) => {
  try {
    // Check if webhook is configured
    const config = getWebhookConfig();
    if (!config.enabled || !config.url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook is not configured or is disabled. Please configure webhook first.'
      });
    }
    
    // Create a test content history entry
    const testContentHistory = {
      id: 0, // Test ID
      userId: null,
      niche: "test",
      contentType: "test_webhook",
      tone: "professional",
      productName: "Test Product",
      promptText: "This is a test webhook notification from GlowBot",
      outputText: "This is a sample content output for testing webhook integration with Make.com",
      modelUsed: "test-model",
      tokenCount: 0,
      createdAt: new Date()
    };
    
    // Send test webhook notification
    const result = await sendWebhookNotification(testContentHistory);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test webhook notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send test webhook: ${result.message}`
      });
    }
  } catch (error) {
    console.error('Error sending test webhook:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export { router as webhookTestRouter };