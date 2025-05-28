import { openai } from './openai';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption, Niche } from '@shared/constants';
import * as GptTemplates from './gpt-templates';
import { generatePrompt, PromptParams } from '../prompts';
import { getModelConfig, getTokenLimit } from './aiModelSelector';
import { getMostSuccessfulPatterns } from '../database/feedbackLogger';

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
export async function generateContent(
  product: string,
  templateType: TemplateType,
  tone: ToneOption,
  trendingProducts: TrendingProduct[],
  niche: Niche = "skincare",
  model: string = "gpt-4o"
): Promise<{ 
  content: string; 
  fallbackLevel?: 'exact' | 'default' | 'generic';
  prompt?: string;
  model?: string;
  tokens?: number;
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

    // First try using the new modular prompt system
    const promptParams: PromptParams = {
      niche,
      productName: product,
      templateType,
      tone,
      trendingProducts,
      fallbackLevel: 'exact', // Initialize with default value
      successfulPatterns // Pass successful patterns to enhance prompt generation
    };
    
    const prompt = await generatePrompt(promptParams);
    
    // Get the fallbackLevel that was set during prompt generation
    const fallbackLevel = promptParams.fallbackLevel || 'exact';
    
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
    
    // Call OpenAI with the generated prompt and optimized parameters
    const completion = await openai.chat.completions.create({
      model: model, // Use the model parameter passed to the function (supports fallback to gpt-3.5-turbo)
      messages: [
        {
          role: "system",
          content: "You are a highly knowledgeable content creator specializing in product descriptions, reviews, and marketing content. Your goal is to create engaging, informative content based on the prompt provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: modelConfig.temperature,
      max_tokens: maxTokens,
      frequency_penalty: modelConfig.frequencyPenalty,
      presence_penalty: modelConfig.presencePenalty
    });

    // Return additional metadata for history tracking
    return {
      content: completion.choices[0].message.content || "Could not generate content. Please try again.",
      fallbackLevel,
      prompt,
      model: model,
      tokens: completion.usage?.total_tokens || 0
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
          content: "You are a content creation expert. Generate high-quality content about the product according to the specified template type and tone."
        },
        {
          role: "user",
          content: `Create ${templateType} content for ${product} in a ${tone} tone. This is for the ${niche} niche.`
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
      
      return {
        content: fallbackCompletion.choices[0].message.content || "Could not generate content. Please try again.",
        fallbackLevel: 'generic', // Model fallback is considered generic
        prompt: genericPrompt,
        model: "gpt-4o",
        tokens: fallbackCompletion.usage?.total_tokens || 0
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
      
      return {
        content: legacyContent,
        fallbackLevel: 'generic', // Consider legacy system as generic fallback
        prompt: legacyPrompt,
        model: "gpt-4o",
        tokens: 0 // We don't have token usage from legacy system
      };
    }
  }
}

// Function to estimate video duration based on content
export function estimateVideoDuration(content: string, tone: ToneOption, templateType: TemplateType): VideoDuration {
  // Strip HTML tags to get clean text
  const plainText = content.replace(/<[^>]*>?/gm, '');
  
  // Calculate word count
  const words = plainText.trim().split(/\s+/).length;
  
  // Estimate words per minute based on tone and template
  let wordsPerMinute = 150; // Default moderate pace
  
  // Adjust for tone - enthusiastic is faster, professional is slower
  switch (tone) {
    case 'enthusiastic':
      wordsPerMinute = 180; // Faster pace
      break;
    case 'professional':
      wordsPerMinute = 130; // Slower, more deliberate pace
      break;
    case 'minimalist':
      wordsPerMinute = 160; // Slightly faster than moderate
      break;
    case 'trendy':
      wordsPerMinute = 185; // Very fast pace for trendy content
      break;
    case 'scientific':
      wordsPerMinute = 120; // Slowest pace for technical content
      break;
    case 'educational':
      wordsPerMinute = 135; // Slower for explanation
      break;
    case 'luxurious':
      wordsPerMinute = 125; // Slower, elegant pace
      break;
    case 'poetic':
      wordsPerMinute = 120; // Slow, measured pace
      break;
    case 'humorous':
      wordsPerMinute = 165; // Slightly faster for humor
      break;
    case 'casual':
      wordsPerMinute = 155; // Slightly above moderate
      break;
    case 'friendly':
    default:
      wordsPerMinute = 150; // Moderate pace
  }
  
  // Adjust for template type - captions are faster, detailed reviews slower
  switch (templateType) {
    case 'caption':
    case 'influencer_caption':
      wordsPerMinute += 30; // Social media captions are read faster
      break;
    case 'original':
    case 'pros_cons':
      wordsPerMinute -= 10; // Detailed reviews need more time
      break;
    case 'comparison':
      wordsPerMinute -= 20; // Comparisons need more explanation time
      break;
    case 'routine':
      wordsPerMinute -= 15; // Routines need demonstration time
      break;
    case 'recipe':
      wordsPerMinute -= 25; // Recipes need detailed explanation
      break;
    case 'demo_script':
      wordsPerMinute -= 20; // Demonstration scripts need visual explanation time
      break;
    case 'packing_list':
      wordsPerMinute -= 5; // Lists are a bit slower than baseline
      break;
    case 'tiktok_breakdown':
      wordsPerMinute += 20; // TikTok content is fast-paced
      break;
  }
  
  // Calculate seconds
  const seconds = Math.round((words / wordsPerMinute) * 60);
  
  // Determine pacing category
  let pacing: 'slow' | 'moderate' | 'fast';
  if (wordsPerMinute < 140) pacing = 'slow';
  else if (wordsPerMinute > 170) pacing = 'fast';
  else pacing = 'moderate';
  
  // Format readable time (MM:SS)
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const readableTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  // Determine if this is an ideal length for social media (30-60 seconds)
  const isIdealLength = seconds >= 30 && seconds <= 65; // Give a little extra buffer
  
  // Generate feedback based on length
  let lengthFeedback = '';
  if (seconds < 20) {
    lengthFeedback = "Content is too short for effective engagement. Consider adding more details or examples.";
  } else if (seconds < 30) {
    lengthFeedback = "Content is slightly shorter than ideal. A few more details could improve engagement.";
  } else if (seconds <= 60) {
    lengthFeedback = "Perfect length for social media! This content hits the ideal 30-60 second sweet spot.";
  } else if (seconds <= 90) {
    lengthFeedback = "Content is slightly longer than ideal. Consider trimming some details for better engagement.";
  } else {
    lengthFeedback = "Content is too long for optimal social media engagement. Try to condense the main points.";
  }
  
  return {
    seconds,
    readableTime,
    wordCount: words,
    pacing,
    isIdealLength,
    lengthFeedback
  };
}
