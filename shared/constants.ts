// Shared constants used across the application

// Universal template types that apply to all niches (from optimized PDF system)
export const UNIVERSAL_TEMPLATE_TYPES = [
  "affiliate_email",    // Affiliate Email Blurb (persuasive email sections)
  "influencer_caption", // Influencer Caption (authentic social media posts)
  "product_comparison", // Product Comparison (comprehensive comparison guides)
  "routine_kit",        // Routine Kit (step-by-step routine guides)
  "seo_blog",           // SEO Blog Post (1000+ words, search optimized)
  "short_video"         // Short-Form Video Script (TikTok, Reels, YT Shorts)
] as const;

// Niche-specific template types (from optimized PDF system)
export const BEAUTY_TEMPLATE_TYPES = [
  "skincare"           // Optimized skincare content template
] as const;

export const FASHION_TEMPLATE_TYPES = [
  "fashion"            // Optimized fashion content template
] as const;

export const FITNESS_TEMPLATE_TYPES = [
  "fitness"            // Optimized fitness content template
] as const;

export const FOOD_TEMPLATE_TYPES = [
  "food"               // Optimized food content template
] as const;

export const TECH_TEMPLATE_TYPES = [
  "tech"               // Optimized tech content template
] as const;

export const TRAVEL_TEMPLATE_TYPES = [
  "travel"             // Optimized travel content template
] as const;

// No pet-specific templates in the new system - pets uses universal templates

// Combined template types for validation (optimized PDF system)
export const TEMPLATE_TYPES = [
  ...UNIVERSAL_TEMPLATE_TYPES,
  ...BEAUTY_TEMPLATE_TYPES,
  ...FASHION_TEMPLATE_TYPES,
  ...FITNESS_TEMPLATE_TYPES,
  ...FOOD_TEMPLATE_TYPES,
  ...TECH_TEMPLATE_TYPES,
  ...TRAVEL_TEMPLATE_TYPES
] as const;

export type TemplateType = typeof TEMPLATE_TYPES[number];

// Supported content niches
export const NICHES = [
  "beauty",       // Beauty and personal care products
  "tech",         // Technology and gadgets
  "fashion",      // Clothing and accessories
  "fitness",      // Fitness equipment and supplements
  "food",         // Food and cooking products
  "travel",       // Travel gear and accessories
  "pet"           // Pet products and accessories
] as const;

export type Niche = typeof NICHES[number];

// Tone options for generated content
export const TONE_OPTIONS = [
  "friendly",      // Friendly & approachable
  "professional",  // Professional & expert
  "casual",        // Casual & conversational
  "enthusiastic",  // Enthusiastic & excited
  "minimalist",    // Minimalist & direct
  "luxurious",     // Elegant & sophisticated
  "educational",   // Informative & educational
  "humorous",      // Light-hearted & fun
  "trendy",        // Trend-conscious & current
  "scientific",    // Precise & analytical
  "poetic"         // Artistic & expressive
] as const;

export type ToneOption = typeof TONE_OPTIONS[number];

// Scraper names and platforms
export const SCRAPER_PLATFORMS = [
  "tiktok",
  "instagram",
  "youtube",
  "reddit",
  "amazon",
  "google-trends"
] as const;

export type ScraperPlatform = typeof SCRAPER_PLATFORMS[number];

// Status types for scraper health
export const SCRAPER_STATUS_TYPES = [
  "active",           // Scraper is working with real data
  "gpt-fallback",     // Using GPT due to scraping failure
  "degraded",         // Partially working but with issues
  "error",            // Complete failure with error
  "rate-limited"      // Rate limited by the platform
] as const;

export type ScraperStatusType = typeof SCRAPER_STATUS_TYPES[number];

// API limits for monitoring usage
export const API_LIMITS = {
  MONTHLY_REQUESTS: 500
};
