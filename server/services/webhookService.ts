import axios from 'axios';
import { ContentHistory } from '@shared/schema';

// Webhook configuration interface
export interface WebhookConfig {
  url: string;
  enabled: boolean;
  secret?: string;  // For webhook signature verification if needed
}

// Store webhook configuration - Default to new URL
let webhookConfig: WebhookConfig = {
  url: 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw',
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
      // Prioritize database configuration over environment variable
      const webhookUrl = webhookConfig.url || process.env.MAKE_WEBHOOK_URL;
      
      console.log(`🔍 DEBUG: Using webhook URL: ${webhookUrl}`);
      console.log(`🔍 DEBUG: webhookConfig.url = ${webhookConfig.url}`);
      console.log(`🔍 DEBUG: process.env.MAKE_WEBHOOK_URL = ${process.env.MAKE_WEBHOOK_URL}`);
      
      if (!webhookUrl) {
        throw new Error('Make.com webhook URL not configured');
      }

      // Send comprehensive payload with all CSV fields
      const platforms = Object.keys(data.platformContent);
      const results = [];

      // Extract platform-specific captions
      const tiktokCaption = data.platformContent?.tiktok?.caption || '';
      const igCaption = data.platformContent?.instagram?.caption || '';
      const ytCaption = data.platformContent?.youtube?.caption || data.platformContent?.youtube?.script || '';
      const xCaption = data.platformContent?.twitter?.caption || data.platformContent?.x?.caption || '';

      // Send one payload per platform with your new simplified format
      for (const platform of platforms) {
        const platformData = data.platformContent[platform];
        
        // Create your new simplified JSON payload format with AI model and content format
        const newPayload = {
          event_type: "content_generated",
          platform: platform, // Added platform field
          niche: data.metadata?.niche || '',
          script: data.contentData?.fullOutput || platformData.script || '',
          instagramCaption: igCaption,
          tiktokCaption: tiktokCaption,
          youtubeCaption: ytCaption, // Added YouTube caption field
          xCaption: xCaption,
          facebookCaption: data.platformContent?.facebook?.caption || igCaption, // Use IG caption as fallback for Facebook
          affiliateLink: data.metadata?.affiliateUrl || data.metadata?.affiliateLink || '',
          product: data.metadata?.product || data.metadata?.productName || '',
          imageUrl: data.metadata?.imageUrl || `https://via.placeholder.com/400x400?text=${encodeURIComponent(data.metadata?.product || 'Product')}`,
          tone: data.metadata?.tone || '',
          template: data.metadata?.template || data.metadata?.templateType || '',
          model: data.metadata?.aiModel === 'chatgpt' ? 'ChatGPT' : data.metadata?.aiModel === 'claude' ? 'Claude' : 'ChatGPT', // Transform to display names
          contentFormat: data.metadata?.contentFormat || 'Regular Format', // Either 'Regular Format' or 'Spartan Format'
          postType: platformData.type || 'reel',
          topRatedStyleUsed: data.metadata?.useSmartStyle || false, // Include smart style tracking
          timestamp: new Date().toISOString()
        };

        // Enhanced logging with timestamp and highlighted fields
        const timestamp = new Date().toLocaleString();
        console.log(`\n🚀 [${timestamp}] WEBHOOK PAYLOAD TO MAKE.COM`);
        console.log('━'.repeat(80));
        console.log(`📤 Platform: ${platform}`);
        console.log(`🎯 Niche: ${newPayload.niche}`);
        console.log(`📝 Script Preview: ${newPayload.script.substring(0, 100)}...`);
        console.log(`🔗 Product: ${newPayload.product}`);
        console.log(`🤖 AI Model: ${newPayload.model}`);
        console.log(`📄 Content Format: ${newPayload.contentFormat}`);
        console.log(`💰 Affiliate Link: ${newPayload.affiliateLink ? 'Yes' : 'No'}`);
        console.log('━'.repeat(80));
        console.log('📋 COMPLETE PAYLOAD:');
        console.log(JSON.stringify(newPayload, null, 2));
        console.log('━'.repeat(80));

        const response = await axios.post(webhookUrl, newPayload, {
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