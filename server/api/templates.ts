import { Request, Response } from 'express';
import { TEMPLATE_METADATA, getTemplatesByCategory } from '@shared/templateMetadata';
import { TemplateType, TEMPLATE_TYPES } from '@shared/constants';

// Get all available templates with metadata
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const { niche, category } = req.query;
    
    let templates = Object.values(TEMPLATE_METADATA);
    
    // Filter by category if specified
    if (category && typeof category === 'string') {
      templates = templates.filter(template => 
        template.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by niche relevance if specified
    if (niche && typeof niche === 'string') {
      const nicheMap: Record<string, string[]> = {
        'skincare': ['Universal', 'Skincare'],
        'tech': ['Universal', 'Tech'], 
        'fashion': ['Universal', 'Fashion'],
        'fitness': ['Universal', 'Fitness'],
        'food': ['Universal', 'Food', 'Home'],
        'travel': ['Universal', 'Travel'],
        'pet': ['Universal', 'Pet']
      };
      
      const relevantCategories = nicheMap[niche.toLowerCase()] || ['Universal'];
      templates = templates.filter(template =>
        relevantCategories.includes(template.category)
      );
    }
    
    const categorizedTemplates = getTemplatesByCategory();
    
    res.json({
      success: true,
      templates: templates,
      categories: categorizedTemplates,
      totalCount: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
};

// Get specific template by ID
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || !TEMPLATE_TYPES.includes(id as TemplateType)) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    const template = TEMPLATE_METADATA[id as TemplateType];
    
    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
};

// Get popular templates based on usage stats
export const getPopularTemplates = async (req: Request, res: Response) => {
  try {
    // These would normally come from analytics/usage data
    const popularTemplateIds: TemplateType[] = [
      'short_video',
      'influencer_caption',
      'product_comparison', 
      'seo_blog',
      'unboxing',
      'skincare_routine',
      'surprise_me'
    ];
    
    const popularTemplates = popularTemplateIds
      .map(id => TEMPLATE_METADATA[id])
      .filter(Boolean);
    
    res.json({
      success: true,
      templates: popularTemplates
    });
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular templates'
    });
  }
};

// Get template recommendations based on product and niche
export const getTemplateRecommendations = async (req: Request, res: Response) => {
  try {
    const { product, niche, platform } = req.query;
    
    // AI-powered template selection logic
    let recommendedTemplates: TemplateType[] = [];
    
    // Default recommendations based on niche
    const nicheRecommendations: Record<string, TemplateType[]> = {
      'skincare': ['skincare_routine', 'derm_approved', 'transformation', 'dupe_alert'],
      'tech': ['unboxing', 'worth_it', 'setup_guide', 'hidden_features'],
      'fashion': ['style_this', 'outfit_inspo', 'dupes_lookalikes', 'haul_review'],
      'fitness': ['supplement_stack', 'eat_in_day', 'fitness_influencer', 'myth_busting'],
      'food': ['product_recipe', 'kitchen_must_haves', 'amazon_finds'],
      'travel': ['packlist', 'adventure_vlog', 'gear_breakdown'],
      'pet': ['dog_testimonial', 'pet_owner_tips', 'trainer_tip']
    };
    
    // Platform-specific recommendations
    const platformRecommendations: Record<string, TemplateType[]> = {
      'tiktok': ['short_video', 'dupe_alert', 'myth_busting', 'hidden_features'],
      'instagram': ['influencer_caption', 'transformation', 'outfit_inspo', 'unboxing'],
      'youtube': ['unboxing', 'setup_guide', 'adventure_vlog', 'haul_review'],
      'blog': ['seo_blog', 'product_comparison', 'buyer_persona', 'routine_kit']
    };
    
    if (niche && typeof niche === 'string') {
      recommendedTemplates.push(...(nicheRecommendations[niche.toLowerCase()] || []));
    }
    
    if (platform && typeof platform === 'string') {
      recommendedTemplates.push(...(platformRecommendations[platform.toLowerCase()] || []));
    }
    
    // Add universal templates that work for everything
    recommendedTemplates.push('product_comparison', 'bullet_points', 'trending_explainer');
    
    // Remove duplicates and get template metadata
    const uniqueTemplates = [...new Set(recommendedTemplates)];
    const templates = uniqueTemplates
      .map(id => TEMPLATE_METADATA[id])
      .filter(Boolean)
      .slice(0, 10); // Limit to top 10 recommendations
    
    res.json({
      success: true,
      templates,
      reasoning: `Recommendations based on ${niche ? `${niche} niche` : 'universal templates'}${platform ? ` and ${platform} platform` : ''}`
    });
  } catch (error) {
    console.error('Error getting template recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get template recommendations'
    });
  }
};

// Create and export the router
import { Router } from 'express';

export const templateRouter = Router();

templateRouter.get('/', getTemplates);
templateRouter.get('/popular', getPopularTemplates);
templateRouter.get('/recommendations', getTemplateRecommendations);
templateRouter.get('/:id', getTemplateById);