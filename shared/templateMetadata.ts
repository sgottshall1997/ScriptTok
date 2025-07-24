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
    name: 'Short-Form Video Script',
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

  // Niche-Specific Templates (from optimized PDF system)
  'skincare': {
    id: 'skincare',
    name: 'Skincare Content',
    description: 'Beauty and skincare focused content with expert positioning',
    category: 'Beauty',
    icon: '✨',
    platforms: ['All'],
    estimatedLength: '100-170 words',
    useCase: 'Beauty product promotion and education',
    example: 'Skincare benefits + routine integration + results',
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

// Helper function to get niche-specific templates
export function getNicheTemplates(niche: string): TemplateMetadata[] {
  const nicheCategories = {
    beauty: 'Beauty',
    fashion: 'Fashion', 
    fitness: 'Fitness',
    food: 'Food',
    tech: 'Tech',
    travel: 'Travel'
  };
  
  const category = nicheCategories[niche as keyof typeof nicheCategories];
  return category ? getTemplatesByCategory(category) : [];
}
