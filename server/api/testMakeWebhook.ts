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

    // Construct mock payload with realistic test values
    const mockPayload = {
      platform: "test-platform",
      postType: "test",
      caption: "This is a test caption from GlowBot",
      hashtags: "#glowbotTest",
      script: "This is a test script for video content from GlowBot",
      niche: "skincare",
      product: "Test Product for Webhook",
      templateType: "influencer_caption",
      tone: "enthusiastic",
      mediaUrl: null,
      scheduledTime: new Date().toISOString(),
      // Add metadata similar to production payloads
      timestamp: new Date().toISOString(),
      source: 'GlowBot-Test',
      version: '1.0',
      testMode: true
    };

    console.log('🧪 Testing Make.com webhook with payload:', mockPayload);
    console.log('📡 Webhook URL:', makeWebhookUrl);

    // Send test payload to Make.com with proper formatting
    const response = await axios.post(makeWebhookUrl, mockPayload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'User-Agent': 'GlowBot-Test/1.0'
      },
      timeout: 15000 // 15 second timeout
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