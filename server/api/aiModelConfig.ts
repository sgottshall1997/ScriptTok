/**
 * AI Model Configuration API Endpoint
 * Used to configure and manage AI model parameters for different niches, templates, and tones
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { InsertAiModelConfig } from '@shared/schema';
import { NICHES, TEMPLATE_TYPES, TONE_OPTIONS } from '@shared/constants';

export const aiModelConfigRouter = Router();

/**
 * GET /api/ai-model-config/:niche/:templateType/:tone
 * Get a specific AI model configuration
 */
aiModelConfigRouter.get('/:niche/:templateType/:tone', async (req: Request, res: Response) => {
  try {
    const { niche, templateType, tone } = req.params;
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    if (!TEMPLATE_TYPES.includes(templateType)) {
      return res.status(400).json({ message: `Invalid template type: ${templateType}` });
    }
    
    if (!TONE_OPTIONS.includes(tone)) {
      return res.status(400).json({ message: `Invalid tone: ${tone}` });
    }
    
    const config = await storage.getAiModelConfig(niche, templateType, tone);
    
    if (!config) {
      // Return default settings if no custom configuration exists
      return res.json({
        niche,
        templateType,
        tone,
        temperature: 0.7,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        modelName: 'gpt-4',
        isDefault: true
      });
    }
    
    res.json({
      ...config,
      isDefault: false
    });
  } catch (error) {
    console.error('Error fetching AI model config:', error);
    res.status(500).json({ message: 'Failed to fetch AI model configuration' });
  }
});

/**
 * POST /api/ai-model-config
 * Get the AI model configuration that would be used for the given parameters
 */
aiModelConfigRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { niche, templateType, tone } = req.body;
    
    if (!niche || !templateType || !tone) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    if (!TEMPLATE_TYPES.includes(templateType)) {
      return res.status(400).json({ message: `Invalid template type: ${templateType}` });
    }
    
    if (!TONE_OPTIONS.includes(tone)) {
      return res.status(400).json({ message: `Invalid tone: ${tone}` });
    }
    
    const config = await storage.getAiModelConfig(niche, templateType, tone);
    
    if (!config) {
      // Return default settings if no custom configuration exists
      return res.json({
        niche,
        templateType,
        tone,
        temperature: 0.7,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        modelName: 'gpt-4',
        isDefault: true
      });
    }
    
    res.json({
      ...config,
      isDefault: false
    });
  } catch (error) {
    console.error('Error retrieving AI model config:', error);
    res.status(500).json({ message: 'Failed to retrieve AI model configuration' });
  }
});

/**
 * GET /api/ai-model-config/niche/:niche
 * Get all AI model configurations for a specific niche
 */
aiModelConfigRouter.get('/niche/:niche', async (req: Request, res: Response) => {
  try {
    const { niche } = req.params;
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    const configs = await storage.getAiModelConfigsByNiche(niche);
    res.json(configs);
  } catch (error) {
    console.error('Error fetching niche AI model configs:', error);
    res.status(500).json({ message: 'Failed to fetch AI model configurations for niche' });
  }
});

/**
 * POST /api/ai-model-config/save
 * Save a custom AI model configuration
 */
aiModelConfigRouter.post('/save', async (req: Request, res: Response) => {
  try {
    const { niche, templateType, tone, temperature, frequencyPenalty, presencePenalty, modelName, userId } = req.body;
    
    if (!niche || !templateType || !tone || temperature === undefined) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    if (!TEMPLATE_TYPES.includes(templateType)) {
      return res.status(400).json({ message: `Invalid template type: ${templateType}` });
    }
    
    if (!TONE_OPTIONS.includes(tone)) {
      return res.status(400).json({ message: `Invalid tone: ${tone}` });
    }
    
    const config: InsertAiModelConfig = {
      niche,
      templateType,
      tone,
      temperature: temperature ?? 0.7,
      frequencyPenalty: frequencyPenalty ?? 0.0,
      presencePenalty: presencePenalty ?? 0.0,
      modelName: modelName ?? 'gpt-4',
      createdBy: userId
    };
    
    const savedConfig = await storage.saveAiModelConfig(config);
    res.json(savedConfig);
  } catch (error) {
    console.error('Error saving AI model config:', error);
    res.status(500).json({ message: 'Failed to save AI model configuration' });
  }
});

/**
 * GET /api/ai-model-config/templates/:niche
 * Get available template types for a specific niche that have custom configurations
 */
aiModelConfigRouter.get('/templates/:niche', async (req: Request, res: Response) => {
  try {
    const { niche } = req.params;
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    const configs = await storage.getAiModelConfigsByNiche(niche);
    
    // Extract unique template types
    const templateTypes = [...new Set(configs.map(config => config.templateType))];
    
    res.json(templateTypes);
  } catch (error) {
    console.error('Error fetching template types:', error);
    res.status(500).json({ message: 'Failed to fetch template types' });
  }
});

/**
 * GET /api/ai-model-config/tones/:niche/:templateType
 * Get available tones for a specific niche and template type that have custom configurations
 */
aiModelConfigRouter.get('/tones/:niche/:templateType', async (req: Request, res: Response) => {
  try {
    const { niche, templateType } = req.params;
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({ message: `Invalid niche: ${niche}` });
    }
    
    if (!TEMPLATE_TYPES.includes(templateType)) {
      return res.status(400).json({ message: `Invalid template type: ${templateType}` });
    }
    
    const configs = await storage.getAiModelConfigsByNiche(niche);
    
    // Filter configs by template type and extract unique tones
    const tones = [...new Set(
      configs
        .filter(config => config.templateType === templateType)
        .map(config => config.tone)
    )];
    
    res.json(tones);
  } catch (error) {
    console.error('Error fetching tones:', error);
    res.status(500).json({ message: 'Failed to fetch tones' });
  }
});

/**
 * DELETE /api/ai-model-config/:id
 * Delete a custom configuration
 */
aiModelConfigRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    
    const deleted = await storage.deleteAiModelConfig(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Configuration not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI model config:', error);
    res.status(500).json({ message: 'Failed to delete AI model configuration' });
  }
});