import { getTikTokTrending } from './tiktok';
import { getRedditTrending } from './reddit';
import { getYouTubeTrending } from './youtube';
import { getInstagramTrending } from './instagram';
import { getAmazonTrending } from './amazon';
import type { TrendingProduct, InsertTrendingProduct } from '@shared/schema';
import { ScraperPlatform, SCRAPER_PLATFORMS, ScraperStatusType } from '@shared/constants';

// Structure for platform status
interface PlatformStatus {
  name: ScraperPlatform;
  status: ScraperStatusType;
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
    getAmazonTrending()
  ]);
  
  // Process each scraper's results
  results.forEach((result, index) => {
    const platform = SCRAPER_PLATFORMS[index];
    
    if (result.status === 'fulfilled') {
      // Add products with source
      const products = result.value.map(item => ({
        ...item,
        source: platform
      }));
      
      allProducts = [...allProducts, ...products];
      
      // Add platform status as operational
      platforms.push({
        name: platform,
        status: 'operational'
      });
    } else {
      // Add platform status as down
      platforms.push({
        name: platform,
        status: 'down'
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
