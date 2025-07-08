import { Router } from 'express';
import { WebhookService, getWebhookConfig } from '../services/webhookService';
import axios from 'axios';

const router = Router();

/**
 * POST /api/webhooks/test
 * Sends a test webhook notification with CSV-formatted data
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
    
    // Create CSV-compatible test payload
    const testPayload = {
      // Core CSV Fields
      Timestamp: new Date().toISOString(),
      Product: "Hero My First Serum 1.69 fl oz",
      Niche: "beauty",
      Platform: "tiktok",
      Tone: "Enthusiastic",
      Template: "Short-Form Video Script", 
      useSmartStyle: false,
      
      // Content Fields
      'Full Output': "POV: You discover the ultimate glow-up serum! 🌟 This Hero My First Serum is absolutely life-changing for beginner skincare routines. The lightweight formula absorbs instantly and leaves your skin feeling incredible...",
      'TikTok Caption': "POV: you found the holy grail skincare for beginners ✨ Hero My First Serum is giving me LIFE 🙌 #skincare #glowup #beauty",
      'IG Caption': "Discovering this Hero serum has been such a game-changer for my skincare journey ✨ Perfect for anyone starting their glow-up routine #skincare #beauty #selfcare",
      'YT Caption': "*Here's why Hero My First Serum is perfect for skincare beginners* - lightweight formula that won't overwhelm sensitive skin #skincare #beauty #tutorial",
      'X Caption': "Plot twist: the best beginner serum was from Hero all along 💫 This changed my entire skincare game #skincare",
      
      // Rating Fields (empty for user input)
      'TikTok Rating': '',
      'IG Rating': '',
      'YT Rating': '',
      'X Rating': '',
      'Full Output Rating': '',
      'TopRatedStyleUsed': '',
      
      // Legacy fields for backward compatibility
      postType: 'content',
      hashtags: '#skincare #beauty #glowup #hero',
      source: 'GlowBot'
    };
    
    console.log('📤 Sending CSV-formatted test webhook to Make.com:', JSON.stringify(testPayload, null, 2));
    
    // Send directly to webhook URL
    const response = await axios.post(config.url, testPayload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'User-Agent': 'GlowBot/1.0'
      },
      timeout: 15000
    });
    
    console.log('✅ Test webhook sent successfully:', response.status);
    
    res.json({
      success: true,
      message: 'CSV-formatted test webhook sent successfully',
      data: testPayload
    });
    
  } catch (error: any) {
    console.error('Error sending test webhook:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: `Failed to send test webhook: ${error.response?.data || error.message}`,
      details: error.response?.status ? `HTTP ${error.response.status}` : 'Network error'
    });
  }
});

export { router as webhookTestRouter };