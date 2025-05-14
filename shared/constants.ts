// Shared constants used across the application

// Template types for content generation
export const TEMPLATE_TYPES = [
  "original",            // Original review
  "comparison",          // Product comparison
  "caption",             // Social media caption
  "pros_cons",           // Pros and cons list
  "routine",             // Skincare routine
  "beginner_kit",        // Beginner skincare kit
  "demo_script",         // Product demo script
  "drugstore_dupe",      // Drugstore dupe review
  "personal_review",     // Personal product review
  "surprise_me",         // Creative/unexpected content
  "tiktok_breakdown",    // TikTok trend breakdown
  "dry_skin_list",       // Dry skin product list
  "top5_under25",        // Affordable options
  "influencer_caption",  // Influencer-style caption
  "recipe",              // Recipe featuring product
  "packing_list"         // Travel packing list
] as const;

export type TemplateType = typeof TEMPLATE_TYPES[number];

// Supported content niches
export const NICHES = [
  "skincare",     // Skincare and beauty products
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
