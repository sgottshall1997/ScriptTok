/**
 * WEBHOOK DISPATCHER
 * Unified webhook handling for all content generation workflows
 */

import axios from 'axios';
import { ContentGenerationConfig, GeneratedContentPayload } from './unifiedContentGenerator';

export interface WebhookPayload {
  event_type: string;
  timestamp: string;
  niche: string;
  product: string;
  tone: string;
  template: string;
  platforms: string[];
  model: string;
  contentFormat: string;
  affiliateId: string;
  
  // Content fields
  script: string;
  instagramCaption: string;
  tiktokCaption: string;
  youtubeCaption: string;
  xCaption: string;
  facebookCaption: string;
  
  // Metadata
  postType: string;
  imageUrl: string;
  topRatedStyleUsed: boolean;
  
  // Viral inspiration
  viralHook?: string;
  viralFormat?: string;
  viralCaption?: string;
  viralHashtags?: string;
  viralInspirationFound: boolean;
  
  // AI evaluations (placeholder structure for future integration)
  chatgptVirality?: number;
  chatgptClarity?: number;
  chatgptPersuasiveness?: number;
  chatgptCreativity?: number;
  chatgptOverall?: number;
  
  claudeVirality?: number;
  claudeClarity?: number;
  claudePersuasiveness?: number;
  claudeCreativity?: number;
  claudeOverall?: number;
  
  averageScore?: number;
}

const WEBHOOK_URL = 'https://hook.us2.make.com/rkemtdx2hmy4tpd0to9bht6dg23s8wjw';

/**
 * SEND CONTENT TO WEBHOOK
 */
export async function sendToWebhook(
  content: GeneratedContentPayload,
  config: ContentGenerationConfig,
  eventType: string = 'content_generated'
): Promise<boolean> {
  try {
    const payload: WebhookPayload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      niche: config.niche,
      product: config.productName,
      tone: config.tone,
      template: config.templateType,
      platforms: config.platforms,
      model: config.aiModel === 'chatgpt' ? 'ChatGPT' : 'Claude',
      contentFormat: config.contentFormat === 'spartan' ? 'Spartan Format' : 'Regular Format',
      affiliateId: config.affiliateId || 'sgottshall107-20',
      
      // Content
      script: content.script,
      instagramCaption: content.instagramCaption,
      tiktokCaption: content.tiktokCaption,
      youtubeCaption: content.youtubeCaption,
      xCaption: content.xCaption,
      facebookCaption: content.facebookCaption,
      
      // Metadata
      postType: `${config.niche}_${config.templateType}`,
      imageUrl: generateImagePlaceholder(config.productName),
      topRatedStyleUsed: config.smartStyleRecommendations ? true : false,
      
      // Viral inspiration (from config if available)
      viralHook: config.viralInspiration?.hook || '',
      viralFormat: config.viralInspiration?.format || '',
      viralCaption: config.viralInspiration?.caption || '',
      viralHashtags: config.viralInspiration?.hashtags || '',
      viralInspirationFound: config.viralInspiration ? true : false,
      
      // AI evaluations (placeholder - will be enhanced when AI evaluation is integrated)
      chatgptVirality: 7,
      chatgptClarity: 8,
      chatgptPersuasiveness: 7,
      chatgptCreativity: 6,
      chatgptOverall: 7,
      
      claudeVirality: 8,
      claudeClarity: 7,
      claudePersuasiveness: 8,
      claudeCreativity: 7,
      claudeOverall: 8,
      
      averageScore: 7.5
    };

    console.log(`📤 Sending webhook for ${config.productName} (${config.niche})`);
    console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
    console.log(`🤖 AI Model: ${payload.model} | 🏛️ Format: ${payload.contentFormat}`);

    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GlowBot-ContentGenerator/1.0'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      console.log(`✅ Webhook delivered successfully for ${config.productName}`);
      return true;
    } else {
      console.error(`❌ Webhook failed with status ${response.status}:`, response.data);
      return false;
    }

  } catch (error) {
    console.error(`❌ Webhook error for ${config.productName}:`, error.message);
    return false;
  }
}

/**
 * BATCH WEBHOOK SENDER (for bulk operations)
 */
export async function sendBatchWebhooks(
  contentBatch: Array<{
    content: GeneratedContentPayload;
    config: ContentGenerationConfig;
  }>,
  eventType: string = 'bulk_content_generated'
): Promise<{ success: number; failed: number }> {
  console.log(`📦 Sending batch webhooks for ${contentBatch.length} items`);
  
  let success = 0;
  let failed = 0;
  
  for (const item of contentBatch) {
    const sent = await sendToWebhook(item.content, item.config, eventType);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    
    // Small delay between webhook calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`📊 Batch webhook results: ${success} success, ${failed} failed`);
  return { success, failed };
}

/**
 * TEST WEBHOOK FUNCTIONALITY
 */
export async function testWebhook(): Promise<boolean> {
  const testPayload: WebhookPayload = {
    event_type: 'webhook_test',
    timestamp: new Date().toISOString(),
    niche: 'tech',
    product: 'Test Product',
    tone: 'professional',
    template: 'Short-Form Video Script',
    platforms: ['tiktok', 'instagram'],
    model: 'Claude',
    contentFormat: 'Regular Format',
    affiliateId: 'sgottshall107-20',
    
    script: 'This is a test script for webhook functionality testing.',
    instagramCaption: 'Test Instagram caption #test',
    tiktokCaption: 'Test TikTok caption #test',
    youtubeCaption: 'Test YouTube caption for testing',
    xCaption: 'Test Twitter caption #test',
    facebookCaption: 'Test Facebook caption for webhook testing',
    
    postType: 'tech_test',
    imageUrl: 'https://via.placeholder.com/400x400?text=Test+Product',
    topRatedStyleUsed: true,
    
    viralHook: 'Test viral hook',
    viralFormat: 'test format',
    viralCaption: 'test viral caption',
    viralHashtags: '#test #webhook',
    viralInspirationFound: true,
    
    chatgptVirality: 8,
    chatgptClarity: 7,
    chatgptPersuasiveness: 8,
    chatgptCreativity: 7,
    chatgptOverall: 8,
    
    claudeVirality: 7,
    claudeClarity: 8,
    claudePersuasiveness: 7,
    claudeCreativity: 8,
    claudeOverall: 8,
    
    averageScore: 7.5
  };

  try {
    console.log('🧪 Testing webhook functionality...');
    
    const response = await axios.post(WEBHOOK_URL, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GlowBot-WebhookTester/1.0'
      },
      timeout: 10000
    });

    if (response.status === 200) {
      console.log('✅ Webhook test successful');
      return true;
    } else {
      console.error(`❌ Webhook test failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook test error:', error.message);
    return false;
  }
}

/**
 * GENERATE IMAGE PLACEHOLDER
 */
function generateImagePlaceholder(productName: string): string {
  const encodedProduct = encodeURIComponent(productName.substring(0, 50));
  return `https://via.placeholder.com/400x400?text=${encodedProduct}`;
}

/**
 * WEBHOOK STATUS MONITORING
 */
export interface WebhookStats {
  totalSent: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  lastSent?: string;
  lastError?: string;
}

// Simple in-memory stats (could be enhanced with database storage)
let webhookStats: WebhookStats = {
  totalSent: 0,
  successCount: 0,
  failureCount: 0,
  successRate: 0
};

export function updateWebhookStats(success: boolean, error?: string): void {
  webhookStats.totalSent++;
  webhookStats.lastSent = new Date().toISOString();
  
  if (success) {
    webhookStats.successCount++;
  } else {
    webhookStats.failureCount++;
    webhookStats.lastError = error;
  }
  
  webhookStats.successRate = webhookStats.totalSent > 0 
    ? (webhookStats.successCount / webhookStats.totalSent) * 100 
    : 0;
}

export function getWebhookStats(): WebhookStats {
  return { ...webhookStats };
}