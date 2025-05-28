import { Request, Response } from 'express';
import { MultiPlatformContentGenerator } from '../services/multiPlatformContentGenerator';
import { WebhookService } from '../services/webhookService';

export async function generateMultiPlatformContent(req: Request, res: Response) {
  try {
    const {
      product,
      niche,
      templateType,
      tone,
      platformContentMap,
      videoDuration,
      affiliateLink
    } = req.body;

    // Validate required fields with proper defaults
    const safeProduct = product || 'Product';
    const safeNiche = niche || 'general';
    const safeTemplateType = templateType || 'original';
    const safeTone = tone || 'friendly';
    const safePlatformContentMap = platformContentMap || {};

    // Check if any platforms are selected
    const selectedPlatforms = Object.keys(safePlatformContentMap);
    if (selectedPlatforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one platform must be selected"
      });
    }

    const generator = new MultiPlatformContentGenerator();
    
    // Generate content for all selected platforms with comprehensive error handling
    const result = await generator.generateMultiPlatformContent(
      safePlatformContentMap,
      {
        product: safeProduct,
        niche: safeNiche, 
        templateType: safeTemplateType,
        tone: safeTone,
        videoDuration: videoDuration || '30'
      }
    );

    // Ensure result has proper structure
    const safeResult = result || {};

    res.json({
      success: true,
      platformContent: safeResult,
      platformSchedules: {}, // Empty initially, filled during scheduling
      metadata: {
        product,
        niche,
        tone,
        templateType,
        generatedAt: new Date().toISOString(),
        platforms: selectedPlatforms,
        totalPlatforms: selectedPlatforms.length,
        videoDuration
      }
    });

  } catch (error: any) {
    console.error('Multi-platform content generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate multi-platform content"
    });
  }
}

export async function scheduleMultiPlatformContent(req: Request, res: Response) {
  try {
    const {
      platformContent,
      platformSchedules,
      metadata
    } = req.body;

    // Validate required fields
    if (!platformContent || !metadata) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: platformContent, metadata"
      });
    }

    const webhookService = new WebhookService();
    
    // Send to Make.com with scheduling information
    const result = await webhookService.sendMultiPlatformContent({
      platformContent,
      platformSchedules: platformSchedules || {},
      metadata
    });

    if (result.success) {
      res.json({
        success: true,
        message: "Content scheduled successfully",
        scheduledPlatforms: Object.keys(platformContent),
        webhookResponse: result
      });
    } else {
      throw new Error(result.error || "Failed to schedule content");
    }

  } catch (error: any) {
    console.error('Multi-platform scheduling error:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to schedule multi-platform content"
    });
  }
}