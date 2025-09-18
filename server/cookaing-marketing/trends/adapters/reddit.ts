import { TrendingItem } from '../types.js';

export interface RedditAdapter {
  getTrendingTopics(subreddit?: string, timeframe?: string): Promise<TrendingItem[]>;
  getPopularPosts(subreddit: string, limit?: number): Promise<TrendingItem[]>;
}

class RedditService implements RedditAdapter {
  private clientId?: string;
  private clientSecret?: string;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
  }

  async getTrendingTopics(subreddit: string = 'food', timeframe: string = 'week'): Promise<TrendingItem[]> {
    // If no API credentials, return mock trending food/cooking topics from Reddit
    if (!this.clientId || !this.clientSecret) {
      console.log('🔍 Reddit: Using mock data (no API credentials configured)');
      return this.getMockTrendingTopics(subreddit);
    }

    try {
      // Real Reddit API implementation would go here
      // For now, falling back to mock data
      console.log('🔍 Reddit: Real API not implemented yet, using mock data');
      return this.getMockTrendingTopics(subreddit);
    } catch (error) {
      console.error('❌ Reddit API error:', error);
      return this.getMockTrendingTopics(subreddit);
    }
  }

  async getPopularPosts(subreddit: string, limit: number = 10): Promise<TrendingItem[]> {
    if (!this.clientId || !this.clientSecret) {
      return this.getMockPopularPosts(subreddit, limit);
    }

    try {
      // Real implementation would query Reddit API for popular posts
      return this.getMockPopularPosts(subreddit, limit);
    } catch (error) {
      console.error('❌ Reddit popular posts error:', error);
      return this.getMockPopularPosts(subreddit, limit);
    }
  }

  private getMockTrendingTopics(subreddit: string): TrendingItem[] {
    const subredditTopics: Record<string, TrendingItem[]> = {
      food: [
        {
          keyword: 'one pot pasta recipes',
          score: 89,
          platform: 'reddit',
          category: 'cooking',
          timestamp: new Date(),
          metadata: { subreddit: 'food', upvotes: 2400 }
        },
        {
          keyword: 'sourdough starter tips',
          score: 84,
          platform: 'reddit',
          category: 'baking',
          timestamp: new Date(),
          metadata: { subreddit: 'food', upvotes: 1890 }
        },
        {
          keyword: 'cast iron seasoning',
          score: 76,
          platform: 'reddit',
          category: 'cooking tools',
          timestamp: new Date(),
          metadata: { subreddit: 'food', upvotes: 1650 }
        }
      ],
      mealprep: [
        {
          keyword: 'freezer meal ideas',
          score: 91,
          platform: 'reddit',
          category: 'meal prep',
          timestamp: new Date(),
          metadata: { subreddit: 'mealprep', upvotes: 3200 }
        },
        {
          keyword: 'lunch box recipes',
          score: 87,
          platform: 'reddit',
          category: 'meal prep',
          timestamp: new Date(),
          metadata: { subreddit: 'mealprep', upvotes: 2800 }
        }
      ],
      cooking: [
        {
          keyword: 'knife skills tutorial',
          score: 82,
          platform: 'reddit',
          category: 'cooking techniques',
          timestamp: new Date(),
          metadata: { subreddit: 'cooking', upvotes: 2100 }
        },
        {
          keyword: 'fermentation basics',
          score: 78,
          platform: 'reddit',
          category: 'preservation',
          timestamp: new Date(),
          metadata: { subreddit: 'cooking', upvotes: 1950 }
        }
      ]
    };

    return subredditTopics[subreddit] || subredditTopics.food;
  }

  private getMockPopularPosts(subreddit: string, limit: number): TrendingItem[] {
    const allTopics = this.getMockTrendingTopics(subreddit);
    return allTopics.slice(0, limit);
  }
}

export const redditAdapter = new RedditService();