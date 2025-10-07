/**
 * Enhanced Modular Prompt System
 * This is the main entry point for the modular prompt system that handles
 * different niches, templates, and tones.
 */

import { TemplateType, ToneOption } from '@shared/constants';
import { TrendingProduct } from '@shared/schema';
import { 
  TEMPLATE_PROMPTS,
  type PromptConfig,
  type GeneratedPrompt 
} from '../services/promptFactory.js';
import { getToneInstructions, getToneDescription } from './tones';
import { getTopRatedContentForStyle } from '../services/ratingSystem';

export interface BestRatedStyle {
  toneSummary: string; // e.g., "bold, punchy, sarcastic"
  structureHint: string; // e.g., "Hook → 3 Benefits → Call to Action"
  topHashtags: string[]; // array of 3–5 relevant hashtags
  highRatedCaptionExample?: string; // actual caption content to learn from, optional
}

export interface PromptParams {
  niche: string;
  productName: string;
  templateType: TemplateType;
  tone: ToneOption;
  trendingProducts?: TrendingProduct[];
  fallbackLevel?: 'exact' | 'default' | 'generic'; // Tracks which template fallback level was used
  successfulPatterns?: { // Most successful patterns from user feedback
    mostUsedTone: string | null;
    mostUsedTemplateType: string | null;
  };
  topRatedStyleUsed?: boolean; // Whether to use smart style learning
  bestRatedStyle?: BestRatedStyle; // Dynamic learning data from top-rated outputs
  platform?: string; // Platform for smart style filtering
  useSmartStyle?: boolean; // Whether to enable smart style learning
}

/**
 * Enhanced prompt factory function with dynamic learning support
 * This function creates prompts that can learn from top-rated past outputs
 */
export async function promptFactory(params: {
  productName: string;
  tone: ToneOption;
  template: TemplateType;
  platform?: string;
  niche: string;
  topRatedStyleUsed?: boolean;
  userId?: number;
  bestRatedStyle?: BestRatedStyle;
  trendingProducts?: TrendingProduct[];
}): Promise<string> {
  const { productName, tone, template, platform, niche, topRatedStyleUsed, userId, bestRatedStyle, trendingProducts = [] } = params;

  // If topRatedStyleUsed is enabled and no bestRatedStyle provided, fetch it
  let smartStyleData = bestRatedStyle;
  if (topRatedStyleUsed && !smartStyleData && userId) {
    try {
      smartStyleData = await getTopRatedContentForStyle(userId, niche, platform, tone, template);
      console.log('🎯 Smart style data fetched:', smartStyleData ? 'Found patterns from high-rated content' : 'No high-rated content available');
    } catch (error) {
      console.error('Error fetching smart style data:', error);
    }
  }

  // Log smart style usage for analytics
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: userId || 1,
    niche,
    templateType: template,
    tone,
    platform: platform || 'general',
    useSmartStyle: topRatedStyleUsed || false,
    hasSmartStyleData: !!smartStyleData,
    toneSummary: smartStyleData?.toneSummary || null,
    structureHint: smartStyleData?.structureHint || null,
    topHashtagsCount: smartStyleData?.topHashtags?.length || 0
  };
  console.log('📊 PromptFactory Smart Style Log:', JSON.stringify(logEntry, null, 2));

  // Use standard generatePrompt with enhanced parameters
  const promptParams: PromptParams = {
    niche,
    productName,
    templateType: template,
    tone,
    trendingProducts,
    useSmartStyle: topRatedStyleUsed,
    bestRatedStyle: smartStyleData,
    platform
  };

  return generatePrompt(promptParams);
}

/**
 * Generate a prompt using the new TEMPLATE_PROMPTS structure
 */
export async function generatePrompt(params: PromptParams): Promise<string> {
  const { niche, productName, templateType, tone, trendingProducts = [] } = params;
  
  // Create prompt config for new system
  const promptConfig: PromptConfig = {
    productName,
    niche: niche as any,
    templateType: templateType as any,
    tone: tone as any,
    trendingProducts,
    contentFormat: 'standard'
  };

  // Get the appropriate template function from TEMPLATE_PROMPTS
  const templateFunction = TEMPLATE_PROMPTS[templateType as keyof typeof TEMPLATE_PROMPTS];
  
  let finalPrompt: string;
  let fallbackLevel: 'exact' | 'default' | 'generic' = 'exact';
  
  if (templateFunction) {
    console.log(`✅ Using TEMPLATE_PROMPTS for ${templateType} template`);
    const templateResult = templateFunction(promptConfig);
    finalPrompt = templateResult.userPrompt;
    fallbackLevel = 'exact';
  } else {
    console.warn(`⚠️ Template ${templateType} not found in TEMPLATE_PROMPTS, using fallback`);
    const toneDescription = await getToneDescription(tone);
    finalPrompt = `Write about ${productName} in the ${niche} niche using a ${toneDescription} tone. This should be in the format of a ${templateType}.`;
    fallbackLevel = 'generic';
  }

  // Store the fallback level for later use in the response
  params.fallbackLevel = fallbackLevel;
  
  // 🎯 Apply successful patterns optimization
  let optimizationNote = '';
  
  if (params.successfulPatterns?.mostUsedTone && params.successfulPatterns.mostUsedTone !== tone) {
    optimizationNote += `\n\nIMPORTANT: Based on user feedback analytics, the "${params.successfulPatterns.mostUsedTone}" tone has been most successful for user engagement. Consider incorporating elements of this successful tone while maintaining the requested "${tone}" style.`;
  }
  
  if (params.successfulPatterns?.mostUsedTemplateType && params.successfulPatterns.mostUsedTemplateType !== templateType) {
    optimizationNote += `\n\nSUCCESS PATTERN: The "${params.successfulPatterns.mostUsedTemplateType}" template type has shown high user engagement. Where appropriate, incorporate successful elements from this format.`;
  }
  
  // Inject smart style recommendations if available
  let smartStyleInstructions = '';
  if (params.useSmartStyle && params.bestRatedStyle) {
    const style = params.bestRatedStyle;
    smartStyleInstructions = `\n\n🎯 SMART STYLE LEARNING (Based on your highest-rated content):
- Use a tone similar to: ${style.toneSummary}
- Follow this proven structure: ${style.structureHint}
- Include these successful hashtags: ${style.topHashtags.join(', ')}`;
    
    if (style.highRatedCaptionExample) {
      smartStyleInstructions += `\n- Reference this high-performing example style: "${style.highRatedCaptionExample}"`;
    }
    
    smartStyleInstructions += '\n\nMimic the patterns from your best-rated content while creating fresh, engaging content for this new product.';
  }

  // Add platform-specific caption instructions if platform is specified
  let platformInstructions = '';
  if (params.platform && params.platform !== 'general') {
    const platformGuidelines = {
      'TikTok': {
        style: 'Hook-driven, uses slang, emojis, and short punchy sentences. Encourages trends, humor, or urgency.',
        audience: 'Gen Z audience that responds to viral trends, authenticity, and quick entertainment',
        example: '✨ TikTok made me buy it — again. #acnehack'
      },
      'Instagram': {
        style: 'Aesthetic, lifestyle-driven language focusing on visuals and routines. Clean CTA with light emoji use.',
        audience: 'Lifestyle enthusiasts who value aesthetics and personal branding',
        example: 'Your new skincare shelf essential. ✨ #skincaregoals'
      },
      'YouTube Shorts': {
        style: 'Slightly longer, informative tone that sounds like a voiceover or quick script snippet.',
        audience: 'Viewers seeking educational content and detailed product information',
        example: 'This patch pulls the gunk out *overnight*. Let me show you why it\'s viral.'
      },
      'X (Twitter)': {
        style: 'Short, punchy, clever. Lean into hot takes, jokes, or bold claims with minimal hashtags.',
        audience: 'Quick-witted audience that appreciates humor, hot takes, and concise insights',
        example: 'Amazon has no business selling skincare this good for $11.'
      }
    };

    const platformData = platformGuidelines[params.platform as keyof typeof platformGuidelines];
    if (platformData) {
      platformInstructions = `\n\n📱 PLATFORM-SPECIFIC INSTRUCTIONS FOR ${params.platform.toUpperCase()}:
- Target Audience: ${platformData.audience}
- Caption Style: ${platformData.style}
- Example Pattern: "${platformData.example}"
- CRITICAL: Write content that feels native to ${params.platform}, NOT adapted from other platforms
- Make this caption 70%+ different from what you'd write for other platforms
- Focus on ${params.platform}-specific engagement tactics and user behavior patterns`;
    }
  }
  
  // Add all enhancements to the final prompt
  return finalPrompt + optimizationNote + smartStyleInstructions + platformInstructions;
}

// Legacy functions removed - these were dependent on the old templates.ts system
// Template metadata and niche info is now handled by the new TEMPLATE_PROMPTS system

/**
 * Factory function to create a prompt for a specific template type
 */
export function createPromptFactory(templateType: TemplateType) {
  return async (niche: string, productName: string, tone: ToneOption, trendingProducts?: TrendingProduct[]) => {
    return generatePrompt({
      niche,
      productName,
      templateType,
      tone,
      trendingProducts
    });
  };
}

// Export factory functions for universal template types
export const generateSEOBlogPrompt = createPromptFactory('seo_blog');
export const generateShortVideoPrompt = createPromptFactory('short_video');
export const generateInfluencerCaptionPrompt = createPromptFactory('influencer_caption');
export const generateProductComparisonPrompt = createPromptFactory('product_comparison');
export const generateComparisonPrompt = generateProductComparisonPrompt; // Legacy alias - no duplicate function
export const generateRoutineKitPrompt = createPromptFactory('routine_kit');
export const generateBulletPointsPrompt = createPromptFactory('short_video');
export const generateTrendingExplainerPrompt = createPromptFactory('seo_blog');
export const generateBuyerPersonaPrompt = createPromptFactory('product_comparison');
export const generateAffiliateEmailPrompt = createPromptFactory('affiliate_email');

// Export factory functions for skincare-specific templates (mapped to valid template types)
export const generateSkincareRoutinePrompt = createPromptFactory('routine_kit');
export const generateDermApprovedPrompt = createPromptFactory('influencer_caption');
export const generateTransformationPrompt = createPromptFactory('short_video');
export const generateSkinTypeListPrompt = createPromptFactory('viral_listicle');
export const generateDupeAlertPrompt = createPromptFactory('product_comparison');

// Export factory functions for tech-specific templates (mapped to valid template types)
export const generateUnboxingPrompt = createPromptFactory('short_video');
export const generateTopUseCasesPrompt = createPromptFactory('viral_listicle');
export const generateWorthItPrompt = createPromptFactory('product_comparison');
export const generateSetupGuidePrompt = createPromptFactory('routine_kit');
export const generateHiddenFeaturesPrompt = createPromptFactory('viral_listicle');

// Legacy template factories (for backward compatibility) - mapped to valid template types
export const generateReviewPrompt = createPromptFactory('product_comparison');
export const generateCaptionPrompt = createPromptFactory('influencer_caption');
export const generateProsConsPrompt = createPromptFactory('product_comparison');
export const generateRoutinePrompt = createPromptFactory('routine_kit');
export const generateBeginnerKitPrompt = createPromptFactory('routine_kit');
export const generateDemoScriptPrompt = createPromptFactory('short_video');
export const generateDrugstoreDupePrompt = createPromptFactory('product_comparison');
export const generatePersonalReviewPrompt = createPromptFactory('product_comparison');
export const generateSurpriseMePrompt = createPromptFactory('short_video');
export const generateTikTokBreakdownPrompt = createPromptFactory('short_video');
export const generateDrySkinListPrompt = createPromptFactory('short_video');
export const generateTop5Under25Prompt = createPromptFactory('product_comparison');

// Additional legacy mappings for compatibility
export const generateOriginalPrompt = createPromptFactory('short_video');
export const generateVideoScriptPrompt = createPromptFactory('short_video');
export const generateSocialPostPrompt = createPromptFactory('influencer_caption');
export const generateBlogPostPrompt = createPromptFactory('seo_blog');