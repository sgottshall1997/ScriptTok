// Optimal Timing Intelligence Provider
// Analyzes and predicts best posting times with deterministic mock mode

interface TimeWindow {
  startTime: string; // HH:MM format
  endTime: string;
  score: number; // 1-100 effectiveness score
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  timezone: string;
}

interface OptimalTimingResult {
  platform: string;
  segmentId?: string;
  windows: TimeWindow[];
  bestTimes: string[]; // Top 3 times as HH:MM
  generatedAt: Date;
  dataSource: 'historical' | 'predicted' | 'industry_average';
}

interface TimingInsights {
  peakHours: number[];
  quietHours: number[];
  weekendVsWeekday: {
    weekend: number; // Average score
    weekday: number;
  };
  platformOptimal: Record<string, number[]>; // Platform -> optimal hours
}

interface TimingProvider {
  getOptimalTimes(platform: string, segmentId?: string): Promise<OptimalTimingResult>;
  analyzeHistoricalTiming(platform: string, days?: number): Promise<TimingInsights>;
  predictBestSlots(platform: string, contentType?: string): Promise<TimeWindow[]>;
  getTimezoneRecommendations(platform: string, targetAudience?: string): Promise<string[]>;
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

class MockTimingProvider implements TimingProvider {
  private mockDelay = 700;
  
  // Deterministic optimal times based on platform and real industry data
  private platformOptimalHours: Record<string, number[]> = {
    instagram: [8, 9, 12, 13, 17, 18, 19, 20], // 8-9am, 12-1pm, 5-8pm
    tiktok: [9, 12, 16, 17, 18, 19, 20, 21], // 9am, 12pm, 4-9pm
    twitter: [8, 9, 12, 13, 17, 18, 19], // 8-9am, 12-1pm, 5-7pm
    facebook: [9, 10, 13, 14, 15, 20, 21], // 9-10am, 1-3pm, 8-9pm
    youtube: [14, 15, 16, 17, 18, 19, 20], // 2-8pm
    linkedin: [8, 9, 10, 11, 12, 17, 18] // Business hours focused
  };

  private timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'UTC'];

  async getOptimalTimes(platform: string, segmentId?: string): Promise<OptimalTimingResult> {
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));
    
    const optimalHours = this.platformOptimalHours[platform.toLowerCase()] || this.platformOptimalHours.instagram;
    const windows = this.generateTimeWindows(platform, optimalHours, segmentId);
    const bestTimes = this.extractBestTimes(windows);
    
    // Generate deterministic timestamp
    const rng = new SeededRandom(createSeed(`timestamp:${platform}:${segmentId || 'default'}`));
    const baseTime = new Date('2024-01-01T12:00:00Z');
    const hourOffset = rng.nextInt(0, 24);
    const deterministicTimestamp = new Date(baseTime.getTime() + (hourOffset * 60 * 60 * 1000));

    return {
      platform,
      segmentId,
      windows,
      bestTimes,
      generatedAt: deterministicTimestamp,
      dataSource: segmentId ? 'historical' : 'industry_average'
    };
  }

  async analyzeHistoricalTiming(platform: string, days: number = 30): Promise<TimingInsights> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const optimalHours = this.platformOptimalHours[platform.toLowerCase()] || this.platformOptimalHours.instagram;
    
    // Generate insights based on platform characteristics
    const peakHours = optimalHours.slice(0, 4);
    const quietHours = [0, 1, 2, 3, 4, 5, 22, 23].filter(h => !optimalHours.includes(h));
    
    return {
      peakHours,
      quietHours,
      weekendVsWeekday: {
        weekend: platform === 'instagram' || platform === 'tiktok' ? 85 : 65,
        weekday: platform === 'linkedin' ? 90 : 75
      },
      platformOptimal: {
        [platform]: optimalHours
      }
    };
  }

  async predictBestSlots(platform: string, contentType?: string): Promise<TimeWindow[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const baseOptimal = this.platformOptimalHours[platform.toLowerCase()] || this.platformOptimalHours.instagram;
    
    // Adjust based on content type
    let adjustedHours = [...baseOptimal];
    
    if (contentType) {
      switch (contentType.toLowerCase()) {
        case 'educational':
          adjustedHours = adjustedHours.filter(h => h < 18); // Favor morning/afternoon
          break;
        case 'entertainment':
          adjustedHours = adjustedHours.filter(h => h >= 17 || h <= 10); // Evening/morning
          break;
        case 'news':
          adjustedHours = [7, 8, 9, 12, 17, 18]; // News consumption times
          break;
      }
    }
    
    return this.generateTimeWindows(platform, adjustedHours);
  }

  async getTimezoneRecommendations(platform: string, targetAudience?: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock timezone recommendations based on audience
    if (targetAudience?.toLowerCase().includes('global')) {
      return this.timezones;
    }
    
    if (targetAudience?.toLowerCase().includes('us')) {
      return ['America/New_York', 'America/Chicago', 'America/Los_Angeles'];
    }
    
    if (targetAudience?.toLowerCase().includes('europe')) {
      return ['Europe/London', 'Europe/Paris', 'Europe/Berlin'];
    }
    
    // Default to UTC and major timezones
    return ['UTC', 'America/New_York', 'Europe/London'];
  }

  private generateTimeWindows(platform: string, optimalHours: number[], segmentId?: string): TimeWindow[] {
    const windows: TimeWindow[] = [];
    const rng = new SeededRandom(createSeed(`${platform}:${segmentId || 'default'}`));
    
    // Generate deterministic windows for each day of the week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayMultiplier = this.getDayMultiplier(platform, dayOfWeek);
      
      optimalHours.forEach((hour, index) => {
        // Deterministic base score based on hour position in optimal array
        const baseScore = 60 + (index * 5) + rng.nextInt(0, 20);
        const score = Math.min(100, Math.floor(baseScore * dayMultiplier));
        
        windows.push({
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${hour.toString().padStart(2, '0')}:59`,
          score,
          dayOfWeek,
          timezone: 'UTC'
        });
      });
    }
    
    // Sort by score for consistent ordering
    return windows.sort((a, b) => b.score - a.score);
  }

  private getDayMultiplier(platform: string, dayOfWeek: number): number {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return isWeekend ? 0.6 : 1.2; // Business platform
      case 'instagram':
      case 'tiktok':
        return isWeekend ? 1.3 : 1.0; // Social platforms peak on weekends
      case 'twitter':
        return isWeekend ? 0.9 : 1.1; // News/discussion platform
      case 'youtube':
        return isWeekend ? 1.2 : 1.0; // Entertainment peak on weekends
      default:
        return 1.0;
    }
  }

  private extractBestTimes(windows: TimeWindow[]): string[] {
    // Group by time and average scores across days
    const timeScores = new Map<string, number[]>();
    
    windows.forEach(window => {
      const time = window.startTime;
      if (!timeScores.has(time)) {
        timeScores.set(time, []);
      }
      timeScores.get(time)!.push(window.score);
    });
    
    // Calculate average scores
    const avgScores = new Map<string, number>();
    timeScores.forEach((scores, time) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      avgScores.set(time, avg);
    });
    
    // Return top 3 times deterministically
    return Array.from(avgScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);
  }
}

class LiveTimingProvider implements TimingProvider {
  private apiKeys: Record<string, string>;

  constructor(apiKeys: Record<string, string>) {
    this.apiKeys = apiKeys;
  }

  async getOptimalTimes(platform: string, segmentId?: string): Promise<OptimalTimingResult> {
    // In a real implementation, this would:
    // 1. Analyze historical engagement data from platform APIs
    // 2. Consider audience demographics and geographic distribution
    // 3. Factor in content type and campaign performance
    // 4. Use machine learning to predict optimal posting times
    // 5. Consider competitor posting patterns
    
    throw new Error(`Live timing analysis not implemented yet - use mock mode`);
  }

  async analyzeHistoricalTiming(platform: string, days?: number): Promise<TimingInsights> {
    throw new Error(`Live historical timing analysis not implemented yet - use mock mode`);
  }

  async predictBestSlots(platform: string, contentType?: string): Promise<TimeWindow[]> {
    throw new Error(`Live timing prediction not implemented yet - use mock mode`);
  }

  async getTimezoneRecommendations(platform: string, targetAudience?: string): Promise<string[]> {
    throw new Error(`Live timezone recommendations not implemented yet - use mock mode`);
  }
}

// Factory function to create appropriate provider
export function createTimingProvider(): TimingProvider {
  const hasLiveKeys = process.env.ANALYTICS_API_KEY || 
                     process.env.FACEBOOK_INSIGHTS_TOKEN || 
                     process.env.INSTAGRAM_INSIGHTS_TOKEN;

  if (hasLiveKeys) {
    const apiKeys = {
      analytics: process.env.ANALYTICS_API_KEY || '',
      facebook: process.env.FACEBOOK_INSIGHTS_TOKEN || '',
      instagram: process.env.INSTAGRAM_INSIGHTS_TOKEN || ''
    };
    return new LiveTimingProvider(apiKeys);
  }

  return new MockTimingProvider();
}

export type { TimeWindow, OptimalTimingResult, TimingInsights, TimingProvider };