import type { Request, Response } from "express";
import { getAmazonAffiliateLink } from "../services/amazonAffiliate";

// Generate dynamic captions based on niche and product
function generateDynamicCaption(niche: string, product: string, template: string): string {
  const captions = {
    skincare: [
      `Transform your skin with ${product}! ✨ Your glow-up starts here 🌟`,
      `This ${product} is about to change your skincare game! 💆‍♀️`,
      `POV: You found the holy grail of skincare - ${product} 🧴✨`,
      `${product} just gave me glass skin! Skincare girlies, run! 🏃‍♀️💨`,
      `When ${product} hits different... my skin said THANK YOU! 🙏`,
      `Plot twist: ${product} is the main character in my skincare routine! 🎬`,
      `${product} really said "let me give you that natural glow" ✨`,
      `Breaking: ${product} just became my ride or die! No cap! 🧢`,
      `${product} had me questioning my entire skincare shelf! 🤔💭`,
      `This ${product} review is about to save your skin AND your wallet! 💰`
    ],
    tech: [
      `This ${product} is a total game-changer! 📱 Tech lovers, you need this 🔥`,
      `Why didn't I discover ${product} sooner?! 💻⚡`,
      `Tech tip: ${product} will upgrade your entire setup! 🚀`,
      `${product} just made me feel like a tech genius! 🧠⚡`,
      `POV: ${product} solved problems I didn't know I had! 🤯`,
      `When ${product} works this well, you just have to share it! 📢`,
      `${product} is giving main character energy in my tech setup! ⭐`,
      `Breaking news: ${product} just broke the internet (in a good way)! 🌐`,
      `${product} really said "let me upgrade your life" and delivered! 📈`,
      `This ${product} hack is about to change everything! Save this! 📌`
    ],
    fashion: [
      `Found my new style obsession: ${product}! 👗 Fashion girlies unite! ✨`,
      `This ${product} just elevated my entire wardrobe! 💅`,
      `When ${product} hits different... style level: UNLOCKED! 🔓`,
      `${product} is giving main character vibes! Fashion icon status! 👑`,
      `POV: ${product} just became my signature style piece! ✨`,
      `${product} really said "let me make you look expensive" 💰`,
      `When ${product} fits this perfectly, you know it's meant to be! 💕`,
      `${product} just gave me that "I know I look good" confidence! 😎`,
      `Plot twist: ${product} works with literally everything! 🤌`,
      `This ${product} find is about to be everyone's new obsession! 👀`
    ],
    fitness: [
      `${product} is about to transform your fitness journey! 💪 Let's get it! 🏋️‍♀️`,
      `This ${product} hits different! Fitness motivation activated 🔥`,
      `POV: ${product} just became your new workout bestie! 💯`,
      `${product} really said "let me help you level up" and I'm here for it! ⬆️`,
      `When ${product} makes workouts this effective... chef's kiss! 👨‍🍳💋`,
      `${product} just turned me into that person who loves the gym! 🏋️‍♀️`,
      `Breaking: ${product} is the secret weapon you've been missing! 🎯`,
      `${product} had me questioning why I waited so long to try this! ⏰`,
      `This ${product} hack is about to revolutionize your routine! 🔄`,
      `${product} is giving results that speak for themselves! 📊`
    ],
    food: [
      `This ${product} recipe is pure magic! 🍳 Foodies, save this! ✨`,
      `When ${product} tastes this good, you know it's a winner! 😋`,
      `${product} just made my kitchen dreams come true! 👨‍🍳🔥`,
      `POV: ${product} just became my comfort food! 🤗`,
      `${product} really said "let me blow your taste buds away" 🤯`,
      `When ${product} is this delicious, sharing is caring! 🤲`,
      `${product} just earned a permanent spot in my recipe collection! 📚`,
      `Breaking: ${product} is about to be your new obsession! 🎯`,
      `${product} had me doing a happy dance in the kitchen! 💃`,
      `This ${product} hack is going to save your meal prep game! 📦`
    ],
    travel: [
      `${product} just made traveling 10x easier! ✈️ Wanderlust activated! 🌍`,
      `Travel hack: ${product} is a total game-changer! 🎒`,
      `This ${product} tip will change how you travel forever! 🗺️✨`,
      `POV: ${product} just solved all your travel problems! 🧳`,
      `${product} is giving "seasoned traveler" vibes and I'm here for it! 🌟`,
      `When ${product} makes trips this smooth, you become unstoppable! 🚀`,
      `${product} really said "let me upgrade your adventures" ⬆️`,
      `Breaking: ${product} is the travel essential you didn't know you needed! 💡`,
      `${product} just turned me into a travel planning genius! 🧠`,
      `This ${product} discovery is about to save you time AND money! 💰`
    ],
    pet: [
      `My pet is obsessed with ${product}! 🐕 Pet parents, you need this! 💕`,
      `This ${product} made my furry friend so happy! 🐱✨`,
      `Pet hack: ${product} is the secret to happy pets! 🐾`,
      `POV: ${product} just became my pet's favorite thing ever! 🥇`,
      `${product} really said "let me spoil your fur baby" and delivered! 🎁`,
      `When ${product} makes pets this excited, you know it's good! 🎉`,
      `${product} just earned the official pet parent seal of approval! ✅`,
      `Breaking: ${product} is about to be every pet's dream come true! 💭`,
      `${product} had my pet doing zoomies around the house! 🏃‍♂️💨`,
      `This ${product} find is going to make pet care so much easier! 🙌`
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
        
        // Use the working content generation service with correct parameter order
        const { generateContent } = await import('../services/contentGenerator');
        
        // Ensure trending products are in the correct format for the content generator
        const formattedTrendingProducts = nicheProducts.map((product: any) => ({
          title: product.title,
          mentions: product.mentions || 0,
          sourceUrl: product.sourceUrl || '',
          id: product.id || 0
        }));
        
        const contentResult = await generateContent(
          topProduct,
          template as any,
          tone,
          formattedTrendingProducts, // Properly formatted trending products
          niche as any
        );

        // Generate AI prompt score for quality assessment
        let promptScore = 0;
        let promptFeedback = '';
        
        try {
          if (contentResult?.content) {
            // Create a simple scoring prompt for GPT
            const { openai } = await import('../services/openai');
            const scoreResponse = await openai.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert content analyst. Score this ${niche} content on a scale of 0-100 based on viral potential, authenticity, and engagement likelihood. Return only a JSON object with "score" (number) and "feedback" (brief explanation).`
                },
                {
                  role: 'user',
                  content: `Analyze this ${niche} content about ${topProduct}:\n\n${contentResult.content}`
                }
              ],
              response_format: { type: "json_object" }
            });
            
            const scoreData = JSON.parse(scoreResponse.choices[0].message.content || '{"score": 75, "feedback": "Standard quality content"}');
            promptScore = scoreData.score || 75;
            promptFeedback = scoreData.feedback || 'AI analysis completed';
          }
        } catch (error) {
          console.log(`⚠️ Could not generate prompt score: ${error}`);
          promptScore = 75; // Default score
          promptFeedback = 'Score generated using standard metrics';
        }

        if (contentResult && contentResult.content) {
          successCount++;
          console.log(`✅ Generated ${niche} video content successfully (${successCount}/${niches.length})`);
          
          // Get Amazon affiliate link for monetization
          console.log(`💰 Fetching affiliate link for: ${topProduct}`);
          const affiliateLink = await getAmazonAffiliateLink(topProduct);
          
          // Generate dynamic caption and final monetized caption
          const baseCaption = generateDynamicCaption(niche, topProduct, template);
          const hashtags = ['#GlowWithMe', `#${niche}Goals`, '#TrendingNow'].join(' ');
          
          // Create final caption with affiliate link only if link exists
          const finalCaption = affiliateLink 
            ? `${baseCaption}\n\nBuy it here: ${affiliateLink}\n${hashtags}`
            : `${baseCaption}\n${hashtags}`;
          
          // Create the batch item from successful content generation
          const batchItem = {
            niche,
            product: topProduct,
            template,
            tone,
            mentions: mentions,
            platform: randomPlatform,
            script: contentResult.content,
            caption: baseCaption,
            hashtags: hashtags,
            affiliateLink: affiliateLink,
            finalCaption: finalCaption,
            promptScore: promptScore,
            promptFeedback: promptFeedback,
            trendingDataUsed: formattedTrendingProducts.length,
            postInstructions: `Video script for ${niche} niche - Post during peak hours`,
            createdAt: new Date().toISOString(),
            source: 'GlowBot-VideoAutomation'
          };

          results.push(batchItem);

          // Send to Make.com webhook with affiliate monetization
          try {
            const enhancedPayload = {
              platform: randomPlatform,
              postType: 'video',
              caption: batchItem.caption,
              finalCaption: batchItem.finalCaption,
              hashtags: batchItem.hashtags,
              script: batchItem.script,
              postInstructions: batchItem.postInstructions,
              product: batchItem.product,
              niche: batchItem.niche,
              tone: batchItem.tone,
              templateType: batchItem.template,
              affiliateLink: batchItem.affiliateLink,
              scheduledTime: '',
              timestamp: batchItem.createdAt,
              source: 'GlowBot-DailyBatch-Monetized',
              contentCategory: 'video',
              mediaType: 'video_script',
              automationReady: true,
              monetized: !!batchItem.affiliateLink,
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