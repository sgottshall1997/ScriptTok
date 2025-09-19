/**
 * Server Social Automation Service - Provides mock responses for API routes
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  mode: 'mock' | 'live';
}

export interface SocialQueueItem {
  id?: number;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook';
  accountId: string;
  scheduledAt: Date;
  payload: {
    text?: string;
    mediaUrls?: string[];
    hashtags?: string[];
    mentions?: string[];
    location?: string;
  };
  status: 'queued' | 'published' | 'failed' | 'cancelled';
  result?: {
    postId?: string;
    url?: string;
    error?: string;
  };
  createdAt?: Date;
}

export interface HashtagSuggestion {
  id?: number;
  topic: string;
  platform: string;
  tags: string[];
  metrics: {
    popularity?: number;
    competition?: number;
    relevance?: number;
  };
  createdAt?: Date;
}

export class SocialAutomationService {
  // Social Publishing
  async publishPost(queueItem: SocialQueueItem): Promise<ApiResponse<any>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = {
        success: true,
        postId: `post_${Date.now()}`,
        platform: queueItem.platform,
        url: `https://${queueItem.platform}.com/post/${Date.now()}`,
        publishedAt: new Date().toISOString(),
        engagement: {
          initialReach: Math.floor(Math.random() * 1000),
          estimatedViews: Math.floor(Math.random() * 5000)
        }
      };

      return {
        success: true,
        data: result,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Publishing failed',
        mode: 'mock'
      };
    }
  }

  async schedulePost(queueItem: SocialQueueItem): Promise<ApiResponse<any>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = {
        success: true,
        scheduleId: `sched_${Date.now()}`,
        platform: queueItem.platform,
        scheduledFor: queueItem.scheduledAt.toISOString(),
        status: 'scheduled'
      };

      return {
        success: true,
        data: result,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scheduling failed',
        mode: 'mock'
      };
    }
  }

  async getAccountInfo(platform: string, accountId: string): Promise<ApiResponse<any>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const info = {
        platform,
        accountId,
        username: `mock_user_${accountId}`,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
        posts: Math.floor(Math.random() * 500),
        verified: Math.random() > 0.7,
        lastActive: new Date().toISOString()
      };

      return {
        success: true,
        data: info,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Account info retrieval failed',
        mode: 'mock'
      };
    }
  }

  // Hashtag Research
  async suggestHashtags(topic: string, platform: string): Promise<ApiResponse<HashtagSuggestion>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const baseTags = this.generateHashtagSuggestions(topic, platform);
      
      const suggestion: HashtagSuggestion = {
        id: Date.now(),
        topic,
        platform,
        tags: baseTags,
        metrics: {
          popularity: Math.random() * 100,
          competition: Math.random() * 100,
          relevance: Math.random() * 100
        },
        createdAt: new Date()
      };

      return {
        success: true,
        data: suggestion,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Hashtag research failed',
        mode: 'mock'
      };
    }
  }

  private generateHashtagSuggestions(topic: string, platform: string): string[] {
    const topicTags = [
      `#${topic.toLowerCase()}`,
      `#${topic.toLowerCase()}love`,
      `#${topic.toLowerCase()}life`,
      `#amazing${topic.toLowerCase()}`,
      `#${topic.toLowerCase()}community`
    ];
    
    const platformTags = platform === 'instagram' 
      ? ['#instadaily', '#photooftheday', '#instagood']
      : platform === 'tiktok'
      ? ['#fyp', '#viral', '#trending']
      : ['#socialmedia', '#content', '#engagement'];
    
    return [...topicTags, ...platformTags];
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      return {
        success: true,
        data: {
          social_publishing: { status: 'mock_mode', message: 'Using mock social publishing' },
          hashtag_research: { status: 'mock_mode', message: 'Using mock hashtag research' },
          optimal_timing: { status: 'mock_mode', message: 'Using mock timing analysis' },
          engagement_monitoring: { status: 'mock_mode', message: 'Using mock engagement monitoring' }
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        mode: 'mock'
      };
    }
  }
}