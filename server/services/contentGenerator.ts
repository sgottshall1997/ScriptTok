import { openai } from './openai';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption } from '@shared/constants';
import * as GptTemplates from './gpt-templates';

// Video duration estimation interface
interface VideoDuration {
  seconds: number;
  readableTime: string;
  wordCount: number;
  pacing: 'slow' | 'moderate' | 'fast';
}

// Main content generation function
export async function generateContent(
  product: string,
  templateType: TemplateType,
  tone: ToneOption,
  trendingProducts: TrendingProduct[]
): Promise<string> {
  // Generate content based on template type
  switch (templateType) {
    case "original":
      return await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
    case "comparison":
      return await GptTemplates.generateProductComparison(openai, product, tone, trendingProducts);
    case "caption":
      return await GptTemplates.generateCaption(openai, product, tone);
    case "pros-cons":
      return await GptTemplates.generateProsAndCons(openai, product, tone);
    case "routine":
      return await GptTemplates.generateRoutine(openai, product, tone);
    case "beginner-kit":
      return await GptTemplates.generateBeginnerKit(openai, product, tone);
    case "demo-script":
      return await GptTemplates.generateDemoScript(openai, product, tone);
    case "drugstore-dupe":
      return await GptTemplates.generateDrugstoreDupe(openai, product, tone);
    case "personal-review":
      return await GptTemplates.generatePersonalReview(openai, product, tone);
    case "surprise-me":
      return await GptTemplates.generateSurpriseMe(openai, product, tone);
    case "tiktok-breakdown":
      return await GptTemplates.generateTikTokBreakdown(openai, product, tone);
    case "dry-skin-list":
      return await GptTemplates.generateDrySkinList(openai, product, tone);
    case "top-5-under-25":
      return await GptTemplates.generateTop5Under25(openai, product, tone);
    case "influencer-caption":
      return await GptTemplates.generateInfluencerCaption(openai, product, tone);
    default:
      return await GptTemplates.generateOriginalReview(openai, product, tone, trendingProducts);
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
    case 'friendly':
    default:
      wordsPerMinute = 150; // Moderate pace
  }
  
  // Adjust for template type - captions are faster, detailed reviews slower
  switch (templateType) {
    case 'caption':
      wordsPerMinute += 30; // Social media captions are read faster
      break;
    case 'original':
    case 'pros-cons':
      wordsPerMinute -= 10; // Detailed reviews need more time
      break;
    case 'comparison':
      wordsPerMinute -= 20; // Comparisons need more explanation time
      break;
    case 'routine':
      wordsPerMinute -= 15; // Routines need demonstration time
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
  
  return {
    seconds,
    readableTime,
    wordCount: words,
    pacing
  };
}
