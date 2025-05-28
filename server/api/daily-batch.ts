import { Request, Response } from 'express';
import { storage } from '../storage';
import { generateContent } from '../services/contentGenerator';
import { WebhookService } from '../services/webhookService';

const DAILY_NICHES = [
  'skincare',
  'tech', 
  'fashion',
  'fitness',
  'food',
  'travel',
  'pet'
];

// High-performing templates based on conversion success
const HIGH_CONVERSION_TEMPLATES = [
  'influencer_caption',    // Proven high engagement
  'viral_hook',           // Strong viral potential  
  'trending_explainer',   // Educational sells well
  'bullet_points',        // Easy to consume format
  'buyer_persona'         // Targeted messaging
] as const;

// High-engagement tones that drive sales
const SALES_FOCUSED_TONES = [
  'enthusiastic',         // Creates excitement
  'trendy',              // Appeals to FOMO
  'friendly',            // Builds trust
  'luxurious',           // Premium positioning
  'casual'               // Relatable approach
];

// Track used products to avoid repetition across batches
const usedProducts = new Set<string>();

export async function generateDailyBatch(req: Request, res: Response) {
  try {
    console.log('🎯 Starting intelligent daily batch content generation...');
    console.log('🎪 Focusing on high-conversion products and proven templates');
    
    const results = [];
    const webhookService = new WebhookService();

    for (let i = 0; i < DAILY_NICHES.length; i++) {
      const niche = DAILY_NICHES[i];
      // Use high-performing templates for better conversion
      const template = HIGH_CONVERSION_TEMPLATES[i % HIGH_CONVERSION_TEMPLATES.length];
      // Use sales-focused tones for better engagement
      const tone = SALES_FOCUSED_TONES[i % SALES_FOCUSED_TONES.length];
      
      console.log(`📝 Generating content for ${niche} niche with ${template} template...`);
      
      // Get multiple trending products and select the best one
      const nicheProducts = await storage.getTrendingProductsByNiche(niche, 5);
      
      // Smart product selection: prioritize high mentions + avoid repeats
      let selectedProduct = null;
      for (const product of nicheProducts) {
        const productKey = `${product.title}-${niche}`;
        if (!usedProducts.has(productKey)) {
          selectedProduct = product;
          usedProducts.add(productKey);
          break;
        }
      }
      
      // Fallback to highest mention product if all were used
      const topProduct = selectedProduct?.title || nicheProducts[0]?.title || `Top ${niche} Product`;
      const mentions = selectedProduct?.mentions || nicheProducts[0]?.mentions || 0;
      
      console.log(`💎 Selected: "${topProduct}" (${mentions.toLocaleString()} mentions)`);
      
      try {
        // Generate video content specifically for morning automation
        const platforms = ['TikTok', 'Instagram', 'YouTube Shorts'];
        const randomPlatform = platforms[i % platforms.length];
        
        const videoResult = await fetch('/api/multi-platform/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: topProduct,
            niche: niche,
            tone: tone,
            templateType: template,
            contentType: 'Video Content',
            platforms: [randomPlatform],
            videoDuration: '30'
          })
        });

        const videoContent = await videoResult.json();

        if (videoContent.success && videoContent.platformContent) {
          const platformData = videoContent.platformContent[randomPlatform];
          
          const batchItem = {
            niche,
            product: topProduct,
            template,
            tone,
            mentions: mentions,
            platform: randomPlatform,
            script: platformData?.script || '',
            caption: platformData?.caption || '',
            hashtags: Array.isArray(platformData?.hashtags) ? platformData.hashtags.join(' ') : '',
            postInstructions: platformData?.postInstructions || `Video script for ${niche} niche`,
            createdAt: new Date().toISOString(),
            source: 'GlowBot-VideoAutomation'
          };

          results.push(batchItem);

          // Send video content to Make.com webhook with enhanced categorization
          try {
            // Create enhanced payload with content type categorization
            const enhancedPlatformContent = {};
            for (const [platform, content] of Object.entries(videoContent.platformContent)) {
              enhancedPlatformContent[platform] = {
                ...content,
                contentCategory: 'video',
                mediaType: 'video_script',
                automationReady: true,
                batchId: `daily-${new Date().toISOString().split('T')[0]}`
              };
            }

            await webhookService.sendMultiPlatformContent({
              platformContent: enhancedPlatformContent,
              platformSchedules: {},
              metadata: {
                product: batchItem.product,
                niche: batchItem.niche,
                tone: batchItem.tone,
                templateType: batchItem.template,
                generatedAt: batchItem.createdAt,
                batchGeneration: true,
                contentType: 'video',
                mediaType: 'video_script',
                automationSource: 'daily_batch',
                mentions: batchItem.mentions
              }
            });
            console.log(`✅ Sent ${niche} video content to Make.com with enhanced categorization`);
          } catch (webhookError) {
            console.log(`⚠️ Webhook failed for ${niche}:`, webhookError);
          }

        } else {
          console.log(`❌ Content generation failed for ${niche}`);
          const errorItem = {
            niche,
            product: topProduct,
            template,
            tone,
            mentions: mentions,
            script: '',
            caption: 'Content generation failed',
            hashtags: '',
            postInstructions: '',
            error: 'Content generation failed',
            createdAt: new Date().toISOString(),
            source: 'GlowBot-SmartBatch'
          };
          results.push(errorItem);
        }

      } catch (nicheError: any) {
        console.error(`❌ Error generating ${niche} content:`, nicheError);
        const errorItem = {
          niche,
          product: topProduct,
          template,
          tone,
          mentions: mentions,
          script: '',
          caption: 'Error occurred during generation',
          hashtags: '',
          postInstructions: '',
          error: nicheError.message,
          createdAt: new Date().toISOString(),
          source: 'GlowBot-SmartBatch'
        };
        results.push(errorItem);
      }

      // Longer delay between generations to ensure one-at-a-time processing
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successCount = results.filter(r => !('error' in r)).length;
    console.log(`🎉 Daily batch complete! Generated ${results.length} pieces of content`);

    res.json({
      success: true,
      message: `Generated ${results.length} daily content pieces`,
      totalNiches: DAILY_NICHES.length,
      successCount,
      batchId: `daily-${new Date().toISOString().split('T')[0]}`,
      generatedAt: new Date().toISOString(),
      results
    });

  } catch (error: any) {
    console.error('❌ Daily batch generation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate daily content batch',
      results: []
    });
  }
}