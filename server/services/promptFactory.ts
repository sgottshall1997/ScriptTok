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
  productName?: string; // Optional for viral mode
  viralTopic?: string; // For viral mode instead of product
  contentMode?: 'viral' | 'affiliate'; // Content generation mode
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
• Target 70–140 words, spoken naturally in 30–60 seconds.
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
• Target 70-140 words, spoken naturally in 30–60 seconds.
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

function generateUniversalShortVideoScript(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a direct, impactful review script for the product "${config.productName}", designed for a 30–60 second social media video.

Your task is to help viewers understand exactly why this product is worth considering, by presenting clear, specific information about its features, benefits, and value, while avoiding vague claims and filler.

The script must include the following sections, in order:

1. Attention-grabbing hook
Start with a negative or surprising statement that mentions the product name and stops the viewer from scrolling.
Choose a different hook each time you write a new script do not reuse the same one repeatedly.

Examples:
• "Still using alternatives to ${config.productName}? You're missing out."
• "Most people overlook ${config.productName} — here's why they're wrong."
• "Stop buying products before you know this about ${config.productName}."
• "Wasting money on subpar options? Here's why ${config.productName} delivers."
• "Think ${config.productName} is overhyped? Think again."
• "Is ${config.productName} worth the investment? Let's find out."
• "Not using ${config.productName} yet? You're making things harder than necessary."

2. Key features and benefits
Highlight 2-3 specific features that make this product stand out from alternatives.
Focus on concrete benefits and measurable improvements.

Examples:
• "Advanced design that improves performance by X%"
• "Durable construction built to last X years"
• "User-friendly interface that saves X minutes daily"
• "Innovative technology that reduces X by X%"
• "Premium materials that enhance X significantly"
• "Compact size that fits X while delivering X performance"

3. Problem-solving and value proposition
Explain what problem this product solves and why it's better than other solutions.
Address common pain points and show clear value.

Examples:
• "Solves the frustrating problem of X that costs you time and money"
• "Unlike cheaper alternatives, this actually delivers on X promise"
• "Eliminates the need for multiple products by combining X, X, and X"
• "Prevents X issue that affects X% of users with similar products"
• "Provides professional-level results without the professional price tag"
• "Streamlines X process that typically takes X time down to X"

4. Target audience and use cases
Identify who this product is perfect for and specific situations where it excels.
Be specific about user types and scenarios.

Examples:
• "Perfect for busy professionals who need X without X hassle"
• "Ideal for beginners looking to achieve X results quickly"
• "Essential for anyone who regularly X and wants to improve X"
• "Great for households that X and need reliable X"
• "Best choice for enthusiasts who demand X quality and X performance"
• "Suited for people who X daily and want to optimize their X"

5. Motivational call-to-action
End with a clear, compelling question or challenge addressed directly to the viewer.
Always choose a different CTA each time do not reuse the same one repeatedly.

Examples:
• "Ready to upgrade your X game?"
• "What's stopping you from trying this?"
• "Think this could solve your X problem?"
• "When's the last time you invested in quality X?"
• "What would you do with the X you'd save?"
• "Your move — are you ready to make the switch?"
• "How much longer will you settle for less?"

Writing Guidelines:
• Use clear, simple, specific language that works across all product categories.
• Write short, declarative sentences that are easy to speak and understand.
• Use active voice only.
• Avoid metaphors, clichés, and vague statements.
• Do not use filler words such as: really, very, literally, actually, certainly, probably, basically, maybe.
• Do not use generalizations or emotional exaggerations.
• Do not include disclaimers, notes, or instructions in the output.
• Do not include hashtags, emojis, or asterisks.
• Keep content universal and product-focused without niche-specific jargon.

Length & Structure:
• Target 70-140 words, spoken naturally in 30–60 seconds.
• Structured clearly for on-camera delivery or voice-over.
• Smooth transitions between sections, but keep sentences crisp and impactful.
• Make it conversion-oriented and professional across all product types.

Your goal is to give viewers clear, actionable reasons to consider buying ${config.productName}, help them understand its value and fit for their needs, and end with a direct question that prompts them to take action.`;

  return {
    systemPrompt: `You are an expert content creator specializing in comprehensive product reviews for social media across all categories.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalComparison(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write an objective, informative, and persuasive product comparison between ${config.productName} and its top alternative in the ${config.niche} niche.

Your task is to help readers make an informed decision by clearly presenting strengths, weaknesses, and recommendations — written like advice from a knowledgeable, trusted expert, not a sales pitch.

The comparison must include the following components, in this exact structure, with the quality controls and rules below:

Structure & Components

Title
Write a clear, specific title in the format:
"${config.productName} vs [Alternative]: Which is Better for [Target Audience]?"

Example:
"Product A vs Product B: Which is Better for Busy Parents?"

Quick Summary (50–75 words)
• Briefly introduce both products.
• Highlight the most important difference between them.
• Give an immediate, actionable recommendation.

Just an example — don't always use this exact phrasing:
"Both ${config.productName} and its main competitor offer excellent solutions for ${config.niche}, but they differ in price and ease of use. ${config.productName} shines for beginners thanks to its simplicity, while the alternative suits advanced users seeking more features. If you value convenience over customization, ${config.productName} is the better choice."

Product Story (2–4 sentences each)

${config.productName}
• Describe its main advantages with specific details (4–6 points: features, price, results, unique qualities).
• Then list its drawbacks honestly (2–4 points).

Alternative
• Describe its main advantages with specific details (4–6 points).
• Then list its drawbacks honestly (2–4 points).

Use clear, specific, and balanced language throughout.

Key Comparison Points
Address these five points explicitly and compare both products in each:
• Price: Which offers better value
• Quality: Compare materials, build, or formulation
• Results: Which delivers better outcomes
• Ease of Use: Which is more user-friendly
• Brand Reputation: Which is more trusted

Example:
"When it comes to price, ${config.productName} is more affordable without sacrificing quality. The alternative feels more premium but comes at a higher cost."

Who Should Choose What
Clearly state who benefits more from ${config.productName}, with 2–3 specific scenarios.
Clearly state who benefits more from the alternative, with 2–3 specific scenarios.

Example:
"Choose ${config.productName} if you're new to ${config.niche}, value ease of use, or are on a budget. Choose [Alternative] if you need advanced features, don't mind paying more, or want a premium experience."

Final Verdict
• Declare the overall winner and justify your choice clearly.
• Identify which is the best value for money.
• Recommend which is better for beginners and which for experts.

Example:
"Overall, ${config.productName} wins for its accessibility and affordability, making it the best choice for beginners. However, the alternative offers superior customization for experienced users. For most people, ${config.productName} provides the best balance of value and performance."

Content Quality Controls

Tone: objective, professional, and helpful without being pushy.
Structure: clear, scannable sections with line breaks.
Avoid:
• Jargon, overhyping, clichés, fake urgency, or walls of text
• Metaphors and idioms
• Generalizations
• Common setup phrases such as in conclusion, in closing, etc.
• Warnings, notes, or disclaimers — just deliver the requested comparison.
• Hashtags, emojis, or asterisks
• Semicolons

Keep it mobile-friendly and easy to skim.
Back up claims with specific details wherever possible.

Target Audience

Readers comparing similar ${config.niche} products who value trustworthy, actionable advice and want to confidently choose what fits their needs best.

Goal

Write a balanced, informative, and actionable comparison that earns trust, motivates readers to make a choice, and helps them feel confident about their decision — while remaining objective, specific, and easy to read.`;

  return {
    systemPrompt: `You are an expert content creator specializing in product comparisons.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalRoutine(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `You are a ${config.niche} expert creating a comprehensive routine or kit guide featuring ${config.productName} as a key component.

Your task is to write an actionable, easy-to-follow, and persuasive guide that positions ${config.productName} as an essential part of a complete solution — written like advice from a trusted expert, not a sales pitch.

The guide must include the following components, in this exact structure, with the quality standards and rules below:

Structure & Components

Title
• Write a clear, specific, benefit-driven title in the format:
"The Ultimate [Morning/Evening/Daily] ${config.niche} Routine with ${config.productName}"

Example:
"The Ultimate Evening Skincare Routine with GlowSerum"

Introduction (2–3 sentences)
• Explain why having a routine or kit is important for ${config.niche}
• Describe how ${config.productName} fits into the bigger picture and its role in achieving the goal

Example:
"A consistent ${config.niche} routine is key to lasting results and confidence. ${config.productName} plays a crucial role by addressing the most important step effectively and seamlessly."

The Complete Routine/Kit

Step 1: Preparation/Foundation
• What to do first and why
• Products needed for this step
• Estimated time required

Step 2: Main Product Application
• How to use ${config.productName} correctly
• Best practices, tips, and common mistakes to avoid
• What results to expect immediately and over time

Step 3: Supporting Products
• List complementary products that enhance results
• Explain why these combinations are effective
• When to apply them within the routine

Step 4: Finishing Touches
• Final steps to lock in results or add polish
• Maintenance and consistency tips

Kit Shopping List
• ${config.productName} (featured item)
• [Supporting product 1]
• [Supporting product 2]
• [Supporting product 3]
• [Optional enhancement]

Routine Schedule
• Best time of day to follow this routine
• Recommended frequency (daily, weekly, etc.)
• Optional seasonal adjustments if relevant

Pro Tips for Success
• Common mistakes to avoid and how
• How to adapt the routine for different goals, needs, or skin types
• A brief troubleshooting guide for common issues

Results Timeline
• What readers can expect after the first use or first week
• Typical results after 30 days of consistent use
• Long-term benefits over months or beyond

Content Quality Standards

• Tone: ${config.tone} — professional, approachable, and helpful without being pushy
• Audience: ${config.niche} enthusiasts looking for a complete, trustworthy solution
• Keep it scannable with clear sections and line breaks
• Use specific, actionable language — avoid vague claims or jargon
• Back up claims with realistic expectations and practical advice

Goal

Deliver a detailed, actionable routine or kit guide that builds trust, makes readers feel confident, and shows exactly how to use ${config.productName} as part of a complete, effective ${config.niche} solution.

Additional Rules

• Avoid metaphors and clichés
• Avoid generalizations
• Do not include common setup language in any sentence, including: in conclusion, in closing, etc.
• Do not output warnings or notes — just deliver the requested content
• Do not use hashtags
• Do not use semicolons
• Do not use emojis
• Do not use asterisks
• Keep the writing specific, factual, and free from fluff`;

  return {
    systemPrompt: `You are an expert content creator specializing in routine and lifestyle content.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalInfluencerCaption(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write an engaging, authentic Instagram/social media caption about "${config.productName}" for the "${config.niche}" niche.

Your task is to help followers connect emotionally with the product and see its value through a relatable, personal recommendation written like advice from a trusted friend, not a sales pitch.

The caption must include the following components, in this exact structure, with the quality controls below:

Opening Hook (1–2 sentences)
• Start with a relatable, surprising, or vulnerable thought to grab attention.
• Frame it as something you'd naturally say to a close friend.
• Do not use any emojis.
• Examples to inspire:
• "I never thought I'd care about ${config.niche}… until this."
• "This small change completely transformed my ${config.niche} routine."
• "Why didn't anyone tell me about ${config.productName} sooner?"

Product Story (2–4 sentences)
• Share a specific, personal experience with ${config.productName} avoid vague general praise.
• Mention a clear before/after effect or situation.
• Use conversational language (e.g., "I was skeptical at first…") and avoid jargon.
• Example:
• "I started using ${config.productName} last month when my [problem] became too frustrating to ignore. At first, I doubted it would work, but now it's a non-negotiable part of my daily ${config.niche} routine. It has solved problems I didn't even realize I had."

Value & Benefits (2–3 sentences)
• Highlight what makes ${config.productName} stand out — beyond your personal story.
• Add one credibility marker (e.g., expert-recommended, thousands sold, viral).
• Address a common question or hesitation directly.
• Example:
• "What makes it special is how seamlessly it fits into even the busiest schedule. It's recommended by professionals and has over 10,000 five-star reviews, which reassured me before trying it."

Call-to-Action (1–2 sentences)
• End with a clear and specific action for followers to take.
• Encourage engagement by asking a question they can answer in the comments.
• Refer explicitly to the link in bio if applicable.
• Example:
• "Have you tried anything like this? Let me know what you think in the comments — and check the link in my bio if you want to see what I'm talking about."

Hashtag Strategy
• Include exactly 15–20 hashtags combining:
• 5–7 popular hashtags in ${config.niche}
• 5–7 niche-specific or micro-community hashtags
• 1–2 branded hashtags (if available)
• All hashtags must be relevant and appropriate for the platform.
• Place hashtags at the end, each separated by a space or line break.
• Example:
#${config.niche} #${config.productName} #affiliate #sponsored #trustedrecommendation #communityname #dailyinspo

Content Quality Controls

• Tone: ${config.tone} — relatable, warm, authentic, and persuasive without being pushy.
• Structure: Break into 2–4 short paragraphs with clear line breaks for readability.
• Do not include any emojis anywhere in the caption.
• Affiliate disclosure: Always include at the end (e.g., "#ad" or "#affiliate").
• Avoid: jargon, overhyping, clichés, fake urgency ("limited stock!!!"), or walls of text.
• Keep it skimmable on mobile — no large blocks of text.

Target Audience

• Social media followers interested in ${config.niche} who value trustworthy, relatable recommendations and want actionable, realistic advice.

Goal

Write a concise, authentic, and engaging caption that draws readers in, earns their trust, motivates them to engage (like, comment, share), and inspires them to click through — while keeping it free of emojis and easy to read.`;

  return {
    systemPrompt: `You are an expert social media content creator specializing in influencer-style captions.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalAffiliateEmail(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `Write a short, persuasive affiliate email blurb promoting "${config.productName}" for the "${config.niche}" niche.

Your task is to help readers see why ${config.productName} is worth their attention by presenting clear, relatable, and trustworthy information - written like a recommendation from a friend, not a sales pitch.

The email must include the following components, in this exact structure:

Subject Line Suggestions (provide 3 options - pick different ones each time):
• [Urgent] This ${config.niche} game-changer is flying off the shelves
• Why everyone's talking about ${config.productName}
• The ${config.niche} product that changed my [routine / life / perspective]

Email Content

Opening Hook (1–2 sentences):
• Start with a personal connection or relatable problem
• Create urgency or curiosity with an insider feel
• Make it clear why the reader should keep reading

Product Introduction (2–3 sentences):
• Introduce ${config.productName} naturally, not as an ad
• Share your discovery or experience briefly
• Highlight the main benefit or result readers care about most

Social Proof & Results (1–2 sentences):
• Include credibility markers (e.g., "used by thousands," "recommended by professionals")
• Mention results, testimonials, or popularity
• Add subtle scarcity or popularity signals (e.g., "selling fast," "back in stock")

Clear Call-to-Action (1–2 sentences):
• Direct link to ${config.productName} with clear wording (e.g., "Get yours here")
• Mention any special offer, bonus, or limited-time availability
• Create urgency without sounding pushy

P.S. Line
• Add a bonus tip, additional benefit, or urgency reminder in a friendly tone

Writing Guidelines

• Keep total email length under 150 words
• Write in a conversational, ${config.tone}, persuasive yet trustworthy style
• Use short, scannable paragraphs - easy to read on any device
• Include proper affiliate disclosure if relevant
• Avoid jargon, clichés, or overhyped claims
• Make it feel like personal advice, not a corporate email
• End with an engaging P.S. that adds value or urgency

Target Audience

• Email subscribers interested in ${config.niche} products, looking for honest recommendations that improve their experience.

Your goal is to write a concise, compelling email that builds trust, sparks curiosity, and motivates readers to click - while sounding like a personal, friendly recommendation.`;

  return {
    systemPrompt: `You are an expert email marketing content creator specializing in affiliate promotions.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  };
}

function generateUniversalSEOBlog(config: PromptConfig): GeneratedPrompt {
  const basePrompt = `You are an SEO content writer creating a comprehensive, engaging, and keyword-optimized blog post about ${config.productName} for the ${config.niche} niche.

Your task is to write a 1000+ word article that is informative, persuasive, easy to read, and optimized for search engines — while remaining authentic and helpful to readers.

Follow this exact structure and meet all quality standards and rules below:

Structure & Components

Title
• Write an SEO-friendly title (50–60 characters) that includes the main keyword naturally
• Make it clear, specific, and attention-grabbing

Example:
"How ${config.productName} Can Transform Your ${config.niche} Routine"

Introduction (150–200 words)
• Hook the reader with a compelling opening — a relatable question, surprising fact, or strong statement
• Briefly introduce ${config.productName} and its main benefits
• Preview what the reader will learn in the article

Main Content Sections (700–800 words)

Product Overview and Key Features
• Explain what ${config.productName} is
• Highlight its most important features clearly

How It Works and Why It's Effective
• Describe the mechanism or principles behind ${config.productName}
• Back up claims with specific details and reasoning

Benefits and Results Users Can Expect
• Outline the tangible benefits for users
• Include realistic expectations and timelines where relevant

Who This Product Is Best For
• Describe the target audience and ideal use cases
• Mention scenarios where it may not be the best fit

Comparison With Alternatives (if relevant)
• Compare ${config.productName} to 1–2 popular alternatives
• Explain what makes ${config.productName} unique or preferable

Tips for Best Results
• Share actionable tips to maximize results with ${config.productName}
• Include common mistakes to avoid

Use clear H2 and H3 subheadings to organize sections.

Conclusion (100–150 words)
• Summarize the main points concisely
• Reinforce the value of ${config.productName}
• Include a clear call-to-action (e.g., learn more, try it today)
• Add affiliate disclosure if required (e.g., "This post contains affiliate links.")

SEO & Content Quality Standards

• Use ${config.productName} name naturally and repeatedly — without keyword stuffing
• Include related keywords and LSI terms throughout the article
• Break up text with clear, descriptive subheadings (H2, H3)
• Keep paragraphs short (maximum 3 sentences each)
• Use bullet points or numbered lists where appropriate to improve readability
• Ensure the article is scannable, mobile-friendly, and easy to digest

Tone & Audience

Tone: ${config.tone} — engaging, credible, and approachable
Target Audience: People interested in ${config.niche} products who want trustworthy, detailed, and actionable information

Goal

Deliver a 1000+ word blog post that ranks well on search engines, builds reader trust, and motivates them to take the next step — while being clear, informative, and enjoyable to read.

Additional Rules

• Avoid metaphors and clichés
• Avoid generalizations
• Do not include common setup language in any sentence, including: in conclusion, in closing, etc.
• Do not output warnings or notes — just deliver the requested content
• Do not use hashtags
• Do not use semicolons
• Do not use emojis
• Do not use asterisks
• Keep the writing specific, factual, and free from fluff`;

  return {
    systemPrompt: `You are an expert SEO content writer specializing in product-focused blog posts.`,
    userPrompt: enhancePromptWithViralTemplate(basePrompt, config),
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
• Target 70–140 words, spoken naturally in 30–60 seconds.
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
• Target 70–140 words, spoken naturally in 30–60 seconds.
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
• Target 70–140 words, spoken naturally in 30–60 seconds.
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
• Target 70–140 words, spoken naturally in 30–60 seconds.
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
 * VIRAL TEMPLATE GENERATORS - For trending content without products
 */

// Viral Hooks Generator
function generateViralHooks(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a TikTok viral content expert specializing in scroll-stopping hooks. Generate exactly 10 viral hooks for the topic "${topic}".`,
    
    userPrompt: `Create 10 scroll-stopping TikTok hooks for "${topic}" in the ${config.niche} niche.

REQUIREMENTS:
- Each hook must be 3-8 words long
- Easy to say aloud with natural rhythm
- Use viral patterns like "POV:", "Stop scrolling if...", "Nobody told you...", "This is why...", "Wait until you see..."
- No emojis, no hashtags, no affiliate language
- Each hook should be unique and attention-grabbing
- Focus on curiosity, controversy, or relatability

OUTPUT FORMAT:
1. [Hook 1]
2. [Hook 2]
3. [Hook 3]
4. [Hook 4]
5. [Hook 5]
6. [Hook 6]
7. [Hook 7]
8. [Hook 8]
9. [Hook 9]
10. [Hook 10]

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}`,

    templateMetadata: {
      templateType: 'viral_hooks',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

// Viral Short Script Generator (15-30s)
function generateViralShortScript(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a TikTok script expert. Create a 15-30 second viral script with Hook/Build/Payoff/Button structure.`,
    
    userPrompt: `Write a 15-30 second TikTok script about "${topic}" for the ${config.niche} niche.

STRUCTURE REQUIREMENTS:
• HOOK (0-3s): Attention-grabbing opening line
• BUILD (3-12s): 2-3 tight lines that develop the concept
• PAYOFF (12-24s): The reveal or main point
• BUTTON (24-30s): Snappy closing line or question for comments

WRITING GUIDELINES:
- Total words: 70-120 words
- Short sentences, no filler
- Conversational and engaging tone
- No products, no affiliate links, no hashtags
- Focus on entertainment, education, or relatability

OUTPUT FORMAT:
HOOK: [0-3s opening line]
BUILD: [3-12s development, 2-3 lines]
PAYOFF: [12-24s main reveal]
BUTTON: [24-30s closing/engagement prompt]

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}`,

    templateMetadata: {
      templateType: 'viral_short_script',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

// Viral Storytime Generator  
function generateViralStorytime(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a TikTok storytelling expert. Create an authentic 90-150 word story script with proper narrative structure.`,
    
    userPrompt: `Write a 90-150 word TikTok story script about "${topic}" for the ${config.niche} niche.

STORY STRUCTURE:
• Setup: Time/place + why it matters
• Inciting moment: What triggered the story
• Rising stakes: 2-3 lines of tension or humor  
• Peak beat: The key turning point
• Resolution: What changed or was learned
• Comment prompt: Ask viewers to share similar experiences

WRITING GUIDELINES:
- 90-150 words total
- Authentic and conversational tone
- Relatable situations that feel real
- No products, brands, or hashtags
- Focus on human experiences and emotions
- Use "I" statements to make it personal

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}

Write the complete story script in natural paragraph form.`,

    templateMetadata: {
      templateType: 'viral_storytime',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

// Viral Duet/Reaction Generator
function generateViralDuetReaction(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a TikTok reaction expert. Create a script outline for reacting to or stitching another video.`,
    
    userPrompt: `Create a duet/reaction script outline for content about "${topic}" in the ${config.niche} niche.

STRUCTURE REQUIREMENTS:
• OPEN (≤8 words): Cold open line that pairs with a stitch
• BEAT 1 (≤10 words): First reaction point
• BEAT 2 (≤10 words): Second reaction point  
• BEAT 3 (≤10 words): Third reaction point
• PAYOFF (≤10 words): Final reaction or conclusion
• QUESTION: Short comment prompt for engagement

WRITING GUIDELINES:
- Each beat should be concise and impactful
- React to hypothetical popular content about the topic
- No products, brands, or affiliate references
- Focus on agreeing, disagreeing, or adding perspective
- Keep it conversational and authentic

OUTPUT FORMAT:
OPEN: [≤8 words]
BEAT 1: [≤10 words]  
BEAT 2: [≤10 words]
BEAT 3: [≤10 words]
PAYOFF: [≤10 words]
QUESTION: [Short engagement prompt]

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}`,

    templateMetadata: {
      templateType: 'viral_duet_reaction',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

// Viral Listicle Generator
function generateViralListicle(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a TikTok listicle expert. Create a "Top 3-5" format script with clear titles and explanations.`,
    
    userPrompt: `Create a listicle script in "Top 3-5 things about ${topic}" format for the ${config.niche} niche.

STRUCTURE FOR EACH ITEM:
• Title (≤6 words): Short, punchy headline
• Explanation (≤14 words): One clear sentence explaining it
• Optional micro-example (≤10 words): Brief example if helpful

WRITING GUIDELINES:
- Total output: 90-140 words
- 3-5 items total (choose based on content depth)
- Clear, punchy, scannable format
- No products, hashtags, or sales language
- Focus on education, entertainment, or tips
- Make each point valuable and memorable

OUTPUT FORMAT:
Top [3-5] Things About [Topic]:

1. [Title]: [Explanation] [Optional example]
2. [Title]: [Explanation] [Optional example]  
3. [Title]: [Explanation] [Optional example]
[Continue for 4-5 if needed]

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}`,

    templateMetadata: {
      templateType: 'viral_listicle',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

// Viral Challenge Generator
function generateViralChallenge(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a TikTok challenge expert. Create a participation idea that's easy to film and encourages user-generated content.`,
    
    userPrompt: `Design a TikTok challenge around "${topic}" for the ${config.niche} niche.

CHALLENGE STRUCTURE:
• NAME (≤4 words): Catchy challenge name with hashtag potential
• SETUP line (≤12 words): Brief explanation of the challenge
• STEP 1 (≤8 words): First action participants should take
• STEP 2 (≤8 words): Second action or element
• STEP 3 (≤8 words): Final action or reveal
• VARIATIONS: Two quick ideas for different skill levels
• NOTE: One short safety/comfort reminder

WRITING GUIDELINES:
- Must be filmable in 15-30 seconds
- Accessible to most people
- No brands, hashtags, or affiliate content in description
- Focus on fun, creativity, or self-expression
- Clear, simple instructions
- Encourage positive participation

OUTPUT FORMAT:
NAME: [Challenge name]
SETUP: [Brief explanation]
STEP 1: [First action]
STEP 2: [Second action]  
STEP 3: [Final action]
VARIATIONS: 
- Beginners: [Simple version]
- Advanced: [Creative version]
NOTE: [Safety/comfort reminder]

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}`,

    templateMetadata: {
      templateType: 'viral_challenge',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

// Viral Caption + Hashtags Generator
function generateViralCaptionHashtags(config: PromptConfig): GeneratedPrompt {
  const topic = config.viralTopic || 'trending topic';
  
  return {
    systemPrompt: `You are a social media caption expert. Create engaging captions and strategic hashtag sets for maximum viral potential.`,
    
    userPrompt: `Create caption options and hashtag sets for content about "${topic}" in the ${config.niche} niche.

CAPTION REQUIREMENTS:
• 3 different caption options
• Each caption: 8-18 words
• Conversational and engaging
• Invite comments and interaction
• No emojis, no affiliate language

HASHTAG REQUIREMENTS:
• BROAD hashtags: 6-8 generic/trending tags (e.g., #fyp, #viral, #trending)
• NICHE hashtags: 6-8 community-specific tags related to ${config.niche} and "${topic}"
• Mix of high-volume and medium-volume tags
• Current trending hashtags when relevant

OUTPUT FORMAT:
CAPTIONS:
1. [Caption option 1]
2. [Caption option 2]  
3. [Caption option 3]

BROAD HASHTAGS:
[6-8 generic/trending hashtags]

NICHE HASHTAGS:
[6-8 topic/niche-specific hashtags]

Topic: ${topic}
Niche: ${config.niche}
Tone: ${config.tone}`,

    templateMetadata: {
      templateType: 'viral_caption_hashtags',
      niche: config.niche,
      tone: config.tone,
      contentFormat: 'standard'
    }
  };
}

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
  },

  'universal_short_video_script': {
    generators: {
      'universal': generateUniversalShortVideoScript
    }
  },
  
  // Viral Templates (no product required)
  'viral_hooks': {
    generators: {
      'universal': generateViralHooks
    }
  },
  
  'viral_short_script': {
    generators: {
      'universal': generateViralShortScript
    }
  },
  
  'viral_storytime': {
    generators: {
      'universal': generateViralStorytime
    }
  },
  
  'viral_duet_reaction': {
    generators: {
      'universal': generateViralDuetReaction
    }
  },
  
  'viral_listicle': {
    generators: {
      'universal': generateViralListicle
    }
  },
  
  'viral_challenge': {
    generators: {
      'universal': generateViralChallenge
    }
  },
  
  'viral_caption_hashtags': {
    generators: {
      'universal': generateViralCaptionHashtags
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
  },

  'universal_short_video_script': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('universal_short_video_script', config.niche);
    return generator(config);
  },
  
  // Viral Template Prompts
  'viral_hooks': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_hooks', config.niche);
    return generator(config);
  },
  
  'viral_short_script': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_short_script', config.niche);
    return generator(config);
  },
  
  'viral_storytime': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_storytime', config.niche);
    return generator(config);
  },
  
  'viral_duet_reaction': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_duet_reaction', config.niche);
    return generator(config);
  },
  
  'viral_listicle': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_listicle', config.niche);
    return generator(config);
  },
  
  'viral_challenge': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_challenge', config.niche);
    return generator(config);
  },
  
  'viral_caption_hashtags': (config: PromptConfig): GeneratedPrompt => {
    const generator = getTemplateGenerator('viral_caption_hashtags', config.niche);
    return generator(config);
  }
};