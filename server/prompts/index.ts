/**
 * Enhanced Modular Prompt System
 * This is the main entry point for the modular prompt system that handles
 * different niches, templates, and tones.
 */

import { TemplateType, ToneOption } from '@shared/constants';
import { TrendingProduct } from '@shared/schema';
import { 
  loadPromptTemplates, 
  loadTemplateMetadata, 
  loadNicheInfo,
  getTemplateMetadata,
  TemplateMetadata,
  NicheInfo
} from './templates';
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
    useSmartStyle: useSmartStyle || false,
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
    useSmartStyle,
    bestRatedStyle: smartStyleData,
    platform
  };

  return generatePrompt(promptParams);
}

/**
 * Generate a prompt for a specific niche, template, and tone
 */
export async function generatePrompt(params: PromptParams): Promise<string> {
  const { niche, productName, templateType, tone, trendingProducts = [] } = params;
  
  // Load prompt templates (uses cache after first load)
  const templates = await loadPromptTemplates();
  
  // Get the prompt template for this niche/template combination
  // First check if there's a specific template for this niche
  const nicheTemplates = templates[niche] || {};
  
  // Implement enhanced fallback logic with clear error handling
  let promptTemplate: string | null = null;
  let fallbackLevel: 'exact' | 'default' | 'generic' = 'exact'; // Track which level of fallback is used
  
  // Step 1: Try to get the specific niche+template combination
  if (nicheTemplates && templateType in nicheTemplates) {
    promptTemplate = nicheTemplates[templateType] || null;
    fallbackLevel = 'exact';
  }
  
  // Step 2: If not found, fall back to the default template for this template type
  if (!promptTemplate && templates.default && templateType in templates.default) {
    fallbackLevel = 'default';
    console.warn(`[PromptFactory] Fallback used → niche=${niche}, type=${templateType}, fallbackLevel=${fallbackLevel}`);
    promptTemplate = templates.default[templateType] || null;
  }
  
  // Step 3: If still not found, use a generic fallback with a warning
  if (!promptTemplate) {
    fallbackLevel = 'generic';
    console.warn(`[PromptFactory] Fallback used → niche=${niche}, type=${templateType}, fallbackLevel=${fallbackLevel}`);
    // Instead of silently using a generic fallback, provide a more detailed prompt
    const templateTypeFormatted = templateType ? templateType.replace(/_/g, ' ') : 'content piece';
    promptTemplate = `Write about ${productName} for the ${niche} niche in a ${tone} style. 
This should be in the format of a ${templateTypeFormatted}. 
Note: A specific template for this combination wasn't found, so this is using a generic fallback.`;
  }
  
  // Store the fallback level for later use in the response
  params.fallbackLevel = fallbackLevel;
  
  // 🎯 Apply successful patterns optimization
  let optimizedTone = tone;
  let optimizationNote = '';
  
  if (params.successfulPatterns?.mostUsedTone && params.successfulPatterns.mostUsedTone !== tone) {
    optimizationNote += `\n\nIMPORTANT: Based on user feedback analytics, the "${params.successfulPatterns.mostUsedTone}" tone has been most successful for user engagement. Consider incorporating elements of this successful tone while maintaining the requested "${tone}" style.`;
  }
  
  if (params.successfulPatterns?.mostUsedTemplateType && params.successfulPatterns.mostUsedTemplateType !== templateType) {
    optimizationNote += `\n\nSUCCESS PATTERN: The "${params.successfulPatterns.mostUsedTemplateType}" template type has shown high user engagement. Where appropriate, incorporate successful elements from this format.`;
  }

  // Get the tone description - now async
  const toneDescription = await getToneDescription(optimizedTone);
  
  // Build context about trending products
  let trendContext = '';
  if (trendingProducts && Array.isArray(trendingProducts) && trendingProducts.length > 0) {
    const relevantProducts = trendingProducts
      .filter(p => p && p.title && p.title !== productName)
      .slice(0, 3);
      
    if (relevantProducts.length > 0) {
      trendContext = `\n\nFor context, these are some trending products in this space:\n` +
        relevantProducts.map(p => `- ${p.title} (${p.source})`).join('\n');
    }
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

  // Replace placeholders in the template
  const filledPrompt = promptTemplate
    .replace(/{product}/g, productName)
    .replace(/{tone}/g, toneDescription)
    .replace(/{trendContext}/g, trendContext);
  
  // Add optimization notes based on successful patterns
  const finalPrompt = filledPrompt + optimizationNote + smartStyleInstructions + platformInstructions;
  
  return finalPrompt;
}

/**
 * Get metadata for a specific template type and niche
 * Used for UI display, template previews, etc.
 */
export async function getTemplateInfo(niche: string, templateType: TemplateType): Promise<TemplateMetadata | undefined> {
  return getTemplateMetadata(niche, templateType);
}

/**
 * Get information about a specific niche
 * Used for UI display, niche selection, etc.
 */
export async function getNicheInfo(niche: string): Promise<NicheInfo | undefined> {
  const nicheInfoMap = await loadNicheInfo();
  return nicheInfoMap[niche];
}

/**
 * Get all available template metadata for a specific niche
 * Used for template selection UI
 */
export async function getAllTemplatesForNiche(niche: string): Promise<Record<string, TemplateMetadata>> {
  const metadataMap = await loadTemplateMetadata();
  const defaultMetadata = metadataMap['default'] || {};
  const nicheMetadata = metadataMap[niche] || {};
  
  // Combine default and niche-specific templates, with niche-specific overriding defaults
  return { ...defaultMetadata, ...nicheMetadata } as Record<string, TemplateMetadata>;
}

/**
 * Get all available niche info
 * Used for niche selection UI
 */
export async function getAllNicheInfo(): Promise<Record<string, NicheInfo>> {
  return loadNicheInfo();
}

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
export const generateRoutineKitPrompt = createPromptFactory('routine_kit');
export const generateBulletPointsPrompt = createPromptFactory('bullet_points');
export const generateTrendingExplainerPrompt = createPromptFactory('trending_explainer');
export const generateBuyerPersonaPrompt = createPromptFactory('buyer_persona');
export const generateAffiliateEmailPrompt = createPromptFactory('affiliate_email');

// Export factory functions for skincare-specific templates
export const generateSkincareRoutinePrompt = createPromptFactory('skincare_routine');
export const generateDermApprovedPrompt = createPromptFactory('derm_approved');
export const generateTransformationPrompt = createPromptFactory('transformation');
export const generateSkinTypeListPrompt = createPromptFactory('skin_type_list');
export const generateDupeAlertPrompt = createPromptFactory('dupe_alert');

// Export factory functions for tech-specific templates
export const generateUnboxingPrompt = createPromptFactory('unboxing');
export const generateTopUseCasesPrompt = createPromptFactory('top_use_cases');
export const generateWorthItPrompt = createPromptFactory('worth_it');
export const generateSetupGuidePrompt = createPromptFactory('setup_guide');
export const generateHiddenFeaturesPrompt = createPromptFactory('hidden_features');

// Legacy template factories (for backward compatibility)
export const generateReviewPrompt = createPromptFactory('original');
export const generateComparisonPrompt = createPromptFactory('comparison');
export const generateCaptionPrompt = createPromptFactory('caption');
export const generateProsConsPrompt = createPromptFactory('pros_cons');
export const generateRoutinePrompt = createPromptFactory('routine');
export const generateBeginnerKitPrompt = createPromptFactory('beginner_kit');
export const generateDemoScriptPrompt = createPromptFactory('demo_script');
export const generateDrugstoreDupePrompt = createPromptFactory('drugstore_dupe');
export const generatePersonalReviewPrompt = createPromptFactory('personal_review');
export const generateSurpriseMePrompt = createPromptFactory('surprise_me');
export const generateTikTokBreakdownPrompt = createPromptFactory('tiktok_breakdown');
export const generateDrySkinListPrompt = createPromptFactory('dry_skin_list');
export const generateTop5Under25Prompt = createPromptFactory('top5_under25');