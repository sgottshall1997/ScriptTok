// Frontend type definitions for consistency with backend

export interface TrendingProduct {
  id: number;
  title: string;
  source: string;
  mentions?: number;
  sourceUrl?: string;
  createdAt: string;
}

export interface ContentGeneration {
  id: number;
  product: string;
  templateType: string;
  tone: string;
  niche: string;
  content: string;
  createdAt: string;
}

export interface ScraperStatus {
  id: number;
  name: string;
  status: 'active' | 'gpt-fallback' | 'degraded' | 'error' | 'rate-limited';
  lastCheck: string;
  errorMessage?: string;
}

export interface ApiUsage {
  today: number;
  weekly: number;
  monthly: number;
  limit: number;
}

export interface GenerationFormData {
  product: string;
  templateType: string;
  tone: string;
  niche: string;
}

export interface GenerationResponse {
  product: string;
  templateType: string;
  tone: string;
  niche: string;
  content: string;
  fromCache: boolean;
  videoDuration: {
    seconds: number;
    readableTime: string;
    wordCount: number;
    pacing: 'slow' | 'moderate' | 'fast';
    isIdealLength: boolean;
    lengthFeedback: string;
  };
}

// Source branding colors for platforms
export const SOURCE_COLORS = {
  tiktok: 'bg-green-100 text-green-800',
  instagram: 'bg-indigo-100 text-indigo-800',
  youtube: 'bg-red-100 text-red-800',
  reddit: 'bg-purple-100 text-purple-800',
  amazon: 'bg-amber-100 text-amber-800',
  'google-trends': 'bg-blue-100 text-blue-800'
};

// Scraper status interface matching backend schema
export interface ScraperStatus {
  id: number;
  name: string;
  status: string; // "active", "gpt-fallback", "degraded", "error", "rate-limited"
  lastCheck: string;
  errorMessage: string | null;
}

// Status colors for scraper health
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  'gpt-fallback': 'bg-blue-100 text-blue-800',
  degraded: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  'rate-limited': 'bg-purple-100 text-purple-800'
};

// Template option interface
export interface TemplateOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Universal template options (available for all niches)
export const UNIVERSAL_TEMPLATE_OPTIONS: TemplateOption[] = [
  { value: 'seo_blog', label: 'SEO Blog Post (1000+ words)' },
  { value: 'short_video', label: 'Short-Form Video Script' },
  { value: 'influencer_caption', label: 'Influencer Caption' },
  { value: 'product_comparison', label: 'Product Comparison' },
  { value: 'routine_kit', label: 'Routine/Kit Builder' },
  { value: 'bullet_points', label: 'Bullet-Point Summary' },
  { value: 'trending_explainer', label: 'Why It\'s Trending' },
  { value: 'buyer_persona', label: 'Buyer Persona Targeting' },
  { value: 'affiliate_email', label: 'Affiliate Email Blurb' }
];

// Skincare & Beauty specific templates
export const SKINCARE_TEMPLATE_OPTIONS = [
  { value: 'skincare_routine', label: 'Morning & Night Routine' },
  { value: 'derm_approved', label: 'Dermatologist-Approved Skit' },
  { value: 'transformation', label: 'Before & After Transformation' },
  { value: 'skin_type_list', label: '5 Must-Haves for Skin Type' },
  { value: 'dupe_alert', label: 'Dupe Alert Comparison' }
];

// Fitness specific templates
export const FITNESS_TEMPLATE_OPTIONS = [
  { value: 'supplement_stack', label: 'Supplement Stack Guide' },
  { value: 'eat_in_day', label: 'What I Eat in a Day' },
  { value: 'best_supplements', label: 'Best Supplements for Goal' },
  { value: 'myth_busting', label: 'Myth-Busting Content' },
  { value: 'fitness_influencer', label: 'Fitness Influencer Voiceover' }
];

// Tech specific templates
export const TECH_TEMPLATE_OPTIONS = [
  { value: 'unboxing', label: 'Unboxing Experience' },
  { value: 'top_use_cases', label: 'Top 5 Use Cases' },
  { value: 'worth_it', label: 'Is It Worth It? Analysis' },
  { value: 'setup_guide', label: 'Setup Guide' },
  { value: 'hidden_features', label: 'Hidden Features Spotlight' }
];

// Home & Kitchen specific templates
export const HOME_TEMPLATE_OPTIONS = [
  { value: 'pinterest_style', label: 'Pinterest-Style Description' },
  { value: 'product_recipe', label: 'Recipe Using Product' },
  { value: 'why_switched', label: 'Why I Switched Narrative' },
  { value: 'amazon_finds', label: 'Amazon Finds Under $50' },
  { value: 'kitchen_must_haves', label: 'Kitchen Must-Haves' }
];

// Pet specific templates
export const PET_TEMPLATE_OPTIONS = [
  { value: 'dog_testimonial', label: 'Dog Testimonial Voiceover' },
  { value: 'pet_owner_tips', label: 'Pet Owner Tips & Tricks' },
  { value: 'grooming_before_after', label: 'Grooming Before & After' },
  { value: 'pet_parent_guide', label: 'Pet Parent Guide' },
  { value: 'trainer_tip', label: 'Trainer Tip Skit' }
];

// Fashion specific templates
export const FASHION_TEMPLATE_OPTIONS = [
  { value: 'style_this', label: 'How to Style This' },
  { value: 'capsule_wardrobe', label: 'Seasonal Capsule Wardrobe' },
  { value: 'dupes_lookalikes', label: 'Dupes & Lookalikes' },
  { value: 'outfit_inspo', label: 'Outfit Inspiration' },
  { value: 'haul_review', label: 'Haul Review' }
];

// Outdoor & Sports specific templates
export const OUTDOOR_TEMPLATE_OPTIONS = [
  { value: 'packlist', label: 'Weekend Warrior Packlist' },
  { value: 'gear_breakdown', label: 'Gear Breakdown' },
  { value: 'adventure_vlog', label: 'Adventure Vlog Script' },
  { value: 'durability_test', label: 'Durability Test' },
  { value: 'top_activity', label: 'Top 5 for Activity' }
];

// Legacy templates (for backward compatibility)
export const LEGACY_TEMPLATE_OPTIONS = [
  { value: 'original', label: 'Original Review' },
  { value: 'comparison', label: 'Classic Product Comparison' },
  { value: 'caption', label: 'Basic Social Media Caption' },
  { value: 'pros_cons', label: 'Pros & Cons List' }
];

// Mapping of niches to their specific template options
export const NICHE_TEMPLATE_MAP = {
  skincare: SKINCARE_TEMPLATE_OPTIONS,
  tech: TECH_TEMPLATE_OPTIONS,
  fashion: FASHION_TEMPLATE_OPTIONS,
  fitness: FITNESS_TEMPLATE_OPTIONS,
  food: HOME_TEMPLATE_OPTIONS, // Food fits best with Home & Kitchen
  travel: OUTDOOR_TEMPLATE_OPTIONS, // Travel fits best with Outdoor
  pet: PET_TEMPLATE_OPTIONS
};

// Combined template type options for the dropdown
export const TEMPLATE_TYPE_OPTIONS = [
  // We'll dynamically combine universal and niche-specific templates in the component
  ...UNIVERSAL_TEMPLATE_OPTIONS,
  ...LEGACY_TEMPLATE_OPTIONS
];

// Tone options
export const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly & Approachable' },
  { value: 'professional', label: 'Professional & Expert' },
  { value: 'enthusiastic', label: 'Enthusiastic & Excited' },
  { value: 'minimalist', label: 'Minimalist & Direct' }
];
