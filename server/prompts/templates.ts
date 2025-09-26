/**
 * Enhanced Prompt Templates Loader
 * Loads and manages prompt templates with rich metadata for different niches and content types
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TemplateType, NICHES } from '@shared/constants';

// Create a proper __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions for enhanced templates
export interface TemplateMetadata {
  template: string;
  title: string;
  description: string;
  icon: string;
  exampleOutput: string;
}

export interface NicheInfo {
  name: string;
  description: string;
  icon: string;
  primary_color: string;
  secondary_color: string;
  keywords: string[];
}

export interface EnhancedTemplateFile {
  niche_info?: NicheInfo;
  templates: Record<string, TemplateMetadata>;
}

export type PromptTemplate = string;
export type TemplateMetadataMap = Record<TemplateType, TemplateMetadata>;
export type NicheTemplates = Partial<Record<TemplateType, PromptTemplate>>;
export type PromptTemplates = Record<string, NicheTemplates>;
export type NicheInfoMap = Record<string, NicheInfo>;

// In-memory cache for template data
let templatesCache: PromptTemplates | null = null;
let metadataCache: Record<string, Partial<TemplateMetadataMap>> | null = null;
let nicheInfoCache: NicheInfoMap | null = null;

/**
 * Load template data from a JSON file for a specific niche
 * @param niche The niche to load templates for
 * @returns An object containing all templates for this niche
 */
async function loadNicheTemplatesFromJson(niche: string): Promise<NicheTemplates> {
  try {
    // Construct the path to the JSON file
    const filePath = path.join(__dirname, 'niches', `${niche}.json`);
    
    // Read and parse the JSON file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent) as EnhancedTemplateFile;
    
    // Extract the templates
    const templates: NicheTemplates = {};
    
    // Store niche info in cache if available
    if (data.niche_info) {
      if (!nicheInfoCache) {
        nicheInfoCache = {};
      }
      nicheInfoCache[niche] = data.niche_info;
    }
    
    // Validate that templates object exists
    if (!data.templates) {
      console.warn(`⚠️ Invalid template format: ${niche}.json is missing 'templates' object`);
      return {};
    }
    
    // Process each template in the file
    Object.entries(data.templates).forEach(([type, metadata]) => {
      // Verify that template content exists
      if (!metadata || !metadata.template) {
        console.warn(`⚠️ Missing template content for '${type}' in ${niche}.json`);
        return;
      }
      
      // Store the template text
      templates[type as TemplateType] = metadata.template;
      
      // Store metadata for this template type
      if (!metadataCache) {
        metadataCache = {};
      }
      if (!metadataCache[niche]) {
        metadataCache[niche] = {};
      }
      metadataCache[niche][type as TemplateType] = metadata;
    });
    
    const templateCount = Object.keys(templates).length;
    console.log(`Loaded ${templateCount} templates for niche: ${niche}`);
    
    // Warn if no templates were found in a valid file (but only if not default)
    if (templateCount === 0 && niche !== 'default') {
      console.warn(`⚠️ No templates found in ${niche}.json file`);
    }
    
    return templates;
  } catch (error) {
    // More detailed error reporting based on error type
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Don't log warnings for default niche since it might be intentionally missing
      if (niche !== 'default') {
        console.warn(`Template file not found: ${niche}.json. Consider creating this file in the prompts/niches/ directory.`);
      }
    } else {
      console.error(`⚠️ Error loading templates for niche '${niche}':`, error);
    }
    
    // Return empty template set if file doesn't exist or has errors
    return {};
  }
}

/**
 * Load all prompt templates and metadata from templates directory
 * @returns An object containing all templates organized by niche and type
 */
export async function loadPromptTemplates(): Promise<PromptTemplates> {
  // Use cached templates if available and not in development mode
  if (templatesCache && process.env.NODE_ENV !== 'development') {
    return templatesCache;
  }
  
  console.log('Loading all prompt templates...');
  
  const templates: PromptTemplates = {
    default: {},
  };

  // First, load universal templates from text files
  try {
    const universalTemplates = await loadUniversalTemplatesFromTextFiles();
    templates.default = universalTemplates;
    console.log(`✅ Loaded ${Object.keys(universalTemplates).length} universal templates`);
  } catch (error) {
    console.warn("⚠️ Could not load universal templates:", error instanceof Error ? error.message : String(error));
  }

  // Load niche-specific templates from text files
  try {
    const textTemplates = await loadTemplatesFromTextFiles();
    Object.entries(textTemplates).forEach(([niche, nicheTemplates]) => {
      templates[niche] = nicheTemplates;
    });
    console.log(`✅ Loaded niche-specific templates for ${Object.keys(textTemplates).length} niches`);
  } catch (error) {
    console.warn("⚠️ Could not load niche-specific templates:", error instanceof Error ? error.message : String(error));
  }

  // Then load templates from JSON files (if they exist)
  for (const niche of ['default', ...NICHES]) {
    try {
      const jsonTemplates = await loadNicheTemplatesFromJson(niche);
      if (Object.keys(jsonTemplates).length > 0) {
        // Merge with existing templates (JSON takes precedence)
        templates[niche] = { ...templates[niche], ...jsonTemplates };
      }
    } catch (error) {
      // Silently ignore JSON loading errors since text files are primary
    }
  }

  // Cache templates for future use
  templatesCache = templates;
  console.log('All templates loaded and cached');
  return templates;
}

/**
 * Load enhanced template metadata for all niches
 * This includes template titles, descriptions, icons, and example outputs
 */
export async function loadTemplateMetadata(): Promise<Record<string, Partial<TemplateMetadataMap>>> {
  if (metadataCache) {
    return metadataCache;
  }

  console.log('Loading template metadata...');
  const metadata: Record<string, Partial<TemplateMetadataMap>> = {
    default: {},
  };

  // Load metadata for each niche (including default)
  for (const niche of ['default', ...NICHES]) {
    try {
      const nicheFile = await loadTemplateFile(niche);
      if (nicheFile && nicheFile.templates) {
        const nicheMetadata: Partial<TemplateMetadataMap> = {};
        
        // Convert the templates object to our metadata format
        Object.entries(nicheFile.templates).forEach(([templateType, templateData]) => {
          nicheMetadata[templateType as TemplateType] = templateData;
        });
        
        metadata[niche] = nicheMetadata;
      }
    } catch (error) {
      console.error(`Error loading metadata for niche ${niche}:`, error);
      metadata[niche] = {};
    }
  }

  metadataCache = metadata;
  return metadata;
}

/**
 * Load niche information for all available niches
 * This includes display names, descriptions, icons, and color themes
 */
export async function loadNicheInfo(): Promise<NicheInfoMap> {
  if (nicheInfoCache) {
    return nicheInfoCache;
  }

  console.log('Loading niche information...');
  const nicheInfo: NicheInfoMap = {};

  // Default niche info fallback
  const defaultNicheInfo: NicheInfo = {
    name: "General Content",
    description: "Generate versatile content for any product type using universal templates suitable for various industries and product categories.",
    icon: "🌐",
    primary_color: "gray",
    secondary_color: "slate",
    keywords: ["product", "review", "content", "general", "universal", "versatile", "all-purpose"]
  };
  
  nicheInfo['default'] = defaultNicheInfo;

  // Load niche info for each niche
  for (const niche of NICHES) {
    try {
      const nicheFile = await loadTemplateFile(niche);
      if (nicheFile && nicheFile.niche_info) {
        nicheInfo[niche] = nicheFile.niche_info;
      } else {
        // Fallback niche info if not defined in file
        nicheInfo[niche] = {
          name: niche.charAt(0).toUpperCase() + niche.slice(1),
          description: `Content for ${niche} products and services`,
          icon: "file-text",
          primary_color: "blue",
          secondary_color: "gray",
          keywords: [niche]
        };
      }
    } catch (error) {
      console.error(`Error loading niche info for ${niche}:`, error);
      // Use fallback
      nicheInfo[niche] = {
        name: niche.charAt(0).toUpperCase() + niche.slice(1),
        description: `Content for ${niche} products and services`,
        icon: "file-text",
        primary_color: "blue",
        secondary_color: "gray",
        keywords: [niche]
      };
    }
  }

  nicheInfoCache = nicheInfo;
  return nicheInfo;
}

/**
 * Get template metadata for a specific niche and template type
 * Falls back to default if no specific metadata is found
 */
export async function getTemplateMetadata(niche: string, templateType: TemplateType): Promise<TemplateMetadata | undefined> {
  const metadata = await loadTemplateMetadata();
  
  // Try to get niche-specific metadata first
  if (metadata[niche] && metadata[niche][templateType]) {
    return metadata[niche][templateType];
  }
  
  // Fall back to default metadata if available
  if (metadata['default'] && metadata['default'][templateType]) {
    return metadata['default'][templateType];
  }
  
  return undefined;
}

/**
 * Load a template file for a specific niche
 * @param niche The niche to load the template file for
 */
async function loadTemplateFile(niche: string): Promise<EnhancedTemplateFile | null> {
  try {
    const nicheFilePath = path.join(process.cwd(), 'server', 'prompts', 'niches', `${niche}.json`);
    console.log(`Looking for template file at: ${nicheFilePath}`);
    
    const fileContent = await fs.readFile(nicheFilePath, 'utf-8');
    const templateFile = JSON.parse(fileContent) as EnhancedTemplateFile;
    
    console.log(`Successfully loaded template file for ${niche}`);
    return templateFile;
  } catch (error) {
    console.log(`No template file found for ${niche} or error reading it`);
    return null;
  }
}

/**
 * Load universal templates from text files
 */
async function loadUniversalTemplatesFromTextFiles(): Promise<NicheTemplates> {
  const templates: NicheTemplates = {};
  
  try {
    const universalDir = path.join(process.cwd(), 'server', 'prompts', 'templates', 'universal');
    const files = await fs.readdir(universalDir);
    
    for (const file of files) {
      if (file.endsWith('.txt')) {
        const templateType = file.replace('.txt', '') as TemplateType;
        const filePath = path.join(universalDir, file);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          if (content.trim()) {
            templates[templateType] = content.trim();
          } else {
            console.warn(`Universal template ${file} is empty`);
          }
        } catch (error) {
          console.warn(`Could not load universal template ${file}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    // Ensure all required universal templates exist
    const requiredTemplates: TemplateType[] = [
      'affiliate_email',
      'influencer_caption', 
      'product_comparison',
      'routine_kit',
      'seo_blog',
      'short_video'
    ];
    
    for (const templateType of requiredTemplates) {
      if (!templates[templateType]) {
        console.warn(`⚠️ Missing required universal template: ${templateType}.txt`);
      }
    }
    
    console.log(`✅ Loaded ${Object.keys(templates).length} universal templates:`, Object.keys(templates));
    return templates;
  } catch (error) {
    console.warn("⚠️ Could not load universal templates directory:", error instanceof Error ? error.message : String(error));
    return {};
  }
}

/**
 * Load niche-specific templates from text files
 */
async function loadTemplatesFromTextFiles(): Promise<PromptTemplates> {
  const templates: PromptTemplates = {};
  
  try {
    const templatesDir = path.join(process.cwd(), 'server', 'prompts', 'templates');
    const dirs = await fs.readdir(templatesDir, { withFileTypes: true });
    
    for (const dir of dirs) {
      if (dir.isDirectory() && dir.name !== 'universal') {
        const niche = dir.name;
        const nicheTemplates: NicheTemplates = {};
        
        try {
          const nicheDir = path.join(templatesDir, niche);
          const files = await fs.readdir(nicheDir);
          
          for (const file of files) {
            if (file.endsWith('.txt')) {
              const templateType = file.replace('.txt', '') as TemplateType;
              const filePath = path.join(nicheDir, file);
              
              try {
                const content = await fs.readFile(filePath, 'utf-8');
                nicheTemplates[templateType] = content;
              } catch (error) {
                console.warn(`Could not load template ${niche}/${file}:`, error instanceof Error ? error.message : String(error));
              }
            }
          }
          
          if (Object.keys(nicheTemplates).length > 0) {
            templates[niche] = nicheTemplates;
          }
        } catch (error) {
          console.warn(`Could not load templates for niche ${niche}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    return templates;
  } catch (error) {
    console.warn("⚠️ Could not load templates from text files:", error instanceof Error ? error.message : String(error));
    return {};
  }
}

/**
 * Load templates for a specific niche
 * @param niche The niche to load templates for
 */
async function loadNicheTemplates(niche: string): Promise<NicheTemplates> {
  try {
    // Start with empty templates
    const templates: NicheTemplates = {};
    
    const templateFile = await loadTemplateFile(niche);
    
    if (templateFile && templateFile.templates) {
      // Extract template strings from the template file and convert newer format variables to old format
      Object.entries(templateFile.templates).forEach(([templateType, templateData]) => {
        let templateString = templateData.template;
        
        // Convert new {{productName}} format to {product} for backward compatibility
        templateString = templateString.replace(/{{productName}}/g, '{product}');
        
        // Convert new {{trendingProducts}} format to {trendContext} for backward compatibility
        templateString = templateString.replace(/{{trendingProducts}}/g, '{trendContext}');
        
        // Convert new {{tone}} format to {tone} for backward compatibility
        templateString = templateString.replace(/{{tone}}/g, '{tone}');
        
        templates[templateType as TemplateType] = templateString;
      });
      
      console.log(`Successfully loaded ${Object.keys(templates).length} templates for ${niche}`);
      return templates;
    }
    
    // If we can't load from file, use fallback hardcoded templates
    if (niche === 'default') {
      return getFallbackDefaultTemplates();
    } else {
      return getFallbackNicheTemplates(niche);
    }
  } catch (error) {
    console.error(`Error loading templates for niche ${niche}:`, error);
    return niche === 'default' ? getFallbackDefaultTemplates() : {};
  }
}

/**
 * Get fallback templates for default niche if JSON file is missing
 */
function getFallbackDefaultTemplates(): Record<string, string> {
  return {
    'short_video': 'Write a detailed review of {product} in {tone}. Cover its key features, benefits, and who it is best for. {trendContext}',
    'product_comparison': 'Write a comparison between {product} and similar products in its category. Use {tone} and highlight the unique selling points of each. {trendContext}',
    'influencer_caption': 'Create a social media caption for {product} in {tone}. The caption should be engaging and include relevant hashtags. {trendContext}',
    'routine_kit': 'Create a routine incorporating {product} in {tone}. Include step-by-step instructions and explain how this product enhances the routine. {trendContext}',
    'seo_blog': 'Write a comprehensive blog post about {product} in {tone}. Include detailed information, benefits, and SEO-optimized content. {trendContext}',
    'affiliate_email': 'Write an affiliate email promoting {product} in {tone}. Include compelling subject line and persuasive content. {trendContext}'
  };
}

/**
 * Get fallback templates for specific niches if JSON file is missing
 */
function getFallbackNicheTemplates(niche: string): Record<string, string> {
  const templates: Record<string, string> = {};
  
  switch (niche) {
    case 'skincare':
      templates['skincare'] = 'As a skincare specialist, write a detailed review of {product} in {tone}. Discuss ingredients, benefits for skin health, and application techniques. {trendContext}';
      templates['routine_kit'] = 'Create a skincare routine incorporating {product} in {tone}. Include morning and evening routines, and explain how this product benefits skin health. {trendContext}';
      break;
      
    case 'tech':
      templates['tech'] = 'As a tech reviewer, write a detailed analysis of {product} in {tone}. Cover specifications, performance benchmarks, and user experience. {trendContext}';
      templates['product_comparison'] = 'Compare {product} with its main competitors in {tone}. Focus on technical specifications, price-to-performance ratio, and unique features. {trendContext}';
      break;
      
    case 'fashion':
      templates['fashion'] = 'As a fashion expert, review {product} in {tone}. Discuss fabric quality, styling options, and current fashion trends it aligns with. {trendContext}';
      templates['influencer_caption'] = 'Write a fashion influencer caption for {product} in {tone}. Include styling tips and outfit pairing suggestions. {trendContext}';
      break;
      
    case 'fitness':
      templates['fitness'] = 'As a fitness trainer, review {product} in {tone}. Discuss its benefits for workouts, proper usage techniques, and results users can expect. {trendContext}';
      templates['routine_kit'] = 'Create a fitness routine incorporating {product} in {tone}. Include warm-up, main exercises, and cool-down phases. {trendContext}';
      break;
      
    case 'food':
      templates['food'] = 'As a culinary expert, review {product} in {tone}. Discuss flavor profile, ingredient quality, and potential uses in different recipes. {trendContext}';
      templates['seo_blog'] = 'Create a comprehensive food blog post featuring {product} in {tone}. Include ingredients, preparation methods, and serving suggestions. {trendContext}';
      break;
      
    case 'travel':
      templates['travel'] = 'As a travel expert, review {product} in {tone}. Discuss its usefulness for travelers, durability, and space-saving features. {trendContext}';
      templates['routine_kit'] = 'Create a travel routine incorporating {product} in {tone}. Organize by categories and explain why each item is essential for different types of trips. {trendContext}';
      break;
      
    case 'pet':
      templates['pet'] = 'As a pet care specialist, review {product} in {tone}. Discuss benefits for pets, safety considerations, and usage instructions. {trendContext}';
      templates['routine_kit'] = 'Create a pet care routine incorporating {product} in {tone}. Include daily, weekly, and monthly care tasks. {trendContext}';
      break;
  }
  
  return templates;
}

/**
 * Reload all templates and metadata, clearing all caches
 */
export async function reloadTemplates(): Promise<PromptTemplates> {
  console.log('Reloading all template caches...');
  
  // Clear all caches
  templatesCache = null;
  metadataCache = null;
  nicheInfoCache = null;
  
  // Load everything fresh
  const nicheInfo = await loadNicheInfo();
  const metadata = await loadTemplateMetadata();
  const templates = await loadPromptTemplates();
  
  console.log(`Successfully reloaded templates for ${Object.keys(templates).length} niches`);
  console.log(`Successfully reloaded metadata for ${Object.keys(metadata).length} niches`);
  console.log(`Successfully reloaded info for ${Object.keys(nicheInfo).length} niches`);
  
  return templates;
}