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
  // Universal Templates (9 templates)
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
  'routine_kit': {
    id: 'routine_kit',
    name: 'Routine Builder',
    description: 'Complete routine or kit with multiple products',
    category: 'Universal',
    icon: '📋',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Bundle products into comprehensive solutions',
    example: 'Complete morning routine with these 5 products',
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
  },
  'trending_explainer': {
    id: 'trending_explainer',
    name: 'Why It\'s Trending',
    description: 'Explain why a product or trend is popular',
    category: 'Universal',
    icon: '📈',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Capitalize on current trends and viral moments',
    example: 'Why everyone is obsessed with this skincare ingredient',
    usesProduct: false,
    contentType: 'generic'
  },
  'buyer_persona': {
    id: 'buyer_persona',
    name: 'Buyer Persona Targeting',
    description: 'Content targeted to specific audience segments',
    category: 'Universal',
    icon: '🎯',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Speak directly to specific demographic groups',
    example: 'Skincare routine for busy working moms',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'affiliate_email': {
    id: 'affiliate_email',
    name: 'Affiliate Email',
    description: 'Email-friendly product promotion (1-2 paragraphs)',
    category: 'Universal',
    icon: '📧',
    platforms: ['Email'],
    estimatedLength: '100-200 words',
    useCase: 'Email marketing and newsletter content',
    example: 'Quick product recommendation for email subscribers',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Beauty & Personal Care Specific (8 templates)
  'beauty_routine': {
    id: 'beauty_routine',
    name: 'Beauty Routine',
    description: 'Step-by-step beauty routine featuring products',
    category: 'Beauty & Personal Care',
    icon: '💄',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    estimatedLength: '200-400 words',
    useCase: 'Showcase products in daily routines',
    example: 'My morning skincare routine with this serum',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'derm_approved': {
    id: 'derm_approved',
    name: 'Dermatologist Approved',
    description: 'Expert-backed skincare recommendations',
    category: 'Beauty & Personal Care',
    icon: '👩‍⚕️',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '30-60 seconds',
    useCase: 'Build credibility with expert endorsement',
    example: 'Dermatologist explains why this ingredient works',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'transformation': {
    id: 'transformation',
    name: 'Transformation Story',
    description: 'Before and after beauty transformation',
    category: 'Beauty & Personal Care',
    icon: '✨',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '200-300 words',
    useCase: 'Show dramatic results and build social proof',
    example: 'How this serum transformed my skin in 30 days',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'skin_type_list': {
    id: 'skin_type_list',
    name: 'Skin Type Essentials',
    description: 'Must-have products for specific skin types',
    category: 'Beauty & Personal Care',
    icon: '📝',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Targeted recommendations by skin type',
    example: '5 must-haves for oily skin',
    usesProduct: false,
    contentType: 'generic'
  },
  'dupe_alert': {
    id: 'dupe_alert',
    name: 'Dupe Alert',
    description: 'Affordable alternatives to expensive beauty products',
    category: 'Beauty & Personal Care',
    icon: '💰',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '100-250 words',
    useCase: 'Budget-friendly beauty recommendations',
    example: 'This $15 dupe works just like the $150 original',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'makeup_tutorial': {
    id: 'makeup_tutorial',
    name: 'Makeup Tutorial',
    description: 'Step-by-step makeup application guide',
    category: 'Beauty & Personal Care',
    icon: '💋',
    platforms: ['YouTube', 'Instagram', 'TikTok'],
    estimatedLength: '300-600 words',
    useCase: 'Educational makeup content with product focus',
    example: 'Get ready with me - evening glam look',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'haircare_routine': {
    id: 'haircare_routine',
    name: 'Hair Care Routine',
    description: 'Complete hair care regimen and tips',
    category: 'Beauty & Personal Care',
    icon: '💇‍♀️',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Hair care education and product integration',
    example: 'My weekly hair care routine for damaged hair',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'grooming_guide': {
    id: 'grooming_guide',
    name: 'Grooming Guide',
    description: 'Personal care and grooming tips for men',
    category: 'Beauty & Personal Care',
    icon: '🧔',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Male grooming education and product recommendations',
    example: 'Complete men\'s grooming routine in 10 minutes',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Supplements & Fitness Specific (5 templates)
  'supplement_stack': {
    id: 'supplement_stack',
    name: 'Supplement Stack',
    description: 'Complete supplement routine breakdown',
    category: 'Supplements & Fitness',
    icon: '💊',
    platforms: ['All'],
    estimatedLength: '400-700 words',
    useCase: 'Comprehensive supplement education',
    example: 'My complete muscle-building supplement stack',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'eat_in_day': {
    id: 'eat_in_day',
    name: 'What I Eat in a Day',
    description: 'Daily nutrition breakdown with supplements',
    category: 'Supplements & Fitness',
    icon: '🍽️',
    platforms: ['Instagram', 'TikTok', 'YouTube'],
    estimatedLength: '300-500 words',
    useCase: 'Lifestyle content with product integration',
    example: 'Full day of eating + my supplement routine',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'best_supplements': {
    id: 'best_supplements',
    name: 'Best Supplements List',
    description: 'Top supplement recommendations for specific goals',
    category: 'Supplements & Fitness',
    icon: '🏆',
    platforms: ['All'],
    estimatedLength: '500-800 words',
    useCase: 'Goal-oriented supplement recommendations',
    example: '5 best supplements for muscle recovery',
    usesProduct: false,
    contentType: 'generic'
  },
  'myth_busting': {
    id: 'myth_busting',
    name: 'Myth Busting',
    description: 'Debunk fitness and supplement misconceptions',
    category: 'Supplements & Fitness',
    icon: '❌',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Educational authority building',
    example: 'Common protein powder myths debunked',
    usesProduct: false,
    contentType: 'generic'
  },
  'fitness_influencer': {
    id: 'fitness_influencer',
    name: 'Fitness Influencer Voice',
    description: 'Motivational fitness content with energy',
    category: 'Supplements & Fitness',
    icon: '💪',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '50-100 words',
    useCase: 'High-energy motivational content',
    example: 'Pump-up workout motivation with supplement mention',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Tech & Gadgets Specific (5 templates)
  'unboxing': {
    id: 'unboxing',
    name: 'Unboxing Experience',
    description: 'First impressions and unboxing excitement',
    category: 'Tech & Gadgets',
    icon: '📦',
    platforms: ['YouTube', 'TikTok', 'Instagram'],
    estimatedLength: '200-400 words',
    useCase: 'Generate excitement for new tech products',
    example: 'Unboxing the new iPhone - first reactions',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'top_use_cases': {
    id: 'top_use_cases',
    name: 'Top Use Cases',
    description: 'Best ways to utilize tech products',
    category: 'Tech & Gadgets',
    icon: '💡',
    platforms: ['All'],
    estimatedLength: '300-600 words',
    useCase: 'Demonstrate product versatility and value',
    example: 'Top 5 ways to use this smart home device',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'worth_it': {
    id: 'worth_it',
    name: 'Is It Worth It?',
    description: 'Honest value assessment and buying advice',
    category: 'Tech & Gadgets',
    icon: '💰',
    platforms: ['All'],
    estimatedLength: '400-700 words',
    useCase: 'Help audience make informed purchase decisions',
    example: 'Is the Apple Watch Series 9 worth $400?',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'setup_guide': {
    id: 'setup_guide',
    name: 'Setup Guide',
    description: 'Step-by-step product setup and configuration',
    category: 'Tech & Gadgets',
    icon: '⚙️',
    platforms: ['YouTube', 'Blog'],
    estimatedLength: '500-900 words',
    useCase: 'Educational how-to content',
    example: 'Complete setup guide for your new router',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'hidden_features': {
    id: 'hidden_features',
    name: 'Hidden Features',
    description: 'Lesser-known capabilities and tricks',
    category: 'Tech & Gadgets',
    icon: '🔍',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '150-300 words',
    useCase: 'Add value through insider knowledge',
    example: '5 hidden iPhone features you never knew existed',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Home & Kitchen Specific (5 templates)
  'pinterest_style': {
    id: 'pinterest_style',
    name: 'Pinterest Style',
    description: 'Aesthetic home and kitchen inspiration',
    category: 'Home & Kitchen',
    icon: '📌',
    platforms: ['Pinterest', 'Instagram'],
    estimatedLength: '100-250 words',
    useCase: 'Visual inspiration and lifestyle content',
    example: 'Cozy kitchen essentials for fall baking',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'product_recipe': {
    id: 'product_recipe',
    name: 'Recipe Featuring Product',
    description: 'Recipe that highlights specific kitchen tools',
    category: 'Home & Kitchen',
    icon: '🍳',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Demonstrate product utility through cooking',
    example: 'Perfect pasta using this amazing pot',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'why_switched': {
    id: 'why_switched',
    name: 'Why I Switched',
    description: 'Personal story about changing to a new product',
    category: 'Home & Kitchen',
    icon: '🔄',
    platforms: ['All'],
    estimatedLength: '250-400 words',
    useCase: 'Build trust through authentic experience',
    example: 'Why I switched to this coffee maker',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'amazon_finds': {
    id: 'amazon_finds',
    name: 'Amazon Finds',
    description: 'Curated list of great Amazon kitchen products',
    category: 'Home & Kitchen',
    icon: '🛒',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '200-400 words',
    useCase: 'Product discovery and shopping inspiration',
    example: 'Amazing kitchen finds under $50',
    usesProduct: false,
    contentType: 'generic'
  },
  'kitchen_must_haves': {
    id: 'kitchen_must_haves',
    name: 'Kitchen Must-Haves',
    description: 'Essential kitchen tools every home cook needs',
    category: 'Home & Kitchen',
    icon: '🔪',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Authority content for cooking enthusiasts',
    example: '10 kitchen tools that changed my cooking',
    usesProduct: false,
    contentType: 'generic'
  },

  // Pet Products Specific (5 templates)
  'dog_testimonial': {
    id: 'dog_testimonial',
    name: 'Pet Testimonial',
    description: 'Pet owner success story with product results',
    category: 'Pet Products',
    icon: '🐕',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '150-300 words',
    useCase: 'Social proof through pet transformation stories',
    example: 'How this food transformed my dog\'s health',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'pet_owner_tips': {
    id: 'pet_owner_tips',
    name: 'Pet Owner Tips',
    description: 'Essential advice for pet care and training',
    category: 'Pet Products',
    icon: '💡',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Educational content for pet parents',
    example: '5 things I wish I knew before getting a puppy',
    usesProduct: false,
    contentType: 'generic'
  },
  'grooming_before_after': {
    id: 'grooming_before_after',
    name: 'Grooming Transformation',
    description: 'Before and after pet grooming results',
    category: 'Pet Products',
    icon: '✨',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '100-250 words',
    useCase: 'Visual transformation content',
    example: 'Amazing grooming transformation with this brush',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'pet_parent_guide': {
    id: 'pet_parent_guide',
    name: 'Pet Parent Guide',
    description: 'Comprehensive pet ownership advice',
    category: 'Pet Products',
    icon: '📚',
    platforms: ['Blog', 'YouTube'],
    estimatedLength: '600-1000 words',
    useCase: 'Authority-building educational content',
    example: 'Complete guide to puppy training success',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'trainer_tip': {
    id: 'trainer_tip',
    name: 'Trainer Tip',
    description: 'Professional pet training advice and tricks',
    category: 'Pet Products',
    icon: '🎯',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '50-150 words',
    useCase: 'Quick expert tips that build authority',
    example: 'Pro trainer secret for leash training',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Fashion & Accessories Specific (5 templates)
  'style_this': {
    id: 'style_this',
    name: 'How to Style This',
    description: 'Multiple styling options for fashion items',
    category: 'Fashion & Accessories',
    icon: '👗',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '200-400 words',
    useCase: 'Show product versatility and inspire purchases',
    example: '5 ways to style this blazer from day to night',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'capsule_wardrobe': {
    id: 'capsule_wardrobe',
    name: 'Capsule Wardrobe',
    description: 'Essential pieces for a minimalist wardrobe',
    category: 'Fashion & Accessories',
    icon: '👔',
    platforms: ['All'],
    estimatedLength: '400-700 words',
    useCase: 'Wardrobe planning and investment pieces',
    example: 'Building a timeless capsule wardrobe',
    usesProduct: false,
    contentType: 'generic'
  },
  'dupes_lookalikes': {
    id: 'dupes_lookalikes',
    name: 'Dupes & Lookalikes',
    description: 'Affordable alternatives to designer pieces',
    category: 'Fashion & Accessories',
    icon: '💰',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '200-400 words',
    useCase: 'Budget-friendly fashion alternatives',
    example: 'Designer bag dupes that look identical',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'outfit_inspo': {
    id: 'outfit_inspo',
    name: 'Outfit Inspiration',
    description: 'Complete outfit ideas and styling inspiration',
    category: 'Fashion & Accessories',
    icon: '✨',
    platforms: ['Instagram', 'Pinterest'],
    estimatedLength: '150-300 words',
    useCase: 'Style inspiration and trend awareness',
    example: 'Fall outfit inspiration with cozy layers',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'haul_review': {
    id: 'haul_review',
    name: 'Haul Review',
    description: 'Honest review of multiple fashion purchases',
    category: 'Fashion & Accessories',
    icon: '🛍️',
    platforms: ['YouTube', 'TikTok'],
    estimatedLength: '400-700 words',
    useCase: 'Comprehensive shopping reviews and recommendations',
    example: 'Zara haul - hits, misses, and styling tips',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Outdoor & Sports Gear Specific (5 templates)
  'gear_breakdown': {
    id: 'gear_breakdown',
    name: 'Gear Breakdown',
    description: 'Detailed outdoor equipment analysis',
    category: 'Outdoor & Sports Gear',
    icon: '🏔️',
    platforms: ['YouTube', 'Blog'],
    estimatedLength: '500-900 words',
    useCase: 'In-depth gear reviews for outdoor enthusiasts',
    example: 'Complete backpacking gear breakdown',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'adventure_vlog': {
    id: 'adventure_vlog',
    name: 'Adventure Vlog',
    description: 'Outdoor adventure story with gear highlights',
    category: 'Outdoor & Sports Gear',
    icon: '🎬',
    platforms: ['YouTube', 'Instagram'],
    estimatedLength: '400-700 words',
    useCase: 'Storytelling content with product integration',
    example: 'Epic hiking adventure with my new boots',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'durability_test': {
    id: 'durability_test',
    name: 'Durability Test',
    description: 'Real-world product testing and performance',
    category: 'Outdoor & Sports Gear',
    icon: '🧪',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Prove product reliability through testing',
    example: 'Testing this jacket in extreme weather',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'season_prep': {
    id: 'season_prep',
    name: 'Seasonal Preparation',
    description: 'Gear recommendations for upcoming seasons',
    category: 'Outdoor & Sports Gear',
    icon: '📅',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Timely seasonal gear recommendations',
    example: 'Essential winter camping gear checklist',
    usesProduct: false,
    contentType: 'generic'
  },
  'workout_gear': {
    id: 'workout_gear',
    name: 'Workout Gear',
    description: 'Athletic equipment for fitness routines',
    category: 'Outdoor & Sports Gear',
    icon: '🏃‍♀️',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Fitness equipment recommendations',
    example: 'Best home gym equipment for small spaces',
    usesProduct: true,
    contentType: 'product-focused'
  },

  // Legacy templates for backward compatibility
  'personal_review': {
    id: 'personal_review',
    name: 'Personal Review',
    description: 'Authentic personal experience with product',
    category: 'Legacy',
    icon: '⭐',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Build trust through personal experience',
    example: 'My honest review after 30 days of use',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'surprise_me': {
    id: 'surprise_me',
    name: 'Surprise Me!',
    description: 'Random template selection for creative inspiration',
    category: 'Legacy',
    icon: '🎲',
    platforms: ['All'],
    estimatedLength: 'Varies',
    useCase: 'Break creative blocks with random selection',
    example: 'Surprise content format selection',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'tiktok_breakdown': {
    id: 'tiktok_breakdown',
    name: 'TikTok Trend Breakdown',
    description: 'Analysis of current TikTok trends',
    category: 'Legacy',
    icon: '📱',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '200-400 words',
    useCase: 'Capitalize on viral trends',
    example: 'Breaking down this viral skincare trend',
    usesProduct: false,
    contentType: 'generic'
  },
  'dry_skin_list': {
    id: 'dry_skin_list',
    name: 'Dry Skin Essentials',
    description: 'Products specifically for dry skin',
    category: 'Legacy',
    icon: '💧',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Targeted skincare recommendations',
    example: 'Must-have products for extremely dry skin',
    usesProduct: false,
    contentType: 'generic'
  },
  'top5_under25': {
    id: 'top5_under25',
    name: 'Budget Finds Under $25',
    description: 'Affordable product recommendations',
    category: 'Legacy',
    icon: '💰',
    platforms: ['All'],
    estimatedLength: '250-400 words',
    useCase: 'Budget-conscious product curation',
    example: 'Top 5 skincare products under $25',
    usesProduct: false,
    contentType: 'generic'
  },
  'recipe': {
    id: 'recipe',
    name: 'Recipe with Product',
    description: 'Recipe featuring kitchen tools or ingredients',
    category: 'Legacy',
    icon: '🍳',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Food content with product integration',
    example: 'Easy pasta recipe using this amazing pan',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'packing_list': {
    id: 'packing_list',
    name: 'Travel Packing List',
    description: 'Essential items for travel destinations',
    category: 'Legacy',
    icon: '🧳',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Travel preparation and gear recommendations',
    example: 'Complete packing list for Europe trip',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'demo_script': {
    id: 'demo_script',
    name: 'Product Demo Script',
    description: 'Step-by-step product demonstration',
    category: 'Legacy',
    icon: '🎥',
    platforms: ['YouTube', 'TikTok'],
    estimatedLength: '200-400 words',
    useCase: 'Educational product showcases',
    example: 'How to use this kitchen gadget like a pro',
    usesProduct: true,
    contentType: 'product-focused'
  },
  'drugstore_dupe': {
    id: 'drugstore_dupe',
    name: 'Drugstore Dupe',
    description: 'Affordable drugstore alternatives',
    category: 'Legacy',
    icon: '🏪',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '150-300 words',
    useCase: 'Budget beauty and personal care options',
    example: 'This $8 drugstore cream works like $80 luxury',
    usesProduct: true,
    contentType: 'product-focused'
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