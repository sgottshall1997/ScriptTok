/**
 * Shared types for consistent scraper implementation
 */
import { ScraperStatusType } from '@shared/constants';
import { InsertTrendingProduct } from '@shared/schema';

/**
 * Normalized product item from any scraper source
 */
export interface ScrapedProduct {
  title: string;         // Product title/name
  url?: string;          // URL to product page (optional)
  platform: string;      // Source platform (tiktok, instagram, etc.)
  mentions: number;      // Mention count or estimate
  isVerified: boolean;   // Whether this is actual scraped data vs AI-generated
  imageUrl?: string;     // Image URL if available (optional)
  price?: string;        // Price if available (optional)
  category?: string;     // Product category if available (optional)
  hashtags?: string[];   // Associated hashtags if available (optional)
  timestamp?: Date;      // When this product was found/scraped (optional)
}

/**
 * Status information about a scraper operation
 */
export interface ScraperStatus {
  status: ScraperStatusType;  // Current status (active, error, etc.)
  message?: string;           // Optional status message or error description
  timestamp: Date;            // When this status was recorded
  realDataCount: number;      // Number of real data items scraped
  aiDataCount: number;        // Number of AI-generated fallback items
}

/**
 * Standardized return type for all scrapers
 */
export interface ScraperResult {
  products: ScrapedProduct[];     // Array of scraped products
  status: ScraperStatus;          // Status information about the scrape operation
  rawData?: any;                  // Optional raw data from the source (for debugging)
}

/**
 * Convert a ScrapedProduct to InsertTrendingProduct 
 * for database storage compatibility
 */
export function toInsertTrendingProduct(product: ScrapedProduct): InsertTrendingProduct {
  return {
    title: product.title,
    source: product.platform,
    mentions: product.mentions || 0,
    sourceUrl: product.url || null, // Maps to source_url in the schema
    niche: 'auto', // This will be set by the caller based on context
  };
}

/**
 * Create a standardized error status
 */
export function createErrorStatus(message: string): ScraperStatus {
  return {
    status: 'error',
    message,
    timestamp: new Date(),
    realDataCount: 0,
    aiDataCount: 0
  };
}

/**
 * Create a standardized success status
 */
export function createSuccessStatus(realCount: number, aiCount: number = 0): ScraperStatus {
  return {
    status: realCount > 0 ? 'active' : (aiCount > 0 ? 'gpt-fallback' : 'degraded'),
    timestamp: new Date(),
    realDataCount: realCount,
    aiDataCount: aiCount
  };
}