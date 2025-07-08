import { Request, Response } from "express";
import { storage } from "../../storage";
import { getAllTrendingProducts } from "../../scrapers";
import { getTrendingProductsRefreshTime } from "../../services/trendRefresher";

/**
 * API endpoint to fetch trending products across all niches
 * Returns a structured object with data by niche and overall statistics
 */
export async function getAllNichesTrendingProducts(req: Request, res: Response) {
  try {
    // Get available niches
    const niches = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pets'];
    
    // Get the last refresh time
    const { lastRefresh, nextRefresh } = getTrendingProductsRefreshTime();
    
    // Prepare result object
    const result: {
      byNiche: Record<string, any[]>;
      count: number;
      lastRefresh: string;
      nextScheduledRefresh: string;
    } = {
      byNiche: {},
      count: 0,
      lastRefresh: lastRefresh.toISOString(),
      nextScheduledRefresh: nextRefresh,
    };
    
    // For each niche, get top 3 trending products
    for (const niche of niches) {
      // Fetch trending products for this niche
      try {
        const { products } = await getAllTrendingProducts(niche);
        
        // Take top 3 products
        const topProducts = products.slice(0, 3);
        
        // Add to result
        result.byNiche[niche] = topProducts;
        result.count += topProducts.length;
      } catch (error) {
        console.error(`Error fetching trending products for ${niche}:`, error);
        // Initialize with empty array if there's an error
        result.byNiche[niche] = [];
      }
    }
    
    // Return the aggregated result
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching trending products for all niches:", error);
    return res.status(500).json({ 
      error: "Failed to fetch trending products",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}