import { openai } from './openai';
import { generateWithAI, AIModel } from './aiModelRouter';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption, Niche } from '@shared/constants';
import * as GptTemplates from './gpt-templates';
import { TEMPLATE_PROMPTS, type PromptConfig } from './promptFactory.js';
// import { getModelConfig, getTokenLimit } from './aiModelSelector'; // TODO: Implement AI model selector
import { getMostSuccessfulPatterns } from '../database/feedbackLogger';
import { getCritiqueFromGPT } from './gptCritic';
import { enhanceContentCompliance, ComplianceOptions } from './complianceEnhancer';
import { validateContent, ValidationResult } from './contentValidator';
import { logValidation } from './validationLogger';

// Smart style usage logging function (for future Google Sheets integration)
export function logSmartStyleUsage(params: {
  userId: number;
  niche: string;
  templateType: string;
  tone: string;
  topRatedStyleUsed: boolean;
  hasRecommendations: boolean;
  averageRating?: number;
  sampleCount?: number;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId: params.userId,
    niche: params.niche,
    templateType: params.templateType,
    tone: params.tone,
    topRatedStyleUsed: params.topRatedStyleUsed,
    hasRecommendations: params.hasRecommendations,
    averageRating: params.averageRating || null,
    sampleCount: params.sampleCount || null
  };

  // Log to console for now (future: Google Sheets API integration)
  console.log('📊 Smart Style Usage Log:', JSON.stringify(logEntry, null, 2));

  // TODO: Implement Google Sheets API logging
  // This could be done via Google Sheets API or webhook to Google Apps Script
}

// Function to clean video scripts for Pictory - removes markdown formatting and hashtags
function cleanVideoScript(content: string | any): string {
  // Handle different response structures from different AI models
  let actualContent = content;

  if (typeof content === 'object' && content.content) {
    // Claude response structure: { content: "actual content", model: "claude-3-5-sonnet-20241022", ... }
    actualContent = content.content;
  }

  // Ensure content is a string
  if (typeof actualContent !== 'string') {
    console.error('cleanVideoScript received non-string content after extraction:', typeof actualContent, actualContent);
    return String(actualContent || '');
  }

  return actualContent
    // Remove hashtags completely from the content
    .replace(/#\w+/g, '')
    // Remove markdown headers (### Title:, #### Section:, etc.)
    .replace(/#{1,6}\s+.*?:/g, '')
    // Remove asterisks used for emphasis (**bold**, *italic*)
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    // Remove markdown bullet points (- item, * item)
    .replace(/^[\s]*[-*]\s+/gm, '')
    // Remove numbered list formatting (1. item, 2. item)
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove extra whitespace and line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim();
}

// Function to format content by sentences for TikTok display and storage
function formatBySentences(content: string): string {
  // First clean the content
  const cleaned = cleanVideoScript(content);
  
  // Split by sentence endings, keeping the punctuation
  const sentences = cleaned.split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
  
  // Join sentences with double line breaks for paragraph separation
  return sentences.join('\n\n');
}

// Function to estimate video duration based on content
function estimateVideoDuration(content: string): VideoDuration {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Average speaking rates for different content types
  const wordsPerSecond = {
    slow: 2.0,     // Deliberate, clear pace for tutorials
    moderate: 2.5, // Normal conversational pace  
    fast: 3.0      // Energetic, TikTok-style pace
  };

  // Determine pacing based on content length and style
  let pacing: 'slow' | 'moderate' | 'fast';
  if (wordCount < 50) {
    pacing = 'fast'; // Short content tends to be punchy
  } else if (wordCount < 100) {
    pacing = 'moderate'; 
  } else {
    pacing = 'slow'; // Longer content needs clearer delivery
  }

  const seconds = Math.round(wordCount / wordsPerSecond[pacing]);

  // Format readable time
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const readableTime = minutes > 0 
    ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    : `${seconds}s`;

  // Ideal length feedback for social media
  const isIdealLength = seconds >= 15 && seconds <= 60; // Sweet spot for TikTok/Instagram

  let lengthFeedback: string;
  if (seconds < 15) {
    lengthFeedback = "Consider adding more detail - very short for engagement";
  } else if (seconds <= 30) {
    lengthFeedback = "Perfect length for TikTok and Instagram Reels";
  } else if (seconds <= 60) {
    lengthFeedback = "Great length for detailed product showcase";
  } else {
    lengthFeedback = "Consider shortening for better social media performance";
  }

  return {
    seconds,
    readableTime,
    wordCount,
    pacing,
    isIdealLength,
    lengthFeedback
  };
}

// Export the estimateVideoDuration function
export { estimateVideoDuration };

// Video duration estimation interface
interface VideoDuration {
  seconds: number;
  readableTime: string;
  wordCount: number;
  pacing: 'slow' | 'moderate' | 'fast';
  isIdealLength: boolean;
  lengthFeedback: string;
}

/**
 * Main content generation function with support for multiple niches
 * @param product Product name to generate content for
 * @param templateType Type of content to generate
 * @param tone Tone of voice for the content
 * @param niche Content niche (skincare, tech, fashion, etc.)
 * @param trendingProducts Trending products to use as context
 * @returns Generated content as string
 */
export interface ViralInspiration {
  hook: string;
  format: string;
  caption: string;
  hashtags: string[];
}

export async function generateContent(
  product: string,
  templateType: TemplateType,
  tone: ToneOption,
  trendingProducts: TrendingProduct[],
  niche: Niche = "skincare",
  model: string = "gpt-4o",
  viralInspiration?: ViralInspiration,
  smartStyleRecommendations?: any,
  aiModel: AIModel = "chatgpt",
  viralTopic?: string
): Promise<{ 
  content: string; 
  fallbackLevel?: 'exact' | 'default' | 'generic';
  prompt?: string;
  model?: string;
  tokens?: number;
  videoDuration?: VideoDuration;
  validationResult?: ValidationResult;
}> {
  // Declare prompt variables outside try block for fallback access
  let prompt: string;
  let systemPrompt: string = "";
  let userPrompt: string = "";
  let fallbackLevel: 'exact' | 'default' | 'generic' = 'exact';

  try {
    // 🎯 Get most successful patterns from user feedback
    let successfulPatterns: { mostUsedTone: string | null; mostUsedTemplateType: string | null } = { 
      mostUsedTone: null, 
      mostUsedTemplateType: null 
    };
    try {
      successfulPatterns = await getMostSuccessfulPatterns();
      if (successfulPatterns.mostUsedTone || successfulPatterns.mostUsedTemplateType) {
        console.log(`🎯 Found successful patterns - Tone: ${successfulPatterns.mostUsedTone || 'none'}, Template: ${successfulPatterns.mostUsedTemplateType || 'none'}`);
      }
    } catch (error) {
      console.log('No successful patterns found yet, using provided parameters');
    }

    // Use promptFactory for smart style support or generatePrompt for standard generation

    if (smartStyleRecommendations) {
      // Convert smart style recommendations to BestRatedStyle format
      const bestRatedStyle = {
        toneSummary: smartStyleRecommendations.recommendation.split('.')[0] || 'engaging, authentic',
        structureHint: smartStyleRecommendations.patterns.topPerformingStructures[0] || 'Hook → Key Benefits → Call to Action',
        topHashtags: ['#trending', '#viral'], // Default hashtags since smart recommendations don't include these yet
        highRatedCaptionExample: smartStyleRecommendations.patterns.commonTones.join(' and ') || undefined
      };

      // Import and use promptFactory for enhanced style learning
      const { promptFactory } = await import('../prompts');
      prompt = await promptFactory({
        productName: product,
        tone,
        template: templateType,
        platform: 'general', // Could be enhanced to detect platform
        niche,
        topRatedStyleUsed: true,
        userId: 1, // Demo user ID
        bestRatedStyle,
        trendingProducts
      });
    } else {
      // Use new TEMPLATE_PROMPTS structure
      const promptConfig: PromptConfig = {
        productName: product,
        viralTopic: viralTopic, // Pass viral topic for viral templates
        contentMode: viralTopic ? 'viral' : 'affiliate', // Set content mode based on viral topic
        niche: niche as any,
        templateType: templateType as any,
        tone: tone as any,
        trendingProducts,
        contentFormat: 'regular'
      };

      // Get the appropriate template function from TEMPLATE_PROMPTS
      const templateFunction = TEMPLATE_PROMPTS[templateType as keyof typeof TEMPLATE_PROMPTS];
      
      if (templateFunction) {
        console.log(`✅ Using TEMPLATE_PROMPTS for ${templateType} template`);
        const templateResult = templateFunction(promptConfig);
        prompt = templateResult.userPrompt;
        systemPrompt = templateResult.systemPrompt;
        userPrompt = templateResult.userPrompt;
        fallbackLevel = 'exact';
      } else {
        console.warn(`⚠️ Template ${templateType} not found in TEMPLATE_PROMPTS, using fallback`);
        prompt = `Write about ${product} in the ${niche} niche using a ${tone} tone. This should be in the format of a ${templateType}.`;
        systemPrompt = "You are an expert content creator.";
        userPrompt = prompt;
        fallbackLevel = 'generic';
      }
    }

    // Use default configuration values
    const modelConfig = { temperature: 0.7 };
    const maxTokens = 2048;

    // Log the content generation request for analytics
    console.log(`🚨 CONTENT GENERATOR AI MODEL DEBUG: aiModel parameter = "${aiModel}"`);
    console.log(`🔥 GENERATING ${templateType} content for ${product} in ${niche} niche using ${tone} tone with AI model: ${aiModel?.toUpperCase() || 'CLAUDE'}`);

    if (aiModel !== 'claude' && aiModel !== 'chatgpt') {
      console.error(`❌ INVALID AI MODEL: "${aiModel}" - Must be 'claude' or 'chatgpt'`);
    }

    // If no template was found, use enhanced defaults
    if (!systemPrompt) {
      systemPrompt = "You're an AI scriptwriter for short-form video content focused on product reviews and recommendations. Your job is to generate ONLY the spoken narration script — clean and natural sounding — without including any visual directions, shot cues, or internal notes. Do NOT include phrases like 'Opening shot:', 'Scene:', 'Visual:', 'Cut to:', 'Note:', or 'This video shows...'. Just return the actual lines that would be read aloud by a narrator or presenter. Keep it short, punchy, and engaging — around 25-30 seconds long, conversational in tone, and formatted as a simple paragraph. Add line breaks only if there's a natural pause.";
    }
    
    if (!userPrompt) {
      userPrompt = `Create a clean video script for ${product} in ${niche} niche using ${tone} tone. Product: ${product}. Tone: ${tone}. Output: Only the clean spoken script.`;
    }

    // Inject viral inspiration if available
    if (viralInspiration) {
      console.log('🎯 Using viral inspiration to enhance content generation:', viralInspiration);

      systemPrompt += `\n\nIMPORTANT: Use this real viral inspiration to guide the tone and structure of your content:
- Hook Style: ${viralInspiration.hook}
- Format: ${viralInspiration.format}
- Caption Style: ${viralInspiration.caption}
- Popular Hashtags: ${viralInspiration.hashtags.join(" ")}

Mimic the viral format, tone, and pacing while adapting it for the new product. Include a call-to-action to click the affiliate link.`;

      userPrompt = `You are creating a viral short-form video script for TikTok/Instagram. Use this real viral inspiration to guide the tone and structure:

VIRAL INSPIRATION:
- Hook: ${viralInspiration.hook}
- Format: ${viralInspiration.format}
- Caption Style: ${viralInspiration.caption}
- Hashtags: ${viralInspiration.hashtags.join(" ")}

PRODUCT DETAILS:
- Product: ${product}
- Niche: ${niche}
- Tone: ${tone}

Generate a highly engaging script that mimics this viral format, tone, and pacing. Include a call-to-action to click the affiliate link. Output: Only the clean spoken script.`;
    }

    // Inject smart style recommendations if available
    if (smartStyleRecommendations) {
      console.log('🎯 Using smart style recommendations from user\'s best-rated content:', smartStyleRecommendations.recommendation);

      // Log smart style usage for analytics (future Google Sheets integration)
      logSmartStyleUsage({
        userId: 1, // Demo user ID
        niche,
        templateType,
        tone,
        topRatedStyleUsed: true,
        hasRecommendations: true,
        averageRating: smartStyleRecommendations.averageRating,
        sampleCount: smartStyleRecommendations.sampleCount
      });

      systemPrompt += `\n\nSMART STYLE ENHANCEMENT: This user has high-performing content patterns. Apply these insights:
${smartStyleRecommendations.recommendation}

BEST PERFORMING EXAMPLES:
${smartStyleRecommendations.patterns.bestContent.slice(0, 2).map((content: string, index: number) => 
  `Example ${index + 1}: ${content.substring(0, 200)}...`
).join('\n')}

Match the structure, tone patterns, and successful elements from these high-rated posts (${smartStyleRecommendations.averageRating}/100 average).`;

      userPrompt += `\n\nUSER'S BEST-RATED STYLE:
Apply these successful patterns from your previous high-rated content:
- ${smartStyleRecommendations.recommendation}
- Average rating of reference content: ${smartStyleRecommendations.averageRating}/100
- Based on ${smartStyleRecommendations.sampleCount} high-performing posts`;
    }

    // ABSOLUTE CLAUDE ENFORCEMENT - Double check model before AI call
    if (aiModel === 'claude') {
      console.log(`🚨 CONTENT GENERATOR CLAUDE VERIFICATION: Model is claude - FORCING Claude generation`);
      console.log(`🔒 CLAUDE LOCKED: Ensuring generateWithAI receives claude parameter`);
    } else if (aiModel === 'chatgpt') {
      console.log(`🤖 CONTENT GENERATOR CHATGPT ROUTE: Model is chatgpt - allowing ChatGPT generation`);
    } else {
      console.error(`❌ INVALID AI MODEL IN CONTENT GENERATOR: "${aiModel}" - Must be 'claude' or 'chatgpt'`);
    }

    // Call AI model router with the enhanced prompt and optimized parameters
    console.log(`🤖 GENERATING CONTENT WITH ${aiModel?.toUpperCase() || 'CLAUDE'} MODEL`);

    const aiResponse = await generateWithAI(userPrompt, {
      model: aiModel,
      maxTokens: maxTokens,
      temperature: modelConfig.temperature,
      systemPrompt: systemPrompt,
      metadata: {
        niche,
        templateType,
        tone,
        product,
        fallbackLevel,
        contentGeneratorModel: aiModel // Track model through pipeline
      }
    });

    if (!aiResponse.success) {
      throw new Error(`AI generation failed: ${aiResponse.error}`);
    }

    const content = aiResponse.content;

    // Clean up the content for video scripts (remove markdown, asterisks, hashtag headers)
    const rawContent = content || "Could not generate content. Please try again.";
    const cleanedContent = cleanVideoScript(rawContent);
    
    // Format by sentences for TikTok display and storage
    const formattedContent = formatBySentences(rawContent);

    // Estimate video duration for the cleaned content
    const videoDuration = estimateVideoDuration(cleanedContent);

    // Validate content
    const validationResult = validateContent(formattedContent, templateType);

    // Log validation result
    logValidation(templateType, validationResult);

    if (!validationResult.isValid) {
      console.warn('⚠️ Content validation failed:', {
        templateType,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      });
      
      // Log validation failures for monitoring (don't block content)
      // Future: Could implement retry logic or fallback here
    }

    if (validationResult.warnings.length > 0) {
      console.info('ℹ️ Content validation warnings:', validationResult.warnings);
    }

    // Return additional metadata for history tracking
    return {
      content: formattedContent, // Use sentence-formatted version
      fallbackLevel,
      prompt,
      model: aiResponse.model || aiModel,
      tokens: aiResponse.tokens || 0,
      videoDuration,
      validationResult
    };

  } catch (error) {
    console.error("Error generating content with enhanced system:", error);

    try {
      // Try a more reliable configuration using the SAME template prompts that were generated
      console.log("Attempting generation with fallback model configuration using original template prompts");

      // Use the proper template prompts instead of hardcoded generic ones
      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
        {
          role: "system",
          content: systemPrompt // Use the ACTUAL template system prompt (e.g., "expert in product comparisons")
        },
        {
          role: "user",
          content: userPrompt // Use the ACTUAL template user prompt (e.g., "Write a detailed comparison...")
        }
      ];

      // Try the fallback request
      const fallbackCompletion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      });

      const genericPrompt = userPrompt; // Use the actual template prompt instead of generic one

      // Clean up the fallback content for video scripts too
      const fallbackContent = fallbackCompletion.choices[0].message.content || "Could not generate content. Please try again.";
      const cleanedFallbackContent = cleanVideoScript(fallbackContent);
      const formattedFallbackContent = formatBySentences(fallbackContent);
      const fallbackVideoDuration = estimateVideoDuration(cleanedFallbackContent);

      // Validate fallback content
      const fallbackValidationResult = validateContent(formattedFallbackContent, templateType);

      // Log validation result
      logValidation(templateType, fallbackValidationResult);

      if (!fallbackValidationResult.isValid) {
        console.warn('⚠️ Fallback content validation failed:', {
          templateType,
          errors: fallbackValidationResult.errors,
          warnings: fallbackValidationResult.warnings
        });
      }

      return {
        content: formattedFallbackContent, // Use sentence-formatted version
        fallbackLevel: 'default', // OpenAI fallback using template prompts
        prompt: genericPrompt,
        model: "gpt-4o",
        tokens: fallbackCompletion.usage?.total_tokens || 0,
        videoDuration: fallbackVideoDuration,
        validationResult: fallbackValidationResult
      };

    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);

      // Fallback to the legacy system if all else fails
      console.log("Falling back to legacy template system");
      console.warn(`[PromptFactory] Deep fallback to legacy templates → niche=${niche}, type=${templateType}, fallbackLevel=legacy`);

      // Generate content based on template type using the legacy system
      let legacyContent = "";

      switch (templateType) {
        case "product_comparison":
          legacyContent = await GptTemplates.generateProductComparison(openai, product, tone, trendingProducts);
          break;
        case "influencer_caption":
          legacyContent = await GptTemplates.generateCaption(openai, product, tone);
          break;
        case "routine_kit":
          legacyContent = await GptTemplates.generateRoutine(openai, product, tone);
          break;
        case "seo_blog":
          legacyContent = await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
          break;
        case "short_video":
          legacyContent = await GptTemplates.generateDemoScript(openai, product, tone);
          break;
        case "affiliate_email":
          legacyContent = await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
          break;
        default:
          legacyContent = await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
      }

      const legacyPrompt = `Create ${templateType} content for ${product} using legacy templates in a ${tone} tone. This is for the ${niche} niche.`;
      const formattedLegacyContent = formatBySentences(legacyContent);
      const legacyVideoDuration = estimateVideoDuration(legacyContent);

      // Validate legacy fallback content
      const legacyValidationResult = validateContent(formattedLegacyContent, templateType);

      // Log validation result
      logValidation(templateType, legacyValidationResult);

      if (!legacyValidationResult.isValid) {
        console.warn('⚠️ Legacy fallback content validation failed:', {
          templateType,
          errors: legacyValidationResult.errors,
          warnings: legacyValidationResult.warnings
        });
      }

      return {
        content: formattedLegacyContent, // Use sentence-formatted version
        fallbackLevel: 'generic', // Consider legacy system as generic fallback
        prompt: legacyPrompt,
        model: "gpt-4o",
        tokens: 0, // We don't have token usage from legacy system
        videoDuration: legacyVideoDuration,
        validationResult: legacyValidationResult
      };
    }
  }
}