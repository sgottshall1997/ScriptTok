/**
 * Brand Voice API Routes - Phase 5
 * Brand Voice Learning and Application
 */

import { Router } from 'express';
import { z } from 'zod';
import { brandVoiceService } from '../../cookaing-marketing/services/brandVoice.service';
import { rbacService } from '../../cookaing-marketing/services/rbac.service';

const router = Router();

// Request schemas
const learnVoiceSchema = z.object({
  profileName: z.string().min(1, 'Profile name is required'),
  corpusText: z.string().optional(),
  files: z.array(z.string()).optional()
}).refine(data => data.corpusText || (data.files && data.files.length > 0), {
  message: 'Either corpusText or files must be provided'
});

const applyVoiceSchema = z.object({
  versionId: z.number(),
  profileId: z.number(),
  persist: z.boolean().optional().default(true)
});

// BRAND VOICE ROUTES

/**
 * POST /api/cookaing-marketing/voice/learn
 * Learn brand voice from corpus
 */
router.post('/learn', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const { profileName, corpusText, files } = learnVoiceSchema.parse(req.body);

    const result = await brandVoiceService.ingestCorpus({
      name: profileName,
      corpusText,
      docs: files
    });

    res.json({
      success: true,
      data: {
        profileId: result.id,
        summary: result.summary,
        examplePhrases: result.examplePhrases,
        styleDescriptors: result.styleDescriptors
      },
      mode: process.env.OPENAI_API_KEY ? 'live' : 'mock',
      message: 'Brand voice profile created successfully'
    });
  } catch (error: any) {
    console.error('Brand voice learning error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to learn brand voice'
    });
  }
});

/**
 * GET /api/cookaing-marketing/voice/profiles
 * List all brand voice profiles
 */
router.get('/profiles', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const profiles = await brandVoiceService.listProfiles();

    res.json({
      success: true,
      data: profiles,
      count: profiles.length
    });
  } catch (error: any) {
    console.error('List profiles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brand voice profiles'
    });
  }
});

/**
 * GET /api/cookaing-marketing/voice/profiles/:id
 * Get specific brand voice profile
 */
router.get('/profiles/:id', rbacService.requirePermission('read'), async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile ID'
      });
    }

    const profile = await brandVoiceService.getProfile(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Brand voice profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brand voice profile'
    });
  }
});

/**
 * POST /api/cookaing-marketing/voice/apply
 * Apply brand voice to content version
 */
router.post('/apply', rbacService.requirePermission('write'), async (req, res) => {
  try {
    const { versionId, profileId, persist } = applyVoiceSchema.parse(req.body);

    const result = await brandVoiceService.applyVoice({
      versionId,
      profileId,
      persist
    });

    res.json({
      success: true,
      data: result,
      mode: result.mode,
      message: persist ? 'Brand voice applied and saved' : 'Brand voice applied (preview only)'
    });
  } catch (error: any) {
    console.error('Apply voice error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to apply brand voice'
    });
  }
});

/**
 * DELETE /api/cookaing-marketing/voice/profiles/:id
 * Delete brand voice profile (admin only)
 */
router.delete('/profiles/:id', rbacService.requirePermission('admin'), async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid profile ID'
      });
    }

    // TODO: Implement profile deletion in service
    res.status(501).json({
      success: false,
      error: 'Profile deletion not yet implemented'
    });
  } catch (error: any) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete brand voice profile'
    });
  }
});

export default router;