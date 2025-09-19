/**
 * Personalization API Routes - Phase 5
 * Advanced Personalization and Dynamic Content Adaptation
 */

import { Router } from 'express';
import { z } from 'zod';
import { personalizationService } from '../../cookaing-marketing/services/personalization.service';
import { brandVoiceService } from '../../cookaing-marketing/services/brandVoice.service';
import { rbacService } from '../../cookaing-marketing/services/rbac.service';

const router = Router();

// Request schemas
const audienceRulesSchema = z.object({
  diet: z.array(z.string()).optional(),
  skill: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  time: z.enum(['quick', 'moderate', 'extended']).optional(),
  geo: z.enum(['US', 'EU', 'APAC', 'LATAM']).optional(),
  device: z.enum(['mobile', 'desktop', 'tablet']).optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'pt']).optional()
});

const previewRulesSchema = z.object({
  versionId: z.number(),
  audienceRules: audienceRulesSchema
});

const applyRulesSchema = z.object({
  versionId: z.number(),
  audienceRules: audienceRulesSchema,
  persist: z.boolean().optional().default(true)
});

const previewAsContactSchema = z.object({
  versionId: z.number(),
  contactId: z.number()
});

// PERSONALIZATION & RULES ROUTES

/**
 * POST /api/cookaing-marketing/personalize/rules/preview
 * Preview audience rules adaptation on content version
 */
router.post('/rules/preview', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const { versionId, audienceRules } = previewRulesSchema.parse(req.body);

    const result = await personalizationService.previewAdaptation({
      versionId,
      audienceRules
    });

    res.json({
      success: true,
      data: result,
      mode: result.mode
    });
  } catch (error: any) {
    console.error('Personalization preview error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to preview personalization'
    });
  }
});

/**
 * POST /api/cookaing-marketing/personalize/rules/apply
 * Apply audience rules to content version
 */
router.post('/rules/apply', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const { versionId, audienceRules, persist } = applyRulesSchema.parse(req.body);

    const result = await personalizationService.adaptForAudience({
      versionId,
      audienceRules,
      persist
    });

    res.json({
      success: true,
      data: result,
      mode: result.mode,
      message: persist ? 'Audience rules applied and saved' : 'Audience rules applied (preview only)'
    });
  } catch (error: any) {
    console.error('Personalization apply error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to apply personalization'
    });
  }
});

/**
 * POST /api/cookaing-marketing/personalize/preview-as-contact
 * Preview content as a specific contact with their preferences
 */
router.post('/preview-as-contact', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const { versionId, contactId } = previewAsContactSchema.parse(req.body);

    const result = await personalizationService.previewAsContact({
      versionId,
      contactId
    });

    res.json({
      success: true,
      data: result,
      mode: result.mode
    });
  } catch (error: any) {
    console.error('Preview as contact error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to preview as contact'
    });
  }
});

/**
 * GET /api/cookaing-marketing/personalize/rules/schema
 * Get audience rules schema for UI building
 */
router.get('/rules/schema', async (req, res) => {
  try {
    const schema = personalizationService.getAudienceRulesSchema();
    
    res.json({
      success: true,
      data: schema
    });
  } catch (error: any) {
    console.error('Get schema error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audience rules schema'
    });
  }
});

export default router;