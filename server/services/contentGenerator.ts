import { openai } from './openai';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption, Niche } from '@shared/constants';
import * as GptTemplates from './gpt-templates';
import { generatePrompt } from '../prompts';

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
  niche: Niche = "skincare"
): Promise<string> {
  try {
    // First try using the new modular prompt system
    const prompt = await generatePrompt({
      niche,
      productName: product,
      templateType,
      tone,
      trendingProducts
    });
    
    // Call OpenAI with the generated prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      temperature: 0.7,
      max_tokens: 1500
    });

    return completion.choices[0].message.content || 
      "Could not generate content. Please try again.";
      
  } catch (error) {
    console.error("Error generating content with modular system:", error);
    
    // Fallback to the old system if there's an error
    console.log("Falling back to legacy template system");
    
    // Generate content based on template type using the old system
    switch (templateType) {
      case "original":
        return await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
      case "comparison":
        return await GptTemplates.generateProductComparison(openai, product, tone, trendingProducts);
      case "caption":
        return await GptTemplates.generateCaption(openai, product, tone);
      case "pros_cons":
        return await GptTemplates.generateProsAndCons(openai, product, tone);
      case "routine":
        return await GptTemplates.generateRoutine(openai, product, tone);
      case "beginner_kit":
        return await GptTemplates.generateBeginnerKit(openai, product, tone);
      case "demo_script":
        return await GptTemplates.generateDemoScript(openai, product, tone);
      case "drugstore_dupe":
        return await GptTemplates.generateDrugstoreDupe(openai, product, tone);
      case "personal_review":
        return await GptTemplates.generatePersonalReview(openai, product, tone);
      case "surprise_me":
        return await GptTemplates.generateSurpriseMe(openai, product, tone);
      case "tiktok_breakdown":
        return await GptTemplates.generateTikTokBreakdown(openai, product, tone);
      case "dry_skin_list":
        return await GptTemplates.generateDrySkinList(openai, product, tone);
      case "top5_under25":
        return await GptTemplates.generateTop5Under25(openai, product, tone);
      case "influencer_caption":
        return await GptTemplates.generateInfluencerCaption(openai, product, tone);
      default:
        return await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
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
