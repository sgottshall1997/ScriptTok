/**
 * Image Generation Provider - AI image creation
 * Supports live (OpenAI Images/Stable Diffusion) and mock modes
 */

export interface ImageGenInput {
  prompt: string;
  count?: number;
  style?: 'realistic' | 'studio' | 'illustration' | 'artistic' | 'product';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  brandGuidelines?: {
    colors: string[];
    style: string;
    restrictions: string[];
  };
}

export interface ImageGenOutput {
  images: Array<{
    url: string;
    thumbUrl: string;
    prompt: string;
    revisedPrompt?: string;
    metadata: {
      size: string;
      style: string;
      seed?: number;
      model?: string;
    };
  }>;
  mode: 'live' | 'mock';
  provider: string;
  metadata: {
    processingTime: number;
    totalImages: number;
    promptTokens?: number;
    estimatedCost?: number;
  };
}

export class ImageGenProvider {
  private hasLiveKeys(): boolean {
    return !!(process.env.OPENAI_API_KEY || process.env.STABILITY_API_KEY || process.env.MIDJOURNEY_API_KEY);
  }

  async generateImages(input: ImageGenInput): Promise<ImageGenOutput> {
    const startTime = Date.now();

    if (this.hasLiveKeys()) {
      return this.runLiveGeneration(input, startTime);
    } else {
      return this.runMockGeneration(input, startTime);
    }
  }

  private async runLiveGeneration(input: ImageGenInput, startTime: number): Promise<ImageGenOutput> {
    // TODO: Implement live OpenAI Images/Stable Diffusion integration
    // For now, fall back to mock mode even if keys are present
    return this.runMockGeneration(input, startTime);
  }

  private async runMockGeneration(input: ImageGenInput, startTime: number): Promise<ImageGenOutput> {
    const count = Math.min(input.count || 3, 10); // Safety limit
    const size = input.size || '1024x1024';
    
    // Simulate processing delay based on count and complexity
    const baseDelay = 2000;
    const countDelay = count * 500;
    const complexityDelay = input.prompt.length * 10;
    await new Promise(resolve => setTimeout(resolve, baseDelay + countDelay + complexityDelay));

    const images = Array.from({ length: count }, (_, index) => {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = this.generateMockImageUrl(input.prompt, size, input.style || 'realistic', seed);
      const thumbUrl = this.generateMockImageUrl(input.prompt, '256x256', input.style || 'realistic', seed);
      
      return {
        url: imageUrl,
        thumbUrl: thumbUrl,
        prompt: input.prompt,
        revisedPrompt: this.enhancePrompt(input.prompt, input.style),
        metadata: {
          size,
          style: input.style || 'realistic',
          seed,
          model: 'mock-diffusion-v3'
        }
      };
    });

    const processingTime = Date.now() - startTime;

    return {
      images,
      mode: 'mock',
      provider: 'mock-image-gen',
      metadata: {
        processingTime,
        totalImages: count,
        promptTokens: input.prompt.split(' ').length,
        estimatedCost: count * 0.02 // Mock cost per image
      }
    };
  }

  private generateMockImageUrl(prompt: string, size: string, style: string, seed: number): string {
    // Generate a predictable but unique URL for each image
    const hash = this.simpleHash(prompt + size + style + seed);
    const baseUrl = 'https://picsum.photos';
    const [width, height] = size.split('x');
    
    // Add style-specific parameters to make URLs more realistic
    const styleParams = this.getStyleParams(style);
    
    return `${baseUrl}/${width}/${height}?random=${hash}${styleParams}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getStyleParams(style: string): string {
    const styleMap: Record<string, string> = {
      'realistic': '&blur=0',
      'studio': '&grayscale=0',
      'illustration': '&blur=1',
      'artistic': '&blur=2',
      'product': '&grayscale=0&blur=0'
    };
    
    return styleMap[style] || '';
  }

  private enhancePrompt(originalPrompt: string, style?: string): string {
    const styleEnhancements: Record<string, string> = {
      'realistic': 'photorealistic, high detail, professional photography',
      'studio': 'studio lighting, clean background, professional product shot',
      'illustration': 'digital illustration, artistic, stylized',
      'artistic': 'artistic interpretation, creative, expressive',
      'product': 'product photography, commercial, clean, high-quality'
    };

    const enhancement = styleEnhancements[style || 'realistic'];
    return `${originalPrompt}, ${enhancement}`;
  }

  async getModelCapabilities(): Promise<{
    maxImages: number;
    supportedSizes: string[];
    supportedStyles: string[];
    averageProcessingTime: number;
  }> {
    return {
      maxImages: 10,
      supportedSizes: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
      supportedStyles: ['realistic', 'studio', 'illustration', 'artistic', 'product'],
      averageProcessingTime: 3000 // ms per image
    };
  }

  async validatePrompt(prompt: string): Promise<{
    isValid: boolean;
    issues?: string[];
    suggestions?: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (prompt.length < 10) {
      issues.push('Prompt is too short');
      suggestions.push('Add more descriptive details');
    }

    if (prompt.length > 1000) {
      issues.push('Prompt is too long');
      suggestions.push('Simplify the description');
    }

    // Check for potentially problematic content
    const problematicTerms = ['nsfw', 'explicit', 'violent', 'copyright'];
    const hasProblematicContent = problematicTerms.some(term => 
      prompt.toLowerCase().includes(term)
    );

    if (hasProblematicContent) {
      issues.push('Prompt contains potentially problematic content');
      suggestions.push('Remove inappropriate terms and focus on creative description');
    }

    return {
      isValid: issues.length === 0,
      issues: issues.length > 0 ? issues : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
}