import OpenAI from "openai";

import { createErrorResponse, createSuccessResponse, ERROR_CODES } from './responseTypes';
import type { ContentGenerationResponse, ContentGenerationError } from './responseTypes';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

// Available models in order of preference
export const OPENAI_MODELS = {
  PRIMARY: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  FALLBACK: "gpt-3.5-turbo", // Fallback model for when primary is unavailable or rate limited
  VISION: "gpt-4o", // Model for image analysis
  EMBEDDING: "text-embedding-3-small" // Model for embeddings
};

/**
 * Helper function to check if API key is valid
 */
export async function checkOpenAIApiKey(): Promise<boolean> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return false;
    }
    
    // Make a small test request
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.FALLBACK, // Use fallback model for validation to avoid rate limits
      messages: [
        { role: "user", content: "Test" }
      ],
      max_tokens: 5
    });
    
    return true;
  } catch (error) {
    console.error("OpenAI API key validation failed:", error);
    return false;
  }
}

/**
 * Generate content with automatic fallback to a simpler model if needed
 * @param prompt The prompt to send to the model
 * @param options Configuration options
 */
export async function generateWithFallback(
  prompt: string, 
  options: {
    maxTokens?: number;
    temperature?: number;
    useJson?: boolean;
    systemPrompt?: string;
    metadata?: any;
    tryFallbackOnError?: boolean;
  } = {}
): Promise<ContentGenerationResponse | ContentGenerationError> {
  const {
    maxTokens = 1500,
    temperature = 0.7,
    useJson = false,
    systemPrompt = "You are a helpful assistant that provides accurate and detailed information.",
    metadata = {},
    tryFallbackOnError = true
  } = options;
  
  // First try with the primary model
  try {
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.PRIMARY,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      ...(useJson ? { response_format: { type: "json_object" } } : {}),
    });
    
    const content = response.choices[0]?.message?.content || "";
    
    return createSuccessResponse(
      content,
      OPENAI_MODELS.PRIMARY,
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      {
        requestId: response.id,
        generatedAt: new Date().toISOString(),
        ...metadata
      }
    );
  } catch (error: any) {
    console.warn("Primary model error:", error.message);
    
    // If we shouldn't try fallback or it's not a rate limit error, return the error
    if (!tryFallbackOnError || !isRateLimitError(error)) {
      return createErrorResponse(
        error.message || "Error generating content with primary model",
        getErrorCode(error),
        { originalError: error }
      );
    }
    
    // Try with fallback model
    try {
      console.log("Falling back to", OPENAI_MODELS.FALLBACK);
      
      const fallbackResponse = await openai.chat.completions.create({
        model: OPENAI_MODELS.FALLBACK,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        ...(useJson ? { response_format: { type: "json_object" } } : {}),
      });
      
      const content = fallbackResponse.choices[0]?.message?.content || "";
      
      return createSuccessResponse(
        content,
        OPENAI_MODELS.FALLBACK,
        fallbackResponse.usage?.prompt_tokens || 0,
        fallbackResponse.usage?.completion_tokens || 0,
        {
          requestId: fallbackResponse.id,
          generatedAt: new Date().toISOString(),
          fallbackUsed: true,
          originalModel: OPENAI_MODELS.PRIMARY,
          ...metadata
        }
      );
    } catch (fallbackError: any) {
      console.error("Fallback model error:", fallbackError.message);
      
      return createErrorResponse(
        "Both primary and fallback models failed. " + fallbackError.message,
        getErrorCode(fallbackError),
        { 
          primaryError: error,
          fallbackError: fallbackError 
        }
      );
    }
  }
}

/**
 * Check if an error is due to rate limiting
 */
function isRateLimitError(error: any): boolean {
  return (
    error?.status === 429 || 
    error?.code === 'rate_limit_exceeded' ||
    (error?.message && /rate.?limit/i.test(error.message))
  );
}

/**
 * Map OpenAI errors to our standard error codes
 */
function getErrorCode(error: any): string {
  if (isRateLimitError(error)) {
    return ERROR_CODES.RATE_LIMIT_EXCEEDED;
  }
  
  if (error?.status === 400 || error?.code === 'invalid_request_error') {
    return ERROR_CODES.INVALID_REQUEST;
  }
  
  if (error?.status === 401 || error?.code === 'authentication_error') {
    return ERROR_CODES.AUTHENTICATION_ERROR;
  }
  
  if (error?.message && /content.?filter/i.test(error.message)) {
    return ERROR_CODES.CONTENT_FILTERED;
  }
  
  return ERROR_CODES.API_ERROR;
}
