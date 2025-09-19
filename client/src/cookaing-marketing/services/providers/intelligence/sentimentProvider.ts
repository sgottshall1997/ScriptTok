/**
 * Sentiment Analysis Provider Interface & Mock Implementation
 */
import type { SentimentSnapshot } from '../../../types/ext';

export interface ISentimentProvider {
  analyzeSentiment(text: string, scope: string, refId: number): Promise<SentimentSnapshot>;
  batchAnalyze(texts: Array<{ text: string; scope: string; refId: number }>): Promise<SentimentSnapshot[]>;
  getStatus(): Promise<{ status: 'ok' | 'mock_mode' | 'error'; message?: string }>;
}

export class MockSentimentProvider implements ISentimentProvider {
  async analyzeSentiment(text: string, scope: string, refId: number): Promise<SentimentSnapshot> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const score = this.calculateMockSentiment(text);
    const magnitude = Math.abs(score) * (0.7 + Math.random() * 0.3);
    
    return {
      scope: scope as any,
      refId,
      score,
      magnitude,
      labels: {
        positive: score > 0 ? Math.abs(score) : 0,
        negative: score < 0 ? Math.abs(score) : 0,
        neutral: score === 0 ? 1 : Math.max(0, 1 - Math.abs(score)),
        emotion: this.getEmotionLabel(score),
      },
      createdAt: new Date(),
    };
  }

  async batchAnalyze(texts: Array<{ text: string; scope: string; refId: number }>): Promise<SentimentSnapshot[]> {
    // Simulate batch processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return Promise.all(texts.map(({ text, scope, refId }) => 
      this.analyzeSentiment(text, scope, refId)
    ));
  }

  private calculateMockSentiment(text: string): number {
    const positiveWords = ['amazing', 'great', 'love', 'awesome', 'fantastic', 'excellent', 'wonderful', 'perfect', 'incredible', 'outstanding'];
    const negativeWords = ['terrible', 'hate', 'awful', 'horrible', 'worst', 'disgusting', 'disappointing', 'useless', 'failure', 'pathetic'];
    
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.3;
      if (negativeWords.includes(word)) score -= 0.3;
    });
    
    // Add some randomness and normalize
    score += (Math.random() - 0.5) * 0.4;
    return Math.max(-1, Math.min(1, score));
  }

  private getEmotionLabel(score: number): string {
    if (score > 0.5) return 'joy';
    if (score > 0.2) return 'satisfaction';
    if (score > -0.2) return 'neutral';
    if (score > -0.5) return 'disappointment';
    return 'anger';
  }

  async getStatus() {
    return { status: 'mock_mode' as const, message: 'Using mock sentiment analysis' };
  }
}

export class GoogleSentimentProvider implements ISentimentProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async analyzeSentiment(text: string, scope: string, refId: number): Promise<SentimentSnapshot> {
    if (!this.apiKey) {
      throw new Error('Google Cloud API key not configured');
    }
    
    // TODO: Implement real Google Cloud Natural Language API integration
    throw new Error('Google sentiment analysis not yet implemented');
  }

  async batchAnalyze(texts: Array<{ text: string; scope: string; refId: number }>): Promise<SentimentSnapshot[]> {
    if (!this.apiKey) {
      throw new Error('Google Cloud API key not configured');
    }
    
    // TODO: Implement batch sentiment analysis
    throw new Error('Google batch sentiment analysis not yet implemented');
  }

  async getStatus() {
    if (!this.apiKey) {
      return { status: 'error' as const, message: 'API key missing' };
    }
    return { status: 'ok' as const };
  }
}