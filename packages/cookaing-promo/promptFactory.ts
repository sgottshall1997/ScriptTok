import { PromoInput, Channel, PromoObjective } from './schemas';
import { getTemplate } from './templateRegistry';
import { buildUtmUrl } from './utils/utm';

// Spartan format system prompt - matching GlowBot's exact style
const SPARTAN_SYSTEM_PROMPT = `
You are an AI content generator that produces marketing content in a strict Spartan format.

# OVERVIEW
You will generate CookAIng promotional content across different channels and objectives.
This Spartan format enforces:
- Clear, simple language
- Short, direct, factual sentences
- Active voice only
- No metaphors, cliches, fluff, and filler
- NO emojis, asterisks, setup phrases, or exaggerated language

Strictly avoid these words:
"can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, imagine, game-changer, unlock, discover, skyrocket, revolutionize, disruptive, utilize, tapestry, illuminate, unveil, pivotal, enrich, intricate, elucidate, hence, furthermore, however, harness, exciting, groundbreaking, remarkable, navigating, powerful, inquiries, ever-evolving"

# STYLE GUIDELINES
- Use clear, simple language
- Write in short, direct, factual sentences  
- Use active voice only
- Avoid metaphors, cliches, fluff, and filler
- DO NOT use emojis, asterisks, setup phrases ("in summary", "in conclusion", etc.), or exaggerated language

# OUTPUT RULES
- Output only the formatted content
- Do not include notes, disclaimers, or internal instructions
- Follow Spartan format 100% of the time
- Match exact word count constraints per channel
`;

export interface ChannelConstraints {
  maxWords: number;
  maxCharacters?: number;
  format: string;
  structure: string[];
}

// Channel-specific constraints matching Spartan format
export const CHANNEL_CONSTRAINTS: Record<Channel, ChannelConstraints> = {
  tiktok_reel: {
    maxWords: 40,
    maxCharacters: 2200,
    format: "20-40s video script",
    structure: [
      "Hook: First 1-2s grab attention",
      "Demo: 3-5 on-screen beats showing CookAIng",
      "Benefit: What this means for user",
      "CTA: Clear call to action"
    ]
  },
  instagram_reel: {
    maxWords: 40,
    maxCharacters: 2200, 
    format: "Visual-heavy reel script",
    structure: [
      "Hook: Visual attention grabber",
      "Demo: Step-by-step CookAIng walkthrough",
      "Benefit: Time/effort saved highlight",
      "CTA: With text overlay direction"
    ]
  },
  x_thread: {
    maxWords: 1680, // 280 chars × 6 tweets
    maxCharacters: 1680,
    format: "6-10 tweet thread",
    structure: [
      "Tweet 1: Hook + CookAIng intro",
      "Tweets 2-4: Feature/benefit breakdown", 
      "Tweets 5-7: User value proposition",
      "Tweet 8: CTA with UTM link"
    ]
  },
  linkedin_post: {
    maxWords: 200,
    maxCharacters: 1300,
    format: "Professional tone",
    structure: [
      "Professional hook connecting to business value",
      "CookAIng context and problem it solves",
      "Business/productivity benefits",
      "Engagement question CTA"
    ]
  },
  email: {
    maxWords: 150,
    maxCharacters: 1000,
    format: "HTML email",
    structure: [
      "Subject line: 5-7 words max",
      "Preview text: 35-50 characters",
      "Header: Value proposition",
      "Body: Benefit-focused content", 
      "CTA button: Single primary action"
    ]
  },
  blog: {
    maxWords: 800,
    maxCharacters: 5000,
    format: "SEO optimized",
    structure: [
      "H1: Keyword-rich title",
      "Intro: Problem and CookAIng solution",
      "H2/H3: Feature breakdown sections",
      "Bullets: Key benefits list",
      "Conclusion: Summary + CTA"
    ]
  },
  ads_google: {
    maxWords: 30,
    maxCharacters: 150,
    format: "Ad copy variations",
    structure: [
      "Headlines: 10 variations (30 chars each)",
      "Descriptions: 4 variations (90 chars each)",
      "Long descriptions: 3 variations (90 chars each)"
    ]
  },
  ads_meta: {
    maxWords: 125,
    maxCharacters: 1250,
    format: "Visual ad copy", 
    structure: [
      "Primary text: Main message (125 chars)",
      "Headline: Attention grabber (40 chars)",
      "Description: Additional context (30 chars)",
      "CTA button: Action text (20 chars)"
    ]
  },
  ads_tiktok: {
    maxWords: 40,
    maxCharacters: 280,
    format: "Native video ad",
    structure: [
      "Native hook: Organic-feeling opener",
      "Quick demo: CookAIng feature highlight",  
      "User benefit: Personal value",
      "Soft CTA: Natural recommendation"
    ]
  }
};

export function buildChannelPrompt(input: PromoInput, channel: Channel): string {
  const template = getTemplate(input.objective, channel);
  const constraints = CHANNEL_CONSTRAINTS[channel];
  const utmUrl = buildUtmUrl(input.ctaUrl, {
    source: input.source || 'organic',
    medium: input.medium || channel,
    campaign: input.campaign,
    content: `${channel}-${input.objective}-v1`
  });

  // Build channel-specific prompt following Spartan format
  const channelInstructions = getChannelInstructions(channel, input.objective);
  
  const prompt = `Generate CookAIng promotional content for ${channel.replace('_', ' ')}.

CONSTRAINTS:
- Max ${constraints.maxWords} words
- Format: ${constraints.format}
- Objective: ${input.objective.replace('_', ' ')}
- Tone: ${input.tone || 'friendly'}
- Audience: ${input.audiencePersona}

COOKAING INFO:
- App: CookAIng (smart cooking and meal planning)
- Key Benefits: ${input.keyBenefits.join(', ')}
- Features: ${input.features.join(', ')}
${input.proofPoints?.length ? `- Proof Points: ${input.proofPoints.join(', ')}` : ''}
${input.offer ? `- Special Offer: ${input.offer}` : ''}

TEMPLATE STRUCTURE:
${template.structure.join('\n')}

CTA OPTIONS: ${template.ctas.join(', ')}
CTA URL: ${utmUrl}

CHANNEL REQUIREMENTS:
${channelInstructions}

${input.brandGuidelines ? `BRAND GUIDELINES:\n${input.brandGuidelines}\n` : ''}

OUTPUT REQUIREMENTS:
- Follow Spartan format strictly
- Use active voice only
- No emojis or casual text speak
- Use provided structure
- Include UTM-tracked CTA URL
- Stay within word limit
- Match channel format exactly`;

  return prompt;
}

function getChannelInstructions(channel: Channel, objective: PromoObjective): string {
  switch (channel) {
    case 'tiktok_reel':
      return `• 20-40 second video script format
• First 1-2 seconds must grab attention  
• 3-5 on-screen beats showing CookAIng in action
• End with clear call to action
• No emojis or casual text speak`;

    case 'instagram_reel':
      return `• Visual-heavy reel script
• Hook must work with opening visual
• Step-by-step demonstration flow
• Include text overlay directions
• End card with CTA`;

    case 'x_thread':
      return `• 6-10 tweet thread structure
• Tweet 1: Hook + topic introduction
• Tweets 2-7: Main content breakdown
• Final tweet: Clear CTA with link
• Each tweet under 280 characters
• Use numbered format (1/8, 2/8, etc.)`;

    case 'linkedin_post':
      return `• Professional, business-focused tone
• Connect CookAIng to productivity/efficiency
• Use light emojis sparingly
• End with engagement question
• Include value proposition for professionals`;

    case 'email':
      return `• Subject line: 5-7 words maximum
• Preview text: 35-50 characters
• Scannable bullet points
• Single primary CTA button
• Mobile-optimized length`;

    case 'blog':
      return `• SEO-optimized structure with H1/H2/H3
• Keyword: "CookAIng" and cooking-related terms
• Include bullet point lists
• Add meta description (150 chars)
• Conclusion with clear next steps
${objective === 'seo_article' ? `• Target word count: 600-800 words\n• Include FAQ section\n• Internal linking opportunities` : ''}`;

    case 'ads_google':
      return `• Generate 10 headline variations (30 chars each)
• Generate 4 description variations (90 chars each)  
• Generate 3 long description variations (90 chars each)
• Focus on search intent keywords
• Include keyword: "cooking app", "meal planning"`;

    case 'ads_meta':
      return `• Primary text: Main message (125 chars max)
• Headline: Attention-grabbing (40 chars max)
• Description: Additional context (30 chars max)
• CTA button text: Action-oriented (20 chars max)
• Visual ad copy for News Feed/Stories`;

    case 'ads_tiktok':
      return `• Native, organic-feeling ad copy
• Hook should feel like user-generated content
• Quick feature demonstration
• Soft sell approach
• End with natural recommendation`;

    default:
      return '• Follow general Spartan format guidelines';
  }
}

export function generateVariants(input: PromoInput, channel: Channel): string[] {
  const template = getTemplate(input.objective, channel);
  
  // Generate A/B test variants using different hooks and CTAs
  const variants = [];
  
  // Variant A: Hook 1 + CTA 1
  if (template.hooks[0] && template.ctas[0]) {
    variants.push(`Variant A: ${template.hooks[0]} → ${template.ctas[0]}`);
  }
  
  // Variant B: Hook 2 + CTA 2  
  if (template.hooks[1] && template.ctas[1]) {
    variants.push(`Variant B: ${template.hooks[1]} → ${template.ctas[1]}`);
  }
  
  // Variant C: Hook 3 + CTA 1 (mix and match)
  if (template.hooks[2] && template.ctas[0]) {
    variants.push(`Variant C: ${template.hooks[2]} → ${template.ctas[0]}`);
  }
  
  return variants;
}

export function getSpartanFormatRules(): string[] {
  return [
    "Use clear, simple language",
    "Write short, direct, factual sentences", 
    "Use active voice only",
    "Avoid metaphors, cliches, fluff, and filler",
    "NO emojis, asterisks, or setup phrases",
    "No exaggerated language or superlatives",
    "Banned words: can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe",
    "Additional banned: delve, embark, enlightening, esteemed, imagine, game-changer, unlock, discover, skyrocket",
    "More banned: revolutionize, disruptive, utilize, tapestry, illuminate, unveil, pivotal, enrich, intricate", 
    "Final banned: elucidate, hence, furthermore, however, harness, exciting, groundbreaking, remarkable, navigating, powerful, inquiries, ever-evolving"
  ];
}