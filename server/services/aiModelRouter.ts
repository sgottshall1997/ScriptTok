/**
 * AI MODEL ROUTER
 * Unified interface for all AI model interactions with Claude supremacy
 */

import { generateWithClaude as claudeGenerate } from './claude';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIGenerationRequest {
  model?: 'claude' | 'chatgpt';
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
  
  // Support both Claude and ChatGPT models, default to Claude
  const selectedModel = config.model || 'claude';
  
  console.log(`🤖 AI ROUTER: Using ${selectedModel.toUpperCase()} for generation`);
  console.log(`📝 Prompt length: ${prompt.length} chars`);
  console.log(`🏛️ Content format: ${config.metadata?.contentFormat || 'regular'}`);
  
  try {
    let response: AIGenerationResponse;
    
    if (selectedModel === 'chatgpt') {
      // Use ChatGPT/OpenAI
      response = await generateWithOpenAI(prompt, config);
    } else {
      // Default to Claude
      response = await generateWithClaudeRouter(prompt, config);
    }
    
    const processingTime = Date.now() - startTime;
    response.processingTime = processingTime;
    
    console.log(`✅ ${selectedModel.toUpperCase()} generation completed in ${processingTime}ms`);
    return response;
    
  } catch (error) {
    console.error(`❌ ${selectedModel.toUpperCase()} generation failed:`, error);
    
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
async function generateWithClaudeRouter(prompt: string, config: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    console.log('🔵 Routing to Claude AI service...');
    
    const claudeConfig = {
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1500,
      useJson: config.useJson || false
    };
    
    const claudeResponse = await claudeGenerate(prompt, claudeConfig);
    
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
 * OPENAI/CHATGPT GENERATION
 */
async function generateWithOpenAI(prompt: string, config: AIGenerationRequest): Promise<AIGenerationResponse> {
  try {
    console.log('🔵 Routing to OpenAI service...');
    
    const systemPrompt = config.systemPrompt || 'You are a helpful AI assistant specializing in content creation.';
    const temperature = config.temperature || 0.7;
    const maxTokens = config.maxTokens || 1500;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
      ...(config.useJson && { response_format: { type: "json_object" } })
    });
    
    const content = response.choices[0]?.message?.content;
    const tokensUsed = response.usage?.total_tokens || 0;
    
    if (content) {
      return {
        success: true,
        content: content,
        model: 'chatgpt',
        tokensUsed: tokensUsed
      };
    } else {
      throw new Error('No content returned from OpenAI');
    }
  } catch (error) {
    console.error('❌ OpenAI generation error:', error);
    throw error;
  }
}

/**
 * MODEL AVAILABILITY CHECKER
 */
export async function checkModelAvailability(): Promise<{
  claude: boolean;
  chatgpt: boolean;
  preferred: 'claude';
}> {
  const results = {
    claude: false,
    chatgpt: false,
    preferred: 'claude' as const
  };
  
  // Test Claude availability
  try {
    const claudeTest = await generateWithClaudeRouter('Test message', {
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
    const chatgptTest = await generateWithOpenAI('Test message', {
      model: 'chatgpt',
      temperature: 0.3,
      maxTokens: 50
    });
    results.chatgpt = chatgptTest.success;
  } catch (error) {
    console.log('ChatGPT availability test failed:', error.message);
  }
  
  console.log(`🔍 AI Model Availability: Claude: ${results.claude}, ChatGPT: ${results.chatgpt}, Preferred: Claude`);
  
  return results;
}

/**
 * GET OPTIMAL MODEL FOR TASK
 */
export function getOptimalModel(taskType: string, contentFormat: 'regular' | 'spartan' = 'regular'): 'claude' | 'chatgpt' {
  // Default to Claude but allow both models
  console.log(`🎯 Optimal model for ${taskType} (${contentFormat}): CLAUDE (default preference)`);
  return 'claude';
}

/**
 * GET AVAILABLE MODELS
 */
export async function getAvailableModels(): Promise<{
  claude: boolean;
  chatgpt: boolean;
  preferred: 'claude';
}> {
  return await checkModelAvailability();
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

