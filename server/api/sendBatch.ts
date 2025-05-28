import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';

const router = Router();

// Validation schema for individual batch items
const batchItemSchema = z.object({
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

// Validation schema for the batch request
const sendBatchSchema = z.object({
  batch: z.array(batchItemSchema).min(1, 'Batch must contain at least one item').max(50, 'Batch cannot exceed 50 items')
});

/**
 * POST /api/post/send-batch
 * Sends multiple content items to Make.com webhook in batch
 */
router.post('/', async (req, res) => {
  try {
    // Validate the request body
    const validationResult = sendBatchSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch request data',
        errors: validationResult.error.errors
      });
    }

    const { batch } = validationResult.data;

    // Check if Make.com webhook URL is configured
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    
    if (!makeWebhookUrl) {
      return res.status(400).json({
        success: false,
        message: 'Make.com webhook URL is not configured. Please set MAKE_WEBHOOK_URL environment variable.'
      });
    }

    console.log(`📤 Sending batch of ${batch.length} items to Make.com...`);

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Process each item in the batch sequentially to avoid overwhelming Make.com
    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      
      try {
        // Add metadata to each item
        const enrichedPayload = {
          ...item,
          timestamp: new Date().toISOString(),
          source: 'GlowBot',
          version: '1.0',
          batchInfo: {
            batchId: `batch_${Date.now()}`,
            itemIndex: i + 1,
            totalItems: batch.length
          }
        };

        console.log(`📤 Sending batch item ${i + 1}/${batch.length}: ${item.platform} - ${item.postType}`);

        // Send to Make.com
        const response = await axios.post(makeWebhookUrl, enrichedPayload, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'GlowBot-Batch/1.0'
          },
          timeout: 15000 // 15 second timeout for batch items
        });

        results.push({
          index: i + 1,
          platform: item.platform,
          postType: item.postType,
          status: 'success',
          makeResponseStatus: response.status,
          timestamp: enrichedPayload.timestamp
        });

        successCount++;
        console.log(`✅ Batch item ${i + 1} sent successfully. Status: ${response.status}`);

        // Add small delay between requests to be respectful to Make.com
        if (i < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }

      } catch (error) {
        console.error(`❌ Error sending batch item ${i + 1}:`, error);
        
        let errorMessage = 'Failed to send to Make.com';
        
        if (axios.isAxiosError(error)) {
          if (error.response) {
            errorMessage = `Make.com error: ${error.response.status} - ${error.response.statusText}`;
          } else if (error.request) {
            errorMessage = 'Unable to reach Make.com webhook';
          } else {
            errorMessage = `Request error: ${error.message}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        results.push({
          index: i + 1,
          platform: item.platform,
          postType: item.postType,
          status: 'failed',
          error: errorMessage,
          timestamp: new Date().toISOString()
        });

        failureCount++;
      }
    }

    const batchComplete = new Date().toISOString();
    console.log(`📊 Batch complete: ${successCount} successful, ${failureCount} failed`);

    return res.json({
      success: successCount > 0,
      message: `Batch processing complete: ${successCount} successful, ${failureCount} failed`,
      data: {
        totalItems: batch.length,
        successCount,
        failureCount,
        results,
        batchStarted: results[0]?.timestamp,
        batchCompleted: batchComplete
      }
    });

  } catch (error) {
    console.error('❌ Batch processing error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to process batch request',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as sendBatchRouter };