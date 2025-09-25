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
 * NEW GLOWBOT PROMPT TEMPLATES FROM PDF - COMPLETE OVERHAUL
 */
export const TEMPLATE_PROMPTS = {
  // NICHE-SPECIFIC TEMPLATES
  'fashion': (config: PromptConfig): GeneratedPrompt => {
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
  },

  'fitness': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert fitness content creator specializing in product reviews for workouts and wellness.`,
    userPrompt: `Write a direct, impactful review script for the fitness product "${config.productName}", intended for a 30–60 second social media video about workouts or wellness.

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

Your goal is to equip viewers with clear, actionable reasons to consider ${config.productName}, show how it improves their training, and end with a direct, motivating question that encourages them to take action.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'food': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert culinary content creator specializing in food product reviews for social media.`,
    userPrompt: `Write a direct, impactful review script for the food product "${config.productName}", intended for a 30–60 second social media culinary video.

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
• "Mix into trending dishes like [example] from [source]."

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

Your goal is to give viewers clear, actionable reasons to consider ${config.productName}, help them picture how it tastes and fits into their meals, and end with a direct, mouthwatering question that prompts them to act.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'skincare': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert skincare content creator specializing in comprehensive routine guides and product education.`,
    userPrompt: `Write a comprehensive, actionable skincare routine guide featuring "${config.productName}", designed for a morning and night routine breakdown.

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

Your goal is to equip viewers with a clear, practical skincare routine that makes ${config.productName} central to their results, while keeping the guide easy to follow and realistic.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'tech': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert tech content creator specializing in product reviews for social media.`,
    userPrompt: `Write a direct, impactful review script for the tech product "${config.productName}", designed for a 30–60 second social media video.

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
• "Compared to [competitor], it offers more storage but less battery life."
• "If you prefer a smaller option, consider [alternative] as well."

5. Value proposition and target audience
Explain who this product is best for and why it's worth its price.

Examples:
• "Best for professionals who need reliable performance on the go."
• "Ideal for gamers looking for high refresh rates without breaking the bank."
• "Great choice for students who need portability and long battery life."

Also include 2–3 specific use cases showing its value.

Examples:
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

Your goal is to equip viewers with clear, actionable reasons to consider ${config.productName}, demonstrate how it fits their needs, and end with a direct question or recommendation that prompts them to act.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'travel': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert travel content creator specializing in product reviews for social media.`,
    userPrompt: `Write a direct, inspiring review script for the travel product "${config.productName}", designed for a 30–60 second social media travel video.

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

Your goal is to give viewers clear, actionable reasons to consider ${config.productName}, show how it solves their travel challenges, and end with a motivating question or suggestion that sparks wanderlust.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  // UNIVERSAL TEMPLATES
  'affiliate_email': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert email marketing specialist creating affiliate email blurbs that drive conversions.`,
    userPrompt: `You are writing a direct, persuasive affiliate email blurb for "${config.productName}" in the ${config.niche} niche.

Your task is to write a concise, compelling email section that gets readers to click through and make a purchase, by presenting clear benefits and creating urgency while avoiding spam-like language.

The email blurb must include these components:

1. Subject Line
• Write a compelling email subject line (40–50 characters) that creates curiosity or urgency
• Make it specific to ${config.productName} and the benefit it offers
• Avoid spam trigger words like "FREE," "LIMITED TIME," etc.

Examples:
• "The ${config.productName} that changed everything"
• "Finally, a ${config.productName} that actually works"
• "This ${config.productName} solves your biggest problem"

2. Opening Hook
• Start with a relatable problem, question, or statement your audience will immediately connect with
• Mention ${config.productName} naturally within the first 2 sentences

3. Key Benefits
• List 2–3 specific, tangible benefits that ${config.productName} provides
• Focus on outcomes and results rather than just features
• Use concrete language and avoid vague claims

4. Social Proof (if applicable)
• Include a brief mention of reviews, testimonials, or popularity
• Use specific numbers or phrases if available

Examples:
• "Over 10,000 customers love this"
• "Rated 4.8 stars by verified buyers"
• "Recommended by industry experts"

5. Call-to-Action
• Create urgency without being pushy
• Make the next step clear and easy
• Include affiliate disclosure naturally

Examples:
• "Check it out here (affiliate link)"
• "See why everyone's talking about it — link in comments"
• "Learn more about it here (I earn a small commission if you purchase)"

Writing Guidelines:
• Use conversational, friendly language that feels personal
• Write in short paragraphs (2–3 sentences max)
• Use active voice and direct statements
• Avoid pushy sales language or hype
• Include natural affiliate disclosure
• Target 100–150 words total

Tone: ${config.tone} — conversational and trustworthy
Audience: Email subscribers interested in ${config.niche} products who trust your recommendations

Your goal is to create an email blurb that feels like a genuine recommendation from a friend, builds trust, and motivates readers to click through and purchase ${config.productName}.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'influencer_caption': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert social media content creator specializing in influencer-style captions.`,
    userPrompt: `You are writing an engaging, authentic social media caption featuring "${config.productName}" in the ${config.niche} niche.

Your task is to create a caption that feels genuine and relatable while showcasing the product naturally, driving engagement, and encouraging followers to take action.

The caption must include these components:

1. Hook/Opening
• Start with an attention-grabbing statement, question, or relatable scenario
• Make it immediately engaging and scroll-stopping
• Naturally introduce ${config.productName} within the first few lines

Examples:
• "Okay, I need to tell you about ${config.productName}..."
• "Can we talk about how ${config.productName} just changed my life?"
• "If you're still not using ${config.productName}, this is your sign"

2. Personal Story/Experience
• Share a brief, authentic-feeling personal experience with ${config.productName}
• Include specific details that make it feel real
• Focus on the transformation or benefit you experienced

3. Product Benefits
• Highlight 2–3 key benefits in a natural, conversational way
• Avoid sounding like a commercial — make it feel like you're talking to a friend
• Include specific results or improvements

4. Call-to-Action
• Ask an engaging question to drive comments
• Encourage followers to share their experiences
• Include clear direction for how to get the product

Examples:
• "Have you tried this? Let me know in the comments!"
• "Tag someone who needs this in their life"
• "Link in bio to grab yours (use my code for 10% off)"

5. Hashtags
• Include 5–8 relevant hashtags that blend popular and niche-specific
• Mix branded hashtags with community hashtags
• Keep them natural and not overwhelming

Writing Guidelines:
• Use conversational, authentic language
• Include casual interjections and personality
• Write in the first person as if sharing with friends
• Break up text with line breaks for readability
• Use emojis sparingly but strategically
• Target 100–200 words

Tone: ${config.tone} — authentic, relatable, and enthusiastic
Audience: Social media followers interested in ${config.niche} content who trust influencer recommendations

Your goal is to create a caption that feels like a genuine recommendation from a trusted friend, encourages engagement, and drives action while seamlessly featuring ${config.productName}.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'product_comparison': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert product comparison specialist creating detailed comparison guides for consumers.`,
    userPrompt: `You are writing a comprehensive product comparison guide featuring "${config.productName}" in the ${config.niche} niche.

Your task is to create a clear, unbiased comparison that helps readers understand exactly how ${config.productName} stacks up against alternatives, giving them the information they need to make an informed purchase decision.

The comparison guide must include these sections:

1. Introduction and Context
• Briefly introduce the product category and why choosing the right one matters
• Set up the comparison by explaining what criteria matter most
• Introduce ${config.productName} and 1–2 main competitors

2. Head-to-Head Comparison
Create a clear comparison using these categories:

Features & Specifications
• List key features side-by-side
• Include technical specs, dimensions, materials, etc.
• Highlight unique features of each product

Performance & Quality
• Compare actual performance in real-world use
• Include durability, reliability, and build quality
• Note any testing results or certifications

Price & Value
• Compare pricing across different retailers
• Calculate cost-per-use or cost-per-benefit if applicable
• Discuss warranty, return policies, and long-term value

User Experience
• Compare ease of use, setup, maintenance
• Include learning curve and user-friendliness
• Note any special skills or tools required

3. Pros and Cons Summary
For each product, list:
• Top 3 advantages
• Top 2–3 disadvantages
• Best use cases

4. Bottom Line Recommendation
• Clearly state which product wins in which scenarios
• Provide specific recommendations based on user needs:
  - "Best for beginners: [Product] because..."
  - "Best value: [Product] because..."
  - "Best premium option: [Product] because..."

5. Final Verdict
• Give your overall recommendation
• Explain why ${config.productName} may be the best choice for most users
• Include affiliate disclosure if applicable

Writing Guidelines:
• Use clear, objective language
• Support claims with specific facts and details
• Maintain fairness while highlighting ${config.productName}'s strengths
• Use headings and bullet points for easy scanning
• Target 600–800 words

Tone: ${config.tone} — informative, trustworthy, and helpful
Audience: Consumers researching ${config.niche} products who want detailed information before purchasing

Your goal is to create a comprehensive comparison that builds trust, provides genuine value, and positions ${config.productName} as the smart choice for the right buyer.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'routine_kit': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert routine builder creating comprehensive guides that help users integrate products into effective daily regimens.`,
    userPrompt: `You are writing a complete routine guide featuring "${config.productName}" as a key component in the ${config.niche} niche.

Your task is to create a detailed, actionable routine that shows readers exactly how to use ${config.productName} effectively as part of a comprehensive daily or weekly regimen, maximizing results through proper sequencing and timing.

The routine guide must include these sections:

1. Introduction and Goals
• Explain the purpose and benefits of this routine
• Set clear expectations for results and timeline
• Introduce ${config.productName} and its role in the routine

2. Complete Routine Breakdown

Morning Routine
• Step-by-step morning routine including ${config.productName}
• Proper timing and order of each step
• Estimated time commitment

Evening Routine
• Evening routine incorporating ${config.productName}
• Products or practices that complement it
• Preparation for the next day

Weekly/Special Routines (if applicable)
• Any weekly deep treatments or special practices
• How to adjust routine based on needs
• Seasonal or periodic modifications

3. Product Sequencing and Timing
• Explain why the order matters
• Detail wait times between steps if applicable
• Tips for maximizing absorption/effectiveness

4. Complementary Products and Practices
• Recommend 2–3 products that work well with ${config.productName}
• Suggest lifestyle practices that enhance results
• Products or practices to avoid while using this routine

5. Customization Options
• How to adapt the routine for different needs:
  - Beginners vs. experienced users
  - Different skin types/fitness levels/budgets
  - Time-constrained vs. comprehensive versions

6. Timeline and Expectations
• Week 1–2: What to expect during adjustment period
• Month 1: Initial results and changes
• Month 2–3: Optimal results timeline
• Long-term maintenance approach

7. Troubleshooting Tips
• Common mistakes and how to avoid them
• What to do if you miss days or steps
• Signs the routine is working vs. needs adjustment

Writing Guidelines:
• Use clear, step-by-step language
• Include specific timing and amounts
• Make it easy to follow and implement
• Use bullet points and numbered lists for clarity
• Target 500–700 words

Tone: ${config.tone} — knowledgeable, encouraging, and practical
Audience: People interested in ${config.niche} who want a complete, effective routine featuring ${config.productName}

Your goal is to create a comprehensive routine guide that makes ${config.productName} essential to the user's success, while providing genuine value through detailed implementation guidance.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'seo_blog': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert SEO content writer specializing in comprehensive blog posts that rank well in search engines.`,
    userPrompt: `You are writing a comprehensive, SEO-optimized blog post featuring "${config.productName}" in the ${config.niche} niche.

Your task is to write a 1000+ word article that is informative, persuasive, easy to read, and optimized for search engines — while remaining authentic and helpful to readers.

Follow this exact structure and meet all quality standards and rules below:

## Structure & Components

### Title
• Write an SEO-friendly title (50–60 characters) that includes the main keyword naturally
• Make it clear, specific, and attention-grabbing

Example:
"How ${config.productName} Can Transform Your ${config.niche} Routine"

### Introduction (150–200 words)
• Hook the reader with a compelling opening — a relatable question, surprising fact, or strong statement
• Briefly introduce ${config.productName} and its main benefits
• Preview what the reader will learn in the article

### Main Content Sections (700–800 words)

**Product Overview and Key Features**
• Explain what ${config.productName} is
• Highlight its most important features clearly

**How It Works and Why It's Effective**
• Describe the mechanism or principles behind ${config.productName}
• Back up claims with specific details and reasoning

**Benefits and Results Users Can Expect**
• Outline the tangible benefits for users
• Include realistic expectations and timelines where relevant

**Who This Product Is Best For**
• Describe the target audience and ideal use cases
• Mention scenarios where it may not be the best fit

**Comparison With Alternatives (if relevant)**
• Compare ${config.productName} to 1–2 popular alternatives
• Explain what makes ${config.productName} unique or preferable

**Tips for Best Results**
• Share actionable tips to maximize results with ${config.productName}
• Include common mistakes to avoid

Use clear H2 and H3 subheadings to organize sections.

### Conclusion (100–150 words)
• Summarize the main points concisely
• Reinforce the value of ${config.productName}
• Include a clear call-to-action (e.g., learn more, try it today)
• Add affiliate disclosure if required (e.g., "This post contains affiliate links.")

## SEO & Content Quality Standards
• Use ${config.productName} name naturally and repeatedly — without keyword stuffing
• Include related keywords and LSI terms throughout the article
• Break up text with clear, descriptive subheadings (H2, H3)
• Keep paragraphs short (maximum 3 sentences each)
• Use bullet points or numbered lists where appropriate to improve readability
• Ensure the article is scannable, mobile-friendly, and easy to digest

## Tone & Audience
Tone: ${config.tone} — engaging, credible, and approachable
Target Audience: People interested in ${config.niche} products who want trustworthy, detailed, and actionable information

## Goal
Deliver a 1000+ word blog post that ranks well on search engines, builds reader trust, and motivates them to take the next step — while being clear, informative, and enjoyable to read.

## Additional Rules
• Avoid metaphors and clichés
• Avoid generalizations
• Do not include common setup language in any sentence, including: in conclusion, in closing, etc.
• Do not output warnings or notes — just deliver the requested content
• Do not use hashtags
• Do not use semicolons
• Do not use emojis
• Do not use asterisks
• Keep the writing specific, factual, and free from fluff`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'short_video': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are a short-form video script writer creating content for TikTok, Instagram Reels, and YouTube Shorts.`,
    userPrompt: `You are a short-form video script writer creating content for TikTok, Instagram Reels, and YouTube Shorts about "${config.productName}" in the ${config.niche} niche.

Your task is to write a 15–60 second video script that is authentic, fast-paced, and designed to go viral — showcasing the product naturally in a relatable and engaging way.

Follow this exact structure and meet all quality standards and rules below:

## Structure & Components

### Hook (0–3 seconds)
• Start with a strong, attention-grabbing statement or question
• Make viewers curious and eager to keep watching

Examples:
• "This ${config.productName} changed my life…"
• "POV: You discover the secret to ${config.niche}…"

### Main Content (3–45 seconds)
• Briefly introduce ${config.productName}
• Highlight 3–5 key benefits or features, phrased to resonate with the audience
• Describe visual elements that should accompany each point ("show, don't tell")
• Keep the pacing energetic and concise — avoid long explanations

### Call-to-Action (45–60 seconds)
• Clearly tell viewers what to do next (e.g., visit link in bio, leave a comment, follow for more)
• Include an engagement prompt like a question or challenge

Examples:
• "Comment if you'd try this!"
• "Follow for more ${config.niche} tips!"

## Video Elements to Include
• Text overlays for key benefits and messages
• Suggest 1–2 trending audio tracks relevant to the ${config.niche}
• Describe recommended visual cues, transitions, and pacing
• Suggest 5–7 hashtags blending popular, niche-specific, and branded (if available)

Example hashtags:
#${config.niche} #${config.productName} #lifehack #trendingnow #musttry #foryou #viral

## Content Quality Standards
• Tone: ${config.tone} — energetic, relatable, and engaging without being overhyped
• Target Audience: Social media users interested in ${config.niche} content looking for authentic and actionable ideas
• Keep language simple, direct, and friendly
• Ensure the script feels like native social content, not a commercial
• Keep it mobile-friendly, easy to follow, and visually engaging

## Goal
Deliver a short-form video script (15–60 seconds) that hooks viewers immediately, maintains their attention, showcases ${config.productName} effectively, and motivates them to engage and take action — while feeling authentic, shareable, and relevant to the platform.

## Additional Rules
• Avoid metaphors and clichés
• Avoid generalizations
• Do not include common setup language in any sentence, including: in conclusion, in closing, etc.
• Do not output warnings or notes — just deliver the requested content
• Do not use hashtags inside the script text — only include them in the Video Elements section
• Do not use semicolons
• Do not use emojis
• Do not use asterisks
• Keep the writing specific, factual, and free from fluff`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  })
};

/**
 * PLATFORM-SPECIFIC PROMPT GENERATORS
 */
export const PLATFORM_PROMPTS = {
  tiktok: (config: PromptConfig): string => `
Create a TikTok-native caption for "${config.productName}" (${config.niche} niche).

Style: ${config.contentFormat === 'spartan' ? 'Professional, no emojis, direct language' : 'Viral TikTok slang, trending phrases, emojis'}
Tone: ${config.tone}

Requirements:
- Hook in first line
- ${config.contentFormat === 'spartan' ? 'Professional language' : 'Use TikTok slang (POV:, no bc, tell me why, etc.)'}
- ${config.contentFormat === 'spartan' ? 'No emojis' : '4-6 strategic emojis'}
- Trending hashtags
- Call-to-action
- ${config.contentFormat === 'spartan' ? 'Amazon Associates disclosure' : 'Link in bio direction'}

Respond with TikTok caption only.`,

  instagram: (config: PromptConfig): string => `
Create an Instagram-optimized caption for "${config.productName}" (${config.niche} niche).

Style: ${config.contentFormat === 'spartan' ? 'Clean, professional, minimal emojis' : 'Aesthetic lifestyle integration'}
Tone: ${config.tone}

Requirements:
- Lifestyle integration
- ${config.contentFormat === 'spartan' ? 'Professional language, max 2 emojis' : '2-3 strategic emojis'}
- Clean call-to-action
- Strategic hashtags
- ${config.contentFormat === 'spartan' ? 'Amazon Associates disclosure' : 'Link in bio or story direction'}

Respond with Instagram caption only.`,

  youtube: (config: PromptConfig): string => `
Create a YouTube Shorts script for "${config.productName}" (${config.niche} niche).

Style: ${config.contentFormat === 'spartan' ? 'Educational, fact-focused' : 'Engaging voiceover with emphasis markers'}
Tone: ${config.tone}

Requirements:
- Written as voiceover script
- ${config.contentFormat === 'spartan' ? 'Clear, factual presentation' : 'Use *emphasis* markers for key points'}
- Educational approach
- ${config.contentFormat === 'spartan' ? 'Professional presentation' : 'Engaging storytelling'}
- Clear description direction

Respond with YouTube script only.`,

  twitter: (config: PromptConfig): string => `
Create a Twitter/X post for "${config.productName}" (${config.niche} niche).

Style: ${config.contentFormat === 'spartan' ? 'Professional, concise' : 'Witty, conversation-starting'}
Tone: ${config.tone}

Requirements:
- Under 280 characters
- ${config.contentFormat === 'spartan' ? 'Professional, direct language' : 'Witty hot takes, clever angles'}
- Conversation starter
- ${config.contentFormat === 'spartan' ? 'No emojis' : 'Strategic emoji use'}
- Relevant hashtags

Respond with Twitter post only.`
};

/**
 * MAIN PROMPT FACTORY FUNCTION
 */
export async function createPrompt(config: PromptConfig): Promise<GeneratedPrompt> {
  // Get template-specific prompt
  const templateGenerator = TEMPLATE_PROMPTS[config.templateType as keyof typeof TEMPLATE_PROMPTS] || TEMPLATE_PROMPTS['short_video'];
  
  return templateGenerator(config);
}

/**
 * SYNCHRONOUS PROMPT GENERATOR FOR TRANSPARENCY
 */
export function generatePrompt(config: PromptConfig): GeneratedPrompt {
  // Get template-specific prompt
  const templateGenerator = TEMPLATE_PROMPTS[config.templateType as keyof typeof TEMPLATE_PROMPTS] || TEMPLATE_PROMPTS['short_video'];
  
  return templateGenerator(config);
}

/**
 * PLATFORM-SPECIFIC PROMPT CREATOR
 */
export async function createPlatformPrompt(platform: string, config: PromptConfig): Promise<string> {
  const platformGenerator = PLATFORM_PROMPTS[platform.toLowerCase() as keyof typeof PLATFORM_PROMPTS] || PLATFORM_PROMPTS.instagram;
  
  return platformGenerator(config);
}

/**
 * TONE ENHANCEMENT UTILITY
 */
export const TONE_MODIFIERS = {
  professional: 'authoritative, expert-level language with industry insights',
  enthusiastic: 'energetic, passionate language with exclamation points and power words',
  friendly: 'warm, conversational tone like talking to a close friend',
  casual: 'relaxed, everyday language with contractions and informal phrases',
  informative: 'educational, fact-driven content with clear explanations',
  persuasive: 'compelling, benefit-focused language with strong calls-to-action',
  humorous: 'light-hearted, funny content with clever wordplay and jokes',
  inspirational: 'motivational, uplifting language that encourages action',
  trustworthy: 'honest, transparent communication building credibility',
  trendy: 'current, up-to-date language using latest slang and references',
  luxury: 'sophisticated, premium language emphasizing exclusivity and quality'
};

/**
 * NICHE-SPECIFIC ENHANCEMENT
 */
export const NICHE_CONTEXTS = {
  beauty: 'skincare routines, makeup techniques, beauty trends, self-care rituals',
  tech: 'gadget features, technology benefits, innovation highlights, user experience',
  fashion: 'style trends, outfit coordination, fashion versatility, personal expression',
  fitness: 'workout routines, health benefits, performance improvement, lifestyle enhancement',
  food: 'taste profiles, nutritional benefits, cooking applications, meal planning',
  travel: 'adventure experiences, practical benefits, travel convenience, exploration enhancement',
  pets: 'pet care benefits, animal welfare, convenience for pet owners, bonding experiences'
};