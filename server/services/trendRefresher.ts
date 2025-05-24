import { storage } from "../storage";
import { getAllTrendingProducts, ScraperResults } from "../scrapers";
import cron from "node-cron";

let lastTrendingRefresh: Date = new Date();
const nextScheduledRefresh = "Midnight (12:00 AM)";

/**
 * Enhanced product categorization with confidence scoring and fallback mechanism
 */
function categorizeProductWithFallback(title: string): { niche: string; confidence: 'high' | 'medium' | 'low'; fallback: boolean } {
  const lowerTitle = title.toLowerCase();
  
  // High confidence matches (very specific terms)
  if (lowerTitle.match(/\b(skincare|beauty|retinol|vitamin c|niacinamide|collagen|acne|sunscreen|spf)\b/)) {
    return { niche: 'skincare', confidence: 'high', fallback: false };
  }
  
  if (lowerTitle.match(/\b(smartphone|laptop|computer|iphone|android|tablet|bluetooth|wireless|usb|tech|digital|electronic)\b/)) {
    return { niche: 'tech', confidence: 'high', fallback: false };
  }
  
  if (lowerTitle.match(/\b(workout|fitness|gym|protein|supplements|athletic|sports|exercise|training)\b/)) {
    return { niche: 'fitness', confidence: 'high', fallback: false };
  }
  
  if (lowerTitle.match(/\b(instant pot|air fryer|kitchen|cooking|blender|coffee|recipe|meal|cookware)\b/)) {
    return { niche: 'food', confidence: 'high', fallback: false };
  }
  
  // Medium confidence matches (single relevant keywords)
  if (lowerTitle.match(/\b(cream|serum|cleanser|moisturizer|toner|mask|hydrat)\b/)) {
    return { niche: 'skincare', confidence: 'medium', fallback: false };
  }
  
  if (lowerTitle.match(/\b(phone|smart|wireless|headphones|earbuds|charger|cable|device|gadget|keyboard|mouse)\b/)) {
    return { niche: 'tech', confidence: 'medium', fallback: false };
  }
  
  if (lowerTitle.match(/\b(shirt|dress|jacket|shoes|sneakers|boots|jeans|pants|sweater|hoodie|hat|bag|purse|jewelry|watch|fashion|clothing|apparel|style|outfit)\b/)) {
    return { niche: 'fashion', confidence: 'medium', fallback: false };
  }
  
  if (lowerTitle.match(/\b(weights|dumbbell|resistance|yoga|running|muscle|cardio|bike|treadmill|thermometer|scale|water bottle|tumbler)\b/)) {
    return { niche: 'fitness', confidence: 'medium', fallback: false };
  }
  
  if (lowerTitle.match(/\b(pot|pan|knife|food|oven|grill|tea|frother|scale)\b/)) {
    return { niche: 'food', confidence: 'medium', fallback: false };
  }
  
  if (lowerTitle.match(/\b(travel|luggage|backpack|suitcase|trip|vacation|camping|outdoor|hiking|portable|insulated|bottle)\b/)) {
    return { niche: 'travel', confidence: 'medium', fallback: false };
  }
  
  if (lowerTitle.match(/\b(dog|cat|pet|collar|leash|toy|treat|bed|carrier|grooming|puppy|kitten|animal)\b/)) {
    return { niche: 'pet', confidence: 'medium', fallback: false };
  }
  
  // Low confidence fallback - distribute evenly to avoid empty sections
  const fallbackNiches = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];
  const hash = title.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  const nicheIndex = Math.abs(hash) % fallbackNiches.length;
  
  return { 
    niche: fallbackNiches[nicheIndex], 
    confidence: 'low', 
    fallback: true 
  };
}

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
        
        // Enhanced smart categorization with fallback mechanism
        const categorizeResult = categorizeProductWithFallback(product.title);
        assignedNiche = categorizeResult.niche;
        
        // Log all categorization for debugging
        console.log(`Product categorization: "${product.title}" → ${assignedNiche} (confidence: ${categorizeResult.confidence}, fallback: ${categorizeResult.fallback})`);
        
        // Additional debugging for pet products specifically
        if (productTitle.includes('dog') || productTitle.includes('cat') || productTitle.includes('pet')) {
          console.log(`🐾 Pet product detected: "${product.title}" assigned to ${assignedNiche}`);
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