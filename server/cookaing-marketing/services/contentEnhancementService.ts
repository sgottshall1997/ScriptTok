/**
 * Server Content Enhancement Service - Provides mock responses for API routes
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  mode: 'mock' | 'live';
}

export interface ImageGenRequest {
  prompt: string;
  style?: string;
  size?: string;
  count?: number;
  versionId?: number;
}

export interface ImageGenResponse {
  mode: 'mock' | 'live';
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    prompt: string;
    style?: string;
  }>;
  provider: string;
  requestId?: string;
}

export interface VideoGenRequest {
  templateId: string;
  assets: string[];
  duration?: number;
  style?: string;
  versionId?: number;
}

export interface VideoGenResponse {
  mode: 'mock' | 'live';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  storyboard?: string[];
  provider: string;
  jobId: string;
}

export interface TTSAudioRequest {
  text: string;
  voice?: string;
  pace?: number;
  language?: string;
  versionId?: number;
}

export interface TTSAudioResponse {
  mode: 'mock' | 'live';
  audioUrl: string;
  duration?: number;
  voice: string;
  provider: string;
  format: string;
}

export interface RewriteRequest {
  text: string;
  style: 'casual' | 'professional' | 'enthusiastic' | 'authoritative';
  constraints?: string[];
  versionId?: number;
}

export interface RewriteResponse {
  mode: 'mock' | 'live';
  variations: Array<{
    text: string;
    style: string;
    score?: number;
  }>;
  provider: string;
  originalLength: number;
  avgLength: number;
}

export class ContentEnhancementService {
  // Image Generation
  async generateImages(request: ImageGenRequest): Promise<ApiResponse<ImageGenResponse>> {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const images = Array.from({ length: request.count || 1 }, (_, i) => ({
        url: `https://picsum.photos/1024/1024?random=${Date.now()}-${i}`,
        thumbnailUrl: `https://picsum.photos/256/256?random=${Date.now()}-${i}`,
        prompt: request.prompt,
        style: request.style || 'natural'
      }));

      return {
        success: true,
        data: {
          mode: 'mock',
          images,
          provider: 'MockImageGen',
          requestId: `img_${Date.now()}`
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
        mode: 'mock'
      };
    }
  }

  // Video Generation
  async generateVideo(request: VideoGenRequest): Promise<ApiResponse<VideoGenResponse>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        success: true,
        data: {
          mode: 'mock',
          status: 'completed',
          videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_${Date.now()}.mp4`,
          thumbnailUrl: `https://picsum.photos/640/360?random=${Date.now()}`,
          storyboard: ['frame1.jpg', 'frame2.jpg', 'frame3.jpg'],
          provider: 'MockVideoGen',
          jobId: `vid_${Date.now()}`
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed',
        mode: 'mock'
      };
    }
  }

  async checkVideoStatus(jobId: string): Promise<ApiResponse<VideoGenResponse>> {
    try {
      return {
        success: true,
        data: {
          mode: 'mock',
          status: 'completed',
          videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_${jobId}.mp4`,
          provider: 'MockVideoGen',
          jobId
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video status check failed',
        mode: 'mock'
      };
    }
  }

  // Text-to-Speech
  async generateAudio(request: TTSAudioRequest): Promise<ApiResponse<TTSAudioResponse>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return {
        success: true,
        data: {
          mode: 'mock',
          audioUrl: `https://www.soundjay.com/misc/sounds/bell-ringing-${Date.now()}.wav`,
          duration: request.text.length * 0.1, // Rough estimate
          voice: request.voice || 'nova',
          provider: 'MockTTS',
          format: 'wav'
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS generation failed',
        mode: 'mock'
      };
    }
  }

  async getVoices(): Promise<ApiResponse<Array<{ id: string; name: string; language: string }>>> {
    try {
      const voices = [
        { id: 'nova', name: 'Nova', language: 'en-US' },
        { id: 'shimmer', name: 'Shimmer', language: 'en-US' },
        { id: 'echo', name: 'Echo', language: 'en-US' },
        { id: 'fable', name: 'Fable', language: 'en-US' },
        { id: 'onyx', name: 'Onyx', language: 'en-US' },
        { id: 'alloy', name: 'Alloy', language: 'en-US' }
      ];
      
      return {
        success: true,
        data: voices,
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Voice listing failed',
        mode: 'mock'
      };
    }
  }

  // Content Rewriting
  async rewriteContent(request: RewriteRequest): Promise<ApiResponse<RewriteResponse>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const variations = [
        {
          text: `[${request.style}] ${request.text} (rewritten variation 1)`,
          style: request.style,
          score: Math.random() * 100
        },
        {
          text: `[${request.style}] ${request.text} (rewritten variation 2)`,
          style: request.style,
          score: Math.random() * 100
        }
      ];
      
      return {
        success: true,
        data: {
          mode: 'mock',
          variations,
          provider: 'MockRewriter',
          originalLength: request.text.length,
          avgLength: variations.reduce((sum, v) => sum + v.text.length, 0) / variations.length
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content rewriting failed',
        mode: 'mock'
      };
    }
  }

  // Health check
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      return {
        success: true,
        data: {
          image_generation: { status: 'mock_mode', message: 'Using mock image generation' },
          video_generation: { status: 'mock_mode', message: 'Using mock video generation' },
          text_to_speech: { status: 'mock_mode', message: 'Using mock TTS' },
          content_rewrite: { status: 'mock_mode', message: 'Using mock content rewriting' }
        },
        mode: 'mock'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        mode: 'mock'
      };
    }
  }
}