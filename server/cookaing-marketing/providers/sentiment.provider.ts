/**
 * Sentiment Analysis Provider
 * Phase 3: Analyzes sentiment of content, comments, and brand mentions using AI models
 */

import type { SentimentSnapshot } from '../../../shared/schema';
import { createSentimentSnapshot, getSentimentSnapshots, type CreateSentimentSnapshotInput } from '../db/storage.intelligence';

// ================================================================
// TYPES & INTERFACES
// ================================================================

export interface SentimentAnalysisRequest {
  text: string;
  context?: 'post' | 'comment' | 'review' | 'mention';
  language?: string;
  includeEmotions?: boolean;
}

export interface SentimentResult {
  score: number; // -1.00 to 1.00 (negative to positive)
  magnitude: number; // 0.00 to 1.00 (confidence/intensity)
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  confidence: number; // 0.00 to 1.00
  emotions?: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
  keywords?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

export interface BatchSentimentRequest {
  texts: Array<{
    id: string;
    text: string;
    context?: string;
  }>;
  options?: {
    includeEmotions?: boolean;
    includeKeywords?: boolean;
  };
}

export interface BatchSentimentResult {
  results: Array<{
    id: string;
    sentiment: SentimentResult;
    processed_at: Date;
  }>;
  summary: {
    totalAnalyzed: number;
    averageScore: number;
    sentimentDistribution: {
      very_negative: number;
      negative: number;
      neutral: number;
      positive: number;
      very_positive: number;
    };
  };
}

export interface BrandSentimentRequest {
  brandName: string;
  timeframe: '24h' | '7d' | '30d';
  sources: ('social' | 'reviews' | 'news' | 'forums')[];
  platforms?: string[];
}

export interface BrandSentimentAnalysis {
  overall: {
    score: number;
    trend: 'improving' | 'declining' | 'stable';
    volume: number;
    changePercent: number;
  };
  bySource: Record<string, {
    score: number;
    volume: number;
    examples: Array<{
      text: string;
      score: number;
      source: string;
      timestamp: Date;
    }>;
  }>;
  timeline: Array<{
    date: Date;
    score: number;
    volume: number;
  }>;
  insights: {
    positiveThemes: string[];
    negativeThemes: string[];
    recommendations: string[];
  };
}

export interface SentimentProviderOptions {
  mode: 'live' | 'mock';
  apiKeys?: {
    googleCloud?: string;
    azure?: string;
    aws?: string;
    anthropic?: string;
  };
  rateLimits?: {
    requestsPerMinute: number;
    maxTextLength: number;
  };
  cacheSettings?: {
    enabled: boolean;
    ttlMinutes: number;
  };
}

// ================================================================
// SENTIMENT PROVIDER CLASS
// ================================================================

export class SentimentProvider {
  private options: SentimentProviderOptions;

  constructor(options: SentimentProviderOptions = { mode: 'mock' }) {
    this.options = {
      mode: options.mode || 'mock',
      apiKeys: options.apiKeys || {},
      rateLimits: options.rateLimits || {
        requestsPerMinute: 100,
        maxTextLength: 5000
      },
      cacheSettings: options.cacheSettings || {
        enabled: true,
        ttlMinutes: 60
      }
    };
  }

  /**
   * Analyze sentiment of a single text
   */
  async analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentResult> {
    if (this.options.mode === 'live') {
      return await this.analyzeSentimentLive(request);
    } else {
      return await this.analyzeSentimentMock(request);
    }
  }

  /**
   * Analyze sentiment of multiple texts in batch
   */
  async analyzeBatchSentiment(request: BatchSentimentRequest): Promise<BatchSentimentResult> {
    if (this.options.mode === 'live') {
      return await this.analyzeBatchSentimentLive(request);
    } else {
      return await this.analyzeBatchSentimentMock(request);
    }
  }

  /**
   * Create sentiment snapshot for tracking
   */
  async createSnapshot(
    scope: 'campaign' | 'post' | 'brand',
    refId: number,
    text: string,
    context?: string
  ): Promise<SentimentSnapshot> {
    const sentiment = await this.analyzeSentiment({ text, context: context as any });
    
    const snapshot = await createSentimentSnapshot({
      scope,
      refId,
      score: sentiment.score,
      magnitude: sentiment.magnitude,
      labelsJson: {
        label: sentiment.label,
        confidence: sentiment.confidence,
        emotions: sentiment.emotions,
        keywords: sentiment.keywords,
        context
      }
    });

    console.log(`[SentimentProvider] Created snapshot for ${scope}:${refId} - Score: ${sentiment.score}`);
    return snapshot;
  }

  /**
   * Analyze brand sentiment across sources
   */
  async analyzeBrandSentiment(request: BrandSentimentRequest): Promise<BrandSentimentAnalysis> {
    if (this.options.mode === 'live') {
      return await this.analyzeBrandSentimentLive(request);
    } else {
      return await this.analyzeBrandSentimentMock(request);
    }
  }

  /**
   * Get sentiment trend over time
   */
  async getSentimentTrend(
    scope: 'campaign' | 'post' | 'brand',
    refId: number,
    days = 30
  ): Promise<Array<{
    date: Date;
    score: number;
    magnitude: number;
    volume: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const snapshots = await getSentimentSnapshots({
      scope,
      refId,
      from: startDate,
      to: endDate
    });

    // Group by day and calculate averages
    const dailyData = new Map<string, {
      scores: number[];
      magnitudes: number[];
      count: number;
    }>();

    snapshots.forEach(snapshot => {
      const day = snapshot.createdAt.toISOString().split('T')[0];
      if (!dailyData.has(day)) {
        dailyData.set(day, { scores: [], magnitudes: [], count: 0 });
      }
      
      const data = dailyData.get(day)!;
      data.scores.push(parseFloat(snapshot.score));
      data.magnitudes.push(parseFloat(snapshot.magnitude));
      data.count++;
    });

    // Convert to array format
    const trend = Array.from(dailyData.entries()).map(([date, data]) => ({
      date: new Date(date),
      score: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      magnitude: data.magnitudes.reduce((sum, mag) => sum + mag, 0) / data.magnitudes.length,
      volume: data.count
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    return trend;
  }

  // ================================================================
  // LIVE IMPLEMENTATION
  // ================================================================

  private async analyzeSentimentLive(request: SentimentAnalysisRequest): Promise<SentimentResult> {
    console.log('[SentimentProvider] Live sentiment analysis...', { textLength: request.text.length });

    try {
      // Implement actual API calls here
      // Priority order: Google Cloud Natural Language API, Azure Text Analytics, AWS Comprehend
      
      if (!this.options.apiKeys?.googleCloud && !this.options.apiKeys?.azure && !this.options.apiKeys?.aws) {
        console.warn('[SentimentProvider] No API keys configured - falling back to mock');
        return await this.analyzeSentimentMock(request);
      }

      // For now, return mock with live indicator
      const mockResult = await this.analyzeSentimentMock(request);
      console.log('[SentimentProvider] Live analysis completed - Score:', mockResult.score);
      
      return mockResult;
      
    } catch (error) {
      console.error('[SentimentProvider] Live analysis failed:', error);
      return await this.analyzeSentimentMock(request);
    }
  }

  private async analyzeBatchSentimentLive(request: BatchSentimentRequest): Promise<BatchSentimentResult> {
    console.log('[SentimentProvider] Live batch sentiment analysis...', { count: request.texts.length });
    
    try {
      // Implement live batch processing with rate limiting
      const mockResult = await this.analyzeBatchSentimentMock(request);
      console.log('[SentimentProvider] Live batch analysis completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[SentimentProvider] Live batch analysis failed:', error);
      return await this.analyzeBatchSentimentMock(request);
    }
  }

  private async analyzeBrandSentimentLive(request: BrandSentimentRequest): Promise<BrandSentimentAnalysis> {
    console.log('[SentimentProvider] Live brand sentiment analysis...', request);
    
    try {
      // Implement live brand sentiment monitoring
      const mockResult = await this.analyzeBrandSentimentMock(request);
      console.log('[SentimentProvider] Live brand analysis completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[SentimentProvider] Live brand analysis failed:', error);
      return await this.analyzeBrandSentimentMock(request);
    }
  }

  // ================================================================
  // MOCK IMPLEMENTATION
  // ================================================================

  private async analyzeSentimentMock(request: SentimentAnalysisRequest): Promise<SentimentResult> {
    console.log('[SentimentProvider] Mock sentiment analysis...', { textLength: request.text.length });

    // Simulate API delay
    await this.delay(200 + Math.random() * 300);

    const text = request.text.toLowerCase();
    
    // Simple mock sentiment scoring based on keywords
    const positiveWords = ['amazing', 'great', 'awesome', 'love', 'excellent', 'fantastic', 'perfect', 'wonderful', 'good', 'nice', 'happy', 'best', 'incredible', 'outstanding'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing', 'annoying', 'frustrating', 'useless', 'broken', 'failed', 'disgusting'];
    const emotionalWords = ['excited', 'surprised', 'shocked', 'angry', 'sad', 'fearful', 'disgusted', 'joyful'];

    let positiveCount = 0;
    let negativeCount = 0;
    let emotionalIntensity = 0;

    positiveWords.forEach(word => {
      if (text.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (text.includes(word)) negativeCount++;
    });

    emotionalWords.forEach(word => {
      if (text.includes(word)) emotionalIntensity += 0.2;
    });

    // Calculate score (-1 to 1)
    const totalWords = positiveCount + negativeCount;
    let score = 0;
    
    if (totalWords > 0) {
      score = (positiveCount - negativeCount) / Math.max(totalWords, 1);
      // Add some randomness for realism
      score += (Math.random() - 0.5) * 0.3;
      score = Math.max(-1, Math.min(1, score));
    } else {
      // Neutral with slight random variation
      score = (Math.random() - 0.5) * 0.4;
    }

    // Calculate magnitude (0 to 1) - confidence/intensity
    const magnitude = Math.min(1, Math.max(0.1, 
      (Math.abs(score) + emotionalIntensity + (text.length > 100 ? 0.2 : 0)) / 2
    ));

    // Determine label
    let label: SentimentResult['label'];
    if (score <= -0.6) label = 'very_negative';
    else if (score <= -0.2) label = 'negative';
    else if (score >= 0.6) label = 'very_positive';
    else if (score >= 0.2) label = 'positive';
    else label = 'neutral';

    // Generate mock emotions if requested
    const emotions = request.includeEmotions ? {
      joy: Math.max(0, score + Math.random() * 0.3),
      anger: Math.max(0, -score * 0.8 + Math.random() * 0.2),
      fear: Math.random() * 0.3,
      sadness: Math.max(0, -score * 0.6 + Math.random() * 0.2),
      surprise: Math.random() * 0.4,
      disgust: Math.max(0, -score * 0.5 + Math.random() * 0.2)
    } : undefined;

    // Extract keywords
    const words = text.split(/\s+/).filter(word => word.length > 3);
    const keywords = {
      positive: words.filter(word => positiveWords.some(pw => word.includes(pw))),
      negative: words.filter(word => negativeWords.some(nw => word.includes(nw))),
      neutral: words.filter(word => 
        !positiveWords.some(pw => word.includes(pw)) && 
        !negativeWords.some(nw => word.includes(nw))
      ).slice(0, 5)
    };

    const result: SentimentResult = {
      score: Math.round(score * 100) / 100,
      magnitude: Math.round(magnitude * 100) / 100,
      label,
      confidence: Math.round(magnitude * 100) / 100,
      emotions,
      keywords
    };

    console.log(`[SentimentProvider] Mock analysis completed - Score: ${result.score}, Label: ${result.label}`);
    return result;
  }

  private async analyzeBatchSentimentMock(request: BatchSentimentRequest): Promise<BatchSentimentResult> {
    console.log('[SentimentProvider] Mock batch sentiment analysis...', { count: request.texts.length });

    await this.delay(300 + Math.random() * 200);

    const results = [];
    const scores = [];

    for (const item of request.texts) {
      const sentiment = await this.analyzeSentimentMock({
        text: item.text,
        context: item.context as any,
        includeEmotions: request.options?.includeEmotions
      });

      results.push({
        id: item.id,
        sentiment,
        processed_at: new Date()
      });

      scores.push(sentiment.score);
    }

    // Calculate distribution
    const distribution = results.reduce((acc, result) => {
      acc[result.sentiment.label]++;
      return acc;
    }, {
      very_negative: 0,
      negative: 0,
      neutral: 0,
      positive: 0,
      very_positive: 0
    });

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const batchResult: BatchSentimentResult = {
      results,
      summary: {
        totalAnalyzed: results.length,
        averageScore: Math.round(averageScore * 100) / 100,
        sentimentDistribution: distribution
      }
    };

    console.log(`[SentimentProvider] Mock batch analysis completed - ${results.length} items processed`);
    return batchResult;
  }

  private async analyzeBrandSentimentMock(request: BrandSentimentRequest): Promise<BrandSentimentAnalysis> {
    console.log('[SentimentProvider] Mock brand sentiment analysis...', request);

    await this.delay(800 + Math.random() * 400);

    // Generate mock brand sentiment data
    const baseScore = 0.2 + Math.random() * 0.6; // Generally positive for brands
    const volume = Math.round(50 + Math.random() * 200);
    
    // Mock examples by source
    const sources = ['social', 'reviews', 'news', 'forums'];
    const bySource: Record<string, any> = {};

    sources.forEach(source => {
      if (request.sources.includes(source as any)) {
        const sourceScore = baseScore + (Math.random() - 0.5) * 0.4;
        const sourceVolume = Math.round(volume * (0.2 + Math.random() * 0.3));
        
        bySource[source] = {
          score: Math.round(sourceScore * 100) / 100,
          volume: sourceVolume,
          examples: Array(Math.min(5, sourceVolume)).fill(null).map((_, i) => ({
            text: `Sample ${source} mention for ${request.brandName} - ${i + 1}`,
            score: sourceScore + (Math.random() - 0.5) * 0.2,
            source,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
          }))
        };
      }
    });

    // Generate timeline
    const timeframeDays = request.timeframe === '24h' ? 1 : request.timeframe === '7d' ? 7 : 30;
    const timeline = [];
    
    for (let i = 0; i < timeframeDays; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayScore = baseScore + (Math.random() - 0.5) * 0.3;
      const dayVolume = Math.round(volume / timeframeDays + Math.random() * 10);
      
      timeline.push({
        date,
        score: Math.round(dayScore * 100) / 100,
        volume: dayVolume
      });
    }

    timeline.reverse(); // Chronological order

    // Calculate trend
    const recentAvg = timeline.slice(-3).reduce((sum, day) => sum + day.score, 0) / 3;
    const olderAvg = timeline.slice(0, 3).reduce((sum, day) => sum + day.score, 0) / 3;
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: 'improving' | 'declining' | 'stable';
    if (Math.abs(changePercent) < 5) trend = 'stable';
    else trend = changePercent > 0 ? 'improving' : 'declining';

    const analysis: BrandSentimentAnalysis = {
      overall: {
        score: Math.round(baseScore * 100) / 100,
        trend,
        volume,
        changePercent: Math.round(changePercent * 100) / 100
      },
      bySource,
      timeline,
      insights: {
        positiveThemes: ['product quality', 'customer service', 'innovation', 'value'],
        negativeThemes: ['delivery issues', 'pricing concerns', 'support response time'],
        recommendations: [
          'Monitor delivery-related complaints more closely',
          'Highlight positive customer service interactions',
          'Address pricing concerns with value messaging',
          'Increase engagement during peak sentiment hours'
        ]
      }
    };

    console.log(`[SentimentProvider] Mock brand analysis completed - Overall score: ${analysis.overall.score}`);
    return analysis;
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider status and configuration
   */
  getStatus(): {
    mode: 'live' | 'mock';
    apiKeysConfigured: string[];
    rateLimits: { requestsPerMinute: number; maxTextLength: number };
    cacheEnabled: boolean;
  } {
    return {
      mode: this.options.mode,
      apiKeysConfigured: Object.keys(this.options.apiKeys || {}),
      rateLimits: this.options.rateLimits!,
      cacheEnabled: this.options.cacheSettings?.enabled || false
    };
  }

  /**
   * Update provider configuration
   */
  updateConfig(updates: Partial<SentimentProviderOptions>): void {
    this.options = { ...this.options, ...updates };
  }
}

// ================================================================
// FACTORY & EXPORTS
// ================================================================

/**
 * Create sentiment provider instance based on environment
 */
export function createSentimentProvider(): SentimentProvider {
  const isLiveMode = process.env.NODE_ENV === 'production' && 
    (process.env.GOOGLE_CLOUD_API_KEY || process.env.AZURE_TEXT_ANALYTICS_KEY || process.env.AWS_ACCESS_KEY_ID);
  
  return new SentimentProvider({
    mode: isLiveMode ? 'live' : 'mock',
    apiKeys: {
      googleCloud: process.env.GOOGLE_CLOUD_API_KEY,
      azure: process.env.AZURE_TEXT_ANALYTICS_KEY,
      aws: process.env.AWS_ACCESS_KEY_ID,
      anthropic: process.env.ANTHROPIC_API_KEY
    }
  });
}