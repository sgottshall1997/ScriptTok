import Anthropic from '@anthropic-ai/sdk';
import { createErrorResponse, createSuccessResponse, ERROR_CODES } from './responseTypes';
import type { ContentGenerationResponse, ContentGenerationError } from './responseTypes';

// Initialize Anthropic client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ""
});

// Available Claude models
export const CLAUDE_MODELS = {
  PRIMARY: "claude-3-5-sonnet-20241022", // Latest Claude 3.5 Sonnet
  FALLBACK: "claude-3-haiku-20240307", // Faster, cheaper model for fallback
  VISION: "claude-3-5-sonnet-20241022" // Model for image analysis
};

/**
 * Helper function to check if Claude API key is valid
 */
export async function checkClaudeApiKey(): Promise<boolean> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("Claude API key is not set");
      return false;
    }
    
    // Make a small test request
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.FALLBACK, // Use fallback model for validation
      max_tokens: 5,
      messages: [
        { role: "user", content: "Test" }
      ]
    });
    
    return true;
  } catch (error) {
    console.error("Claude API key validation failed:", error);
    return false;
  }
}

/**
 * Generate content with Claude with automatic fallback
 * @param prompt The prompt to send to the model
 * @param options Configuration options
 */
export async function generateWithClaude(
  prompt: string, 
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    metadata?: any;
    tryFallbackOnError?: boolean;
  } = {}
): Promise<ContentGenerationResponse | ContentGenerationError> {
  const {
    maxTokens = 1500,
    temperature = 0.7,
    systemPrompt = "You are a helpful assistant that provides accurate and detailed information.",
    metadata = {},
    tryFallbackOnError = true
  } = options;
  
  console.log(`🚨🚨🚨 CLAUDE SERVICE CALLED: generateWithClaude() function executing`);
  console.log(`🔥 CLAUDE GENERATION START: Using model ${CLAUDE_MODELS.PRIMARY}`);
  console.log(`🎯 CLAUDE PROMPT PREVIEW: ${prompt.substring(0, 100)}...`);
  
  // First try with the primary model
  try {
    const startTime = Date.now();
    
    console.log(`📡 CLAUDE API CALL: Sending request to Anthropic API...`);
    const response = await anthropic.messages.create({
      model: CLAUDE_MODELS.PRIMARY,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt }
      ]
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Extract content from Claude response
    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    if (!content) {
      throw new Error("No content received from Claude");
    }
    
    console.log(`✅ Claude generation successful (${duration}ms)`);
    
    return createSuccessResponse({
      content,
      model: CLAUDE_MODELS.PRIMARY,
      duration,
      tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      metadata: {
        ...metadata,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        stopReason: response.stop_reason
      }
    });
    
  } catch (error) {
    console.error(`❌ Claude primary model failed:`, error);
    
    // Try fallback model if enabled
    if (tryFallbackOnError) {
      try {
        console.log(`🔄 Attempting Claude fallback model...`);
        const startTime = Date.now();
        
        const response = await anthropic.messages.create({
          model: CLAUDE_MODELS.FALLBACK,
          max_tokens: maxTokens,
          temperature: temperature,
          system: systemPrompt,
          messages: [
            { role: "user", content: prompt }
          ]
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Extract content from Claude response
        const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
        
        if (!content) {
          throw new Error("No content received from Claude fallback");
        }
        
        console.log(`✅ Claude fallback generation successful (${duration}ms)`);
        
        return createSuccessResponse({
          content,
          model: CLAUDE_MODELS.FALLBACK,
          duration,
          tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
          metadata: {
            ...metadata,
            inputTokens: response.usage?.input_tokens || 0,
            outputTokens: response.usage?.output_tokens || 0,
            stopReason: response.stop_reason,
            usedFallback: true
          }
        });
        
      } catch (fallbackError) {
        console.error(`❌ Claude fallback model also failed:`, fallbackError);
        
        return createErrorResponse(
          ERROR_CODES.API_ERROR,
          fallbackError instanceof Error ? fallbackError.message : "Claude API error",
          { originalError: error, fallbackError }
        );
      }
    }
    
    return createErrorResponse(
      ERROR_CODES.API_ERROR,
      error instanceof Error ? error.message : "Claude API error",
      { originalError: error }
    );
  }
}

/**
 * Generate content with Claude in JSON mode
 * @param prompt The prompt to send to the model
 * @param options Configuration options
 */
export async function generateJSONWithClaude(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    metadata?: any;
  } = {}
): Promise<ContentGenerationResponse | ContentGenerationError> {
  const {
    maxTokens = 1500,
    temperature = 0.7,
    systemPrompt = "You are a helpful assistant that provides accurate JSON responses.",
    metadata = {}
  } = options;
  
  // Enhance system prompt for JSON
  const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond ONLY with valid JSON. Do not include any text before or after the JSON object. Do not use markdown formatting or code blocks.`;
  
  // Enhance user prompt for JSON
  const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No additional text or formatting.`;
  
  try {
    const response = await generateWithClaude(jsonPrompt, {
      maxTokens,
      temperature,
      systemPrompt: jsonSystemPrompt,
      metadata,
      tryFallbackOnError: true
    });
    
    if (!response.success) {
      console.error("Claude response not successful:", response);
      return response;
    }
    
    // Try to parse JSON and clean if needed
    let content = response.data?.content;
    
    // Enhanced debugging for response structure
    if (!response.data) {
      console.error("Claude response missing data field entirely:", response);
      return createErrorResponse(
        ERROR_CODES.INVALID_RESPONSE,
        "Claude response missing data field",
        { fullResponse: response }
      );
    }
    
    // Validate content exists before processing
    if (!content || typeof content !== 'string') {
      console.error("Claude response missing content field:", {
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        contentType: typeof content,
        contentValue: content
      });
      return createErrorResponse(
        ERROR_CODES.INVALID_RESPONSE,
        "Claude response missing content field",
        { responseData: response.data }
      );
    }
    
    // Remove potential markdown formatting
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to parse JSON to validate
    try {
      JSON.parse(content);
    } catch (jsonError) {
      console.error("Claude JSON parsing failed:", jsonError);
      return createErrorResponse(
        ERROR_CODES.INVALID_RESPONSE,
        "Invalid JSON response from Claude",
        { originalContent: content, parseError: jsonError }
      );
    }
    
    return {
      ...response,
      data: {
        ...response.data,
        content,
        metadata: {
          ...response.data.metadata,
          ...metadata,
          jsonParsed: true
        }
      }
    };
    
  } catch (error) {
    return createErrorResponse(
      ERROR_CODES.API_ERROR,
      error instanceof Error ? error.message : "Claude JSON generation error",
      { originalError: error }
    );
  }
}