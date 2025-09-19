/**
 * Enhancement API Routes - Content Enhancement features
 * Phase 2: Rewrite, TTS, Image Generation, Video Generation, and Campaign Attachment
 */

import { Router } from 'express';
import { EnhancementService } from '../../cookaing-marketing/services/enhancement.service';
import { 
  snapshotToCampaignArtifact, 
  getEnhancementById,
  getEnhancementsByVersion 
} from '../../cookaing-marketing/db/storage.enhance';
import { logEvent } from '../../analytics';

const router = Router();
const enhancementService = new EnhancementService();

/**
 * POST /enhance/rewrite
 * Rewrite content with specified style and parameters
 */
router.post('/rewrite', async (req, res) => {
  try {
    const { 
      versionId, 
      style, 
      length, 
      voiceProfileId, 
      constraints 
    } = req.body;

    // Validate required fields
    if (!versionId || typeof versionId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'versionId is required and must be a number'
      });
    }

    // Run rewrite enhancement
    const result = await enhancementService.runRewrite(versionId, {
      style,
      length,
      voiceProfileId,
      constraints
    });

    // Log analytics event
    await logEvent({
      type: 'enhancement',
      action: 'rewrite_completed',
      metadata: {
        versionId,
        enhancementId: result.enhancement.id,
        style,
        length,
        mode: result.mode,
        processingTime: result.metadata.processingTime,
        wordCountChange: result.outputs.wordCount.rewritten - result.outputs.wordCount.original
      }
    });

    res.json({
      success: true,
      enhancement: result.enhancement,
      previewText: result.outputs.previewText,
      originalWordCount: result.outputs.wordCount.original,
      rewrittenWordCount: result.outputs.wordCount.rewritten,
      changes: result.outputs.changes,
      mode: result.mode,
      processingTime: result.metadata.processingTime
    });

  } catch (error) {
    console.error('Rewrite enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Rewrite enhancement failed'
    });
  }
});

/**
 * POST /enhance/tts
 * Generate text-to-speech audio from content
 */
router.post('/tts', async (req, res) => {
  try {
    const {
      versionId,
      voice,
      speed,
      scriptSource,
      customText
    } = req.body;

    // Validate required fields
    if (!versionId || typeof versionId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'versionId is required and must be a number'
      });
    }

    if (!voice || typeof voice !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'voice is required and must be a string'
      });
    }

    // Run TTS enhancement
    const result = await enhancementService.runTTS(versionId, {
      voice,
      speed: speed || 'normal',
      scriptSource: scriptSource || 'payload',
      customText
    });

    // Log analytics event
    await logEvent({
      type: 'enhancement',
      action: 'tts_completed',
      metadata: {
        versionId,
        enhancementId: result.enhancement.id,
        voice,
        speed,
        duration: result.outputs.duration,
        mode: result.mode,
        processingTime: result.metadata.processingTime
      }
    });

    res.json({
      success: true,
      enhancement: result.enhancement,
      media: {
        audioUrl: result.outputs.audioUrl,
        duration: result.outputs.duration,
        format: result.outputs.format,
        metadata: result.outputs.metadata
      },
      mode: result.mode,
      processingTime: result.metadata.processingTime
    });

  } catch (error) {
    console.error('TTS enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'TTS enhancement failed'
    });
  }
});

/**
 * POST /enhance/image
 * Generate images from text prompts
 */
router.post('/image', async (req, res) => {
  try {
    const {
      versionId,
      prompt,
      count,
      style
    } = req.body;

    // Validate required fields
    if (!versionId || typeof versionId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'versionId is required and must be a number'
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'prompt is required and must be a string'
      });
    }

    // Run image enhancement
    const result = await enhancementService.runImage(versionId, {
      prompt,
      count: count || 3,
      style: style || 'realistic'
    });

    // Log analytics event
    await logEvent({
      type: 'enhancement',
      action: 'image_completed',
      metadata: {
        versionId,
        enhancementId: result.enhancement.id,
        prompt,
        count: result.outputs.totalImages,
        style,
        mode: result.mode,
        processingTime: result.metadata.processingTime
      }
    });

    res.json({
      success: true,
      enhancement: result.enhancement,
      media: result.outputs.images.map(img => ({
        imageUrl: img.url,
        thumbUrl: img.thumbUrl,
        prompt: img.prompt
      })),
      totalImages: result.outputs.totalImages,
      mode: result.mode,
      processingTime: result.metadata.processingTime
    });

  } catch (error) {
    console.error('Image enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Image enhancement failed'
    });
  }
});

/**
 * POST /enhance/video
 * Generate videos using templates and content
 */
router.post('/video', async (req, res) => {
  try {
    const {
      versionId,
      templateId,
      duration,
      useAssetsFromVersion,
      extraAssets
    } = req.body;

    // Validate required fields
    if (!versionId || typeof versionId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'versionId is required and must be a number'
      });
    }

    if (!templateId || typeof templateId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'templateId is required and must be a string'
      });
    }

    // Run video enhancement
    const result = await enhancementService.runVideo(versionId, {
      templateId,
      duration: duration || 30,
      useAssetsFromVersion: useAssetsFromVersion !== false,
      extraAssets
    });

    // Log analytics event
    await logEvent({
      type: 'enhancement',
      action: 'video_started',
      metadata: {
        versionId,
        enhancementId: result.enhancement.id,
        templateId,
        duration,
        status: result.outputs.status,
        mode: result.mode,
        processingTime: result.metadata.processingTime
      }
    });

    res.json({
      success: true,
      enhancement: result.enhancement,
      media: {
        videoUrl: result.outputs.videoUrl,
        storyboard: result.outputs.storyboard
      },
      status: result.outputs.status,
      estimatedCompletion: result.outputs.estimatedCompletion,
      mode: result.mode,
      processingTime: result.metadata.processingTime
    });

  } catch (error) {
    console.error('Video enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Video enhancement failed'
    });
  }
});

/**
 * POST /enhance/attach-to-campaign
 * Attach enhancement outputs to a campaign as artifacts
 */
router.post('/attach-to-campaign', async (req, res) => {
  try {
    const {
      enhancementId,
      campaignId,
      channel,
      platform,
      title,
      summary
    } = req.body;

    // Validate required fields
    if (!enhancementId || typeof enhancementId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'enhancementId is required and must be a number'
      });
    }

    if (!campaignId || typeof campaignId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'campaignId is required and must be a number'
      });
    }

    if (!channel || typeof channel !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'channel is required and must be a string'
      });
    }

    // Get enhancement details
    const enhancement = await getEnhancementById(enhancementId);
    if (!enhancement) {
      return res.status(404).json({
        success: false,
        error: 'Enhancement not found'
      });
    }

    // Create campaign artifact from enhancement
    const { artifact, link } = await snapshotToCampaignArtifact({
      versionId: enhancement.versionId,
      payloadJson: enhancement.outputsJson,
      channel,
      platform,
      campaignId,
      title: title || `Enhanced Content - ${enhancement.enhancement}`,
      summary: summary || `Content enhanced using ${enhancement.enhancement} on ${new Date().toLocaleDateString()}`
    });

    // Log analytics event
    await logEvent({
      type: 'enhancement',
      action: 'attached_to_campaign',
      metadata: {
        enhancementId,
        campaignId,
        artifactId: artifact.id,
        channel,
        platform,
        enhancementType: enhancement.enhancement
      }
    });

    res.json({
      success: true,
      artifact: {
        id: artifact.id,
        title: artifact.title,
        channel: artifact.channel,
        platform: artifact.platform,
        status: artifact.status,
        createdAt: artifact.createdAt
      },
      enhancement: {
        id: enhancement.id,
        type: enhancement.enhancement,
        provider: enhancement.provider
      }
    });

  } catch (error) {
    console.error('Attach to campaign error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to attach enhancement to campaign'
    });
  }
});

/**
 * GET /enhance/list
 * List enhancements for a content version
 */
router.get('/list', async (req, res) => {
  try {
    const { versionId } = req.query;

    if (!versionId || isNaN(Number(versionId))) {
      return res.status(400).json({
        success: false,
        error: 'versionId is required and must be a number'
      });
    }

    const enhancements = await getEnhancementsByVersion(Number(versionId));

    res.json({
      success: true,
      enhancements: enhancements.map(enhancement => ({
        id: enhancement.id,
        type: enhancement.enhancement,
        status: enhancement.status,
        provider: enhancement.provider,
        createdAt: enhancement.createdAt,
        mediaAssets: enhancement.mediaAssets?.map(asset => ({
          id: asset.id,
          type: asset.type,
          url: asset.url,
          thumbUrl: asset.thumbUrl,
          status: asset.status
        })) || []
      })),
      count: enhancements.length
    });

  } catch (error) {
    console.error('List enhancements error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list enhancements'
    });
  }
});

/**
 * GET /enhance/status/:enhancementId
 * Get detailed status of a specific enhancement
 */
router.get('/status/:enhancementId', async (req, res) => {
  try {
    const { enhancementId } = req.params;

    if (!enhancementId || isNaN(Number(enhancementId))) {
      return res.status(400).json({
        success: false,
        error: 'enhancementId is required and must be a number'
      });
    }

    const enhancement = await getEnhancementById(Number(enhancementId));
    
    if (!enhancement) {
      return res.status(404).json({
        success: false,
        error: 'Enhancement not found'
      });
    }

    res.json({
      success: true,
      enhancement: {
        id: enhancement.id,
        type: enhancement.enhancement,
        status: enhancement.status,
        provider: enhancement.provider,
        inputs: enhancement.inputsJson,
        outputs: enhancement.outputsJson,
        createdAt: enhancement.createdAt,
        updatedAt: enhancement.updatedAt,
        mediaAssets: enhancement.mediaAssets?.map(asset => ({
          id: asset.id,
          type: asset.type,
          url: asset.url,
          thumbUrl: asset.thumbUrl,
          metadata: asset.metadataJson,
          status: asset.status
        })) || []
      }
    });

  } catch (error) {
    console.error('Enhancement status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get enhancement status'
    });
  }
});

export default router;