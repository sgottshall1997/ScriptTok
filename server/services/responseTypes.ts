/**
 * Standard API response types for content generation endpoints
 * Used to provide consistent formatting across all AI content generation functions
 */

export interface ContentGenerationResponse {
  success: boolean;           // Whether the request was successful
  content: string;            // The generated content
  model: string;              // The AI model used (e.g., "gpt-4o", "claude-3-7-sonnet-20250219")
  tokens: {
    prompt: number;           // Number of tokens in the prompt
    completion: number;       // Number of tokens in the completion
    total: number;            // Total tokens used
  };
  metadata: {
    requestId?: string;       // Unique identifier for the request
    generatedAt: string;      // ISO timestamp when content was generated
    promptTemplate?: string;  // Which template was used
    fallbackLevel?: 'exact' | 'default' | 'generic'; // Which fallback level was used for the template
    niche?: string;           // Content niche
    productName?: string;     // Product the content is about
    tone?: string;            // Tone used for generation
    fallbackUsed?: boolean;   // Whether a fallback model was used
    originalModel?: string;   // If fallback used, the originally requested model
  };
}

export interface ContentGenerationError {
  success: false;
  error: {
    message: string;          // Human-readable error message
    code: string;             // Error code (e.g., "rate_limit_exceeded")
    details?: any;            // Additional error details
  };
  metadata: {
    requestId?: string;       // Unique identifier for the request
    timestamp: string;        // ISO timestamp when the error occurred
  };
}

/**
 * Create a successful response
 */
export function createSuccessResponse(
  content: string,
  model: string, 
  promptTokens: number,
  completionTokens: number,
  metadata: Partial<ContentGenerationResponse['metadata']> = {}
): ContentGenerationResponse {
  return {
    success: true,
    content,
    model,
    tokens: {
      prompt: promptTokens,
      completion: completionTokens,
      total: promptTokens + completionTokens
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      ...metadata
    }
  };
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  details?: any
): ContentGenerationError {
  return {
    success: false,
    error: {
      message,
      code,
      details
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  };
}

// Common error codes
export const ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_REQUEST: 'invalid_request',
  MODEL_UNAVAILABLE: 'model_unavailable',
  CONTENT_FILTERED: 'content_filtered',
  API_ERROR: 'api_error',
  SERVER_ERROR: 'server_error',
  AUTHENTICATION_ERROR: 'authentication_error'
};