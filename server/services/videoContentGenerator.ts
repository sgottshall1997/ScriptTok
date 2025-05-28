import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VideoContentRequest {
  productName: string;
  niche: string;
  tone: string;
  duration: string; // "30", "45", or "60"
  trendingData?: any;
}

interface VideoContentResponse {
  script: string;
  caption: string;
  estimatedDuration: string;
  hashtags: string[];
}

/**
 * Generate video script and caption content separately
 */
export async function generateVideoContent(request: VideoContentRequest): Promise<VideoContentResponse> {
  const { productName, niche, tone, duration, trendingData } = request;
  
  // Convert duration to target word counts (rough estimates)
  const targetWordCounts = {
    "30": 75,   // ~75 words for 30 seconds
    "45": 110,  // ~110 words for 45 seconds  
    "60": 150   // ~150 words for 60 seconds
  };
  
  const targetWords = targetWordCounts[duration as keyof typeof targetWordCounts] || 75;
  
  // Generate trending context if available
  let trendContext = "";
  if (trendingData?.length > 0) {
    const relevantTrends = trendingData.slice(0, 3);
    trendContext = `Current trending context: ${relevantTrends.map((t: any) => t.title).join(', ')}`;
  }

  try {
    // Generate video script
    const scriptPrompt = `Create a ${duration}-second video script for "${productName}" in the ${niche} niche.

REQUIREMENTS:
- Target approximately ${targetWords} words (speaking pace: ~2.5 words per second)
- Tone: ${tone}
- Include a compelling hook in the first 3 seconds
- Focus on benefits and social proof
- End with a clear call-to-action
- Make it engaging and shareable
- Use natural, conversational language perfect for speaking
${trendContext ? `- ${trendContext}` : ''}

SCRIPT FORMAT:
[HOOK - 0-3 seconds]
[MAIN CONTENT - 4-${parseInt(duration)-5} seconds]  
[CALL TO ACTION - last 5 seconds]

Write ONLY the script content, no additional formatting or labels:`;

    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert video script writer specializing in engaging, conversion-focused social media content. Write natural, compelling scripts that sound great when spoken aloud."
        },
        {
          role: "user", 
          content: scriptPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    const script = scriptResponse.choices[0].message.content?.trim() || "";

    // Generate caption with hashtags
    const captionPrompt = `Create an engaging social media caption for a ${duration}-second video about "${productName}" in the ${niche} niche.

REQUIREMENTS:
- Tone: ${tone}
- Include compelling copy that complements the video
- Add relevant trending hashtags (15-20 hashtags)
- Include call-to-action
- Optimize for engagement and discoverability
- Keep caption concise but compelling
${trendContext ? `- ${trendContext}` : ''}

NICHE-SPECIFIC HASHTAGS FOR ${niche.toUpperCase()}:
${getNicheHashtags(niche)}

Write the caption followed by hashtags:`;

    const captionResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a social media expert specializing in viral captions and hashtag strategy. Create captions that drive engagement and conversions."
        },
        {
          role: "user",
          content: captionPrompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    const captionContent = captionResponse.choices[0].message.content?.trim() || "";
    
    // Extract hashtags from caption
    const hashtagMatches = captionContent.match(/#\w+/g) || [];
    const hashtags = hashtagMatches.map(tag => tag.slice(1)); // Remove # symbol
    
    // Clean caption (remove hashtags for separate display)
    const caption = captionContent.replace(/#\w+/g, '').trim();

    return {
      script,
      caption,
      estimatedDuration: `${duration} seconds`,
      hashtags
    };

  } catch (error) {
    console.error('Video content generation error:', error);
    throw new Error('Failed to generate video content');
  }
}

/**
 * Get niche-specific hashtags for better targeting
 */
function getNicheHashtags(niche: string): string {
  const nicheHashtagMap: Record<string, string[]> = {
    skincare: ['#skincare', '#beauty', '#glowup', '#skincareroutine', '#antiaging', '#clearskin', '#beautytips', '#selfcare'],
    haircare: ['#haircare', '#hair', '#hairstyle', '#hairgoals', '#healthyhair', '#hairproducts', '#hairtips', '#hairlove'],
    makeup: ['#makeup', '#beauty', '#makeupartist', '#cosmetics', '#makeuplook', '#beautyblogger', '#makeuptutorial', '#beautyinfluencer'],
    'body care': ['#bodycare', '#skincare', '#selfcare', '#beauty', '#bodyscrub', '#moisturizer', '#bodygoals', '#pampering'],
    "men's grooming": ['#mensgrooming', '#mensstyle', '#menshair', '#beard', '#skincare', '#grooming', '#mensfashion', '#lifestyle'],
    'k-beauty': ['#kbeauty', '#koreanbeauty', '#skincare', '#koreanskincare', '#glassskin', '#asianbeauty', '#beauty', '#skincarekorea'],
    'anti-aging': ['#antiaging', '#skincare', '#youthful', '#wrinkles', '#beauty', '#agegracefully', '#retinol', '#serum'],
    technology: ['#tech', '#gadgets', '#innovation', '#technology', '#techtips', '#gadgetreview', '#techlife', '#electronics'],
    fashion: ['#fashion', '#style', '#outfit', '#ootd', '#fashionista', '#trends', '#styletips', '#fashionblogger'],
    fitness: ['#fitness', '#workout', '#gym', '#health', '#fitlife', '#exercise', '#motivation', '#wellness'],
    food: ['#food', '#foodie', '#cooking', '#recipe', '#delicious', '#kitchen', '#chef', '#tasty'],
    travel: ['#travel', '#wanderlust', '#adventure', '#explore', '#vacation', '#travelgram', '#backpacking', '#journey'],
    pet: ['#pets', '#petcare', '#dogs', '#cats', '#animals', '#petproducts', '#petlover', '#animalcare']
  };

  return nicheHashtagMap[niche.toLowerCase()]?.join(' ') || '#trending #viral #fyp #mustwatch';
}

/**
 * Estimate actual speaking duration from script
 */
export function estimateScriptDuration(script: string): number {
  const wordCount = script.split(/\s+/).length;
  const wordsPerSecond = 2.5; // Average speaking pace
  return Math.round(wordCount / wordsPerSecond);
}