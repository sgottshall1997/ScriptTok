/**
 * Content Enhancement Service - Orchestrates image/video/TTS/rewrite providers
 */
import { ProviderFactory } from './providers';
import type { 
  ImageGenRequest, 
  ImageGenResponse,
  VideoGenRequest,
  VideoGenResponse,
  TTSAudioRequest,
  TTSAudioResponse,
  RewriteRequest,
  RewriteResponse,
  ApiResponse 
} from '../types/ext';

export class ContentEnhancementService {
  private providers = ProviderFactory.getProviders();

  // Image Generation
  async generateImages(request: ImageGenRequest): Promise<ApiResponse<ImageGenResponse>> {
    try {
      const result = await this.providers.imageGen.generateImages(request);
      return {
        success: true,
        data: result,
        mode: result.mode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
        mode: 'mock',
      };
    }
  }

  // Video Generation
  async generateVideo(request: VideoGenRequest): Promise<ApiResponse<VideoGenResponse>> {
    try {
      const result = await this.providers.videoGen.generateVideo(request);
      return {
        success: true,
        data: result,
        mode: result.mode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed',
        mode: 'mock',
      };
    }
  }

  async checkVideoStatus(jobId: string): Promise<ApiResponse<VideoGenResponse>> {
    try {
      const result = await this.providers.videoGen.checkStatus(jobId);
      return {
        success: true,
        data: result,
        mode: result.mode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video status check failed',
        mode: 'mock',
      };
    }
  }

  // Text-to-Speech
  async generateAudio(request: TTSAudioRequest): Promise<ApiResponse<TTSAudioResponse>> {
    try {
      const result = await this.providers.tts.generateAudio(request);
      return {
        success: true,
        data: result,
        mode: result.mode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'TTS generation failed',
        mode: 'mock',
      };
    }
  }

  async getVoices(): Promise<ApiResponse<Array<{ id: string; name: string; language: string }>>> {
    try {
      const voices = await this.providers.tts.getVoices();
      return {
        success: true,
        data: voices,
        mode: 'mock', // Voices are static data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Voice listing failed',
        mode: 'mock',
      };
    }
  }

  // Content Rewriting
  async rewriteContent(request: RewriteRequest): Promise<ApiResponse<RewriteResponse>> {
    try {
      const result = await this.providers.rewrite.rewriteText(request);
      return {
        success: true,
        data: result,
        mode: result.mode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Content rewriting failed',
        mode: 'mock',
      };
    }
  }

  // Health check for all content enhancement providers
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      const [imageStatus, videoStatus, ttsStatus, rewriteStatus] = await Promise.all([
        this.providers.imageGen.getStatus(),
        this.providers.videoGen.getStatus(),
        this.providers.tts.getStatus(),
        this.providers.rewrite.getStatus(),
      ]);

      return {
        success: true,
        data: {
          image_generation: imageStatus,
          video_generation: videoStatus,
          text_to_speech: ttsStatus,
          content_rewrite: rewriteStatus,
        },
        mode: 'live', // Status checks are real
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        mode: 'mock',
      };
    }
  }
}