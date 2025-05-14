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
}

export interface GenerationResponse {
  product: string;
  templateType: string;
  tone: string;
  content: string;
  fromCache: boolean;
  videoDuration: {
    seconds: number;
    readableTime: string;
    wordCount: number;
    pacing: 'slow' | 'moderate' | 'fast';
  };
}

// Source branding colors for platforms
export const SOURCE_COLORS = {
  tiktok: 'bg-green-100 text-green-800',
  instagram: 'bg-indigo-100 text-indigo-800',
  youtube: 'bg-red-100 text-red-800',
  reddit: 'bg-purple-100 text-purple-800',
  amazon: 'bg-amber-100 text-amber-800'
};

// Status colors for scraper health
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  'gpt-fallback': 'bg-blue-100 text-blue-800',
  degraded: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  'rate-limited': 'bg-purple-100 text-purple-800'
};

// Template type options
export const TEMPLATE_TYPE_OPTIONS = [
  { value: 'original', label: 'Original Review' },
  { value: 'comparison', label: 'Product Comparison' },
  { value: 'caption', label: 'Social Media Caption' },
  { value: 'pros-cons', label: 'Pros & Cons' },
  { value: 'routine', label: 'Skincare Routine' }
];

// Tone options
export const TONE_OPTIONS = [
  { value: 'friendly', label: 'Friendly & Approachable' },
  { value: 'professional', label: 'Professional & Expert' },
  { value: 'enthusiastic', label: 'Enthusiastic & Excited' },
  { value: 'minimalist', label: 'Minimalist & Direct' }
];
