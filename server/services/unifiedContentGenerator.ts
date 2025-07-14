/**
 * UNIFIED CONTENT GENERATOR
 * Modular system handling all content generation types (single, bulk, scheduled)
 */

import { createPrompt, createPlatformPrompt, PromptConfig } from './promptFactory';
import { generateWithAI } from './aiModelRouter';
import { generateAmazonAffiliateLink } from './amazonAffiliate';
import { TrendingProduct } from '../../shared/schema';

export interface ContentGenerationConfig {
  productName: string;
  niche: string;
  templateType: string;
  tone: string;
  platforms: string[];
  contentFormat?: 'standard' | 'spartan';
  aiModel: 'claude';
  affiliateId?: string;
  trendingProducts?: TrendingProduct[];
  viralInspiration?: any;
  smartStyleRecommendations?: any;
  contentType?: string;
  affiliateUrl?: string;
  customHook?: string;
  useSmartStyle?: boolean;
  useSpartanFormat?: boolean;
}

export interface GeneratedContentPayload {
  script: string;
  productDescription: string;
  demoScript: string;
  instagramCaption: string;
  tiktokCaption: string;
  youtubeCaption: string;
  xCaption: string;
  facebookCaption: string;
  affiliateLink: string;
  metadata: {
    aiModel: string;
    contentFormat: string;
    templateType: string;
    tone: string;
    niche: string;
    platforms: string[];
    generatedAt: string;
    tokenCount?: number;
  };
}

/**
 * MAIN UNIFIED CONTENT GENERATION FUNCTION
 */
export async function generateUnifiedContent(config: ContentGenerationConfig): Promise<GeneratedContentPayload> {
  const startTime = Date.now();
  
  console.log(`🔥 UNIFIED GENERATOR: ${config.productName} (${config.niche}) - ${config.templateType}/${config.tone}`);
  console.log(`🤖 AI MODEL: ${config.aiModel.toUpperCase()} | 🏛️ FORMAT: ${config.contentFormat}`);

  // Step 1: Generate main content script
  const mainContent = await generateMainScript(config);
  
  // Step 2: Generate platform-specific captions
  const platformCaptions = await generateAllPlatformCaptions(config, mainContent);
  
  // Step 3: Generate affiliate link
  const affiliateLink = generateAmazonAffiliateLink(config.productName, config.affiliateId || 'sgottshall107-20');
  
  // Step 4: Create demo script (shortened version of main content)
  const demoScript = generateDemoScript(mainContent, config.contentFormat);
  
  // Step 5: Generate product description
  const productDescription = generateProductDescription(config.productName, config.niche, mainContent);

  const endTime = Date.now();
  const duration = endTime - startTime;

  return {
    script: mainContent,
    productDescription,
    demoScript,
    instagramCaption: platformCaptions.instagram,
    tiktokCaption: platformCaptions.tiktok,
    youtubeCaption: platformCaptions.youtube,
    xCaption: platformCaptions.twitter,
    facebookCaption: platformCaptions.facebook || platformCaptions.instagram, // Fallback to Instagram
    affiliateLink,
    metadata: {
      aiModel: config.aiModel,
      contentFormat: config.contentFormat,
      templateType: config.templateType,
      tone: config.tone,
      niche: config.niche,
      platforms: config.platforms,
      generatedAt: new Date().toISOString(),
      tokenCount: Math.floor(mainContent.length / 4) // Rough token estimate
    }
  };
}

/**
 * GENERATE MAIN CONTENT SCRIPT
 */
async function generateMainScript(config: ContentGenerationConfig): Promise<string> {
  const promptConfig: PromptConfig = {
    niche: config.niche,
    templateType: config.templateType,
    tone: config.tone,
    productName: config.productName,
    contentFormat: config.contentFormat,
    trendingProducts: config.trendingProducts,
    viralInspiration: config.viralInspiration,
    smartStyleRecommendations: config.smartStyleRecommendations
  };

  const generatedPrompt = await createPrompt(promptConfig);
  
  console.log(`📝 Generating main content with ${config.aiModel.toUpperCase()}`);
  
  const aiResponse = await generateWithAI(generatedPrompt.userPrompt, {
    model: config.aiModel,
    systemPrompt: generatedPrompt.systemPrompt,
    temperature: config.contentFormat === 'spartan' ? 0.3 : 0.7,
    maxTokens: config.contentFormat === 'spartan' ? 800 : 1500,
    metadata: {
      templateType: config.templateType,
      niche: config.niche,
      productName: config.productName,
      contentFormat: config.contentFormat
    }
  });

  if (!aiResponse.success) {
    throw new Error(`Main content generation failed: ${aiResponse.error}`);
  }

  // Extract content from Claude AI response structure
  let content = '';
  if (aiResponse.content?.content) {
    content = aiResponse.content.content; // Claude structure
  } else if (aiResponse.data) {
    content = aiResponse.data; // Alternative Claude response structure
  } else {
    throw new Error('Invalid Claude AI response structure');
  }

  return content.trim();
}

/**
 * GENERATE ALL PLATFORM CAPTIONS
 */
async function generateAllPlatformCaptions(config: ContentGenerationConfig, mainContent: string): Promise<Record<string, string>> {
  const platforms = ['tiktok', 'instagram', 'youtube', 'twitter', 'facebook'];
  const captions: Record<string, string> = {};

  console.log(`🎯 Generating platform captions for: ${platforms.join(', ')}`);

  for (const platform of platforms) {
    try {
      // Create platform-specific prompt
      const platformPrompt = createPlatformSpecificPrompt(platform, config, mainContent);

      const aiResponse = await generateWithAI(platformPrompt, {
        model: config.aiModel,
        systemPrompt: `You are a ${platform} content specialist. Create platform-native captions that maximize engagement for ${platform} specifically. Do not copy the main content - create original platform-optimized content.`,
        temperature: 0.8,
        maxTokens: 600,
        useJson: false,
        metadata: {
          platform,
          niche: config.niche,
          productName: config.productName,
          contentFormat: config.contentFormat || 'standard'
        }
      });

      if (aiResponse.success) {
        let caption = '';
        if (aiResponse.content?.content) {
          caption = aiResponse.content.content; // Claude structure
        } else if (aiResponse.data) {
          caption = aiResponse.data; // Alternative Claude structure
        }

        // Clean up caption and remove truncation markers
        caption = caption.replace(/\[TRUNCATED\]/gi, '').trim();

        // Add affiliate link and compliance disclosure
        captions[platform] = enhancePlatformCaption(caption, platform, config);
      } else {
        // Fallback caption
        captions[platform] = generateFallbackCaption(platform, config);
      }
    } catch (error) {
      console.error(`Platform caption generation failed for ${platform}:`, error);
      captions[platform] = generateFallbackCaption(platform, config);
    }
  }

  return captions;
}

/**
 * CREATE PLATFORM-SPECIFIC PROMPTS
 */
function createPlatformSpecificPrompt(platform: string, config: ContentGenerationConfig, mainContent: string): string {
  const isSparta = config.contentFormat === 'spartan';
  const contentSnippet = mainContent.substring(0, 300);

  const platformSpecs = {
    tiktok: {
      style: 'Gen Z language, trending hooks, viral elements, short and punchy',
      maxLength: '150 words',
      requirements: 'Use trending slang, hashtags like #TechTok #ProductName, conversational tone, hook viewers in first 3 seconds',
      format: isSparta ? 'Direct, factual language only. No emojis or filler words.' : 'Emojis, trending phrases, casual language'
    },
    instagram: {
      style: 'Aesthetic, lifestyle-focused, hashtag-heavy, influencer tone',
      maxLength: '200 words',
      requirements: 'Lifestyle integration, aesthetic appeal, 10-15 hashtags, story-driven content',
      format: isSparta ? 'Professional lifestyle language. No emojis.' : 'Aesthetic emojis, lifestyle language, inspiring tone'
    },
    youtube: {
      style: 'Descriptive, SEO-friendly, engaging for longer attention spans',
      maxLength: '250 words',
      requirements: 'SEO keywords, detailed benefits, call-to-action, longer engagement',
      format: isSparta ? 'Detailed, factual descriptions. Professional tone.' : 'Descriptive, enthusiastic, informative'
    },
    twitter: {
      style: 'Concise, witty, conversation-starting',
      maxLength: '280 characters',
      requirements: 'Twitter threads, witty observations, conversation starters, viral potential',
      format: isSparta ? 'Concise facts only. No hashtags except #ad.' : 'Witty, conversational, hashtag-optimized'
    },
    facebook: {
      style: 'Professional, family-friendly, community-focused',
      maxLength: '200 words',
      requirements: 'Community engagement, family-safe content, group sharing potential',
      format: isSparta ? 'Professional, factual community content.' : 'Warm, community-focused, sharing-friendly'
    }
  };

  const spec = platformSpecs[platform as keyof typeof platformSpecs];
  
  return `Create a ${platform.toUpperCase()}-native caption for "${config.productName}" (${config.niche} niche).

MAIN CONTENT REFERENCE (DO NOT COPY):
"${contentSnippet}..."

PLATFORM REQUIREMENTS:
- Style: ${spec.style}
- Max Length: ${spec.maxLength}
- Platform Focus: ${spec.requirements}
- Format: ${spec.format}
- Tone: ${config.tone}

CRITICAL: Create original ${platform}-specific content that maximizes engagement for ${platform} users. Do not copy or rephrase the main content. Write native ${platform} content that feels organic to the platform.

${isSparta ? 'SPARTAN FORMAT: Use direct, factual language only. No filler words, metaphors, or casual expressions.' : ''}

Generate only the caption content, no explanations.`;
}

/**
 * ENHANCE PLATFORM CAPTION WITH AFFILIATE LINKS
 */
function enhancePlatformCaption(caption: string, platform: string, config: ContentGenerationConfig): string {
  const affiliateLink = generateAmazonAffiliateLink(config.productName, config.affiliateId || 'sgottshall107-20');
  
  let enhancedCaption = caption.trim();
  
  // Apply Spartan format filtering if needed
  if (config.contentFormat === 'spartan') {
    enhancedCaption = enhancedCaption
      .replace(/[✨🌿🔥💫⭐️🌟💎✊🏻🔗🛒🛍️📝💰🎯🚀📱📷⚡️💯🎉👏🙌✅❤️💕🥰😍🤩🔑🎊💪🏆🌈]/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\b(amazing|incredible|stunning|absolutely|literally|super|totally|completely|perfect|ultimate|revolutionary|game-changing|life-changing|mind-blowing)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Add platform-specific affiliate link formatting
  switch (platform.toLowerCase()) {
    case 'tiktok':
      enhancedCaption += config.contentFormat === 'spartan' 
        ? `\n\nShop here: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases. #ad`
        : `\n\n🛒 Shop here: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases. #ad`;
      break;
    case 'instagram':
      enhancedCaption += config.contentFormat === 'spartan'
        ? `\n\nShop the link: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases. #ad`
        : `\n\n🛍️ Shop the link: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases. #ad`;
      break;
    case 'youtube':
      enhancedCaption += `\n\n🔗 Amazon link: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases.`;
      break;
    case 'twitter':
      enhancedCaption += config.contentFormat === 'spartan'
        ? `\n\nShop: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases. #ad`
        : `\n\n🛒 ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases. #ad`;
      break;
    case 'facebook':
      enhancedCaption += `\n\nShop on Amazon: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases.`;
      break;
    default:
      enhancedCaption += `\n\nShop on Amazon: ${affiliateLink}\n\nAs an Amazon Associate I earn from qualifying purchases.`;
  }

  return enhancedCaption;
}

/**
 * GENERATE FALLBACK CAPTION
 */
function generateFallbackCaption(platform: string, config: ContentGenerationConfig): string {
  const affiliateLink = generateAmazonAffiliateLink(config.productName, config.affiliateId || 'sgottshall107-20');
  
  const baseCaption = config.contentFormat === 'spartan' 
    ? `Check out this ${config.productName} - great addition to any ${config.niche} routine.`
    : `Loving this ${config.productName}! Perfect for anyone into ${config.niche}. ✨`;

  return enhancePlatformCaption(baseCaption, platform, config);
}

/**
 * GENERATE DEMO SCRIPT (shortened version)
 */
function generateDemoScript(mainContent: string, contentFormat: 'regular' | 'spartan'): string {
  const sentences = mainContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const targetLength = contentFormat === 'spartan' ? 2 : 3;
  
  const selectedSentences = sentences.slice(0, targetLength);
  return selectedSentences.join('. ').trim() + '.';
}

/**
 * GENERATE PRODUCT DESCRIPTION
 */
function generateProductDescription(productName: string, niche: string, mainContent: string): string {
  // Extract key benefits from main content
  const words = mainContent.split(' ');
  const description = words.slice(0, 50).join(' ').trim();
  
  return `${productName} - A premium ${niche} product that ${description.toLowerCase()}...`.substring(0, 200) + '.';
}