/**
 * Template Test Endpoint
 * Used for testing the multi-niche template system
 */
import express from 'express';
import { loadPromptTemplates, reloadTemplates } from '../prompts/templates';
import { NICHES, TEMPLATE_TYPES, TemplateType, Niche } from '@shared/constants';

const router = express.Router();

/**
 * GET /api/template-test
 * Tests the template loading system and returns all loaded templates
 */
router.get('/', async (req, res) => {
  try {
    // First, force a reload of all templates
    await reloadTemplates();
    
    // Load all templates
    const templates = await loadPromptTemplates();
    
    // Create a summary of available templates by niche and type
    const summary: Record<string, string[]> = {};
    
    // Process each niche
    for (const niche of Object.keys(templates)) {
      const nicheTemplates = templates[niche];
      summary[niche] = Object.keys(nicheTemplates);
    }
    
    // Return summary and detailed templates
    res.json({
      summary,
      supportedNiches: NICHES,
      supportedTemplateTypes: TEMPLATE_TYPES,
      templates
    });
  } catch (error) {
    console.error('Error testing templates:', error);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

/**
 * GET /api/template-test/:niche/:templateType
 * Tests a specific template for a niche and template type
 */
router.get('/:niche/:templateType', async (req, res) => {
  try {
    const { niche, templateType } = req.params;
    
    // Validate params
    if (!NICHES.includes(niche as Niche)) {
      return res.status(400).json({ error: `Invalid niche: ${niche}. Supported niches: ${NICHES.join(', ')}` });
    }
    
    if (!TEMPLATE_TYPES.includes(templateType as TemplateType)) {
      return res.status(400).json({ error: `Invalid template type: ${templateType}. Supported types: ${TEMPLATE_TYPES.join(', ')}` });
    }
    
    // Load templates
    const templates = await loadPromptTemplates();
    
    // Get specific template
    const nicheTemplates = templates[niche] || {};
    const templateKey = templateType as TemplateType;
    const template = nicheTemplates[templateKey] || templates.default?.[templateKey];
    
    if (!template) {
      return res.status(404).json({ 
        error: `No template found for niche: ${niche}, type: ${templateType}`,
        fallbackAvailable: !!templates.default?.[templateKey]
      });
    }
    
    // Return template
    res.json({
      niche,
      templateType,
      template,
      isDefault: !nicheTemplates[templateKey]
    });
  } catch (error) {
    console.error('Error testing specific template:', error);
    res.status(500).json({ error: 'Failed to load template' });
  }
});

export { router as templateTestRouter };