import { Router } from 'express';
import axios from 'axios';

const router = Router();

/**
 * GET /api/post/test-make-webhook
 * Tests the Make.com webhook integration with a mock payload
 */
router.get('/', async (req, res) => {
  try {
    // Check if Make.com webhook URL is configured
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (!makeWebhookUrl) {
      return res.status(400).json({
        error: 'Webhook not configured',
        details: 'Make.com webhook URL is not configured. Please set MAKE_WEBHOOK_URL environment variable.'
      });
    }

    // Simple test payload that Make.com should definitely parse
    const mockPayload = {
      "test_field_1": "Hello from GlowBot",
      "test_field_2": "skincare",
      "test_field_3": "instagram",
      "caption": "This is a test caption",
      "hashtags": "#test #glowbot",
      "timestamp": new Date().toISOString()
    };

    console.log('🧪 Testing Make.com webhook with payload:', mockPayload);
    console.log('📡 Webhook URL:', makeWebhookUrl);

    // Send JSON payload to Make.com with exact structure they expect
    const response = await axios.post(makeWebhookUrl, mockPayload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Webhook test successful!');
    console.log('📊 Make.com response status:', response.status);
    console.log('📋 Make.com response data:', response.data);

    return res.json({
      status: 'Webhook sent',
      payload: mockPayload,
      makeResponse: {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    
    let errorDetails = 'Unknown error occurred';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorDetails = `Make.com returned ${error.response.status}: ${error.response.statusText}`;
        console.log('📊 Error response data:', error.response.data);
      } else if (error.request) {
        errorDetails = 'Unable to reach Make.com webhook. Please check the webhook URL and your internet connection.';
      } else {
        errorDetails = `Request setup error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorDetails = error.message;
    }

    return res.status(500).json({
      error: 'Webhook failed',
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as testMakeWebhookRouter };