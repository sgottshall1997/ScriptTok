import { db } from "../db";
import { dailyScraperCache } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

// Import all scrapers
import { getAmazonTrending } from "../scrapers/amazon";
import { getRedditTrending } from "../scrapers/reddit";
import { getTikTokTrending } from "../scrapers/tiktok";
import { getYouTubeTrending } from "../scrapers/youtube";
import { getInstagramTrending } from "../scrapers/instagram";
import { getGoogleTrending } from "../scrapers/googleTrends";

export interface ScraperResult {
  products: any[];
  source: string;
  success: boolean;
  error?: string;
}

// Available scrapers with their function mappings
const SCRAPERS = {
  amazon: getAmazonTrending,
  reddit: getRedditTrending,
  tiktok: getTikTokTrending,
  youtube: getYouTubeTrending,
  instagram: getInstagramTrending,
  googleTrends: getGoogleTrending,
} as const;

type ScraperName = keyof typeof SCRAPERS;

/**
 * Gets today's date in YYYY-MM-DD format
 */
function getTodaysDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Gets cached scraper data for a specific source and date
 */
export async function getCachedScraperData(sourceName: ScraperName, date?: string): Promise<ScraperResult | null> {
  try {
    const targetDate = date || getTodaysDate();
    
    const [cached] = await db
      .select()
      .from(dailyScraperCache)
      .where(and(
        eq(dailyScraperCache.source, sourceName),
        eq(dailyScraperCache.date, targetDate)
      ))
      .limit(1);

    if (cached) {
      console.log(`📋 Retrieved cached ${sourceName} data for ${targetDate}`);
      return JSON.parse(cached.data);
    }

    return null;
  } catch (error) {
    console.error(`Error retrieving cached data for ${sourceName}:`, error);
    return null;
  }
}

/**
 * Stores scraper data in cache
 */
export async function storeCachedScraperData(sourceName: ScraperName, data: ScraperResult, date?: string): Promise<void> {
  try {
    const targetDate = date || getTodaysDate();
    const dataString = JSON.stringify(data);

    await db
      .insert(dailyScraperCache)
      .values({
        source: sourceName,
        date: targetDate,
        data: dataString,
      })
      .onConflictDoUpdate({
        target: [dailyScraperCache.source, dailyScraperCache.date],
        set: {
          data: dataString,
          updatedAt: new Date(),
        },
      });

    console.log(`💾 Stored ${sourceName} cache for ${targetDate} (${data.products?.length || 0} products)`);
  } catch (error) {
    console.error(`Error storing cached data for ${sourceName}:`, error);
  }
}

/**
 * Runs a specific scraper and caches the result
 */
export async function runAndCacheScraper(sourceName: ScraperName, niche?: string): Promise<ScraperResult> {
  const scraperFunction = SCRAPERS[sourceName];
  
  try {
    console.log(`🔄 Running ${sourceName} scraper...`);
    
    // Run the scraper based on its expected parameters
    let scraperResult;
    if (sourceName === 'amazon') {
      // Amazon scraper expects a niche parameter
      scraperResult = await scraperFunction(niche || 'skincare');
    } else {
      // Other scrapers don't need niche parameter
      scraperResult = await scraperFunction();
    }

    const result: ScraperResult = {
      products: Array.isArray(scraperResult) ? scraperResult : [],
      source: sourceName,
      success: true,
    };

    // Cache the result
    await storeCachedScraperData(sourceName, result);
    
    console.log(`✅ ${sourceName} scraper completed: ${result.products.length} products`);
    return result;

  } catch (error) {
    console.error(`❌ ${sourceName} scraper failed:`, error);
    
    const result: ScraperResult = {
      products: [],
      source: sourceName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    // Cache the failed result to avoid re-running today
    await storeCachedScraperData(sourceName, result);
    return result;
  }
}

/**
 * Gets scraper data - from cache if available, otherwise runs scraper
 */
export async function getScraperData(sourceName: ScraperName, niche?: string): Promise<ScraperResult> {
  // First, try to get from cache
  const cached = await getCachedScraperData(sourceName);
  if (cached) {
    return cached;
  }

  // If not cached, run the scraper
  console.log(`🆕 No cache found for ${sourceName}, running scraper...`);
  return await runAndCacheScraper(sourceName, niche);
}

/**
 * Runs all scrapers and caches their results
 */
export async function runAllScrapersAndCache(): Promise<{ [key in ScraperName]: ScraperResult }> {
  console.log('🚀 Starting daily scraper run for all sources...');
  
  const results: { [key in ScraperName]: ScraperResult } = {} as any;
  
  // Run all scrapers in parallel
  const scraperPromises = (Object.keys(SCRAPERS) as ScraperName[]).map(async (sourceName) => {
    const result = await runAndCacheScraper(sourceName);
    results[sourceName] = result;
    return { sourceName, result };
  });

  await Promise.allSettled(scraperPromises);

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalCount = Object.keys(SCRAPERS).length;
  
  console.log(`📊 Daily scraper run completed: ${successCount}/${totalCount} successful`);
  
  return results;
}

/**
 * Gets all cached scraper data for today
 */
export async function getAllCachedScraperData(): Promise<{ [key in ScraperName]?: ScraperResult }> {
  try {
    const today = getTodaysDate();
    const allCached = await db
      .select()
      .from(dailyScraperCache)
      .where(eq(dailyScraperCache.date, today));

    const results: { [key in ScraperName]?: ScraperResult } = {};
    
    for (const cached of allCached) {
      const sourceName = cached.source as ScraperName;
      results[sourceName] = JSON.parse(cached.data);
    }

    return results;
  } catch (error) {
    console.error('Error retrieving all cached scraper data:', error);
    return {};
  }
}

/**
 * Clears old cache entries (older than 7 days)
 */
export async function cleanupOldCache(): Promise<void> {
  try {
    const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    // Delete entries older than 7 days
    await db
      .delete(dailyScraperCache)
      .where(eq(dailyScraperCache.date, sevenDaysAgo));
    
    console.log(`🧹 Cleaned up cache entries older than ${sevenDaysAgo}`);
  } catch (error) {
    console.error('Error cleaning up old cache:', error);
  }
}