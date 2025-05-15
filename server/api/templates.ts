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
 * Helper functions for generating sample data for template previews
 */
function getSampleProductForNiche(niche: string): string {
  const nicheProducts: Record<string, string> = {
    skincare: "CeraVe Hydrating Facial Cleanser",
    tech: "iPhone 15 Pro",
    fashion: "Levi's 501 Original Fit Jeans",
    fitness: "Nike Air Zoom Pegasus 39",
    food: "Lodge Cast Iron Skillet",
    home: "Dyson V11 Cordless Vacuum",
    pet: "Purina Pro Plan Dog Food",
    travel: "Away Carry-On Suitcase",
    default: "Sample Product"
  };
  
  return nicheProducts[niche] || nicheProducts.default;
}

function getSampleTrendsForNiche(niche: string): string {
  const nicheTrends: Record<string, string> = {
    skincare: "Consider these trending skincare products: The Ordinary Niacinamide Serum (viral on TikTok with 820K mentions), CeraVe Moisturizing Cream (featured by top dermatologists), and Paula's Choice BHA Liquid Exfoliant (mentioned in 15 'Best of 2023' lists).",
    tech: "Consider these trending tech products: Sony WH-1000XM5 Headphones (trending on Reddit tech communities), Samsung Galaxy S23 Ultra (featured in top YouTube reviews), and Apple MacBook Air M2 (mentioned in 20+ 'Best laptops of 2023' roundups).",
    fashion: "Consider these trending fashion items: Reformation Cynthia High Rise Straight Jeans (spotted on multiple celebrities), Skims Soft Lounge Dress (selling out after viral TikTok reviews), and Loewe Puzzle Bag (mentioned across Instagram fashion influencer posts).",
    fitness: "Consider these trending fitness products: Hoka Clifton 8 Running Shoes (discussed in runner communities), Lululemon Align Leggings (consistently trending across social platforms), and Hydro Flask Water Bottle (featured in fitness influencer content).",
    food: "Consider these trending kitchen products: Our Place Always Pan (viral across social media), Ninja Creami Ice Cream Maker (trending in cooking groups), and GreenPan Valencia Pro Ceramic Cookware (featured in cooking influencer content).",
    home: "Consider these trending home products: Ruggable Washable Rugs (popular in home decor communities), Levoit Air Purifier (trending in wellness spaces), and Brooklinen Luxe Sheet Set (mentioned across home influencer content).",
    pet: "Consider these trending pet products: Catit Flower Water Fountain (viral among cat owners), Wild One Dog Harness (popular on pet Instagram accounts), and Furbo Dog Camera (featured in pet tech roundups).",
    travel: "Consider these trending travel products: Beis Weekender Bag (featured by travel influencers), Patagonia Black Hole Duffel (popular in travel communities), and Apple AirTag (mentioned in countless travel security guides).",
    default: "Consider these trending products: The Ordinary Niacinamide Serum, Apple AirPods Pro, and Dyson Airwrap."
  };
  
  return nicheTrends[niche] || nicheTrends.default;
}

/**
 * GET /api/templates/:niche/:templateType
 * Get metadata for a specific template in a specific niche
 */
templateRouter.get('/:niche/:templateType', async (req: Request, res: Response) => {
  try {
    const { niche, templateType } = req.params;
    const preview = req.query.preview === 'true';
    
    const templateInfo = await getTemplateInfo(niche, templateType as TemplateType);
    if (!templateInfo) {
      return res.status(404).json({ 
        error: `Template '${templateType}' not found for niche '${niche}'` 
      });
    }
    
    // If preview is requested, add a preview by filling in placeholders with sample data
    if (preview && templateInfo.template) {
      const sampleProduct = getSampleProductForNiche(niche);
      const sampleTrends = getSampleTrendsForNiche(niche);
      
      // Create a preview version with sample data
      const previewTemplate = templateInfo.template
        .replace(/{{productName}}/g, sampleProduct)
        .replace(/{{trendingProducts}}/g, sampleTrends)
        .replace(/{{tone}}/g, 'conversational');
      
      return res.json({
        ...templateInfo,
        preview: previewTemplate
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