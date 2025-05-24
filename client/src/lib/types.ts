// Trending product data structure
export interface TrendingProduct {
  id: number;
  title: string;
  source: string;
  mentions?: number;
  sourceUrl?: string;
  createdAt?: string;
  niche?: string;
  isAIGenerated?: boolean;
  errorReason?: string;
}

// Dashboard trending products response
export interface DashboardTrendingResponse {
  byNiche: Record<string, TrendingProduct[]>;
  count: number;
  lastRefresh: string;
  nextScheduledRefresh: string;
}

// Source platform colors for trending products
export const SOURCE_COLORS: Record<string, string> = {
  'tiktok': 'bg-pink-100 text-pink-800',
  'instagram': 'bg-purple-100 text-purple-800',
  'reddit': 'bg-orange-100 text-orange-800',
  'youtube': 'bg-red-100 text-red-800',
  'amazon': 'bg-yellow-100 text-yellow-800',
  'google-trends': 'bg-blue-100 text-blue-800',
  'openai': 'bg-emerald-100 text-emerald-800',
  'ai-tiktok': 'bg-blue-100 text-blue-800',
  'ai-instagram': 'bg-blue-100 text-blue-800',
  'ai-reddit': 'bg-blue-100 text-blue-800',
  'ai-youtube': 'bg-blue-100 text-blue-800',
  'ai-amazon': 'bg-blue-100 text-blue-800'
};

// Universal content template options
export const UNIVERSAL_TEMPLATE_OPTIONS = [
  { value: "seo_blog", label: "SEO Blog Post" },
  { value: "product_review", label: "Product Review" },
  { value: "social_post", label: "Social Media Post" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "comparison_article", label: "Comparison Article" },
  { value: "buying_guide", label: "Buying Guide" },
  { value: "how_to_guide", label: "How To Guide" },
  { value: "video_script", label: "Video Script" }
];

// Niche-specific template options
export const NICHE_TEMPLATE_MAP: Record<string, Array<{value: string, label: string}>> = {
  "skincare": [
    { value: "skin_routine", label: "Skincare Routine" },
    { value: "ingredient_analysis", label: "Ingredient Analysis" },
    { value: "skin_type_guide", label: "Skin Type Guide" }
  ],
  "tech": [
    { value: "tech_specs", label: "Technical Specifications" },
    { value: "setup_guide", label: "Setup Guide" },
    { value: "troubleshooting", label: "Troubleshooting Guide" }
  ],
  "fashion": [
    { value: "outfit_guide", label: "Outfit Guide" },
    { value: "season_trends", label: "Seasonal Trends" },
    { value: "styling_tips", label: "Styling Tips" }
  ],
  "fitness": [
    { value: "workout_routine", label: "Workout Routine" },
    { value: "equipment_guide", label: "Equipment Guide" },
    { value: "nutrition_tips", label: "Nutrition Tips" }
  ],
  "food": [
    { value: "recipe", label: "Recipe" },
    { value: "food_pairing", label: "Food Pairing Guide" },
    { value: "cooking_technique", label: "Cooking Technique" }
  ],
  "travel": [
    { value: "destination_guide", label: "Destination Guide" },
    { value: "packing_list", label: "Packing List" },
    { value: "travel_tips", label: "Travel Tips" }
  ],
  "pet": [
    { value: "pet_care", label: "Pet Care Guide" },
    { value: "training_tips", label: "Training Tips" },
    { value: "nutrition_guide", label: "Pet Nutrition Guide" }
  ]
};

// Content tone options
export const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly & Approachable" },
  { value: "professional", label: "Professional & Authoritative" },
  { value: "enthusiastic", label: "Enthusiastic & Energetic" },
  { value: "informative", label: "Informative & Educational" },
  { value: "conversational", label: "Conversational & Casual" },
  { value: "humorous", label: "Humorous & Light-hearted" },
  { value: "serious", label: "Serious & Straightforward" },
  { value: "persuasive", label: "Persuasive & Compelling" },
  { value: "empathetic", label: "Empathetic & Understanding" },
  { value: "inspirational", label: "Inspirational & Motivating" }
];

export interface GenerationResponse {
  success: boolean;
  data?: {
    content: string;
    summary: string;
    tags: string[];
    product: string;
    templateType: string;
    tone: string;
    niche: string;
    fallbackLevel: string;
    fromCache: boolean;
    videoDuration?: any;
    model?: string;
  };
  error?: string;
}