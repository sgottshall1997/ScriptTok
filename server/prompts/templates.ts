/**
 * Prompt Templates Loader
 * Loads and manages prompt templates for different niches and content types
 */
import { promises as fs } from 'fs';
import path from 'path';
import { TemplateType } from '@shared/constants';

// Type definitions for templates
export type PromptTemplate = string;
export type NicheTemplates = Partial<Record<TemplateType, PromptTemplate>>;
export type PromptTemplates = Record<string, NicheTemplates>;

// In-memory cache of loaded templates
let templatesCache: PromptTemplates | null = null;

/**
 * Load all prompt templates from templates directory
 * @returns An object containing all templates organized by niche and type
 */
export async function loadPromptTemplates(): Promise<PromptTemplates> {
  // For development, let's force a reload to test our JSON templates
  console.log('Loading all prompt templates...');
  
  const templates: PromptTemplates = {
    default: await loadDefaultTemplates(),
    skincare: await loadNicheTemplates('skincare'),
    tech: await loadNicheTemplates('tech'),
    fashion: await loadNicheTemplates('fashion'),
    fitness: await loadNicheTemplates('fitness'),
    food: await loadNicheTemplates('food'),
    travel: await loadNicheTemplates('travel'),
    pet: await loadNicheTemplates('pet')
    // Add more niches as needed
  };

  // Cache templates for future use
  templatesCache = templates;
  console.log('All templates loaded and cached');
  return templates;
}

/**
 * Load default templates that apply to all niches unless overridden
 */
async function loadDefaultTemplates(): Promise<NicheTemplates> {
  // For now, we'll use hardcoded templates as a fallback
  // In a production system, these would be loaded from JSON/YAML files
  return {
    'original': 'Write a detailed review of {product} in {tone}. Cover its key features, benefits, and who it is best for. {trendContext}',
    
    'comparison': 'Write a comparison between {product} and similar products in its category. Use {tone} and highlight the unique selling points of each. {trendContext}',
    
    'caption': 'Create a social media caption for {product} in {tone}. The caption should be engaging and include relevant hashtags. {trendContext}',
    
    'pros_cons': 'List the main pros and cons of {product} in {tone}. Start with a brief overview, then provide bullet points for pros and cons. {trendContext}',
    
    'routine': 'Create a routine incorporating {product} in {tone}. Include step-by-step instructions and explain how this product enhances the routine. {trendContext}',
    
    'beginner_kit': 'Create a beginner\'s guide to using {product} in {tone}. Explain what it is, how to use it, and tips for beginners. {trendContext}',
    
    'demo_script': 'Write a demonstration script for {product} in {tone}. The script should guide someone through showing how to use the product effectively. {trendContext}',
    
    'drugstore_dupe': 'Identify and compare affordable alternatives to {product} in {tone}. Explain how these dupes compare to the original product. {trendContext}',
    
    'personal_review': 'Write a personal review of {product} in {tone}, using first-person perspective as if you\'ve been using it for a month. {trendContext}',
    
    'surprise_me': 'Create unique, creative content about {product} in {tone}. Think outside the box and make this content stand out. {trendContext}',
    
    'tiktok_breakdown': 'Create a script for a TikTok video about {product} in {tone}. The video should be 30-60 seconds and cover key points quickly. {trendContext}',
    
    'dry_skin_list': 'Create a list of product recommendations including {product} for people with dry skin in {tone}. Explain why each product is beneficial. {trendContext}',
    
    'top5_under25': 'Create a "Top 5 Products Under $25" list including {product} in {tone}. Focus on the value and quality of each affordable product. {trendContext}',
    
    'influencer_caption': 'Write an influencer-style caption for {product} in {tone}. The caption should be personal, engaging, and include a call to action. {trendContext}'
  };
}

/**
 * Load templates for a specific niche
 * @param niche The niche to load templates for
 */
async function loadNicheTemplates(niche: string): Promise<NicheTemplates> {
  try {
    // Start with empty templates
    const templates: NicheTemplates = {};
    
    // Try to load from JSON file first
    try {
      // Use absolute path to fix loading issues
      const nicheFilePath = path.join(process.cwd(), 'server', 'prompts', 'niches', `${niche}.json`);
      console.log(`Looking for niche template file at: ${nicheFilePath}`);
      
      const fileContent = await fs.readFile(nicheFilePath, 'utf-8');
      const fileTemplates = JSON.parse(fileContent);
      
      // Merge file templates
      Object.assign(templates, fileTemplates);
      console.log(`Successfully loaded templates for ${niche} from JSON file`);
      
      // If we successfully loaded from JSON, return immediately
      return templates;
    } catch (error) {
      console.log(`No JSON file found for niche ${niche} or error reading it, using fallback templates`);
      
      // If no JSON file found, fall back to hardcoded templates
      switch (niche) {
        case 'skincare':
          templates['original'] = 'As a skincare specialist, write a detailed review of {product} in {tone}. Discuss ingredients, benefits for skin health, and application techniques. {trendContext}';
          templates['routine'] = 'Create a skincare routine incorporating {product} in {tone}. Include morning and evening routines, and explain how this product benefits skin health. {trendContext}';
          break;
          
        case 'tech':
          templates['original'] = 'As a tech reviewer, write a detailed analysis of {product} in {tone}. Cover specifications, performance benchmarks, and user experience. {trendContext}';
          templates['comparison'] = 'Compare {product} with its main competitors in {tone}. Focus on technical specifications, price-to-performance ratio, and unique features. {trendContext}';
          break;
          
        case 'fashion':
          templates['original'] = 'As a fashion expert, review {product} in {tone}. Discuss fabric quality, styling options, and current fashion trends it aligns with. {trendContext}';
          templates['influencer_caption'] = 'Write a fashion influencer caption for {product} in {tone}. Include styling tips and outfit pairing suggestions. {trendContext}';
          break;
          
        case 'fitness':
          templates['original'] = 'As a fitness trainer, review {product} in {tone}. Discuss its benefits for workouts, proper usage techniques, and results users can expect. {trendContext}';
          templates['routine'] = 'Create a fitness routine incorporating {product} in {tone}. Include warm-up, main exercises, and cool-down phases. {trendContext}';
          break;
          
        case 'food':
          templates['original'] = 'As a culinary expert, review {product} in {tone}. Discuss flavor profile, ingredient quality, and potential uses in different recipes. {trendContext}';
          templates['recipe'] = 'Create a recipe featuring {product} in {tone}. Include ingredients, step-by-step instructions, and serving suggestions. {trendContext}';
          break;
          
        case 'travel':
          templates['original'] = 'As a travel expert, review {product} in {tone}. Discuss its usefulness for travelers, durability, and space-saving features. {trendContext}';
          templates['packing_list'] = 'Create a travel packing list including {product} in {tone}. Organize by categories and explain why each item is essential. {trendContext}';
          break;
          
        case 'pet':
          templates['original'] = 'As a pet care specialist, review {product} in {tone}. Discuss benefits for pets, safety considerations, and usage instructions. {trendContext}';
          templates['routine'] = 'Create a pet care routine incorporating {product} in {tone}. Include daily, weekly, and monthly care tasks. {trendContext}';
          break;
      }
    }
    
    return templates;
  } catch (error) {
    console.error(`Error loading templates for niche ${niche}:`, error);
    return {};
  }
}

/**
 * Reload all templates, clearing the cache
 */
export async function reloadTemplates(): Promise<PromptTemplates> {
  templatesCache = null;
  return loadPromptTemplates();
}