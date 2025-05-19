import { Request, Response } from "express";
import { getRefreshedTrendingProducts } from "../../services/trendRefresher";

// This endpoint provides trending products for the Dashboard component
export async function getTrendingProducts(req: Request, res: Response) {
  try {
    const trendingProducts = await getRefreshedTrendingProducts();
    res.json(trendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({ 
      error: "Failed to fetch trending products",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}