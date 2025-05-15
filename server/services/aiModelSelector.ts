/**
 * AI Model Selector Service
 * 
 * This service handles the selection of appropriate model configurations based on:
 * 1. The niche (industry vertical)
 * 2. Template type being used
 * 3. Tone of voice required
 * 4. Additional contextual factors
 * 
 * It provides optimized parameters for different content generation scenarios.
 */

import { Niche, TemplateType, ToneOption } from '@shared/constants';

// Base interface for model config
interface ModelConfig {
  modelName: string;
  temperature: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

// Interface for input parameters to getModelConfig
interface ModelConfigParams {
  niche: Niche;
  templateType: TemplateType;
  tone: ToneOption;
  productName?: string;
}

// Default model configuration (base settings)
const DEFAULT_MODEL_CONFIG: ModelConfig = {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  modelName: 'gpt-4o',
  temperature: 0.7,
  frequencyPenalty: 0.2,
  presencePenalty: 0.1,
};

// Specialized configurations by niche
const NICHE_CONFIGS: Record<Niche, Partial<ModelConfig>> = {
  'skincare': {
    temperature: 0.65,  // More factual/precise for skincare
    frequencyPenalty: 0.3,  // Avoid repetition of scientific terms
  },
  'tech': {
    temperature: 0.6,  // More factual for tech reviews
    frequencyPenalty: 0.4,  // Avoid repetition of technical jargon
  },
  'fashion': {
    temperature: 0.8,  // More creative for fashion
    frequencyPenalty: 0.2,  // Some repetition of key style terms is acceptable
  },
  'fitness': {
    temperature: 0.65,  // Balance between creativity and precision
    frequencyPenalty: 0.3,  // Avoid repetitive motivational phrases
  },
  'food': {
    temperature: 0.75,  // More vivid and sensory descriptions
    frequencyPenalty: 0.3,  // Avoid repetition of flavor descriptions
  },
  'pet': {
    temperature: 0.75,  // More playful and engaging
    frequencyPenalty: 0.2,  // Some repetition for emphasis
  },
  'travel': {
    temperature: 0.8,  // More vivid and experiential
    frequencyPenalty: 0.3,  // Avoid repetition of location descriptions
  },
};

// Specialized configurations by template type
const TEMPLATE_TYPE_CONFIGS: Record<string, Partial<ModelConfig>> = {
  'original': {},  // Default settings
  'detailed_review': {
    temperature: 0.6,  // More factual for detailed reviews
    frequencyPenalty: 0.4,  // Avoid repetition in longer content
  },
  'comparison': {
    temperature: 0.65,  // More analytical for comparisons
    frequencyPenalty: 0.3,  // Balance in comparing features
  },
  'tutorial': {
    temperature: 0.5,  // More precise for step-by-step instructions
    frequencyPenalty: 0.4,  // Avoid repetition in procedural content
  },
  'expert_interview': {
    temperature: 0.65,  // Balance between creativity and expertise
    presencePenalty: 0.2,  // Maintain consistent interview voice
  },
  'listicle': {
    temperature: 0.7,  // Engaging but consistent
    frequencyPenalty: 0.3,  // Avoid similar item descriptions
  },
  'trends_report': {
    temperature: 0.7,  // Balance between factual and forward-looking
    frequencyPenalty: 0.3,  // Avoid repetition of trend descriptions
  },
  'product_announcement': {
    temperature: 0.75,  // Enthusiastic but factual
    frequencyPenalty: 0.2,  // Allow some repetition of key features
  },
  'quick_tips': {
    temperature: 0.6,  // More direct and concise
    frequencyPenalty: 0.4,  // Avoid similar tips
  },
  'unboxing': {
    temperature: 0.8,  // More experiential and reactive
    frequencyPenalty: 0.2,  // Allow emotional responses
  },
  'sponsored_post': {
    temperature: 0.7,  // Balanced promotional tone
    frequencyPenalty: 0.3,  // Control repetition of brand mentions
  },
  'video_script': {
    temperature: 0.75,  // More conversational and engaging
    frequencyPenalty: 0.3,  // Varied pacing and emphasis
  },
  'email_newsletter': {
    temperature: 0.7,  // Personable but informative
    frequencyPenalty: 0.3,  // Varied content sections
  },
  'social_media_caption': {
    temperature: 0.8,  // More creative and attention-grabbing
    frequencyPenalty: 0.2,  // Distinctive voice
  },
  'instagram_carousel': {
    temperature: 0.75,  // Visual storytelling focus
    frequencyPenalty: 0.3,  // Consistent narrative across slides
  },
  'tiktok_script': {
    temperature: 0.85,  // More trend-aware and engaging
    frequencyPenalty: 0.2,  // Distinctive voice for short-form
  },
  'user_testimonial': {
    temperature: 0.7,  // Authentic but coherent
    frequencyPenalty: 0.3,  // Avoid repetitive praise
  },
  'faq_content': {
    temperature: 0.5,  // More factual and precise
    frequencyPenalty: 0.4,  // Clear distinctions between questions
  },
  'product_description': {
    temperature: 0.7,  // Balance between factual and persuasive
    frequencyPenalty: 0.3,  // Varied feature highlights
  },
  'gift_guide': {
    temperature: 0.8,  // More personalized and creative
    frequencyPenalty: 0.2,  // Distinct item descriptions
  },
  'seasonal_content': {
    temperature: 0.75,  // Timely and thematic
    frequencyPenalty: 0.3,  // Varied seasonal references
  },
  'how_to_guide': {
    temperature: 0.6,  // Clear and instructional
    frequencyPenalty: 0.4,  // Precise step differentiation
  },
  'case_study': {
    temperature: 0.6,  // More analytical and evidence-based
    frequencyPenalty: 0.4,  // Structured analysis
  },
  'skincare_routine': {
    temperature: 0.65,  // Balance between educational and personalized
    frequencyPenalty: 0.3,  // Clear step differentiation
  },
  'ingredient_spotlight': {
    temperature: 0.6,  // More scientific and educational
    frequencyPenalty: 0.3,  // Varied benefit descriptions
  },
  'fitness_workout': {
    temperature: 0.65,  // Clear and instructional
    frequencyPenalty: 0.4,  // Distinct exercise instructions
  },
  'tech_troubleshooting': {
    temperature: 0.5,  // Precise and solution-oriented
    frequencyPenalty: 0.4,  // Clear problem-solution pairs
  },
  'outfit_inspiration': {
    temperature: 0.85,  // More creative and visual
    frequencyPenalty: 0.2,  // Distinctive style descriptions
  },
  'custom_template': {
    temperature: 0.75,  // Balanced for user-created templates
    frequencyPenalty: 0.3,  // Moderate repetition control
  }
};

// Specialized configurations by tone
const TONE_CONFIGS: Record<ToneOption, Partial<ModelConfig>> = {
  'friendly': {
    temperature: 0.75,  // Warm and approachable
  },
  'professional': {
    temperature: 0.6,  // More formal and precise
  },
  'casual': {
    temperature: 0.8,  // More conversational
  },
  'enthusiastic': {
    temperature: 0.85,  // More energetic and exciting
  },
  'minimalist': {
    temperature: 0.5,  // Direct and concise
  },
  'luxurious': {
    temperature: 0.7,  // Elegant and sophisticated
  },
  'educational': {
    temperature: 0.6,  // More educational and factual
  },
  'humorous': {
    temperature: 0.9,  // More creative and playful
  },
  'trendy': {
    temperature: 0.85,  // Trend-conscious and current
  },
  'scientific': {
    temperature: 0.5,  // Precise and analytical
  },
  'poetic': {
    temperature: 0.9,  // Artistic and expressive
  },
};

/**
 * Determines the token limit based on template type
 * Different content types require different amounts of token space
 */
export function getTokenLimit(templateType: TemplateType): number {
  const LONG_FORM_TEMPLATES = [
    'detailed_review', 
    'comparison', 
    'tutorial', 
    'expert_interview',
    'trends_report',
    'case_study', 
    'how_to_guide',
    'video_script',
  ];
  
  const SHORT_FORM_TEMPLATES = [
    'social_media_caption',
    'tiktok_script',
    'quick_tips',
    'instagram_carousel'
  ];
  
  if (LONG_FORM_TEMPLATES.includes(templateType)) {
    return 2500;  // Higher token limit for detailed content
  } else if (SHORT_FORM_TEMPLATES.includes(templateType)) {
    return 1000;  // Lower token limit for concise content
  } else {
    return 1800;  // Default token limit for medium-length content
  }
}

/**
 * Get the optimized model configuration based on the input parameters
 */
export function getModelConfig({
  niche,
  templateType,
  tone,
  productName = ''
}: ModelConfigParams): ModelConfig {
  // Start with the default configuration
  const config: ModelConfig = { ...DEFAULT_MODEL_CONFIG };
  
  // Apply niche-specific configuration overrides
  if (NICHE_CONFIGS[niche]) {
    Object.assign(config, NICHE_CONFIGS[niche]);
  }
  
  // Apply template type configuration overrides
  if (TEMPLATE_TYPE_CONFIGS[templateType]) {
    Object.assign(config, TEMPLATE_TYPE_CONFIGS[templateType]);
  }
  
  // Apply tone configuration overrides
  if (TONE_CONFIGS[tone]) {
    Object.assign(config, TONE_CONFIGS[tone]);
  }
  
  // Additional adjustments based on context
  // For example, if product name includes technical terms, adjust accordingly
  if (productName && productName.toLowerCase().includes('professional')) {
    config.temperature = Math.max(0.5, config.temperature - 0.1);
  }
  
  // Ensure values are within valid ranges
  config.temperature = Math.min(1.0, Math.max(0.1, config.temperature));
  config.frequencyPenalty = Math.min(2.0, Math.max(0.0, config.frequencyPenalty));
  config.presencePenalty = Math.min(2.0, Math.max(0.0, config.presencePenalty));
  
  return config;
}

export default {
  getModelConfig,
  getTokenLimit
};