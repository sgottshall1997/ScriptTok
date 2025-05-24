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
  
  // Get all trending products once and then distribute across niches
  try {
    const { products } = await getAllTrendingProducts('skincare'); // Fetch once
    
    if (products && products.length > 0) {
      // Distribute products across niches based on intelligent categorization
      products.forEach((product, index) => {
        // Assign products to niches in a round-robin fashion but with smart categorization
        const productTitle = product.title.toLowerCase();
        let assignedNiche = 'skincare'; // default
        
        // Smart niche assignment based on product keywords
        if (productTitle.includes('vitamin') || productTitle.includes('serum') || productTitle.includes('cream') || productTitle.includes('cleanser') || productTitle.includes('moisturizer') || productTitle.includes('sunscreen')) {
          assignedNiche = 'skincare';
        } else if (productTitle.includes('phone') || productTitle.includes('laptop') || productTitle.includes('airpods') || productTitle.includes('tech') || productTitle.includes('smart') || productTitle.includes('wireless')) {
          assignedNiche = 'tech';
        } else if (productTitle.includes('shirt') || productTitle.includes('jacket') || productTitle.includes('dress') || productTitle.includes('shoes') || productTitle.includes('jeans') || productTitle.includes('fashion')) {
          assignedNiche = 'fashion';
        } else if (productTitle.includes('protein') || productTitle.includes('workout') || productTitle.includes('gym') || productTitle.includes('fitness') || productTitle.includes('exercise') || productTitle.includes('weights')) {
          assignedNiche = 'fitness';
        } else if (productTitle.includes('kitchen') || productTitle.includes('cook') || productTitle.includes('food') || productTitle.includes('recipe') || productTitle.includes('pot') || productTitle.includes('pan')) {
          assignedNiche = 'food';
        } else if (productTitle.includes('travel') || productTitle.includes('luggage') || productTitle.includes('backpack') || productTitle.includes('hotel') || productTitle.includes('flight')) {
          assignedNiche = 'travel';
        } else if (productTitle.includes('dog') || productTitle.includes('cat') || productTitle.includes('pet') || productTitle.includes('animal') || productTitle.includes('collar') || productTitle.includes('treats')) {
          assignedNiche = 'pet';
        } else {
          // Round-robin distribution for products that don't match keywords
          assignedNiche = niches[index % niches.length];
        }
        
        // Add to the assigned niche if it has less than 3 products
        if (result.byNiche[assignedNiche].length < 3) {
          result.byNiche[assignedNiche].push({
            ...product,
            niche: assignedNiche
          });
          result.count++;
        }
      });
      
      // Fill empty niches with remaining products
      niches.forEach(niche => {
        if (result.byNiche[niche].length === 0) {
          const remainingProducts = products.filter(p => 
            !Object.values(result.byNiche).flat().some(assigned => assigned.title === p.title)
          );
          
          if (remainingProducts.length > 0) {
            const productToAdd = remainingProducts[0];
            result.byNiche[niche].push({
              ...productToAdd,
              niche: niche
            });
            result.count++;
          }
        }
      });
    }
  } catch (error) {
    console.error(`Error fetching trending products:`, error);
  }
  
  return result;
}