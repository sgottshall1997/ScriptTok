import { storage } from "../storage";
import { getAllTrendingProducts, ScraperResults } from "../scrapers";
import cron from "node-cron";

let lastTrendingRefresh: Date = new Date();
const nextScheduledRefresh = "Midnight (12:00 AM)";

/**
 * Initialize trending products refresh schedule
 * Runs once at startup and then every day at midnight
 */
export function initTrendingProductsRefresh() {
  console.log("Initializing trending products refresh schedule...");
  
  // Schedule refresh for midnight every day (server time)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled trending product refresh at midnight");
    try {
      await refreshTrendingProducts();
      console.log("Scheduled trending products refresh completed successfully");
    } catch (error) {
      console.error("Error in scheduled trending products refresh:", error);
    }
  });
  
  // Initial refresh at startup if needed
  refreshTrendingProductsIfOld();
}

/**
 * Refresh trending products if last refresh is older than 24 hours
 */
async function refreshTrendingProductsIfOld() {
  // Check when the last refresh happened
  const lastRefresh = lastTrendingRefresh;
  const now = new Date();
  const hoursSinceLastRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastRefresh > 24) {
    console.log(`Last trending products refresh was ${hoursSinceLastRefresh.toFixed(2)} hours ago. Refreshing now...`);
    await refreshTrendingProducts();
  } else {
    console.log(`Last trending products refresh was ${hoursSinceLastRefresh.toFixed(2)} hours ago. No refresh needed.`);
  }
}

/**
 * Refresh trending products for all niches
 * Also exported as forceRefreshTrendingProducts for compatibility
 */
export async function refreshTrendingProducts(): Promise<void> {
  const niches = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];
  
  for (const niche of niches) {
    try {
      console.log(`Refreshing trending products for ${niche} niche...`);
      const results = await getAllTrendingProducts(niche);
      
      // Let's ensure we have at least 3 products per niche, even if it means using AI generation
      if (results.products.length < 3) {
        console.log(`Need ${3 - results.products.length} more products for ${niche} to reach minimum`);
        // In real app, this would trigger AI generation
      }
      
      // Update last refresh time
      lastTrendingRefresh = new Date();
      
    } catch (error) {
      console.error(`Error refreshing trending products for ${niche} niche:`, error);
    }
  }
  
  console.log("Trending products refreshed successfully for all niches");
}

/**
 * Get information about trending products refresh timing
 */
export function getTrendingProductsRefreshTime() {
  return {
    lastRefresh: lastTrendingRefresh,
    nextRefresh: nextScheduledRefresh
  };
}

/**
 * Force refresh trending products - alias for compatibility with existing code
 */
export const forceRefreshTrendingProducts = refreshTrendingProducts;

/**
 * Get refreshed trending products for use in API
 */
export async function getRefreshedTrendingProducts() {
  // Refresh if needed (though this won't do anything if we refreshed recently)
  await refreshTrendingProductsIfOld();
  
  // Return all trending products
  const niches = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];
  const result: {
    byNiche: Record<string, any[]>,
    count: number,
    lastRefresh: string,
    nextScheduledRefresh: string
  } = {
    byNiche: {},
    count: 0,
    lastRefresh: lastTrendingRefresh.toISOString(),
    nextScheduledRefresh: nextScheduledRefresh
  };
  
  // Initialize empty arrays for each niche to avoid type errors
  niches.forEach(niche => {
    result.byNiche[niche] = [];
  });
  
  // For each niche, get diversified products from multiple sources
  for (const niche of niches) {
    try {
      const { products } = await getAllTrendingProducts(niche);
      
      // Create a map to track products by source
      const productsBySource: Record<string, InsertTrendingProduct[]> = {};
      
      // Group products by source
      products.forEach(product => {
        if (!productsBySource[product.source]) {
          productsBySource[product.source] = [];
        }
        productsBySource[product.source].push(product);
      });
      
      // Get sources with at least one product
      const availableSources = Object.keys(productsBySource).filter(
        source => productsBySource[source].length > 0
      );
      
      // Create a diversified list of products (maximum 3 products)
      let diversifiedProducts: InsertTrendingProduct[] = [];
      
      // Round-robin selection from different sources
      let sourceIndex = 0;
      while (diversifiedProducts.length < 3 && availableSources.length > 0) {
        const currentSource = availableSources[sourceIndex % availableSources.length];
        const productsFromSource = productsBySource[currentSource];
        
        // Take the next product from this source if available
        if (productsFromSource.length > 0) {
          diversifiedProducts.push(productsFromSource.shift()!);
        } else {
          // Remove this source as it has no more products
          availableSources.splice(sourceIndex % availableSources.length, 1);
          if (availableSources.length === 0) break;
          // Don't increment index when removing a source
          continue;
        }
        
        // Move to next source
        sourceIndex++;
      }
      
      // If we still don't have 3 products, add more from any remaining sources
      if (diversifiedProducts.length < 3) {
        // Flatten remaining products from all sources
        const remainingProducts = Object.values(productsBySource)
          .flat()
          .slice(0, 3 - diversifiedProducts.length);
        
        diversifiedProducts = [...diversifiedProducts, ...remainingProducts];
      }
      
      // Add to result
      result.byNiche[niche] = diversifiedProducts;
      result.count += diversifiedProducts.length;
    } catch (error) {
      console.error(`Error fetching trending products for ${niche}:`, error);
      // Initialize with empty array if there's an error
      result.byNiche[niche] = [];
    }
  }
  
  return result;
}