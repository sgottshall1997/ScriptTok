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
  // Universal Templates
  'seo_blog': {
    id: 'seo_blog',
    name: 'SEO Blog Post',
    description: 'Keyword-optimized long-form content (1000+ words)',
    category: 'Universal',
    icon: '📝',
    platforms: ['Blog', 'Website'],
    estimatedLength: '1000+ words',
    useCase: 'Drive organic traffic and establish authority',
    example: 'Comprehensive guide with headings, keywords, and internal links',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'short_video': {
    id: 'short_video',
    name: 'Short-Form Video Script',
    description: 'Engaging script for TikTok, Reels, and YouTube Shorts',
    category: 'Universal',
    icon: '🎬',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '30-60 seconds',
    useCase: 'Viral potential and quick engagement',
    example: 'Hook + Problem + Solution + CTA format',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'influencer_caption': {
    id: 'influencer_caption',
    name: 'Influencer Caption',
    description: 'Social media caption with hashtags, emojis, and CTAs',
    category: 'Universal',
    icon: '✨',
    platforms: ['Instagram', 'TikTok', 'Twitter'],
    estimatedLength: '100-300 characters',
    useCase: 'Social media engagement and brand awareness',
    example: 'Personal story + product mention + relevant hashtags',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'product_comparison': {
    id: 'product_comparison',
    name: 'Product Comparison',
    description: 'Side-by-side comparison with pros/cons breakdown',
    category: 'Universal',
    icon: '⚖️',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Help audience make informed decisions',
    example: 'Product A vs Product B feature comparison table',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'bullet_points': {
    id: 'bullet_points',
    name: 'Bullet-Point Summary',
    description: 'Concise bullet points for newsletters or carousels',
    category: 'Universal',
    icon: '•',
    platforms: ['Instagram', 'Email', 'LinkedIn'],
    estimatedLength: '5-10 bullets',
    useCase: 'Quick consumption and shareability',
    example: '5 reasons why this product is trending',
    usesProduct: false,
    contentType: 'generic'
  }
};

export const getTemplatesByCategory = () => {
  const categories: Record<string, TemplateMetadata[]> = {};
  
  Object.values(TEMPLATE_METADATA).forEach(template => {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  });
  
  return categories;
};

export const getTemplateById = (id: TemplateType): TemplateMetadata | undefined => {
  return TEMPLATE_METADATA[id];
};
