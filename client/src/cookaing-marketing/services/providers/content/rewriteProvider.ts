/**
 * Content Rewrite Provider Interface & Mock Implementation
 */
import type { RewriteRequest, RewriteResponse } from '../../../types/ext';

export interface IRewriteProvider {
  rewriteText(request: RewriteRequest): Promise<RewriteResponse>;
  getStatus(): Promise<{ status: 'ok' | 'mock_mode' | 'error'; message?: string }>;
}

export class MockRewriteProvider implements IRewriteProvider {
  async rewriteText(request: RewriteRequest): Promise<RewriteResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { text, style, constraints = [] } = request;
    
    const variations = this.generateMockVariations(text, style);
    
    return {
      mode: 'mock',
      variations,
      provider: 'mock-rewrite',
      originalLength: text.length,
      avgLength: Math.floor(variations.reduce((sum, v) => sum + v.text.length, 0) / variations.length),
    };
  }

  private generateMockVariations(text: string, style: string) {
    const baseText = text;
    
    switch (style) {
      case 'casual':
        return [
          { text: `Hey! ${baseText.toLowerCase()} 😊`, style, score: 0.85 },
          { text: `So ${baseText.toLowerCase()}...`, style, score: 0.78 },
          { text: `Honestly, ${baseText.toLowerCase()}!`, style, score: 0.82 },
        ];
      case 'professional':
        return [
          { text: `We are pleased to inform you that ${baseText.toLowerCase()}.`, style, score: 0.92 },
          { text: `It is our understanding that ${baseText.toLowerCase()}.`, style, score: 0.88 },
          { text: `We would like to highlight that ${baseText.toLowerCase()}.`, style, score: 0.89 },
        ];
      case 'enthusiastic':
        return [
          { text: `🎉 ${baseText.toUpperCase()}! This is AMAZING!`, style, score: 0.94 },
          { text: `Wow! ${baseText}! Can't wait to share this!`, style, score: 0.91 },
          { text: `Incredible news! ${baseText}! 🚀`, style, score: 0.93 },
        ];
      case 'authoritative':
        return [
          { text: `Research confirms: ${baseText.toLowerCase()}.`, style, score: 0.87 },
          { text: `Studies show that ${baseText.toLowerCase()}.`, style, score: 0.89 },
          { text: `Evidence indicates ${baseText.toLowerCase()}.`, style, score: 0.85 },
        ];
      default:
        return [
          { text: baseText, style, score: 0.75 },
          { text: `${baseText} (Enhanced version)`, style, score: 0.80 },
        ];
    }
  }

  async getStatus() {
    return { status: 'mock_mode' as const, message: 'Using mock content rewriting' };
  }
}

export class ClaudeRewriteProvider implements IRewriteProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async rewriteText(request: RewriteRequest): Promise<RewriteResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    // TODO: Implement real Claude integration for content rewriting
    throw new Error('Claude rewrite not yet implemented');
  }

  async getStatus() {
    if (!this.apiKey) {
      return { status: 'error' as const, message: 'API key missing' };
    }
    return { status: 'ok' as const };
  }
}