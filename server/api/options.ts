import { Router } from "express";
import { TONES } from '../prompts/tones';
import { loadPromptTemplates, loadNicheInfo, NicheInfo } from '../prompts/templates';

const router = Router();

/**
 * GET /api/options - Returns all available tones and template types by niche
 * 
 * This endpoint provides a complete list of valid options for content generation,
 * allowing the front-end to dynamically populate dropdowns and validate input.
 */
router.get("/", async (req, res) => {
  try {
    // Get all available tones from the tones definition
    const tones = Object.keys(TONES);
    
    // Get available template types for each niche
    const templates = await loadPromptTemplates();
    
    // Create a response object with templates organized by niche
    const nicheTemplates: Record<string, string[]> = {};
    
    // Process each niche in the templates object
    for (const niche of Object.keys(templates)) {
      if (niche === 'default') continue; // We'll handle default separately
      
      // Get template types for this niche
      const templateTypes = Object.keys(templates[niche] || {});
      
      // Only add niches that have at least one template
      if (templateTypes.length > 0) {
        nicheTemplates[niche] = templateTypes;
      }
    }
    
    // Add default templates separately
    if (templates.default) {
      nicheTemplates.default = Object.keys(templates.default);
    }
    
    // Get niche information for display names and colors
    const nicheInfo = await loadNicheInfo();
    
    // Format the niche info for the frontend
    const nicheDisplayInfo: Record<string, any> = {};
    Object.entries(nicheInfo).forEach(([niche, info]: [string, NicheInfo]) => {
      nicheDisplayInfo[niche] = {
        displayName: info.name,
        primaryColor: info.primary_color,
        secondaryColor: info.secondary_color,
        icon: info.icon,
        description: info.description
      };
    });
    
    // Send the complete options response
    res.json({
      tones: tones,
      niches: nicheTemplates,
      nicheInfo: nicheDisplayInfo,
      // Include the timestamp to help with caching
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    res.status(500).json({ 
      error: "Failed to fetch available options",
      message: (error as Error).message
    });
  }
});

export default router;