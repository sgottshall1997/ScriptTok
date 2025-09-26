/**
 * UNIFIED PROMPT FACTORY - COMPLETELY OVERHAULED WITH NEW GLOWBOT PROMPTS
 * Modular prompt generation system for all content types and generators
 */

import { TrendingProduct } from '../../shared/schema';

// Enhanced viral template interfaces
interface ViralTemplateData {
  viralHook?: string;
  viralFormat?: string;
  viralStyle?: string;
  viralStructure?: {
    opening: string;
    demonstration: string;
    callToAction: string;
  };
  recommendedHashtags?: string[];
  templateConfidence?: number;
  engagementPatterns?: string[];
  bestPractices?: {
    hookTemplate: string;
    contentFormat: string;
    videoStructure: string;
  };
}

export interface PromptConfig {
  niche: string;
  templateType: string;
  tone: string;
  productName: string;
  platforms?: string[];
  contentFormat?: 'standard' | 'spartan';
  trendingProducts?: TrendingProduct[];
  viralInspiration?: any; // Legacy viral inspiration (basic)
  viralTemplate?: ViralTemplateData; // Enhanced viral template data
  smartStyleRecommendations?: any;
}

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  templateMetadata: {
    templateType: string;
    niche: string;
    tone: string;
    contentFormat: string;
  };
}

/**
 * Helper function to integrate viral template data into prompts
 */
function enhancePromptWithViralTemplate(
  basePrompt: string, 
  config: PromptConfig
): string {
  if (!config.viralTemplate) {
    return basePrompt;
  }

  const viral = config.viralTemplate;
  let enhancedPrompt = basePrompt;

  // Add viral-specific instructions
  let viralInstructions = '\n\n🎯 **VIRAL CONTENT INTEGRATION:**\n';
  
  if (viral.viralHook) {
    viralInstructions += `- Use this proven viral hook pattern: "${viral.viralHook}"\n`;
  }
  
  if (viral.viralFormat) {
    viralInstructions += `- Follow this successful format: ${viral.viralFormat}\n`;
  }
  
  if (viral.viralStructure) {
    viralInstructions += `- Structure your content like this successful viral video:\n`;
    viralInstructions += `  • Opening: ${viral.viralStructure.opening}\n`;
    viralInstructions += `  • Main Content: ${viral.viralStructure.demonstration}\n`;
    viralInstructions += `  • Call-to-Action: ${viral.viralStructure.callToAction}\n`;
  }
  
  if (viral.engagementPatterns && viral.engagementPatterns.length > 0) {
    viralInstructions += `- Apply these engagement drivers: ${viral.engagementPatterns.join(', ')}\n`;
  }
  
  if (viral.bestPractices?.hookTemplate) {
    viralInstructions += `- Hook template to follow: "${viral.bestPractices.hookTemplate}"\n`;
  }
  
  if (viral.recommendedHashtags && viral.recommendedHashtags.length > 0) {
    viralInstructions += `- Prioritize these proven hashtags: ${viral.recommendedHashtags.join(' ')}\n`;
  }
  
  if (viral.templateConfidence) {
    viralInstructions += `- This template has ${viral.templateConfidence}% proven success rate\n`;
  }

  // Insert viral instructions before the writing guidelines section
  if (enhancedPrompt.includes('Writing Guidelines:')) {
    enhancedPrompt = enhancedPrompt.replace('Writing Guidelines:', viralInstructions + '\nWriting Guidelines:');
  } else {
    enhancedPrompt += viralInstructions;
  }

  return enhancedPrompt;
}

/**
 * HELPER FUNCTIONS FOR NICHE-SPECIFIC TEMPLATES
 */

// Fashion template helpers
function generateFashionShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, impactful review script for the jewelry item "${config.productName}", intended for a 30–60 second social media video.

Your task is to make viewers understand exactly why this piece of jewelry deserves attention, by presenting clear, specific information about its material, craftsmanship, versatility, and value, while avoiding vague language and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script do not reuse the same one repeatedly.

Examples:
• "Wearing ${config.productName} wrong? Big mistake."
• "Most people ignore ${config.productName} — here's why you shouldn't."
• "Stop buying ${config.productName} before you know this."
• "Overpaying for low-quality jewelry? Here's what makes ${config.productName} worth it."
• "Think all ${config.productName} are the same? You're wasting your money."
• "Is ${config.productName} a good deal? Let's check."
• "Not checking this before buying ${config.productName}? You're losing money."

2. Material, craftsmanship, and quality
Describe the piece using specific, factual details relevant to jewelry.
Include:
• Base material and plating (e.g., solid sterling silver, gold vermeil, stainless steel, platinum)
• Stones or embellishments (e.g., pavé-set crystals, conflict-free diamonds, enamel inlay)
• Construction details (e.g., hand-polished edges, secure clasp, open-back setting)
• Durability (e.g., tarnish-resistant, hypoallergenic, scratch-resistant)
• Wearability and comfort (e.g., smooth inner surface, lightweight, adjustable band)
• Care instructions (e.g., store in a soft pouch, avoid water or harsh chemicals)

Avoid subjective adjectives and vague claims like "beautiful" or "great quality."

3. Styling suggestions
Offer 2–3 concrete, practical ways to wear the piece, specifying outfits, occasions, or how to layer it.

4. Seasonality and versatility
Explain when and where it works best. Tailor this to jewelry by noting:
• Occasions (e.g., weddings, office, daily wear, travel, parties)
• Seasons if applicable (e.g., light-catching summer jewelry, layered winter accessories)
• Day-to-night transitions (e.g., subtle enough for day, eye-catching at night)
• Formally vs. casually (e.g., dresses up a casual look, complements formal outfits)

5. Price-to-quality assessment and audience fit
Comment on the value based on quality and who it suits.

6. Call-to-action
End with a clear, engaging question or invitation addressed directly to the viewer.
Always pick a different CTA each time do not reuse the same one repeatedly.

Writing Guidelines:
• Use clear, simple, specific language.
• Write short, declarative sentences that are easy to speak and understand.
• Use active voice only.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not use generalizations or emotional exaggerations.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.

Length & Structure:
• Target 100–170 words, spoken naturally in 30–60 seconds.
• Structured clearly for on-camera delivery or voice-over.
• Smooth transitions between sections, but keep sentences crisp and impactful.

Your goal is to give viewers clear, actionable reasons to consider buying ${config.productName}, help them picture when and how to wear it, and end with an engaging question that prompts them to act.`;

  return {
    systemPrompt: `You are an expert fashion content creator specializing in jewelry and fashion product reviews for social media.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateFashionComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}

function generateFashionRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}

// Fitness template helpers
function generateFitnessShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, impactful review script for the fitness product "${config.productName}", intended for a 30–60 second social media video about workouts or wellness.

Your task is to show viewers exactly why this product improves their training, by presenting clear, specific information about its functionality, benefits, and value, while avoiding vague claims and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script do not reuse the same one repeatedly.

Examples:
• "Still training without ${config.productName}? You're leaving results on the table."
• "Most people ignore ${config.productName} here's why that slows progress."
• "Stop buying fitness gear before you know this about ${config.productName}."
• "Wasting time with the wrong equipment? Here's why ${config.productName} works."
• "Think ${config.productName} is optional? Think again."
• "Is ${config.productName} worth it? Let's find out."
• "Not using ${config.productName} yet? You're making it harder than it needs to be."

2. Key features and benefits
List 3–4 specific, factual benefits or features that make the product valuable.
Include details like:
• Performance enhancement (e.g., improves grip strength, adds resistance, boosts stability)
• Material quality (e.g., non-slip coating, heavy-duty steel, sweat-resistant padding)
• Comfort and fit (e.g., ergonomic shape, adjustable straps, lightweight design)
• Safety (e.g., reduces risk of injury, promotes correct alignment)
• Progressive overload (e.g., adjustable resistance levels, scalable weight)
• Recovery support (e.g., promotes blood flow, reduces soreness)

Avoid vague statements like "great for workouts" specify how and why it's useful.

3. Solving fitness challenges or improving efficiency
Explain how this product addresses common training problems or helps make workouts more effective.

Examples:
• "Eliminates wrist pain during heavy lifts."
• "Keeps your core engaged during squats."
• "Saves time by combining two exercises in one move."
• "Improves form so you don't waste reps with bad technique."
• "Helps you push past plateaus by adding safe resistance."

4. Research or science behind it
Briefly reference any credible research, principles, or facts supporting the product's design or purpose, if applicable.
Examples:
• "Based on studies showing that unstable surfaces improve balance and proprioception."
• "Uses progressive resistance proven to build muscle more effectively than static loads."
• "Incorporates biomechanics to reduce joint strain."

If no research is applicable, skip this section but do not fabricate claims.

5. Who it's for
State clearly who benefits most from this product, using specific groups or goals.

Examples:
• "Perfect for beginners learning proper squat depth."
• "Ideal for advanced athletes adding explosive power."
• "Best for lifters who train at home with limited space."
• "Designed for anyone focused on mobility and injury prevention."
• "Great choice for high-intensity training and quick transitions."

6. Motivational call-to-action
End with a clear, energetic question or challenge directed at the viewer.
Always choose a different CTA each time do not reuse the same one repeatedly.

Examples:
• "Ready to train smarter?"
• "Think you can push harder with this?"
• "What's stopping you from adding this to your routine?"
• "Ready to level up your results?"
• "Will you keep struggling or start training right?"
• "How much more could you accomplish with this?"
• "Your move when are you starting?"

Writing Guidelines:
• Use clear, simple, specific language.
• Write short, declarative sentences that are easy to speak and understand.
• Use active voice only.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not use generalizations or emotional exaggerations.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.

Length & Structure:
• Target 100–170 words, spoken naturally in 30–60 seconds.
• Structured clearly for on-camera delivery or voice-over.
• Smooth transitions between sections, but keep sentences crisp and impactful.

Your goal is to equip viewers with clear, actionable reasons to consider ${config.productName}, show how it improves their training, and end with a direct, motivating question that encourages them to take action.`;

  return {
    systemPrompt: `You are an expert fitness content creator specializing in product reviews for workouts and wellness.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateFitnessComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}

function generateFitnessRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}

// Universal template helpers (simple implementation)
function generateUniversalShortVideo(config: PromptConfig): GeneratedPrompt {
  return {
    systemPrompt: `You are an expert content creator specializing in product reviews for social media.`,
    userPrompt: enhancePromptWithViralTemplate(`Create a short, impactful video script for ${config.productName} in ${config.tone} tone. Focus on key benefits, who it's for, and end with a compelling call-to-action.`, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalComparison(config: PromptConfig): GeneratedPrompt {
  return {
    systemPrompt: `You are an expert content creator specializing in product comparisons.`,
    userPrompt: enhancePromptWithViralTemplate(`Write a detailed comparison of ${config.productName} with similar products in its category. Use ${config.tone} tone and highlight unique selling points.`, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalRoutine(config: PromptConfig): GeneratedPrompt {
  return {
    systemPrompt: `You are an expert content creator specializing in routine and lifestyle content.`,
    userPrompt: enhancePromptWithViralTemplate(`Create a routine guide incorporating ${config.productName} in ${config.tone} tone. Include step-by-step instructions and explain benefits.`, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalInfluencerCaption(config: PromptConfig): GeneratedPrompt {
  return {
    systemPrompt: `You are an expert social media content creator specializing in influencer-style captions.`,
    userPrompt: enhancePromptWithViralTemplate(`Write an engaging influencer-style caption for ${config.productName} in ${config.tone} tone. Make it personal, authentic, and include a call-to-action.`, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalAffiliateEmail(config: PromptConfig): GeneratedPrompt {
  return {
    systemPrompt: `You are an expert email marketing content creator specializing in affiliate promotions.`,
    userPrompt: enhancePromptWithViralTemplate(`Write a persuasive affiliate email promoting ${config.productName} in ${config.tone} tone. Include compelling subject line and conversion-focused content.`, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalSEOBlog(config: PromptConfig): GeneratedPrompt {
  return {
    systemPrompt: `You are an expert SEO content writer specializing in product-focused blog posts.`,
    userPrompt: enhancePromptWithViralTemplate(`Write a comprehensive, SEO-optimized blog post about ${config.productName} in ${config.tone} tone. Target 1000+ words with proper structure and keywords.`, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

// Stub functions for other niches (will add full implementations if needed)
function generateFoodShortVideo(config: PromptConfig): GeneratedPrompt {
  return generateUniversalShortVideo(config);
}
function generateFoodComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateFoodRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generateBeautyShortVideo(config: PromptConfig): GeneratedPrompt {
  return generateUniversalShortVideo(config);
}
function generateBeautyComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateBeautyRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generateTechShortVideo(config: PromptConfig): GeneratedPrompt {
  return generateUniversalShortVideo(config);
}
function generateTechComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateTechRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generateTravelShortVideo(config: PromptConfig): GeneratedPrompt {
  return generateUniversalShortVideo(config);
}
function generateTravelComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateTravelRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generatePetShortVideo(config: PromptConfig): GeneratedPrompt {
  return generateUniversalShortVideo(config);
}
function generatePetComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generatePetRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}

/**
 * NEW GLOWBOT PROMPT TEMPLATES FROM PDF - COMPLETE OVERHAUL
 * RESTRUCTURED: Template-type-first organization for proper template selection
 */
/**
 * TEMPLATE REGISTRY - Clean template-type-first architecture
 * Each template type has niche-specific generators with universal fallback
 */
interface TemplateRegistry {
  [templateType: string]: {
    generators: {
      [niche: string]: (config: PromptConfig) => GeneratedPrompt;
      universal: (config: PromptConfig) => GeneratedPrompt;
    };
  };
}

const TEMPLATE_REGISTRY: TemplateRegistry = {
  'short_video': {
    generators: {
      'fashion': generateFashionShortVideo,
      'fitness': generateFitnessShortVideo, 
      'food': generateFoodShortVideo,
      'beauty': generateBeautyShortVideo,
      'tech': generateTechShortVideo,
      'travel': generateTravelShortVideo,
      'pet': generatePetShortVideo,
      'universal': generateUniversalShortVideo
    }
  },
  
  'product_comparison': {
    generators: {
      'fashion': generateFashionComparison,
      'fitness': generateFitnessComparison,
      'food': generateFoodComparison, 
      'beauty': generateBeautyComparison,
      'tech': generateTechComparison,
      'travel': generateTravelComparison,
      'pet': generatePetComparison,
      'universal': generateUniversalComparison
    }
  },
  
  'routine_kit': {
    generators: {
      'fashion': generateFashionRoutine,
      'fitness': generateFitnessRoutine,
      'food': generateFoodRoutine,
      'beauty': generateBeautyRoutine, 
      'tech': generateTechRoutine,
      'travel': generateTravelRoutine,
      'pet': generatePetRoutine,
      'universal': generateUniversalRoutine
    }
  },
  
  'influencer_caption': {
    generators: {
      'universal': generateUniversalInfluencerCaption
    }
  },
  
  'affiliate_email': {
    generators: {
      'universal': generateUniversalAffiliateEmail
    }
  },
  
  'seo_blog': {
    generators: {
      'universal': generateUniversalSEOBlog
    }
  }
};

/**
 * Clean template dispatcher - resolves by templateType and niche
 */
function getTemplateGenerator(templateType: string, niche: string): (config: PromptConfig) => GeneratedPrompt {
  const registry = TEMPLATE_REGISTRY[templateType];
  if (!registry) {
    throw new Error(`Template type '${templateType}' not found in registry`);
  }
  
  // Try niche-specific generator first, fallback to universal
  const generator = registry.generators[niche] || registry.generators.universal;
  if (!generator) {
    throw new Error(`No generator found for template '${templateType}' and niche '${niche}'`);
  }
  
  return generator;
}

export const TEMPLATE_PROMPTS = {
  'short_video': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('short_video', config.niche);
    return generator(config);
  },
  
  'product_comparison': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('product_comparison', config.niche);
    return generator(config);
  },
  
  'routine_kit': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('routine_kit', config.niche);
    return generator(config);
  },
  
  'influencer_caption': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('influencer_caption', config.niche);
    return generator(config);
  },
  
  'affiliate_email': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('affiliate_email', config.niche);
    return generator(config);
  },
  
  'seo_blog': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('seo_blog', config.niche);
    return generator(config);
  }
};

