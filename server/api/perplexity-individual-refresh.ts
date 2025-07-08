import { Request, Response } from 'express';
import { db } from '../db';
import { trendingProducts } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Import individual fetchers
import { fetchTrendingBeautyProducts } from '../services/perplexity/perplexityFetchBeauty.js';
import { fetchTrendingTechProducts } from '../services/perplexity/perplexityFetchTech.js';
import { fetchTrendingFashionProducts } from '../services/perplexity/perplexityFetchFashion.js';
import { fetchTrendingFitnessProducts } from '../services/perplexity/perplexityFetchFitness.js';
import { fetchTrendingFoodProducts } from '../services/perplexity/perplexityFetchFood.js';
import { fetchTrendingTravelProducts } from '../services/perplexity/perplexityFetchTravel.js';
import { fetchTrendingPetsProducts } from '../services/perplexity/perplexityFetchPets.js';

const nicheFetchers = {
  beauty: fetchTrendingBeautyProducts,
  tech: fetchTrendingTechProducts,
  fashion: fetchTrendingFashionProducts,
  fitness: fetchTrendingFitnessProducts,
  food: fetchTrendingFoodProducts,
  travel: fetchTrendingTravelProducts,
  pets: fetchTrendingPetsProducts,
};

export async function refreshIndividualProduct(req: Request, res: Response) {
  try {
    const { productId, niche } = req.body;

    if (!productId || !niche) {
      return res.status(400).json({
        error: 'Product ID and niche are required',
        message: 'Please provide both productId and niche for refresh'
      });
    }

    // Validate niche
    if (!nicheFetchers[niche as keyof typeof nicheFetchers]) {
      return res.status(400).json({
        error: 'Invalid niche',
        message: `Niche must be one of: ${Object.keys(nicheFetchers).join(', ')}`
      });
    }

    console.log(`🔄 Refreshing individual product ${productId} in ${niche} niche`);

    // Find the existing product
    const existingProduct = await db.select()
      .from(trendingProducts)
      .where(eq(trendingProducts.id, parseInt(productId)))
      .limit(1);

    if (!existingProduct.length) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The specified product does not exist'
      });
    }

    // Fetch new products using the appropriate fetcher
    const fetcher = nicheFetchers[niche as keyof typeof nicheFetchers];
    const newProducts = await fetcher();

    if (!newProducts || newProducts.length === 0) {
      return res.status(500).json({
        error: 'Failed to fetch new products',
        message: 'Perplexity API returned no valid products'
      });
    }

    // Select a random product from the fetched results
    const randomProduct = newProducts[Math.floor(Math.random() * newProducts.length)];

    // Update the existing product with new data
    const [updatedProduct] = await db.update(trendingProducts)
      .set({
        title: randomProduct.product,
        mentions: randomProduct.mentions,
        insight: randomProduct.reason,
        source: 'perplexity',
        updatedAt: new Date()
      })
      .where(eq(trendingProducts.id, parseInt(productId)))
      .returning();

    console.log(`✅ Successfully refreshed product ${productId}: ${randomProduct.product}`);

    res.json({
      success: true,
      message: 'Product refreshed successfully',
      product: updatedProduct,
      originalTitle: existingProduct[0].title,
      newTitle: randomProduct.product
    });

  } catch (error) {
    console.error('❌ Individual product refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh product',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}