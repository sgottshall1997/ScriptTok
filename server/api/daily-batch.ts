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

// Template rotation for variety
const TEMPLATE_ROTATION = [
  'product_review',
  'influencer_caption', 
  'trending_explainer',
  'bullet_points',
  'routine_kit',
  'buyer_persona',
  'viral_hook'
];

// Tone rotation for variety
const TONE_ROTATION = [
  'friendly',
  'enthusiastic', 
  'trendy',
  'professional',
  'casual',
  'luxurious',
  'educational'
];

export async function generateDailyBatch(req: Request, res: Response) {
  try {
    console.log('🎯 Starting daily batch content generation...');
    
    // Get trending products organized by niche using your existing storage
    const trendingProducts = await storage.getTrendingProductsByNiche();
    const results = [];
    const webhookService = new WebhookService();

    for (let i = 0; i < DAILY_NICHES.length; i++) {
      const niche = DAILY_NICHES[i];
      const template = TEMPLATE_ROTATION[i % TEMPLATE_ROTATION.length];
      const tone = TONE_ROTATION[i % TONE_ROTATION.length];
      
      console.log(`📝 Generating content for ${niche} niche...`);
      
      // Get top trending product for this niche
      const nicheProducts = trendingProducts[niche] || [];
      const topProduct = nicheProducts[0]?.title || `Top ${niche} Product`;
      
      try {
        // Generate content using your existing multi-platform generator
        const contentResult = await generateMultiPlatformContent(
          topProduct,
          niche,
          tone,
          template,
          ['Instagram'], // Default to Instagram for consistency
          '30'
        );

        if (contentResult.success && contentResult.platformContent) {
          const instagramContent = contentResult.platformContent.Instagram;
          
          const batchItem = {
            niche,
            product: topProduct,
            template,
            tone,
            script: instagramContent?.script || '',
            caption: instagramContent?.caption || contentResult.content,
            hashtags: Array.isArray(instagramContent?.hashtags) 
              ? instagramContent.hashtags.join(' ') 
              : '',
            postInstructions: instagramContent?.postInstructions || '',
            createdAt: new Date().toISOString(),
            source: 'GlowBot-DailyBatch'
          };

          results.push(batchItem);
          
          // Send each piece to Make.com webhook immediately
          const flatPayload = {
            platform: 'Instagram',
            postType: 'photo',
            caption: batchItem.caption,
            hashtags: batchItem.hashtags,
            script: batchItem.script,
            postInstructions: batchItem.postInstructions,
            product: batchItem.product,
            niche: batchItem.niche,
            tone: batchItem.tone,
            templateType: batchItem.template,
            scheduledTime: '',
            timestamp: batchItem.createdAt,
            source: 'GlowBot-DailyBatch',
            batchId: `daily-${new Date().toISOString().split('T')[0]}`
          };

          // Send to Make.com webhook
          try {
            await webhookService.sendMultiPlatformContent({
              platformContent: { Instagram: instagramContent },
              platformSchedules: {},
              metadata: {
                product: topProduct,
                niche,
                tone,
                templateType: template,
                generatedAt: batchItem.createdAt,
                batchGeneration: true
              }
            });
            console.log(`✅ Sent ${niche} content to Make.com`);
          } catch (webhookError) {
            console.log(`⚠️ Webhook failed for ${niche}:`, webhookError);
          }

        } else {
          console.log(`❌ Content generation failed for ${niche}`);
          results.push({
            niche,
            product: topProduct,
            template,
            tone,
            error: 'Content generation failed',
            createdAt: new Date().toISOString()
          });
        }

      } catch (nicheError) {
        console.error(`❌ Error generating ${niche} content:`, nicheError);
        results.push({
          niche,
          product: topProduct,
          template,
          tone,
          error: nicheError.message,
          createdAt: new Date().toISOString()
        });
      }

      // Small delay between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`🎉 Daily batch complete! Generated ${results.length} pieces of content`);

    res.json({
      success: true,
      message: `Generated ${results.length} daily content pieces`,
      totalNiches: DAILY_NICHES.length,
      successCount: results.filter(r => !r.error).length,
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