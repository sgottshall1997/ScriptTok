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
    
    // Generate 3 variations with slightly different approaches
    const variations: string[] = [];
    const feedbackIds: number[] = [];
    
    // Variation 1: Standard generation
    console.log(`📝 Generating variation 1 (standard)...`);
    const variant1 = await generateContent(product, templateType, tone, niche, trendingProducts);
    variations.push(variant1.content);
    const feedbackId1 = await feedbackLogger.logContentGeneration(product, templateType, tone, variant1.content);
    feedbackIds.push(feedbackId1);
    
    // Variation 2: More engaging/viral focused
    console.log(`📝 Generating variation 2 (viral-focused)...`);
    const toneVariations = ['exciting', 'inspiring', 'conversational'] as ToneOption[];
    const altTone = toneVariations.includes(tone) ? tone : 'exciting';
    const variant2 = await generateContent(product, templateType, altTone, niche, trendingProducts);
    variations.push(variant2.content);
    const feedbackId2 = await feedbackLogger.logContentGeneration(product, templateType, altTone, variant2.content);
    feedbackIds.push(feedbackId2);
    
    // Variation 3: Trend-focused if we have trending data
    console.log(`📝 Generating variation 3 (trend-focused)...`);
    const variant3 = await generateContent(product, templateType, tone, niche, trendingProducts);
    variations.push(variant3.content);
    const feedbackId3 = await feedbackLogger.logContentGeneration(product, templateType, tone, variant3.content);
    feedbackIds.push(feedbackId3);
    
    // Get GPT's critique and viral prediction
    console.log(`🤖 Getting GPT critique on ${variations.length} variations...`);
    const critique = await getCritiqueFromGPT(variations, niche, product, templateType);
    
    // Update the chosen variation with GPT's pick
    const chosenIndex = critique.chosenVariant - 1; // Convert to 0-based index
    if (chosenIndex >= 0 && chosenIndex < feedbackIds.length) {
      await feedbackLogger.updateFeedback(feedbackIds[chosenIndex], { 
        gptPick: critique.chosenVariant 
      });
      console.log(`✅ GPT chose variation ${critique.chosenVariant} - updated feedback log`);
    }
    
    // Build response with all variations and GPT analysis
    const variantResults: ContentVariant[] = variations.map((content, index) => ({
      id: index + 1,
      content,
      gptPick: index === chosenIndex,
      feedbackId: feedbackIds[index]
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
    
    // Fallback: generate single variant
    const fallbackVariant = await generateContent(product, templateType, tone, niche, trendingProducts);
    const fallbackFeedbackId = await feedbackLogger.logContentGeneration(product, templateType, tone, fallbackVariant.content);
    
    return {
      variants: [{
        id: 1,
        content: fallbackVariant.content,
        gptPick: true,
        feedbackId: fallbackFeedbackId
      }],
      gptChoice: 1,
      gptConfidence: 0,
      gptReasoning: 'Multi-variant generation failed, single variant returned',
      totalGenerated: 1
    };
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