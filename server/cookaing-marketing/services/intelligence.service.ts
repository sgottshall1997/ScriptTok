/**
 * Intelligence Service
 * Phase 3: High-level orchestration service that coordinates all intelligence providers
 */

import { createCompetitorProvider, type CompetitorProvider } from '../providers/competitor.provider';
import { createSentimentProvider, type SentimentProvider } from '../providers/sentiment.provider';
import { createViralProvider, type ViralProvider } from '../providers/viral.provider';
import { createFatigueProvider, type FatigueProvider } from '../providers/fatigue.provider';
import { getIntelligenceSummary, logIntelligenceEvent } from '../db/storage.intelligence';

// ================================================================
// TYPES & INTERFACES
// ================================================================

export interface IntelligenceConfig {
  caching?: {
    enabled: boolean;
    ttlMinutes: number;
  };
  rateLimiting?: {
    enabled: boolean;
    requestsPerMinute: number;
  };
  providers?: {
    competitor?: { enabled: boolean; priority: number };
    sentiment?: { enabled: boolean; priority: number };
    viral?: { enabled: boolean; priority: number };
    fatigue?: { enabled: boolean; priority: number };
  };
}

export interface ContentIntelligenceRequest {
  content: {
    text: string;
    platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'facebook';
    mediaType: 'text' | 'image' | 'video' | 'carousel';
    hashtags?: string[];
    niche?: string;
  };
  context?: {
    authorFollowers?: number;
    campaignId?: number;
    segmentId?: number;
    previousContent?: Array<{
      text: string;
      engagement: number;
      timestamp: Date;
      platform: string;
    }>;
  };
  options?: {
    includeCompetitorAnalysis?: boolean;
    includeSentimentAnalysis?: boolean;
    includeViralPrediction?: boolean;
    includeFatigueDetection?: boolean;
    generateRecommendations?: boolean;
  };
}

export interface ContentIntelligenceResult {
  overallScore: number; // 0-100 combined intelligence score
  recommendation: 'publish' | 'optimize' | 'rethink' | 'postpone';
  
  competitor?: {
    similarContent: Array<{
      text: string;
      author: string;
      platform: string;
      engagement: number;
      url: string;
    }>;
    benchmarks: {
      avgEngagement: number;
      topPerformers: number;
      competitiveGap: number;
    };
    insights: string[];
  };
  
  sentiment?: {
    score: number;
    label: string;
    confidence: number;
    emotions?: Record<string, number>;
    recommendations: string[];
  };
  
  viral?: {
    score: number;
    category: string;
    estimatedReach: {
      views: { min: number; max: number; expected: number };
      engagement: { min: number; max: number; expected: number };
    };
    factors: {
      positive: Array<{ factor: string; impact: number }>;
      negative: Array<{ factor: string; impact: number }>;
    };
    optimizations: string[];
  };
  
  fatigue?: {
    level: string;
    score: number;
    trend: string;
    recommendations: string[];
    timeToRecovery?: string;
  };
  
  insights: {
    keyStrengths: string[];
    majorConcerns: string[];
    quickWins: string[];
    strategicRecommendations: string[];
  };
  
  metadata: {
    analysisTime: number;
    providersUsed: string[];
    cacheHit: boolean;
    confidence: number;
  };
}

export interface CampaignIntelligenceRequest {
  campaignId: number;
  timeframe: '7d' | '14d' | '30d' | '90d';
  includeCompetitors?: boolean;
  includeAudienceAnalysis?: boolean;
}

export interface CampaignIntelligenceResult {
  campaignHealth: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    score: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  
  performance: {
    sentiment: {
      current: number;
      change: number;
      trend: Array<{ date: Date; score: number }>;
    };
    engagement: {
      current: number;
      change: number;
      fatigue: { level: string; affectedTopics: string[] };
    };
    viral: {
      topContent: Array<{ text: string; score: number; platform: string }>;
      avgScore: number;
      distribution: Record<string, number>;
    };
  };
  
  competitive: {
    position: 'leading' | 'competitive' | 'lagging';
    gaps: string[];
    opportunities: string[];
    threats: string[];
  };
  
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    priority: 'high' | 'medium' | 'low';
  };
  
  forecast: {
    nextWeek: {
      sentiment: { prediction: number; confidence: number };
      engagement: { prediction: number; confidence: number };
      fatigue: { level: string; topics: string[] };
    };
    nextMonth: {
      viralOpportunities: string[];
      riskFactors: string[];
      strategicActions: string[];
    };
  };
}

export interface TrendIntelligenceRequest {
  niche?: string;
  platforms?: string[];
  timeframe?: '24h' | '7d' | '30d';
}

export interface TrendIntelligenceResult {
  trending: {
    topics: Array<{
      topic: string;
      momentum: number;
      saturation: number;
      viralPotential: number;
      platforms: string[];
    }>;
    hashtags: Array<{
      tag: string;
      usage: number;
      growth: number;
      effectiveness: number;
    }>;
    formats: Array<{
      format: string;
      platform: string;
      engagement: number;
      examples: string[];
    }>;
  };
  
  opportunities: {
    underutilized: string[];
    emerging: string[];
    crossPlatform: string[];
  };
  
  risks: {
    saturated: string[];
    declining: string[];
    fatigue: string[];
  };
  
  recommendations: {
    contentPillars: string[];
    timingStrategy: string[];
    platformFocus: string[];
    avoidance: string[];
  };
}

// ================================================================
// INTELLIGENCE SERVICE CLASS
// ================================================================

export class IntelligenceService {
  private config: IntelligenceConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  // Provider instances
  private competitorProvider: CompetitorProvider;
  private sentimentProvider: SentimentProvider;
  private viralProvider: ViralProvider;
  private fatigueProvider: FatigueProvider;

  constructor(config: IntelligenceConfig = {}) {
    this.config = {
      caching: { enabled: true, ttlMinutes: 30, ...config.caching },
      rateLimiting: { enabled: true, requestsPerMinute: 100, ...config.rateLimiting },
      providers: {
        competitor: { enabled: true, priority: 1 },
        sentiment: { enabled: true, priority: 2 },
        viral: { enabled: true, priority: 3 },
        fatigue: { enabled: true, priority: 4 },
        ...config.providers
      }
    };

    // Initialize providers
    this.competitorProvider = createCompetitorProvider();
    this.sentimentProvider = createSentimentProvider();
    this.viralProvider = createViralProvider();
    this.fatigueProvider = createFatigueProvider();

    console.log('[IntelligenceService] Initialized with config:', this.config);
  }

  /**
   * Comprehensive content intelligence analysis
   */
  async analyzeContent(request: ContentIntelligenceRequest): Promise<ContentIntelligenceResult> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey('content', request);
    
    // Check cache
    if (this.config.caching?.enabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { ...cached, metadata: { ...cached.metadata, cacheHit: true } };
      }
    }

    console.log('[IntelligenceService] Analyzing content:', {
      platform: request.content.platform,
      textLength: request.content.text.length,
      options: request.options
    });

    const providersUsed: string[] = [];
    const results: Partial<ContentIntelligenceResult> = {
      metadata: { cacheHit: false, providersUsed: [], analysisTime: 0, confidence: 0 }
    };

    // Run analyses in parallel based on options
    const analyses = [];

    if (request.options?.includeCompetitorAnalysis !== false) {
      analyses.push(
        this.analyzeCompetitorContext(request).then(result => {
          results.competitor = result;
          providersUsed.push('competitor');
        }).catch(error => {
          console.warn('[IntelligenceService] Competitor analysis failed:', error);
        })
      );
    }

    if (request.options?.includeSentimentAnalysis !== false) {
      analyses.push(
        this.analyzeSentimentContext(request).then(result => {
          results.sentiment = result;
          providersUsed.push('sentiment');
        }).catch(error => {
          console.warn('[IntelligenceService] Sentiment analysis failed:', error);
        })
      );
    }

    if (request.options?.includeViralPrediction !== false) {
      analyses.push(
        this.analyzeViralContext(request).then(result => {
          results.viral = result;
          providersUsed.push('viral');
        }).catch(error => {
          console.warn('[IntelligenceService] Viral prediction failed:', error);
        })
      );
    }

    if (request.options?.includeFatigueDetection !== false) {
      analyses.push(
        this.analyzeFatigueContext(request).then(result => {
          results.fatigue = result;
          providersUsed.push('fatigue');
        }).catch(error => {
          console.warn('[IntelligenceService] Fatigue detection failed:', error);
        })
      );
    }

    // Wait for all analyses to complete
    await Promise.all(analyses);

    // Calculate overall score and recommendation
    const overallScore = this.calculateOverallScore(results);
    const recommendation = this.generateRecommendation(overallScore, results);
    const insights = this.generateInsights(results);
    const confidence = this.calculateConfidence(results, providersUsed);

    const finalResult: ContentIntelligenceResult = {
      overallScore,
      recommendation,
      ...results,
      insights,
      metadata: {
        analysisTime: Date.now() - startTime,
        providersUsed,
        cacheHit: false,
        confidence
      }
    } as ContentIntelligenceResult;

    // Cache result
    if (this.config.caching?.enabled) {
      this.setCache(cacheKey, finalResult);
    }

    // Log analytics event
    if (request.context?.campaignId) {
      await logIntelligenceEvent(
        1, // orgId - would be dynamic in real implementation
        'sentiment_snapshot',
        'campaign',
        request.context.campaignId,
        { providersUsed, overallScore, recommendation }
      );
    }

    console.log(`[IntelligenceService] Content analysis completed - Score: ${overallScore}, Recommendation: ${recommendation}`);
    return finalResult;
  }

  /**
   * Campaign-level intelligence analysis
   */
  async analyzeCampaign(request: CampaignIntelligenceRequest): Promise<CampaignIntelligenceResult> {
    const startTime = Date.now();
    console.log('[IntelligenceService] Analyzing campaign:', request.campaignId);

    // Get campaign intelligence summary
    const summary = await getIntelligenceSummary(
      request.timeframe === '7d' ? 7 : 
      request.timeframe === '14d' ? 14 :
      request.timeframe === '30d' ? 30 : 90
    );

    // Mock campaign analysis - in real implementation would fetch actual campaign data
    const campaignHealth = this.assessCampaignHealth(summary);
    const performance = this.analyzePerformanceMetrics(summary);
    const competitive = await this.analyzeCompetitivePosition(request);
    const recommendations = this.generateCampaignRecommendations(campaignHealth, performance, competitive);
    const forecast = this.generateForecast(performance, competitive);

    const result: CampaignIntelligenceResult = {
      campaignHealth,
      performance,
      competitive,
      recommendations,
      forecast
    };

    console.log(`[IntelligenceService] Campaign analysis completed - Health: ${campaignHealth.overall}`);
    return result;
  }

  /**
   * Trend intelligence analysis
   */
  async analyzeTrends(request: TrendIntelligenceRequest = {}): Promise<TrendIntelligenceResult> {
    console.log('[IntelligenceService] Analyzing trends:', request);

    // Get trending factors from viral provider
    const trendingFactors = await this.viralProvider.getTrendingFactors(
      request.platforms?.[0],
      request.niche
    );

    // Get fatigued topics
    const fatiguedTopics = await this.fatigueProvider.getFatiguedTopics(10);

    // Transform to trend intelligence format
    const trending = {
      topics: trendingFactors.currentTrends.map(trend => ({
        topic: trend.trend,
        momentum: trend.momentum,
        saturation: trend.saturation,
        viralPotential: trend.momentum * (1 - trend.saturation),
        platforms: trend.platforms
      })),
      hashtags: trendingFactors.hashtags.map(hashtag => ({
        tag: hashtag.tag,
        usage: hashtag.usage,
        growth: hashtag.growth,
        effectiveness: hashtag.viralPotential
      })),
      formats: trendingFactors.topics.map(topic => ({
        format: topic.topic,
        platform: 'multi',
        engagement: topic.score * 100,
        examples: topic.examples
      }))
    };

    const opportunities = {
      underutilized: trending.topics
        .filter(t => t.momentum > 0.7 && t.saturation < 0.4)
        .map(t => t.topic)
        .slice(0, 5),
      emerging: trending.topics
        .filter(t => t.momentum > 0.8 && t.saturation < 0.3)
        .map(t => t.topic)
        .slice(0, 3),
      crossPlatform: trending.topics
        .filter(t => t.platforms.length >= 3)
        .map(t => t.topic)
        .slice(0, 4)
    };

    const risks = {
      saturated: trending.topics
        .filter(t => t.saturation > 0.7)
        .map(t => t.topic)
        .slice(0, 5),
      declining: trending.topics
        .filter(t => t.momentum < 0.3)
        .map(t => t.topic)
        .slice(0, 3),
      fatigue: fatiguedTopics
        .filter(f => f.severity === 'high' || f.severity === 'critical')
        .map(f => f.topic)
        .slice(0, 4)
    };

    const recommendations = {
      contentPillars: opportunities.underutilized.slice(0, 3),
      timingStrategy: trendingFactors.timing.seasonalFactors,
      platformFocus: Array.from(new Set(opportunities.crossPlatform.flatMap(topic => 
        trending.topics.find(t => t.topic === topic)?.platforms || []
      ))).slice(0, 3),
      avoidance: [...risks.saturated, ...risks.fatigue].slice(0, 5)
    };

    const result: TrendIntelligenceResult = {
      trending,
      opportunities,
      risks,
      recommendations
    };

    console.log('[IntelligenceService] Trend analysis completed');
    return result;
  }

  /**
   * Get intelligence dashboard summary
   */
  async getDashboardSummary(): Promise<{
    competitorPostsScanned: number;
    sentimentSnapshots: number;
    viralScoresComputed: number;
    topicsWithFatigue: number;
    avgSentimentScore: number;
    avgViralScore: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
    lastUpdate: Date;
  }> {
    const summary = await getIntelligenceSummary();
    
    const systemHealth = 
      summary.topicsWithFatigue > 5 ? 'critical' :
      summary.avgSentimentScore < 0.3 || summary.topicsWithFatigue > 2 ? 'warning' :
      'healthy';

    return {
      ...summary,
      systemHealth,
      lastUpdate: new Date()
    };
  }

  // ================================================================
  // PRIVATE ANALYSIS METHODS
  // ================================================================

  private async analyzeCompetitorContext(request: ContentIntelligenceRequest) {
    const competitorRequest = {
      keywords: this.extractKeywords(request.content.text),
      platforms: [request.content.platform] as any,
      timeframe: '7d' as const,
      limit: 10,
      niche: request.content.niche
    };

    const analysis = await this.competitorProvider.scanCompetitors(competitorRequest);

    return {
      similarContent: analysis.posts.slice(0, 5).map(post => ({
        text: post.text || '',
        author: post.author,
        platform: post.sourcePlatform,
        engagement: (post.metricsJson as any)?.engagement_rate || 0,
        url: post.url
      })),
      benchmarks: {
        avgEngagement: analysis.summary.avgEngagement,
        topPerformers: Math.max(...analysis.posts.map(p => (p.metricsJson as any)?.engagement_rate || 0)),
        competitiveGap: 0 // Would be calculated based on user's historical performance
      },
      insights: analysis.suggestions.opportunityGaps.slice(0, 3)
    };
  }

  private async analyzeSentimentContext(request: ContentIntelligenceRequest) {
    const sentiment = await this.sentimentProvider.analyzeSentiment({
      text: request.content.text,
      context: 'post',
      includeEmotions: true
    });

    return {
      score: sentiment.score,
      label: sentiment.label,
      confidence: sentiment.confidence,
      emotions: sentiment.emotions,
      recommendations: [
        sentiment.score < 0 ? 'Consider more positive language' : 'Maintain positive tone',
        sentiment.magnitude < 0.5 ? 'Add more emotional impact' : 'Good emotional engagement',
        'Test with focus groups for validation'
      ].slice(0, 2)
    };
  }

  private async analyzeViralContext(request: ContentIntelligenceRequest) {
    const viral = await this.viralProvider.predictViral({
      content: request.content,
      context: {
        authorFollowers: request.context?.authorFollowers,
        niche: request.content.niche
      },
      options: { includeRecommendations: true }
    });

    return {
      score: viral.score,
      category: viral.category,
      estimatedReach: viral.estimatedReach,
      factors: {
        positive: viral.factors.positive,
        negative: viral.factors.negative
      },
      optimizations: viral.recommendations.optimizations.slice(0, 3)
    };
  }

  private async analyzeFatigueContext(request: ContentIntelligenceRequest) {
    const keywords = this.extractKeywords(request.content.text);
    const primaryTopic = keywords[0] || 'general';

    const fatigue = await this.fatigueProvider.analyzeFatigue({
      topic: primaryTopic,
      timeframe: '30d',
      segmentId: request.context?.segmentId,
      content: {
        recentPosts: request.context?.previousContent || []
      }
    });

    return {
      level: fatigue.fatigueLevel,
      score: fatigue.score,
      trend: fatigue.trend.direction,
      recommendations: fatigue.recommendations.immediate.slice(0, 2),
      timeToRecovery: fatigue.insights.timeToRecovery
    };
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private calculateOverallScore(results: Partial<ContentIntelligenceResult>): number {
    let totalScore = 0;
    let weights = 0;

    if (results.sentiment?.score !== undefined) {
      totalScore += (results.sentiment.score + 1) * 50 * 0.25; // Convert -1,1 to 0,100
      weights += 0.25;
    }

    if (results.viral?.score !== undefined) {
      totalScore += results.viral.score * 0.35;
      weights += 0.35;
    }

    if (results.competitor?.benchmarks) {
      const competitiveScore = Math.min(100, results.competitor.benchmarks.avgEngagement * 10);
      totalScore += competitiveScore * 0.2;
      weights += 0.2;
    }

    if (results.fatigue?.score !== undefined) {
      const fatigueScore = Math.max(0, 100 - results.fatigue.score);
      totalScore += fatigueScore * 0.2;
      weights += 0.2;
    }

    return weights > 0 ? Math.round(totalScore / weights) : 50;
  }

  private generateRecommendation(
    score: number,
    results: Partial<ContentIntelligenceResult>
  ): 'publish' | 'optimize' | 'rethink' | 'postpone' {
    if (results.fatigue?.level === 'critical' || results.fatigue?.level === 'high') {
      return 'postpone';
    }

    if (score >= 75) return 'publish';
    if (score >= 50) return 'optimize';
    if (score >= 25) return 'rethink';
    return 'postpone';
  }

  private generateInsights(results: Partial<ContentIntelligenceResult>) {
    const keyStrengths = [];
    const majorConcerns = [];
    const quickWins = [];
    const strategicRecommendations = [];

    if (results.sentiment?.score !== undefined && results.sentiment.score > 0.5) {
      keyStrengths.push('Strong positive sentiment');
    } else if (results.sentiment?.score !== undefined && results.sentiment.score < -0.2) {
      majorConcerns.push('Negative sentiment detected');
    }

    if (results.viral?.score !== undefined && results.viral.score > 70) {
      keyStrengths.push('High viral potential');
    } else if (results.viral?.score !== undefined && results.viral.score < 30) {
      quickWins.push('Improve content format for platform');
    }

    if (results.fatigue?.level === 'none' || results.fatigue?.level === 'low') {
      keyStrengths.push('No audience fatigue detected');
    } else {
      strategicRecommendations.push('Address audience fatigue with content diversification');
    }

    if (results.competitor?.benchmarks && results.competitor.benchmarks.competitiveGap > 0) {
      strategicRecommendations.push('Leverage competitive advantages');
    }

    return {
      keyStrengths: keyStrengths.slice(0, 3),
      majorConcerns: majorConcerns.slice(0, 2),
      quickWins: quickWins.slice(0, 3),
      strategicRecommendations: strategicRecommendations.slice(0, 3)
    };
  }

  private calculateConfidence(results: Partial<ContentIntelligenceResult>, providersUsed: string[]): number {
    let confidence = 0.5; // Base confidence

    // More providers = higher confidence
    confidence += providersUsed.length * 0.1;

    // Factor in individual provider confidence
    if (results.sentiment?.confidence) {
      confidence += results.sentiment.confidence * 0.2;
    }

    if (results.viral) {
      confidence += 0.15; // Viral provider has good mock confidence
    }

    return Math.min(1, Math.round(confidence * 100) / 100);
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - in real implementation would use NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const stopWords = ['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want'];
    
    return words
      .filter(word => !stopWords.includes(word))
      .slice(0, 5);
  }

  private assessCampaignHealth(summary: any) {
    const score = (summary.avgSentimentScore + 1) * 50 + // Convert sentiment to 0-100
                  Math.min(100, summary.avgViralScore) -
                  summary.topicsWithFatigue * 10; // Penalty for fatigue

    let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 85) overall = 'excellent';
    else if (score >= 70) overall = 'good';
    else if (score >= 50) overall = 'fair';
    else if (score >= 30) overall = 'poor';
    else overall = 'critical';

    return {
      overall,
      score: Math.round(score),
      trend: summary.avgSentimentScore > 0.2 ? 'improving' as const : 
             summary.avgSentimentScore < -0.2 ? 'declining' as const : 'stable' as const
    };
  }

  private analyzePerformanceMetrics(summary: any) {
    return {
      sentiment: {
        current: summary.avgSentimentScore,
        change: Math.random() * 0.4 - 0.2, // Mock change
        trend: Array(7).fill(null).map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          score: summary.avgSentimentScore + (Math.random() - 0.5) * 0.3
        }))
      },
      engagement: {
        current: 75 + Math.random() * 20,
        change: Math.random() * 20 - 10,
        fatigue: {
          level: summary.topicsWithFatigue > 3 ? 'high' : summary.topicsWithFatigue > 1 ? 'medium' : 'low',
          affectedTopics: ['cooking', 'lifestyle'].slice(0, summary.topicsWithFatigue)
        }
      },
      viral: {
        topContent: [
          { text: 'Amazing cooking hack!', score: 85, platform: 'tiktok' },
          { text: 'Quick recipe tutorial', score: 78, platform: 'instagram' }
        ],
        avgScore: summary.avgViralScore,
        distribution: { low: 20, medium: 50, high: 25, viral: 5 }
      }
    };
  }

  private async analyzeCompetitivePosition(request: CampaignIntelligenceRequest) {
    // Mock competitive analysis
    return {
      position: 'competitive' as const,
      gaps: ['Posting frequency', 'Video content ratio'],
      opportunities: ['Trending hashtags', 'Platform diversification'],
      threats: ['New competitors', 'Algorithm changes']
    };
  }

  private generateCampaignRecommendations(campaignHealth: any, performance: any, competitive: any) {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[]
    };

    if (campaignHealth.overall === 'poor' || campaignHealth.overall === 'critical') {
      recommendations.immediate.push('Pause low-performing content themes');
      recommendations.immediate.push('Focus on audience re-engagement');
    }

    if (performance.engagement.fatigue.level === 'high') {
      recommendations.shortTerm.push('Diversify content mix by 40%');
      recommendations.shortTerm.push('Test new content formats');
    }

    recommendations.longTerm.push('Develop sustainable content strategy');
    recommendations.longTerm.push('Build audience segmentation framework');

    return {
      ...recommendations,
      priority: campaignHealth.score < 50 ? 'high' as const : 
                campaignHealth.score < 70 ? 'medium' as const : 'low' as const
    };
  }

  private generateForecast(performance: any, competitive: any) {
    return {
      nextWeek: {
        sentiment: {
          prediction: performance.sentiment.current + Math.random() * 0.2 - 0.1,
          confidence: 0.75
        },
        engagement: {
          prediction: performance.engagement.current + Math.random() * 10 - 5,
          confidence: 0.7
        },
        fatigue: {
          level: performance.engagement.fatigue.level,
          topics: performance.engagement.fatigue.affectedTopics
        }
      },
      nextMonth: {
        viralOpportunities: ['Short-form tutorials', 'Behind-the-scenes content'],
        riskFactors: ['Seasonal engagement decline', 'Increased competition'],
        strategicActions: ['Platform diversification', 'Content format innovation']
      }
    };
  }

  private getCacheKey(type: string, request: any): string {
    return `${type}_${JSON.stringify(request)}`;
  }

  private getFromCache(key: string): any | null {
    if (!this.config.caching?.enabled) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    const ttl = (this.config.caching.ttlMinutes || 30) * 60 * 1000;
    
    if (age > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    if (!this.config.caching?.enabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get service status and health
   */
  getStatus() {
    return {
      config: this.config,
      cache: {
        size: this.cache.size,
        enabled: this.config.caching?.enabled
      },
      providers: {
        competitor: this.competitorProvider.getStatus(),
        sentiment: this.sentimentProvider.getStatus(),
        viral: this.viralProvider.getStatus(),
        fatigue: this.fatigueProvider.getStatus()
      }
    };
  }
}

// ================================================================
// FACTORY & EXPORTS
// ================================================================

/**
 * Create intelligence service instance with default configuration
 */
export function createIntelligenceService(config?: IntelligenceConfig): IntelligenceService {
  return new IntelligenceService(config);
}

// Export singleton instance for convenience
export const intelligenceService = createIntelligenceService();