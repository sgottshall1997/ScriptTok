/**
 * AI MODEL ROUTER
 * Unified interface for all AI model interactions with Claude supremacy
 */

import { generateWithClaude as claudeGenerate } from './claude';

export interface AIGenerationRequest {
  model: 'claude';
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
  
  // CLAUDE ONLY SYSTEM - No fallbacks, no alternatives
  const selectedModel = 'claude';
  
  console.log(`🤖 AI ROUTER: Using CLAUDE ONLY for generation`);
  console.log(`📝 Prompt length: ${prompt.length} chars`);
  console.log(`🏛️ Content format: ${config.metadata?.contentFormat || 'regular'}`);
  
  try {
    // Only use Claude AI - no alternatives
    const response = await generateWithClaudeRouter(prompt, config);
    
    const processingTime = Date.now() - startTime;
    response.processingTime = processingTime;
    
    console.log(`✅ Claude generation completed in ${processingTime}ms`);
    return response;
    
  } catch (error) {
    console.error(`❌ Claude generation failed:`, error);
    
    return {
      success: false,
      error: error.message,
      model: 'claude',
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

// ChatGPT functions removed - Claude-only system

/**
 * MODEL AVAILABILITY CHECKER
 */
export async function checkModelAvailability(): Promise<{
  claude: boolean;
  preferred: 'claude';
}> {
  const results = {
    claude: false,
    preferred: 'claude' as const
  };
  
  // Test Claude availability only
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
  
  console.log(`🔍 AI Model Availability: Claude: ${results.claude}, System: CLAUDE-ONLY`);
  
  return results;
}

/**
 * GET OPTIMAL MODEL FOR TASK
 */
export function getOptimalModel(taskType: string, contentFormat: 'regular' | 'spartan' = 'regular'): 'claude' {
  // CLAUDE ONLY: Always return Claude as the only option
  console.log(`🎯 Optimal model for ${taskType} (${contentFormat}): CLAUDE (Claude-only system)`);
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
}

// Simple in-memory stats (could be enhanced with database storage)
let usageStats: ModelUsageStats = {
  claude: { requests: 0, successes: 0, failures: 0, totalTokens: 0, averageResponseTime: 0 }
};

export function updateModelStats(model: 'claude', success: boolean, tokens: number = 0, responseTime: number = 0): void {
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
    claude: { requests: 0, successes: 0, failures: 0, totalTokens: 0, averageResponseTime: 0 }
  };
}

/**
 * GET AVAILABLE MODELS
 */
export async function getAvailableModels(): Promise<{ claude: boolean; default: string }> {
  const availability = await checkModelAvailability();
  return {
    claude: availability.claude,
    default: 'claude' // Claude-only system
  };
}