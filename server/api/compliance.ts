import { Request, Response } from 'express';
import { z } from 'zod';
import { enhanceContentCompliance, validateContentCompliance, getComplianceGuidelines, ComplianceOptions } from '../services/complianceEnhancer';

// Request schemas
const enhanceComplianceSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platform: z.string().min(1, "Platform is required"),
  hasAffiliateLinks: z.boolean().default(true),
  contentType: z.enum(['post', 'story', 'video', 'email', 'blog']).default('post'),
  affiliateProgram: z.enum(['amazon', 'other']).optional().default('amazon')
});

const validateComplianceSchema = z.object({
  content: z.string().min(1, "Content is required"),
  platform: z.string().min(1, "Platform is required"),
  hasAffiliateLinks: z.boolean().default(true),
  contentType: z.enum(['post', 'story', 'video', 'email', 'blog']).default('post'),
  affiliateProgram: z.enum(['amazon', 'other']).optional().default('amazon')
});

const guidelinesSchema = z.object({
  platform: z.string().min(1, "Platform is required")
});

/**
 * POST /api/compliance/enhance
 * Enhance content with FTC-compliant disclosures
 */
export async function enhanceCompliance(req: Request, res: Response) {
  try {
    const validatedData = enhanceComplianceSchema.parse(req.body);
    
    const options: ComplianceOptions = {
      hasAffiliateLinks: validatedData.hasAffiliateLinks,
      platform: validatedData.platform,
      contentType: validatedData.contentType,
      affiliateProgram: validatedData.affiliateProgram
    };
    
    const result = enhanceContentCompliance(validatedData.content, options);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Error enhancing compliance:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to enhance content compliance"
    });
  }
}

/**
 * POST /api/compliance/validate
 * Validate content compliance with FTC guidelines
 */
export async function validateCompliance(req: Request, res: Response) {
  try {
    const validatedData = validateComplianceSchema.parse(req.body);
    
    const options: ComplianceOptions = {
      hasAffiliateLinks: validatedData.hasAffiliateLinks,
      platform: validatedData.platform,
      contentType: validatedData.contentType,
      affiliateProgram: validatedData.affiliateProgram
    };
    
    const validation = validateContentCompliance(validatedData.content, options);
    
    res.json({
      success: true,
      data: {
        isCompliant: validation.isCompliant,
        issues: validation.issues,
        totalIssues: validation.issues.length
      }
    });
    
  } catch (error) {
    console.error('Error validating compliance:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to validate content compliance"
    });
  }
}

/**
 * GET /api/compliance/guidelines/:platform
 * Get platform-specific compliance guidelines
 */
export async function getGuidelines(req: Request, res: Response) {
  try {
    const { platform } = req.params;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        error: "Platform parameter is required"
      });
    }
    
    const guidelines = getComplianceGuidelines(platform);
    
    res.json({
      success: true,
      platform: platform,
      data: guidelines
    });
    
  } catch (error) {
    console.error('Error getting compliance guidelines:', error);
    
    res.status(500).json({
      success: false,
      error: "Failed to get compliance guidelines"
    });
  }
}

/**
 * GET /api/compliance/platforms
 * Get list of supported platforms with their requirements
 */
export async function getSupportedPlatforms(req: Request, res: Response) {
  try {
    const platforms = [
      {
        name: 'TikTok',
        id: 'tiktok',
        requirements: ['Hashtag disclosure (#ad)', 'Written disclosure in caption'],
        maxChars: 2200
      },
      {
        name: 'Instagram',
        id: 'instagram',
        requirements: ['Hashtag disclosure (#ad)', 'Paid partnership label when available'],
        maxChars: 2200
      },
      {
        name: 'YouTube',
        id: 'youtube',
        requirements: ['Verbal disclosure in video', 'Written disclosure in description'],
        maxChars: 5000
      },
      {
        name: 'Twitter/X',
        id: 'twitter',
        requirements: ['Hashtag disclosure (#ad)', 'Clear written disclosure'],
        maxChars: 280
      },
      {
        name: 'Facebook',
        id: 'facebook',
        requirements: ['Clear written disclosure', 'Platform disclosure tools when available'],
        maxChars: 63206
      },
      {
        name: 'Other/Blog',
        id: 'other',
        requirements: ['Clear written disclosure', 'Prominent placement'],
        maxChars: null
      }
    ];
    
    res.json({
      success: true,
      platforms
    });
    
  } catch (error) {
    console.error('Error getting supported platforms:', error);
    
    res.status(500).json({
      success: false,
      error: "Failed to get supported platforms"
    });
  }
}