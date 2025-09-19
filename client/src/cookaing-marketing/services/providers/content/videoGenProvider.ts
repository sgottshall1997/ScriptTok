/**
 * Video Generation Provider Interface & Mock Implementation
 */
import type { VideoGenRequest, VideoGenResponse } from '../../../types/ext';

export interface IVideoGenProvider {
  generateVideo(request: VideoGenRequest): Promise<VideoGenResponse>;
  checkStatus(jobId: string): Promise<VideoGenResponse>;
  getStatus(): Promise<{ status: 'ok' | 'mock_mode' | 'error'; message?: string }>;
}

export class MockVideoGenProvider implements IVideoGenProvider {
  private jobs = new Map<string, VideoGenResponse>();

  async generateVideo(request: VideoGenRequest): Promise<VideoGenResponse> {
    const jobId = `mock-video-${Date.now()}`;
    
    const response: VideoGenResponse = {
      mode: 'mock',
      status: 'processing',
      provider: 'mock-video-gen',
      jobId,
    };
    
    this.jobs.set(jobId, response);
    
    // Simulate processing completion after 3 seconds
    setTimeout(() => {
      const completed: VideoGenResponse = {
        ...response,
        status: 'completed',
        videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        thumbnailUrl: `https://picsum.photos/640/360?random=${Date.now()}`,
        storyboard: [
          `https://picsum.photos/160/90?random=${Date.now()}-1`,
          `https://picsum.photos/160/90?random=${Date.now()}-2`,
          `https://picsum.photos/160/90?random=${Date.now()}-3`,
        ],
      };
      this.jobs.set(jobId, completed);
    }, 3000);
    
    return response;
  }

  async checkStatus(jobId: string): Promise<VideoGenResponse> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    return job;
  }

  async getStatus() {
    return { status: 'mock_mode' as const, message: 'Using mock video generation' };
  }
}

export class RunwayVideoGenProvider implements IVideoGenProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async generateVideo(request: VideoGenRequest): Promise<VideoGenResponse> {
    if (!this.apiKey) {
      throw new Error('Runway API key not configured');
    }
    
    // TODO: Implement real Runway ML integration
    throw new Error('Runway video generation not yet implemented');
  }

  async checkStatus(jobId: string): Promise<VideoGenResponse> {
    throw new Error('Runway status check not yet implemented');
  }

  async getStatus() {
    if (!this.apiKey) {
      return { status: 'error' as const, message: 'API key missing' };
    }
    return { status: 'ok' as const };
  }
}