/**
 * AI Model Configuration API Endpoint
 * Used to expose the AI model configuration for different niches and template types
 */
import { Router } from "express";
import { z } from "zod";
import { TEMPLATE_TYPES, TONE_OPTIONS, NICHES } from "@shared/constants";
import { getModelConfig, getTokenLimit } from "../services/aiModelSelector";

export const aiModelConfigRouter = Router();

// Validate request body schema
const modelConfigRequestSchema = z.object({
  niche: z.enum(NICHES).default("skincare"),
  templateType: z.enum(TEMPLATE_TYPES).default("original"),
  tone: z.enum(TONE_OPTIONS).default("friendly"),
  productName: z.string().optional().default("Test Product")
});

/**
 * POST /api/ai-model-config
 * Get the AI model configuration that would be used for the given parameters
 */
aiModelConfigRouter.post("/", async (req, res) => {
  try {
    // Validate request body
    const result = modelConfigRequestSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: result.error.format() 
      });
    }
    
    const { niche, templateType, tone, productName } = result.data;
    
    // Get the model configuration that would be used
    const modelConfig = getModelConfig({
      niche,
      templateType,
      tone,
      productName: productName || "Test Product",
    });
    
    // Get token limit for this template type
    const maxTokens = getTokenLimit(templateType);
    
    // Return the configuration
    return res.json({
      niche,
      templateType,
      tone,
      modelName: modelConfig.modelName,
      temperature: modelConfig.temperature,
      maxTokens: maxTokens,
      frequencyPenalty: modelConfig.frequencyPenalty,
      presencePenalty: modelConfig.presencePenalty
    });
    
  } catch (error) {
    console.error("Error getting AI model configuration:", error);
    return res.status(500).json({ 
      error: "Failed to get AI model configuration", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default aiModelConfigRouter;