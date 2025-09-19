/**
 * Competitor Analysis Provider Interface & Mock Implementation
 */
import type { CompetitorPost } from '../../../types/ext';

export interface ICompetitorProvider {
  fetchPosts(platform: string, competitor: string, limit?: number): Promise<CompetitorPost[]>;
  analyzeTrends(posts: CompetitorPost[]): Promise<{ trending_topics: string[]; engagement_patterns: object }>;
  getStatus(): Promise<{ status: 'ok' | 'mock_mode' | 'error'; message?: string }>;
}

export class MockCompetitorProvider implements ICompetitorProvider {
  async fetchPosts(platform: string, competitor: string, limit = 10): Promise<CompetitorPost[]> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPosts: CompetitorPost[] = [];
    
    for (let i = 0; i < limit; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      mockPosts.push({
        sourcePlatform: platform,
        author: competitor,
        url: `https://${platform}.com/${competitor}/post/${Date.now()}-${i}`,
        capturedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        text: this.generateMockPostText(platform),
        metrics: {
          likes: Math.floor(Math.random() * 10000),
          shares: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 200),
          views: Math.floor(Math.random() * 50000),
          engagement_rate: Math.random() * 10,
        },
        tags: this.generateMockTags(),
      });
    }
    
    return mockPosts.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime());
  }

  async analyzeTrends(posts: CompetitorPost[]) {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      trending_topics: ['AI automation', 'sustainable fashion', 'wellness trends', 'remote work', 'productivity hacks'],
      engagement_patterns: {
        best_times: ['09:00', '12:00', '17:00'],
        top_hashtags: ['#trending', '#innovation', '#lifestyle'],
        content_types: { image: 0.6, video: 0.3, text: 0.1 },
        avg_engagement_rate: 5.2,
      },
    };
  }

  private generateMockPostText(platform: string): string {
    const templates = [
      "🚀 Excited to share our latest innovation! The future is here and it's incredible. What do you think? #innovation #future",
      "Just launched something amazing! Can't wait for you all to try it out. Link in bio! 🔥 #launch #exciting",
      "Behind the scenes: This is how we make the magic happen. Swipe to see our process! ✨ #bts #process",
      "Trending now: Here's what everyone is talking about. Are you following this trend? 📈 #trending #viral",
      "Pro tip: This simple trick will change everything for you. Save this post! 💡 #protip #lifehack",
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateMockTags(): string[] {
    const allTags = ['trending', 'viral', 'innovation', 'lifestyle', 'tech', 'business', 'motivation', 'tips', 'behind-the-scenes', 'community'];
    const count = Math.floor(Math.random() * 5) + 1;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  async getStatus() {
    return { status: 'mock_mode' as const, message: 'Using mock competitor analysis' };
  }
}

export class SocialListeningProvider implements ICompetitorProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async fetchPosts(platform: string, competitor: string, limit = 10): Promise<CompetitorPost[]> {
    if (!this.apiKey) {
      throw new Error('Social listening API key not configured');
    }
    
    // TODO: Implement real social listening integration (Brandwatch, Sprout Social, etc.)
    throw new Error('Social listening not yet implemented');
  }

  async analyzeTrends(posts: CompetitorPost[]): Promise<{ trending_topics: string[]; engagement_patterns: object }> {
    if (!this.apiKey) {
      throw new Error('Social listening API key not configured');
    }
    
    // TODO: Implement real trend analysis
    throw new Error('Trend analysis not yet implemented');
  }

  async getStatus() {
    if (!this.apiKey) {
      return { status: 'error' as const, message: 'API key missing' };
    }
    return { status: 'ok' as const };
  }
}