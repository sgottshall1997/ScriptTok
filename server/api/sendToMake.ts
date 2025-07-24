import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';

const router = Router();

// Helper function to format timestamp for user-friendly display
const formatTimestampForWebhook = (date: Date = new Date()): string => {
  // Convert to Central Time
  const centralTime = date.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: '2-digit',
    month: 'numeric', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Format as "7/24/25 1:23 PM CT" (remove comma)
  return `${centralTime.replace(',', '')} CT`;
};

// Validation schema for the send-to-make payload
const sendToMakeSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  postType: z.string().min(1, 'Post type is required'),
  caption: z.string().min(1, 'Caption is required'),
  hashtags: z.string(),
  script: z.string().optional(),
  niche: z.string().optional(),
  product: z.string().optional(),
  templateType: z.string().optional(),
  tone: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  scheduledTime: z.string().datetime().optional()
});

/**
 * POST /api/post/send-to-make
 * Sends content data to Make.com webhook
 */
router.post('/', async (req, res) => {
  try {
    // Validate the request body
    const validationResult = sendToMakeSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validationResult.error.errors
      });
    }

    const payload = validationResult.data;

    // Check if Make.com webhook URL is configured
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (!makeWebhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'Make.com webhook URL is not configured. Please set MAKE_WEBHOOK_URL environment variable.'
      });
    }

    // Flatten payload for better Make.com compatibility
    const flattenedPayload = {
      // Core content fields
      platform: payload.platform || 'unknown',
      postType: payload.postType || 'content',
      caption: payload.caption || '',
      hashtags: payload.hashtags || '',
      script: payload.script || '',
      
      // Context fields
      niche: payload.niche || '',
      product: payload.product || '',
      templateType: payload.templateType || '',
      tone: payload.tone || '',
      
      // Optional fields
      mediaUrl: payload.mediaUrl || '',
      scheduledTime: payload.scheduledTime || '',
      
      // Metadata
      timestamp: formatTimestampForWebhook(),
      source: 'GlowBot',
      version: '1.0'
    };

    console.log(`📤 Sending content to Make.com:`, {
      platform: payload.platform,
      postType: payload.postType,
      captionLength: payload.caption.length,
      hashtagsLength: payload.hashtags.length,
      hasMediaUrl: !!payload.mediaUrl,
      hasScheduledTime: !!payload.scheduledTime
    });

    // Send the flattened payload to Make.com with proper formatting
    const response = await axios.post(makeWebhookUrl, flattenedPayload, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'User-Agent': 'GlowBot/1.0'
      },
      timeout: 15000 // 15 second timeout
    });

    console.log(`✅ Successfully sent to Make.com. Status: ${response.status}`);

    return res.json({
      success: true,
      message: 'Content successfully sent to Make.com',
      data: {
        platform: payload.platform,
        postType: payload.postType,
        makeResponseStatus: response.status,
        timestamp: flattenedPayload.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Error sending to Make.com:', error);
    
    let errorMessage = 'Failed to send content to Make.com';
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Make.com webhook error: ${error.response.status} - ${error.response.statusText}`;
        statusCode = error.response.status >= 400 && error.response.status < 500 ? 400 : 500;
      } else if (error.request) {
        errorMessage = 'Unable to reach Make.com webhook. Please check the webhook URL.';
        statusCode = 503;
      } else {
        errorMessage = `Request error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as sendToMakeRouter };