/**
 * Social Media Optimization API Endpoint
 * 
 * Provides intelligent optimization of content for various social media platforms
 * based on niche, content, and best practices.
 */
import { Router, Request, Response } from 'express';
import { OpenAI } from 'openai';
import { Niche } from '@shared/constants';
import { storage } from '../storage';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define router
export const socialMediaOptimizationRouter = Router();

// Define supported platforms
type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'linkedin';

// Define platform-specific best practices
const PLATFORM_BEST_PRACTICES: Record<SocialPlatform, string[]> = {
  instagram: [
    'Use 3-5 relevant hashtags for optimal reach',
    'Include emojis to increase engagement',
    'Keep captions concise but engaging',
    'Ask a question to encourage comments',
    'Include a clear call-to-action'
  ],
  tiktok: [
    'Use trending hashtags (3-5 is optimal)',
    'Keep text short and punchy',
    'Reference trending sounds or challenges',
    'Use abbreviations common on the platform',
    'End with a question or call-to-action'
  ],
  facebook: [
    'Longer, more detailed content works well',
    'Ask questions to encourage comments',
    'Maintain a conversational tone',
    'Minimize hashtag usage (1-2 maximum)',
    'Include a clear call-to-action'
  ],
  twitter: [
    'Keep under 280 characters',
    'Use 1-2 relevant hashtags',
    'Include relevant handles when appropriate',
    'Ask questions to encourage replies',
    'Use thread format for longer content'
  ],
  linkedin: [
    'Use professional language',
    'Include industry-specific hashtags (3-5)',
    'Provide valuable insights or tips',
    'Reference relevant statistics or studies',
    'Format with bullet points for readability'
  ]
};

// Define character limits
const CHARACTER_LIMITS: Record<SocialPlatform, number> = {
  instagram: 2200,
  tiktok: 300,
  facebook: 5000,
  twitter: 280,
  linkedin: 3000
};

// Helper to generate optimized content using OpenAI
async function generateOptimizedContent(
  content: string,
  niche: Niche,
  hashtags: string[]
) {
  try {
    // Create a prompt that will guide optimization
    const prompt = `
      I need to optimize this content for different social media platforms.
      
      ORIGINAL CONTENT:
      ${content}
      
      NICHE: ${niche}
      
      HASHTAGS: ${hashtags.join(', ')}
      
      For each platform, please optimize the content following these guidelines:
      
      1. Instagram:
      - Keep within ${CHARACTER_LIMITS.instagram} characters
      - Make it visually descriptive and engaging
      - Include 3-5 relevant hashtags
      - Prompt engagement with a question
      
      2. TikTok:
      - Very brief, within ${CHARACTER_LIMITS.tiktok} characters
      - Trendy and attention-grabbing language
      - Include trending hashtags
      - Use casual, conversational tone
      
      3. Facebook:
      - Can be longer, within ${CHARACTER_LIMITS.facebook} characters
      - More detailed and personal
      - Minimal hashtags (1-2 at most)
      - Conversational and engaging
      
      4. Twitter:
      - Within ${CHARACTER_LIMITS.twitter} characters
      - Concise but impactful
      - 1-2 relevant hashtags only
      - Direct and clear messaging
      
      5. LinkedIn:
      - Professional tone, within ${CHARACTER_LIMITS.linkedin} characters
      - Industry-focused
      - Include data points if relevant
      - Professional hashtags (3-5)
      
      Also, for each platform, provide 3-5 specific optimization suggestions and a score from 1-10 on how well the original content matches best practices for that platform.
      
      Format your response as valid JSON with this structure:
      {
        "suggestions": [
          {
            "platform": "instagram",
            "score": 7,
            "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
          },
          // other platforms
        ],
        "optimizedContent": {
          "instagram": "optimized content for instagram",
          "tiktok": "optimized content for tiktok",
          "facebook": "optimized content for facebook",
          "twitter": "optimized content for twitter",
          "linkedin": "optimized content for linkedin"
        }
      }
    `;

    // Request optimization from OpenAI
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a social media optimization expert who helps create platform-specific content versions. Always keep hashtags without spaces." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse and return the optimization data
    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('No content returned from OpenAI');
    }

    const optimizationData = JSON.parse(responseContent);

    // Track API usage for this feature
    await storage.incrementApiUsage('social_media_optimization');

    return optimizationData;
  } catch (error: unknown) {
    console.error('Error generating social media optimization:', error);
    throw error;
  }
}

/**
 * POST /api/social-media-optimization
 * Optimize content for different social media platforms
 */
socialMediaOptimizationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { content, niche, hashtags = [] } = req.body;
    
    // Validate required parameters
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    if (!niche) {
      return res.status(400).json({ error: 'Niche is required' });
    }
    
    // Generate optimized content for different platforms
    const optimizationData = await generateOptimizedContent(
      content,
      niche,
      hashtags
    );
    
    res.status(200).json(optimizationData);
  } catch (error: unknown) {
    console.error('Social media optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize content', 
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined 
    });
  }
});

/**
 * GET /api/social-media-optimization/best-practices/:platform
 * Get best practices for a specific platform
 */
socialMediaOptimizationRouter.get('/best-practices/:platform', (req: Request, res: Response) => {
  const { platform } = req.params;
  
  // Type check for platform
  if (!isSocialPlatform(platform)) {
    return res.status(404).json({ error: 'Platform not found' });
  }
  
  res.status(200).json({
    platform,
    characterLimit: CHARACTER_LIMITS[platform],
    bestPractices: PLATFORM_BEST_PRACTICES[platform]
  });
});

// Type guard for social platforms
function isSocialPlatform(platform: string): platform is SocialPlatform {
  return ['instagram', 'tiktok', 'facebook', 'twitter', 'linkedin'].includes(platform);
}

/**
 * GET /api/social-media-optimization/best-practices
 * Get best practices for all platforms
 */
socialMediaOptimizationRouter.get('/best-practices', (_req: Request, res: Response) => {
  const platforms = Object.keys(PLATFORM_BEST_PRACTICES) as SocialPlatform[];
  
  const bestPractices = platforms.map(platform => ({
    platform,
    characterLimit: CHARACTER_LIMITS[platform],
    bestPractices: PLATFORM_BEST_PRACTICES[platform]
  }));
  
  res.status(200).json(bestPractices);
});