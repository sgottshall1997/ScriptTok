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

      // Send ONE consolidated payload with all platform data instead of one per platform
      const newPayload = {
        event_type: "content_generated",
        platforms: platforms, // All selected platforms
        niche: data.metadata?.niche || '',
        script: data.contentData?.fullOutput || data.platformContent[platforms[0]]?.script || '',
        instagramCaption: igCaption,
        tiktokCaption: tiktokCaption,
        youtubeCaption: ytCaption,
        xCaption: xCaption,
        facebookCaption: data.platformContent?.facebook?.caption || igCaption,
        affiliateLink: data.metadata?.affiliateUrl || data.metadata?.affiliateLink || '',
        product: data.metadata?.product || data.metadata?.productName || '',
        imageUrl: data.metadata?.imageUrl || `https://via.placeholder.com/400x400?text=${encodeURIComponent(data.metadata?.product || 'Product')}`,
        tone: data.metadata?.tone || '',
        template: data.metadata?.template || data.metadata?.templateType || '',
        model: data.metadata?.aiModel === 'chatgpt' ? 'ChatGPT' : data.metadata?.aiModel === 'claude' ? 'Claude' : 'ChatGPT',
        contentFormat: data.metadata?.contentFormat || 'Regular Format',
        postType: 'reel',
        topRatedStyleUsed: data.metadata?.topRatedStyleUsed || false,
        useSpartanFormat: data.metadata?.useSpartanFormat || false,
        
        // VIRAL INSPIRATION DATA from Perplexity
        viralHook: data.contentData?.viralInspiration?.hook || '',
        viralFormat: data.contentData?.viralInspiration?.format || '',
        viralCaption: data.contentData?.viralInspiration?.caption || '',
        viralHashtags: data.contentData?.viralInspiration?.hashtags ? data.contentData.viralInspiration.hashtags.join(', ') : '',
        viralInspirationFound: !!data.contentData?.viralInspiration,
        
        // AI EVALUATION SCORES (now populated by dual-model evaluation system)
        chatgptViralityScore: data.contentData?.aiEvaluation?.chatgpt?.viralityScore || null,
        chatgptClarityScore: data.contentData?.aiEvaluation?.chatgpt?.clarityScore || null,
        chatgptPersuasivenessScore: data.contentData?.aiEvaluation?.chatgpt?.persuasivenessScore || null,
        chatgptCreativityScore: data.contentData?.aiEvaluation?.chatgpt?.creativityScore || null,
        chatgptOverallScore: data.contentData?.aiEvaluation?.chatgpt?.overallScore || null,
        
        claudeViralityScore: data.contentData?.aiEvaluation?.claude?.viralityScore || null,
        claudeClarityScore: data.contentData?.aiEvaluation?.claude?.clarityScore || null,
        claudePersuasivenessScore: data.contentData?.aiEvaluation?.claude?.persuasivenessScore || null,
        claudeCreativityScore: data.contentData?.aiEvaluation?.claude?.creativityScore || null,
        claudeOverallScore: data.contentData?.aiEvaluation?.claude?.overallScore || null,
        
        // EVALUATION SUMMARY
        averageOverallScore: data.contentData?.aiEvaluation?.averageScore || null,
        evaluationCompleted: data.contentData?.aiEvaluation?.evaluationCompleted || false,
        
        // ENHANCED AI EVALUATION DATA with justifications
        ratings: {
          gpt: {
            virality: data.contentData?.aiEvaluation?.chatgpt?.viralityScore || null,
            clarity: data.contentData?.aiEvaluation?.chatgpt?.clarityScore || null,
            persuasiveness: data.contentData?.aiEvaluation?.chatgpt?.persuasivenessScore || null,
            creativity: data.contentData?.aiEvaluation?.chatgpt?.creativityScore || null,
            overall: data.contentData?.aiEvaluation?.chatgpt?.overallScore || null,
            viralityJustification: data.contentData?.aiEvaluation?.chatgpt?.viralityJustification || '',
            clarityJustification: data.contentData?.aiEvaluation?.chatgpt?.clarityJustification || '',
            persuasivenessJustification: data.contentData?.aiEvaluation?.chatgpt?.persuasivenessJustification || '',
            creativityJustification: data.contentData?.aiEvaluation?.chatgpt?.creativityJustification || ''
          },
          claude: {
            virality: data.contentData?.aiEvaluation?.claude?.viralityScore || null,
            clarity: data.contentData?.aiEvaluation?.claude?.clarityScore || null,
            persuasiveness: data.contentData?.aiEvaluation?.claude?.persuasivenessScore || null,
            creativity: data.contentData?.aiEvaluation?.claude?.creativityScore || null,
            overall: data.contentData?.aiEvaluation?.claude?.overallScore || null,
            viralityJustification: data.contentData?.aiEvaluation?.claude?.viralityJustification || '',
            clarityJustification: data.contentData?.aiEvaluation?.claude?.clarityJustification || '',
            persuasivenessJustification: data.contentData?.aiEvaluation?.claude?.persuasivenessJustification || '',
            creativityJustification: data.contentData?.aiEvaluation?.claude?.creativityJustification || ''
          }
        },
        
        timestamp: new Date().toISOString()
      };

      // Enhanced logging with timestamp and highlighted fields including viral inspiration and AI evaluation
      const timestamp = new Date().toLocaleString();
      console.log(`\n🚀 [${timestamp}] CONSOLIDATED WEBHOOK PAYLOAD TO MAKE.COM`);
      console.log('━'.repeat(80));
      console.log(`📤 Platforms: ${newPayload.platforms.join(', ')}`);
      console.log(`🎯 Niche: ${newPayload.niche}`);
      console.log(`📝 Script Preview: ${typeof newPayload.script === 'string' ? newPayload.script.substring(0, 100) : JSON.stringify(newPayload.script).substring(0, 100)}...`);
      console.log(`🔗 Product: ${newPayload.product}`);
      console.log(`🤖 AI Model: ${newPayload.model}`);
      console.log(`📄 Content Format: ${newPayload.contentFormat}`);
      console.log(`🎯 Top Rated Style Used: ${newPayload.topRatedStyleUsed}`);
      console.log(`🏛️ Spartan Format: ${newPayload.useSpartanFormat}`);
      console.log(`💰 Affiliate Link: ${newPayload.affiliateLink ? 'Yes' : 'No'}`);
      console.log(`✨ Viral Inspiration: ${newPayload.viralInspirationFound ? 'Yes' : 'No'}`);
      if (newPayload.viralInspirationFound) {
        console.log(`   🎣 Hook: ${newPayload.viralHook}`);
        console.log(`   📐 Format: ${newPayload.viralFormat}`);
        console.log(`   🏷️ Hashtags: ${newPayload.viralHashtags}`);
      }
      console.log(`🎯 AI Evaluation: ${newPayload.evaluationCompleted ? 'Completed' : 'Pending'}`);
      if (newPayload.evaluationCompleted) {
        console.log(`   🤖 ChatGPT Overall: ${newPayload.chatgptOverallScore}/10`);
        console.log(`   🎭 Claude Overall: ${newPayload.claudeOverallScore}/10`);
        console.log(`   📊 Average Score: ${newPayload.averageOverallScore}/10`);
        console.log(`   📈 Detailed Scores: V:${newPayload.chatgptViralityScore}/${newPayload.claudeViralityScore} C:${newPayload.chatgptClarityScore}/${newPayload.claudeClarityScore} P:${newPayload.chatgptPersuasivenessScore}/${newPayload.claudePersuasivenessScore} Cr:${newPayload.chatgptCreativityScore}/${newPayload.claudeCreativityScore}`);
      }
      console.log('━'.repeat(80));
      
      // CRITICAL VALIDATION: Ensure AI evaluation data is present
      const hasGptRatings = newPayload.ratings?.gpt?.overall !== null && newPayload.ratings?.gpt?.overall !== undefined;
      const hasClaudeRatings = newPayload.ratings?.claude?.overall !== null && newPayload.ratings?.claude?.overall !== undefined;
      const evaluationValid = hasGptRatings && hasClaudeRatings && newPayload.evaluationCompleted;
      
      console.log(`🛡️ AI EVALUATION VALIDATION:`);
      console.log(`   ✅ ChatGPT Rating: ${hasGptRatings ? '✓' : '❌'} (${newPayload.ratings?.gpt?.overall || 'MISSING'})`);
      console.log(`   ✅ Claude Rating: ${hasClaudeRatings ? '✓' : '❌'} (${newPayload.ratings?.claude?.overall || 'MISSING'})`);
      console.log(`   ✅ Evaluation Complete: ${newPayload.evaluationCompleted ? '✓' : '❌'}`);
      console.log(`   🎯 VALIDATION STATUS: ${evaluationValid ? '✅ PASSED' : '❌ FAILED'}`);
      
      if (!evaluationValid) {
        console.error('🚨 CRITICAL ERROR: Incomplete AI evaluation data in webhook payload!');
        console.error('   This should not happen due to fail-safe protection.');
        console.error('   Payload will still be sent but with incomplete ratings.');
      }
      
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

      console.log(`✅ Make.com webhook response:`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      console.log(`✅ Bulk content sent to Make.com for ${newPayload.product}`);
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