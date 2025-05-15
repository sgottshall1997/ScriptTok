/**
 * AI Model Client Service
 * Handles interactions with AI models for content generation and analysis
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ContentGenerationParams {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  model: string;
}

// Main AI model client for content generation and analysis
export const aiModelClient = {
  /**
   * Generate content using the specified AI model
   */
  async generateContent(params: ContentGenerationParams): Promise<string> {
    try {
      const {
        systemPrompt,
        userPrompt,
        temperature = 0.7,
        maxTokens = 1024,
        frequencyPenalty = 0,
        presencePenalty = 0,
        model = 'gpt-4',
      } = params;

      // Use the appropriate AI model based on the model parameter
      if (model.startsWith('claude')) {
        return await this.generateWithClaude(params);
      } else {
        return await this.generateWithOpenAI(params);
      }
    } catch (error) {
      console.error('Error generating content with AI model:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  },

  /**
   * Generate content using OpenAI models
   */
  async generateWithOpenAI(params: ContentGenerationParams): Promise<string> {
    try {
      const {
        systemPrompt,
        userPrompt,
        temperature = 0.7,
        maxTokens = 1024,
        frequencyPenalty = 0,
        presencePenalty = 0,
        model = 'gpt-4',
      } = params;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const actualModel = model === 'gpt-4' ? 'gpt-4o' : model;

      const response = await openai.chat.completions.create({
        model: actualModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Error generating content with OpenAI:', error);
      throw new Error(`Failed to generate content with OpenAI: ${error.message}`);
    }
  },

  /**
   * Generate content using Anthropic Claude models
   */
  async generateWithClaude(params: ContentGenerationParams): Promise<string> {
    try {
      const {
        systemPrompt,
        userPrompt,
        temperature = 0.7,
        maxTokens = 1024,
        model = 'claude-3-7-sonnet-20250219',
      } = params;

      // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      return response.content[0].text || '';
    } catch (error) {
      console.error('Error generating content with Claude:', error);
      throw new Error(`Failed to generate content with Claude: ${error.message}`);
    }
  },

  /**
   * Analyze content semantic meaning
   */
  async analyzeContent(content: string, niche: string): Promise<any> {
    try {
      const systemPrompt = `You are a content analysis expert specializing in the ${niche} niche.
      Analyze the provided content for key themes, entities, sentiment, and engagement potential.`;

      const userPrompt = `Analyze this content in the ${niche} niche:
      
      ${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}
      
      Provide an analysis with the following information in JSON format:
      - keywords: Array of 5-10 important keywords from the content
      - entities: Array of product names, brands, or notable entities mentioned
      - sentiment: Overall sentiment (positive, negative, neutral)
      - engagementScore: A number from 1-10 indicating how engaging this content is likely to be
      - themes: Array of main themes or topics covered
      - targetAudience: Who this content is most likely targeted towards`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const analysisText = response.choices[0]?.message?.content || '{}';
      return JSON.parse(analysisText);
    } catch (error: any) {
      console.error('Error analyzing content:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  }
};