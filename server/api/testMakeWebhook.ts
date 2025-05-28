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

    // Construct flattened mock payload for better Make.com compatibility
    const mockPayload = {
      // Core content fields
      platform: "instagram",
      postType: "social_media",
      caption: "🌟 Transform your skincare routine with this amazing product! Perfect for achieving that natural glow we all want. ✨",
      hashtags: "#skincare #glowup #beauty #selfcare #naturalbeauty #glowbottest",
      script: "Hey beauty lovers! Today I'm sharing the secret to radiant skin that everyone's been asking about.",
      
      // Context fields
      niche: "skincare",
      product: "Vitamin C Serum - Brightening Formula",
      templateType: "influencer_caption",
      tone: "enthusiastic",
      
      // Optional fields
      mediaUrl: "",
      scheduledTime: new Date().toISOString(),
      
      // Metadata
      timestamp: new Date().toISOString(),
      source: "GlowBot-Test",
      version: "1.0"
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