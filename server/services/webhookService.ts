import axios from 'axios';
import { ContentHistory } from '@shared/schema';

// Webhook configuration interface
export interface WebhookConfig {
  url: string;
  enabled: boolean;
  secret?: string;  // For webhook signature verification if needed
}

// Store webhook configuration
let webhookConfig: WebhookConfig = {
  url: '',
  enabled: false
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
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const webhookUrl = process.env.MAKE_WEBHOOK_URL || webhookConfig.url;
      
      if (!webhookUrl) {
        throw new Error('Make.com webhook URL not configured');
      }

      const payload = {
        type: 'multi_platform_content',
        timestamp: new Date().toISOString(),
        data: {
          platformContent: data.platformContent,
          platformSchedules: data.platformSchedules,
          metadata: data.metadata,
          contentPayload: this.formatContentForMake(data.platformContent, data.metadata)
        }
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        return { success: true };
      } else {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Multi-platform webhook error:', error);
      return { success: false, error: error.message };
    }
  }

  private formatContentForMake(platformContent: any, metadata: any) {
    const formatted: any = {};
    
    Object.entries(platformContent).forEach(([platform, content]: [string, any]) => {
      formatted[platform] = {
        platform,
        type: content.type,
        label: content.label,
        content: content.script || content.caption || content.content || '',
        hashtags: content.hashtags || [],
        postInstructions: content.postInstructions || '',
        metadata: {
          product: metadata.product,
          niche: metadata.niche,
          tone: metadata.tone,
          generatedAt: metadata.generatedAt
        }
      };
    });

    return formatted;
  }
}