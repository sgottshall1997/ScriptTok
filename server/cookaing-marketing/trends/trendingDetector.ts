import { googleTrendsAdapter } from './adapters/googleTrends.js';
import { redditAdapter } from './adapters/reddit.js';
import { tiktokAdapter } from './adapters/tiktok.js';
import { TrendingItem, TrendingDetectorConfig } from './types.js';
import { storage } from '../../storage.js';

export class TrendingDetectorService {
  private config: TrendingDetectorConfig;

  constructor() {
    this.config = {
      enabled: false, // Start disabled until toggled in UI
      frequency: 'daily',
      platforms: ['google_trends', 'reddit', 'tiktok'],
      minScore: 75,
      maxCampaignsPerDay: 3
    };
  }

  async detectTrends(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🔍 Trending Detector: Skipped (disabled)');
      return;
    }

    console.log('🔍 Trending Detector: Starting daily trend analysis...');

    try {
      // Gather trends from all platforms
      const allTrends = await this.gatherTrendsFromAllPlatforms();
      
      // Filter and rank trends
      const topTrends = this.filterAndRankTrends(allTrends);
      
      // Create campaigns for top trends
      await this.createCampaignsFromTrends(topTrends);
      
      console.log(`✅ Trending Detector: Processed ${topTrends.length} top trends`);
    } catch (error) {
      console.error('❌ Trending Detector error:', error);
    }
  }

  private async gatherTrendsFromAllPlatforms(): Promise<TrendingItem[]> {
    const trends: TrendingItem[] = [];
    
    try {
      // Google Trends
      if (this.config.platforms.includes('google_trends')) {
        console.log('📊 Fetching Google Trends...');
        const googleTrends = await googleTrendsAdapter.getTrendingTopics();
        trends.push(...googleTrends);
      }

      // Reddit trends
      if (this.config.platforms.includes('reddit')) {
        console.log('📊 Fetching Reddit trends...');
        const redditTrends = await redditAdapter.getTrendingTopics('food');
        const mealPrepTrends = await redditAdapter.getTrendingTopics('mealprep');
        trends.push(...redditTrends, ...mealPrepTrends);
      }

      // TikTok trends
      if (this.config.platforms.includes('tiktok')) {
        console.log('📊 Fetching TikTok trends...');
        const tiktokTrends = await tiktokAdapter.getTrendingHashtags();
        const viralContent = await tiktokAdapter.getViralContent('food');
        trends.push(...tiktokTrends, ...viralContent);
      }

      console.log(`📊 Gathered ${trends.length} total trends from all platforms`);
      return trends;
    } catch (error) {
      console.error('❌ Error gathering trends:', error);
      return [];
    }
  }

  private filterAndRankTrends(trends: TrendingItem[]): TrendingItem[] {
    // Remove duplicates and low-scoring trends
    const filteredTrends = trends.filter(trend => trend.score >= this.config.minScore);
    
    // Group by keyword to remove duplicates
    const uniqueTrends = new Map<string, TrendingItem>();
    
    filteredTrends.forEach(trend => {
      const key = trend.keyword.toLowerCase();
      const existing = uniqueTrends.get(key);
      
      if (!existing || trend.score > existing.score) {
        uniqueTrends.set(key, trend);
      }
    });

    // Sort by score and take top trends
    const rankedTrends = Array.from(uniqueTrends.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxCampaignsPerDay);

    console.log(`🎯 Top trends selected: ${rankedTrends.map(t => t.keyword).join(', ')}`);
    return rankedTrends;
  }

  private async createCampaignsFromTrends(trends: TrendingItem[]): Promise<void> {
    for (const trend of trends) {
      try {
        const contentGeneration = await this.createCampaignFromTrend(trend);
        console.log(`✅ Created trending content: "${contentGeneration.name}" (ID: ${contentGeneration.id})`);
      } catch (error) {
        console.error(`❌ Failed to create campaign for trend "${trend.keyword}":`, error);
      }
    }
  }

  private async createCampaignFromTrend(trend: TrendingItem) {
    const campaignName = `Trending: ${this.formatTrendName(trend.keyword)}`;
    const description = `Campaign generated from trending ${trend.platform} topic: ${trend.keyword} (Score: ${trend.score})`;

    // Create content generation instead of campaign (using existing methods)
    const blogContent = this.generateBlogContent(trend.keyword, trend.category, trend.platform);
    const socialContent = this.generateSocialContent(trend.keyword, trend.category);
    
    const contentGeneration = await storage.createContentGeneration({
      niche: trend.category,
      selectedProduct: `Trending: ${trend.keyword}`,
      template: 'trending_topic',
      aiModel: 'claude-3-haiku',
      content: blogContent,
      platformCaptions: socialContent,
      metadata: {
        source: 'trending_detector',
        platform: trend.platform,
        trend_score: trend.score,
        trend_category: trend.category,
        generated_at: new Date().toISOString()
      }
    });

    return { id: contentGeneration.id, name: campaignName };
  }

  // Content artifacts are now included in the main content generation

  private generateBlogContent(keyword: string, category: string, platform: string): string {
    return `# ${this.formatTrendName(keyword)}: The Latest Cooking Trend Taking ${platform} by Storm

**Trending Alert!** The ${keyword} trend is exploding across social media, and for good reason. This ${category} phenomenon is changing how people approach cooking and meal preparation.

## What Makes ${this.formatTrendName(keyword)} So Popular?

Based on our analysis of trending data, here's what makes this trend so compelling:

- **Easy to implement** - Perfect for busy home cooks
- **Visually appealing** - Social media loves it
- **Practical results** - Real benefits for your kitchen routine
- **Community driven** - People are sharing their own variations

## How to Get Started

Here's your step-by-step guide to mastering ${keyword}:

1. **Gather your ingredients** - We'll show you exactly what you need
2. **Follow the technique** - Master the basics first
3. **Make it your own** - Add your personal twist
4. **Share your results** - Join the community conversation

## Pro Tips from the Trend

The most successful ${keyword} practitioners share these insights:

- Start simple and build complexity over time
- Quality ingredients make all the difference
- Don't be afraid to experiment with flavors
- Document your process for future reference

## Why This Trend Has Staying Power

Unlike flash-in-the-pan social media trends, ${keyword} addresses real cooking challenges:

- Saves time in the kitchen
- Reduces food waste
- Improves flavor and presentation
- Creates shareable moments

## Ready to Try ${this.formatTrendName(keyword)}?

Join thousands of home cooks who are already exploring this exciting trend. Start with our beginner-friendly approach and work your way up to more advanced techniques.

*What's your experience with ${keyword}? Share your results and tips in the comments below!*

---

*This post was inspired by trending data from ${platform} showing ${keyword} as a top emerging cooking trend.*`;
  }

  private generateSocialContent(keyword: string, category: string): Record<string, string> {
    const formattedName = this.formatTrendName(keyword);
    
    return {
      twitter: `🔥 ${formattedName} is trending for a reason! This ${category} hack is a game-changer for home cooks. Who else is trying this? #${keyword.replace(/\s+/g, '')} #CookingTrends #FoodHacks`,
      
      instagram: `${formattedName} is taking over our feeds! 📸✨
      
This ${category} trend is perfect for:
• Quick weeknight meals
• Meal prep Sunday
• Impressing dinner guests
• Adding flavor to basics

Tag someone who needs to try this! 👇

#${keyword.replace(/\s+/g, '')} #CookingTrends #HomeCooking #FoodPrep #KitchenHacks`,
      
      facebook: `Have you heard about the ${formattedName} trend? 🍳

This ${category} technique is gaining popularity because it:
- Saves time in the kitchen
- Creates amazing flavors
- Works with ingredients you already have
- Makes cooking more enjoyable

Perfect for busy families and cooking enthusiasts alike! What trends are you following in your kitchen?`,
      
      tiktok: `POV: You just discovered ${keyword} and your cooking game changed forever 🤯 

This ${category} hack is exactly what your kitchen routine needed! Save this for your next grocery trip 📌

#${keyword.replace(/\s+/g, '')} #CookingHack #FoodTrend #KitchenTips #MealPrep #HomeCook`
    };
  }

  private formatTrendName(keyword: string): string {
    return keyword
      .replace(/#/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Configuration methods
  updateConfig(newConfig: Partial<TrendingDetectorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Trending Detector config updated:', this.config);
  }

  getConfig(): TrendingDetectorConfig {
    return { ...this.config };
  }

  enable(): void {
    this.config.enabled = true;
    console.log('✅ Trending Detector enabled');
  }

  disable(): void {
    this.config.enabled = false;
    console.log('🚫 Trending Detector disabled');
  }
}

export const trendingDetectorService = new TrendingDetectorService();