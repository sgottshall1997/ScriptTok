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
    promptTemplate = `Write about ${productName} for the ${niche} niche in a ${tone} style. 
This should be in the format of a ${templateType.replace(/_/g, ' ')}. 
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
  if (trendingProducts?.length > 0) {
    const relevantProducts = trendingProducts
      .filter(p => p.title !== productName)
      .slice(0, 3);
      
    if (relevantProducts.length > 0) {
      trendContext = `\n\nFor context, these are some trending products in this space:\n` +
        relevantProducts.map(p => `- ${p.title} (${p.source})`).join('\n');
    }
  }
  
  // Replace placeholders in the template
  const filledPrompt = promptTemplate
    .replace(/{product}/g, productName)
    .replace(/{tone}/g, toneDescription)
    .replace(/{trendContext}/g, trendContext);
  
  // Add optimization notes based on successful patterns
  const finalPrompt = filledPrompt + optimizationNote;
  
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