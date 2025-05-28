import { generateContent } from './contentGenerator';
import { getCritiqueFromGPT } from './gptCritic';
import feedbackLogger from '../database/feedbackLogger';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption, Niche } from '@shared/constants';

interface ContentVariant {
  id: number;
  content: string;
  gptPick?: boolean;
  feedbackId: number;
}

interface MultiVariantResult {
  variants: ContentVariant[];
  gptChoice: number;
  gptConfidence: number;
  gptReasoning: string;
  totalGenerated: number;
}

/**
 * Generate 2-3 content variations and get GPT's viral prediction
 * Logs all variations to feedback database with GPT's pick
 */
export async function generateMultipleVariationsWithCritique(
  product: string,
  templateType: TemplateType,
  tone: ToneOption,
  niche: Niche,
  trendingProducts?: TrendingProduct[]
): Promise<MultiVariantResult> {
  try {
    console.log(`🎯 Generating multiple variations for viral analysis...`);
    
    // Validate inputs
    if (!product || product.trim().length === 0) {
      throw new Error('Product name is required');
    }
    
    // Generate 3 variations with enhanced error handling
    const variations: string[] = [];
    const feedbackIds: number[] = [];
    
    // Variation 1: Standard generation with error handling
    console.log(`📝 Generating variation 1 (standard)...`);
    try {
      const variant1 = await generateContent(product, templateType, tone, trendingProducts, niche);
      if (variant1?.content && variant1.content.trim().length > 0) {
        variations.push(variant1.content);
        const feedbackId1 = await feedbackLogger.logContentGeneration(product, templateType, tone, variant1.content);
        feedbackIds.push(feedbackId1);
      } else {
        console.warn('Variation 1 returned empty content');
        const fallbackContent = `Create engaging ${templateType} content for ${product} using a ${tone} tone in the ${niche} niche.`;
        variations.push(fallbackContent);
        const feedbackId1 = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackContent);
        feedbackIds.push(feedbackId1);
      }
    } catch (error) {
      console.error('Error generating variation 1:', error);
      const fallbackContent = `Create engaging ${templateType} content for ${product} using a ${tone} tone in the ${niche} niche.`;
      variations.push(fallbackContent);
      const feedbackId1 = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackContent);
      feedbackIds.push(feedbackId1);
    }
    
    // Variation 2: More engaging/viral focused with error handling
    console.log(`📝 Generating variation 2 (viral-focused)...`);
    try {
      const toneVariations = ['enthusiastic', 'friendly', 'conversational'] as ToneOption[];
      const altTone = toneVariations.includes(tone) ? tone : 'enthusiastic';
      const variant2 = await generateContent(product, templateType, altTone, trendingProducts, niche);
      if (variant2?.content && variant2.content.trim().length > 0) {
        variations.push(variant2.content);
        const feedbackId2 = await feedbackLogger.logContentGeneration(product, templateType, altTone, variant2.content);
        feedbackIds.push(feedbackId2);
      } else {
        console.warn('Variation 2 returned empty content');
        const fallbackContent = `Create viral ${templateType} content for ${product} with ${altTone} tone in the ${niche} niche.`;
        variations.push(fallbackContent);
        const feedbackId2 = await feedbackLogger.logContentGeneration(product, templateType, altTone, fallbackContent);
        feedbackIds.push(feedbackId2);
      }
    } catch (error) {
      console.error('Error generating variation 2:', error);
      const fallbackContent = `Create viral ${templateType} content for ${product} with enthusiastic tone in the ${niche} niche.`;
      variations.push(fallbackContent);
      const feedbackId2 = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackContent);
      feedbackIds.push(feedbackId2);
    }
    
    // Variation 3: Trend-focused with error handling
    console.log(`📝 Generating variation 3 (trend-focused)...`);
    try {
      const variant3 = await generateContent(product, templateType, tone, trendingProducts, niche);
      if (variant3?.content && variant3.content.trim().length > 0) {
        variations.push(variant3.content);
        const feedbackId3 = await feedbackLogger.logContentGeneration(product, templateType, tone, variant3.content);
        feedbackIds.push(feedbackId3);
      } else {
        console.warn('Variation 3 returned empty content');
        const fallbackContent = `Create trend-aware ${templateType} content for ${product} with ${tone} tone in the ${niche} niche.`;
        variations.push(fallbackContent);
        const feedbackId3 = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackContent);
        feedbackIds.push(feedbackId3);
      }
    } catch (error) {
      console.error('Error generating variation 3:', error);
      const fallbackContent = `Create trending ${templateType} content for ${product} with ${tone} tone in the ${niche} niche.`;
      variations.push(fallbackContent);
      const feedbackId3 = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackContent);
      feedbackIds.push(feedbackId3);
    }
    
    // Ensure we have at least one variation
    if (variations.length === 0) {
      throw new Error('Failed to generate any content variations');
    }
    
    // Get GPT's critique and viral prediction with error handling
    console.log(`🤖 Getting GPT critique on ${variations.length} variations...`);
    let critique;
    try {
      critique = await getCritiqueFromGPT(variations, niche, product, templateType);
    } catch (error) {
      console.error('Error getting GPT critique:', error);
      // Provide default critique if GPT critique fails
      critique = {
        chosenVariant: 1,
        confidence: 50,
        reasoning: 'GPT critique unavailable, defaulting to first variation'
      };
    }
    
    // Update the chosen variation with GPT's pick
    const chosenIndex = Math.max(0, Math.min(critique.chosenVariant - 1, variations.length - 1));
    if (chosenIndex >= 0 && chosenIndex < feedbackIds.length) {
      try {
        await feedbackLogger.updateFeedback(feedbackIds[chosenIndex], { 
          gptPick: critique.chosenVariant 
        });
        console.log(`✅ GPT chose variation ${critique.chosenVariant} - updated feedback log`);
      } catch (error) {
        console.error('Error updating feedback log:', error);
      }
    }
    
    // Build response with all variations and GPT analysis
    const variantResults: ContentVariant[] = variations.map((content, index) => ({
      id: index + 1,
      content: content || `Default content for ${product}`,
      gptPick: index === chosenIndex,
      feedbackId: feedbackIds[index] || 0
    }));
    
    console.log(`🎯 Multi-variant generation complete!`);
    console.log(`📊 GPT Analysis: Choice ${critique.chosenVariant}, Confidence: ${critique.confidence}%`);
    console.log(`💡 Reasoning: ${critique.reasoning}`);
    
    return {
      variants: variantResults,
      gptChoice: critique.chosenVariant,
      gptConfidence: critique.confidence,
      gptReasoning: critique.reasoning,
      totalGenerated: variations.length
    };
    
  } catch (error) {
    console.error('❌ Multi-variant generation failed:', error);
    
    // Enhanced fallback: generate simple content variations
    try {
      const fallbackVariant = await generateContent(product, templateType, tone, trendingProducts, niche);
      let fallbackContent = fallbackVariant?.content || '';
      
      if (!fallbackContent || fallbackContent.trim().length === 0) {
        fallbackContent = `Create engaging ${templateType} content for ${product} with ${tone} tone in the ${niche} niche. This product is perfect for anyone looking to enhance their ${niche} routine.`;
      }
      
      const fallbackFeedbackId = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackContent);
      
      return {
        variants: [{
          id: 1,
          content: fallbackContent,
          gptPick: true,
          feedbackId: fallbackFeedbackId
        }],
        gptChoice: 1,
        gptConfidence: 0,
        gptReasoning: 'Multi-variant generation failed, single variant returned',
        totalGenerated: 1
      };
    } catch (fallbackError) {
      console.error('❌ Fallback generation also failed:', fallbackError);
      
      // Ultimate fallback - return basic content with actual content
      const ultimateFallback = `✨ ${product} Review ✨

This ${product} is an amazing addition to your ${niche} routine! With its ${tone} approach, it delivers exceptional results that you'll love.

Key benefits:
🌟 Perfect for ${niche} enthusiasts
💫 ${tone.charAt(0).toUpperCase() + tone.slice(1)} experience
✨ Trending choice among users

Give it a try and see the difference! #${niche} #${product.replace(/\s+/g, '')}`;
      
      let ultimateFeedbackId = 0;
      
      try {
        ultimateFeedbackId = await feedbackLogger.logContentGeneration(product, templateType, tone, ultimateFallback);
      } catch (logError) {
        console.error('Error logging ultimate fallback:', logError);
      }
      
      return {
        variants: [{
          id: 1,
          content: ultimateFallback,
          gptPick: true,
          feedbackId: ultimateFeedbackId
        }],
        gptChoice: 1,
        gptConfidence: 0,
        gptReasoning: 'All generation methods failed, returning basic template',
        totalGenerated: 1
      };
    }
  }
}

/**
 * Helper function to get GPT vs User choice analytics
 */
export async function getGPTAccuracyStats(): Promise<{
  totalComparisons: number;
  gptAccuracy: number;
  agreements: number;
  disagreements: number;
  recentTrends: string[];
}> {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN (userPick = 1 AND gptPick IS NOT NULL) THEN 1 ELSE 0 END) as comparisons,
        SUM(CASE WHEN (userPick = 1 AND gptPick = id) THEN 1 ELSE 0 END) as agreements,
        productName,
        templateType
      FROM feedback_log 
      WHERE gptPick IS NOT NULL
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    feedbackLogger.db.all(sql, [], (err: any, rows: any[]) => {
      if (err) {
        reject(err);
        return;
      }

      const totalComparisons = rows.filter(row => row.comparisons > 0).length;
      const totalAgreements = rows.reduce((sum, row) => sum + (row.agreements || 0), 0);
      const totalDisagreements = totalComparisons - totalAgreements;
      
      const gptAccuracy = totalComparisons > 0 ? (totalAgreements / totalComparisons) * 100 : 0;

      // Get recent trending products that had GPT analysis
      const recentTrends = rows
        .filter(row => row.productName)
        .slice(0, 5)
        .map(row => row.productName);

      resolve({
        totalComparisons,
        gptAccuracy: Math.round(gptAccuracy * 100) / 100,
        agreements: totalAgreements,
        disagreements: totalDisagreements,
        recentTrends
      });
    });
  });
}