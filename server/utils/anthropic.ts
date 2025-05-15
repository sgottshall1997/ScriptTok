import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Basic text generation with Claude
export async function generateContentWithClaude(prompt: string, options: {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
} = {}) {
  try {
    const { maxTokens = 1024, temperature = 0.7, systemPrompt } = options;

    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    // Handle the content safely with proper type handling
    let contentText = "";
    const contentBlock = message.content[0];
    
    if (contentBlock && typeof contentBlock === 'object' && 'type' in contentBlock) {
      if (contentBlock.type === 'text' && 'text' in contentBlock) {
        contentText = contentBlock.text as string;
      } else {
        contentText = JSON.stringify(contentBlock);
      }
    } else {
      contentText = JSON.stringify(contentBlock);
    }
      
    return {
      content: contentText,
      model: message.model,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    };
  } catch (error) {
    console.error("Error generating content with Claude:", error);
    throw error;
  }
}

// Image analysis with Claude
export async function analyzeImageWithClaude(
  base64Image: string,
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}
) {
  try {
    const { maxTokens = 1024, temperature = 0.7, systemPrompt } = options;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
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

    // Handle the content safely with proper type handling
    let contentText = "";
    const contentBlock = response.content[0];
    
    if (contentBlock && typeof contentBlock === 'object' && 'type' in contentBlock) {
      if (contentBlock.type === 'text' && 'text' in contentBlock) {
        contentText = contentBlock.text as string;
      } else {
        contentText = JSON.stringify(contentBlock);
      }
    } else {
      contentText = JSON.stringify(contentBlock);
    }
      
    return {
      content: contentText,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      }
    };
  } catch (error) {
    console.error("Error analyzing image with Claude:", error);
    throw error;
  }
}

// Get Claude model information
export function getClaudeModels() {
  return [
    {
      id: "claude-3-7-sonnet-20250219",
      name: "Claude 3.7 Sonnet",
      description: "Most advanced Claude model with high accuracy, reliability, and advanced reasoning.",
      contextWindow: 200000,
      costPer1KInputTokens: 0.003,
      costPer1KOutputTokens: 0.015,
      capabilities: ["Text generation", "Context understanding", "Image analysis"],
      released: "February 2025"
    },
    {
      id: "claude-3-5-sonnet-20240620",
      name: "Claude 3.5 Sonnet",
      description: "Balanced model with excellent reasoning capabilities at a moderate price point.",
      contextWindow: 180000,
      costPer1KInputTokens: 0.003,
      costPer1KOutputTokens: 0.015,
      capabilities: ["Text generation", "Context understanding", "Image analysis"],
      released: "June 2024"
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      description: "Highest capability model from the Claude 3 family, excellent at complex tasks.",
      contextWindow: 150000,
      costPer1KInputTokens: 0.015,
      costPer1KOutputTokens: 0.075,
      capabilities: ["Text generation", "Context understanding", "Image analysis"],
      released: "February 2024"
    }
  ];
}