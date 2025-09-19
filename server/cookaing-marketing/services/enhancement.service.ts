/**
 * Enhancement Service - Orchestrates content enhancement operations
 * Coordinates providers, storage, and post-processing for all enhancement types
 */

import { RewriteProvider, type RewriteInput } from './providers/rewrite.provider';
import { TTSProvider, type TTSInput } from './providers/tts.provider';
import { ImageGenProvider, type ImageGenInput } from './providers/imageGen.provider';
import { VideoGenProvider, type VideoGenInput } from './providers/videoGen.provider';
import {
  createEnhancement,
  upsertMediaAsset,
  persistOutputs,
  getEnhancementById,
  type CreateEnhancementInput
} from '../db/storage.enhance';
import { db } from '../../db';
import { eq } from 'drizzle-orm';
import { contentVersions } from '../../../shared/schema';
import { sanitizeHTML, signUrl } from './postprocess.enhance';

export interface EnhancementResult<T = any> {
  enhancement: {
    id: number;
    status: string;
    provider: string;
    createdAt: Date;
  };
  outputs: T;
  mode: 'live' | 'mock';
  metadata: {
    processingTime: number;
    versionId: number;
  };
}

export class EnhancementService {
  private rewriteProvider = new RewriteProvider();
  private ttsProvider = new TTSProvider();
  private imageProvider = new ImageGenProvider();
  private videoProvider = new VideoGenProvider();

  /**
   * Run content rewriting enhancement
   */
  async runRewrite(
    versionId: number,
    options: {
      style?: 'professional' | 'casual' | 'engaging' | 'formal' | 'creative';
      length?: 'shorter' | 'longer' | 'same';
      voiceProfileId?: number;
      constraints?: string[];
    }
  ): Promise<EnhancementResult<{
    originalText: string;
    rewrittenText: string;
    changes: Array<{ type: string; description: string }>;
    wordCount: { original: number; rewritten: number };
    previewText: string;
  }>> {
    const startTime = Date.now();

    try {
      // Load content version
      const [version] = await db.select()
        .from(contentVersions)
        .where(eq(contentVersions.id, versionId));

      if (!version) {
        throw new Error(`Content version ${versionId} not found`);
      }

      // Extract text from payload
      const payloadText = this.extractTextFromPayload(version.payloadJson);
      if (!payloadText) {
        throw new Error('No text content found in version payload');
      }

      // Create enhancement record
      const enhancement = await createEnhancement({
        versionId,
        enhancement: 'rewrite',
        inputs: {
          style: options.style,
          length: options.length,
          voiceProfileId: options.voiceProfileId,
          constraints: options.constraints,
          originalWordCount: payloadText.split(/\s+/).length
        }
      });

      // Get brand voice from version metadata if available
      const brandVoice = version.metadataJson?.brandVoice;

      // Run rewrite
      const rewriteInput: RewriteInput = {
        text: payloadText,
        style: options.style,
        length: options.length,
        voiceProfileId: options.voiceProfileId,
        constraints: options.constraints,
        brandVoice
      };

      const result = await this.rewriteProvider.rewrite(rewriteInput);

      // Sanitize the rewritten text
      const sanitizedText = sanitizeHTML(result.rewrittenText);

      // Prepare outputs
      const outputs = {
        originalText: result.originalText,
        rewrittenText: sanitizedText,
        changes: result.changes,
        wordCount: result.wordCount,
        provider: result.provider,
        metadata: result.metadata
      };

      // Persist outputs
      await persistOutputs(enhancement.id!, outputs);

      const processingTime = Date.now() - startTime;

      return {
        enhancement: {
          id: enhancement.id!,
          status: 'completed',
          provider: result.provider,
          createdAt: enhancement.createdAt!
        },
        outputs: {
          ...outputs,
          previewText: sanitizedText.substring(0, 200) + (sanitizedText.length > 200 ? '...' : '')
        },
        mode: result.mode,
        metadata: {
          processingTime,
          versionId
        }
      };

    } catch (error) {
      throw new Error(`Rewrite enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run text-to-speech enhancement
   */
  async runTTS(
    versionId: number,
    options: {
      voice: 'male' | 'female' | 'neutral' | string;
      speed?: 'slow' | 'normal' | 'fast';
      scriptSource?: 'payload' | 'custom';
      customText?: string;
    }
  ): Promise<EnhancementResult<{
    audioUrl: string;
    duration: number;
    format: string;
    metadata: any;
  }>> {
    const startTime = Date.now();

    try {
      // Load content version
      const [version] = await db.select()
        .from(contentVersions)
        .where(eq(contentVersions.id, versionId));

      if (!version) {
        throw new Error(`Content version ${versionId} not found`);
      }

      // Get text to synthesize
      let textToSynthesize: string;
      if (options.scriptSource === 'custom' && options.customText) {
        textToSynthesize = options.customText;
      } else {
        textToSynthesize = this.extractTextFromPayload(version.payloadJson);
        if (!textToSynthesize) {
          throw new Error('No text content found in version payload');
        }
      }

      // Create enhancement record
      const enhancement = await createEnhancement({
        versionId,
        enhancement: 'tts',
        inputs: {
          voice: options.voice,
          speed: options.speed,
          scriptSource: options.scriptSource,
          textLength: textToSynthesize.length,
          customText: options.scriptSource === 'custom' ? options.customText : undefined
        }
      });

      // Run TTS
      const ttsInput: TTSInput = {
        text: textToSynthesize,
        voice: options.voice,
        speed: options.speed || 'normal'
      };

      const result = await this.ttsProvider.synthesize(ttsInput);

      // Create media asset for the audio
      const mediaAsset = await upsertMediaAsset({
        type: 'audio',
        url: result.audioUrl,
        metadata: {
          duration: result.duration,
          format: result.format,
          voice: options.voice,
          speed: options.speed,
          ...result.metadata
        }
      });

      // Prepare outputs
      const outputs = {
        audioUrl: result.audioUrl,
        duration: result.duration,
        format: result.format,
        provider: result.provider,
        mediaAssetId: mediaAsset.id,
        metadata: result.metadata
      };

      // Persist outputs with media asset link
      await persistOutputs(enhancement.id!, outputs, {
        mediaAssets: [mediaAsset]
      });

      const processingTime = Date.now() - startTime;

      return {
        enhancement: {
          id: enhancement.id!,
          status: 'completed',
          provider: result.provider,
          createdAt: enhancement.createdAt!
        },
        outputs: {
          audioUrl: result.audioUrl,
          duration: result.duration,
          format: result.format,
          metadata: result.metadata
        },
        mode: result.mode,
        metadata: {
          processingTime,
          versionId
        }
      };

    } catch (error) {
      throw new Error(`TTS enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run image generation enhancement
   */
  async runImage(
    versionId: number,
    options: {
      prompt: string;
      count?: number;
      style?: 'realistic' | 'studio' | 'illustration' | 'artistic' | 'product';
    }
  ): Promise<EnhancementResult<{
    images: Array<{
      url: string;
      thumbUrl: string;
      prompt: string;
    }>;
    totalImages: number;
  }>> {
    const startTime = Date.now();

    try {
      // Load content version for context
      const [version] = await db.select()
        .from(contentVersions)
        .where(eq(contentVersions.id, versionId));

      if (!version) {
        throw new Error(`Content version ${versionId} not found`);
      }

      // Create enhancement record
      const enhancement = await createEnhancement({
        versionId,
        enhancement: 'image',
        inputs: {
          prompt: options.prompt,
          count: options.count || 3,
          style: options.style || 'realistic',
          contextFromVersion: this.extractTextFromPayload(version.payloadJson)?.substring(0, 200)
        }
      });

      // Get brand guidelines from version metadata if available
      const brandGuidelines = version.metadataJson?.brandGuidelines;

      // Run image generation
      const imageInput: ImageGenInput = {
        prompt: options.prompt,
        count: options.count || 3,
        style: options.style || 'realistic',
        brandGuidelines
      };

      const result = await this.imageProvider.generateImages(imageInput);

      // Create media assets for all images
      const mediaAssets = await Promise.all(
        result.images.map(async (image) => {
          return await upsertMediaAsset({
            type: 'image',
            url: image.url,
            thumbUrl: image.thumbUrl,
            metadata: {
              prompt: image.prompt,
              revisedPrompt: image.revisedPrompt,
              style: options.style,
              ...image.metadata
            }
          });
        })
      );

      // Prepare outputs
      const outputs = {
        images: result.images.map((image, index) => ({
          url: image.url,
          thumbUrl: image.thumbUrl,
          prompt: image.prompt,
          mediaAssetId: mediaAssets[index].id
        })),
        totalImages: result.images.length,
        provider: result.provider,
        metadata: result.metadata
      };

      // Persist outputs with media asset links
      await persistOutputs(enhancement.id!, outputs, {
        mediaAssets
      });

      const processingTime = Date.now() - startTime;

      return {
        enhancement: {
          id: enhancement.id!,
          status: 'completed',
          provider: result.provider,
          createdAt: enhancement.createdAt!
        },
        outputs: {
          images: result.images.map(image => ({
            url: image.url,
            thumbUrl: image.thumbUrl,
            prompt: image.prompt
          })),
          totalImages: result.images.length
        },
        mode: result.mode,
        metadata: {
          processingTime,
          versionId
        }
      };

    } catch (error) {
      throw new Error(`Image enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Run video generation enhancement
   */
  async runVideo(
    versionId: number,
    options: {
      templateId: string;
      duration?: 30 | 60 | 120;
      useAssetsFromVersion?: boolean;
      extraAssets?: Array<{
        type: 'image' | 'audio' | 'clip';
        url: string;
        metadata?: Record<string, any>;
      }>;
    }
  ): Promise<EnhancementResult<{
    status: string;
    videoUrl?: string;
    storyboard: any[];
    estimatedCompletion?: number;
  }>> {
    const startTime = Date.now();

    try {
      // Load content version
      const [version] = await db.select()
        .from(contentVersions)
        .where(eq(contentVersions.id, versionId));

      if (!version) {
        throw new Error(`Content version ${versionId} not found`);
      }

      // Create enhancement record
      const enhancement = await createEnhancement({
        versionId,
        enhancement: 'video',
        inputs: {
          templateId: options.templateId,
          duration: options.duration || 30,
          useAssetsFromVersion: options.useAssetsFromVersion,
          extraAssets: options.extraAssets,
          scriptFromVersion: this.extractTextFromPayload(version.payloadJson)
        }
      });

      // Extract script from version
      const scriptText = this.extractTextFromPayload(version.payloadJson);

      // Run video generation
      const videoInput: VideoGenInput = {
        templateId: options.templateId,
        duration: options.duration || 30,
        useAssetsFromVersion: options.useAssetsFromVersion,
        extraAssets: options.extraAssets,
        script: scriptText ? {
          text: scriptText,
          voiceOver: true
        } : undefined
      };

      const result = await this.videoProvider.generateVideo(videoInput);

      // If video is rendered, create media asset
      let mediaAsset;
      if (result.videoUrl) {
        mediaAsset = await upsertMediaAsset({
          type: 'video',
          url: result.videoUrl,
          thumbUrl: result.thumbnailUrl,
          metadata: {
            templateId: options.templateId,
            duration: options.duration,
            storyboard: result.storyboard,
            ...result.metadata
          }
        });
      }

      // Prepare outputs
      const outputs = {
        status: result.status,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        storyboard: result.storyboard,
        provider: result.provider,
        mediaAssetId: mediaAsset?.id,
        metadata: result.metadata
      };

      // Persist outputs
      await persistOutputs(enhancement.id!, outputs, {
        mediaAssets: mediaAsset ? [mediaAsset] : undefined
      });

      const processingTime = Date.now() - startTime;

      return {
        enhancement: {
          id: enhancement.id!,
          status: 'completed',
          provider: result.provider,
          createdAt: enhancement.createdAt!
        },
        outputs: {
          status: result.status,
          videoUrl: result.videoUrl,
          storyboard: result.storyboard,
          estimatedCompletion: result.metadata.estimatedRenderTime ? 
            Date.now() + result.metadata.estimatedRenderTime : undefined
        },
        mode: result.mode,
        metadata: {
          processingTime,
          versionId
        }
      };

    } catch (error) {
      throw new Error(`Video enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get enhancement by ID with full details
   */
  async getEnhancement(enhancementId: number) {
    return await getEnhancementById(enhancementId);
  }

  /**
   * Extract text content from version payload JSON
   */
  private extractTextFromPayload(payloadJson: any): string {
    if (!payloadJson) return '';

    // Handle different payload structures
    if (typeof payloadJson === 'string') return payloadJson;
    if (payloadJson.content) return payloadJson.content;
    if (payloadJson.text) return payloadJson.text;
    if (payloadJson.body) return payloadJson.body;
    if (payloadJson.description) return payloadJson.description;
    
    // Try to extract from nested structures
    if (payloadJson.payload?.content) return payloadJson.payload.content;
    if (payloadJson.data?.text) return payloadJson.data.text;

    // If it's an object, try to concatenate meaningful text fields
    const textFields = ['title', 'headline', 'summary', 'description', 'content', 'text', 'body'];
    const extractedTexts = textFields
      .map(field => payloadJson[field])
      .filter(value => typeof value === 'string' && value.trim().length > 0);

    return extractedTexts.join(' ').trim();
  }
}