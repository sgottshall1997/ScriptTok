import axios from 'axios';
import { ContentHistory, NicheWebhook } from '@shared/schema';
import { db } from '../db';
import { nicheWebhooks } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Legacy webhook configuration interface (for backwards compatibility)
export interface WebhookConfig {
  url: string;
  enabled: boolean;
  secret?: string;
}

// Multi-niche webhook configuration interface
export interface NicheWebhookConfig {
  [niche: string]: {
    url: string;
    enabled: boolean;
  };
}

// Default webhook URLs for each niche
const DEFAULT_WEBHOOK_MAP: NicheWebhookConfig = {
  beauty: { url: '', enabled: false },
  fitness: { url: '', enabled: false },
  tech: { url: '', enabled: false },
  fashion: { url: '', enabled: false },
  food: { url: '', enabled: false },
  travel: { url: '', enabled: false },
  pets: { url: '', enabled: false },
};

// Fallback to single webhook for backwards compatibility
let legacyWebhookConfig: WebhookConfig = {
  url: 'https://hook.us2.make.com/rrdlmayg3mvi68p2jxhdxbg2ohy41pn4',
  enabled: true
};

/**
 * Get niche webhook configurations from database
 */
export const getNicheWebhooks = async (): Promise<NicheWebhookConfig> => {
  try {
    const webhooks = await db.select().from(nicheWebhooks);
    const config: NicheWebhookConfig = { ...DEFAULT_WEBHOOK_MAP };
    
    webhooks.forEach(webhook => {
      config[webhook.niche] = {
        url: webhook.webhookUrl,
        enabled: webhook.enabled,
      };
    });
    
    return config;
  } catch (error) {
    console.error('Error fetching niche webhooks:', error);
    return DEFAULT_WEBHOOK_MAP;
  }
};

/**
 * Update niche webhook configuration
 */
export const updateNicheWebhook = async (niche: string, url: string, enabled: boolean): Promise<boolean> => {
  try {
    // Check if webhook exists for this niche
    const existing = await db.select().from(nicheWebhooks).where(eq(nicheWebhooks.niche, niche));
    
    if (existing.length > 0) {
      // Update existing webhook
      await db.update(nicheWebhooks)
        .set({ 
          webhookUrl: url, 
          enabled: enabled,
          updatedAt: new Date()
        })
        .where(eq(nicheWebhooks.niche, niche));
    } else {
      // Insert new webhook
      await db.insert(nicheWebhooks).values({
        niche,
        webhookUrl: url,
        enabled,
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating niche webhook for ${niche}:`, error);
    return false;
  }
};

/**
 * Configure the legacy webhook service (backwards compatibility)
 */
export const configureWebhook = (config: WebhookConfig): void => {
  legacyWebhookConfig = {
    ...config,
    enabled: config.enabled && Boolean(config.url && config.url.startsWith('http')),
  };
};

/**
 * Get current legacy webhook configuration (backwards compatibility)
 */
export const getWebhookConfig = (): WebhookConfig => {
  return { ...legacyWebhookConfig };
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
 * Send webhook notification to niche-specific webhook
 * @param niche The content niche (beauty, tech, fitness, etc.)
 * @param payload The data to send to the webhook
 * @returns Promise resolving to success status and message
 */
export const sendNicheWebhook = async (
  niche: string,
  payload: any
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`🚀 Attempting to send niche webhook for: ${niche}`);
    
    const nicheWebhookConfigs = await getNicheWebhooks();
    const webhookConfig = nicheWebhookConfigs[niche.toLowerCase()];
    
    console.log(`📋 Retrieved webhook config for ${niche}:`, {
      hasConfig: !!webhookConfig,
      hasUrl: !!(webhookConfig?.url),
      enabled: webhookConfig?.enabled,
      url: webhookConfig?.url ? `${webhookConfig.url.substring(0, 50)}...` : 'N/A'
    });
    
    if (!webhookConfig || !webhookConfig.enabled || !webhookConfig.url) {
      console.log(`⚠️ Niche webhook not configured for ${niche}, falling back to legacy webhook`);
      return sendLegacyWebhook(payload);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'GlowBot/1.0'
    };

    console.log(`📤 Sending to niche webhook URL: ${webhookConfig.url}`);
    console.log(`📋 Payload being sent:`, JSON.stringify(payload, null, 2));

    const response = await axios.post(webhookConfig.url, payload, { 
      headers,
      timeout: 10000 // 10 second timeout
    });
    
    // Update success count
    await updateWebhookStats(niche, true);
    
    console.log(`✅ Niche webhook sent successfully for ${niche} to ${webhookConfig.url}`);
    console.log(`📊 Response status: ${response.status}, data:`, response.data);
    
    return {
      success: true,
      message: `Niche webhook delivered successfully for ${niche}. Status: ${response.status}. Response: ${JSON.stringify(response.data)}`
    };
  } catch (error) {
    console.error(`❌ Error sending niche webhook for ${niche}:`, error);
    
    // Update failure count
    await updateWebhookStats(niche, false);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const axiosError = error as any;
    
    let detailedMessage = `Niche webhook failed for ${niche}: ${errorMessage}`;
    
    if (axiosError?.response) {
      detailedMessage += ` (HTTP ${axiosError.response.status}: ${axiosError.response.statusText})`;
    }
    
    return {
      success: false,
      message: detailedMessage
    };
  }
};

/**
 * Send webhook notification for generated content (legacy method for backwards compatibility)
 * @param contentData The content history entry
 * @returns Promise resolving to success status and message
 */
export const sendWebhookNotification = async (
  contentData: ContentHistory
): Promise<{ success: boolean; message: string }> => {
  const payload = preparePayload(contentData);
  
  // Try niche-specific webhook first
  if (contentData.niche) {
    return sendNicheWebhook(contentData.niche, payload);
  }
  
  // Fallback to legacy webhook
  return sendLegacyWebhook(payload);
};

/**
 * Send webhook to legacy single webhook URL (backwards compatibility)
 */
const sendLegacyWebhook = async (payload: any): Promise<{ success: boolean; message: string }> => {
  if (!legacyWebhookConfig.enabled || !legacyWebhookConfig.url) {
    return { 
      success: false, 
      message: 'Webhook not configured or disabled' 
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (legacyWebhookConfig.secret) {
      // Here you could implement HMAC signature for security
      // headers['X-Webhook-Signature'] = createSignature(payload, legacyWebhookConfig.secret);
    }

    const response = await axios.post(legacyWebhookConfig.url, payload, { 
      headers,
      timeout: 10000
    });
    
    console.log(`✅ Legacy webhook sent successfully to ${legacyWebhookConfig.url}`);
    
    return {
      success: true,
      message: `Legacy webhook delivered successfully. Status: ${response.status}`
    };
  } catch (error) {
    console.error('❌ Error sending legacy webhook:', error);
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
          // Alternative field names for Make.com compatibility
          AffiliateLink: data.metadata?.affiliateUrl || data.metadata?.affiliateLink || '',
          affiliate_link: data.metadata?.affiliateUrl || data.metadata?.affiliateLink || '',
          
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

/**
 * Update webhook success/failure statistics
 */
const updateWebhookStats = async (niche: string, success: boolean): Promise<void> => {
  try {
    const existing = await db.select().from(nicheWebhooks).where(eq(nicheWebhooks.niche, niche));
    
    if (existing.length > 0) {
      const webhook = existing[0];
      await db.update(nicheWebhooks)
        .set({
          successCount: success ? webhook.successCount + 1 : webhook.successCount,
          failureCount: success ? webhook.failureCount : webhook.failureCount + 1,
          lastUsed: new Date(),
          updatedAt: new Date()
        })
        .where(eq(nicheWebhooks.niche, niche));
    }
  } catch (error) {
    console.error(`Error updating webhook stats for ${niche}:`, error);
  }
};

/**
 * Test webhook connection for a specific niche
 */
export const testNicheWebhook = async (niche: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`🧪 Testing webhook for niche: ${niche}`);
    
    // Get current webhook configuration
    const nicheWebhookConfigs = await getNicheWebhooks();
    const webhookConfig = nicheWebhookConfigs[niche.toLowerCase()];
    
    console.log(`📋 Webhook config for ${niche}:`, webhookConfig);
    
    if (!webhookConfig || !webhookConfig.url) {
      return {
        success: false,
        message: `No webhook URL configured for ${niche} niche. Please add a webhook URL first.`
      };
    }
    
    if (!webhookConfig.enabled) {
      // Auto-enable webhook for testing
      console.log(`🔧 Auto-enabling webhook for ${niche} during test`);
      await updateNicheWebhook(niche.toLowerCase(), webhookConfig.url, true);
    }
    
    const testPayload = {
      event_type: 'webhook_test',
      timestamp: new Date().toISOString(),
      niche: niche,
      message: `Test webhook for ${niche} niche from GlowBot`,
      test_data: {
        product: `Test ${niche} Product`,
        content: 'This is a test webhook payload to verify connectivity',
        platform: 'Test Platform',
        url: webhookConfig.url
      }
    };
    
    console.log(`📤 Sending test payload to ${niche} webhook:`, JSON.stringify(testPayload, null, 2));
    
    const result = await sendNicheWebhook(niche, testPayload);
    
    if (result.success) {
      console.log(`✅ Test successful for ${niche} niche webhook`);
    } else {
      console.log(`❌ Test failed for ${niche} niche webhook:`, result.message);
    }
    
    return result;
  } catch (error) {
    console.error(`🚨 Error testing webhook for ${niche}:`, error);
    return {
      success: false,
      message: `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Enhanced multi-platform webhook sender for content generation
 */
export const sendMultiPlatformWebhook = async (data: {
  niche: string;
  productName: string;
  platforms: string[];
  content: any;
  platformCaptions?: any;
  affiliateLink?: string;
  metadata?: any;
  imageUrl?: string;
}): Promise<{ success: boolean; message: string }> => {
  // Create the new payload structure as specified
  const payload = {
    event_type: 'content_generated',
    niche: data.niche,
    script: data.content?.mainContent || data.content?.script || data.content?.fullOutput || 'Generated content will appear here...',
    instagramCaption: data.platformCaptions?.Instagram || data.platformCaptions?.instagram || '✨ Must-have item! #amazonfinds',
    tiktokCaption: data.platformCaptions?.TikTok || data.platformCaptions?.tiktok || 'This product changed everything 😍 #trending',
    xCaption: data.platformCaptions?.X || data.platformCaptions?.Twitter || data.platformCaptions?.twitter || 'Top trending pick 🔥 #ad',
    facebookCaption: data.platformCaptions?.Facebook || data.platformCaptions?.facebook || 'See why everyone\'s buying this 🔗',
    affiliateLink: data.affiliateLink || 'https://amzn.to/example123',
    product: data.productName || 'Product Name',
    imageUrl: data.imageUrl || 'https://example.com/image.jpg',
    tone: data.metadata?.tone || 'professional',
    template: data.metadata?.template || data.metadata?.templateType || 'standard',
    postType: data.metadata?.postType || 'reel',
    timestamp: new Date().toISOString()
  };
  
  console.log(`📤 Sending new webhook payload format for ${data.niche}:`, JSON.stringify(payload, null, 2));
  
  return sendNicheWebhook(data.niche, payload);
};