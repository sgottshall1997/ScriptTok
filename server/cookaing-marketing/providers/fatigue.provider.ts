/**
 * Fatigue Detection Provider
 * Phase 3: Detects audience fatigue and content saturation using engagement trend analysis
 */

import type { FatigueSignal } from '../../../shared/schema';
import { createFatigueSignal, getFatigueSignals, getLatestFatigueSignal, getTopicsWithNegativeSlope, type CreateFatigueSignalInput } from '../db/storage.intelligence';

// ================================================================
// TYPES & INTERFACES
// ================================================================

export interface FatigueAnalysisRequest {
  topic: string;
  timeframe: '7d' | '14d' | '30d' | '90d';
  segmentId?: number;
  content?: {
    recentPosts: Array<{
      text: string;
      engagement: number;
      timestamp: Date;
      platform: string;
    }>;
  };
  context?: {
    industry?: string;
    audienceSize?: number;
    competitorData?: Array<{
      author: string;
      engagement: number;
      topic: string;
    }>;
  };
}

export interface FatigueResult {
  fatigueLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100 (0 = no fatigue, 100 = maximum fatigue)
  trend: {
    slope: number; // Negative = declining engagement
    direction: 'improving' | 'stable' | 'declining' | 'critical_decline';
    confidence: number; // 0-1
    dataPoints: number;
  };
  metrics: {
    engagementDecline: number; // Percentage decline
    postFrequencyImpact: number; // 0-1
    topicSaturation: number; // 0-1
    audienceOverexposure: number; // 0-1
  };
  insights: {
    primaryCauses: string[];
    affectedPlatforms: string[];
    timeToRecovery?: string;
    riskFactors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    diversification: string[];
  };
  benchmarks: {
    industryAverage: number;
    topPerformers: number;
    recoveryExamples: string[];
  };
}

export interface BatchFatigueRequest {
  topics: Array<{
    id: string;
    topic: string;
    segmentId?: number;
    recentActivity?: {
      posts: number;
      avgEngagement: number;
      timespan: string;
    };
  }>;
  options?: {
    includeRecommendations?: boolean;
    includeBenchmarks?: boolean;
    timeframe?: '7d' | '14d' | '30d' | '90d';
  };
}

export interface BatchFatigueResult {
  results: Array<{
    id: string;
    topic: string;
    fatigue: FatigueResult;
    analyzed_at: Date;
  }>;
  summary: {
    totalAnalyzed: number;
    fatigueDistribution: {
      none: number;
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    avgFatigueScore: number;
    topicsAtRisk: Array<{
      topic: string;
      score: number;
      level: string;
    }>;
  };
  systemWideInsights: {
    overallTrend: 'healthy' | 'concerning' | 'critical';
    diversificationNeeded: boolean;
    recommendedActions: string[];
  };
}

export interface AudienceFatigueAnalysis {
  segments: Array<{
    segmentId: number;
    name: string;
    fatigueLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    engagementTrend: number;
    topFatiguedTopics: string[];
    recommendedActions: string[];
  }>;
  crossTopicImpact: {
    correlations: Array<{
      topicA: string;
      topicB: string;
      correlation: number;
      explanation: string;
    }>;
    spilloverEffects: string[];
  };
  recoveryStrategies: {
    immediate: string[];
    mediumTerm: string[];
    preventive: string[];
  };
}

export interface FatigueProviderOptions {
  mode: 'live' | 'mock';
  dataSources?: {
    internal?: boolean;
    competitors?: boolean;
    industry?: boolean;
  };
  analysisSettings?: {
    minDataPoints: number;
    confidenceThreshold: number;
    trendSensitivity: number;
  };
  alerting?: {
    enabled: boolean;
    thresholds: {
      warning: number;
      critical: number;
    };
  };
}

// ================================================================
// FATIGUE PROVIDER CLASS
// ================================================================

export class FatigueProvider {
  private options: FatigueProviderOptions;

  constructor(options: FatigueProviderOptions = { mode: 'mock' }) {
    this.options = {
      mode: options.mode || 'mock',
      dataSources: options.dataSources || {
        internal: true,
        competitors: false,
        industry: false
      },
      analysisSettings: options.analysisSettings || {
        minDataPoints: 5,
        confidenceThreshold: 0.7,
        trendSensitivity: 0.1
      },
      alerting: options.alerting || {
        enabled: true,
        thresholds: {
          warning: 60,
          critical: 80
        }
      }
    };
  }

  /**
   * Analyze fatigue for a specific topic
   */
  async analyzeFatigue(request: FatigueAnalysisRequest): Promise<FatigueResult> {
    if (this.options.mode === 'live') {
      return await this.analyzeFatigueLive(request);
    } else {
      return await this.analyzeFatigueMock(request);
    }
  }

  /**
   * Analyze fatigue for multiple topics
   */
  async analyzeBatchFatigue(request: BatchFatigueRequest): Promise<BatchFatigueResult> {
    if (this.options.mode === 'live') {
      return await this.analyzeBatchFatigueLive(request);
    } else {
      return await this.analyzeBatchFatigueMock(request);
    }
  }

  /**
   * Create fatigue signal for tracking
   */
  async createFatigueSignal(
    topic: string,
    slope: number,
    lastSeenAt: Date,
    segmentId?: number
  ): Promise<FatigueSignal> {
    const signal = await createFatigueSignal({
      topic,
      slope,
      lastSeenAt,
      segmentId
    });

    // Check if this indicates high fatigue and should trigger alerts
    if (this.options.alerting?.enabled && slope < -0.3) {
      console.warn(`[FatigueProvider] High fatigue detected for topic: ${topic}, slope: ${slope}`);
      // In live mode, this would trigger actual alerts
    }

    console.log(`[FatigueProvider] Created fatigue signal for topic: ${topic}, slope: ${slope}`);
    return signal;
  }

  /**
   * Get all topics currently experiencing fatigue
   */
  async getFatiguedTopics(limit = 20): Promise<Array<{
    topic: string;
    slope: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    lastSeen: Date;
    segmentId?: number;
  }>> {
    const negativeSignals = await getTopicsWithNegativeSlope(limit);
    
    return negativeSignals.map(signal => {
      const slope = parseFloat(signal.slope);
      let severity: 'low' | 'medium' | 'high' | 'critical';
      
      if (slope >= -0.1) severity = 'low';
      else if (slope >= -0.3) severity = 'medium';
      else if (slope >= -0.5) severity = 'high';
      else severity = 'critical';

      return {
        topic: signal.topic,
        slope,
        severity,
        lastSeen: signal.lastSeenAt,
        segmentId: signal.segmentId || undefined
      };
    });
  }

  /**
   * Analyze audience fatigue across segments
   */
  async analyzeAudienceFatigue(): Promise<AudienceFatigueAnalysis> {
    if (this.options.mode === 'live') {
      return await this.analyzeAudienceFatigueLive();
    } else {
      return await this.analyzeAudienceFatigueMock();
    }
  }

  /**
   * Get fatigue recovery predictions
   */
  async getFatigueRecoveryPrediction(
    topic: string,
    segmentId?: number
  ): Promise<{
    estimatedRecoveryTime: string;
    recoveryProbability: number;
    recommendedActions: string[];
    milestones: Array<{
      timeframe: string;
      expectedImprovement: number;
      actions: string[];
    }>;
  }> {
    if (this.options.mode === 'live') {
      return await this.getFatigueRecoveryPredictionLive(topic, segmentId);
    } else {
      return await this.getFatigueRecoveryPredictionMock(topic, segmentId);
    }
  }

  // ================================================================
  // LIVE IMPLEMENTATION
  // ================================================================

  private async analyzeFatigueLive(request: FatigueAnalysisRequest): Promise<FatigueResult> {
    console.log('[FatigueProvider] Live fatigue analysis...', { 
      topic: request.topic,
      timeframe: request.timeframe 
    });

    try {
      // Implement actual fatigue analysis here
      // This would integrate with:
      // - Internal engagement databases
      // - Social media APIs for competitor data
      // - Industry benchmark services
      // - ML models for trend prediction
      
      const mockResult = await this.analyzeFatigueMock(request);
      console.log('[FatigueProvider] Live analysis completed - Fatigue level:', mockResult.fatigueLevel);
      
      return mockResult;
      
    } catch (error) {
      console.error('[FatigueProvider] Live analysis failed:', error);
      return await this.analyzeFatigueMock(request);
    }
  }

  private async analyzeBatchFatigueLive(request: BatchFatigueRequest): Promise<BatchFatigueResult> {
    console.log('[FatigueProvider] Live batch fatigue analysis...', { count: request.topics.length });
    
    try {
      const mockResult = await this.analyzeBatchFatigueMock(request);
      console.log('[FatigueProvider] Live batch analysis completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[FatigueProvider] Live batch analysis failed:', error);
      return await this.analyzeBatchFatigueMock(request);
    }
  }

  private async analyzeAudienceFatigueLive(): Promise<AudienceFatigueAnalysis> {
    console.log('[FatigueProvider] Live audience fatigue analysis...');
    
    try {
      const mockResult = await this.analyzeAudienceFatigueMock();
      console.log('[FatigueProvider] Live audience analysis completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[FatigueProvider] Live audience analysis failed:', error);
      return await this.analyzeAudienceFatigueMock();
    }
  }

  private async getFatigueRecoveryPredictionLive(topic: string, segmentId?: number): Promise<any> {
    console.log('[FatigueProvider] Live recovery prediction...', { topic, segmentId });
    
    try {
      const mockResult = await this.getFatigueRecoveryPredictionMock(topic, segmentId);
      console.log('[FatigueProvider] Live recovery prediction completed');
      
      return mockResult;
      
    } catch (error) {
      console.error('[FatigueProvider] Live recovery prediction failed:', error);
      return await this.getFatigueRecoveryPredictionMock(topic, segmentId);
    }
  }

  // ================================================================
  // MOCK IMPLEMENTATION
  // ================================================================

  private async analyzeFatigueMock(request: FatigueAnalysisRequest): Promise<FatigueResult> {
    console.log('[FatigueProvider] Mock fatigue analysis...', { topic: request.topic });

    // Simulate analysis delay
    await this.delay(500 + Math.random() * 400);

    // Analyze content data if provided
    let engagementTrend = 0;
    let dataPoints = 0;
    
    if (request.content?.recentPosts) {
      const posts = request.content.recentPosts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      dataPoints = posts.length;
      
      if (posts.length >= 2) {
        // Calculate engagement trend (simple linear regression)
        const engagements = posts.map(p => p.engagement);
        const n = engagements.length;
        const sum_x = (n * (n - 1)) / 2; // Sum of indices
        const sum_y = engagements.reduce((sum, val) => sum + val, 0);
        const sum_xy = engagements.reduce((sum, val, i) => sum + val * i, 0);
        const sum_x2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares
        
        // Linear regression slope
        engagementTrend = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
      }
    } else {
      // Generate mock trend based on topic
      const topicFatigueFactors = this.getTopicFatigueFactors(request.topic);
      engagementTrend = topicFatigueFactors.baseTrend + (Math.random() - 0.5) * 0.4;
      dataPoints = 15 + Math.floor(Math.random() * 10);
    }

    // Calculate fatigue score (0-100)
    const baseFatigueScore = Math.max(0, Math.min(100, 
      50 + (engagementTrend * -100) // Negative trend increases fatigue
    ));

    // Add topic-specific adjustments
    const topicFactors = this.getTopicFatigueFactors(request.topic);
    const adjustedScore = Math.max(0, Math.min(100, 
      baseFatigueScore * topicFactors.fatigueMultiplier + topicFactors.seasonalAdjustment
    ));

    // Determine fatigue level
    let fatigueLevel: FatigueResult['fatigueLevel'];
    if (adjustedScore < 20) fatigueLevel = 'none';
    else if (adjustedScore < 40) fatigueLevel = 'low';
    else if (adjustedScore < 65) fatigueLevel = 'medium';
    else if (adjustedScore < 85) fatigueLevel = 'high';
    else fatigueLevel = 'critical';

    // Determine trend direction
    let direction: FatigueResult['trend']['direction'];
    if (engagementTrend > 0.1) direction = 'improving';
    else if (engagementTrend < -0.3) direction = 'critical_decline';
    else if (engagementTrend < -0.1) direction = 'declining';
    else direction = 'stable';

    // Calculate metrics
    const engagementDecline = Math.max(0, -engagementTrend * 100);
    const postFrequencyImpact = Math.min(1, Math.max(0, 
      (dataPoints / 30) * (adjustedScore / 100) // More posts + higher fatigue = higher impact
    ));
    const topicSaturation = topicFactors.saturationLevel;
    const audienceOverexposure = Math.min(1, postFrequencyImpact * topicSaturation);

    // Generate insights
    const insights = this.generateFatigueInsights(request.topic, adjustedScore, engagementTrend, topicFactors);
    
    // Generate recommendations
    const recommendations = this.generateFatigueRecommendations(fatigueLevel, insights, request.topic);

    const result: FatigueResult = {
      fatigueLevel,
      score: Math.round(adjustedScore * 100) / 100,
      trend: {
        slope: Math.round(engagementTrend * 1000) / 1000,
        direction,
        confidence: Math.min(1, Math.max(0.3, dataPoints / 20)),
        dataPoints
      },
      metrics: {
        engagementDecline: Math.round(engagementDecline * 100) / 100,
        postFrequencyImpact: Math.round(postFrequencyImpact * 100) / 100,
        topicSaturation: Math.round(topicSaturation * 100) / 100,
        audienceOverexposure: Math.round(audienceOverexposure * 100) / 100
      },
      insights,
      recommendations,
      benchmarks: {
        industryAverage: 35 + Math.random() * 20,
        topPerformers: 15 + Math.random() * 10,
        recoveryExamples: [
          'Brand X recovered in 2 weeks by diversifying content mix',
          'Company Y reduced fatigue 40% with timing optimization',
          'Creator Z increased engagement by switching platforms'
        ]
      }
    };

    console.log(`[FatigueProvider] Mock analysis completed - ${request.topic}: ${result.fatigueLevel} (${result.score})`);
    return result;
  }

  private async analyzeBatchFatigueMock(request: BatchFatigueRequest): Promise<BatchFatigueResult> {
    console.log('[FatigueProvider] Mock batch fatigue analysis...', { count: request.topics.length });

    await this.delay(600 + Math.random() * 400);

    const results = [];
    const scores = [];

    for (const item of request.topics) {
      const fatigueRequest: FatigueAnalysisRequest = {
        topic: item.topic,
        timeframe: request.options?.timeframe || '30d',
        segmentId: item.segmentId
      };

      const fatigue = await this.analyzeFatigueMock(fatigueRequest);

      results.push({
        id: item.id,
        topic: item.topic,
        fatigue,
        analyzed_at: new Date()
      });

      scores.push(fatigue.score);
    }

    // Calculate distribution
    const distribution = results.reduce((acc, result) => {
      acc[result.fatigue.fatigueLevel]++;
      return acc;
    }, {
      none: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    });

    // Find topics at risk
    const topicsAtRisk = results
      .filter(result => result.fatigue.score >= 40)
      .sort((a, b) => b.fatigue.score - a.fatigue.score)
      .slice(0, 5)
      .map(result => ({
        topic: result.topic,
        score: result.fatigue.score,
        level: result.fatigue.fatigueLevel
      }));

    const avgFatigueScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Determine overall system health
    let overallTrend: 'healthy' | 'concerning' | 'critical';
    const highFatigueCount = distribution.high + distribution.critical;
    const totalCount = results.length;
    const highFatigueRatio = highFatigueCount / totalCount;

    if (highFatigueRatio > 0.3) overallTrend = 'critical';
    else if (highFatigueRatio > 0.15 || avgFatigueScore > 50) overallTrend = 'concerning';
    else overallTrend = 'healthy';

    const batchResult: BatchFatigueResult = {
      results,
      summary: {
        totalAnalyzed: results.length,
        fatigueDistribution: distribution,
        avgFatigueScore: Math.round(avgFatigueScore * 100) / 100,
        topicsAtRisk
      },
      systemWideInsights: {
        overallTrend,
        diversificationNeeded: highFatigueRatio > 0.2,
        recommendedActions: [
          overallTrend === 'critical' ? 'Immediate content diversification required' : '',
          topicsAtRisk.length > 3 ? 'Reduce posting frequency on saturated topics' : '',
          avgFatigueScore > 60 ? 'Consider platform rotation strategy' : '',
          'Monitor engagement trends weekly'
        ].filter(Boolean)
      }
    };

    console.log(`[FatigueProvider] Mock batch analysis completed - Overall trend: ${overallTrend}`);
    return batchResult;
  }

  private async analyzeAudienceFatigueMock(): Promise<AudienceFatigueAnalysis> {
    console.log('[FatigueProvider] Mock audience fatigue analysis...');

    await this.delay(800 + Math.random() * 400);

    // Generate mock segment data
    const segments = [
      {
        segmentId: 1,
        name: 'Core Followers',
        fatigueLevel: 'low' as const,
        engagementTrend: 0.05,
        topFatiguedTopics: ['cooking tips', 'meal prep'],
        recommendedActions: ['Diversify content mix', 'Introduce new formats']
      },
      {
        segmentId: 2,
        name: 'Casual Viewers',
        fatigueLevel: 'medium' as const,
        engagementTrend: -0.12,
        topFatiguedTopics: ['quick recipes', 'kitchen hacks'],
        recommendedActions: ['Reduce posting frequency', 'Focus on quality over quantity']
      },
      {
        segmentId: 3,
        name: 'New Subscribers',
        fatigueLevel: 'none' as const,
        engagementTrend: 0.18,
        topFatiguedTopics: [],
        recommendedActions: ['Maintain current strategy', 'Introduce to best content']
      }
    ];

    const analysis: AudienceFatigueAnalysis = {
      segments,
      crossTopicImpact: {
        correlations: [
          {
            topicA: 'cooking tips',
            topicB: 'kitchen hacks',
            correlation: 0.73,
            explanation: 'Audiences often interested in both practical cooking content'
          },
          {
            topicA: 'meal prep',
            topicB: 'quick recipes',
            correlation: 0.65,
            explanation: 'Time-saving cooking approaches appeal to similar demographics'
          }
        ],
        spilloverEffects: [
          'Fatigue in cooking tips reduces engagement with kitchen hacks',
          'High meal prep saturation affects quick recipe performance',
          'New format introductions can revitalize related topics'
        ]
      },
      recoveryStrategies: {
        immediate: [
          'Pause high-fatigue topics for 1-2 weeks',
          'Increase content variety by 40%',
          'Introduce interactive content formats'
        ],
        mediumTerm: [
          'Develop new content pillars',
          'Implement audience rotation strategy',
          'Create seasonal content calendar'
        ],
        preventive: [
          'Monitor fatigue metrics weekly',
          'Maintain topic diversity baseline',
          'Set engagement decline alerts'
        ]
      }
    };

    console.log('[FatigueProvider] Mock audience analysis completed');
    return analysis;
  }

  private async getFatigueRecoveryPredictionMock(topic: string, segmentId?: number): Promise<any> {
    console.log('[FatigueProvider] Mock recovery prediction...', { topic, segmentId });

    await this.delay(400 + Math.random() * 300);

    const topicFactors = this.getTopicFatigueFactors(topic);
    const baseRecoveryTime = topicFactors.recoveryTimeWeeks;
    
    const prediction = {
      estimatedRecoveryTime: `${baseRecoveryTime}-${baseRecoveryTime + 2} weeks`,
      recoveryProbability: 0.7 + Math.random() * 0.25,
      recommendedActions: [
        'Pause posting on this topic for 1-2 weeks',
        'Diversify into related but distinct topics',
        'Introduce new content formats when resuming',
        'Monitor engagement closely during recovery'
      ],
      milestones: [
        {
          timeframe: '1 week',
          expectedImprovement: 15,
          actions: ['Complete content pause', 'Analyze competitor strategies']
        },
        {
          timeframe: '2-3 weeks',
          expectedImprovement: 35,
          actions: ['Introduce refreshed content angle', 'Test new posting times']
        },
        {
          timeframe: '4-6 weeks',
          expectedImprovement: 60,
          actions: ['Resume normal posting frequency', 'Evaluate long-term strategy']
        }
      ]
    };

    console.log(`[FatigueProvider] Mock recovery prediction completed - ${prediction.estimatedRecoveryTime}`);
    return prediction;
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private getTopicFatigueFactors(topic: string): {
    baseTrend: number;
    fatigueMultiplier: number;
    seasonalAdjustment: number;
    saturationLevel: number;
    recoveryTimeWeeks: number;
  } {
    const topicLower = topic.toLowerCase();
    
    // Default factors
    let factors = {
      baseTrend: -0.05, // Slight negative trend
      fatigueMultiplier: 1.0,
      seasonalAdjustment: 0,
      saturationLevel: 0.4,
      recoveryTimeWeeks: 3
    };

    // Topic-specific adjustments
    if (topicLower.includes('cooking') || topicLower.includes('recipe')) {
      factors.baseTrend = -0.02; // Cooking content has more staying power
      factors.fatigueMultiplier = 0.8;
      factors.saturationLevel = 0.5;
      factors.recoveryTimeWeeks = 2;
    }

    if (topicLower.includes('trending') || topicLower.includes('viral')) {
      factors.baseTrend = -0.15; // Trending content fatigues faster
      factors.fatigueMultiplier = 1.3;
      factors.saturationLevel = 0.7;
      factors.recoveryTimeWeeks = 4;
    }

    if (topicLower.includes('tutorial') || topicLower.includes('how to')) {
      factors.baseTrend = 0.02; // Educational content is more evergreen
      factors.fatigueMultiplier = 0.7;
      factors.saturationLevel = 0.3;
      factors.recoveryTimeWeeks = 2;
    }

    if (topicLower.includes('meme') || topicLower.includes('funny')) {
      factors.baseTrend = -0.12; // Humor content fatigues quickly
      factors.fatigueMultiplier = 1.4;
      factors.saturationLevel = 0.8;
      factors.recoveryTimeWeeks = 5;
    }

    return factors;
  }

  private generateFatigueInsights(
    topic: string,
    score: number,
    trend: number,
    factors: any
  ): FatigueResult['insights'] {
    const primaryCauses = [];
    const affectedPlatforms = [];
    const riskFactors = [];

    if (trend < -0.1) {
      primaryCauses.push('Declining engagement trend');
    }

    if (factors.saturationLevel > 0.6) {
      primaryCauses.push('Topic oversaturation in market');
    }

    if (score > 60) {
      primaryCauses.push('High posting frequency on same topic');
    }

    // Mock platform impact
    if (score > 50) {
      affectedPlatforms.push('TikTok', 'Instagram');
      if (score > 70) {
        affectedPlatforms.push('YouTube');
      }
    }

    // Risk factors
    if (trend < -0.2) {
      riskFactors.push('Rapidly declining engagement');
    }
    if (factors.saturationLevel > 0.7) {
      riskFactors.push('Market oversaturation');
    }
    if (score > 80) {
      riskFactors.push('Critical audience fatigue level');
    }

    return {
      primaryCauses,
      affectedPlatforms,
      timeToRecovery: score > 70 ? '4-6 weeks' : score > 40 ? '2-3 weeks' : undefined,
      riskFactors
    };
  }

  private generateFatigueRecommendations(
    fatigueLevel: FatigueResult['fatigueLevel'],
    insights: FatigueResult['insights'],
    topic: string
  ): FatigueResult['recommendations'] {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];
    const diversification = [];

    switch (fatigueLevel) {
      case 'critical':
        immediate.push('Stop posting on this topic immediately');
        immediate.push('Analyze what went wrong');
        shortTerm.push('Develop completely new content angle');
        break;
      
      case 'high':
        immediate.push('Reduce posting frequency by 60%');
        immediate.push('Introduce variety in related topics');
        shortTerm.push('Test new content formats');
        break;
      
      case 'medium':
        immediate.push('Reduce posting frequency by 30%');
        shortTerm.push('Experiment with different approaches');
        break;
      
      case 'low':
        shortTerm.push('Monitor engagement closely');
        longTerm.push('Develop preventive content strategy');
        break;
      
      default:
        longTerm.push('Maintain current healthy approach');
    }

    // Common diversification strategies
    diversification.push('Explore adjacent topics');
    diversification.push('Try different content formats');
    diversification.push('Experiment with posting times');
    diversification.push('Consider platform rotation');

    return { immediate, shortTerm, longTerm, diversification };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider status and configuration
   */
  getStatus(): {
    mode: 'live' | 'mock';
    dataSources: any;
    analysisSettings: any;
    alertingEnabled: boolean;
  } {
    return {
      mode: this.options.mode,
      dataSources: this.options.dataSources!,
      analysisSettings: this.options.analysisSettings!,
      alertingEnabled: this.options.alerting?.enabled || false
    };
  }

  /**
   * Update provider configuration
   */
  updateConfig(updates: Partial<FatigueProviderOptions>): void {
    this.options = { ...this.options, ...updates };
  }
}

// ================================================================
// FACTORY & EXPORTS
// ================================================================

/**
 * Create fatigue provider instance based on environment
 */
export function createFatigueProvider(): FatigueProvider {
  const isLiveMode = process.env.NODE_ENV === 'production';
  
  return new FatigueProvider({
    mode: isLiveMode ? 'live' : 'mock',
    dataSources: {
      internal: true,
      competitors: !!process.env.COMPETITOR_API_KEY,
      industry: !!process.env.INDUSTRY_DATA_API_KEY
    }
  });
}