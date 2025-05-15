/**
 * Claude Content Generation API Endpoint
 * 
 * Provides content generation using Anthropic's Claude models.
 * Serves as an alternative AI provider alongside OpenAI.
 */

import { Request, Response, Router } from 'express';
import { NICHES, TONE_OPTIONS, Niche, ToneOption } from '@shared/constants';
import { storage } from '../storage';
import { generateContentWithClaude, analyzeImageWithClaude, getClaudeModels } from '../utils/anthropic';

export const claudeContentRouter = Router();

/**
 * Helper function to enhance the prompt with trending products
 */
async function enhancePromptWithProducts(
  prompt: string,
  niche: Niche, 
  includeProducts: boolean
): Promise<string> {
  if (!includeProducts) return prompt;

  try {
    // Get trending products for the niche
    const trendingProducts = await storage.getTrendingProductsByNiche(niche, 5);
    
    if (trendingProducts.length === 0) {
      return prompt;
    }

    // Format products to add to the prompt
    const productList = trendingProducts
      .map(product => `- ${product.title} (trending with ${product.mentions || 0} mentions)`)
      .join('\n');

    // Add trending products to the prompt
    return `${prompt}\n\nConsider including references to these trending products in this niche:\n${productList}`;
  } catch (error) {
    console.error('Error enhancing prompt with products:', error);
    return prompt; // Return original prompt if there's an error
  }
}

/**
 * Helper function to load specialized system prompts
 */
function getSystemPrompt(niche: Niche, tone: ToneOption, templateType?: string): string {
  // Base system prompt that applies to all niches
  let systemPrompt = `You are a specialized content creator with expertise in the ${niche} niche. 
Create content that is informative, engaging, and accurate with a ${tone} tone.
Make your content compelling, well-structured, and optimized for engagement.`;

  // Add niche-specific instructions
  switch (niche) {
    case 'skincare':
      systemPrompt += `\nInclude scientifically accurate information about skincare ingredients and their benefits.
Avoid making exaggerated claims about products. Be honest about potential side effects.
Use terminology that demonstrates expertise in dermatology and cosmetic science.`;
      break;
    case 'tech':
      systemPrompt += `\nBe precise about technical specifications. Compare features objectively.
Stay current with the latest technology trends and innovations.
Make complex technical concepts accessible to different levels of technical understanding.`;
      break;
    case 'fashion':
      systemPrompt += `\nReference current fashion trends and seasonal appropriate styles.
Consider sustainability aspects of fashion where relevant.
Be inclusive of different body types, styles, and fashion preferences.`;
      break;
    case 'fitness':
      systemPrompt += `\nEnsure all exercise recommendations are safe and come with proper form instructions.
Be informed by actual exercise science and avoid fitness myths.
Be encouraging and motivational while remaining realistic about fitness goals.`;
      break;
    case 'food':
      systemPrompt += `\nInclude detailed ingredients and clear preparation steps for recipes.
Consider dietary restrictions and offer alternatives when possible.
Describe flavors and textures vividly to make content appetizing.`;
      break;
    case 'travel':
      systemPrompt += `\nProvide practical travel advice including local customs, best times to visit, and budget considerations.
Include both popular attractions and lesser-known local experiences.
Be sensitive to cultural differences and sustainability concerns in tourism.`;
      break;
    case 'pet':
      systemPrompt += `\nPrioritize pet safety, health, and welfare in all content.
Include species-specific advice and don't generalize across different animals.
Reference veterinary best practices when discussing pet health topics.`;
      break;
  }

  // Add template-specific instructions if provided
  if (templateType) {
    switch (templateType) {
      case 'product_review':
        systemPrompt += `\nFor product reviews, be balanced and honest. Discuss both pros and cons.
Evaluate the product based on value, quality, performance, and user experience.
Include comparisons to similar products where relevant.`;
        break;
      case 'social_media_post':
        systemPrompt += `\nCreate concise, engaging content that works well for social media.
Include relevant hashtags that would increase discoverability.
Consider the visual component that might accompany the text.`;
        break;
      case 'email_newsletter':
        systemPrompt += `\nCreate content with a clear structure and sections that work well in email format.
Include a compelling subject line suggestion.
Write in a personable way that builds relationship with the reader.`;
        break;
      case 'blog_article':
        systemPrompt += `\nCreate comprehensive, well-structured content with headings and subheadings.
Include an engaging introduction and a satisfying conclusion.
Optimize for readability with short paragraphs and varied sentence structure.`;
        break;
      case 'video_script':
        systemPrompt += `\nCreate content that works well when spoken aloud with natural transitions.
Include directions for visual elements or b-roll where appropriate.
Structure the script with clear segments and a compelling hook at the beginning.`;
        break;
    }
  }

  return systemPrompt;
}

/**
 * POST /api/claude-content
 * Generate content using Claude
 */
claudeContentRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { prompt, niche, tone, maxTokens = 1024, temperature = 0.7, includeProducts = true } = req.body;

    if (!prompt || !niche || !tone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!NICHES.includes(niche)) {
      return res.status(400).json({ error: 'Invalid niche' });
    }

    if (!TONE_OPTIONS.includes(tone)) {
      return res.status(400).json({ error: 'Invalid tone' });
    }

    // Enhance prompt with trending products if requested
    const enhancedPrompt = await enhancePromptWithProducts(prompt, niche, includeProducts);

    // Get the appropriate system prompt
    const systemPrompt = getSystemPrompt(niche, tone);

    // Generate content with Claude
    const result = await generateContentWithClaude(enhancedPrompt, {
      maxTokens,
      temperature,
      systemPrompt
    });

    // Increment API usage stats
    await storage.incrementApiUsage('claude_content', tone);

    // Return the generated content
    res.json({
      content: result.content,
      model: result.model,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error generating content with Claude:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

/**
 * POST /api/claude-content/analyze-image
 * Analyze an image using Claude's multimodal capabilities
 */
claudeContentRouter.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { image, prompt, niche, tone, maxTokens = 1024, temperature = 0.7 } = req.body;

    if (!image || !prompt || !niche || !tone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract base64 data - assuming format like "data:image/jpeg;base64,..."
    const base64Data = image.split(',')[1];

    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(niche, tone);

    // Analyze image with Claude
    const result = await analyzeImageWithClaude(base64Data, prompt, {
      maxTokens,
      temperature,
      systemPrompt
    });

    // Increment API usage
    await storage.incrementApiUsage('claude_image_analysis', tone);

    res.json({
      analysis: result.content,
      model: result.model,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error analyzing image with Claude:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

/**
 * GET /api/claude-content/model-info
 * Get information about available Claude models
 */
claudeContentRouter.get('/model-info', (_req: Request, res: Response) => {
  try {
    const models = getClaudeModels();
    res.json({ models });
  } catch (error) {
    console.error('Error getting Claude model info:', error);
    res.status(500).json({ error: 'Failed to retrieve model information' });
  }
});