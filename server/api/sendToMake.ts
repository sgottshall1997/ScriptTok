import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';

const router = Router();

// Validation schema for the send-to-make payload
const sendToMakeSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  postType: z.string().min(1, 'Post type is required'),
  caption: z.string().min(1, 'Caption is required'),
  hashtags: z.string(),
  script: z.string().optional(),
  niche: z.string().optional(),
  product: z.string().optional(),
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

    // Add timestamp and source to the payload
    const enrichedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
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

    // Send the payload to Make.com
    const response = await axios.post(makeWebhookUrl, enrichedPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GlowBot/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`✅ Successfully sent to Make.com. Status: ${response.status}`);

    return res.json({
      success: true,
      message: 'Content successfully sent to Make.com',
      data: {
        platform: payload.platform,
        postType: payload.postType,
        makeResponseStatus: response.status,
        timestamp: enrichedPayload.timestamp
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