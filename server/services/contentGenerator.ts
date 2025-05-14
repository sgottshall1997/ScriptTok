import { openai } from './openai';
import { TrendingProduct } from '@shared/schema';
import { TemplateType, ToneOption } from '@shared/constants';

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
  // Get trend context if available
  const trendContext = getTrendContext(product, trendingProducts);
  
  // Create the prompt based on template type
  const prompt = createPrompt(product, templateType, tone, trendContext);
  
  // Generate content with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    messages: [
      {
        role: "system",
        content: getSystemPrompt(templateType, tone)
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });
  
  return response.choices[0].message.content.trim();
}

// Create appropriate system prompt based on template type and tone
function getSystemPrompt(templateType: TemplateType, tone: ToneOption): string {
  let systemPrompt = "You are an expert skincare and beauty content creator specializing in";
  
  // Add template-specific context
  switch (templateType) {
    case "original":
      systemPrompt += " detailed, informative product reviews.";
      break;
    case "comparison":
      systemPrompt += " comparing products to help consumers make informed decisions.";
      break;
    case "caption":
      systemPrompt += " creating engaging social media captions that drive engagement and conversions.";
      break;
    case "pros-cons":
      systemPrompt += " analyzing the strengths and weaknesses of beauty products.";
      break;
    case "routine":
      systemPrompt += " creating personalized skincare routines that incorporate specific products.";
      break;
    default:
      systemPrompt += " creating high-quality beauty content.";
  }
  
  // Add tone-specific context
  switch (tone) {
    case "friendly":
      systemPrompt += " Your tone is warm, approachable, and conversational.";
      break;
    case "professional":
      systemPrompt += " Your tone is authoritative, evidence-based, and clinical.";
      break;
    case "enthusiastic":
      systemPrompt += " Your tone is energetic, passionate, and full of excitement.";
      break;
    case "minimalist":
      systemPrompt += " Your tone is concise, straightforward, and to-the-point.";
      break;
  }
  
  // Add length requirement for 30-60 second videos
  systemPrompt += " Your content should be optimized for 30-60 second social media videos.";
  
  // Add additional guidance based on tone
  if (tone === "enthusiastic" || tone === "friendly") {
    systemPrompt += " Keep sentences short and conversational for a natural flow when spoken.";
  } else if (tone === "professional") {
    systemPrompt += " Focus on 2-3 key points with clear explanations that can be delivered in under a minute.";
  } else if (tone === "minimalist") {
    systemPrompt += " Be concise but include all necessary information within the 30-60 second timeframe.";
  }
  
  systemPrompt += " Format your response with proper HTML for web display, using appropriate tags (h3, p, ul, li, etc) for structure.";
  
  return systemPrompt;
}

// Extract relevant trend context from trending products data
function getTrendContext(product: string, trendingProducts: TrendingProduct[]): string {
  // Check if product is in trending products
  const exactMatch = trendingProducts.find(
    p => p.title.toLowerCase() === product.toLowerCase()
  );
  
  if (exactMatch) {
    return `This product is currently trending on ${exactMatch.source} with approximately ${exactMatch.mentions} mentions.`;
  }
  
  // Check for partial matches
  const partialMatches = trendingProducts.filter(
    p => p.title.toLowerCase().includes(product.toLowerCase()) || 
         product.toLowerCase().includes(p.title.toLowerCase())
  );
  
  if (partialMatches.length > 0) {
    return `Similar products are trending on ${partialMatches.map(p => p.source).join(', ')}.`;
  }
  
  // Return general trending context
  return `Current trending skincare products include: ${trendingProducts.slice(0, 3).map(p => p.title).join(', ')}.`;
}

// Create the main prompt for each template type
function createPrompt(
  product: string, 
  templateType: TemplateType, 
  tone: ToneOption, 
  trendContext: string
): string {
  let basePrompt = `Create ${getToneDescription(tone)} content about "${product}" optimized for a 30-60 second social media video. ${trendContext}\n\n`;
  
  switch (templateType) {
    case "original":
      return basePrompt + `Write a concise review of this product focusing on 2-3 key benefits, main ingredients, and basic usage. Keep it short enough to be narrated in a 30-60 second video. Include a brief introduction, key points, and a quick conclusion.`;
      
    case "comparison":
      return basePrompt + `Compare this product with 1-2 similar alternatives. Focus only on the most important differences that can be explained in a 30-60 second video. Highlight differences in 2-3 key areas like efficacy, value, or results. Keep it brief enough to fit in a short-form video.`;
      
    case "caption":
      return basePrompt + `Create a short, engaging social media caption for this product that would perform well on Instagram/TikTok and complement a 30-60 second video. Include 2-3 relevant hashtags, a few strategic emojis, and a brief call to action. Keep it authentic and concise.`;
      
    case "pros-cons":
      return basePrompt + `Create a balanced list of 2-3 pros and 1-2 cons for this product. Keep each point brief and impactful - the entire content should be narrated in 30-60 seconds. Focus on the most important factors that would affect a purchase decision.`;
      
    case "routine":
      return basePrompt + `Create a simplified skincare routine that incorporates this product. Limit to 3-4 total steps that can be explained in a 30-60 second video. Focus on when and how to use this product for best results, with minimal details about complementary products.`;
      
    default:
      return basePrompt + `Write helpful and engaging content about this product that educates and informs potential buyers. Keep it concise enough to be narrated in a 30-60 second video.`;
  }
}

// Helper to get tone description
function getToneDescription(tone: ToneOption): string {
  switch (tone) {
    case "friendly":
      return "warm and approachable";
    case "professional":
      return "authoritative and clinical";
    case "enthusiastic":
      return "energetic and passionate";
    case "minimalist":
      return "concise and straightforward";
    default:
      return "informative";
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
