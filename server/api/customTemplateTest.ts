/**
 * Custom Template Test API Endpoint
 * Allows users to test their custom templates with real data
 */
import { Router } from "express";
import { z } from "zod";
import { NICHES, TONE_OPTIONS } from "@shared/constants";
import { storage } from "../storage";
import { openai } from "../services/openai";
import { getModelConfig } from "../services/aiModelSelector";

export const customTemplateTestRouter = Router();

// Validate request body schema
const testTemplateSchema = z.object({
  templateContent: z.string().min(10, "Template content is required"),
  productName: z.string().min(1, "Product name is required"),
  tone: z.enum(TONE_OPTIONS).default("friendly"),
  niche: z.enum(NICHES).default("beauty"),
});

/**
 * POST /api/custom-template/test
 * Test a custom template with actual content generation
 */
customTemplateTestRouter.post("/test", async (req, res) => {
  try {
    // Validate request body
    const result = testTemplateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        details: result.error.format() 
      });
    }
    
    const { templateContent, productName, tone, niche } = result.data;
    
    // Get trending products for context enrichment
    const trendingProducts = await storage.getTrendingProductsByNiche(niche, 3);
    
    // Get model configuration optimized for this niche
    // Use 'original' as the template type since 'custom' is not in the allowed list
    const modelConfig = getModelConfig({
      niche,
      productName,
      templateType: "original", // Using a standard template type
      tone
    });
    
    // Process the template content to replace placeholders
    let processedTemplate = templateContent;
    
    // Replace {product_name} with the actual product name
    processedTemplate = processedTemplate.replace(/{product_name}/g, productName);
    
    // Replace {trending_products} with formatted trending products if any
    if (trendingProducts.length > 0) {
      const trendingProductsText = trendingProducts.map(p => `- ${p.title}`).join('\n');
      processedTemplate = processedTemplate.replace(/{trending_products}/g, trendingProductsText);
    } else {
      processedTemplate = processedTemplate.replace(/{trending_products}/g, "No trending products available");
    }
    
    // Generate content using the processed template
    console.log(`Testing custom template for ${productName} in ${niche} niche using ${tone} tone`);
    
    const completion = await openai.chat.completions.create({
      model: modelConfig.modelName,
      messages: [
        {
          role: "system",
          content: `You are a content creation expert specializing in ${niche} products. Create content in a ${tone} tone following the exact template provided. Fill in any remaining placeholders with appropriate content.`
        },
        {
          role: "user",
          content: processedTemplate
        }
      ],
      temperature: modelConfig.temperature,
      max_tokens: 2048,
      frequency_penalty: modelConfig.frequencyPenalty,
      presence_penalty: modelConfig.presencePenalty
    });
    
    const generatedContent = completion.choices[0].message.content || 
      "Could not generate content. Please try again.";
    
    // Store usage for analytics
    await storage.incrementApiUsage("custom_template", tone);
    
    // Return the generated content
    return res.json({
      product: productName,
      niche,
      tone,
      content: generatedContent,
      template: templateContent
    });
    
  } catch (error) {
    console.error("Error testing custom template:", error);
    return res.status(500).json({ 
      error: "Failed to test template", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default customTemplateTestRouter;