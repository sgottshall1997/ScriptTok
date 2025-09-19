// Hashtag Research & Optimization Provider
// Generates trending hashtags and optimization suggestions with deterministic mock mode

interface HashtagSuggestion {
  tag: string;
  popularity: number; // 1-100 score
  difficulty: number; // 1-100 competition score
  category: 'trending' | 'niche' | 'branded' | 'general';
  volume?: number; // Estimated monthly volume
  engagement?: number; // Average engagement rate
  platforms?: string[]; // Best platforms for this tag
}

interface HashtagResearchResult {
  topic: string;
  platform?: string;
  suggestions: HashtagSuggestion[];
  totalFound: number;
  generatedAt: Date;
}

interface HashtagProvider {
  researchHashtags(topic: string, platform?: string, limit?: number): Promise<HashtagResearchResult>;
  analyzeHashtagPerformance(tags: string[], platform: string): Promise<HashtagSuggestion[]>;
  getTrendingHashtags(platform?: string, category?: string): Promise<HashtagSuggestion[]>;
  optimizeHashtagSet(tags: string[], platform: string): Promise<string[]>;
}

// Seeded Random Number Generator for deterministic outputs
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length)];
  }
}

function createSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

class MockHashtagProvider implements HashtagProvider {
  private mockDelay = 600;
  
  // Seeded hashtag database for consistent mock results
  private hashtagSeeds = {
    food: ['foodie', 'delicious', 'yummy', 'cooking', 'recipe', 'homemade', 'tasty', 'kitchen', 'chef', 'hungry'],
    travel: ['travel', 'wanderlust', 'adventure', 'explore', 'vacation', 'destination', 'journey', 'discovery', 'nomad', 'passport'],
    fitness: ['fitness', 'workout', 'gym', 'healthy', 'strong', 'motivation', 'exercise', 'training', 'muscle', 'cardio'],
    beauty: ['beauty', 'makeup', 'skincare', 'glam', 'style', 'fashion', 'selfie', 'cosmetics', 'gorgeous', 'stunning'],
    tech: ['tech', 'innovation', 'digital', 'startup', 'coding', 'ai', 'software', 'development', 'technology', 'future'],
    lifestyle: ['lifestyle', 'daily', 'mood', 'vibes', 'aesthetic', 'inspiration', 'mindful', 'wellness', 'balance', 'growth']
  };

  async researchHashtags(topic: string, platform?: string, limit?: number): Promise<HashtagResearchResult> {
    const actualLimit = limit || 10; // Always return exactly 10 tags as specified
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));
    
    const suggestions = this.generateHashtagSuggestions(topic, actualLimit, platform);
    
    // Generate deterministic timestamp
    const rng = new SeededRandom(createSeed(`timestamp:${topic}:${platform || 'all'}`));
    const baseTime = new Date('2024-01-01T12:00:00Z');
    const hourOffset = rng.nextInt(0, 24);
    const deterministicTimestamp = new Date(baseTime.getTime() + (hourOffset * 60 * 60 * 1000));

    return {
      topic,
      platform,
      suggestions,
      totalFound: suggestions.length,
      generatedAt: deterministicTimestamp
    };
  }

  async analyzeHashtagPerformance(tags: string[], platform: string): Promise<HashtagSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return tags.map(tag => this.generateHashtagAnalysis(tag, platform));
  }

  async getTrendingHashtags(platform?: string, category?: string): Promise<HashtagSuggestion[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const trendingTags = [
      'viral', 'trending', 'fyp', 'explore', 'popular', 'hot', 'new', 'latest', 'breaking', 'buzz'
    ];
    
    return trendingTags.map(tag => {
      const rng = new SeededRandom(createSeed(`trending:${tag}:${platform || 'all'}`));
      
      return {
        tag,
        popularity: 85 + rng.nextInt(0, 15),
        difficulty: 75 + rng.nextInt(0, 25),
        category: 'trending' as const,
        volume: 50000 + rng.nextInt(0, 200000),
        engagement: 12 + rng.nextInt(0, 8),
        platforms: platform ? [platform] : ['instagram', 'tiktok', 'twitter']
      };
    });
  }

  async optimizeHashtagSet(tags: string[], platform: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock optimization logic
    const analyzed = await this.analyzeHashtagPerformance(tags, platform);
    
    // Sort by a combination of popularity and low difficulty (deterministic)
    const optimized = analyzed
      .sort((a, b) => {
        const scoreA = a.popularity - (a.difficulty * 0.5);
        const scoreB = b.popularity - (b.difficulty * 0.5);
        return scoreB - scoreA;
      })
      .map(h => h.tag);
    
    // Add a few trending tags if there's room
    const trending = await this.getTrendingHashtags(platform);
    const trendingTags = trending.slice(0, 3).map(h => h.tag);
    
    return [...optimized, ...trendingTags].slice(0, 30); // Platform limits
  }

  private generateHashtagSuggestions(topic: string, limit: number, platform?: string): HashtagSuggestion[] {
    const suggestions: HashtagSuggestion[] = [];
    const rng = new SeededRandom(createSeed(`${topic}:${platform || 'all'}`));
    
    // Find relevant seed category
    const category = this.findRelevantCategory(topic);
    const seeds = this.hashtagSeeds[category] || this.hashtagSeeds.lifestyle;
    
    // Generate exactly 10 hashtags deterministically
    const selectedSeeds = seeds.slice(0, 5);
    selectedSeeds.forEach(seed => {
      suggestions.push(this.generateHashtagAnalysis(seed, platform));
    });
    
    // Generate topic-specific variations
    const topicVariations = this.generateTopicVariations(topic).slice(0, 3);
    topicVariations.forEach(variation => {
      suggestions.push(this.generateHashtagAnalysis(variation, platform));
    });
    
    // Add exactly 2 trending hashtags
    const trendingAdditions = ['viral', 'trending'];
    trendingAdditions.forEach(addition => {
      const tagRng = new SeededRandom(createSeed(`${addition}:${topic}`));
      
      suggestions.push({
        tag: addition,
        popularity: 70 + tagRng.nextInt(0, 30),
        difficulty: 60 + tagRng.nextInt(0, 40),
        category: 'trending',
        volume: 100000 + tagRng.nextInt(0, 500000),
        engagement: 8 + tagRng.nextInt(0, 12),
        platforms: platform ? [platform] : ['instagram', 'tiktok', 'twitter', 'youtube']
      });
    });
    
    // Sort deterministically by popularity descending, then difficulty ascending, then alphabetical
    suggestions.sort((a, b) => {
      if (a.popularity !== b.popularity) {
        return b.popularity - a.popularity; // Higher popularity first
      }
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty; // Lower difficulty first
      }
      return a.tag.localeCompare(b.tag); // Alphabetical order
    });

    // Return exactly 10 ranked hashtags (or requested limit)
    return suggestions.slice(0, Math.min(limit, 10));
  }

  private generateHashtagAnalysis(tag: string, platform?: string): HashtagSuggestion {
    // Generate deterministic metrics based on tag
    const rng = new SeededRandom(createSeed(`${tag}:${platform || 'all'}`));
    
    const popularity = 30 + rng.nextInt(0, 70);
    const difficulty = 20 + rng.nextInt(0, 60);
    const volume = 5000 + rng.nextInt(0, 95000);
    const engagement = 2 + rng.nextInt(0, 18);
    
    return {
      tag,
      popularity,
      difficulty,
      category: this.categorizeTag(tag),
      volume,
      engagement,
      platforms: platform ? [platform] : this.getPlatformsForTag(tag, rng)
    };
  }

  private findRelevantCategory(topic: string): keyof typeof this.hashtagSeeds {
    const lowerTopic = topic.toLowerCase();
    
    if (lowerTopic.includes('food') || lowerTopic.includes('cook') || lowerTopic.includes('recipe')) return 'food';
    if (lowerTopic.includes('travel') || lowerTopic.includes('trip') || lowerTopic.includes('vacation')) return 'travel';
    if (lowerTopic.includes('fitness') || lowerTopic.includes('workout') || lowerTopic.includes('health')) return 'fitness';
    if (lowerTopic.includes('beauty') || lowerTopic.includes('makeup') || lowerTopic.includes('fashion')) return 'beauty';
    if (lowerTopic.includes('tech') || lowerTopic.includes('code') || lowerTopic.includes('software')) return 'tech';
    
    return 'lifestyle';
  }

  private generateTopicVariations(topic: string): string[] {
    const cleanTopic = topic.toLowerCase().replace(/\s+/g, '');
    return [
      `${cleanTopic}tips`,
      `${cleanTopic}inspiration`,
      `${cleanTopic}goals`
    ];
  }

  private categorizeTag(tag: string): HashtagSuggestion['category'] {
    if (['viral', 'trending', 'fyp', 'explore', 'popular', 'hot', 'new'].includes(tag)) {
      return 'trending';
    }
    if (tag.length > 15 || tag.includes('brand') || tag.includes('official')) {
      return 'branded';
    }
    if (tag.length < 6) {
      return 'general';
    }
    return 'niche';
  }

  private getPlatformsForTag(tag: string, rng: SeededRandom): string[] {
    const allPlatforms = ['instagram', 'tiktok', 'twitter', 'youtube'];
    
    if (['fyp', 'viral', 'trending'].includes(tag)) {
      return ['tiktok', 'instagram'];
    }
    if (tag.length < 8) {
      return allPlatforms;
    }
    
    // Deterministic platform selection
    const count = 2 + rng.nextInt(0, 2);
    return allPlatforms.slice(0, count);
  }
}

class LiveHashtagProvider implements HashtagProvider {
  private apiKeys: Record<string, string>;

  constructor(apiKeys: Record<string, string>) {
    this.apiKeys = apiKeys;
  }

  async researchHashtags(topic: string, platform?: string, limit?: number): Promise<HashtagResearchResult> {
    // In a real implementation, this would:
    // 1. Use platform APIs (Instagram Basic Display API, TikTok Research API, etc.)
    // 2. Aggregate data from hashtag research services
    // 3. Analyze real engagement metrics and trends
    // 4. Consider platform-specific hashtag behavior
    
    throw new Error(`Live hashtag research not implemented yet - use mock mode`);
  }

  async analyzeHashtagPerformance(tags: string[], platform: string): Promise<HashtagSuggestion[]> {
    throw new Error(`Live hashtag analysis not implemented yet - use mock mode`);
  }

  async getTrendingHashtags(platform?: string, category?: string): Promise<HashtagSuggestion[]> {
    throw new Error(`Live trending hashtags not implemented yet - use mock mode`);
  }

  async optimizeHashtagSet(tags: string[], platform: string): Promise<string[]> {
    throw new Error(`Live hashtag optimization not implemented yet - use mock mode`);
  }
}

// Factory function to create appropriate provider
export function createHashtagProvider(): HashtagProvider {
  const hasLiveKeys = process.env.INSTAGRAM_ACCESS_TOKEN || 
                     process.env.TIKTOK_RESEARCH_TOKEN || 
                     process.env.HASHTAG_API_KEY;

  if (hasLiveKeys) {
    const apiKeys = {
      instagram: process.env.INSTAGRAM_ACCESS_TOKEN || '',
      tiktok: process.env.TIKTOK_RESEARCH_TOKEN || '',
      hashtag: process.env.HASHTAG_API_KEY || ''
    };
    return new LiveHashtagProvider(apiKeys);
  }

  return new MockHashtagProvider();
}

export type { HashtagSuggestion, HashtagResearchResult, HashtagProvider };