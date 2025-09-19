import { OpenAI } from 'openai';
import { PromoInput, PromoOutput, PromoInputType, PromoOutputType } from './schemas';
import { buildChannelPrompt, CHANNEL_CONSTRAINTS, getSpartanFormatRules } from './promptFactory';
import { buildUtmUrl } from './utils/utm';
import { normalizePromoInput, normalizeSpartanText } from './utils/normalize';
import { v4 as uuidv4 } from 'uuid';

// Initialize OpenAI with environment key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Spartan system prompt matching GlowBot's exact format
const SPARTAN_SYSTEM_PROMPT = `
You are an AI content generator that produces CookAIng promotional content in a strict Spartan format.

# OVERVIEW
You will generate promotional content for CookAIng across different channels and objectives.
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
- Follow exact channel format requirements
`;

/**
 * Main function to generate CookAIng promotional content
 * Exported API for server use
 */
export async function generatePromo(input: Partial<PromoInput>): Promise<PromoOutput[]> {
  try {
    // Normalize and validate input
    const normalizedInput = normalizePromoInput(input);
    
    const results: PromoOutput[] = [];
    
    // Generate content for each requested channel
    for (const channel of normalizedInput.channels) {
      console.log(`🍳 Generating CookAIng promo for ${channel} - ${normalizedInput.objective}`);
      
      const channelPrompt = buildChannelPrompt(normalizedInput, channel);
      const constraints = CHANNEL_CONSTRAINTS[channel];
      
      // Generate content with OpenAI
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SPARTAN_SYSTEM_PROMPT },
          { role: 'user', content: channelPrompt }
        ],
        temperature: 0.3,
        max_tokens: constraints.maxWords * 3, // Allow extra tokens for generation
      });
      
      const content = response.choices[0]?.message?.content?.trim();
      
      if (!content) {
        console.error(`❌ No content generated for ${channel}`);
        continue;
      }
      
      // Apply Spartan normalization
      const spartanContent = normalizeSpartanText(content);
      
      // Build UTM URL
      const utmUrl = buildUtmUrl(normalizedInput.ctaUrl, {
        source: normalizedInput.source || 'organic',
        medium: normalizedInput.medium || channel,
        campaign: normalizedInput.campaign,
        content: `${channel}-${normalizedInput.objective}-v1`
      });
      
      // Extract components from generated content
      const parsedContent = parseChannelContent(spartanContent, channel);
      
      // Build output object
      const promoOutput: PromoOutput = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        appName: "CookAIng",
        objective: normalizedInput.objective,
        channel,
        body: parsedContent.body,
        cta: {
          text: parsedContent.ctaText || "Try CookAIng",
          url: normalizedInput.ctaUrl,
          utmUrl
        },
        metadata: {
          persona: normalizedInput.audiencePersona,
          tone: normalizedInput.tone || 'friendly',
          seedTopic: normalizedInput.seedTopic,
          featuresUsed: normalizedInput.features,
          benefitsUsed: normalizedInput.keyBenefits,
          proofPointsUsed: normalizedInput.proofPoints,
          wordCount: spartanContent.split(' ').length
        },
        // Optional fields
        ...(parsedContent.title && { title: parsedContent.title }),
        ...(parsedContent.hook && { hook: parsedContent.hook }),
        ...(parsedContent.captions && { captions: parsedContent.captions }),
        ...(parsedContent.hashtags && { hashtags: parsedContent.hashtags }),
        ...(parsedContent.variants && { variants: parsedContent.variants })
      };
      
      results.push(promoOutput);
      console.log(`✅ Generated ${channel} content: ${spartanContent.split(' ').length} words`);
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ CookAIng promo generation error:', error);
    throw error;
  }
}

/**
 * Parse generated content based on channel format
 */
function parseChannelContent(content: string, channel: string): {
  body: string;
  title?: string;
  hook?: string;
  captions?: string[];
  hashtags?: string[];
  ctaText?: string;
  variants?: { label: string; body: string }[];
} {
  const lines = content.split('\n').filter(line => line.trim());
  
  switch (channel) {
    case 'tiktok_reel':
    case 'instagram_reel':
      return parseReelContent(lines);
      
    case 'x_thread':
      return parseThreadContent(lines);
      
    case 'email':
      return parseEmailContent(lines);
      
    case 'blog':
      return parseBlogContent(lines);
      
    default:
      return {
        body: content,
        ctaText: extractCTA(content)
      };
  }
}

function parseReelContent(lines: string[]): {
  body: string;
  hook?: string;
  captions?: string[];
  hashtags?: string[];
  ctaText?: string;
} {
  const hook = lines[0];
  const body = lines.slice(0, -1).join('\n');
  const hashtags = extractHashtags(lines.join(' '));
  const ctaText = extractCTA(lines.join(' '));
  
  return {
    body,
    hook: hook !== body ? hook : undefined,
    hashtags: hashtags.length > 0 ? hashtags : undefined,
    ctaText
  };
}

function parseThreadContent(lines: string[]): {
  body: string;
  hook?: string;
  ctaText?: string;
} {
  const hook = lines[0];
  const body = lines.join('\n\n');
  const ctaText = extractCTA(lines[lines.length - 1]);
  
  return {
    body,
    hook: hook !== body ? hook : undefined,
    ctaText
  };
}

function parseEmailContent(lines: string[]): {
  body: string;
  title?: string;
  ctaText?: string;
} {
  const title = lines[0];
  const body = lines.slice(1).join('\n');
  const ctaText = extractCTA(body);
  
  return {
    body,
    title: title !== body ? title : undefined,
    ctaText
  };
}

function parseBlogContent(lines: string[]): {
  body: string;
  title?: string;
  ctaText?: string;
} {
  const title = lines[0];
  const body = lines.join('\n\n');
  const ctaText = extractCTA(body);
  
  return {
    body,
    title: title !== body ? title : undefined,
    ctaText
  };
}

function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}

function extractCTA(content: string): string | undefined {
  const ctaPatterns = [
    /try\s+cookaing/i,
    /get\s+cookaing/i,
    /download\s+now/i,
    /start\s+cooking/i,
    /learn\s+more/i,
    /sign\s+up/i
  ];
  
  for (const pattern of ctaPatterns) {
    const match = content.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return undefined;
}

// Export types and utilities
export * from './schemas';
export * from './templateRegistry'; 
export * from './promptFactory';
export * from './utils/utm';
export * from './utils/normalize';