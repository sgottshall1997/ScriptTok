import { Request, Response } from 'express';

export async function testWebhookPayload(req: Request, res: Response) {
  try {
    // Create a test payload with AI scores
    const testPayload = {
      platform: 'TikTok',
      postType: 'video',
      caption: 'Test caption for webhook',
      script: 'Test video script content',
      product: 'Test Product',
      niche: 'skincare',
      tone: 'casual',
      templateType: 'viral_hook',
      aiQualityScore: 85,
      aiQualityAnalysis: 'High viral potential with engaging content structure',
      qualityTier: 'premium',
      trendingDataAnalyzed: 4,
      timestamp: new Date().toISOString(),
      source: 'GlowBot-Test'
    };

    console.log('🔍 Test Webhook Payload:');
    console.log(JSON.stringify(testPayload, null, 2));

    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl) {
      const axios = await import('axios');
      await axios.default.post(makeWebhookUrl, testPayload);
      console.log('✅ Test payload sent to Make.com successfully');
      
      res.json({
        success: true,
        message: 'Test webhook sent successfully',
        payload: testPayload
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'MAKE_WEBHOOK_URL not configured'
      });
    }
  } catch (error) {
    console.error('❌ Test webhook failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test webhook failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}