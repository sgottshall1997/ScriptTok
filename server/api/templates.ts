/**
 * Enhanced Template API Endpoints
 * Provides access to the enhanced template system with metadata
 */
import { Router, Request, Response } from 'express';
import { TemplateType } from '@shared/constants';
import { 
  getTemplateInfo, 
  getAllTemplatesForNiche, 
  getNicheInfo, 
  getAllNicheInfo 
} from '../prompts';
import { reloadTemplates } from '../prompts/templates';

// Create a router for template endpoints
export const templateRouter = Router();

/**
 * GET /api/templates
 * Get all available template metadata for all niches
 */
templateRouter.get('/', async (req: Request, res: Response) => {
  try {
    const allNicheInfo = await getAllNicheInfo();
    
    // For each niche, get all templates
    const result: Record<string, any> = {
      niches: {},
    };
    
    // Process each niche
    for (const [nicheId, nicheInfo] of Object.entries(allNicheInfo)) {
      const templates = await getAllTemplatesForNiche(nicheId);
      
      result.niches[nicheId] = {
        info: nicheInfo,
        templates: templates,
      };
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting all templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * GET /api/templates/:niche
 * Get template metadata for a specific niche
 */
templateRouter.get('/:niche', async (req: Request, res: Response) => {
  try {
    const { niche } = req.params;
    
    const nicheInfo = await getNicheInfo(niche);
    if (!nicheInfo) {
      return res.status(404).json({ error: `Niche '${niche}' not found` });
    }
    
    const templates = await getAllTemplatesForNiche(niche);
    
    res.json({
      info: nicheInfo,
      templates: templates,
    });
  } catch (error) {
    console.error(`Error getting templates for niche ${req.params.niche}:`, error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * GET /api/templates/:niche/:templateType
 * Get metadata for a specific template in a specific niche
 */
templateRouter.get('/:niche/:templateType', async (req: Request, res: Response) => {
  try {
    const { niche, templateType } = req.params;
    
    const templateInfo = await getTemplateInfo(niche, templateType as TemplateType);
    if (!templateInfo) {
      return res.status(404).json({ 
        error: `Template '${templateType}' not found for niche '${niche}'` 
      });
    }
    
    res.json(templateInfo);
  } catch (error) {
    console.error(`Error getting template info for ${req.params.niche}/${req.params.templateType}:`, error);
    res.status(500).json({ error: 'Failed to get template info' });
  }
});

/**
 * POST /api/templates/reload
 * Force reload of all templates from disk
 * Useful during development or after template updates
 */
templateRouter.post('/reload', async (req: Request, res: Response) => {
  try {
    // This will reload templates for all niches
    await reloadTemplates();
    
    res.json({ success: true, message: 'Templates reloaded successfully' });
  } catch (error) {
    console.error('Error reloading templates:', error);
    res.status(500).json({ error: 'Failed to reload templates' });
  }
});