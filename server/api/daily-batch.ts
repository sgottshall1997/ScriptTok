import type { Request, Response } from "express";

// Generate dynamic captions based on niche and product
function generateDynamicCaption(niche: string, product: string, template: string): string {
  const captions = {
    skincare: [
      `Transform your skin with ${product}! ✨ Your glow-up starts here 🌟`,
      `This ${product} is about to change your skincare game! 💆‍♀️`,
      `POV: You found the holy grail of skincare - ${product} 🧴✨`
    ],
    tech: [
      `This ${product} is a total game-changer! 📱 Tech lovers, you need this 🔥`,
      `Why didn't I discover ${product} sooner?! 💻⚡`,
      `Tech tip: ${product} will upgrade your entire setup! 🚀`
    ],
    fashion: [
      `Found my new style obsession: ${product}! 👗 Fashion girlies unite! ✨`,
      `This ${product} just elevated my entire wardrobe! 💅`,
      `When ${product} hits different... style level: UNLOCKED! 🔥`
    ],
    fitness: [
      `${product} is about to transform your fitness journey! 💪 Let's get it! 🏋️‍♀️`,
      `This ${product} hits different! Fitness motivation activated 🔥`,
      `POV: ${product} just became your new workout bestie! 💯`
    ],
    food: [
      `This ${product} recipe is pure magic! 🍳 Foodies, save this! ✨`,
      `When ${product} tastes this good, you know it's a winner! 😋`,
      `${product} just made my kitchen dreams come true! 👨‍🍳🔥`
    ],
    travel: [
      `${product} just made traveling 10x easier! ✈️ Wanderlust activated! 🌍`,
      `Travel hack: ${product} is a total game-changer! 🎒`,
      `This ${product} tip will change how you travel forever! 🗺️✨`
    ],
    pet: [
      `My pet is obsessed with ${product}! 🐕 Pet parents, you need this! 💕`,
      `This ${product} made my furry friend so happy! 🐱✨`,
      `Pet hack: ${product} is the secret to happy pets! 🐾`
    ]
  };

  const nicheOptions = captions[niche as keyof typeof captions] || captions.skincare;
  const randomCaption = nicheOptions[Math.floor(Math.random() * nicheOptions.length)];
  return randomCaption;
}

export async function generateDailyBatch(req: Request, res: Response) {
  try {
    console.log('🎯 Starting intelligent daily batch content generation...');
    console.log('🎪 Focusing on high-conversion products and proven templates');

    const niches = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];
    const templates = ['viral_hook', 'influencer_caption', 'trending_explainer'];
    const tones = ['friendly', 'enthusiastic', 'informative'];
    
    const results: any[] = [];
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < niches.length; i++) {
      const niche = niches[i];
      const template = templates[i % templates.length];
      const tone = tones[i % tones.length];
      
      try {
        console.log(`📝 Generating content for ${niche} niche with ${template} template...`);
        
        // Get trending products for this niche
        const trendingResponse = await fetch('http://localhost:5000/api/trending');
        const trendingData = await trendingResponse.json();
        const nicheProducts = trendingData?.data?.[niche] || [];
        
        // Select the top product with highest mentions
        const selectedProduct = nicheProducts.length > 0 ? 
          nicheProducts.reduce((max: any, current: any) => 
            (current.mentions || 0) > (max.mentions || 0) ? current : max
          ) : null;
        
        const topProduct = selectedProduct?.title || `Trending ${niche.charAt(0).toUpperCase() + niche.slice(1)} Product`;
        const mentions = selectedProduct?.mentions || 0;
        
        console.log(`💎 Selected: "${topProduct}" (${mentions.toLocaleString()} mentions)`);
        
        // Generate video content
        const platforms = ['TikTok', 'Instagram', 'YouTube Shorts'];
        const randomPlatform = platforms[i % platforms.length];
        
        // Use the working content generation service
        const { generateContent } = await import('../services/contentGenerator');
        const contentResult = await generateContent(
          topProduct,
          niche,
          tone,
          template as any
        );

        if (contentResult && contentResult.content) {
          successCount++;
          console.log(`✅ Generated ${niche} video content successfully (${successCount}/${niches.length})`);
          
          // Create the batch item from successful content generation
          const batchItem = {
            niche,
            product: topProduct,
            template,
            tone,
            mentions: mentions,
            platform: randomPlatform,
            script: contentResult.content,
            caption: generateDynamicCaption(niche, topProduct, template),
            hashtags: ['#GlowWithMe', `#${niche}Goals`, '#TrendingNow'].join(' '),
            postInstructions: `Video script for ${niche} niche - Post during peak hours`,
            createdAt: new Date().toISOString(),
            source: 'GlowBot-VideoAutomation'
          };

          results.push(batchItem);

          // Send to Make.com webhook
          try {
            const enhancedPayload = {
              platform: randomPlatform,
              postType: 'video',
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
              contentCategory: 'video',
              mediaType: 'video_script',
              automationReady: true,
              batchId: `daily-${new Date().toISOString().split('T')[0]}`,
              mentions: batchItem.mentions
            };

            const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
            if (makeWebhookUrl) {
              const axios = await import('axios');
              await axios.default.post(makeWebhookUrl, enhancedPayload);
              console.log(`✅ Sent ${niche} video content to Make.com`);
            }
          } catch (webhookError) {
            console.log(`⚠️ Webhook failed for ${niche}:`, webhookError);
          }

        } else {
          console.log(`❌ Content generation failed for ${niche}`);
          errors.push(`${niche}: Content generation failed`);
        }

        // Add 2-second delay between generations
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (nicheError: any) {
        console.error(`❌ Error generating ${niche} content:`, nicheError);
        errors.push(`${niche}: ${nicheError.message}`);
      }
    }

    console.log(`🎉 Daily batch complete! Generated ${successCount} out of ${niches.length} pieces of content`);

    res.json({
      success: true,
      message: `Batch Complete!\nGenerated ${successCount}/${niches.length} pieces\nSent to Make.com for scheduling`,
      results: results,
      errors: errors,
      successCount: successCount,
      totalAttempted: niches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Daily batch generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Daily batch generation failed',
      details: error.message
    });
  }
}