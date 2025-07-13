/**
 * AI MODEL ROUTER
 * Unified interface for all AI model interactions with Claude supremacy
 */

import { generateWithClaude } from './claude';
import { generateWithFallback as generateWithOpenAI } from './openai';

export interface AIGenerationRequest {
  model: 'chatgpt' | 'claude';
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  useJson?: boolean;
  metadata?: {
    templateType?: string;
    niche?: string;
    productName?: string;
    contentFormat?: string;
    platform?: string;
  };
}

export interface AIGenerationResponse {
  success: boolean;
  content?: any;
  data?: string;
  error?: string;
  model: string;
  tokensUsed?: number;
  processingTime?: number;
}

/**
 * GENERATE WITH AI - CLAUDE SUPREMACY ENFORCED
 */
export async function generateWithAI(prompt: string, config: AIGenerationRequest): Promise<AIGenerationResponse> {
  const startTime = Date.now();
  
  // CLAUDE SUPREMACY: Always prioritize Claude when specified or default to Claude
  const selectedModel = config.model || 'claude';
  
  console.log(`🤖 AI ROUTER: Using ${selectedModel.toUpperCase()} for generation`);
  console.log(`📝 Prompt length: ${prompt.length} chars`);
  console.log(`🏛️ Content format: ${config.metadata?.contentFormat || 'regular'}`);
  
  try {
    let response: AIGenerationResponse;
    
    if (selectedModel === 'claude') {
      // Use Claude AI
      response = await generateWithClaude(prompt, config);
    } else {
      // Use ChatGPT as fallback only
      response = await generateWithChatGPT(prompt, config);
    }
    
    const processingTime = Date.now() - startTime;
    response.processingTime = processingTime;
    
    console.log(`✅ AI generation completed in ${processingTime}ms using ${selectedModel.toUpperCase()}`);
    return response;
    
  } catch (error) {
    console.error(`❌ AI generation failed with ${selectedModel}:`, error);
    
    // Only fallback to ChatGPT if Claude fails and was originally requested
    if (selectedModel === 'claude' && config.model === 'claude') {
      console.log('🔄 Falling back to ChatGPT due to Claude failure');
      try {
        const fallbackResponse = await generateWithChatGPT(prompt, config);
        fallbackResponse.processingTime = Date.now() - startTime;
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('❌ Fallback to ChatGPT also failed:', fallbackError);
      }
    }
    
    return {
      success: false,
      error: error.message,
      model: selectedModel,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * CLAUDE AI GENERATION
 */
async function generateWithClaude(prompt: string, config: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    console.log('🔵 Routing to Claude AI service...');
    
    const claudeConfig = {
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1500,
      useJson: config.useJson || false
    };
    
    const claudeResponse = await generateWithClaude(prompt, claudeConfig);
    
    if (claudeResponse.success) {
      return {
        success: true,
        content: claudeResponse.content,
        model: 'claude',
        tokensUsed: claudeResponse.metadata?.usage?.input_tokens + claudeResponse.metadata?.usage?.output_tokens || 0
      };
    } else {
      throw new Error(claudeResponse.error || 'Claude generation failed');
    }
  } catch (error) {
    console.error('❌ Claude generation error:', error);
    throw error;
  }
}

/**
 * CHATGPT AI GENERATION
 */
async function generateWithChatGPT(prompt: string, config: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    console.log('🟠 Routing to ChatGPT AI service...');
    
    const openaiConfig = {
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1500,
      useJson: config.useJson || false
    };
    
    const openaiResponse = await generateWithOpenAI(prompt, openaiConfig);
    
    if (openaiResponse.success) {
      return {
        success: true,
        data: openaiResponse.content,
        model: 'chatgpt',
        tokensUsed: openaiResponse.metadata?.usage?.total_tokens || 0
      };
    } else {
      throw new Error(openaiResponse.error || 'ChatGPT generation failed');
    }
  } catch (error) {
    console.error('❌ ChatGPT generation error:', error);
    throw error;
  }
}

/**
 * MODEL AVAILABILITY CHECKER
 */
export async function checkModelAvailability(): Promise<{
  claude: boolean;
  chatgpt: boolean;
  preferred: 'claude' | 'chatgpt';
}> {
  const results = {
    claude: false,
    chatgpt: false,
    preferred: 'claude' as const
  };
  
  // Test Claude availability
  try {
    const claudeTest = await generateWithClaude('Test message', {
      model: 'claude',
      temperature: 0.3,
      maxTokens: 50
    });
    results.claude = claudeTest.success;
  } catch (error) {
    console.log('Claude availability test failed:', error.message);
  }
  
  // Test ChatGPT availability
  try {
    const chatgptTest = await generateWithChatGPT('Test message', {
      model: 'chatgpt',
      temperature: 0.3,
      maxTokens: 50
    });
    results.chatgpt = chatgptTest.success;
  } catch (error) {
    console.log('ChatGPT availability test failed:', error.message);
  }
  
  // Claude is always preferred when available
  results.preferred = results.claude ? 'claude' : 'chatgpt';
  
  console.log(`🔍 AI Model Availability: Claude: ${results.claude}, ChatGPT: ${results.chatgpt}, Preferred: ${results.preferred.toUpperCase()}`);
  
  return results;
}

/**
 * GET OPTIMAL MODEL FOR TASK
 */
export function getOptimalModel(taskType: string, contentFormat: 'regular' | 'spartan' = 'regular'): 'claude' | 'chatgpt' {
  // CLAUDE SUPREMACY: Always return Claude as optimal
  console.log(`🎯 Optimal model for ${taskType} (${contentFormat}): CLAUDE (supremacy mode)`);
  return 'claude';
}

/**
 * USAGE STATISTICS
 */
export interface ModelUsageStats {
  claude: {
    requests: number;
    successes: number;
    failures: number;
    totalTokens: number;
    averageResponseTime: number;
  };
  chatgpt: {
    requests: number;
    successes: number;
    failures: number;
    totalTokens: number;
    averageResponseTime: number;
  };
}

// Simple in-memory stats (could be enhanced with database storage)
let usageStats: ModelUsageStats = {
  claude: { requests: 0, successes: 0, failures: 0, totalTokens: 0, averageResponseTime: 0 },
  chatgpt: { requests: 0, successes: 0, failures: 0, totalTokens: 0, averageResponseTime: 0 }
};

export function updateModelStats(model: 'claude' | 'chatgpt', success: boolean, tokens: number = 0, responseTime: number = 0): void {
  const stats = usageStats[model];
  stats.requests++;
  
  if (success) {
    stats.successes++;
    stats.totalTokens += tokens;
    stats.averageResponseTime = (stats.averageResponseTime + responseTime) / stats.successes;
  } else {
    stats.failures++;
  }
}

export function getModelStats(): ModelUsageStats {
  return JSON.parse(JSON.stringify(usageStats));
}

/**
 * RESET STATS (for testing)
 */
export function resetModelStats(): void {
  usageStats = {
    claude: { requests: 0, successes: 0, failures: 0, totalTokens: 0, averageResponseTime: 0 },
    chatgpt: { requests: 0, successes: 0, failures: 0, totalTokens: 0, averageResponseTime: 0 }
  };
}

/**
 * GET AVAILABLE MODELS
 */
export async function getAvailableModels(): Promise<{ claude: boolean; chatgpt: boolean; default: string }> {
  const availability = await checkModelAvailability();
  return {
    claude: availability.claude,
    chatgpt: availability.chatgpt,
    default: 'claude' // Claude supremacy
  };
}