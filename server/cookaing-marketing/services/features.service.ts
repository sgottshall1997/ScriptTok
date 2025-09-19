/**
 * Features Service  
 * Phase 3: Feature extraction and engineering service for intelligence analysis
 */

// ================================================================
// TYPES & INTERFACES
// ================================================================

export interface TextFeatures {
  // Basic metrics
  length: number;
  wordCount: number;
  avgWordLength: number;
  sentenceCount: number;
  avgSentenceLength: number;
  
  // Complexity metrics
  readabilityScore: number; // 0-100 (higher = more readable)
  complexity: number; // 0-1 (based on word length, sentence structure)
  
  // Content analysis
  emotionalIntensity: number; // 0-1
  emotionalPolarity: number; // -1 to 1 (negative to positive)
  urgencyScore: number; // 0-1
  actionabilityScore: number; // 0-1
  
  // Structural features
  questionCount: number;
  exclamationCount: number;
  hashtagCount: number;
  mentionCount: number;
  emojiCount: number;
  urlCount: number;
  
  // Language patterns
  capitalizationRatio: number; // 0-1 (all caps words / total words)
  uniqueWordRatio: number; // 0-1 (unique words / total words)
  
  // Topic modeling
  topKeywords: string[];
  topicCategories: Array<{
    category: string;
    confidence: number;
  }>;
}

export interface EngagementFeatures {
  // Core metrics
  viewsNormalized: number; // 0-1 based on follower count
  likesRate: number; // likes per view
  commentsRate: number; // comments per view  
  sharesRate: number; // shares per view
  savesRate: number; // saves per view (where available)
  
  // Engagement quality
  engagementVelocity: number; // engagement per minute in first hour
  engagementSustainability: number; // engagement consistency over time
  
  // Audience metrics
  audienceRetention: number; // 0-1 (for video content)
  clickthroughRate: number; // 0-1 (when applicable)
  
  // Social proof
  socialProofScore: number; // 0-1 based on various engagement signals
  viralityIndicator: number; // 0-1 based on share/engagement patterns
}

export interface TemporalFeatures {
  // Timing analysis
  hourOptimality: number; // 0-1 based on posting hour vs optimal hours
  dayOptimality: number; // 0-1 based on posting day vs optimal days
  seasonalRelevance: number; // 0-1 based on seasonal trends
  
  // Frequency patterns
  postingFrequency: number; // posts per day/week
  consistencyScore: number; // 0-1 based on posting regularity
  
  // Trend alignment
  trendMomentum: number; // 0-1 based on trending topic alignment
  recencyBoost: number; // 0-1 boost for recent trending alignment
  
  // Lifecycle position
  contentLifecycleStage: 'emerging' | 'growing' | 'peak' | 'declining' | 'niche';
  expectedLifespan: number; // estimated days of relevance
}

export interface PlatformFeatures {
  // Platform-specific optimization
  platformFitScore: number; // 0-1 based on content format vs platform
  algorithmFriendliness: number; // 0-1 based on platform algorithm preferences
  
  // Format analysis
  optimalLength: boolean;
  optimalFormat: boolean;
  optimalMediaType: boolean;
  
  // Competition metrics
  nicheSaturation: number; // 0-1 based on competition in niche
  competitiveDifferentiation: number; // 0-1 uniqueness vs competitors
  
  // Platform-specific signals
  platformSpecificSignals: Record<string, number>; // Custom signals per platform
}

export interface CompositeFeatures {
  // High-level scores
  contentQualityScore: number; // 0-100 composite quality metric
  viralPotentialScore: number; // 0-100 likelihood of viral success
  audienceFitScore: number; // 0-100 alignment with target audience
  
  // Predictive features
  expectedEngagementRange: { min: number; max: number; predicted: number };
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    impact: number; // -1 to 1
  }>;
  
  // Optimization opportunities
  improvementPotential: number; // 0-1 how much improvement is possible
  quickWinOpportunities: Array<{
    opportunity: string;
    effort: 'low' | 'medium' | 'high';
    impact: number; // 0-1
  }>;
}

export interface FeatureExtractionRequest {
  content: {
    text: string;
    mediaType: 'text' | 'image' | 'video' | 'carousel';
    platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'facebook';
    hashtags?: string[];
    mentions?: string[];
    urls?: string[];
  };
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    timestamp?: Date;
  };
  context?: {
    authorFollowers?: number;
    previousPosts?: Array<{
      text: string;
      engagement: number;
      timestamp: Date;
    }>;
    niche?: string;
    targetAudience?: string;
  };
  options?: {
    includeTextFeatures?: boolean;
    includeEngagementFeatures?: boolean;
    includeTemporalFeatures?: boolean;
    includePlatformFeatures?: boolean;
    includeCompositeFeatures?: boolean;
  };
}

export interface FeatureExtractionResult {
  text?: TextFeatures;
  engagement?: EngagementFeatures;
  temporal?: TemporalFeatures;
  platform?: PlatformFeatures;
  composite?: CompositeFeatures;
  
  metadata: {
    extractionTime: number;
    featuresExtracted: number;
    confidence: number;
    version: string;
  };
}

// ================================================================
// FEATURES SERVICE CLASS
// ================================================================

export class FeaturesService {
  private version = '1.0.0';
  
  constructor() {
    console.log('[FeaturesService] Initialized version:', this.version);
  }

  /**
   * Extract all requested features from content
   */
  async extractFeatures(request: FeatureExtractionRequest): Promise<FeatureExtractionResult> {
    const startTime = Date.now();
    console.log('[FeaturesService] Extracting features for:', {
      platform: request.content.platform,
      mediaType: request.content.mediaType,
      textLength: request.content.text.length
    });

    const result: Partial<FeatureExtractionResult> = {};
    let featuresExtracted = 0;

    // Extract text features
    if (request.options?.includeTextFeatures !== false) {
      result.text = this.extractTextFeatures(request.content.text, request.content);
      featuresExtracted++;
    }

    // Extract engagement features
    if (request.options?.includeEngagementFeatures !== false && request.metrics) {
      result.engagement = this.extractEngagementFeatures(request.metrics, request.context);
      featuresExtracted++;
    }

    // Extract temporal features
    if (request.options?.includeTemporalFeatures !== false) {
      result.temporal = this.extractTemporalFeatures(request.metrics?.timestamp, request.context);
      featuresExtracted++;
    }

    // Extract platform features
    if (request.options?.includePlatformFeatures !== false) {
      result.platform = this.extractPlatformFeatures(request.content, request.context);
      featuresExtracted++;
    }

    // Extract composite features (requires other features)
    if (request.options?.includeCompositeFeatures !== false) {
      result.composite = this.extractCompositeFeatures(result, request.context);
      featuresExtracted++;
    }

    const extractionTime = Date.now() - startTime;
    const confidence = this.calculateExtractionConfidence(result, request);

    const finalResult: FeatureExtractionResult = {
      ...result,
      metadata: {
        extractionTime,
        featuresExtracted,
        confidence,
        version: this.version
      }
    } as FeatureExtractionResult;

    console.log(`[FeaturesService] Feature extraction completed - ${featuresExtracted} feature sets, ${extractionTime}ms`);
    return finalResult;
  }

  /**
   * Extract batch features for multiple content pieces
   */
  async extractBatchFeatures(requests: FeatureExtractionRequest[]): Promise<FeatureExtractionResult[]> {
    console.log(`[FeaturesService] Batch extracting features for ${requests.length} items`);
    
    const results = await Promise.all(
      requests.map(request => this.extractFeatures(request))
    );

    console.log(`[FeaturesService] Batch extraction completed for ${results.length} items`);
    return results;
  }

  // ================================================================
  // TEXT FEATURES EXTRACTION
  // ================================================================

  private extractTextFeatures(text: string, content: FeatureExtractionRequest['content']): TextFeatures {
    // Basic metrics
    const length = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount || 0;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;
    const avgSentenceLength = length / sentenceCount || 0;

    // Complexity metrics
    const readabilityScore = this.calculateReadabilityScore(words, sentences);
    const complexity = Math.min(1, avgWordLength / 8); // Normalized complexity

    // Emotional analysis
    const emotionalMetrics = this.analyzeEmotionalContent(text);
    
    // Structural features
    const questionCount = (text.match(/\?/g) || []).length;
    const exclamationCount = (text.match(/!/g) || []).length;
    const hashtagCount = content.hashtags?.length || (text.match(/#\w+/g) || []).length;
    const mentionCount = content.mentions?.length || (text.match(/@\w+/g) || []).length;
    const emojiCount = (text.match(/[\u2600-\u27BF]|[\uD83C-\uD83F][\uDC00-\uDFFF]/g) || []).length;
    const urlCount = content.urls?.length || (text.match(/https?:\/\/[^\s]+/g) || []).length;

    // Language patterns
    const allCapsWords = words.filter(word => word.length > 1 && word === word.toUpperCase()).length;
    const capitalizationRatio = allCapsWords / wordCount || 0;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const uniqueWordRatio = uniqueWords / wordCount || 0;

    // Topic analysis
    const topKeywords = this.extractTopKeywords(words);
    const topicCategories = this.categorizeTopics(text);

    return {
      length,
      wordCount,
      avgWordLength,
      sentenceCount,
      avgSentenceLength,
      readabilityScore,
      complexity,
      emotionalIntensity: emotionalMetrics.intensity,
      emotionalPolarity: emotionalMetrics.polarity,
      urgencyScore: emotionalMetrics.urgency,
      actionabilityScore: emotionalMetrics.actionability,
      questionCount,
      exclamationCount,
      hashtagCount,
      mentionCount,
      emojiCount,
      urlCount,
      capitalizationRatio,
      uniqueWordRatio,
      topKeywords,
      topicCategories
    };
  }

  // ================================================================
  // ENGAGEMENT FEATURES EXTRACTION
  // ================================================================

  private extractEngagementFeatures(
    metrics: NonNullable<FeatureExtractionRequest['metrics']>,
    context?: FeatureExtractionRequest['context']
  ): EngagementFeatures {
    const views = metrics.views || 1000; // Default for calculation
    const likes = metrics.likes || 0;
    const comments = metrics.comments || 0;
    const shares = metrics.shares || 0;
    const saves = metrics.saves || 0;
    const followers = context?.authorFollowers || 1000;

    // Normalize views based on follower count
    const viewsNormalized = Math.min(1, views / followers);

    // Calculate engagement rates
    const likesRate = likes / views;
    const commentsRate = comments / views;
    const sharesRate = shares / views;
    const savesRate = saves / views;

    // Calculate engagement velocity (mock implementation)
    const totalEngagement = likes + comments + shares + saves;
    const engagementVelocity = Math.min(1, totalEngagement / views / 0.1); // Normalized velocity

    // Calculate sustainability (would require time-series data in real implementation)
    const engagementSustainability = 0.7 + Math.random() * 0.3; // Mock value

    // Mock other metrics that would require additional data
    const audienceRetention = 0.6 + Math.random() * 0.4;
    const clickthroughRate = sharesRate * 0.3; // Approximate based on shares

    // Calculate social proof score
    const socialProofScore = Math.min(1, 
      (likesRate * 0.3 + commentsRate * 0.4 + sharesRate * 0.3) * 10
    );

    // Calculate virality indicator
    const viralityIndicator = Math.min(1, 
      sharesRate * 20 + (comments / likes || 0) * 0.5
    );

    return {
      viewsNormalized: Math.round(viewsNormalized * 1000) / 1000,
      likesRate: Math.round(likesRate * 1000) / 1000,
      commentsRate: Math.round(commentsRate * 1000) / 1000,
      sharesRate: Math.round(sharesRate * 1000) / 1000,
      savesRate: Math.round(savesRate * 1000) / 1000,
      engagementVelocity: Math.round(engagementVelocity * 1000) / 1000,
      engagementSustainability: Math.round(engagementSustainability * 1000) / 1000,
      audienceRetention: Math.round(audienceRetention * 1000) / 1000,
      clickthroughRate: Math.round(clickthroughRate * 1000) / 1000,
      socialProofScore: Math.round(socialProofScore * 1000) / 1000,
      viralityIndicator: Math.round(viralityIndicator * 1000) / 1000
    };
  }

  // ================================================================
  // TEMPORAL FEATURES EXTRACTION
  // ================================================================

  private extractTemporalFeatures(
    timestamp?: Date,
    context?: FeatureExtractionRequest['context']
  ): TemporalFeatures {
    const now = timestamp || new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0 = Sunday

    // Define optimal posting times (mock data)
    const optimalHours = [9, 12, 15, 18, 20, 21];
    const optimalDays = [1, 2, 3, 4, 6]; // Monday through Thursday, Saturday

    const hourOptimality = optimalHours.includes(hour) ? 1 : 0.6;
    const dayOptimality = optimalDays.includes(day) ? 1 : 0.7;

    // Seasonal relevance (mock implementation)
    const month = now.getMonth();
    const seasonalRelevance = 0.7 + Math.sin((month / 12) * Math.PI * 2) * 0.3; // Seasonal wave

    // Posting frequency analysis
    const postingFrequency = context?.previousPosts?.length || 1; // Posts per timeframe
    const consistencyScore = postingFrequency > 0 ? Math.min(1, 1 / Math.abs(postingFrequency - 1)) : 0.5;

    // Trend alignment (mock)
    const trendMomentum = 0.6 + Math.random() * 0.4;
    const recencyBoost = Math.max(0, 1 - (Date.now() - now.getTime()) / (24 * 60 * 60 * 1000)); // Decay over 24h

    // Content lifecycle
    const contentLifecycleStage = this.determineContentLifecycleStage(context?.niche);
    const expectedLifespan = this.estimateContentLifespan(contentLifecycleStage);

    return {
      hourOptimality: Math.round(hourOptimality * 100) / 100,
      dayOptimality: Math.round(dayOptimality * 100) / 100,
      seasonalRelevance: Math.round(seasonalRelevance * 100) / 100,
      postingFrequency,
      consistencyScore: Math.round(consistencyScore * 100) / 100,
      trendMomentum: Math.round(trendMomentum * 100) / 100,
      recencyBoost: Math.round(recencyBoost * 100) / 100,
      contentLifecycleStage,
      expectedLifespan
    };
  }

  // ================================================================
  // PLATFORM FEATURES EXTRACTION
  // ================================================================

  private extractPlatformFeatures(
    content: FeatureExtractionRequest['content'],
    context?: FeatureExtractionRequest['context']
  ): PlatformFeatures {
    const { platform, mediaType, text } = content;

    // Platform-specific optimization scores
    const platformFitScore = this.calculatePlatformFit(platform, mediaType, text.length);
    const algorithmFriendliness = this.calculateAlgorithmFriendliness(platform, content);

    // Format validation
    const optimalLength = this.isOptimalLength(platform, text.length);
    const optimalFormat = this.isOptimalFormat(platform, mediaType);
    const optimalMediaType = this.isOptimalMediaType(platform, mediaType);

    // Competition analysis (mock)
    const nicheSaturation = 0.3 + Math.random() * 0.4; // Mock saturation level
    const competitiveDifferentiation = 0.5 + Math.random() * 0.5; // Mock differentiation

    // Platform-specific signals
    const platformSpecificSignals = this.extractPlatformSpecificSignals(platform, content);

    return {
      platformFitScore: Math.round(platformFitScore * 100) / 100,
      algorithmFriendliness: Math.round(algorithmFriendliness * 100) / 100,
      optimalLength,
      optimalFormat,
      optimalMediaType,
      nicheSaturation: Math.round(nicheSaturation * 100) / 100,
      competitiveDifferentiation: Math.round(competitiveDifferentiation * 100) / 100,
      platformSpecificSignals
    };
  }

  // ================================================================
  // COMPOSITE FEATURES EXTRACTION
  // ================================================================

  private extractCompositeFeatures(
    features: Partial<FeatureExtractionResult>,
    context?: FeatureExtractionRequest['context']
  ): CompositeFeatures {
    // Calculate composite scores
    const contentQualityScore = this.calculateContentQualityScore(features);
    const viralPotentialScore = this.calculateViralPotentialScore(features);
    const audienceFitScore = this.calculateAudienceFitScore(features, context);

    // Generate risk factors
    const riskFactors = this.identifyRiskFactors(features);

    // Identify improvement opportunities
    const improvementPotential = this.calculateImprovementPotential(features);
    const quickWinOpportunities = this.identifyQuickWinOpportunities(features);

    // Predict engagement range
    const expectedEngagementRange = this.predictEngagementRange(features, context);

    return {
      contentQualityScore: Math.round(contentQualityScore),
      viralPotentialScore: Math.round(viralPotentialScore),
      audienceFitScore: Math.round(audienceFitScore),
      expectedEngagementRange,
      riskFactors,
      improvementPotential: Math.round(improvementPotential * 100) / 100,
      quickWinOpportunities
    };
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private calculateReadabilityScore(words: string[], sentences: string[]): number {
    // Simplified Flesch Reading Ease score
    const avgSentenceLength = words.length / sentences.length || 0;
    const avgSyllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0) / words.length || 0;
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(word: string): number {
    // Simple syllable counting heuristic
    const vowels = word.toLowerCase().match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    if (word.toLowerCase().endsWith('e')) count--;
    return Math.max(1, count);
  }

  private analyzeEmotionalContent(text: string): {
    intensity: number;
    polarity: number;
    urgency: number;
    actionability: number;
  } {
    const lowerText = text.toLowerCase();
    
    // Emotional keywords
    const positiveWords = ['amazing', 'great', 'awesome', 'love', 'excellent', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointing'];
    const urgentWords = ['now', 'urgent', 'quick', 'immediate', 'asap', 'hurry', 'limited time'];
    const actionWords = ['get', 'buy', 'try', 'start', 'join', 'click', 'subscribe', 'follow'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const urgentCount = urgentWords.filter(word => lowerText.includes(word)).length;
    const actionCount = actionWords.filter(word => lowerText.includes(word)).length;

    const intensity = Math.min(1, (positiveCount + negativeCount + urgentCount) / 10);
    const polarity = positiveCount > negativeCount ? 
      (positiveCount - negativeCount) / 5 : 
      -(negativeCount - positiveCount) / 5;
    const urgency = Math.min(1, urgentCount / 3);
    const actionability = Math.min(1, actionCount / 5);

    return {
      intensity: Math.round(intensity * 100) / 100,
      polarity: Math.max(-1, Math.min(1, polarity)),
      urgency: Math.round(urgency * 100) / 100,
      actionability: Math.round(actionability * 100) / 100
    };
  }

  private extractTopKeywords(words: string[]): string[] {
    // Simple keyword extraction based on frequency and length
    const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const wordCounts = new Map<string, number>();

    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
        wordCounts.set(cleanWord, (wordCounts.get(cleanWord) || 0) + 1);
      }
    });

    return Array.from(wordCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private categorizeTopics(text: string): Array<{ category: string; confidence: number }> {
    const categories = [
      { category: 'lifestyle', keywords: ['life', 'daily', 'routine', 'tips', 'hack'] },
      { category: 'food', keywords: ['recipe', 'cooking', 'food', 'kitchen', 'meal'] },
      { category: 'fitness', keywords: ['workout', 'exercise', 'fitness', 'health', 'gym'] },
      { category: 'technology', keywords: ['tech', 'app', 'digital', 'online', 'software'] },
      { category: 'entertainment', keywords: ['fun', 'funny', 'entertainment', 'game', 'show'] }
    ];

    const lowerText = text.toLowerCase();
    
    return categories.map(cat => {
      const matches = cat.keywords.filter(keyword => lowerText.includes(keyword)).length;
      const confidence = Math.min(1, matches / cat.keywords.length);
      return { category: cat.category, confidence };
    }).filter(cat => cat.confidence > 0);
  }

  private calculatePlatformFit(platform: string, mediaType: string, textLength: number): number {
    const platformOptimal = {
      tiktok: { mediaType: 'video', maxLength: 150 },
      instagram: { mediaType: 'image', maxLength: 300 },
      youtube: { mediaType: 'video', maxLength: 1000 },
      twitter: { mediaType: 'text', maxLength: 280 },
      facebook: { mediaType: 'text', maxLength: 500 }
    };

    const optimal = platformOptimal[platform as keyof typeof platformOptimal];
    if (!optimal) return 0.5;

    let score = 0.5;
    
    // Media type fit
    if (mediaType === optimal.mediaType) score += 0.3;
    else score += 0.1;

    // Length fit
    if (textLength <= optimal.maxLength) score += 0.2;
    else score += Math.max(0, 0.2 - (textLength - optimal.maxLength) / optimal.maxLength);

    return Math.min(1, score);
  }

  private calculateAlgorithmFriendliness(platform: string, content: FeatureExtractionRequest['content']): number {
    // Platform-specific algorithm preferences (mock implementation)
    let score = 0.5;

    if (platform === 'tiktok') {
      if (content.mediaType === 'video') score += 0.3;
      if (content.hashtags && content.hashtags.length >= 3) score += 0.2;
    } else if (platform === 'instagram') {
      if (content.hashtags && content.hashtags.length <= 10) score += 0.2;
      if (content.mediaType === 'image' || content.mediaType === 'carousel') score += 0.2;
    }

    return Math.min(1, score);
  }

  private isOptimalLength(platform: string, textLength: number): boolean {
    const optimal = {
      tiktok: 150,
      instagram: 300,
      youtube: 1000,
      twitter: 280,
      facebook: 500
    };

    return textLength <= (optimal[platform as keyof typeof optimal] || 500);
  }

  private isOptimalFormat(platform: string, mediaType: string): boolean {
    const optimal = {
      tiktok: ['video'],
      instagram: ['image', 'carousel', 'video'],
      youtube: ['video'],
      twitter: ['text', 'image'],
      facebook: ['text', 'image', 'video']
    };

    return (optimal[platform as keyof typeof optimal] || []).includes(mediaType);
  }

  private isOptimalMediaType(platform: string, mediaType: string): boolean {
    return this.isOptimalFormat(platform, mediaType);
  }

  private extractPlatformSpecificSignals(platform: string, content: FeatureExtractionRequest['content']): Record<string, number> {
    const signals: Record<string, number> = {};

    if (platform === 'tiktok') {
      signals.trendingHashtagUsage = (content.hashtags?.length || 0) >= 3 ? 1 : 0;
      signals.shortFormOptimization = content.text.length <= 150 ? 1 : 0;
    } else if (platform === 'instagram') {
      signals.hashtagBalance = (content.hashtags?.length || 0) <= 10 ? 1 : 0;
      signals.visualAppeal = content.mediaType !== 'text' ? 1 : 0;
    }

    return signals;
  }

  private determineContentLifecycleStage(niche?: string): TemporalFeatures['contentLifecycleStage'] {
    // Mock lifecycle determination
    const stages: TemporalFeatures['contentLifecycleStage'][] = ['emerging', 'growing', 'peak', 'declining', 'niche'];
    return stages[Math.floor(Math.random() * stages.length)];
  }

  private estimateContentLifespan(stage: TemporalFeatures['contentLifecycleStage']): number {
    const lifespans = {
      emerging: 30,
      growing: 14,
      peak: 7,
      declining: 3,
      niche: 60
    };

    return lifespans[stage];
  }

  private calculateContentQualityScore(features: Partial<FeatureExtractionResult>): number {
    let score = 50; // Base score

    if (features.text) {
      score += features.text.readabilityScore * 0.2;
      score += features.text.emotionalIntensity * 20;
      score += (1 - features.text.complexity) * 10;
    }

    if (features.platform) {
      score += features.platform.platformFitScore * 20;
      score += features.platform.algorithmFriendliness * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateViralPotentialScore(features: Partial<FeatureExtractionResult>): number {
    let score = 30; // Base score

    if (features.text) {
      score += features.text.emotionalIntensity * 30;
      score += features.text.actionabilityScore * 20;
      score += (features.text.hashtagCount > 0 ? 10 : 0);
    }

    if (features.engagement) {
      score += features.engagement.viralityIndicator * 30;
      score += features.engagement.sharesRate * 50;
    }

    if (features.temporal) {
      score += features.temporal.trendMomentum * 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateAudienceFitScore(features: Partial<FeatureExtractionResult>, context?: FeatureExtractionRequest['context']): number {
    let score = 50; // Base score

    if (features.text && context?.niche) {
      const relevantTopics = features.text.topicCategories.filter(t => 
        t.category.toLowerCase().includes(context.niche?.toLowerCase() || '')
      );
      score += relevantTopics.length * 15;
    }

    if (features.platform) {
      score += features.platform.platformFitScore * 30;
    }

    if (features.temporal) {
      score += features.temporal.hourOptimality * 10;
      score += features.temporal.dayOptimality * 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private identifyRiskFactors(features: Partial<FeatureExtractionResult>): CompositeFeatures['riskFactors'] {
    const risks: CompositeFeatures['riskFactors'] = [];

    if (features.text) {
      if (features.text.readabilityScore < 30) {
        risks.push({
          factor: 'Content too complex for broad audience',
          severity: 'high',
          impact: -0.3
        });
      }

      if (features.text.emotionalPolarity < -0.5) {
        risks.push({
          factor: 'Overly negative tone detected',
          severity: 'medium',
          impact: -0.2
        });
      }
    }

    if (features.platform) {
      if (features.platform.platformFitScore < 0.5) {
        risks.push({
          factor: 'Poor platform optimization',
          severity: 'high',
          impact: -0.4
        });
      }
    }

    return risks;
  }

  private calculateImprovementPotential(features: Partial<FeatureExtractionResult>): number {
    let potential = 0;

    if (features.text && features.text.readabilityScore < 70) {
      potential += 0.3;
    }

    if (features.platform && features.platform.platformFitScore < 0.8) {
      potential += 0.4;
    }

    if (features.engagement && features.engagement.viralityIndicator < 0.5) {
      potential += 0.3;
    }

    return Math.min(1, potential);
  }

  private identifyQuickWinOpportunities(features: Partial<FeatureExtractionResult>): CompositeFeatures['quickWinOpportunities'] {
    const opportunities: CompositeFeatures['quickWinOpportunities'] = [];

    if (features.text) {
      if (features.text.hashtagCount < 3) {
        opportunities.push({
          opportunity: 'Add trending hashtags',
          effort: 'low',
          impact: 0.2
        });
      }

      if (features.text.emotionalIntensity < 0.5) {
        opportunities.push({
          opportunity: 'Increase emotional impact',
          effort: 'medium',
          impact: 0.3
        });
      }
    }

    if (features.platform && !features.platform.optimalLength) {
      opportunities.push({
        opportunity: 'Optimize content length for platform',
        effort: 'low',
        impact: 0.15
      });
    }

    return opportunities;
  }

  private predictEngagementRange(features: Partial<FeatureExtractionResult>, context?: FeatureExtractionRequest['context']): CompositeFeatures['expectedEngagementRange'] {
    const baseEngagement = 100; // Base expected engagement
    let multiplier = 1;

    if (features.text) {
      multiplier *= (1 + features.text.emotionalIntensity);
    }

    if (features.engagement) {
      multiplier *= (1 + features.engagement.viralityIndicator);
    }

    const predicted = Math.round(baseEngagement * multiplier);
    const variance = predicted * 0.5;

    return {
      min: Math.round(predicted - variance),
      max: Math.round(predicted + variance),
      predicted
    };
  }

  private calculateExtractionConfidence(result: Partial<FeatureExtractionResult>, request: FeatureExtractionRequest): number {
    let confidence = 0.5;

    // More features extracted = higher confidence
    const featureCount = Object.keys(result).length - 1; // Exclude metadata
    confidence += featureCount * 0.1;

    // More input data = higher confidence
    if (request.metrics) confidence += 0.2;
    if (request.context?.authorFollowers) confidence += 0.1;
    if (request.content.hashtags?.length) confidence += 0.1;

    return Math.min(1, Math.round(confidence * 100) / 100);
  }

  /**
   * Get service status and capabilities
   */
  getStatus() {
    return {
      version: this.version,
      capabilities: {
        textFeatures: true,
        engagementFeatures: true,
        temporalFeatures: true,
        platformFeatures: true,
        compositeFeatures: true,
        batchProcessing: true
      },
      supportedPlatforms: ['tiktok', 'instagram', 'youtube', 'twitter', 'facebook'],
      supportedMediaTypes: ['text', 'image', 'video', 'carousel']
    };
  }
}

// ================================================================
// FACTORY & EXPORTS
// ================================================================

/**
 * Create features service instance
 */
export function createFeaturesService(): FeaturesService {
  return new FeaturesService();
}

// Export singleton instance for convenience
export const featuresService = createFeaturesService();