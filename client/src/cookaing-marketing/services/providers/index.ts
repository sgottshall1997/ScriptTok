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
    // SECURITY: Force all client-side providers to mock mode to prevent API key exposure
    // Live providers should only be used server-side where secrets can be safely stored
    return {
      // Content Enhancement - using mock providers only on client
      imageGen: new MockImageGenProvider(),
      videoGen: new MockVideoGenProvider(),
      tts: new MockTTSProvider(),
      rewrite: new MockRewriteProvider(),
      
      // Intelligence - using mock providers only on client
      competitor: new MockCompetitorProvider(),
      sentiment: new MockSentimentProvider(),
      
      // Social - using mock providers only on client
      socialPublish: new MockSocialPublishProvider(),
      
      // Compliance - using mock providers only on client
      moderation: new MockModerationProvider(),
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