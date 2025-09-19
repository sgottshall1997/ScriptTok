import { z } from "zod";

// =============================================================================
// Unified Content Record Types
// =============================================================================

export type SourceApp = 'glowbot' | 'cookAIng';

/**
 * Unified content record interface used by both GlowBot and CookAIng
 * This provides a common structure while allowing each app to maintain their content types
 */
export interface ContentRecord {
  id: string;
  source_app: SourceApp;
  content_type: string; // CookAIng: blog_post, instagram_post, etc. GlowBot: seo_blog, product_review, etc.
  title?: string;
  body?: string;
  blocks?: Array<{ kind: string; text: string; [key: string]: any }>; // Flexible content blocks
  metadata: {
    // Common fields
    topic?: string;
    tone?: string;
    tags?: string[];
    product?: string;
    niche?: string;
    platform?: string;
    templateType?: string;
    
    // GlowBot specific
    affiliateLink?: string;
    viralInspo?: string;
    aiModel?: string;
    contentFormat?: string;
    topRatedStyleUsed?: boolean;
    useSmartStyle?: boolean;
    promptText?: string;
    platformsSelected?: string[];
    
    // CookAIng specific
    recipeId?: number;
    blueprintId?: number;
    persona?: string;
    channel?: string;
    duration?: string;
    cta?: string;
    sourceType?: 'recipe' | 'freeform';
    
    // Extensible metadata
    [key: string]: any;
  };
  rating?: number;          // 1–5 user rating
  is_favorite?: boolean;
  dedupe_hash?: string;     // For idempotency/deduping
  created_at: string;       // ISO timestamp
  updated_at: string;       // ISO timestamp
}

// Zod schema for validation
export const ContentRecordSchema = z.object({
  id: z.string(),
  source_app: z.enum(['glowbot', 'cookAIng']),
  content_type: z.string(),
  title: z.string().optional(),
  body: z.string().optional(),
  blocks: z.array(z.object({
    kind: z.string(),
    text: z.string(),
  }).passthrough()).optional(),
  metadata: z.object({
    topic: z.string().optional(),
    tone: z.string().optional(),
    tags: z.array(z.string()).optional(),
    product: z.string().optional(),
    niche: z.string().optional(),
    platform: z.string().optional(),
    templateType: z.string().optional(),
    affiliateLink: z.string().optional(),
    viralInspo: z.string().optional(),
    aiModel: z.string().optional(),
    contentFormat: z.string().optional(),
    topRatedStyleUsed: z.boolean().optional(),
    useSmartStyle: z.boolean().optional(),
    promptText: z.string().optional(),
    platformsSelected: z.array(z.string()).optional(),
    recipeId: z.number().optional(),
    blueprintId: z.number().optional(),
    persona: z.string().optional(),
    channel: z.string().optional(),
    duration: z.string().optional(),
    cta: z.string().optional(),
    sourceType: z.enum(['recipe', 'freeform']).optional(),
  }).passthrough(),
  rating: z.number().min(1).max(5).optional(),
  is_favorite: z.boolean().optional(),
  dedupe_hash: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// =============================================================================
// Content Type Definitions
// =============================================================================

// GlowBot content types (from existing system)
export const GLOWBOT_CONTENT_TYPES = [
  'seo_blog',
  'product_review',
  'social_post',
  'email_campaign',
  'comparison_article',
  'buying_guide',
  'how_to_guide',
  'video_script',
  'skin_routine',
  'ingredient_analysis',
  'tech_specs',
  'outfit_guide',
  'workout_routine',
  'recipe',
  'destination_guide',
  'pet_care'
] as const;

// CookAIng content types (from blueprint system)
export const COOKAING_CONTENT_TYPES = [
  'blog_post',
  'blog_recipe',
  'instagram_post',
  'youtube_script',
  'video_script_short',
  'video_script_long',
  'email_campaign',
  'push_notification',
  'social_media_content',
  'newsletter_content'
] as const;

export type GlowBotContentType = typeof GLOWBOT_CONTENT_TYPES[number];
export type CookAIngContentType = typeof COOKAING_CONTENT_TYPES[number];

// =============================================================================
// API Types
// =============================================================================

export interface ContentListParams {
  source_app?: SourceApp;
  content_types?: string[];
  q?: string;                    // Search query
  dateFrom?: string;            // ISO date
  dateTo?: string;              // ISO date
  page?: number;
  pageSize?: number;
  favoritesOnly?: boolean;
  rating?: number;              // Filter by minimum rating
  niche?: string;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'title_asc' | 'title_desc';
}

export interface PaginatedContentResponse {
  success: boolean;
  data: ContentRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export interface ContentActionResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// =============================================================================
// Database Insertion Types
// =============================================================================

export interface ContentRecordInsert {
  id: string;
  source_app: SourceApp;
  content_type: string;
  title?: string;
  body?: string;
  blocks?: any; // JSON field
  metadata: any; // JSON field
  rating?: number;
  is_favorite?: boolean;
  dedupe_hash?: string;
  created_at?: Date;
  updated_at?: Date;
}

// =============================================================================
// Utility Types
// =============================================================================

export interface ContentStats {
  total: number;
  by_source: Record<SourceApp, number>;
  by_type: Record<string, number>;
  recent_count: number; // Last 7 days
  favorites_count: number;
  avg_rating?: number;
}

export interface ContentExportOptions {
  format: 'json' | 'csv' | 'markdown';
  includeMetadata?: boolean;
  includeRatings?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}