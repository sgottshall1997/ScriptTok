import { TrendingItem } from '../types.js';

export interface TikTokAdapter {
  getTrendingHashtags(region?: string): Promise<TrendingItem[]>;
  getViralContent(category?: string): Promise<TrendingItem[]>;
}

class TikTokService implements TikTokAdapter {
  private apiKey?: string;
  private secretKey?: string;

  constructor() {
    this.apiKey = process.env.TIKTOK_API_KEY;
    this.secretKey = process.env.TIKTOK_SECRET_KEY;
  }

  async getTrendingHashtags(region: string = 'US'): Promise<TrendingItem[]> {
    // If no API credentials, return mock trending cooking/food hashtags from TikTok
    if (!this.apiKey || !this.secretKey) {
      console.log('🔍 TikTok: Using mock data (no API credentials configured)');
      return this.getMockTrendingHashtags();
    }

    try {
      // Real TikTok API implementation would go here
      // For now, falling back to mock data
      console.log('🔍 TikTok: Real API not implemented yet, using mock data');
      return this.getMockTrendingHashtags();
    } catch (error) {
      console.error('❌ TikTok API error:', error);
      return this.getMockTrendingHashtags();
    }
  }

  async getViralContent(category: string = 'food'): Promise<TrendingItem[]> {
    if (!this.apiKey || !this.secretKey) {
      return this.getMockViralContent(category);
    }

    try {
      // Real implementation would query TikTok API for viral content
      return this.getMockViralContent(category);
    } catch (error) {
      console.error('❌ TikTok viral content error:', error);
      return this.getMockViralContent(category);
    }
  }

  private getMockTrendingHashtags(): TrendingItem[] {
    return [
      {
        keyword: '#foodhack',
        score: 96,
        platform: 'tiktok',
        category: 'cooking',
        timestamp: new Date(),
        metadata: { views: 8500000, videos: 45000 }
      },
      {
        keyword: '#mealprep',
        score: 92,
        platform: 'tiktok',
        category: 'meal prep',
        timestamp: new Date(),
        metadata: { views: 6200000, videos: 32000 }
      },
      {
        keyword: '#quickrecipes',
        score: 88,
        platform: 'tiktok',
        category: 'cooking',
        timestamp: new Date(),
        metadata: { views: 5800000, videos: 28000 }
      },
      {
        keyword: '#healthyeating',
        score: 85,
        platform: 'tiktok',
        category: 'nutrition',
        timestamp: new Date(),
        metadata: { views: 4900000, videos: 24000 }
      },
      {
        keyword: '#cookingwithkids',
        score: 81,
        platform: 'tiktok',
        category: 'family',
        timestamp: new Date(),
        metadata: { views: 3700000, videos: 18000 }
      }
    ];
  }

  private getMockViralContent(category: string): TrendingItem[] {
    const viralByCategory: Record<string, TrendingItem[]> = {
      food: [
        {
          keyword: 'pasta chip trend',
          score: 94,
          platform: 'tiktok',
          category: 'viral food',
          timestamp: new Date(),
          metadata: { views: 12000000, likes: 890000 }
        },
        {
          keyword: 'cloud bread recipe',
          score: 89,
          platform: 'tiktok',
          category: 'viral food',
          timestamp: new Date(),
          metadata: { views: 9500000, likes: 650000 }
        }
      ],
      drinks: [
        {
          keyword: 'dalgona coffee',
          score: 87,
          platform: 'tiktok',
          category: 'viral drinks',
          timestamp: new Date(),
          metadata: { views: 8200000, likes: 580000 }
        },
        {
          keyword: 'protein smoothie hacks',
          score: 83,
          platform: 'tiktok',
          category: 'viral drinks',
          timestamp: new Date(),
          metadata: { views: 6800000, likes: 420000 }
        }
      ]
    };

    return viralByCategory[category] || viralByCategory.food;
  }
}

export const tiktokAdapter = new TikTokService();