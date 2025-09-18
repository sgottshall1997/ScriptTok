import { TrendingItem } from '../types.js';

export interface GoogleTrendsAdapter {
  getTrendingTopics(region?: string, timeframe?: string): Promise<TrendingItem[]>;
  getRelatedQueries(keyword: string): Promise<string[]>;
}

class GoogleTrendsService implements GoogleTrendsAdapter {
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_TRENDS_API_KEY;
  }

  async getTrendingTopics(region: string = 'US', timeframe: string = 'now 7-d'): Promise<TrendingItem[]> {
    // If no API key, return mock trending food/cooking ingredients
    if (!this.apiKey) {
      console.log('🔍 Google Trends: Using mock data (no API key configured)');
      return this.getMockTrendingTopics();
    }

    try {
      // Real Google Trends API implementation would go here
      // For now, falling back to mock data
      console.log('🔍 Google Trends: Real API not implemented yet, using mock data');
      return this.getMockTrendingTopics();
    } catch (error) {
      console.error('❌ Google Trends API error:', error);
      return this.getMockTrendingTopics();
    }
  }

  async getRelatedQueries(keyword: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.getMockRelatedQueries(keyword);
    }

    try {
      // Real implementation would query Google Trends for related searches
      return this.getMockRelatedQueries(keyword);
    } catch (error) {
      console.error('❌ Google Trends related queries error:', error);
      return this.getMockRelatedQueries(keyword);
    }
  }

  private getMockTrendingTopics(): TrendingItem[] {
    const currentMonth = new Date().getMonth();
    const seasonalTrends = this.getSeasonalTrends(currentMonth);
    
    const baseTrends: TrendingItem[] = [
      {
        keyword: 'air fryer recipes',
        score: 95,
        platform: 'google_trends',
        category: 'cooking',
        region: 'US',
        timestamp: new Date()
      },
      {
        keyword: 'meal prep containers',
        score: 88,
        platform: 'google_trends',
        category: 'cooking',
        region: 'US',
        timestamp: new Date()
      },
      {
        keyword: 'healthy smoothie recipes',
        score: 82,
        platform: 'google_trends',
        category: 'cooking',
        region: 'US',
        timestamp: new Date()
      },
      {
        keyword: 'instant pot meals',
        score: 78,
        platform: 'google_trends',
        category: 'cooking',
        region: 'US',
        timestamp: new Date()
      }
    ];

    return [...baseTrends, ...seasonalTrends];
  }

  private getSeasonalTrends(month: number): TrendingItem[] {
    const seasonalTrends: Record<number, TrendingItem[]> = {
      // October - Fall trends
      9: [
        { keyword: 'pumpkin spice recipes', score: 92, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() },
        { keyword: 'apple cider recipes', score: 85, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() }
      ],
      // November - Thanksgiving
      10: [
        { keyword: 'thanksgiving meal prep', score: 94, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() },
        { keyword: 'cranberry sauce recipe', score: 87, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() }
      ],
      // December - Holiday cooking
      11: [
        { keyword: 'holiday cookie recipes', score: 96, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() },
        { keyword: 'christmas dinner ideas', score: 89, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() }
      ],
      // January - New Year health
      0: [
        { keyword: 'healthy meal prep', score: 91, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() },
        { keyword: 'detox smoothies', score: 84, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() }
      ],
      // Summer - BBQ season
      5: [
        { keyword: 'bbq recipes', score: 88, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() },
        { keyword: 'grilling tips', score: 83, platform: 'google_trends', category: 'seasonal', region: 'US', timestamp: new Date() }
      ]
    };

    return seasonalTrends[month] || [];
  }

  private getMockRelatedQueries(keyword: string): string[] {
    const relatedQueries: Record<string, string[]> = {
      'pumpkin spice': ['pumpkin spice latte', 'pumpkin spice cookies', 'pumpkin spice bread'],
      'air fryer': ['air fryer chicken', 'air fryer vegetables', 'air fryer desserts'],
      'meal prep': ['meal prep ideas', 'meal prep containers', 'weekly meal prep'],
      'smoothie': ['green smoothie', 'protein smoothie', 'breakfast smoothie']
    };

    const baseKeyword = keyword.toLowerCase().split(' ')[0];
    return relatedQueries[baseKeyword] || [`${keyword} recipes`, `${keyword} tips`, `${keyword} ideas`];
  }
}

export const googleTrendsAdapter = new GoogleTrendsService();