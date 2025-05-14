// Shared constants used across the application

// Template types for content generation
export const TEMPLATE_TYPES = [
  "original",      // Original review
  "comparison",    // Product comparison
  "caption",       // Social media caption
  "pros-cons",     // Pros and cons list
  "routine"        // Skincare routine
] as const;

export type TemplateType = typeof TEMPLATE_TYPES[number];

// Tone options for generated content
export const TONE_OPTIONS = [
  "friendly",      // Friendly & approachable
  "professional",  // Professional & expert
  "enthusiastic",  // Enthusiastic & excited
  "minimalist"     // Minimalist & direct
] as const;

export type ToneOption = typeof TONE_OPTIONS[number];

// Scraper names and platforms
export const SCRAPER_PLATFORMS = [
  "tiktok",
  "instagram",
  "youtube",
  "reddit",
  "amazon"
] as const;

export type ScraperPlatform = typeof SCRAPER_PLATFORMS[number];

// Status types for scraper health
export const SCRAPER_STATUS_TYPES = [
  "operational",
  "degraded",
  "down"
] as const;

export type ScraperStatusType = typeof SCRAPER_STATUS_TYPES[number];

// API limits for monitoring usage
export const API_LIMITS = {
  MONTHLY_REQUESTS: 500
};
