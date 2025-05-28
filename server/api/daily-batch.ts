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

// Template rotation for variety - using valid template types
const TEMPLATE_ROTATION = [
  'influencer_caption',
  'trending_explainer',
  'bullet_points',
  'routine_kit',
  'buyer_persona',
  'seo_blog',
  'viral_hook'
] as const;

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
    
    const results = [];
    const webhookService = new WebhookService();

    for (let i = 0; i < DAILY_NICHES.length; i++) {
      const niche = DAILY_NICHES[i];
      const template = TEMPLATE_ROTATION[i % TEMPLATE_ROTATION.length];
      const tone = TONE_ROTATION[i % TONE_ROTATION.length];
      
      console.log(`📝 Generating content for ${niche} niche...`);
      
      // Get top trending product for this niche
      const nicheProducts = await storage.getTrendingProductsByNiche(niche, 1);
      const topProduct = nicheProducts[0]?.title || `Top ${niche} Product`;
      
      try {
        // Generate content using your existing content generator
        const contentResult = await generateContent(
          topProduct,
          niche,
          tone,
          template as any
        );

        if (contentResult && contentResult.content) {
          
          const batchItem = {
            niche,
            product: topProduct,
            template,
            tone,
            script: '',
            caption: contentResult.content,
            hashtags: '',
            postInstructions: `Generated for ${niche} niche using ${template} template with ${tone} tone`,
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
            await webhookService.sendContent(flatPayload);
            console.log(`✅ Sent ${niche} content to Make.com`);
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
            script: '',
            caption: '',
            hashtags: '',
            postInstructions: '',
            error: 'Content generation failed',
            createdAt: new Date().toISOString(),
            source: 'GlowBot-DailyBatch'
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
          script: '',
          caption: '',
          hashtags: '',
          postInstructions: '',
          error: nicheError.message,
          createdAt: new Date().toISOString(),
          source: 'GlowBot-DailyBatch'
        };
        results.push(errorItem);
      }

      // Small delay between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
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