/**
 * UNIFIED PROMPT FACTORY
 * Modular prompt generation system for all content types and generators
 */

import { TrendingProduct } from '../../shared/schema';

export interface PromptConfig {
  niche: string;
  templateType: string;
  tone: string;
  productName: string;
  platforms?: string[];
  contentFormat?: 'standard' | 'spartan';
  trendingProducts?: TrendingProduct[];
  viralInspiration?: any;
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
 * CORE PROMPT TEMPLATES BY TYPE
 */
export const TEMPLATE_PROMPTS = {
  'short_video': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert short-form video content creator specializing in ${config.niche} content. Create engaging, platform-native scripts that drive conversions.`,
    userPrompt: `Create a ${config.contentFormat === 'spartan' ? 'concise, professional' : 'engaging'} video script for "${config.productName}" in the ${config.niche} niche.

Tone: ${config.tone}
${config.contentFormat === 'spartan' ? `
# SPARTAN WRITING STYLE - MANDATORY COMPLIANCE:
Your writing style is spartan and informative. Use clear, simple language. Employ short, impactful sentences. Use active voice; avoid passive voice. Focus on practical, actionable insights. Incorporate data or statistics to support claims when possible. Use pronouns to directly address the reader.

STRICT FORBIDDEN WORDS - DO NOT USE:
"can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, you're not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, amazing, incredible"

FORMATTING RULES:
- Avoid metaphors and cliches
- Avoid generalizations 
- Do not include common setup language in any sentence, including: in conclusion, in closing, etc.
- Do not output warnings or notes-just the output requested
- Do not use hashtags
- Do not use semicolons
- Do not use emojis
- Do not use asterisks
- Do not use adjectives and adverbs
- Maximum 50 words total for video script
- Direct, factual statements only

STRUCTURE REQUIREMENTS:
1. Start with 1 paragraph summarizing the product (25-30 words)
2. Newline with a friendly and positive CTA hook for people to be more interested
3. Newline with text suggesting viewer to enter site for more information with target of buying the product. Example "for more information enter on the link in our bio"
` : `Format: Engaging with personality and emojis`}

Core Requirements:
- Hook viewers in first 3 seconds
- Highlight key product benefits  
- Include clear call-to-action
- ${config.contentFormat === 'spartan' ? 'Follow strict 50-word limit and spartan guidelines above' : 'Aim for 150-250 words, engaging style'}

${config.trendingProducts ? `Context: This product is trending alongside: ${config.trendingProducts.slice(0, 3).map(p => p.title).join(', ')}` : ''}

Respond with script content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'influencer_caption': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an Instagram content strategist creating aesthetic, engaging posts that drive engagement and conversions in the ${config.niche} space.`,
    userPrompt: `Create an Instagram post for "${config.productName}" in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Clean, professional, minimal emojis' : 'Instagram-native with strategic emoji use'}

Requirements:
- Compelling opening hook
- Value-driven content
- Strategic hashtag use (8-12 hashtags)
- Clear call-to-action
- ${config.contentFormat === 'spartan' ? 'Professional language, minimal emojis' : 'Engaging, aesthetic presentation'}

${config.viralInspiration ? `Viral inspiration: ${config.viralInspiration.hook || 'Use trending formats'}` : ''}

Respond with post content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'product_comparison': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are a trusted product reviewer with expertise in ${config.niche}. Create honest, detailed reviews that help consumers make informed decisions.`,
    userPrompt: `Write a comprehensive product review for "${config.productName}" in the ${config.niche} category.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Factual, concise, professional' : 'Detailed and engaging'}

Requirements:
- Authentic user perspective
- Key features and benefits
- Honest pros and cons
- Usage experience details
- Clear recommendation
- ${config.contentFormat === 'spartan' ? 'Focus on facts, minimal filler' : 'Include personal anecdotes'}

${config.smartStyleRecommendations ? `Style guidance: ${config.smartStyleRecommendations.recommendation}` : ''}

Respond with review content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'unboxing': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are creating an exciting unboxing experience that captures the anticipation and discovery of new ${config.niche} products.`,
    userPrompt: `Create an unboxing experience script for "${config.productName}" in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Direct, informative unboxing' : 'Exciting, discovery-focused'}

Requirements:
- Build anticipation
- Describe packaging details
- First impressions
- Initial testing/usage
- Honest reaction
- ${config.contentFormat === 'spartan' ? 'Keep factual and concise' : 'Include emotional reactions'}

Respond with unboxing script only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'tutorial': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an educational content creator specializing in ${config.niche} tutorials. Create clear, actionable how-to content.`,
    userPrompt: `Create a tutorial featuring "${config.productName}" in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Step-by-step, minimal fluff' : 'Detailed with tips and tricks'}

Requirements:
- Clear step-by-step instructions
- Practical tips and tricks
- Common mistakes to avoid
- Expected results
- ${config.contentFormat === 'spartan' ? 'Concise, actionable steps' : 'Include helpful context and explanations'}

Respond with tutorial content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'seo_blog': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are an expert SEO content writer specializing in ${config.niche} content. Create comprehensive, keyword-optimized blog posts that rank well in search engines.`,
    userPrompt: `Write an SEO-optimized blog post about "${config.productName}" in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Professional, concise blog format' : 'Comprehensive SEO blog post'}

Requirements:
- Compelling headline with target keywords
- Meta description (150-160 characters)
- H2 and H3 subheadings with semantic keywords
- ${config.contentFormat === 'spartan' ? '800-1000 words' : '1000-1500 words'}
- Natural keyword integration
- Internal linking opportunities
- Clear value proposition
- Call-to-action sections

${config.smartStyleRecommendations ? `SEO guidance: ${config.smartStyleRecommendations.recommendation}` : ''}

Respond with blog post content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'routine_kit': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are a ${config.niche} expert creating comprehensive routine guides that combine multiple products into effective daily regimens.`,
    userPrompt: `Create a comprehensive routine featuring "${config.productName}" as a key component in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Step-by-step routine, concise' : 'Detailed routine with explanations'}

Requirements:
- Complete routine breakdown (morning/evening/weekly)
- Product order and timing
- Expected results and timeline
- Tips for maximizing effectiveness
- ${config.contentFormat === 'spartan' ? 'Focused on essential steps' : 'Include additional tips and variations'}

Respond with routine guide content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'bullet_points': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are a content creator specializing in concise, scannable content that delivers maximum value in minimal time for ${config.niche} audiences.`,
    userPrompt: `Create bullet-point content about "${config.productName}" in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Direct bullet points, no fluff' : 'Engaging bullet points with context'}

Requirements:
- 5-8 key bullet points
- Each point delivers specific value
- Easy to scan and share
- Strong opening statement
- ${config.contentFormat === 'spartan' ? 'Factual, concise points' : 'Include brief explanations'}

Respond with bullet-point content only.`,
    templateMetadata: {
      templateType: config.templateType,
      niche: config.niche,
      tone: config.tone,
      contentFormat: config.contentFormat || 'regular'
    }
  }),

  'trending_explainer': (config: PromptConfig): GeneratedPrompt => ({
    systemPrompt: `You are a trend analyst and content creator who explains why products and trends gain popularity in the ${config.niche} space.`,
    userPrompt: `Explain why "${config.productName}" is trending in the ${config.niche} niche.

Tone: ${config.tone}
Format: ${config.contentFormat === 'spartan' ? 'Factual trend analysis' : 'Engaging trend explanation'}

Requirements:
- Clear explanation of the trend
- Supporting factors and evidence
- Market context and timing
- Future predictions
- ${config.contentFormat === 'spartan' ? 'Data-focused, minimal speculation' : 'Include cultural and social factors'}

${config.trendingProducts ? `Context: Similar trending products include ${config.trendingProducts.slice(0, 3).map(p => p.title).join(', ')}` : ''}

Respond with trend explanation content only.`,
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
  const templateGenerator = TEMPLATE_PROMPTS[config.templateType] || TEMPLATE_PROMPTS['short_video'];
  
  return templateGenerator(config);
}

/**
 * SYNCHRONOUS PROMPT GENERATOR FOR TRANSPARENCY
 */
export function generatePrompt(config: PromptConfig): GeneratedPrompt {
  // Get template-specific prompt
  const templateGenerator = TEMPLATE_PROMPTS[config.templateType] || TEMPLATE_PROMPTS['short_video'];
  
  return templateGenerator(config);
}

/**
 * PLATFORM-SPECIFIC PROMPT CREATOR
 */
export async function createPlatformPrompt(platform: string, config: PromptConfig): Promise<string> {
  const platformGenerator = PLATFORM_PROMPTS[platform.toLowerCase()] || PLATFORM_PROMPTS.instagram;
  
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