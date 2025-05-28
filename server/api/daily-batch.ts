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
        // Generate content using your existing content generator with proven templates
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