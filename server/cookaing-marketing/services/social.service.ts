// Social Automation Service - Orchestrates social media automation workflows
// Integrates providers: social, engagement, hashtag, timing for comprehensive automation

import { createSocialProvider, SocialPublishPayload, SocialPublishResult } from '../providers/social.provider.js';
import { createEngagementProvider, EngagementAction, EngagementResult } from '../providers/engagement.provider.js';
import { createHashtagProvider, HashtagResearchResult } from '../providers/hashtag.provider.js';
import { createTimingProvider, OptimalTimingResult, TimeWindow } from '../providers/timing.provider.js';

// Service interface types
interface SocialPublishRequest {
  platform: string;
  caption: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  scheduledAt?: Date;
}

interface EngagementRequest {
  platform: string;
  actions: EngagementAction[];
}

interface HashtagRequest {
  topic: string;
  platform?: string;
  limit?: number;
}

interface TimingRequest {
  platform: string;
  segmentId?: string;
  contentType?: string;
  targetAudience?: string;
}

// Response interfaces
interface SocialAutomationSummary {
  published: number;
  queued: number;
  failed: number;
  engaged: number;
  hashtagsGenerated: number;
  timingsAnalyzed: number;
}

interface BulkSocialResult {
  successes: SocialPublishResult[];
  failures: { platform: string; error: string }[];
  summary: SocialAutomationSummary;
}

class SocialService {
  private socialProvider;
  private engagementProvider;
  private hashtagProvider;
  private timingProvider;

  constructor() {
    // Initialize providers using factory functions (auto-selects mock/live based on env)
    this.socialProvider = createSocialProvider();
    this.engagementProvider = createEngagementProvider();
    this.hashtagProvider = createHashtagProvider();
    this.timingProvider = createTimingProvider();
  }

  // Core social publishing methods
  async publishToSocial(request: SocialPublishRequest): Promise<SocialPublishResult> {
    const payload: SocialPublishPayload = {
      caption: request.caption,
      mediaUrls: request.mediaUrls,
      hashtags: request.hashtags,
      mentions: request.mentions
    };

    return await this.socialProvider.publishPost(
      request.platform,
      payload,
      request.scheduledAt
    );
  }

  async publishToMultiplePlatforms(
    platforms: string[],
    request: Omit<SocialPublishRequest, 'platform'>
  ): Promise<BulkSocialResult> {
    const results = await Promise.allSettled(
      platforms.map(platform =>
        this.publishToSocial({ ...request, platform })
      )
    );

    const successes: SocialPublishResult[] = [];
    const failures: { platform: string; error: string }[] = [];

    results.forEach((result, index) => {
      const platform = platforms[index];
      if (result.status === 'fulfilled') {
        successes.push(result.value);
      } else {
        failures.push({
          platform,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    const summary: SocialAutomationSummary = {
      published: successes.filter(r => r.status === 'published').length,
      queued: successes.filter(r => r.status === 'queued').length,
      failed: successes.filter(r => r.status === 'failed').length + failures.length,
      engaged: 0,
      hashtagsGenerated: 0,
      timingsAnalyzed: 0
    };

    return { successes, failures, summary };
  }

  async getPostStatus(platform: string, remoteId: string): Promise<SocialPublishResult> {
    return await this.socialProvider.getPostStatus(platform, remoteId);
  }

  async deletePost(platform: string, remoteId: string): Promise<boolean> {
    return await this.socialProvider.deletePost(platform, remoteId);
  }

  // Engagement automation methods
  async runEngagement(request: EngagementRequest): Promise<EngagementResult[]> {
    return await this.engagementProvider.batchActions(request.platform, request.actions);
  }

  async performSingleEngagement(
    platform: string,
    action: EngagementAction
  ): Promise<EngagementResult> {
    return await this.engagementProvider.performAction(platform, action);
  }

  async getEngagementHistory(platform: string, limit?: number): Promise<EngagementResult[]> {
    return await this.engagementProvider.getActionHistory(platform, limit);
  }

  // Hashtag research methods
  async suggestHashtags(request: HashtagRequest): Promise<HashtagResearchResult> {
    return await this.hashtagProvider.researchHashtags(
      request.topic,
      request.platform,
      request.limit
    );
  }

  async analyzeHashtagPerformance(
    tags: string[],
    platform: string
  ): Promise<any[]> {
    return await this.hashtagProvider.analyzeHashtagPerformance(tags, platform);
  }

  async getTrendingHashtags(platform?: string, category?: string): Promise<any[]> {
    return await this.hashtagProvider.getTrendingHashtags(platform, category);
  }

  async optimizeHashtagSet(tags: string[], platform: string): Promise<string[]> {
    return await this.hashtagProvider.optimizeHashtagSet(tags, platform);
  }

  // Optimal timing methods
  async getOptimalTimes(request: TimingRequest): Promise<OptimalTimingResult> {
    return await this.timingProvider.getOptimalTimes(request.platform, request.segmentId);
  }

  async analyzeHistoricalTiming(platform: string, days?: number): Promise<any> {
    return await this.timingProvider.analyzeHistoricalTiming(platform, days);
  }

  async predictBestSlots(platform: string, contentType?: string): Promise<TimeWindow[]> {
    return await this.timingProvider.predictBestSlots(platform, contentType);
  }

  async getTimezoneRecommendations(platform: string, targetAudience?: string): Promise<string[]> {
    return await this.timingProvider.getTimezoneRecommendations(platform, targetAudience);
  }

  // Comprehensive workflow methods
  async createOptimizedPost(
    platforms: string[],
    content: string,
    topic: string,
    scheduledAt?: Date
  ): Promise<{
    posts: BulkSocialResult;
    hashtags: HashtagResearchResult;
    timing: OptimalTimingResult;
  }> {
    // Get hashtag suggestions
    const hashtags = await this.suggestHashtags({
      topic,
      platform: platforms[0], // Use first platform for hashtag research
      limit: 10
    });

    // Get optimal timing for first platform
    const timing = await this.getOptimalTimes({
      platform: platforms[0]
    });

    // Publish with optimized hashtags
    const posts = await this.publishToMultiplePlatforms(platforms, {
      caption: content,
      hashtags: hashtags.suggestions.slice(0, 5).map(h => h.tag), // Use top 5 hashtags
      scheduledAt
    });

    return { posts, hashtags, timing };
  }

  async runFullEngagementCampaign(
    platform: string,
    targetUrls: string[],
    engagementTypes: ('like' | 'comment' | 'share')[] = ['like']
  ): Promise<{
    results: EngagementResult[];
    summary: { successful: number; failed: number; total: number };
  }> {
    const actions: EngagementAction[] = [];

    // Create engagement actions for each URL and type
    targetUrls.forEach(url => {
      engagementTypes.forEach(type => {
        actions.push({
          type,
          targetUrl: url,
          text: type === 'comment' ? 'Great content! 👍' : undefined
        });
      });
    });

    const results = await this.runEngagement({ platform, actions });

    const summary = {
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      total: results.length
    };

    return { results, summary };
  }

  // Analytics and reporting methods
  async getSocialAutomationStats(): Promise<SocialAutomationSummary> {
    // In a real implementation, this would query database for actual stats
    // For now, return mock summary data based on provider activity
    try {
      // Mock aggregated stats from recent activity
      const recentEngagement = await this.engagementProvider.getActionHistory('mock', 50);
      const engagementCount = recentEngagement.filter(r => r.status === 'success').length;
      
      return {
        published: 15,
        queued: 8,
        failed: 2,
        engaged: engagementCount || 45,
        hashtagsGenerated: 120,
        timingsAnalyzed: 25
      };
    } catch {
      // Fallback to static mock data
      return {
        published: 15,
        queued: 8,
        failed: 2,
        engaged: 45,
        hashtagsGenerated: 120,
        timingsAnalyzed: 25
      };
    }
  }

  async getPlatformStats(platform: string): Promise<{
    posts: { published: number; queued: number; failed: number };
    engagement: { likes: number; comments: number; shares: number };
    hashtags: { researched: number; trending: number; optimized: number };
    timing: { analyzed: number; optimal: number; recommendations: number };
  }> {
    try {
      // Get actual engagement history for this platform
      const engagementHistory = await this.engagementProvider.getActionHistory(platform, 100);
      const likes = engagementHistory.filter(r => r.action === 'like' && r.status === 'success').length;
      const comments = engagementHistory.filter(r => r.action === 'comment' && r.status === 'success').length;
      const shares = engagementHistory.filter(r => r.action === 'share' && r.status === 'success').length;

      return {
        posts: { published: 8, queued: 3, failed: 1 },
        engagement: { 
          likes: likes || 25, 
          comments: comments || 8, 
          shares: shares || 5 
        },
        hashtags: { researched: 45, trending: 12, optimized: 8 },
        timing: { analyzed: 15, optimal: 8, recommendations: 3 }
      };
    } catch {
      // Fallback to mock data
      return {
        posts: { published: 8, queued: 3, failed: 1 },
        engagement: { likes: 25, comments: 8, shares: 5 },
        hashtags: { researched: 45, trending: 12, optimized: 8 },
        timing: { analyzed: 15, optimal: 8, recommendations: 3 }
      };
    }
  }

  async getAutomationKPIs(): Promise<{
    totalPosts: number;
    successRate: number;
    avgEngagementPerPost: number;
    topPerformingPlatform: string;
    hashtagOptimizationRate: number;
    timingAccuracy: number;
  }> {
    try {
      // Calculate KPIs from aggregated data
      const stats = await this.getSocialAutomationStats();
      const totalPosts = stats.published + stats.queued + stats.failed;
      const successRate = totalPosts > 0 ? (stats.published / totalPosts) * 100 : 0;
      
      return {
        totalPosts,
        successRate: Math.round(successRate * 100) / 100,
        avgEngagementPerPost: totalPosts > 0 ? Math.round((stats.engaged / totalPosts) * 100) / 100 : 0,
        topPerformingPlatform: 'instagram', // Mock - would calculate from actual data
        hashtagOptimizationRate: 85.5, // Mock optimization percentage
        timingAccuracy: 92.3 // Mock timing prediction accuracy
      };
    } catch {
      return {
        totalPosts: 25,
        successRate: 88.0,
        avgEngagementPerPost: 1.8,
        topPerformingPlatform: 'instagram',
        hashtagOptimizationRate: 85.5,
        timingAccuracy: 92.3
      };
    }
  }

  async getProviderHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'down';
    details: {
      social: { status: 'up' | 'down'; lastCheck: Date; message?: string };
      engagement: { status: 'up' | 'down'; lastCheck: Date; message?: string };
      hashtag: { status: 'up' | 'down'; lastCheck: Date; message?: string };
      timing: { status: 'up' | 'down'; lastCheck: Date; message?: string };
    };
    uptime: number; // percentage
  }> {
    const checkTime = new Date();
    type ProviderStatus = { status: 'up' | 'down'; lastCheck: Date; message?: string };
    
    const details: {
      social: ProviderStatus;
      engagement: ProviderStatus;
      hashtag: ProviderStatus;
      timing: ProviderStatus;
    } = {
      social: { status: 'up', lastCheck: checkTime },
      engagement: { status: 'up', lastCheck: checkTime },
      hashtag: { status: 'up', lastCheck: checkTime },
      timing: { status: 'up', lastCheck: checkTime }
    };

    let downCount = 0;

    // Check each provider with error details
    try {
      await this.socialProvider.getPostStatus('mock', 'health-check');
      details.social = { status: 'up', lastCheck: checkTime };
    } catch (error) {
      details.social = { 
        status: 'down', 
        lastCheck: checkTime, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      downCount++;
    }

    try {
      await this.engagementProvider.getActionHistory('mock', 1);
      details.engagement = { status: 'up', lastCheck: checkTime };
    } catch (error) {
      details.engagement = { 
        status: 'down', 
        lastCheck: checkTime, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      downCount++;
    }

    try {
      await this.hashtagProvider.researchHashtags('health', 'mock', 1);
      details.hashtag = { status: 'up', lastCheck: checkTime };
    } catch (error) {
      details.hashtag = { 
        status: 'down', 
        lastCheck: checkTime, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      downCount++;
    }

    try {
      await this.timingProvider.getOptimalTimes('mock');
      details.timing = { status: 'up', lastCheck: checkTime };
    } catch (error) {
      details.timing = { 
        status: 'down', 
        lastCheck: checkTime, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
      downCount++;
    }

    const upCount = 4 - downCount;
    const uptime = (upCount / 4) * 100;
    
    let overall: 'healthy' | 'degraded' | 'down';
    if (downCount === 0) {
      overall = 'healthy';
    } else if (downCount <= 2) {
      overall = 'degraded';
    } else {
      overall = 'down';
    }

    return { overall, details, uptime };
  }

  // Legacy health check method (simplified version of getProviderHealth)
  async checkSocialAutomationHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    providers: {
      social: 'up' | 'down';
      engagement: 'up' | 'down';
      hashtag: 'up' | 'down';
      timing: 'up' | 'down';
    };
    lastCheck: Date;
  }> {
    const fullHealth = await this.getProviderHealth();
    
    return {
      status: fullHealth.overall,
      providers: {
        social: fullHealth.details.social.status,
        engagement: fullHealth.details.engagement.status,
        hashtag: fullHealth.details.hashtag.status,
        timing: fullHealth.details.timing.status
      },
      lastCheck: fullHealth.details.social.lastCheck
    };
  }
}

// Export singleton instance
export const socialService = new SocialService();
export { SocialService };
export type {
  SocialPublishRequest,
  EngagementRequest,
  HashtagRequest,
  TimingRequest,
  SocialAutomationSummary,
  BulkSocialResult
};