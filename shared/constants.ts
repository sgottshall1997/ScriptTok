// Shared constants used across the application

// Template types that work universally across all niches (clean template-type-first architecture)
export const TEMPLATE_TYPES = [
  "affiliate_email",    // Affiliate Email Blurb (persuasive email sections)
  "influencer_caption", // Influencer Caption (authentic social media posts)
  "product_comparison", // Product Comparison (comprehensive comparison guides)
  "routine_kit",        // Routine Kit (step-by-step routine guides)
  "seo_blog",           // SEO Blog Post (1000+ words, search optimized)
  "short_video"         // Short-Form Video Script (TikTok, Reels, YT Shorts)
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

// TikTok-optimized tone options (subset of TONE_OPTIONS)
export const TIKTOK_TONE_OPTIONS = [
  "casual",        // Casual & conversational (most popular for TikTok)
  "enthusiastic",  // Enthusiastic & excited
  "humorous",      // Light-hearted & fun  
  "trendy",        // Trend-conscious & current
  "friendly"       // Friendly & approachable
] as const;

export type TikTokToneOption = typeof TIKTOK_TONE_OPTIONS[number];

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

// =================================================================
// AMAZON FEATURES - TEMPORARILY DISABLED VIA FEATURE FLAGS
// =================================================================
// DISABLED: Amazon Associates functionality is temporarily disabled 
// 
// **STRATEGIC DECISION**: Transform GlowBot from Amazon-focused platform
// to standalone TikTok Viral Product Generator while preserving all 
// Amazon code infrastructure for potential future re-enablement.
// 
// **TO RE-ENABLE AMAZON FEATURES**:
// 1. Set environment variable: ENABLE_AMAZON_FEATURES=true
// 2. Set frontend environment variable: VITE_ENABLE_AMAZON_FEATURES=true  
// 3. Configure Amazon API credentials in environment
// 4. Restart the application
// 
// **CURRENT BEHAVIOR WHEN DISABLED**:
// - All Amazon API endpoints return 503 Service Unavailable
// - Amazon UI components show disabled state with explanatory messages
// - Amazon navigation items are hidden from sidebar
// - Amazon-related services return early without processing
// 
// **CODE PRESERVATION APPROACH**: All Amazon code remains intact with
// conditional feature flag guards rather than deletion. This maintains
// the complete infrastructure for future activation if needed.
// =================================================================

// Environment-based feature flag evaluation for Amazon functionality
export const isAmazonEnabled = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    // Server-side check
    return process.env.ENABLE_AMAZON_FEATURES === 'true';
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Client-side check (Vite)
    return import.meta.env.VITE_ENABLE_AMAZON_FEATURES === 'true';
  }

  // Default to disabled if environment variables are not available
  return false;
};

// Helper to get disabled feature message
export const getDisabledFeatureMessage = (featureName: string = 'Amazon Associates') => ({
  disabled: true,
  message: `${featureName} functionality is temporarily disabled`,
  reason: 'Feature flag ENABLE_AMAZON_FEATURES is set to false',
  canReEnable: 'Set ENABLE_AMAZON_FEATURES=true to re-enable this feature'
});

// Check if Amazon features are enabled with fallback
export const checkAmazonFeatures = () => {
  const isEnabled = isAmazonEnabled();

  if (!isEnabled) {
    return {
      enabled: false,
      ...getDisabledFeatureMessage('Amazon Associates')
    };
  }

  return {
    enabled: true,
    message: 'Amazon Associates features are enabled'
  };
};