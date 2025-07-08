import axios from 'axios';
import { ContentHistory } from '@shared/schema';

// Webhook configuration interface
export interface WebhookConfig {
  url: string;
  enabled: boolean;
  secret?: string;  // For webhook signature verification if needed
}

// Store webhook configuration - Force correct URL
let webhookConfig: WebhookConfig = {
  url: 'https://hook.us2.make.com/rrdlmayg3mvi68p2jxhdxbg2ohy41pn4',
  enabled: true
};

/**
 * Configure the webhook service
 * @param config Webhook configuration
 */
export const configureWebhook = (config: WebhookConfig): void => {
  webhookConfig = {
    ...config,
    // Validate URL format
    enabled: config.enabled && Boolean(config.url && config.url.startsWith('http')),
  };
};

/**
 * Get current webhook configuration
 */
export const getWebhookConfig = (): WebhookConfig => {
  return { ...webhookConfig };
};

/**
 * Prepares the payload for Make.com from content history entry
 * Make.com expects a consistent payload structure
 */
const preparePayload = (contentData: ContentHistory) => {
  return {
    event_type: 'content_generated',
    timestamp: new Date().toISOString(),
    content_metadata: {
      id: contentData.id,
      niche: contentData.niche,
      contentType: contentData.contentType,
      tone: contentData.tone,
      productName: contentData.productName,
      modelUsed: contentData.modelUsed,
      tokenCount: contentData.tokenCount,
      createdAt: contentData.createdAt
    },
    content: {
      prompt: contentData.promptText,
      output: contentData.outputText
    }
  };
};

/**
 * Send webhook notification for generated content
 * @param contentData The content history entry
 * @returns Promise resolving to success status and message
 */
export const sendWebhookNotification = async (
  contentData: ContentHistory
): Promise<{ success: boolean; message: string }> => {
  // If webhooks are not configured, exit early
  if (!webhookConfig.enabled || !webhookConfig.url) {
    return { 
      success: false, 
      message: 'Webhook not configured or disabled' 
    };
  }

  try {
    const payload = preparePayload(contentData);
    
    // Configure headers with optional signature
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (webhookConfig.secret) {
      // Here you could implement HMAC signature for security
      // headers['X-Webhook-Signature'] = createSignature(payload, webhookConfig.secret);
    }

    // Make the POST request to the webhook URL
    const response = await axios.post(webhookConfig.url, payload, { headers });
    
    console.log(`Webhook sent successfully to ${webhookConfig.url}`);
    
    return {
      success: true,
      message: `Webhook delivered successfully. Status: ${response.status}`
    };
  } catch (error) {
    console.error('Error sending webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      message: `Failed to deliver webhook: ${errorMessage}`
    };
  }
};

/**
 * WebhookService class for multi-platform content delivery
 */
export class WebhookService {
  async sendMultiPlatformContent(data: {
    platformContent: any;
    platformSchedules: any;
    metadata: any;
    contentData?: any; // Full content generation data for CSV fields
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const webhookUrl = process.env.MAKE_WEBHOOK_URL || webhookConfig.url;
      
      if (!webhookUrl) {
        throw new Error('Make.com webhook URL not configured');
      }

      // Send comprehensive payload with all CSV fields
      const platforms = Object.keys(data.platformContent);
      const results = [];

      // Extract platform-specific captions
      const tiktokCaption = data.platformContent?.tiktok?.caption || '';
      const igCaption = data.platformContent?.instagram?.caption || '';
      const ytCaption = data.platformContent?.youtube?.caption || '';
      const xCaption = data.platformContent?.twitter?.caption || data.platformContent?.x?.caption || '';

      for (const platform of platforms) {
        const platformData = data.platformContent[platform];
        const scheduledTime = data.platformSchedules[platform] || '';

        // Create comprehensive CSV-compatible payload for Make.com
        // Field order must match CSV: Timestamp,Product,Niche,Platform,Tone,Template,useSmartStyle,Full Output,TikTok Caption,IG Caption,YT Caption,X Caption,TikTok Rating,IG Rating,YT Rating,X Rating,Full Output Rating,TopRatedStyleUsed,postType,hashtags,source,Affiliate Link
        const flatPayload = {
          // Core CSV Fields (exact order and case as CSV header)
          Timestamp: new Date().toISOString(),
          Product: data.metadata?.product || data.metadata?.productName || '',
          Niche: data.metadata?.niche || '',
          Platform: platform,
          Tone: data.metadata?.tone || '',
          Template: data.metadata?.template || data.metadata?.templateType || '',
          useSmartStyle: data.metadata?.useSmartStyle || false,
          
          // Content Fields
          'Full Output': data.contentData?.fullOutput || platformData.script || '',
          'TikTok Caption': tiktokCaption,
          'IG Caption': igCaption,
          'YT Caption': ytCaption,
          'X Caption': xCaption,
          
          // Rating Fields (placeholders for user input)
          'TikTok Rating': '',
          'IG Rating': '',
          'YT Rating': '',
          'X Rating': '',
          'Full Output Rating': '',
          TopRatedStyleUsed: data.metadata?.topRatedStyleUsed || '',
          
          // Additional required fields
          postType: platformData.type || 'content',
          hashtags: Array.isArray(platformData.hashtags) ? platformData.hashtags.join(' ') : '',
          source: 'GlowBot',
          'Affiliate Link': data.metadata?.affiliateUrl || data.metadata?.affiliateLink || '',
          
          // Legacy fields for backward compatibility
          caption: platformData.caption || '',
          script: platformData.script || '',
          postInstructions: platformData.postInstructions || '',
          scheduledTime: scheduledTime
        };

        console.log(`📤 Sending ${platform} content to Make.com:`, {
          platform,
          postType: flatPayload.postType,
          captionLength: flatPayload.caption.length,
          hasScheduledTime: !!scheduledTime
        });
        
        console.log('📋 Full payload being sent to Make.com:', JSON.stringify(flatPayload, null, 2));

        const response = await axios.post(webhookUrl, flatPayload, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
            'User-Agent': 'GlowBot/1.0'
          },
          timeout: 15000
        });

        console.log(`✅ Make.com webhook response for ${platform}:`, {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });

        results.push({ platform, status: response.status });
        
        // Add delay between requests to avoid overwhelming Make.com
        if (platforms.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('✅ All platforms sent to Make.com successfully');
      return { success: true };

    } catch (error: any) {
      console.error('Multi-platform webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  private formatContentForMake(platformContent: any, metadata: any) {
    // Create a flattened payload for better Make.com compatibility
    const platforms = Object.keys(platformContent);
    const primaryPlatform = platforms[0];
    const primaryContent = platformContent[primaryPlatform];
    
    return {
      // Primary content fields
      platform: primaryPlatform || 'unknown',
      postType: primaryContent?.type || 'content',
      caption: primaryContent?.caption || primaryContent?.script || '',
      hashtags: Array.isArray(primaryContent?.hashtags) ? primaryContent.hashtags.join(' ') : '',
      script: primaryContent?.script || '',
      postInstructions: primaryContent?.postInstructions || '',
      
      // Context fields
      product: metadata?.product || '',
      niche: metadata?.niche || '',
      tone: metadata?.tone || '',
      templateType: metadata?.templateType || '',
      
      // Additional platforms (if multi-platform)
      totalPlatforms: platforms.length,
      allPlatforms: platforms.join(', '),
      
      // Metadata
      generatedAt: metadata?.generatedAt || new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'GlowBot'
    };
  }
}