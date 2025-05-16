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

// Interface for aggregated trending results
export interface ScraperResults {
  products: InsertTrendingProduct[];
  platforms: PlatformStatus[];
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
