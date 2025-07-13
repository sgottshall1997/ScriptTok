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
  contentFormat: 'regular' | 'spartan';
  aiModel: 'chatgpt' | 'claude';
  affiliateId?: string;
  trendingProducts?: TrendingProduct[];
  viralInspiration?: any;
  smartStyleRecommendations?: any;
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

  // Extract content based on AI model response structure
  let content = '';
  if (aiResponse.content?.content) {
    content = aiResponse.content.content; // Claude structure
  } else if (aiResponse.data) {
    content = aiResponse.data; // ChatGPT structure
  } else {
    throw new Error('Invalid AI response structure');
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
      const platformPrompt = await createPlatformPrompt(platform, {
        ...config,
        platforms: [platform]
      });

      // Add main content context to platform prompt
      const enhancedPrompt = `${platformPrompt}

Main content for reference:
"""
${mainContent.substring(0, 500)}...
"""

Create platform-native content that complements but doesn't repeat the main content.`;

      const aiResponse = await generateWithAI(enhancedPrompt, {
        model: config.aiModel,
        systemPrompt: `You are a ${platform} content specialist. Create platform-native captions that maximize engagement.`,
        temperature: 0.8,
        maxTokens: 500,
        useJson: false,
        metadata: {
          platform,
          niche: config.niche,
          productName: config.productName,
          contentFormat: config.contentFormat
        }
      });

      if (aiResponse.success) {
        let caption = '';
        if (aiResponse.content?.content) {
          caption = aiResponse.content.content; // Claude
        } else if (aiResponse.data) {
          caption = aiResponse.data; // ChatGPT
        }

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