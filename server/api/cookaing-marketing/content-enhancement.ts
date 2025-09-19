import { Router } from 'express';
import { ContentEnhancementService } from '../../cookaing-marketing/services/contentEnhancementService';

const router = Router();
const contentEnhancementService = new ContentEnhancementService();

// Image Generation
router.post('/image/generate', async (req, res) => {
  try {
    const { prompt, style, size, count, versionId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const result = await contentEnhancementService.generateImages({
      prompt,
      style: style || 'natural',
      size: size || '1024x1024',
      count: count || 1,
      versionId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed'
    });
  }
});


// Video Generation
router.post('/video/generate', async (req, res) => {
  try {
    const { templateId, assets, duration, style, versionId } = req.body;
    
    if (!templateId || !assets) {
      return res.status(400).json({
        success: false,
        error: 'Template ID and assets are required'
      });
    }

    const result = await contentEnhancementService.generateVideo({
      templateId,
      assets,
      duration: duration || 10,
      style: style || 'cinematic',
      versionId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Video generation failed'
    });
  }
});

router.get('/video/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    const result = await contentEnhancementService.checkVideoStatus(jobId);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Video status check failed'
    });
  }
});

// Text-to-Speech
router.post('/tts/generate', async (req, res) => {
  try {
    const { text, voice, pace, language, versionId } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const result = await contentEnhancementService.generateAudio({
      text,
      voice: voice || 'nova',
      pace: pace || 1.0,
      language: language || 'en',
      versionId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Speech synthesis failed'
    });
  }
});

router.get('/tts/voices', async (req, res) => {
  try {
    const result = await contentEnhancementService.getVoices();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch voices'
    });
  }
});

// Content Rewriting
router.post('/rewrite', async (req, res) => {
  try {
    const { text, style, constraints, versionId } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const result = await contentEnhancementService.rewriteContent({
      text,
      style: style || 'professional',
      constraints: constraints || [],
      versionId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Content rewriting failed'
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  try {
    const result = await contentEnhancementService.getHealthStatus();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    });
  }
});

export default router;