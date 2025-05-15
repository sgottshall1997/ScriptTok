/**
 * AI Model Configuration API Endpoint
 * Used to expose the AI model configuration for different niches and template types
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { NICHES, TEMPLATE_TYPES, TONE_OPTIONS } from '@shared/constants';
import { getModelConfig } from '../services/aiModelSelector';
import { storage } from '../storage';

export const aiModelConfigRouter = Router();

// Validate request body for fetching configuration
const configRequestSchema = z.object({
  niche: z.enum(NICHES),
  templateType: z.enum(TEMPLATE_TYPES),
  tone: z.enum(TONE_OPTIONS),
  productName: z.string().optional()
});

// Validate request body for saving custom configuration
const saveConfigSchema = z.object({
  niche: z.enum(NICHES),
  templateType: z.enum(TEMPLATE_TYPES),
  tone: z.enum(TONE_OPTIONS),
  temperature: z.number().min(0).max(1),
  frequencyPenalty: z.number().min(0).max(2),
  presencePenalty: z.number().min(0).max(2),
  modelName: z.string()
});

// Interface for custom model configurations
interface CustomModelConfig {
  niche: string;
  templateType: string;
  tone: string;
  temperature: number;
  frequencyPenalty: number;
  presencePenalty: number;
  modelName: string;
}

// In-memory store for custom configurations
// In a production environment, this would be in a database
const customConfigurations: CustomModelConfig[] = [];

/**
 * POST /api/ai-model-config
 * Get the AI model configuration that would be used for the given parameters
 */
aiModelConfigRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Validate request
    const result = configRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: result.error.format() 
      });
    }

    const { niche, templateType, tone, productName } = result.data;

    // First check if there's a custom configuration
    const customConfig = customConfigurations.find(config => 
      config.niche === niche && 
      config.templateType === templateType && 
      config.tone === tone
    );

    if (customConfig) {
      // Return the custom configuration
      return res.json({
        ...customConfig,
        source: 'custom'
      });
    }

    // Otherwise, get the default configuration from the model selector
    const modelConfig = getModelConfig({
      niche,
      templateType,
      tone,
      productName
    });

    // Return the configuration
    return res.json({
      niche,
      templateType,
      tone,
      temperature: modelConfig.temperature,
      frequencyPenalty: modelConfig.frequencyPenalty,
      presencePenalty: modelConfig.presencePenalty,
      modelName: modelConfig.modelName,
      source: 'default'
    });
  } catch (error) {
    console.error('Error fetching AI model configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch AI model configuration', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * POST /api/ai-model-config/save
 * Save a custom AI model configuration
 */
aiModelConfigRouter.post('/save', async (req: Request, res: Response) => {
  try {
    // Validate request
    const result = saveConfigSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid configuration data', 
        details: result.error.format() 
      });
    }

    const configData = result.data;

    // Check if configuration already exists
    const existingIndex = customConfigurations.findIndex(config => 
      config.niche === configData.niche && 
      config.templateType === configData.templateType && 
      config.tone === configData.tone
    );

    if (existingIndex >= 0) {
      // Update existing configuration
      customConfigurations[existingIndex] = configData;
    } else {
      // Add new configuration
      customConfigurations.push(configData);
    }

    // In a real application, these would be saved to a database
    return res.json({
      success: true,
      message: 'Configuration saved successfully',
      config: configData
    });
  } catch (error) {
    console.error('Error saving AI model configuration:', error);
    return res.status(500).json({ 
      error: 'Failed to save AI model configuration', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * GET /api/ai-model-config/templates/:niche
 * Get available template types for a specific niche that have custom configurations
 */
aiModelConfigRouter.get('/templates/:niche', (req: Request, res: Response) => {
  try {
    const { niche } = req.params;
    
    // Validate niche
    if (!NICHES.includes(niche as any)) {
      return res.status(400).json({ error: 'Invalid niche' });
    }

    // Get all custom configurations for this niche
    const nicheConfigs = customConfigurations.filter(config => config.niche === niche);
    
    // Extract unique template types
    const templatesSet = new Set(nicheConfigs.map(config => config.templateType));
    const templates = Array.from(templatesSet);
    
    return res.json(templates);
  } catch (error) {
    console.error('Error fetching template types:', error);
    return res.status(500).json({ error: 'Failed to fetch template types' });
  }
});

/**
 * GET /api/ai-model-config/tones/:niche/:templateType
 * Get available tones for a specific niche and template type that have custom configurations
 */
aiModelConfigRouter.get('/tones/:niche/:templateType', (req: Request, res: Response) => {
  try {
    const { niche, templateType } = req.params;
    
    // Validate parameters
    if (!NICHES.includes(niche as any)) {
      return res.status(400).json({ error: 'Invalid niche' });
    }
    
    if (!TEMPLATE_TYPES.includes(templateType as any)) {
      return res.status(400).json({ error: 'Invalid template type' });
    }

    // Get all custom configurations for this niche and template type
    const configs = customConfigurations.filter(
      config => config.niche === niche && config.templateType === templateType
    );
    
    // Extract unique tones
    const tonesSet = new Set(configs.map(config => config.tone));
    const tones = Array.from(tonesSet);
    
    return res.json(tones);
  } catch (error) {
    console.error('Error fetching tones:', error);
    return res.status(500).json({ error: 'Failed to fetch tones' });
  }
});

/**
 * DELETE /api/ai-model-config/:niche/:templateType/:tone
 * Delete a custom configuration
 */
aiModelConfigRouter.delete('/:niche/:templateType/:tone', (req: Request, res: Response) => {
  try {
    const { niche, templateType, tone } = req.params;
    
    // Find the index of the configuration to delete
    const index = customConfigurations.findIndex(
      config => config.niche === niche && 
                config.templateType === templateType && 
                config.tone === tone
    );
    
    if (index === -1) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    // Remove the configuration
    customConfigurations.splice(index, 1);
    
    return res.json({ success: true, message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return res.status(500).json({ error: 'Failed to delete configuration' });
  }
});

export default aiModelConfigRouter;