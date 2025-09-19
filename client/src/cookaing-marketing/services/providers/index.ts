/**
 * Provider Factory & Registry for CookAIng Marketing Engine
 * Centralizes provider instantiation and status checking
 */
import type { ProviderStatus } from '../../types/ext';

// Content Enhancement Providers
import { MockImageGenProvider, OpenAIImageGenProvider, type IImageGenProvider } from './content/imageGenProvider';
import { MockVideoGenProvider, RunwayVideoGenProvider, type IVideoGenProvider } from './content/videoGenProvider';
import { MockTTSProvider, ElevenLabsTTSProvider, type ITTSProvider } from './content/ttsProvider';
import { MockRewriteProvider, ClaudeRewriteProvider, type IRewriteProvider } from './content/rewriteProvider';

// Intelligence Providers
import { MockCompetitorProvider, SocialListeningProvider, type ICompetitorProvider } from './intelligence/competitorProvider';
import { MockSentimentProvider, GoogleSentimentProvider, type ISentimentProvider } from './intelligence/sentimentProvider';

// Social Providers
import { MockSocialPublishProvider, BufferSocialProvider, type ISocialPublishProvider } from './social/socialPublishProvider';

// Compliance Providers
import { MockModerationProvider, OpenAIModerationProvider, type IModerationProvider } from './compliance/moderationProvider';

export interface IProviderRegistry {
  // Content Enhancement
  imageGen: IImageGenProvider;
  videoGen: IVideoGenProvider;
  tts: ITTSProvider;
  rewrite: IRewriteProvider;
  
  // Intelligence
  competitor: ICompetitorProvider;
  sentiment: ISentimentProvider;
  
  // Social
  socialPublish: ISocialPublishProvider;
  
  // Compliance
  moderation: IModerationProvider;
}

export class ProviderFactory {
  private static registry: IProviderRegistry | null = null;

  static getProviders(): IProviderRegistry {
    if (!this.registry) {
      this.registry = this.createProviders();
    }
    return this.registry;
  }

  private static createProviders(): IProviderRegistry {
    // Check for API keys in environment
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const elevenLabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const runwayKey = import.meta.env.VITE_RUNWAY_API_KEY;
    const googleCloudKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    const bufferToken = import.meta.env.VITE_BUFFER_ACCESS_TOKEN;

    return {
      // Content Enhancement - prefer real providers if keys available
      imageGen: openaiKey ? new OpenAIImageGenProvider(openaiKey) : new MockImageGenProvider(),
      videoGen: runwayKey ? new RunwayVideoGenProvider(runwayKey) : new MockVideoGenProvider(),
      tts: elevenLabsKey ? new ElevenLabsTTSProvider(elevenLabsKey) : new MockTTSProvider(),
      rewrite: anthropicKey ? new ClaudeRewriteProvider(anthropicKey) : new MockRewriteProvider(),
      
      // Intelligence - prefer real providers if keys available
      competitor: new MockCompetitorProvider(), // No real provider keys yet
      sentiment: googleCloudKey ? new GoogleSentimentProvider(googleCloudKey) : new MockSentimentProvider(),
      
      // Social - prefer real providers if tokens available
      socialPublish: bufferToken ? new BufferSocialProvider(bufferToken) : new MockSocialPublishProvider(),
      
      // Compliance - prefer real providers if keys available
      moderation: openaiKey ? new OpenAIModerationProvider(openaiKey) : new MockModerationProvider(),
    };
  }

  static async getAllProviderStatus(): Promise<ProviderStatus[]> {
    const providers = this.getProviders();
    const statuses: ProviderStatus[] = [];

    // Content Enhancement
    const imageGenStatus = await providers.imageGen.getStatus();
    statuses.push({
      name: 'image-generation',
      status: imageGenStatus.status,
      message: imageGenStatus.message,
      lastCheck: new Date(),
      features: ['AI-generated images', 'Multiple styles', 'Batch processing'],
    });

    const videoGenStatus = await providers.videoGen.getStatus();
    statuses.push({
      name: 'video-generation',
      status: videoGenStatus.status,
      message: videoGenStatus.message,
      lastCheck: new Date(),
      features: ['AI-generated videos', 'Template-based', 'Storyboard preview'],
    });

    const ttsStatus = await providers.tts.getStatus();
    statuses.push({
      name: 'text-to-speech',
      status: ttsStatus.status,
      message: ttsStatus.message,
      lastCheck: new Date(),
      features: ['Voice synthesis', 'Multiple voices', 'Custom pace'],
    });

    const rewriteStatus = await providers.rewrite.getStatus();
    statuses.push({
      name: 'content-rewrite',
      status: rewriteStatus.status,
      message: rewriteStatus.message,
      lastCheck: new Date(),
      features: ['Style variations', 'Tone adjustment', 'Quality scoring'],
    });

    // Intelligence
    const competitorStatus = await providers.competitor.getStatus();
    statuses.push({
      name: 'competitor-analysis',
      status: competitorStatus.status,
      message: competitorStatus.message,
      lastCheck: new Date(),
      features: ['Post monitoring', 'Trend analysis', 'Engagement tracking'],
    });

    const sentimentStatus = await providers.sentiment.getStatus();
    statuses.push({
      name: 'sentiment-analysis',
      status: sentimentStatus.status,
      message: sentimentStatus.message,
      lastCheck: new Date(),
      features: ['Emotion detection', 'Batch analysis', 'Score tracking'],
    });

    // Social
    const socialStatus = await providers.socialPublish.getStatus();
    statuses.push({
      name: 'social-publishing',
      status: socialStatus.status,
      message: socialStatus.message,
      lastCheck: new Date(),
      features: ['Multi-platform', 'Scheduling', 'Account management'],
    });

    // Compliance
    const moderationStatus = await providers.moderation.getStatus();
    statuses.push({
      name: 'content-moderation',
      status: moderationStatus.status,
      message: moderationStatus.message,
      lastCheck: new Date(),
      features: ['Toxicity detection', 'Spam filtering', 'Manual review'],
    });

    return statuses;
  }

  static reset(): void {
    this.registry = null;
  }
}

// Export provider interfaces for service layer
export type {
  IImageGenProvider,
  IVideoGenProvider,
  ITTSProvider,
  IRewriteProvider,
  ICompetitorProvider,
  ISentimentProvider,
  ISocialPublishProvider,
  IModerationProvider,
};

// Export all provider types for external use
export * from './content/imageGenProvider';
export * from './content/videoGenProvider';
export * from './content/ttsProvider';
export * from './content/rewriteProvider';
export * from './intelligence/competitorProvider';
export * from './intelligence/sentimentProvider';
export * from './social/socialPublishProvider';
export * from './compliance/moderationProvider';