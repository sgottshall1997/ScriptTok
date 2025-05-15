import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate content using Anthropic's Claude models
 * @param prompt The prompt to send to Claude
 * @param maxTokens Maximum tokens for response
 * @param temperature Temperature for randomness (0-1)
 * @param systemPrompt Optional system prompt for context
 * @returns The generated response text
 */
export async function generateWithClaude(
  prompt: string,
  maxTokens: number = 1024,
  temperature: number = 0.7,
  systemPrompt?: string
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    if (message.content[0].type === 'text') {
      return message.content[0].text;
    }
    return "No text content found in response";
  } catch (error: any) {
    console.error('Error calling Anthropic API:', error);
    throw new Error(`Failed to generate content with Claude: ${error.message}`);
  }
}

/**
 * Analyze sentiment of given text using Claude
 * @param text The text to analyze
 * @returns Object containing sentiment and confidence score
 */
export async function analyzeSentiment(text: string): Promise<{ sentiment: string, confidence: number }> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: `You're a Customer Insights AI. Analyze this feedback and output in JSON format with keys: "sentiment" (positive/negative/neutral) and "confidence" (number, 0 through 1).`,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: text }
      ],
    });

    if (response.content[0].type === 'text') {
      const result = JSON.parse(response.content[0].text);
      return {
        sentiment: result.sentiment,
        confidence: Math.max(0, Math.min(1, result.confidence))
      };
    }
    throw new Error("No text content found in response");
  } catch (error: any) {
    console.error('Error analyzing sentiment with Claude:', error);
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
}

/**
 * Generate content with specific data structure using Claude
 * @param prompt The detailed prompt
 * @param structureDefinition Definition of the expected response structure
 * @param temperature Temperature for randomness (0-1)
 * @returns Structured response object
 */
export async function generateStructuredContent<T>(
  prompt: string,
  structureDefinition: string,
  temperature: number = 0.7
): Promise<T> {
  try {
    const systemPrompt = `You are a specialized content generation AI. 
    Your output must strictly follow this JSON structure: ${structureDefinition}
    Return valid JSON only. No additional text, explanations, or markdown.`;
    
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      system: systemPrompt,
      max_tokens: 2048,
      temperature,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    if (response.content[0].type === 'text') {
      return JSON.parse(response.content[0].text) as T;
    }
    throw new Error("No text content found in response");
  } catch (error: any) {
    console.error('Error generating structured content with Claude:', error);
    throw new Error(`Failed to generate structured content: ${error.message}`);
  }
}

/**
 * Process an image with Claude for analysis or content generation
 * @param base64Image Base64 encoded image data
 * @param prompt Text prompt describing what to do with the image
 * @returns Generated text response
 */
export async function processImageWithClaude(
  base64Image: string,
  prompt: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    return "No text content found in response";
  } catch (error: any) {
    console.error('Error processing image with Claude:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Create a specialized content generator for a particular use case
 * @param systemPrompt The system prompt that defines the use case
 * @returns A function that takes a user prompt and returns the generated content
 */
export function createSpecializedGenerator(systemPrompt: string) {
  return async (userPrompt: string, maxTokens: number = 1024, temperature: number = 0.7): Promise<string> => {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        system: systemPrompt,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      });

      if (response.content[0].type === 'text') {
        return response.content[0].text;
      }
      return "No text content found in response";
    } catch (error: any) {
      console.error('Error with specialized generator:', error);
      throw new Error(`Failed with specialized generator: ${error.message}`);
    }
  };
}

const claudeUtils = {
  generateWithClaude,
  analyzeSentiment,
  generateStructuredContent,
  processImageWithClaude,
  createSpecializedGenerator
};

export default claudeUtils;