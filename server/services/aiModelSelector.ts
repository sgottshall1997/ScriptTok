/**
 * AI Model Selector Service
 * This service manages the selection of appropriate OpenAI models and parameters
 * based on the content niche and generation needs.
 */
import { Niche, NICHES, TONE_OPTIONS } from '@shared/constants';
import { PromptParams } from '../prompts';

// Interface for AI model configuration
export interface AIModelConfig {
  modelName: string;
  temperature: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

// Default configuration that works well for general content
const DEFAULT_MODEL_CONFIG: AIModelConfig = {
  modelName: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  temperature: 0.7,
  maxTokens: 2048,
  frequencyPenalty: 0.5,
  presencePenalty: 0.0
};

// Specialized configurations for different niches
const NICHE_CONFIGURATIONS: Record<string, Partial<AIModelConfig>> = {
  // Skincare niche - lower temperature for more factual content
  skincare: {
    temperature: 0.6,
    frequencyPenalty: 0.3,
    presencePenalty: 0.2
  },
  
  // Tech niche - higher precision with lower temperature
  tech: {
    temperature: 0.5,
    maxTokens: 2048,
    frequencyPenalty: 0.4
  },
  
  // Fashion niche - more creative with higher temperature
  fashion: {
    temperature: 0.85,
    frequencyPenalty: 0.3
  },
  
  // Fitness niche - balanced approach
  fitness: {
    temperature: 0.65,
    presencePenalty: 0.1
  },
  
  // Food niche - more creative content
  food: {
    temperature: 0.8,
    frequencyPenalty: 0.3,
    presencePenalty: 0.2
  },
  
  // Home niche - practical content with moderate creativity
  home: {
    temperature: 0.6,
    frequencyPenalty: 0.4
  },
  
  // Pet niche - friendly, approachable content
  pet: {
    temperature: 0.75,
    frequencyPenalty: 0.3,
    presencePenalty: 0.1
  },
  
  // Travel niche - descriptive and engaging
  travel: {
    temperature: 0.8,
    frequencyPenalty: 0.2,
    presencePenalty: 0.1
  }
};

/**
 * Get the AI model configuration based on niche and template type
 * @param params Parameters used to determine the appropriate model config
 * @returns AI model configuration tailored to the specific content needs
 */
export function getModelConfig(params: PromptParams): AIModelConfig {
  const { niche, templateType, tone } = params;
  
  // Start with the default configuration
  const config = { ...DEFAULT_MODEL_CONFIG };
  
  // Apply niche-specific adjustments if available
  if (niche && NICHE_CONFIGURATIONS[niche]) {
    Object.assign(config, NICHE_CONFIGURATIONS[niche]);
  }
  
  // Adjust based on template type
  if (templateType === 'comparison' || templateType === 'pros_cons') {
    // These templates need more factual content
    config.temperature = Math.max(0.5, config.temperature - 0.1);
  } else if (templateType === 'caption' || templateType === 'influencer_caption') {
    // These templates need more creative content
    config.temperature = Math.min(0.9, config.temperature + 0.1);
  }
  
  // Adjust based on tone
  if (tone === 'professional' || tone === 'scientific') { // scientific is our analytical tone
    config.temperature = Math.max(0.5, config.temperature - 0.1);
  } else if (tone === 'enthusiastic' || tone === 'casual') {
    config.temperature = Math.min(0.9, config.temperature + 0.1);
  }
  
  return config;
}

/**
 * Adjust the token limit based on template type and content needs
 * @param templateType The type of template being generated
 * @returns Adjusted max token value
 */
export function getTokenLimit(templateType: string): number {
  // Different template types need different token limits
  switch (templateType) {
    case 'original':
    case 'personal_review':
      return 3072; // Longer for detailed reviews
    case 'caption':
    case 'influencer_caption':
      return 1024; // Shorter for captions
    case 'tiktok_breakdown':
    case 'surprise_me':
      return 2048; // Medium for varied content
    default:
      return 2048; // Default for most template types
  }
}