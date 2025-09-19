// Social Media Publishing Provider
// Handles direct platform publishing to IG/FB/TikTok/X/YT with deterministic mock mode

interface SocialPublishPayload {
  caption: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
}

interface SocialPublishResult {
  remoteId: string;
  status: 'draft' | 'queued' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  errorMessage?: string;
}

interface SocialProvider {
  publishPost(platform: string, payload: SocialPublishPayload, scheduledAt?: Date): Promise<SocialPublishResult>;
  getPostStatus(platform: string, remoteId: string): Promise<SocialPublishResult>;
  deletePost(platform: string, remoteId: string): Promise<boolean>;
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

class MockSocialProvider implements SocialProvider {
  private mockDelay = 1000; // Simulate API latency

  async publishPost(platform: string, payload: SocialPublishPayload, scheduledAt?: Date): Promise<SocialPublishResult> {
    await new Promise(resolve => setTimeout(resolve, this.mockDelay));
    
    // Create deterministic seed from platform and payload
    const seedInput = `${platform}:${payload.caption}:${JSON.stringify(payload.hashtags || [])}:${scheduledAt?.toISOString() || 'now'}`;
    const rng = new SeededRandom(createSeed(seedInput));
    
    // Generate deterministic mock remote ID (no real timestamp)
    const platformCode = platform.slice(0, 2).toUpperCase();
    const deterministicId = rng.nextInt(10000000, 99999999).toString();
    const remoteId = `${platformCode}_MOCK_${deterministicId}`;
    
    // Deterministic status transitions: draft → queued → published
    const now = new Date('2024-01-01T12:00:00Z'); // Fixed reference time for determinism
    const isScheduled = scheduledAt && scheduledAt > now;
    let status: SocialPublishResult['status'];
    
    // Deterministic failure simulation (5% based on seed)
    const shouldFail = rng.next() < 0.05;
    if (shouldFail) {
      status = 'failed';
    } else if (isScheduled) {
      status = 'queued';
    } else {
      status = 'published';
    }

    // Generate deterministic publish time if published
    let publishedAt: Date | undefined;
    if (!isScheduled && status === 'published') {
      const hoursOffset = rng.nextInt(1, 24); // 1-24 hours ago
      publishedAt = new Date(now.getTime() - (hoursOffset * 60 * 60 * 1000));
    }

    const result: SocialPublishResult = {
      remoteId,
      status,
      scheduledAt: isScheduled ? scheduledAt : undefined,
      publishedAt
    };

    if (shouldFail) {
      const errorMessages = [
        `Mock ${platform} API error: Rate limit exceeded`,
        `Mock ${platform} API error: Invalid credentials`,
        `Mock ${platform} API error: Content violates policy`
      ];
      result.errorMessage = rng.choice(errorMessages);
    }

    return result;
  }

  async getPostStatus(platform: string, remoteId: string): Promise<SocialPublishResult> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Deterministic status based on remoteId
    const rng = new SeededRandom(createSeed(remoteId));
    
    // Most posts eventually get published
    const finalStatus = rng.next() < 0.9 ? 'published' : 'failed';
    
    // Generate deterministic publish time if published
    let publishedAt: Date | undefined;
    if (finalStatus === 'published') {
      const baseTime = new Date('2024-01-01T12:00:00Z');
      const hoursOffset = rng.nextInt(0, 24); // 0-24 hours from base
      publishedAt = new Date(baseTime.getTime() + (hoursOffset * 60 * 60 * 1000));
    }
    
    return {
      remoteId,
      status: finalStatus,
      publishedAt,
      errorMessage: finalStatus === 'failed' ? 'Mock processing error' : undefined
    };
  }

  async deletePost(platform: string, remoteId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Deterministic deletion success based on remoteId
    const rng = new SeededRandom(createSeed(remoteId));
    return rng.next() > 0.05; // 95% success rate
  }
}

class LiveSocialProvider implements SocialProvider {
  private apiKeys: Record<string, string>;

  constructor(apiKeys: Record<string, string>) {
    this.apiKeys = apiKeys;
  }

  async publishPost(platform: string, payload: SocialPublishPayload, scheduledAt?: Date): Promise<SocialPublishResult> {
    // In a real implementation, this would:
    // 1. Route to platform-specific APIs (Meta Graph API, Twitter API v2, TikTok API, YouTube API)
    // 2. Handle OAuth tokens and refresh flows
    // 3. Format payload according to platform requirements
    // 4. Handle rate limiting and retries
    
    throw new Error(`Live ${platform} publishing not implemented yet - use mock mode`);
  }

  async getPostStatus(platform: string, remoteId: string): Promise<SocialPublishResult> {
    throw new Error(`Live ${platform} status checking not implemented yet - use mock mode`);
  }

  async deletePost(platform: string, remoteId: string): Promise<boolean> {
    throw new Error(`Live ${platform} deletion not implemented yet - use mock mode`);
  }
}

// Factory function to create appropriate provider
export function createSocialProvider(): SocialProvider {
  const hasLiveKeys = process.env.META_ACCESS_TOKEN || 
                     process.env.TWITTER_API_KEY || 
                     process.env.TIKTOK_CLIENT_KEY ||
                     process.env.YOUTUBE_API_KEY;

  if (hasLiveKeys) {
    const apiKeys = {
      meta: process.env.META_ACCESS_TOKEN || '',
      twitter: process.env.TWITTER_API_KEY || '',
      tiktok: process.env.TIKTOK_CLIENT_KEY || '',
      youtube: process.env.YOUTUBE_API_KEY || ''
    };
    return new LiveSocialProvider(apiKeys);
  }

  return new MockSocialProvider();
}

export type { SocialPublishPayload, SocialPublishResult, SocialProvider };