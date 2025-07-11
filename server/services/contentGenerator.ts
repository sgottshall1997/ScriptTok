import { openai } from './openai';
import { generateWithAI, AIModel } from './aiModelRouter';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption, Niche } from '@shared/constants';
import * as GptTemplates from './gpt-templates';
import { generatePrompt, PromptParams } from '../prompts';
import { getModelConfig, getTokenLimit } from './aiModelSelector';
import { getMostSuccessfulPatterns } from '../database/feedbackLogger';
import { getCritiqueFromGPT } from './gptCritic';
import { enhanceContentCompliance, ComplianceOptions } from './complianceEnhancer';

// Smart style usage logging function (for future Google Sheets integration)
export function logSmartStyleUsage(params: {
  userId: number;
  niche: string;
  templateType: string;
  tone: string;
  useSmartStyle: boolean;
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
    useSmartStyle: params.useSmartStyle,
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
function cleanVideoScript(content: string): string {
  return content
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
    .trim()
    // Ensure sentences flow naturally for video narration
    .replace(/\n\n/g, ' ')
    .replace(/\n/g, ' ')
    // Clean up extra spaces
    .replace(/\s+/g, ' ');
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
  aiModel: AIModel = "chatgpt"
): Promise<{ 
  content: string; 
  fallbackLevel?: 'exact' | 'default' | 'generic';
  prompt?: string;
  model?: string;
  tokens?: number;
  videoDuration?: VideoDuration;
}> {
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
    let prompt: string;
    let fallbackLevel: 'exact' | 'default' | 'generic' = 'exact';
    
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
        useSmartStyle: true,
        userId: 1, // Demo user ID
        bestRatedStyle,
        trendingProducts
      });
    } else {
      // Use standard generatePrompt
      const promptParams: PromptParams = {
        niche,
        productName: product,
        templateType,
        tone,
        trendingProducts,
        fallbackLevel: 'exact',
        successfulPatterns
      };
      
      prompt = await generatePrompt(promptParams);
      fallbackLevel = promptParams.fallbackLevel || 'exact';
    }
    
    // Get optimized AI model configuration for this specific content generation
    const modelConfig = getModelConfig({
      niche: niche as Niche,
      templateType,
      tone
    });
    
    // Get appropriate token limit based on template type
    const maxTokens = getTokenLimit(templateType);
    
    // Log the content generation request for analytics
    console.log(`Generating ${templateType} content for ${product} in ${niche} niche using ${tone} tone.`);
    
    // Enhanced system prompt with viral inspiration integration
    let systemPrompt = "You're an AI scriptwriter for short-form video content focused on product reviews and recommendations. Your job is to generate ONLY the spoken narration script — clean and natural sounding — without including any visual directions, shot cues, or internal notes. Do NOT include phrases like 'Opening shot:', 'Scene:', 'Visual:', 'Cut to:', 'Note:', or 'This video shows...'. Just return the actual lines that would be read aloud by a narrator or presenter. Keep it short, punchy, and engaging — around 25-30 seconds long, conversational in tone, and formatted as a simple paragraph. Add line breaks only if there's a natural pause.";
    
    // Enhanced user prompt with viral inspiration context
    let userPrompt = `Create a clean video script for ${product} in ${niche} niche using ${tone} tone. Product: ${product}. Tone: ${tone}. Output: Only the clean spoken script.`;
    
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
        useSmartStyle: true,
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

    // Call AI model router with the enhanced prompt and optimized parameters
    console.log(`🤖 Generating content with ${aiModel.toUpperCase()} model`);
    
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
        fallbackLevel
      }
    });

    if (!aiResponse.success) {
      throw new Error(`AI generation failed: ${aiResponse.error}`);
    }

    const content = aiResponse.content;

    // Clean up the content for video scripts (remove markdown, asterisks, hashtag headers)
    const rawContent = content || "Could not generate content. Please try again.";
    const cleanedContent = cleanVideoScript(rawContent);

    // Estimate video duration for the cleaned content
    const videoDuration = estimateVideoDuration(cleanedContent);

    // Return additional metadata for history tracking
    return {
      content: cleanedContent,
      fallbackLevel,
      prompt,
      model: aiResponse.model || aiModel,
      tokens: aiResponse.tokens || 0,
      videoDuration
    };
      
  } catch (error) {
    console.error("Error generating content with enhanced system:", error);
    
    try {
      // Try a more reliable configuration with the same prompt
      console.log("Attempting generation with fallback model configuration");
      
      // Use a more reliable fallback configuration with proper type casting
      const messages: Array<{role: "system" | "user" | "assistant", content: string}> = [
        {
          role: "system",
          content: "You're an AI scriptwriter for short-form video content focused on product reviews and recommendations. Your job is to generate ONLY the spoken narration script — clean and natural sounding — without including any visual directions, shot cues, or internal notes. Do NOT include phrases like 'Opening shot:', 'Scene:', 'Visual:', 'Cut to:', 'Note:', or 'This video shows...'. Just return the actual lines that would be read aloud by a narrator or presenter. Keep it short, punchy, and engaging — around 25-30 seconds long, conversational in tone, and formatted as a simple paragraph. Add line breaks only if there's a natural pause."
        },
        {
          role: "user",
          content: `Create a clean video script for ${product} in ${niche} niche using ${tone} tone. Product: ${product}. Tone: ${tone}. Output: Only the clean spoken script.`
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
      
      const genericPrompt = `Create ${templateType} content for ${product} in a ${tone} tone. This is for the ${niche} niche.`;
      
      // Clean up the fallback content for video scripts too
      const fallbackContent = fallbackCompletion.choices[0].message.content || "Could not generate content. Please try again.";
      const cleanedFallbackContent = cleanVideoScript(fallbackContent);
      const fallbackVideoDuration = estimateVideoDuration(cleanedFallbackContent);

      return {
        content: cleanedFallbackContent,
        fallbackLevel: 'generic', // Model fallback is considered generic
        prompt: genericPrompt,
        model: "gpt-4o",
        tokens: fallbackCompletion.usage?.total_tokens || 0,
        videoDuration: fallbackVideoDuration
      };
      
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      
      // Fallback to the legacy system if all else fails
      console.log("Falling back to legacy template system");
      console.warn(`[PromptFactory] Deep fallback to legacy templates → niche=${niche}, type=${templateType}, fallbackLevel=legacy`);
      
      // Generate content based on template type using the legacy system
      let legacyContent = "";
      
      switch (templateType) {
        case "original":
          legacyContent = await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
          break;
        case "comparison":
          legacyContent = await GptTemplates.generateProductComparison(openai, product, tone, trendingProducts);
          break;
        case "caption":
          legacyContent = await GptTemplates.generateCaption(openai, product, tone);
          break;
        case "pros_cons":
          legacyContent = await GptTemplates.generateProsAndCons(openai, product, tone);
          break;
        case "routine":
          legacyContent = await GptTemplates.generateRoutine(openai, product, tone);
          break;
        case "beginner_kit":
          legacyContent = await GptTemplates.generateBeginnerKit(openai, product, tone);
          break;
        case "demo_script":
          legacyContent = await GptTemplates.generateDemoScript(openai, product, tone);
          break;
        case "drugstore_dupe":
          legacyContent = await GptTemplates.generateDrugstoreDupe(openai, product, tone);
          break;
        case "personal_review":
          legacyContent = await GptTemplates.generatePersonalReview(openai, product, tone);
          break;
        case "surprise_me":
          legacyContent = await GptTemplates.generateSurpriseMe(openai, product, tone);
          break;
        case "tiktok_breakdown":
          legacyContent = await GptTemplates.generateTikTokBreakdown(openai, product, tone);
          break;
        case "dry_skin_list":
          legacyContent = await GptTemplates.generateDrySkinList(openai, product, tone);
          break;
        case "top5_under25":
          legacyContent = await GptTemplates.generateTop5Under25(openai, product, tone);
          break;
        case "influencer_caption":
          legacyContent = await GptTemplates.generateInfluencerCaption(openai, product, tone);
          break;
        default:
          legacyContent = await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
      }
      
      const legacyPrompt = `Create ${templateType} content for ${product} using legacy templates in a ${tone} tone. This is for the ${niche} niche.`;
      const legacyVideoDuration = estimateVideoDuration(legacyContent);
      
      return {
        content: legacyContent,
        fallbackLevel: 'generic', // Consider legacy system as generic fallback
        prompt: legacyPrompt,
        model: "gpt-4o",
        tokens: 0, // We don't have token usage from legacy system
        videoDuration: legacyVideoDuration
      };
    }
  }
}
