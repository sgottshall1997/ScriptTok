/**
 * Image Generation Provider Interface & Mock Implementation
 */
import type { ImageGenRequest, ImageGenResponse } from '../../../types/ext';

export interface IImageGenProvider {
  generateImages(request: ImageGenRequest): Promise<ImageGenResponse>;
  getStatus(): Promise<{ status: 'ok' | 'mock_mode' | 'error'; message?: string }>;
}

export class MockImageGenProvider implements IImageGenProvider {
  async generateImages(request: ImageGenRequest): Promise<ImageGenResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { prompt, style = 'realistic', count = 1 } = request;
    
    const mockImages = [];
    for (let i = 0; i < count; i++) {
      mockImages.push({
        url: `https://picsum.photos/512/512?random=${Date.now()}-${i}`,
        thumbnailUrl: `https://picsum.photos/256/256?random=${Date.now()}-${i}`,
        prompt,
        style,
      });
    }
    
    return {
      mode: 'mock',
      images: mockImages,
      provider: 'mock-image-gen',
      requestId: `mock-${Date.now()}`,
    };
  }

  async getStatus() {
    return { status: 'mock_mode' as const, message: 'Using mock image generation' };
  }
}

export class OpenAIImageGenProvider implements IImageGenProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async generateImages(request: ImageGenRequest): Promise<ImageGenResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // TODO: Implement real OpenAI DALL-E integration
    throw new Error('OpenAI image generation not yet implemented');
  }

  async getStatus() {
    if (!this.apiKey) {
      return { status: 'error' as const, message: 'API key missing' };
    }
    return { status: 'ok' as const };
  }
}