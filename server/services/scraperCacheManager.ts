import { db } from "../db";
import { dailyScraperCache } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { getAllTrendingProducts } from "../scrapers/index";
import { storage } from "../storage";

/**
 * Gets today's date in YYYY-MM-DD format
 */
function getTodaysDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Gets cached trending data for today
 */
export async function getCachedTrendingData(): Promise<any[] | null> {
  const today = getTodaysDate();
  
  try {
    const [cached] = await db
      .select()
      .from(dailyScraperCache)
      .where(
        and(
          eq(dailyScraperCache.source, 'all_trending'),
          eq(dailyScraperCache.date, today)
        )
      )
      .limit(1);

    if (!cached || !cached.success) {
      return null;
    }

    console.log(`📦 Using cached trending data (${cached.data ? (cached.data as any[]).length : 0} products)`);
    return cached.data as any[];
  } catch (error) {
    console.error('Error retrieving cached trending data:', error);
    return null;
  }
}

/**
 * Stores trending data in cache
 */
export async function storeCachedTrendingData(products: any[]): Promise<void> {
  const today = getTodaysDate();
  
  try {
    await db
      .insert(dailyScraperCache)
      .values({
        source: 'all_trending',
        date: today,
        data: products,
        success: true,
        error: null,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: [dailyScraperCache.source, dailyScraperCache.date],
        set: {
          data: products,
          success: true,
          error: null,
          lastUpdated: new Date(),
        },
      });

    console.log(`✅ Cached ${products.length} trending products for ${today}`);
  } catch (error) {
    console.error('Error storing cached trending data:', error);
  }
}

/**
 * Runs the trending scraper with daily caching - only runs once per day
 */
export async function runAndCacheTrendingScraper(): Promise<any[]> {
  const today = getTodaysDate();
  
  // Check if we already have cached data for today
  const existingCache = await db
    .select()
    .from(dailyScraperCache)
    .where(eq(dailyScraperCache.source, 'all_trending'))
    .where(eq(dailyScraperCache.date, today))
    .limit(1);

  if (existingCache.length > 0) {
    const cache = existingCache[0];
    console.log(`📋 Using cached trending data from ${cache.lastUpdated.toLocaleString()}`);
    return cache.data as any[] || [];
  }

  console.log('🔄 Running daily trending products scraper (once per day)...');
  
  try {
    const scraperResult = await getAllTrendingProducts();
    const trendingProducts = scraperResult.products || [];
    
    console.log(`📦 Saving ${trendingProducts.length} products to database...`);
    
    // Save all products to the trending_products table
    if (trendingProducts.length > 0) {
      // Clear existing products first
      await storage.clearTrendingProducts();
      
      // Save new products
      for (const product of trendingProducts) {
        await storage.saveTrendingProduct(product);
      }
      console.log(`✅ Successfully saved ${trendingProducts.length} products to database`);
    }
    
    // Store in cache with today's date
    await db
      .insert(dailyScraperCache)
      .values({
        source: 'all_trending',
        date: today,
        data: trendingProducts,
        success: true,
        error: null,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: [dailyScraperCache.source, dailyScraperCache.date],
        set: {
          data: trendingProducts,
          success: true,
          error: null,
          lastUpdated: new Date(),
        },
      });
    
    return trendingProducts;
    
  } catch (error) {
    console.error('❌ Trending scraper failed:', error);
    
    // Store failed result in cache
    await db
      .insert(dailyScraperCache)
      .values({
        source: 'all_trending',
        date: today,
        data: [],
        success: false,
        error: error instanceof Error ? error.message : String(error),
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: [dailyScraperCache.source, dailyScraperCache.date],
        set: {
          data: [],
          success: false,
          error: error instanceof Error ? error.message : String(error),
          lastUpdated: new Date(),
        },
      });

    return [];
  }
}

/**
 * Gets trending data - from cache if available, otherwise runs scraper
 */
export async function getTrendingData(): Promise<any[]> {
  // First try to get from cache
  const cached = await getCachedTrendingData();
  
  if (cached) {
    return cached;
  }

  // If no cache, run scraper
  console.log('🔄 No valid cache found, running fresh trending scraper...');
  return await runAndCacheTrendingScraper();
}

/**
 * Manually trigger trending scraper refresh
 */
export async function refreshTrendingCache(): Promise<any[]> {
  console.log('🔄 Manual trending cache refresh triggered...');
  return await runAndCacheTrendingScraper();
}

/**
 * Clears old cache entries (older than 7 days)
 */
export async function cleanupOldCache(): Promise<void> {
  const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  
  try {
    await db
      .delete(dailyScraperCache)
      .where(eq(dailyScraperCache.date, sevenDaysAgo));

    console.log(`🧹 Cleaned up cache entries older than ${sevenDaysAgo}`);
  } catch (error) {
    console.error('Error cleaning up old cache:', error);
  }
}