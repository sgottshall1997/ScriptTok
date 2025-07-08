import { Router, Request, Response } from 'express';
import { db } from '../db';
import { platformContent, contentGenerations, contentHooks } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { openai } from '../services/openai';

const router = Router();

// Platform-specific formatting configurations
const PLATFORM_CONFIGS = {
  instagram: {
    maxLength: 2200,
    hashtagLimit: 30,
    format: 'visual_story',
    features: ['image', 'video', 'carousel', 'hashtags']
  },
  tiktok: {
    maxLength: 300,
    hashtagLimit: 100,
    format: 'viral_hook',
    features: ['video', 'trending_sounds', 'hashtags']
  },
  youtube: {
    maxLength: 5000,
    hashtagLimit: 15,
    format: 'educational',
    features: ['video', 'title', 'description', 'tags']
  },
  twitter: {
    maxLength: 280,
    hashtagLimit: 2,
    format: 'punchy',
    features: ['text', 'hashtags', 'link']
  },
  threads: {
    maxLength: 500,
    hashtagLimit: 5,
    format: 'conversation',
    features: ['text', 'image', 'hashtags']
  }
};

// Generate platform-specific content
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { contentId, platforms, product, niche, tone } = req.body;
    
    if (!contentId || !platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ 
        error: 'Missing required fields: contentId, platforms (array)' 
      });
    }

    // Get original content
    const [originalContent] = await db
      .select()
      .from(contentGenerations)
      .where(eq(contentGenerations.id, contentId));

    if (!originalContent) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const platformResults = [];

    for (const platform of platforms) {
      const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
      if (!config) {
        console.warn(`Unknown platform: ${platform}`);
        continue;
      }

      try {
        // Generate platform-specific content
        const formatted = await formatContentForPlatform(
          originalContent.content,
          platform,
          config,
          product || originalContent.product,
          niche || originalContent.niche,
          tone || originalContent.tone
        );

        // Save formatted content
        const [platformContentRecord] = await db.insert(platformContent).values({
          contentId,
          platform,
          formattedContent: formatted.content,
          hashtags: formatted.hashtags,
          title: formatted.title,
          tags: formatted.tags,
          publishStatus: 'draft'
        }).returning();

        platformResults.push({
          platform,
          id: platformContentRecord.id,
          ...formatted
        });

      } catch (error) {
        console.error(`Error formatting content for ${platform}:`, error);
        platformResults.push({
          platform,
          error: `Failed to format for ${platform}`
        });
      }
    }

    res.json({
      success: true,
      contentId,
      platforms: platformResults
    });

  } catch (error) {
    console.error('Error generating platform content:', error);
    res.status(500).json({ error: 'Failed to generate platform content' });
  }
});

// Generate multiple hooks for A/B testing
router.post('/hooks', async (req: Request, res: Response) => {
  try {
    const { contentId, product, niche, count = 5 } = req.body;
    
    if (!contentId || !product || !niche) {
      return res.status(400).json({ 
        error: 'Missing required fields: contentId, product, niche' 
      });
    }

    // Generate multiple hook variations
    const hooks = await generateHookVariations(product, niche, count);
    
    // Score each hook with GPT
    const scoredHooks = [];
    for (const hook of hooks) {
      const scores = await scoreHook(hook, niche);
      
      // Calculate overall score (weighted average)
      const overallScore = (
        (scores.viralityScore * 0.4) + 
        (scores.clarityScore * 0.3) + 
        (scores.emotionalScore * 0.3)
      );

      // Save hook to database
      const [savedHook] = await db.insert(contentHooks).values({
        contentId,
        hookText: hook,
        viralityScore: scores.viralityScore.toString(),
        clarityScore: scores.clarityScore.toString(),
        emotionalScore: scores.emotionalScore.toString(),
        overallScore: overallScore.toString(),
        isSelected: false
      }).returning();

      scoredHooks.push({
        id: savedHook.id,
        text: hook,
        scores,
        overallScore
      });
    }

    // Sort by overall score and mark the best one as selected
    scoredHooks.sort((a, b) => b.overallScore - a.overallScore);
    
    if (scoredHooks.length > 0) {
      await db
        .update(contentHooks)
        .set({ isSelected: true })
        .where(eq(contentHooks.id, scoredHooks[0].id));
    }

    res.json({
      success: true,
      contentId,
      hooks: scoredHooks
    });

  } catch (error) {
    console.error('Error generating hooks:', error);
    res.status(500).json({ error: 'Failed to generate hooks' });
  }
});

// Get platform content for a specific content ID
router.get('/content/:contentId', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    
    const platformContents = await db
      .select()
      .from(platformContent)
      .where(eq(platformContent.contentId, parseInt(contentId)));

    const hooks = await db
      .select()
      .from(contentHooks)
      .where(eq(contentHooks.contentId, parseInt(contentId)));

    res.json({
      success: true,
      contentId: parseInt(contentId),
      platforms: platformContents,
      hooks
    });

  } catch (error) {
    console.error('Error fetching platform content:', error);
    res.status(500).json({ error: 'Failed to fetch platform content' });
  }
});

// Helper function to format content for specific platform
async function formatContentForPlatform(
  originalContent: string,
  platform: string,
  config: any,
  product: string,
  niche: string,
  tone: string
) {
  const prompt = createPlatformPrompt(platform, config, originalContent, product, niche, tone);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000
  });

  const result = response.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(result);
    return {
      content: parsed.content || result,
      hashtags: parsed.hashtags || [],
      title: parsed.title || null,
      tags: parsed.tags || []
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      content: result,
      hashtags: extractHashtags(result),
      title: null,
      tags: []
    };
  }
}

// Helper function to create platform-specific prompts
function createPlatformPrompt(
  platform: string,
  config: any,
  originalContent: string,
  product: string,
  niche: string,
  tone: string
): string {
  const platformInstructions = {
    instagram: `Create Instagram-optimized content with engaging visuals in mind. Include a compelling caption with line breaks for readability. Add relevant hashtags (max ${config.hashtagLimit}). Focus on visual storytelling.`,
    
    tiktok: `Create TikTok-optimized content with a viral hook in the first 3 seconds. Keep it short, punchy, and trending. Include trending hashtags and sounds. Make it entertaining and shareable.`,
    
    youtube: `Create YouTube-optimized content with an engaging title and detailed description. Include SEO-friendly tags. Structure for educational or entertainment value with clear sections.`,
    
    twitter: `Create Twitter-optimized content that's concise and punchy. Maximum ${config.maxLength} characters. Include 1-2 relevant hashtags. Make it quotable and retweetable.`,
    
    threads: `Create Threads-optimized content that encourages conversation. Use a conversational tone with breaks between thoughts. Include relevant hashtags sparingly.`
  };

  return `
Convert the following affiliate content for ${platform}:

Original Content: "${originalContent}"
Product: ${product}
Niche: ${niche}
Tone: ${tone}

Platform Requirements:
${platformInstructions[platform as keyof typeof platformInstructions]}
- Max length: ${config.maxLength} characters
- Max hashtags: ${config.hashtagLimit}

Return as JSON with this structure:
{
  "content": "formatted content text",
  "hashtags": ["hashtag1", "hashtag2"],
  "title": "title for YouTube or null",
  "tags": ["tag1", "tag2"] 
}

Make it platform-native, engaging, and conversion-focused while maintaining the affiliate message.
`;
}

// Helper function to generate hook variations
async function generateHookVariations(product: string, niche: string, count: number): Promise<string[]> {
  const prompt = `
Generate ${count} different viral hook variations for this product:
Product: ${product}
Niche: ${niche}

Create hooks that are:
1. Attention-grabbing in the first 3 seconds
2. Emotionally engaging
3. Create curiosity or urgency
4. Suitable for social media (TikTok, Instagram, etc.)
5. Different styles: question, statement, story, shock, benefit-focused

Return only the hooks, one per line, without numbering or formatting.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 500
  });

  return response.choices[0].message.content
    .split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, count);
}

// Helper function to score hooks
async function scoreHook(hook: string, niche: string) {
  const prompt = `
Score this hook for viral potential in the ${niche} niche:
"${hook}"

Rate from 0.0 to 1.0 on:
1. Virality Score: How likely to be shared/go viral
2. Clarity Score: How clear and understandable
3. Emotional Score: How emotionally engaging

Return as JSON:
{
  "viralityScore": 0.0-1.0,
  "clarityScore": 0.0-1.0, 
  "emotionalScore": 0.0-1.0
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 200
  });

  try {
    const scores = JSON.parse(response.choices[0].message.content);
    return {
      viralityScore: Math.max(0, Math.min(1, scores.viralityScore)),
      clarityScore: Math.max(0, Math.min(1, scores.clarityScore)),
      emotionalScore: Math.max(0, Math.min(1, scores.emotionalScore))
    };
  } catch {
    // Fallback scores
    return {
      viralityScore: 0.5,
      clarityScore: 0.5,
      emotionalScore: 0.5
    };
  }
}

// Helper function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}

export default router;