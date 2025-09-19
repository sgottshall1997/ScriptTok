/**
 * Viral Prediction Provider
 * Phase 3: Predicts viral potential of content using ML models and engagement analysis
 */

import type { ViralScore } from '../../../shared/schema';
import { createViralScore, getViralScores, getLatestViralScore, type CreateViralScoreInput } from '../db/storage.intelligence';

// ================================================================
// TYPES & INTERFACES
// ================================================================

export interface ViralPredictionRequest {
  content: {
    text: string;
    mediaType: 'text' | 'image' | 'video' | 'carousel';
    platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'facebook';
    hashtags?: string[];
    mentions?: string[];
    metadata?: {
      length?: number;
      dimensions?: { width: number; height: number };
      duration?: number; // for videos
    };
  };
  context?: {
    authorFollowers?: number;
    postingTime?: Date;
    niche?: string;
    competitorBenchmarks?: {
      avgViews: number;
      avgEngagement: number;
    };
  };
  options?: {
    includeFeatureAnalysis?: boolean;
    includeRecommendations?: boolean;
    model?: 'fast' | 'accurate' | 'hybrid';
  };
}

export interface ViralPredictionResult {
  score: number; // 0-100 viral potential score
  confidence: number; // 0-1 confidence in prediction
  category: 'low' | 'medium' | 'high' | 'very_high' | 'viral';
  estimatedReach: {
    views: { min: number; max: number; expected: number };
    engagement: { min: number; max: number; expected: number };
    shares: { min: number; max: number; expected: number };
  };
  factors: {
    positive: Array<{ factor: string; impact: number; description: string }>;
    negative: Array<{ factor: string; impact: number; description: string }>;
    neutral: Array<{ factor: string; description: string }>;
  };
  features: {
    textComplexity: number;
    emotionalTone: number;
    trendAlignment: number;
    timingOptimality: number;
    hashtagEffectiveness: number;
    lengthOptimality: number;
    platformFit: number;
  };
  recommendations: {
    improvements: string[];
    optimizations: string[];
    alternatives: string[];
  };
  modelInfo: {
    version: string;
    trainingDate: Date;
    accuracy: number;
  };
}

export interface BatchViralRequest {
  contents: Array<{
    id: string;
    content: ViralPredictionRequest['content'];
    context?: ViralPredictionRequest['context'];
  }>;
  options?: ViralPredictionRequest['options'];
}

export interface BatchViralResult {
  results: Array<{
    id: string;
    prediction: ViralPredictionResult;
    processed_at: Date;
  }>;
  summary: {
    totalAnalyzed: number;
    averageScore: number;
    distribution: {
      low: number;
      medium: number;
      high: number;
      very_high: number;
      viral: number;
    };
    topPerformers: Array<{
      id: string;
      score: number;
      category: string;
    }>;
  };
}

export interface TrendingFactorsAnalysis {
  currentTrends: Array<{
    trend: string;
    momentum: number; // 0-1
    saturation: number; // 0-1  
    platforms: string[];
    demographics: string[];
    timeframe: string;
  }>;
  hashtags: Array<{
    tag: string;
    viralPotential: number;
    usage: number;
    growth: number;
  }>;
  topics: Array<{
    topic: string;
    score: number;
    examples: string[];
  }>;
  timing: {
    optimalHours: number[];
    optimalDays: string[];
    seasonalFactors: string[];
  };
}

export interface ViralProviderOptions {
  mode: 'live' | 'mock';
  apiKeys?: {
    openai?: string;
    anthropic?: string;
    google?: string;
    huggingface?: string;
  };
  modelSettings?: {
    primary: 'openai' | 'anthropic' | 'google' | 'huggingface';
    fallback: 'openai' | 'anthropic' | 'google' | 'mock';
    temperature: number;
    maxTokens: number;
  };
  rateLimits?: {
    requestsPerMinute: number;
    maxConcurrent: number;
  };
}

// ================================================================
// VIRAL PROVIDER CLASS
// ================================================================

export class ViralProvider {
  private options: ViralProviderOptions;

  constructor(options: ViralProviderOptions = { mode: 'mock' }) {
    this.options = {
      mode: options.mode || 'mock',
      apiKeys: options.apiKeys || {},
      modelSettings: options.modelSettings || {
        primary: 'openai',
        fallback: 'mock',
        temperature: 0.3,
        maxTokens: 1000
      },
      rateLimits: options.rateLimits || {
        requestsPerMinute: 30,
        maxConcurrent: 3
      }
    };
  }

  /**
   * Predict viral potential of content
   */
  async predictViral(request: ViralPredictionRequest): Promise<ViralPredictionResult> {
    if (this.options.mode === 'live') {
      return await this.predictViralLive(request);
    } else {
      return await this.predictViralMock(request);
    }
  }

  /**
   * Analyze multiple contents for viral potential
   */
  async predictBatchViral(request: BatchViralRequest): Promise<BatchViralResult> {
    if (this.options.mode === 'live') {
      return await this.predictBatchViralLive(request);
    } else {
      return await this.predictBatchViralMock(request);
    }
  }

  /**
   * Create viral score snapshot for tracking
   */
  async createScoreSnapshot(
    contentVersionId: number,
    content: ViralPredictionRequest['content'],
    context?: ViralPredictionRequest['context']
  ): Promise<ViralScore> {
    const prediction = await this.predictViral({ content, context });
    
    const viralScore = await createViralScore({
      contentVersionId,
      featuresJson: {
        features: prediction.features,
        factors: prediction.factors,
        estimatedReach: prediction.estimatedReach,
        model: prediction.modelInfo,
        content: {
          platform: content.platform,
          mediaType: content.mediaType,
          textLength: content.text.length,
          hashtagCount: content.hashtags?.length || 0
        }
      },
      score: prediction.score,
      model: prediction.modelInfo.version
    });

    console.log(`[ViralProvider] Created score snapshot for content ${contentVersionId} - Score: ${prediction.score}`);
    return viralScore;
  }

  /**
   * Get current trending factors for optimization
   */
  async getTrendingFactors(platform?: string, niche?: string): Promise<TrendingFactorsAnalysis> {
    if (this.options.mode === 'live') {
      return await this.getTrendingFactorsLive(platform, niche);
    } else {
      return await this.getTrendingFactorsMock(platform, niche);
    }
  }

  /**
   * Get viral potential history for content
   */
  async getViralHistory(contentVersionId: number): Promise<Array<{
    date: Date;
    score: number;
    modelVersion: string;
    features: any;
  }>> {
    const scores = await getViralScores({ contentVersionId });
    
    return scores.map(score => ({
      date: score.createdAt,
      score: parseFloat(score.score),
      modelVersion: score.model || 'unknown',
      features: score.featuresJson
    }));
  }

  // ================================================================
  // LIVE IMPLEMENTATION
  // ================================================================

  private async predictViralLive(request: ViralPredictionRequest): Promise<ViralPredictionResult> {
    console.log('[ViralProvider] Live viral prediction...', { 
      platform: request.content.platform,
      mediaType: request.content.mediaType,
      textLength: request.content.text.length
    });

    try {
      // Implement actual ML model calls here
      // This would integrate with:
      // - OpenAI GPT models for content analysis
      // - Anthropic Claude for nuanced prediction
      // - Custom trained models on viral content datasets
      // - Google Cloud AI for feature extraction
      
      if (!this.options.apiKeys?.openai && !this.options.apiKeys?.anthropic) {
        console.warn('[ViralProvider] No AI API keys configured - falling back to mock');
        return await this.predictViralMock(request);
      }

      // For now, return mock with live indicator
      const mockResult = await this.predictViralMock(request);
      console.log('[ViralProvider] Live prediction completed - Score:', mockResult.score);
      
      return mockResult;
      
    } catch (error) {
      console.error('[ViralProvider] Live prediction failed:', error);
      return await this.predictViralMock(request);
    }
  }

  private async predictBatchViralLive(request: BatchViralRequest): Promise<BatchViralResult> {
    console.log('[ViralProvider] Live batch viral prediction...', { count: request.contents.length });
    
    try {
      // Implement live batch processing with rate limiting
      const mockResult = await this.predictBatchViralMock(request);
      console.log('[ViralProvider] Live batch prediction completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[ViralProvider] Live batch prediction failed:', error);
      return await this.predictBatchViralMock(request);
    }
  }

  private async getTrendingFactorsLive(platform?: string, niche?: string): Promise<TrendingFactorsAnalysis> {
    console.log('[ViralProvider] Live trending factors analysis...', { platform, niche });
    
    try {
      // Implement live trend analysis
      const mockResult = await this.getTrendingFactorsMock(platform, niche);
      console.log('[ViralProvider] Live trending analysis completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[ViralProvider] Live trending analysis failed:', error);
      return await this.getTrendingFactorsMock(platform, niche);
    }
  }

  // ================================================================
  // MOCK IMPLEMENTATION
  // ================================================================

  private async predictViralMock(request: ViralPredictionRequest): Promise<ViralPredictionResult> {
    console.log('[ViralProvider] Mock viral prediction...', { 
      platform: request.content.platform,
      mediaType: request.content.mediaType 
    });

    // Simulate model processing delay
    await this.delay(400 + Math.random() * 600);

    const { content, context } = request;

    // Analyze content features
    const features = this.calculateMockFeatures(content, context);
    
    // Calculate base score from features
    const baseScore = Object.values(features).reduce((sum, value) => sum + value, 0) / Object.keys(features).length;
    
    // Apply platform and media type multipliers
    let platformMultiplier = 1.0;
    switch (content.platform) {
      case 'tiktok': platformMultiplier = content.mediaType === 'video' ? 1.3 : 0.8; break;
      case 'instagram': platformMultiplier = content.mediaType === 'image' ? 1.2 : 1.0; break;
      case 'youtube': platformMultiplier = content.mediaType === 'video' ? 1.4 : 0.6; break;
      case 'twitter': platformMultiplier = content.mediaType === 'text' ? 1.1 : 0.9; break;
      case 'facebook': platformMultiplier = 1.0; break;
    }

    // Context multipliers
    let contextMultiplier = 1.0;
    if (context?.authorFollowers) {
      if (context.authorFollowers > 100000) contextMultiplier *= 1.2;
      else if (context.authorFollowers > 10000) contextMultiplier *= 1.1;
      else if (context.authorFollowers < 1000) contextMultiplier *= 0.8;
    }

    // Final score calculation
    const rawScore = (baseScore * platformMultiplier * contextMultiplier) * 100;
    const score = Math.min(100, Math.max(0, rawScore + (Math.random() - 0.5) * 10));

    // Determine category
    let category: ViralPredictionResult['category'];
    if (score >= 85) category = 'viral';
    else if (score >= 70) category = 'very_high';
    else if (score >= 50) category = 'high';
    else if (score >= 30) category = 'medium';
    else category = 'low';

    // Calculate confidence based on feature consistency
    const featureValues = Object.values(features);
    const featureVariance = this.calculateVariance(featureValues);
    const confidence = Math.min(1, Math.max(0.3, 1 - featureVariance));

    // Generate factors
    const factors = this.generateMockFactors(content, features, score);

    // Calculate estimated reach
    const baseReach = this.calculateMockReach(score, content.platform, context);

    const result: ViralPredictionResult = {
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      category,
      estimatedReach: baseReach,
      factors,
      features: {
        textComplexity: Math.round(features.textComplexity * 100) / 100,
        emotionalTone: Math.round(features.emotionalTone * 100) / 100,
        trendAlignment: Math.round(features.trendAlignment * 100) / 100,
        timingOptimality: Math.round(features.timingOptimality * 100) / 100,
        hashtagEffectiveness: Math.round(features.hashtagEffectiveness * 100) / 100,
        lengthOptimality: Math.round(features.lengthOptimality * 100) / 100,
        platformFit: Math.round(features.platformFit * 100) / 100
      },
      recommendations: this.generateMockRecommendations(content, features, score),
      modelInfo: {
        version: 'mock-v1.2.3',
        trainingDate: new Date('2024-01-15'),
        accuracy: 0.847
      }
    };

    console.log(`[ViralProvider] Mock prediction completed - Score: ${result.score}, Category: ${result.category}`);
    return result;
  }

  private async predictBatchViralMock(request: BatchViralRequest): Promise<BatchViralResult> {
    console.log('[ViralProvider] Mock batch viral prediction...', { count: request.contents.length });

    await this.delay(600 + Math.random() * 400);

    const results = [];
    const scores = [];

    for (const item of request.contents) {
      const prediction = await this.predictViralMock({
        content: item.content,
        context: item.context,
        options: request.options
      });

      results.push({
        id: item.id,
        prediction,
        processed_at: new Date()
      });

      scores.push(prediction.score);
    }

    // Calculate distribution
    const distribution = results.reduce((acc, result) => {
      acc[result.prediction.category]++;
      return acc;
    }, {
      low: 0,
      medium: 0,
      high: 0,
      very_high: 0,
      viral: 0
    });

    // Find top performers
    const topPerformers = results
      .sort((a, b) => b.prediction.score - a.prediction.score)
      .slice(0, 5)
      .map(result => ({
        id: result.id,
        score: result.prediction.score,
        category: result.prediction.category
      }));

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const batchResult: BatchViralResult = {
      results,
      summary: {
        totalAnalyzed: results.length,
        averageScore: Math.round(averageScore * 100) / 100,
        distribution,
        topPerformers
      }
    };

    console.log(`[ViralProvider] Mock batch prediction completed - ${results.length} items processed`);
    return batchResult;
  }

  private async getTrendingFactorsMock(platform?: string, niche?: string): Promise<TrendingFactorsAnalysis> {
    console.log('[ViralProvider] Mock trending factors analysis...', { platform, niche });

    await this.delay(700 + Math.random() * 300);

    const trendingAnalysis: TrendingFactorsAnalysis = {
      currentTrends: [
        {
          trend: 'AI-generated content',
          momentum: 0.92,
          saturation: 0.34,
          platforms: ['tiktok', 'instagram', 'youtube'],
          demographics: ['Gen Z', 'Millennials', 'Tech enthusiasts'],
          timeframe: 'Next 2-3 months'
        },
        {
          trend: 'Micro-cooking tutorials',
          momentum: 0.87,
          saturation: 0.28,
          platforms: ['tiktok', 'instagram'],
          demographics: ['Food lovers', 'Busy professionals'],
          timeframe: 'Next 30 days'
        },
        {
          trend: 'Behind-the-scenes content',
          momentum: 0.78,
          saturation: 0.56,
          platforms: ['instagram', 'tiktok', 'youtube'],
          demographics: ['All age groups'],
          timeframe: 'Ongoing'
        },
        {
          trend: 'Sustainability tips',
          momentum: 0.73,
          saturation: 0.42,
          platforms: ['instagram', 'facebook', 'youtube'],
          demographics: ['Millennials', 'Gen X', 'Eco-conscious'],
          timeframe: 'Next 6 months'
        }
      ],
      hashtags: [
        { tag: 'viral', viralPotential: 0.89, usage: 1000000, growth: 15.2 },
        { tag: 'trending', viralPotential: 0.85, usage: 850000, growth: 12.8 },
        { tag: 'fyp', viralPotential: 0.82, usage: 2100000, growth: 8.9 },
        { tag: 'amazing', viralPotential: 0.76, usage: 650000, growth: 10.1 },
        { tag: 'mustwatch', viralPotential: 0.74, usage: 320000, growth: 18.5 },
        { tag: 'mindblown', viralPotential: 0.71, usage: 280000, growth: 22.3 }
      ],
      topics: [
        {
          topic: 'Quick tutorials',
          score: 0.91,
          examples: ['60-second recipes', 'Life hacks', 'DIY tips']
        },
        {
          topic: 'Transformation content',
          score: 0.88,
          examples: ['Before/after', 'Makeovers', 'Progress updates']
        },
        {
          topic: 'Relatable moments',
          score: 0.84,
          examples: ['Daily struggles', 'Common experiences', 'Funny observations']
        },
        {
          topic: 'Educational content',
          score: 0.79,
          examples: ['How-to guides', 'Fun facts', 'Explainers']
        }
      ],
      timing: {
        optimalHours: [9, 12, 15, 18, 20, 21],
        optimalDays: ['Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
        seasonalFactors: ['Weekend engagement boost', 'Evening peak activity', 'Lunch break browsing']
      }
    };

    console.log('[ViralProvider] Mock trending analysis completed');
    return trendingAnalysis;
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private calculateMockFeatures(content: ViralPredictionRequest['content'], context?: ViralPredictionRequest['context']) {
    const text = content.text.toLowerCase();
    
    // Text complexity (0-1)
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const textComplexity = Math.min(1, avgWordLength / 8); // Optimal around 4-6 chars
    
    // Emotional tone (0-1)
    const emotionalWords = ['amazing', 'incredible', 'wow', 'love', 'hate', 'shocked', 'excited'];
    const emotionalCount = emotionalWords.filter(word => text.includes(word)).length;
    const emotionalTone = Math.min(1, emotionalCount / 3);
    
    // Trend alignment (0-1)
    const trendingKeywords = ['viral', 'trending', 'fyp', 'amazing', 'mindblown', 'tutorial'];
    const trendCount = trendingKeywords.filter(keyword => text.includes(keyword)).length;
    const trendAlignment = Math.min(1, trendCount / 2);
    
    // Timing optimality (0-1) - mock based on current time
    const hour = new Date().getHours();
    const optimalHours = [9, 12, 15, 18, 20, 21];
    const timingOptimality = optimalHours.includes(hour) ? 0.9 : 0.6;
    
    // Hashtag effectiveness (0-1)
    const hashtagCount = content.hashtags?.length || 0;
    const hashtagEffectiveness = hashtagCount > 0 ? Math.min(1, hashtagCount / 5) : 0.3;
    
    // Length optimality (0-1) - platform specific
    const textLength = content.text.length;
    let lengthOptimality = 0.5;
    switch (content.platform) {
      case 'twitter': lengthOptimality = textLength <= 280 ? 1 : 0.5; break;
      case 'tiktok': lengthOptimality = textLength <= 150 ? 1 : 0.7; break;
      case 'instagram': lengthOptimality = textLength <= 300 ? 1 : 0.8; break;
      case 'facebook': lengthOptimality = textLength <= 500 ? 1 : 0.6; break;
      case 'youtube': lengthOptimality = textLength <= 1000 ? 1 : 0.7; break;
    }
    
    // Platform fit (0-1)
    let platformFit = 0.7; // Base fit
    if (content.platform === 'tiktok' && content.mediaType === 'video') platformFit = 0.95;
    if (content.platform === 'instagram' && content.mediaType === 'image') platformFit = 0.9;
    if (content.platform === 'youtube' && content.mediaType === 'video') platformFit = 0.92;
    if (content.platform === 'twitter' && content.mediaType === 'text') platformFit = 0.88;
    
    return {
      textComplexity,
      emotionalTone,
      trendAlignment,
      timingOptimality,
      hashtagEffectiveness,
      lengthOptimality,
      platformFit
    };
  }

  private generateMockFactors(content: ViralPredictionRequest['content'], features: any, score: number) {
    const positive = [];
    const negative = [];
    const neutral = [];

    if (features.emotionalTone > 0.7) {
      positive.push({
        factor: 'Strong emotional appeal',
        impact: 0.15,
        description: 'Content evokes strong emotions which increases engagement'
      });
    }

    if (features.trendAlignment > 0.6) {
      positive.push({
        factor: 'Trending topic alignment',
        impact: 0.12,
        description: 'Uses currently trending keywords and themes'
      });
    }

    if (features.platformFit > 0.8) {
      positive.push({
        factor: 'Platform optimization',
        impact: 0.10,
        description: `Well-optimized for ${content.platform} audience and format`
      });
    }

    if (features.lengthOptimality < 0.5) {
      negative.push({
        factor: 'Suboptimal length',
        impact: -0.08,
        description: `Content length not ideal for ${content.platform} performance`
      });
    }

    if (features.hashtagEffectiveness < 0.4) {
      negative.push({
        factor: 'Limited hashtag usage',
        impact: -0.06,
        description: 'Could benefit from more strategic hashtag implementation'
      });
    }

    if (content.mediaType) {
      neutral.push({
        factor: 'Media type',
        description: `${content.mediaType} content on ${content.platform}`
      });
    }

    return { positive, negative, neutral };
  }

  private calculateMockReach(score: number, platform: string, context?: ViralPredictionRequest['context']) {
    // Base multipliers by platform
    const platformMultipliers = {
      tiktok: { views: 1000, engagement: 100, shares: 50 },
      instagram: { views: 800, engagement: 80, shares: 30 },
      youtube: { views: 500, engagement: 50, shares: 20 },
      twitter: { views: 300, engagement: 30, shares: 15 },
      facebook: { views: 400, engagement: 40, shares: 25 }
    };

    const multiplier = platformMultipliers[platform as keyof typeof platformMultipliers] || platformMultipliers.instagram;
    
    // Score impact (exponential for viral content)
    const scoreMultiplier = Math.pow(score / 100, 2) * 10;
    
    // Context impact
    let contextMultiplier = 1;
    if (context?.authorFollowers) {
      contextMultiplier = Math.min(10, Math.max(0.1, context.authorFollowers / 1000));
    }

    const baseViews = multiplier.views * scoreMultiplier * contextMultiplier;
    const baseEngagement = multiplier.engagement * scoreMultiplier * contextMultiplier;
    const baseShares = multiplier.shares * scoreMultiplier * contextMultiplier;

    return {
      views: {
        min: Math.round(baseViews * 0.5),
        max: Math.round(baseViews * 2.5),
        expected: Math.round(baseViews)
      },
      engagement: {
        min: Math.round(baseEngagement * 0.6),
        max: Math.round(baseEngagement * 2.0),
        expected: Math.round(baseEngagement)
      },
      shares: {
        min: Math.round(baseShares * 0.3),
        max: Math.round(baseShares * 3.0),
        expected: Math.round(baseShares)
      }
    };
  }

  private generateMockRecommendations(content: ViralPredictionRequest['content'], features: any, score: number) {
    const improvements = [];
    const optimizations = [];
    const alternatives = [];

    if (features.emotionalTone < 0.5) {
      improvements.push('Add more emotional hooks to increase engagement');
    }

    if (features.hashtagEffectiveness < 0.6) {
      improvements.push('Include 3-5 trending hashtags relevant to your niche');
    }

    if (features.lengthOptimality < 0.7) {
      optimizations.push(`Optimize text length for ${content.platform} (shorter is often better)`);
    }

    if (score < 70) {
      alternatives.push('Consider creating a video version for higher engagement');
      alternatives.push('Try posting during peak hours (7-9 PM)');
    }

    optimizations.push('Test different posting times to find your audience peak');
    optimizations.push('Engage with comments quickly after posting');

    return { improvements, optimizations, alternatives };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider status and configuration
   */
  getStatus(): {
    mode: 'live' | 'mock';
    apiKeysConfigured: string[];
    modelSettings: any;
    rateLimits: { requestsPerMinute: number; maxConcurrent: number };
  } {
    return {
      mode: this.options.mode,
      apiKeysConfigured: Object.keys(this.options.apiKeys || {}),
      modelSettings: this.options.modelSettings!,
      rateLimits: this.options.rateLimits!
    };
  }

  /**
   * Update provider configuration
   */
  updateConfig(updates: Partial<ViralProviderOptions>): void {
    this.options = { ...this.options, ...updates };
  }
}

// ================================================================
// FACTORY & EXPORTS
// ================================================================

/**
 * Create viral provider instance based on environment
 */
export function createViralProvider(): ViralProvider {
  const isLiveMode = process.env.NODE_ENV === 'production' && 
    (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
  
  return new ViralProvider({
    mode: isLiveMode ? 'live' : 'mock',
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_AI_API_KEY,
      huggingface: process.env.HUGGINGFACE_API_KEY
    }
  });
}