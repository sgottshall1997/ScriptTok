import { Request, Response } from 'express';

export async function testWebhookPayload(req: Request, res: Response) {
  try {
    // Create comprehensive test payload with viral inspiration and AI evaluation data
    const testPayload = {
      event_type: "content_generated",
      platform: "tiktok",
      niche: "beauty",
      script: "Test video script content for viral TikTok content about skincare routine",
      instagramCaption: "Test Instagram caption with aesthetic vibes ✨",
      tiktokCaption: "Test TikTok caption with viral hooks and trending sounds 🔥",
      youtubeCaption: "Test YouTube Shorts caption with educational tone",
      xCaption: "Test X/Twitter caption with hot takes and engagement",
      facebookCaption: "Test Facebook caption with community focus",
      affiliateLink: "https://amzn.to/test-product-link",
      product: "CeraVe Daily Moisturizing Lotion",
      imageUrl: "https://via.placeholder.com/400x400?text=CeraVe",
      tone: "Enthusiastic",
      template: "Beauty Routine",
      model: "ChatGPT",
      contentFormat: "Regular Format",
      postType: "reel",
      topRatedStyleUsed: true,
      
      // VIRAL INSPIRATION DATA from Perplexity
      viralHook: "POV: You finally found the holy grail moisturizer",
      viralFormat: "Before/After transformation with trending audio",
      viralCaption: "This moisturizer literally changed my skin game in 30 days",
      viralHashtags: "#skincare, #cerave, #moisturizer, #skincareroutine, #glowup",
      viralInspirationFound: true,
      
      // AI EVALUATION SCORES - ChatGPT Results
      chatgptViralityScore: 8.5,
      chatgptClarityScore: 9.0,
      chatgptPersuasivenessScore: 7.5,
      chatgptCreativityScore: 8.0,
      chatgptOverallScore: 8.2,
      
      // AI EVALUATION SCORES - Claude Results  
      claudeViralityScore: 7.8,
      claudeClarityScore: 8.5,
      claudePersuasivenessScore: 8.2,
      claudeCreativityScore: 7.0,
      claudeOverallScore: 7.9,
      
      // EVALUATION SUMMARY
      averageOverallScore: 8.1,
      evaluationCompleted: true,
      
      timestamp: new Date().toISOString()
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