import { Request, Response } from 'express';
import { multiPlatformGenerator } from '../services/multiPlatformContentGenerator';

interface MultiPlatformRequest {
  product: string;
  templateType: string;
  tone: string;
  niche: string;
  platformContentMap: { [platform: string]: "video" | "photo" | "other" };
  selectedPlatforms: string[];
  videoDuration?: string;
  platformSchedules?: { [platform: string]: string };
}

export async function generateMultiPlatformContent(req: Request, res: Response) {
  try {
    const {
      product,
      templateType,
      tone,
      niche,
      platformContentMap,
      selectedPlatforms,
      videoDuration,
      platformSchedules
    }: MultiPlatformRequest = req.body;

    // Validate required fields
    if (!product || !niche || !selectedPlatforms?.length) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: product, niche, and selectedPlatforms"
      });
    }

    // Generate content for all selected platforms
    const baseRequest = {
      product,
      niche,
      tone: tone || "friendly",
      templateType: templateType || "seo_blog",
      videoDuration
    };

    console.log(`🎯 Generating multi-platform content for: ${selectedPlatforms.join(', ')}`);
    
    const platformContent = await multiPlatformGenerator.generateMultiPlatformContent(
      platformContentMap,
      baseRequest
    );

    // Format response with scheduling information
    const response = {
      success: true,
      platformContent,
      platformSchedules: platformSchedules || {},
      metadata: {
        product,
        niche,
        tone,
        templateType,
        generatedAt: new Date().toISOString(),
        platforms: selectedPlatforms,
        totalPlatforms: selectedPlatforms.length
      }
    };

    console.log(`✅ Multi-platform content generated successfully for ${selectedPlatforms.length} platforms`);
    
    return res.json(response);

  } catch (error: any) {
    console.error('❌ Multi-platform content generation failed:', error);
    
    // Handle specific AI service errors
    if (error.message.includes('AI content generation temporarily unavailable')) {
      return res.status(503).json({
        success: false,
        error: "AI content generation is temporarily unavailable. Please try again in a few minutes.",
        retryAfter: 60
      });
    }

    // Handle quota/rate limit errors
    if (error.message.includes('quota') || error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: "AI service quota exceeded. Please try again later.",
        retryAfter: 300
      });
    }

    return res.status(500).json({
      success: false,
      error: "Content generation failed. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    if (!platformContent || !platformSchedules) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: platformContent and platformSchedules"
      });
    }

    // Prepare webhook payload for Make.com
    const webhookPayload = {
      action: "schedule_multi_platform_content",
      timestamp: new Date().toISOString(),
      platformSchedules,
      contentPayload: platformContent,
      metadata: {
        ...metadata,
        scheduledAt: new Date().toISOString(),
        totalPlatforms: Object.keys(platformContent).length
      }
    };

    console.log(`📅 Scheduling content for platforms: ${Object.keys(platformSchedules).join(', ')}`);

    // Send to Make.com webhook
    const webhookResponse = await fetch('https://hook.eu2.make.com/wweojbhxm5iei0gj3v9c13uhjxl55mp2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
    }

    console.log(`✅ Multi-platform content scheduled successfully via Make.com`);

    return res.json({
      success: true,
      message: "Multi-platform content scheduled successfully",
      scheduledPlatforms: Object.keys(platformSchedules),
      scheduledAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Multi-platform scheduling failed:', error);
    
    return res.status(500).json({
      success: false,
      error: "Failed to schedule content. Please try again.",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}