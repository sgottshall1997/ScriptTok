import { getTikTokTrending } from './tiktok';
import { getRedditTrending } from './reddit';
import { getYouTubeTrending } from './youtube';
import { getInstagramTrending } from './instagram';
import { getAmazonTrending } from './amazon';
import { getGoogleTrendingProducts } from './googleTrends';
import type { TrendingProduct, InsertTrendingProduct } from '@shared/schema';
import { ScraperPlatform, SCRAPER_PLATFORMS, ScraperStatusType } from '@shared/constants';
import { 
  ScrapedProduct, 
  ScraperStatus, 
  ScraperResult, 
  toInsertTrendingProduct,
  createErrorStatus,
  createSuccessStatus
} from './types';

// Structure for platform status (legacy - will be replaced with ScraperStatus)
interface PlatformStatus {
  name: ScraperPlatform;
  status: ScraperStatusType;
  errorMessage?: string;
}

// Legacy interface for the old scraper return type (for backward compatibility)
export interface ScraperReturn {
  products: InsertTrendingProduct[];
  status: {
    status: ScraperStatusType;
    errorMessage?: string;
  };
}

// Convert new ScraperResult to legacy ScraperReturn
function convertToLegacyFormat(result: ScraperResult, niche: string): ScraperReturn {
  return {
    products: result.products.map(product => toInsertTrendingProduct({
      ...product,
      category: product.category || niche
    })),
    status: {
      status: result.status.status,
      errorMessage: result.status.message
    }
  };
}

// Interface for aggregated trending results (legacy version)
export interface ScraperResults {
  products: InsertTrendingProduct[];
  platforms: PlatformStatus[];
}

// Enhanced interface for aggregated trending results with normalized data
export interface EnhancedScraperResults {
  products: ScrapedProduct[];
  platformStatuses: ScraperStatus[];
  rawDataByPlatform: Record<string, any>;
}

// Get trending products from all platforms
export async function getAllTrendingProducts(niche: string = 'skincare'): Promise<ScraperResults> {
  const platforms: PlatformStatus[] = [];
  let allProducts: InsertTrendingProduct[] = [];
  
  // Run all scrapers in parallel with the specified niche
  const results = await Promise.allSettled([
    getTikTokTrending(niche),
    getRedditTrending(niche),
    getYouTubeTrending(niche),
    getInstagramTrending(niche),
    getAmazonTrending(niche),
    getGoogleTrendingProducts(niche)
  ]);
  
  // Process each scraper's results
  results.forEach((result, index) => {
    const platform = SCRAPER_PLATFORMS[index];
    
    if (result.status === 'fulfilled') {
      // Add products with source
      const products = result.value.products.map(item => ({
        ...item,
        source: platform
      }));
      
      allProducts = [...allProducts, ...products];
      
      // Get the platform status from the scraper result
      platforms.push({
        name: platform,
        status: result.value.status.status,
        errorMessage: result.value.status.errorMessage
      });
    } else {
      // Add platform status as error with the error message
      platforms.push({
        name: platform,
        status: 'error',
        errorMessage: result.reason?.message || 'Unknown error'
      });
      
      console.error(`Error fetching from ${platform}:`, result.reason);
    }
  });
  
  // Sort by mentions (if available) or default order
  allProducts.sort((a, b) => {
    if (a.mentions && b.mentions) {
      return b.mentions - a.mentions;
    }
    return 0;
  });
  
  // Remove duplicate products (same title from different sources)
  const uniqueProducts: InsertTrendingProduct[] = [];
  const titleSet = new Set<string>();
  
  for (const product of allProducts) {
    // Normalize title for comparison
    const normalizedTitle = product.title.toLowerCase().trim();
    if (!titleSet.has(normalizedTitle)) {
      titleSet.add(normalizedTitle);
      uniqueProducts.push(product);
    }
  }
  
  // Limit to top products
  const topProducts = uniqueProducts.slice(0, 10);
  
  return {
    products: topProducts,
    platforms
  };
}

/**
 * Enhanced version of getAllTrendingProducts that returns normalized data
 * @param niche The product niche to scrape (e.g., 'skincare', 'tech')
 * @returns Normalized product data and scraper statuses
 */
export async function getAllTrendingProductsEnhanced(niche: string = 'skincare'): Promise<EnhancedScraperResults> {
  const platformStatuses: ScraperStatus[] = [];
  const normalizedProducts: ScrapedProduct[] = [];
  const rawDataByPlatform: Record<string, any> = {};
  
  // Run all scrapers in parallel with the specified niche
  const results = await Promise.allSettled([
    getTikTokTrending(niche),
    getRedditTrending(niche),
    getYouTubeTrending(niche),
    getInstagramTrending(niche),
    getAmazonTrending(niche),
    getGoogleTrendingProducts(niche)
  ]);
  
  // Process each scraper's results
  results.forEach((result, index) => {
    const platform = SCRAPER_PLATFORMS[index];
    
    if (result.status === 'fulfilled') {
      // Get raw data for debugging if available
      if ('rawData' in result.value.status) {
        rawDataByPlatform[platform] = result.value.status.rawData;
      }
      
      // Convert legacy format to normalized product format
      const products = result.value.products.map((item): ScrapedProduct => {
        // Check if a property is in the item using type guards
        const hasProperty = <K extends string>(obj: any, key: K): boolean => 
          obj && typeof obj === 'object' && key in obj;
        
        return {
          title: item.title,
          platform: platform,
          mentions: item.mentions || 0,
          url: hasProperty(item, 'sourceUrl') ? item.sourceUrl || '' : '',
          isVerified: hasProperty(item, 'isAIGenerated') ? !item.isAIGenerated : true,
          category: niche,
          timestamp: new Date()
        };
      });
      
      normalizedProducts.push(...products);
      
      // Create a normalized status
      platformStatuses.push({
        status: result.value.status.status,
        message: result.value.status.errorMessage,
        timestamp: new Date(),
        realDataCount: products.filter(p => p.isVerified).length,
        aiDataCount: products.filter(p => !p.isVerified).length
      });
    } else {
      // Add error status
      platformStatuses.push(createErrorStatus(result.reason?.message || 'Unknown error'));
      console.error(`Error fetching from ${platform}:`, result.reason);
    }
  });
  
  // Sort by mentions
  normalizedProducts.sort((a, b) => b.mentions - a.mentions);
  
  // Remove duplicates
  const uniqueProducts: ScrapedProduct[] = [];
  const titleSet = new Set<string>();
  
  for (const product of normalizedProducts) {
    const normalizedTitle = product.title.toLowerCase().trim();
    if (!titleSet.has(normalizedTitle)) {
      titleSet.add(normalizedTitle);
      uniqueProducts.push(product);
    }
  }
  
  // Limit to top products
  const topProducts = uniqueProducts.slice(0, 10);
  
  return {
    products: topProducts,
    platformStatuses,
    rawDataByPlatform
  };
}
