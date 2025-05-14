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
import { getToneDescription } from './tones';

export interface PromptParams {
  niche: string;
  productName: string;
  templateType: TemplateType;
  tone: ToneOption;
  trendingProducts?: TrendingProduct[];
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
  
  // Fall back to default if the niche or template doesn't have a specific prompt
  const promptTemplate = nicheTemplates[templateType] || templates.default?.[templateType] || 
    `Write about ${productName} in a ${tone} style.`;
  
  // Get the tone description
  const toneDescription = getToneDescription(tone);
  
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
  
  return filledPrompt;
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

// Export factory functions for each template type
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
export const generateInfluencerCaptionPrompt = createPromptFactory('influencer_caption');