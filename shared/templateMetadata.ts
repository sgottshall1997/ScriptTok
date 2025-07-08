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
    example: 'Comprehensive guide with headings, keywords, and internal links'
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
    example: 'Hook + Problem + Solution + CTA format'
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
    example: 'Personal story + product mention + relevant hashtags'
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
    example: 'Product A vs Product B feature comparison table'
  },
  'routine_kit': {
    id: 'routine_kit',
    name: 'Routine Builder',
    description: 'Step-by-step routine or kit recommendations',
    category: 'Universal',
    icon: '📋',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Guide users through complete workflows',
    example: 'Morning skincare routine with product order'
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
    example: '5 reasons why this product is trending'
  },
  'trending_explainer': {
    id: 'trending_explainer',
    name: 'Trending Explainer',
    description: 'Explain why a product or trend is popular',
    category: 'Universal',
    icon: '🔥',
    platforms: ['All'],
    estimatedLength: '150-250 words',
    useCase: 'Capitalize on current trends',
    example: 'Why everyone is obsessed with this product'
  },
  'buyer_persona': {
    id: 'buyer_persona',
    name: 'Buyer Persona Targeting',
    description: 'Content tailored to specific demographics',
    category: 'Universal',
    icon: '🎯',
    platforms: ['All'],
    estimatedLength: '200-300 words',
    useCase: 'Highly targeted audience engagement',
    example: 'Perfect for busy moms who want quick results'
  },
  'affiliate_email': {
    id: 'affiliate_email',
    name: 'Affiliate Email',
    description: '1-2 paragraph product promo for email marketing',
    category: 'Universal',
    icon: '📧',
    platforms: ['Email'],
    estimatedLength: '100-200 words',
    useCase: 'Direct monetization through email lists',
    example: 'Subject line + personal story + product pitch + link'
  },

  // Beauty & Personal Care Specific
  'skincare_routine': {
    id: 'skincare_routine',
    name: 'Beauty Routine',
    description: 'Morning and night beauty routine templates',
    category: 'Beauty & Personal Care',
    icon: '🧴',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Educational beauty content',
    example: 'AM/PM routine with product order and benefits'
  },
  'derm_approved': {
    id: 'derm_approved',
    name: 'Expert Approved',
    description: 'Professional-backed product recommendations',
    category: 'Beauty & Personal Care',
    icon: '👩‍⚕️',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '30-60 seconds',
    useCase: 'Build trust with professional credibility',
    example: 'Expert explains why this ingredient works'
  },
  'transformation': {
    id: 'transformation',
    name: 'Transformation Story',
    description: 'Before and after transformation captions',
    category: 'Beauty & Personal Care',
    icon: '✨',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '100-200 words',
    useCase: 'Visual proof of product effectiveness',
    example: 'My beauty journey using this product for 30 days'
  },
  'skin_type_list': {
    id: 'skin_type_list',
    name: 'Product Type List',
    description: 'Product recommendations by personal needs',
    category: 'Beauty & Personal Care',
    icon: '📝',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Personalized product recommendations',
    example: '5 must-haves for oily skin'
  },
  'dupe_alert': {
    id: 'dupe_alert',
    name: 'Dupe Alert',
    description: 'Affordable alternatives to expensive products',
    category: 'Skincare',
    icon: '💡',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '30-45 seconds',
    useCase: 'Value-conscious audience engagement',
    example: '$10 dupe for $200 luxury cream'
  },

  // Fitness Specific
  'supplement_stack': {
    id: 'supplement_stack',
    name: 'Supplement Stack',
    description: 'Complete supplement recommendations',
    category: 'Fitness',
    icon: '💊',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Comprehensive fitness guidance',
    example: 'My daily supplement stack for muscle building'
  },
  'eat_in_day': {
    id: 'eat_in_day',
    name: 'What I Eat in a Day',
    description: 'Daily meal and supplement routine',
    category: 'Fitness',
    icon: '🍽️',
    platforms: ['TikTok', 'Instagram', 'YouTube'],
    estimatedLength: '60-90 seconds',
    useCase: 'Lifestyle and routine inspiration',
    example: 'Full day of eating for weight loss'
  },
  'best_supplements': {
    id: 'best_supplements',
    name: 'Best Supplements List',
    description: 'Top supplement recommendations for specific goals',
    category: 'Fitness',
    icon: '🏆',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Goal-specific product recommendations',
    example: '5 best supplements for muscle recovery'
  },
  'myth_busting': {
    id: 'myth_busting',
    name: 'Myth Busting',
    description: 'Debunk common fitness and supplement myths',
    category: 'Fitness',
    icon: '❌',
    platforms: ['All'],
    estimatedLength: '200-300 words',
    useCase: 'Educational authority building',
    example: 'Protein powder myths that need to die'
  },
  'fitness_influencer': {
    id: 'fitness_influencer',
    name: 'Fitness Influencer Voice',
    description: 'Motivational fitness content with product integration',
    category: 'Fitness',
    icon: '💪',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '30-60 seconds',
    useCase: 'Inspirational fitness content',
    example: 'Workout motivation with supplement mention'
  },

  // Tech Specific
  'unboxing': {
    id: 'unboxing',
    name: 'Unboxing Experience',
    description: 'First impressions and unboxing script',
    category: 'Tech',
    icon: '📦',
    platforms: ['YouTube', 'TikTok', 'Instagram'],
    estimatedLength: '60-120 seconds',
    useCase: 'Generate excitement for new products',
    example: 'Unboxing the latest iPhone with first reactions'
  },
  'top_use_cases': {
    id: 'top_use_cases',
    name: 'Top Use Cases',
    description: 'Practical applications and scenarios',
    category: 'Tech',
    icon: '🔧',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Help users understand product value',
    example: '5 ways I use my smartwatch daily'
  },
  'worth_it': {
    id: 'worth_it',
    name: 'Is It Worth It?',
    description: 'Value analysis and purchase recommendation',
    category: 'Tech',
    icon: '💰',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Help with purchase decisions',
    example: 'Is the new MacBook worth the upgrade?'
  },
  'setup_guide': {
    id: 'setup_guide',
    name: 'Setup Guide',
    description: 'Step-by-step product setup instructions',
    category: 'Tech',
    icon: '⚙️',
    platforms: ['YouTube', 'Blog'],
    estimatedLength: '500-800 words',
    useCase: 'Educational how-to content',
    example: 'Complete smart home setup guide'
  },
  'hidden_features': {
    id: 'hidden_features',
    name: 'Hidden Features',
    description: 'Lesser-known tips and tricks',
    category: 'Tech',
    icon: '🔍',
    platforms: ['All'],
    estimatedLength: '150-300 words',
    useCase: 'Add value for existing users',
    example: '5 hidden iPhone features you need to know'
  },

  // Home & Kitchen
  'pinterest_style': {
    id: 'pinterest_style',
    name: 'Pinterest Style',
    description: 'Aesthetic descriptions perfect for Pinterest',
    category: 'Home',
    icon: '📌',
    platforms: ['Pinterest', 'Instagram'],
    estimatedLength: '50-150 words',
    useCase: 'Drive Pinterest traffic and saves',
    example: 'Cozy fall decor ideas for your living room'
  },
  'product_recipe': {
    id: 'product_recipe',
    name: 'Recipe Featuring Product',
    description: 'Recipe that showcases kitchen products',
    category: 'Food',
    icon: '👩‍🍳',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Natural product integration in recipes',
    example: 'Perfect pasta using this amazing pan'
  },
  'why_switched': {
    id: 'why_switched',
    name: 'Why I Switched',
    description: 'Personal narrative about product change',
    category: 'Home',
    icon: '🔄',
    platforms: ['All'],
    estimatedLength: '200-300 words',
    useCase: 'Build trust through personal experience',
    example: 'Why I switched to this coffee maker'
  },
  'amazon_finds': {
    id: 'amazon_finds',
    name: 'Amazon Finds',
    description: 'Curated Amazon product discoveries',
    category: 'Home',
    icon: '📦',
    platforms: ['All'],
    estimatedLength: '150-250 words',
    useCase: 'Capitalize on Amazon shopping trends',
    example: 'Amazon home finds under $25'
  },
  'kitchen_must_haves': {
    id: 'kitchen_must_haves',
    name: 'Kitchen Must-Haves',
    description: 'Essential kitchen product recommendations',
    category: 'Food',
    icon: '🍳',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Kitchen and cooking enthusiasts',
    example: '10 kitchen gadgets that changed my cooking'
  },

  // Pet Products
  'dog_testimonial': {
    id: 'dog_testimonial',
    name: 'Pet Testimonial',
    description: 'Fun pet voiceover testimonial script',
    category: 'Pet',
    icon: '🐕',
    platforms: ['TikTok', 'Instagram'],
    estimatedLength: '30-45 seconds',
    useCase: 'Entertaining pet product reviews',
    example: 'My dog reviews this new toy (voiceover)'
  },
  'pet_owner_tips': {
    id: 'pet_owner_tips',
    name: 'Pet Owner Tips',
    description: 'Helpful advice for pet parents',
    category: 'Pet',
    icon: '💡',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Educational pet care content',
    example: '5 things I wish I knew as a new dog owner'
  },
  'grooming_before_after': {
    id: 'grooming_before_after',
    name: 'Grooming Transformation',
    description: 'Before/after grooming product results',
    category: 'Pet',
    icon: '✂️',
    platforms: ['Instagram', 'TikTok'],
    estimatedLength: '100-200 words',
    useCase: 'Visual product effectiveness',
    example: 'My dogs grooming transformation'
  },
  'pet_parent_guide': {
    id: 'pet_parent_guide',
    name: 'Pet Parent Guide',
    description: 'Comprehensive pet care guidance',
    category: 'Pet',
    icon: '📖',
    platforms: ['All'],
    estimatedLength: '500-800 words',
    useCase: 'In-depth pet education',
    example: 'Complete guide to puppy training essentials'
  },
  'trainer_tip': {
    id: 'trainer_tip',
    name: 'Trainer Tip',
    description: 'Professional training advice with products',
    category: 'Pet',
    icon: '🎓',
    platforms: ['All'],
    estimatedLength: '150-300 words',
    useCase: 'Expert authority in pet training',
    example: 'Pro trainer tip for reducing barking'
  },

  // Fashion
  'style_this': {
    id: 'style_this',
    name: 'How to Style This',
    description: 'Styling guide for fashion items',
    category: 'Fashion',
    icon: '👗',
    platforms: ['Instagram', 'TikTok', 'Pinterest'],
    estimatedLength: '30-60 seconds',
    useCase: 'Fashion inspiration and styling tips',
    example: '3 ways to style this jacket'
  },
  'capsule_wardrobe': {
    id: 'capsule_wardrobe',
    name: 'Capsule Wardrobe',
    description: 'Seasonal wardrobe essentials guide',
    category: 'Fashion',
    icon: '👚',
    platforms: ['All'],
    estimatedLength: '400-600 words',
    useCase: 'Minimalist fashion content',
    example: 'Fall capsule wardrobe essentials'
  },
  'dupes_lookalikes': {
    id: 'dupes_lookalikes',
    name: 'Dupes & Lookalikes',
    description: 'Affordable alternatives to designer items',
    category: 'Fashion',
    icon: '👯',
    platforms: ['All'],
    estimatedLength: '200-300 words',
    useCase: 'Budget-conscious fashion shoppers',
    example: 'Designer handbag dupes under $50'
  },
  'outfit_inspo': {
    id: 'outfit_inspo',
    name: 'Outfit Inspiration',
    description: 'Complete outfit ideas and inspiration',
    category: 'Fashion',
    icon: '✨',
    platforms: ['Instagram', 'Pinterest'],
    estimatedLength: '100-200 words',
    useCase: 'Daily fashion inspiration',
    example: 'Cozy fall outfit ideas for work'
  },
  'haul_review': {
    id: 'haul_review',
    name: 'Haul Review',
    description: 'Fashion haul with honest reviews',
    category: 'Fashion',
    icon: '🛍️',
    platforms: ['YouTube', 'TikTok'],
    estimatedLength: '90-180 seconds',
    useCase: 'Shopping entertainment and reviews',
    example: 'Trying viral TikTok fashion finds'
  },

  // Outdoor & Sports
  'packlist': {
    id: 'packlist',
    name: 'Adventure Packlist',
    description: 'Essential gear for outdoor activities',
    category: 'Travel',
    icon: '🎒',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Outdoor enthusiast guidance',
    example: 'Weekend camping essentials checklist'
  },
  'gear_breakdown': {
    id: 'gear_breakdown',
    name: 'Gear Breakdown',
    description: 'Detailed equipment analysis and reviews',
    category: 'Travel',
    icon: '⚙️',
    platforms: ['YouTube', 'Blog'],
    estimatedLength: '500-800 words',
    useCase: 'Serious outdoor gear reviews',
    example: 'Backpacking tent comparison and review'
  },
  'adventure_vlog': {
    id: 'adventure_vlog',
    name: 'Adventure Vlog',
    description: 'Travel adventure script with gear mentions',
    category: 'Travel',
    icon: '🏔️',
    platforms: ['YouTube', 'TikTok'],
    estimatedLength: '120-300 seconds',
    useCase: 'Travel inspiration with product placement',
    example: 'Mountain hiking adventure with gear review'
  },
  'durability_test': {
    id: 'durability_test',
    name: 'Durability Test',
    description: 'Product durability and stress testing',
    category: 'Travel',
    icon: '🔨',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Build trust in product quality',
    example: 'Testing this backpack in extreme conditions'
  },
  'top_activity': {
    id: 'top_activity',
    name: 'Top Gear for Activity',
    description: 'Best equipment for specific activities',
    category: 'Travel',
    icon: '🏆',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Activity-specific recommendations',
    example: 'Top 5 hiking boots for beginners'
  },

  // Legacy Templates (for backward compatibility)
  'original': {
    id: 'original',
    name: 'Original Review',
    description: 'Classic product review format',
    category: 'Legacy',
    icon: '📋',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Standard product reviews',
    example: 'Honest review of this product'
  },
  'comparison': {
    id: 'comparison',
    name: 'Product Comparison',
    description: 'Compare multiple products',
    category: 'Legacy',
    icon: '⚖️',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Help with product decisions',
    example: 'Product A vs Product B comparison'
  },
  'caption': {
    id: 'caption',
    name: 'Social Caption',
    description: 'Simple social media caption',
    category: 'Legacy',
    icon: '💬',
    platforms: ['Social'],
    estimatedLength: '50-150 words',
    useCase: 'Quick social media posts',
    example: 'Loving this new product!'
  },
  'pros_cons': {
    id: 'pros_cons',
    name: 'Pros & Cons',
    description: 'Balanced pros and cons list',
    category: 'Legacy',
    icon: '📊',
    platforms: ['All'],
    estimatedLength: '150-300 words',
    useCase: 'Objective product analysis',
    example: 'The good, bad, and ugly of this product'
  },
  'routine': {
    id: 'routine',
    name: 'Product Routine',
    description: 'How to incorporate into daily routine',
    category: 'Legacy',
    icon: '🔄',
    platforms: ['All'],
    estimatedLength: '200-300 words',
    useCase: 'Usage guidance and tips',
    example: 'My daily routine with this product'
  },
  'beginner_kit': {
    id: 'beginner_kit',
    name: 'Beginner Kit',
    description: 'Starter recommendations for beginners',
    category: 'Legacy',
    icon: '🔰',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Help newcomers get started',
    example: 'Complete beginner skincare kit'
  },
  'demo_script': {
    id: 'demo_script',
    name: 'Product Demo',
    description: 'Step-by-step product demonstration',
    category: 'Legacy',
    icon: '🎥',
    platforms: ['Video'],
    estimatedLength: '60-120 seconds',
    useCase: 'Show product in action',
    example: 'How to use this tool properly'
  },
  'drugstore_dupe': {
    id: 'drugstore_dupe',
    name: 'Drugstore Dupe',
    description: 'Affordable drugstore alternatives',
    category: 'Legacy',
    icon: '💰',
    platforms: ['All'],
    estimatedLength: '150-250 words',
    useCase: 'Budget-friendly recommendations',
    example: 'Drugstore dupe for expensive cream'
  },
  'personal_review': {
    id: 'personal_review',
    name: 'Personal Review',
    description: 'Personal experience and honest opinion',
    category: 'Legacy',
    icon: '👤',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Build trust through personal stories',
    example: 'My honest experience with this product'
  },
  'surprise_me': {
    id: 'surprise_me',
    name: 'Surprise Me',
    description: 'Let AI choose the best template for your product',
    category: 'AI',
    icon: '🎲',
    platforms: ['All'],
    estimatedLength: 'Varies',
    useCase: 'When you want AI to optimize format choice',
    example: 'AI will analyze your product and pick the most effective format'
  },
  'tiktok_breakdown': {
    id: 'tiktok_breakdown',
    name: 'TikTok Breakdown',
    description: 'TikTok trend analysis and breakdown',
    category: 'Legacy',
    icon: '📱',
    platforms: ['TikTok'],
    estimatedLength: '30-60 seconds',
    useCase: 'Capitalize on TikTok trends',
    example: 'Breaking down this viral TikTok trend'
  },
  'dry_skin_list': {
    id: 'dry_skin_list',
    name: 'Dry Skin List',
    description: 'Products specifically for dry skin',
    category: 'Legacy',
    icon: '🧴',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Targeted skin concern content',
    example: 'Best products for extremely dry skin'
  },
  'top5_under25': {
    id: 'top5_under25',
    name: 'Budget Finds',
    description: 'Affordable product recommendations',
    category: 'Legacy',
    icon: '💵',
    platforms: ['All'],
    estimatedLength: '200-400 words',
    useCase: 'Budget-conscious shoppers',
    example: 'Top 5 skincare products under $25'
  },
  'recipe': {
    id: 'recipe',
    name: 'Recipe Feature',
    description: 'Recipe that features kitchen products',
    category: 'Legacy',
    icon: '👨‍🍳',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Natural product integration',
    example: 'Easy pasta recipe using this pan'
  },
  'packing_list': {
    id: 'packing_list',
    name: 'Travel Packing',
    description: 'Travel essentials and packing guide',
    category: 'Legacy',
    icon: '🧳',
    platforms: ['All'],
    estimatedLength: '300-500 words',
    useCase: 'Travel planning and preparation',
    example: 'Complete packing list for Europe trip'
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