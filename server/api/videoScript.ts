/**
 * Video Script Generator API Endpoint
 * 
 * Generates optimized video scripts for various platforms and formats
 * with platform-specific guidance and formatting options.
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { NICHES, TONE_OPTIONS } from '@shared/constants';
import { storage } from '../storage';
import { openai } from '../services/openai';
import { getModelConfig } from '../services/aiModelSelector';

export const videoScriptRouter = Router();

// Define video platform types
const VIDEO_PLATFORMS = [
  'tiktok',
  'instagram_reels',
  'youtube_shorts',
  'youtube_long',
] as const;

// Define video script types
const SCRIPT_TYPES = [
  'tutorial',
  'product_review',
  'trending_topic',
  'storytelling',
  'educational',
] as const;

// Validate request body for video script generation
const videoScriptSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters."),
  niche: z.enum(NICHES),
  tone: z.enum(TONE_OPTIONS),
  platform: z.enum(VIDEO_PLATFORMS),
  scriptType: z.enum(SCRIPT_TYPES),
  duration: z.number().min(10).max(600),
  keypoints: z.string().min(5, "Key points must be at least 5 characters."),
  includeCTA: z.boolean().default(true),
  includeTimestamps: z.boolean().default(true),
  includeB_Roll: z.boolean().default(true),
  includeOnScreenText: z.boolean().default(true),
});

// In-memory cache to avoid regenerating the same scripts
const scriptCache = new Map<string, any>();

/**
 * Helper function to get platform-specific tips
 */
function getPlatformTips(platform: string): string[] {
  switch (platform) {
    case 'tiktok':
      return [
        "Keep video length between 15-60 seconds for optimal engagement",
        "Hook viewers in the first 2-3 seconds with an attention-grabbing statement or visual",
        "Use trending sounds or songs in the background to increase discovery",
        "Keep text on screen brief, large, and easy to read",
        "End with a clear call-to-action for follows, likes, or comments"
      ];
    case 'instagram_reels':
      return [
        "Aim for 15-30 seconds for highest completion rates",
        "Ensure high video quality and good lighting",
        "Use on-screen text to emphasize key points",
        "Include product tags when showcasing specific items",
        "Consider adding a voice-over for better context",
        "Use Instagram's built-in effects and transitions"
      ];
    case 'youtube_shorts':
      return [
        "Optimize for 15-60 seconds of engaging content",
        "Include a subscribe reminder at the end of your video",
        "Use YouTube's end screen elements",
        "Create a hook that sparks curiosity within the first 3 seconds",
        "Make content that can lead viewers to your long-form videos",
        "Use consistent on-screen text styling for brand recognition"
      ];
    case 'youtube_long':
      return [
        "Structure your content with clear sections and timestamps",
        "Include a table of contents in the video description",
        "Add chapter markers every 2-3 minutes for better navigation",
        "Show a teaser of the final result or key takeaway at the beginning",
        "Include both a verbal and visual call-to-action at the end",
        "Optimize thumbnail and title for click-through rate"
      ];
    default:
      return [
        "Keep content concise and focused on the main topic",
        "Use high-quality visuals and clear audio",
        "Include on-screen text for key points",
        "End with a clear call-to-action"
      ];
  }
}

/**
 * Helper function to generate prompt based on request
 */
function generatePrompt(req: z.infer<typeof videoScriptSchema>): string {
  const {
    productName,
    niche,
    tone,
    platform,
    scriptType,
    duration,
    keypoints,
    includeCTA,
    includeTimestamps,
    includeB_Roll,
    includeOnScreenText
  } = req;

  let prompt = `Create a professional video script for a ${duration}-second ${platform.replace('_', ' ')} video about "${productName}" in the ${niche} niche. `;
  prompt += `The script should be in a ${tone} tone and follow a ${scriptType.replace('_', ' ')} format. `;
  
  // Add information about key points
  prompt += `\n\nIncorporate these key points into the script:\n${keypoints}`;
  
  // Add platform-specific guidance
  prompt += `\n\nOptimize this script specifically for ${platform.replace('_', ' ')} with appropriate pacing and structure.`;
  
  // Add additional requirements based on options
  if (includeCTA) {
    prompt += `\n\nInclude a compelling call-to-action at the end.`;
  }
  
  if (includeTimestamps) {
    prompt += `\n\nInclude timestamps throughout the script to guide pacing.`;
  }
  
  // Format request for structured output
  prompt += `\n\nProvide the response as a JSON object with the following structure:
  {
    "intro": "Opening hook and introduction text",
    "body": ["Main point 1 paragraph", "Main point 2 paragraph", ...],
    "outro": "Closing statement and call-to-action text"`;
  
  if (includeTimestamps) {
    prompt += `,
    "script_with_timestamps": "00:00 - Hook\\n00:05 - First point\\n...etc"`;
  }
  
  if (includeB_Roll) {
    prompt += `,
    "b_roll": ["Suggested b-roll shot 1", "Suggested b-roll shot 2", ...]`;
  }
  
  if (includeOnScreenText) {
    prompt += `,
    "onscreen_text": ["Text for key moment 1", "Text for key moment 2", ...]`;
  }
  
  prompt += `,
    "thumbnail_ideas": ["Thumbnail idea 1", "Thumbnail idea 2", "Thumbnail idea 3"],
    "duration_estimate": Number of seconds the script will take to perform,
    "platform_specific_tips": ["Tip 1 for ${platform}", "Tip 2", "Tip 3", ...]
  }`;
  
  return prompt;
}

/**
 * POST /api/video-script
 * Generate a video script based on the provided parameters
 */
videoScriptRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const result = videoScriptSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: result.error.format()
      });
    }

    const requestData = result.data;
    
    // Create a cache key based on the request parameters
    const cacheKey = JSON.stringify(requestData);
    
    // Check if we have a cached response
    if (scriptCache.has(cacheKey)) {
      console.log('Returning cached video script');
      return res.json(scriptCache.get(cacheKey));
    }
    
    // Get trending products for context enrichment
    const trendingProducts = await storage.getTrendingProductsByNiche(requestData.niche, 3);
    
    // Get model configuration optimized for this request
    const modelConfig = getModelConfig({
      niche: requestData.niche,
      templateType: 'short_video', // Use short_video as the closest appropriate template type
      tone: requestData.tone
    });
    
    // Generate prompt for the AI
    const prompt = generatePrompt(requestData);
    
    // Add trending product context if available
    let systemPrompt = `You are a professional video script writer specializing in ${requestData.niche} content for ${requestData.platform.replace('_', ' ')}. `;
    systemPrompt += `Create engaging, platform-optimized scripts with appropriate pacing and structure. `;
    
    if (trendingProducts.length > 0) {
      systemPrompt += `\n\nCurrent trending products in ${requestData.niche}: `;
      systemPrompt += trendingProducts.map(p => p.title).join(', ');
    }

    try {
      // Call OpenAI to generate the script
      const completion = await openai.chat.completions.create({
        model: modelConfig.modelName,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: modelConfig.temperature,
        max_tokens: 2500,
        frequency_penalty: modelConfig.frequencyPenalty,
        presence_penalty: modelConfig.presencePenalty
      });

      const responseContent = completion.choices[0].message.content;
      
      if (!responseContent) {
        return res.status(500).json({ error: 'Failed to generate script content' });
      }
      
      try {
        // Parse the JSON response
        const scriptData = JSON.parse(responseContent);
        
        // Add platform-specific tips if not included in the AI response
        if (!scriptData.platform_specific_tips || scriptData.platform_specific_tips.length === 0) {
          scriptData.platform_specific_tips = getPlatformTips(requestData.platform);
        }
        
        // Calculate duration if not provided or unrealistic
        if (!scriptData.duration_estimate || 
            scriptData.duration_estimate < 10 || 
            scriptData.duration_estimate > requestData.duration * 2) {
          // Estimate based on word count (average speaking rate of 150 words per minute)
          const fullText = scriptData.intro + ' ' + scriptData.body.join(' ') + ' ' + scriptData.outro;
          const wordCount = fullText.split(' ').length;
          scriptData.duration_estimate = Math.ceil(wordCount / 2.5); // ~150 words per minute
        }
        
        // Cache the result for future use
        scriptCache.set(cacheKey, scriptData);
        
        // Track API usage for analytics
        await storage.incrementApiUsage('video_script', requestData.tone);
        
        // Return the generated script
        return res.json(scriptData);
        
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        return res.status(500).json({ 
          error: 'Failed to parse script data', 
          raw: responseContent
        });
      }
      
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return res.status(500).json({ 
        error: 'AI service error', 
        message: openaiError instanceof Error ? openaiError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('Error generating video script:', error);
    return res.status(500).json({ 
      error: 'Failed to generate video script', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/video-script/platforms
 * Get information about available video platforms
 */
videoScriptRouter.get('/platforms', (_req: Request, res: Response) => {
  const platformInfo = [
    {
      id: 'tiktok',
      name: 'TikTok',
      duration: '15-60 seconds',
      format: 'Vertical (9:16)',
      description: 'Short-form, trend-driven content with high engagement'
    },
    {
      id: 'instagram_reels',
      name: 'Instagram Reels',
      duration: '15-90 seconds',
      format: 'Vertical (9:16)',
      description: 'Visually appealing short content for the Instagram ecosystem'
    },
    {
      id: 'youtube_shorts',
      name: 'YouTube Shorts',
      duration: '15-60 seconds',
      format: 'Vertical (9:16)',
      description: 'Short-form YouTube content that can drive traffic to long-form videos'
    },
    {
      id: 'youtube_long',
      name: 'YouTube Long-Form',
      duration: '2-10 minutes',
      format: 'Landscape (16:9)',
      description: 'In-depth content with higher retention and monetization potential'
    }
  ];
  
  return res.json(platformInfo);
});

/**
 * GET /api/video-script/types
 * Get information about available script types
 */
videoScriptRouter.get('/types', (_req: Request, res: Response) => {
  const scriptTypeInfo = [
    {
      id: 'product_review',
      name: 'Product Review',
      description: 'Evaluate products with authentic experiences and specific benefits/drawbacks',
      bestFor: ['Affiliate marketing', 'Product demonstrations', 'Comparisons']
    },
    {
      id: 'tutorial',
      name: 'Tutorial/How-To',
      description: 'Step-by-step instruction to help viewers accomplish specific tasks',
      bestFor: ['Educational content', 'DIY projects', 'Software tutorials']
    },
    {
      id: 'trending_topic',
      name: 'Trending Topic',
      description: 'Content that connects to current trends, news, or viral topics',
      bestFor: ['Growth hacking', 'Timely content', 'Hashtag campaigns']
    },
    {
      id: 'storytelling',
      name: 'Storytelling',
      description: 'Narrative-driven content that creates emotional connection',
      bestFor: ['Brand building', 'Personal experiences', 'Customer testimonials']
    },
    {
      id: 'educational',
      name: 'Educational',
      description: 'In-depth exploration of topics with a focus on providing value and information',
      bestFor: ['Explainer videos', 'Industry insights', 'Thought leadership']
    }
  ];
  
  return res.json(scriptTypeInfo);
});

export default videoScriptRouter;