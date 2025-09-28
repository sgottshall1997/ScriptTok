import { TEMPLATE_TYPES, TemplateType } from './constants';

export interface TemplateMetadata {
  id: TemplateType;
  name: string;
  description: string;
  category: string;
  icon: string;
  platforms: string[];
  estimatedLength: string;
  useCase: string;
  example: string;
  usesProduct: boolean; // Whether this template centers around the specific input product
  contentType: 'product-focused' | 'generic'; // For UI categorization
}

export const TEMPLATE_METADATA: Record<TemplateType, TemplateMetadata> = {
  // Universal Templates (from optimized PDF system)
  'affiliate_email': {
    id: 'affiliate_email',
    name: 'Affiliate Email Blurb',
    description: 'Persuasive email sections that drive clicks and conversions',
    category: 'Universal',
    icon: '📧',
    platforms: ['Email', 'Newsletter'],
    estimatedLength: '100-150 words',
    useCase: 'Email marketing campaigns and subscriber engagement',
    example: 'Subject line + hook + benefits + social proof + CTA',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'influencer_caption': {
    id: 'influencer_caption',
    name: 'Influencer Caption',
    description: 'Authentic social media posts that feel like genuine recommendations',
    category: 'Universal',
    icon: '✨',
    platforms: ['Instagram', 'TikTok', 'Twitter'],
    estimatedLength: '100-200 words',
    useCase: 'Social media engagement and authentic product showcasing',
    example: 'Personal story + product experience + engagement question',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'product_comparison': {
    id: 'product_comparison',
    name: 'Product Comparison Guide',
    description: 'Comprehensive comparison guides helping buyers make informed decisions',
    category: 'Universal',
    icon: '⚖️',
    platforms: ['Blog', 'Website', 'Social Media'],
    estimatedLength: '600-800 words',
    useCase: 'Help audience choose between competing products',
    example: 'Feature comparison + pros/cons + recommendations',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'routine_kit': {
    id: 'routine_kit',
    name: 'Routine Guide',
    description: 'Step-by-step routine guides integrating products effectively',
    category: 'Universal',
    icon: '📋',
    platforms: ['Blog', 'Social Media', 'Video'],
    estimatedLength: '500-700 words',
    useCase: 'Show product integration in comprehensive routines',
    example: 'Morning/evening routine with product sequencing',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'seo_blog': {
    id: 'seo_blog',
    name: 'SEO Blog Post',
    description: 'Search-optimized blog posts that rank well and drive traffic',
    category: 'Universal',
    icon: '📝',
    platforms: ['Blog', 'Website'],
    estimatedLength: '1000+ words',
    useCase: 'Organic traffic and search engine visibility',
    example: 'SEO title + structured content + internal links',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'short_video': {
    id: 'short_video',
    name: 'Short Video (Niche Specific)',
    description: 'Viral-optimized scripts for TikTok, Reels, and YouTube Shorts',
    category: 'Universal',
    icon: '🎬',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '15-60 seconds',
    useCase: 'Viral content and quick engagement',
    example: 'Hook + main content + call-to-action',
    usesProduct: true,
    contentType: 'product-focused'
  },

  'fashion': {
    id: 'fashion',
    name: 'Fashion Content',
    description: 'Style and fashion content with trend awareness',
    category: 'Fashion',
    icon: '👗',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Fashion product styling and trends',
    example: 'Style tips + outfit coordination + trend relevance',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'fitness': {
    id: 'fitness',
    name: 'Fitness Content',
    description: 'Health and fitness focused content with performance benefits',
    category: 'Fitness',
    icon: '💪',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Fitness equipment and supplement promotion',
    example: 'Performance benefits + workout integration + results',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'food': {
    id: 'food',
    name: 'Food Content',
    description: 'Culinary and nutrition content with taste and health benefits',
    category: 'Food',
    icon: '🍎',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Food product promotion and recipe integration',
    example: 'Taste profile + nutritional benefits + usage ideas',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'tech': {
    id: 'tech',
    name: 'Tech Content',
    description: 'Technology product content with feature and benefit focus',
    category: 'Tech',
    icon: '⚡',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Gadget and technology product promotion',
    example: 'Key features + practical benefits + use cases',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'travel': {
    id: 'travel',
    name: 'Travel Content',
    description: 'Travel gear content with adventure and convenience focus',
    category: 'Travel',
    icon: '✈️',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Travel product promotion and adventure inspiration',
    example: 'Travel benefits + convenience features + adventure use',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'pet': {
    id: 'pet',
    name: 'Pet Content',
    description: 'Pet product content with direct reviews and functionality focus',
    category: 'Pet',
    icon: '🐕',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Pet product review and promotion',
    example: 'Features + pet benefits + owner convenience + value',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'universal_short_video_script': {
    id: 'universal_short_video_script',
    name: 'Universal Short Video',
    description: 'Comprehensive video scripts that work across all product categories',
    category: 'Universal',
    icon: '🎥',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '30-60 seconds',
    useCase: 'Universal product promotion across all niches',
    example: 'Hook + benefits + problem-solving + call-to-action',
    usesProduct: true,
    contentType: 'product-focused'
  },
  // Viral Content Templates (no product needed)
  'viral_hooks': {
    id: 'viral_hooks',
    name: 'Viral Hooks',
    description: '10 scroll-stopping TikTok hooks for the given topic',
    category: 'Viral',
    icon: '🔥',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '3-8 words each',
    useCase: 'Attention-grabbing opening lines for viral content',
    example: 'POV:..., Stop scrolling if..., Nobody told you...',
    usesProduct: false,
    contentType: 'generic'
  },
  'viral_short_script': {
    id: 'viral_short_script',
    name: 'Short Script (15-30s)',
    description: '15-30 second TikTok script with Hook/Build/Payoff/Button structure',
    category: 'Viral',
    icon: '⚡',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '70-120 words',
    useCase: 'Quick viral content with structured storytelling',
    example: 'Hook (0-3s) + Build (3-12s) + Payoff (12-24s) + Button (24-30s)',
    usesProduct: false,
    contentType: 'generic'
  },
  'viral_storytime': {
    id: 'viral_storytime',
    name: 'Storytime',
    description: '90-150 word TikTok story script with authentic narrative structure',
    category: 'Viral',
    icon: '📖',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '90-150 words',
    useCase: 'Engaging story content that feels authentic and relatable',
    example: 'Setup + Inciting moment + Rising stakes + Peak beat + Resolution + Comment prompt',
    usesProduct: false,
    contentType: 'generic'
  },
  'viral_duet_reaction': {
    id: 'viral_duet_reaction',
    name: 'Duet/Reaction',
    description: 'Script outline for reacting to or stitching another video',
    category: 'Viral',
    icon: '🎭',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '≤50 words total',
    useCase: 'Reaction content and video stitching for engagement',
    example: 'Open (≤8 words) + 3 Beats (≤10 each) + Payoff + Question',
    usesProduct: false,
    contentType: 'generic'
  },
  'viral_listicle': {
    id: 'viral_listicle',
    name: 'Listicle',
    description: 'Top 3-5 format with titles, explanations and micro-examples',
    category: 'Viral',
    icon: '📋',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '90-140 words',
    useCase: 'Educational content in digestible list format',
    example: 'Title (≤6 words) + Explanation (≤14 words) + Example (≤10 words) per item',
    usesProduct: false,
    contentType: 'generic'
  },
  'viral_challenge': {
    id: 'viral_challenge',
    name: 'Challenge',
    description: 'TikTok participation idea with steps and variations',
    category: 'Viral',
    icon: '🏆',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: 'Easy 15-30s filming',
    useCase: 'Interactive content that encourages user participation',
    example: 'Name + Setup + 3 Steps + Variations + Safety note',
    usesProduct: false,
    contentType: 'generic'
  },
  'viral_caption_hashtags': {
    id: 'viral_caption_hashtags',
    name: 'Caption + Hashtags',
    description: '3 engaging captions plus optimized hashtag sets',
    category: 'Viral',
    icon: '📱',
    platforms: ['TikTok', 'Instagram', 'Twitter'],
    estimatedLength: '8-18 words per caption',
    useCase: 'Social media captions with viral hashtag optimization',
    example: '3 Captions + 6-8 Broad hashtags + 6-8 Niche hashtags',
    usesProduct: false,
    contentType: 'generic'
  }
};

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): TemplateMetadata[] {
  return Object.values(TEMPLATE_METADATA).filter(template => 
    template.category.toLowerCase() === category.toLowerCase()
  );
}

// Helper function to get universal templates
export function getUniversalTemplates(): TemplateMetadata[] {
  return getTemplatesByCategory('Universal');
}

// Helper function to get viral templates
export function getViralTemplates(): TemplateMetadata[] {
  return getTemplatesByCategory('Viral');
}

// Helper function to get templates by mode
export function getTemplatesByMode(mode: 'viral' | 'affiliate'): TemplateMetadata[] {
  if (mode === 'viral') {
    return getViralTemplates();
  } else {
    // Return all affiliate templates (Universal + legacy niche-specific)
    return Object.values(TEMPLATE_METADATA).filter(template => template.usesProduct);
  }
}

// Helper function to get niche-specific templates
export function getNicheTemplates(niche: string): TemplateMetadata[] {
  const nicheCategories = {
    beauty: 'Beauty',
    fashion: 'Fashion', 
    fitness: 'Fitness',
    food: 'Food',
    tech: 'Tech',
    travel: 'Travel',
    pet: 'Pet'
  };
  
  const category = nicheCategories[niche as keyof typeof nicheCategories];
  return category ? getTemplatesByCategory(category) : [];
}
