/**
 * Claude Content Generation API Endpoint
 * 
 * Provides content generation using Anthropic's Claude models.
 * Serves as an alternative AI provider alongside OpenAI.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { 
  generateWithClaude, 
  generateStructuredContent, 
  processImageWithClaude 
} from '../utils/anthropic';
import { Niche, NICHES, TONE_OPTIONS, ToneOption } from '../../shared/constants';
import fs from 'fs';
import path from 'path';

export const claudeContentRouter = Router();

// Schema for content generation request
const contentRequestSchema = z.object({
  prompt: z.string().min(10),
  niche: z.enum(NICHES as [string, ...string[]]),
  tone: z.enum(TONE_OPTIONS as [string, ...string[]]),
  maxTokens: z.number().int().positive().optional().default(1024),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  includeProducts: z.boolean().optional().default(true),
  templateType: z.string().optional(),
  withImage: z.boolean().optional().default(false),
  imageBase64: z.string().optional(),
});

// Predefined structured response types
type VideoScriptResponse = {
  intro: string;
  body: string[];
  outro: string;
  b_roll?: string[];
  onscreen_text?: string[];
  script_with_timestamps?: string;
  thumbnail_ideas?: string[];
  duration_estimate: number;
  platform_specific_tips: string[];
};

type SocialMediaPostResponse = {
  headline: string;
  content: string;
  hashtags: string[];
  callToAction: string;
  imageDescription?: string;
  platformSpecificTips: Record<string, string>;
};

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
    // Get trending products for this niche
    const trendingProducts = await storage.getTrendingProductsByNiche(niche, 3);
    
    if (!trendingProducts.length) return prompt;
    
    // Add products to the prompt context
    const productsContext = `
Consider mentioning these trending products in your content:
${trendingProducts.map(p => `- ${p.name}`).join('\n')}

Original prompt: ${prompt}`;
    
    return productsContext;
  } catch (error) {
    console.error("Error enhancing prompt with products:", error);
    return prompt; // Return original prompt if there's an error
  }
}

/**
 * Helper function to load specialized system prompts
 */
function getSystemPrompt(niche: Niche, tone: ToneOption, templateType?: string): string {
  // Base system prompt for content generation
  let systemPrompt = `You are an expert content creator specializing in the ${niche} niche.
Write in a ${tone} tone that resonates with the target audience.
Your content should be engaging, informative, and optimized for the specified purpose.`;

  // Add template-specific instructions
  if (templateType) {
    switch (templateType) {
      case 'video_script':
        systemPrompt += `\nCreate a compelling video script with clear sections for intro, body content, and outro.
Include suggestions for b-roll footage, on-screen text, and thumbnail ideas.`;
        break;
      case 'social_post':
        systemPrompt += `\nCreate engaging social media content with a captivating headline, 
concise body text, relevant hashtags, and a clear call-to-action.`;
        break;
      case 'product_review':
        systemPrompt += `\nCreate a balanced product review that highlights both pros and cons.
Include sections for features, benefits, potential drawbacks, and comparisons to alternatives.`;
        break;
      // Add more template types as needed
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
    // Validate request
    const validationResult = contentRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      });
    }
    
    const requestData = validationResult.data;
    
    // Track API usage
    await storage.incrementApiUsage(
      requestData.templateType || 'claude_general',
      requestData.tone
    );
    
    // Enhanced prompt with trending products if requested
    const enhancedPrompt = await enhancePromptWithProducts(
      requestData.prompt,
      requestData.niche as Niche,
      requestData.includeProducts
    );
    
    // Get specialized system prompt
    const systemPrompt = getSystemPrompt(
      requestData.niche as Niche,
      requestData.tone as ToneOption,
      requestData.templateType
    );

    // Handle image-based generation if image is provided
    if (requestData.withImage && requestData.imageBase64) {
      const imagePrompt = `Analyze this image and create content based on it.
Follow these guidelines:
- Create content for the ${requestData.niche} niche
- Use a ${requestData.tone} tone
- Address the following prompt: ${requestData.prompt}`;

      const imageContent = await processImageWithClaude(
        requestData.imageBase64,
        imagePrompt
      );
      
      return res.json({ content: imageContent });
    }
    
    // Handle structured content generation based on template type
    if (requestData.templateType) {
      switch (requestData.templateType) {
        case 'video_script': {
          const videoScriptStructure = `{
            "intro": "String - Attention-grabbing introduction",
            "body": "Array of strings - Main content sections",
            "outro": "String - Conclusion with call to action",
            "b_roll": "Array of strings - Suggested b-roll footage",
            "onscreen_text": "Array of strings - Text to display on screen",
            "script_with_timestamps": "String - Complete script with approximate timestamps",
            "thumbnail_ideas": "Array of strings - Ideas for video thumbnail",
            "duration_estimate": "Number - Estimated duration in seconds",
            "platform_specific_tips": "Array of strings - Tips specific to platform"
          }`;
          
          const videoScript = await generateStructuredContent<VideoScriptResponse>(
            enhancedPrompt,
            videoScriptStructure,
            requestData.temperature
          );
          
          return res.json(videoScript);
        }
        
        case 'social_post': {
          const socialPostStructure = `{
            "headline": "String - Attention-grabbing headline",
            "content": "String - Main post content",
            "hashtags": "Array of strings - Relevant hashtags",
            "callToAction": "String - Clear call to action",
            "imageDescription": "String - Suggested image description",
            "platformSpecificTips": "Object with platform names as keys and tips as values"
          }`;
          
          const socialPost = await generateStructuredContent<SocialMediaPostResponse>(
            enhancedPrompt,
            socialPostStructure,
            requestData.temperature
          );
          
          return res.json(socialPost);
        }
        
        // Add more structured templates as needed
        
        default:
          // If template type is not recognized, fall back to general content
          break;
      }
    }
    
    // General content generation
    const content = await generateWithClaude(
      enhancedPrompt,
      requestData.maxTokens,
      requestData.temperature,
      systemPrompt
    );
    
    // Save generation for analytics
    await storage.saveContentGeneration({
      niche: requestData.niche,
      prompt: requestData.prompt,
      content: content,
      templateType: requestData.templateType || 'claude_general',
      tone: requestData.tone,
      createdAt: new Date()
    });
    
    return res.json({ content });
    
  } catch (error) {
    console.error('Error generating content with Claude:', error);
    return res.status(500).json({ 
      error: 'Failed to generate content',
      message: error.message 
    });
  }
});

/**
 * POST /api/claude-content/analyze-image
 * Analyze an image using Claude's multimodal capabilities
 */
claudeContentRouter.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      imageBase64: z.string(),
      analysisPrompt: z.string().default('Analyze this image in detail')
    });
    
    const validationResult = schema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      });
    }
    
    const { imageBase64, analysisPrompt } = validationResult.data;
    
    const analysis = await processImageWithClaude(
      imageBase64,
      analysisPrompt
    );
    
    return res.json({ analysis });
    
  } catch (error) {
    console.error('Error analyzing image with Claude:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error.message 
    });
  }
});

/**
 * GET /api/claude-content/model-info
 * Get information about available Claude models
 */
claudeContentRouter.get('/model-info', (_req: Request, res: Response) => {
  // Provide information about available Claude models
  return res.json({
    models: [
      {
        id: 'claude-3-7-sonnet-20250219',
        description: 'Advanced Claude model with strong performance across tasks',
        maxTokens: 200000,
        strengths: [
          'Detailed content generation',
          'Creative writing',
          'Complex reasoning',
          'Image understanding'
        ]
      }
    ],
    features: {
      multimodal: true,
      structuredOutput: true,
      systemInstructions: true
    }
  });
});