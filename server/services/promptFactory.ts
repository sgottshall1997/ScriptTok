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

// Food template helpers
function generateFoodShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, impactful review script for the food product "${config.productName}", intended for a 30–60 second social media culinary video.

Your task is to help viewers understand exactly why this product is worth trying, by presenting clear, specific information about its flavor, quality, versatility, and value, while avoiding vague claims and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script do not reuse the same one repeatedly.

Examples:
• "Still cooking without ${config.productName}? You're missing out on flavor."
• "Most people overlook ${config.productName} here's why they're wrong."
• "Stop buying food before you know this about ${config.productName}."
• "Think ${config.productName} is all the same? Think again."
• "Wasting money on bland ingredients? Here's why ${config.productName} delivers."
• "Is ${config.productName} worth the hype? Let's taste and see."
• "Not using ${config.productName} yet? You're leaving your dishes flat."

2. Flavor, texture, aroma, and quality
Describe the product using specific, sensory details about what it's like to taste and experience it.
Include:
• Flavor profile (e.g., nutty, smoky, tangy, subtly sweet, rich umami)
• Texture (e.g., creamy, crunchy, tender, flaky)
• Aroma (e.g., fragrant herbs, toasted spices, buttery, citrusy)
• Quality of ingredients (e.g., single-origin cocoa, cold-pressed olive oil, fresh-ground spices)
• Origin and unique qualities (e.g., harvested from Sicilian lemons, dry-aged for 30 days)
• Preparation details (e.g., stone-milled, slow-fermented, hand-packed)

3. Suggested uses, recipes, or pairings
Offer 2–3 practical, specific ways to enjoy the product, including recipes, pairings, or serving suggestions.

Examples:
• "Spread it over toasted sourdough with honey for breakfast."
• "Fold it into pasta with roasted garlic for dinner."
• "Pair it with sharp cheese and charcuterie for a perfect appetizer."
• "Mix into trending dishes like those featured in food magazines."

4. Nutritional highlights or dietary notes
If relevant, briefly mention key nutritional facts or dietary suitability.

Examples:
• "High in protein and fiber for a satisfying snack."
• "Gluten-free and vegan-friendly for all diets."
• "Low in sugar but full of flavor."
• "Rich in healthy fats and antioxidants."

Skip this section if not applicable, but do not invent claims.

5. Value and audience
Comment on who this product is best suited for and why it's worth its price.

Examples:
• "Ideal for home cooks who want restaurant-quality ingredients."
• "Best for anyone building a gourmet pantry without overspending."
• "Great for families looking for easy weeknight flavor."
• "Suited for entertaining guests with something special."

6. Motivational call-to-action
End with a clear, appetizing question or challenge addressed directly to the viewer.
Always choose a different CTA each time do not reuse the same one repeatedly.

Examples:
• "Ready to taste the difference?"
• "What would you cook first with this?"
• "Think this belongs in your kitchen?"
• "When's the last time you leveled up your meals?"
• "What dish would you pair it with?"
• "Your move - are you trying it tonight?"

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

Your goal is to give viewers clear, actionable reasons to consider buying ${config.productName}, help them picture how it tastes and fits into their meals, and end with a direct, mouthwatering question that prompts them to act.`;

  return {
    systemPrompt: `You are an expert culinary content creator specializing in food product reviews for social media.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}
function generateFoodComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateFoodRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generateBeautyShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a comprehensive, actionable skincare routine guide featuring "${config.productName}", designed for a morning and night routine breakdown.

Your task is to help viewers understand exactly how to use ${config.productName} effectively in their daily skincare, presenting clear, specific information about application, layering, and expected results while avoiding vague claims and filler.

The script must include the following sections, in this exact order and structure:

Title: Your Complete Morning & Night Skincare Routine with ${config.productName}

Morning Routine (AM)

Step 1: Gentle Cleanser
• Start with a mild, pH-balanced cleanser
• Removes overnight buildup without stripping skin

Step 2: ${config.productName} Application
• How to properly apply ${config.productName} in the morning
• Specify amount to use and recommended technique
• Explain why morning is an optimal time for this step

Step 3: Moisturizer
• Recommend options based on skin type (e.g., lightweight for oily, creamier for dry)
• Locks in the benefits of ${config.productName}

Step 4: SPF Protection
• Always finish with broad-spectrum SPF 30+
• Explain how it protects the skin and preserves results

Evening Routine (PM)

Step 1: Double Cleanse
• Oil-based cleanser first (if wearing makeup or sunscreen)
• Follow with a water-based cleanser

Step 2: ${config.productName} Application
• Evening application tips specific to ${config.productName}
• How to layer it with other actives
• List ingredients or products it should not be mixed with

Step 3: Treatment Products (if applicable)
• Suggestions for serums, retinol, or other targeted treatments
• Indicate proper order of application when combined with ${config.productName}

Step 4: Night Moisturizer
• Recommend a richer, more nourishing formula for overnight repair
• Explain how it seals in the previous steps

Pro Tips
• Start with ${config.productName} slowly (e.g., 2–3 times per week, then increase)
• Always patch test before regular use
• Pay attention to how your skin reacts and adjust accordingly
• Consistency over time produces better results

Timeline for Results
• Week 1–2: Skin adjustment period mild changes and possible sensitivity
• Week 4–6: Noticeable initial improvements
• Week 8–12: Significant, more stable results

Writing Guidelines:
• Use clear, simple, specific language, appropriate for skincare enthusiasts building an effective routine.
• Use active voice only.
• Write short, declarative sentences that are easy to follow and understand.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.

Tone & Target:
• Tone: ${config.tone} and educational confident but approachable
• Target Audience: Skincare enthusiasts who want to build an effective, balanced routine with ${config.productName} as the star player in both AM and PM routines.

Your goal is to equip viewers with a clear, practical skincare routine that makes ${config.productName} central to their results, while keeping the guide easy to follow and realistic.`;

  return {
    systemPrompt: `You are an expert skincare content creator specializing in skincare product reviews and routines for social media.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}
function generateBeautyComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateBeautyRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generateTechShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, impactful review script for the tech product "${config.productName}", designed for a 30–60 second social media video.

Your task is to help viewers quickly understand why ${config.productName} stands out, by presenting clear, specific information about its key features, performance, user experience, and value, while avoiding vague claims and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script — do not reuse the same one repeatedly.

Examples:
• "Still using outdated tech instead of ${config.productName}? You're missing out."
• "Most people overlook ${config.productName} — here's why they shouldn't."
• "Stop buying devices before you know this about ${config.productName}."
• "Think ${config.productName} is like every other gadget? Think again."
• "Is ${config.productName} worth the money? Let's check."
• "Not upgrading to ${config.productName} yet? You're slowing yourself down."

2. Key features and specifications
List 3–4 specific, factual features or specs that make the product stand out.
Include technical and functional details, such as:
• Performance specs (e.g., processor type, RAM, refresh rate, storage)
• Build quality (e.g., materials, weight, dimensions, durability)
• Display or interface details (e.g., OLED touchscreen, customizable keys)
• Connectivity options (e.g., Wi-Fi 6E, Thunderbolt ports, Bluetooth version)
• Battery life and charging (if applicable)
• Software features or OS integrations (e.g., cross-device syncing, AI-powered tools)

Avoid vague statements like "great features" — be specific.

3. Honest assessment of performance and user experience
Give a clear, concise evaluation of how it performs in real use.

Examples:
• "Responsive even under heavy multitasking."
• "Comfortable to use for long sessions thanks to ergonomic design."
• "Runs quietly but gets warm under load."
• "User-friendly setup with intuitive menus."

4. Competitors or alternatives (if relevant)
Briefly mention a comparable product or alternative if relevant.

Examples:
• "Compared to similar devices, it offers more storage but less battery life."
• "If you prefer a smaller option, consider alternatives as well."

5. Value proposition and target audience
Explain who this product is best for and why it's worth its price.

Examples:
• "Best for professionals who need reliable performance on the go."
• "Ideal for gamers looking for high refresh rates without breaking the bank."
• "Great choice for students who need portability and long battery life."

Also include 2–3 specific use cases showing its value:
• "Editing videos in 4K without lag."
• "Streaming and gaming simultaneously."
• "Working remotely with seamless video calls and document sharing."

6. Motivational call-to-action
End with a clear, engaging question or invitation that works naturally with affiliate links.
Always pick a different CTA each time — do not reuse the same one repeatedly.

Examples:
• "Ready to upgrade your setup?"
• "Think this fits your workflow?"
• "What would you use it for first?"
• "How would this improve your day?"
• "Is your current tech holding you back?"
• "When are you making the switch?"

Writing Guidelines:
• Use clear, simple, specific language, accessible even when discussing technical specs.
• Use active voice only.
• Write short, declarative sentences that are easy to speak and understand.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.

Length & Structure:
• Target 100–170 words, spoken naturally in 30–60 seconds.
• Structured clearly for on-camera delivery or voice-over.
• Smooth transitions between sections, but keep sentences crisp and impactful.

Your goal is to equip viewers with clear, actionable reasons to consider ${config.productName}, demonstrate how it fits their needs, and end with a direct question or recommendation that prompts them to act.`;

  return {
    systemPrompt: `You are an expert tech content creator specializing in technology product reviews for social media.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}
function generateTechComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateTechRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generateTravelShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, inspiring review script for the travel product "${config.productName}", designed for a 30–60 second social media travel video.

Your task is to help viewers see how ${config.productName} enhances their travels by presenting clear, specific information about its features, problem-solving benefits, and value, while avoiding vague claims and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script do not reuse the same one repeatedly.

Examples:
• "Still traveling without ${config.productName}? You're making it harder than it needs to be."
• "Most travelers ignore ${config.productName} — here's why that's a mistake."
• "Stop packing your bag before you know this about ${config.productName}."
• "Think ${config.productName} is optional? Not if you value comfort."
• "Is ${config.productName} worth it? Let's find out."
• "Not using ${config.productName} yet? You're missing out on smarter travel."

2. Key features and benefits
List 3–4 specific, factual features or benefits that make ${config.productName} essential for travelers.
Include details such as:
• Practical features (e.g., compact, lightweight, expandable)
• Comfort enhancements (e.g., ergonomic design, breathable materials)
• Organizational advantages (e.g., dedicated compartments, anti-theft zippers)
• Travel conveniences (e.g., TSA-compliant, quick-access pockets, water-resistant coating)

3. Solving travel pain points
Explain how the product addresses common travel challenges or improves the experience.

Examples:
• "Keeps essentials organized and easy to reach at airports."
• "Prevents back pain during long treks."
• "Helps you stay within airline weight limits."
• "Protects valuables from pickpockets in crowded places."

4. Practical specifications
Provide travel-relevant specs to help viewers evaluate fit and usability.

Examples:
• Size and weight (e.g., fits under seat, weighs under 1 pound)
• Packability (e.g., folds flat when not in use)
• Durability (e.g., tear-resistant fabric, reinforced stitching)
• Compatibility (e.g., slips over suitcase handles, TSA-approved dimensions)

5. Audience and trip types
State who benefits most from this product and what types of trips it suits.

Examples:
• "Perfect for backpackers needing to save space."
• "Great for business travelers who value organization and efficiency."
• "Best for families keeping everyone's items sorted and secure."
• "Ideal for long-haul flights and international trips where comfort matters."

6. Motivational call-to-action
End with a clear, wanderlust-inspiring question or recommendation that works naturally with affiliate links.
Always pick a different CTA each time do not reuse the same one repeatedly.

Examples:
• "Ready to make your next trip easier?"
• "Where would you take this first?"
• "Think this belongs in your carry-on?"
• "What journey would you use it on?"
• "When are you upgrading your travel gear?"
• "What adventure will you pack it for?"

Writing Guidelines:
• Use clear, simple, specific language, accessible yet inspiring.
• Write short, declarative sentences that are easy to speak and understand.
• Use active voice only.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.

Length & Structure:
• Target 100–170 words, spoken naturally in 30–60 seconds.
• Structured clearly for on-camera delivery or voice-over.
• Smooth transitions between sections, but keep sentences crisp and impactful.

Your goal is to give viewers clear, actionable reasons to consider ${config.productName}, show how it solves their travel challenges, and end with a motivating question or suggestion that sparks wanderlust.`;

  return {
    systemPrompt: `You are an expert travel content creator specializing in travel product reviews for social media.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}
function generateTravelComparison(config: PromptConfig): GeneratedPrompt {
  return generateUniversalComparison(config);
}
function generateTravelRoutine(config: PromptConfig): GeneratedPrompt {
  return generateUniversalRoutine(config);
}
function generatePetShortVideo(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, caring review script for the pet product "${config.productName}", designed for a 30–60 second social media pet video.

Your task is to help pet owners understand exactly why ${config.productName} benefits their furry friend, by presenting clear, specific information about its safety, effectiveness, and value, while avoiding vague claims and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script do not reuse the same one repeatedly.

Examples:
• "Still not using ${config.productName} for your pet? You're missing out."
• "Most pet owners overlook ${config.productName} — here's why that's a mistake."
• "Stop buying pet products before you know this about ${config.productName}."
• "Think ${config.productName} is just another pet product? Think again."
• "Is ${config.productName} worth it for your furry friend? Let's see."
• "Not trying ${config.productName} yet? Your pet deserves better."

2. Key benefits and safety features
List 3–4 specific, factual benefits that make ${config.productName} valuable for pets.
Include details such as:
• Health benefits (e.g., improves digestion, supports joint health, promotes dental hygiene)
• Safety features (e.g., non-toxic materials, vet-approved ingredients, allergy-friendly)
• Behavioral improvements (e.g., reduces anxiety, encourages exercise, mental stimulation)
• Quality standards (e.g., made in USA, organic ingredients, durable construction)
• Age/size suitability (e.g., safe for puppies, designed for large breeds, senior pet friendly)

3. Solving common pet problems
Explain how the product addresses typical pet owner challenges or improves pet wellbeing.

Examples:
• "Reduces destructive behavior when pets are bored."
• "Helps with separation anxiety during work hours."
• "Makes grooming easier and stress-free for both of you."
• "Keeps pets entertained while promoting healthy exercise."
• "Simplifies training with positive reinforcement."

4. Veterinarian endorsement or testing
Briefly mention any professional backing, safety testing, or expert recommendations if applicable.

Examples:
• "Veterinarian-recommended for daily use."
• "Tested for safety and approved by pet nutritionists."
• "Used by professional dog trainers nationwide."
• "Meets all safety standards for pet products."

Skip this section if not applicable, but do not fabricate claims.

5. Target pets and situations
State clearly what types of pets and situations benefit most from this product.

Examples:
• "Perfect for active dogs who need mental stimulation."
• "Ideal for cats with sensitive stomachs."
• "Best for senior pets needing joint support."
• "Great for puppies learning basic commands."
• "Designed for indoor pets needing more exercise."

6. Pet parent call-to-action
End with a clear, heartwarming question or invitation addressed directly to the pet owner.
Always pick a different CTA each time do not reuse the same one repeatedly.

Examples:
• "Ready to spoil your furry friend?"
• "Think your pet would love this?"
• "What would your pet's reaction be?"
• "When are you treating your best friend?"
• "Does your pet deserve this upgrade?"
• "How happy would this make your fur baby?"

Writing Guidelines:
• Use clear, simple, specific language that appeals to loving pet owners.
• Write short, declarative sentences that are easy to speak and understand.
• Use active voice only.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.

Length & Structure:
• Target 100–170 words, spoken naturally in 30–60 seconds.
• Structured clearly for on-camera delivery or voice-over.
• Smooth transitions between sections, but keep sentences crisp and impactful.

Your goal is to give pet owners clear, actionable reasons to consider ${config.productName}, show how it benefits their pet's health and happiness, and end with a loving question that prompts them to act for their furry friend.`;

  return {
    systemPrompt: `You are an expert pet content creator specializing in pet product reviews for social media.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
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

// Export the registry for testing and validation
export { TEMPLATE_REGISTRY };

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

