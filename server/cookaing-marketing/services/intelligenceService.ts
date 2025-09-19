/**
 * Server Intelligence Service - Provides mock responses for API routes
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  mode: 'mock' | 'live';
}

export interface CompetitorPost {
  id?: number;
  sourcePlatform: string;
  author: string;
  url: string;
  capturedAt: Date;
  text: string;
  metrics: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
    engagement_rate?: number;
  };
  tags: string[];
}

export interface SentimentSnapshot {
  id?: number;
  scope: 'campaign' | 'post' | 'brand';
  refId: number;
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  labels: {
    positive?: number;
    negative?: number;
    neutral?: number;
    emotion?: string;
  };
  createdAt?: Date;
}

export class IntelligenceService {
  // Competitor Analysis
  async fetchCompetitorPosts(platform: string, competitor: string, limit = 10): Promise<ApiResponse<CompetitorPost[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const posts: CompetitorPost[] = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
        id: Date.now() + i,
        sourcePlatform: platform,
        author: competitor,
        url: `https://${platform}.com/${competitor}/post/${Date.now() + i}`,
        capturedAt: new Date(),
        text: `Mock post content from ${competitor} on ${platform} - post ${i + 1}`,
        metrics: {
          likes: Math.floor(Math.random() * 1000),
          shares: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 10000),
          engagement_rate: Math.random() * 10
        },
        tags: ['mock', 'competitor', platform]
      }));

      return {
        success: true,
        data: posts,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Competitor analysis failed',
        mode: 'mock'
      };
    }
  }

  async analyzeCompetitorTrends(posts: CompetitorPost[]): Promise<ApiResponse<any>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const trends = {
        totalPosts: posts.length,
        avgEngagement: posts.reduce((sum, p) => sum + (p.metrics.engagement_rate || 0), 0) / posts.length,
        topTopics: ['trending topic 1', 'trending topic 2', 'trending topic 3'],
        postingFrequency: 'daily',
        bestPerformingTime: '6:00 PM',
        sentiment: 'positive'
      };

      return {
        success: true,
        data: trends,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Trend analysis failed',
        mode: 'mock'
      };
    }
  }

  // Sentiment Analysis
  async analyzeSentiment(text: string, scope: string, refId: number): Promise<ApiResponse<SentimentSnapshot>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const score = (Math.random() - 0.5) * 2; // -1 to 1
      const magnitude = Math.random(); // 0 to 1
      
      const sentiment: SentimentSnapshot = {
        id: Date.now(),
        scope: scope as 'campaign' | 'post' | 'brand',
        refId,
        score,
        magnitude,
        labels: {
          positive: score > 0 ? Math.abs(score) : 0,
          negative: score < 0 ? Math.abs(score) : 0,
          neutral: Math.abs(score) < 0.1 ? 0.9 : 0.1,
          emotion: score > 0.5 ? 'joy' : score < -0.5 ? 'anger' : 'neutral'
        },
        createdAt: new Date()
      };

      return {
        success: true,
        data: sentiment,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sentiment analysis failed',
        mode: 'mock'
      };
    }
  }

  async batchAnalyzeSentiment(
    items: Array<{ text: string; scope: string; refId: number }>
  ): Promise<ApiResponse<SentimentSnapshot[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = items.map((item, index) => ({
        id: Date.now() + index,
        scope: item.scope as 'campaign' | 'post' | 'brand',
        refId: item.refId,
        score: (Math.random() - 0.5) * 2,
        magnitude: Math.random(),
        labels: {
          positive: Math.random() * 0.7,
          negative: Math.random() * 0.3,
          neutral: Math.random() * 0.5,
          emotion: 'mixed'
        },
        createdAt: new Date()
      }));

      return {
        success: true,
        data: results,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch sentiment analysis failed',
        mode: 'mock'
      };
    }
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      return {
        success: true,
        data: {
          competitor_analysis: { status: 'mock_mode', message: 'Using mock competitor analysis' },
          sentiment_analysis: { status: 'mock_mode', message: 'Using mock sentiment analysis' },
          trend_analysis: { status: 'mock_mode', message: 'Using mock trend analysis' },
          viral_prediction: { status: 'mock_mode', message: 'Using mock viral prediction' }
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