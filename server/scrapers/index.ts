import { getTikTokTrending } from './tiktok';
import { getRedditTrending } from './reddit';
import { getYouTubeTrending } from './youtube';
import { getInstagramTrending } from './instagram';
import { getAmazonTrending } from './amazon';
import { getGoogleTrendingProducts } from './googleTrends';
import type { TrendingProduct, InsertTrendingProduct } from '@shared/schema';
import { ScraperPlatform, SCRAPER_PLATFORMS, ScraperStatusType } from '@shared/constants';

// Structure for platform status
interface PlatformStatus {
  name: ScraperPlatform;
  status: ScraperStatusType;
  errorMessage?: string;
}

// Interface for the scraper return type
export interface ScraperReturn {
  products: InsertTrendingProduct[];
  status: {
    status: ScraperStatusType;
    errorMessage?: string;
  };
}

// Interface for aggregated trending results
export interface ScraperResults {
  products: InsertTrendingProduct[];
  platforms: PlatformStatus[];
}

// Get trending products from all platforms
export async function getAllTrendingProducts(): Promise<ScraperResults> {
  const platforms: PlatformStatus[] = [];
  let allProducts: InsertTrendingProduct[] = [];
  
  // Run all scrapers in parallel
  const results = await Promise.allSettled([
    getTikTokTrending(),
    getRedditTrending(),
    getYouTubeTrending(),
    getInstagramTrending(),
    getAmazonTrending(),
    getGoogleTrendingProducts()
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
  
  // Limit to top products
  const topProducts = allProducts.slice(0, 10);
  
  return {
    products: topProducts,
    platforms
  };
}
