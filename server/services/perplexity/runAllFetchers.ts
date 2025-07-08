/**
 * Utility to run all niche-specific Perplexity fetchers
 * Tests and validates output per niche individually
 */

import { fetchTrendingFitnessProducts } from './perplexityFetchFitness';
import { fetchTrendingSkincareProducts } from './perplexityFetchSkincare';
import { fetchTrendingTravelProducts } from './perplexityFetchTravel';
import { fetchTrendingTechProducts } from './perplexityFetchTech';
import { fetchTrendingFashionProducts } from './perplexityFetchFashion';
import { fetchTrendingFoodProducts } from './perplexityFetchFood';
import { fetchTrendingPetsProducts } from './perplexityFetchPets';

interface FetcherResult {
  niche: string;
  success: boolean;
  products: any[];
  error?: string;
  duration: number;
}

export async function runAllPerplexityFetchers(): Promise<{
  summary: {
    totalFetchers: number;
    successful: number;
    failed: number;
    totalProducts: number;
  };
  results: FetcherResult[];
}> {
  console.log('🚀 Running all Perplexity niche fetchers...\n');
  
  const fetchers = [
    { name: 'fitness', fetcher: fetchTrendingFitnessProducts },
    { name: 'skincare', fetcher: fetchTrendingSkincareProducts },
    { name: 'travel', fetcher: fetchTrendingTravelProducts },
    { name: 'tech', fetcher: fetchTrendingTechProducts },
    { name: 'fashion', fetcher: fetchTrendingFashionProducts },
    { name: 'food', fetcher: fetchTrendingFoodProducts },
    { name: 'pets', fetcher: fetchTrendingPetsProducts }
  ];

  const results: FetcherResult[] = [];
  let totalProducts = 0;
  let successful = 0;

  for (const { name, fetcher } of fetchers) {
    const startTime = Date.now();
    
    try {
      console.log(`📊 Fetching ${name} products...`);
      const products = await fetcher();
      const duration = Date.now() - startTime;
      
      results.push({
        niche: name,
        success: true,
        products,
        duration
      });
      
      totalProducts += products.length;
      successful++;
      
      console.log(`✅ ${name}: ${products.length} products (${duration}ms)`);
      
      // Log first product as sample
      if (products.length > 0) {
        const sample = products[0];
        console.log(`   Sample: "${sample.product}" by ${sample.brand} (${sample.mentions} mentions)`);
      }
      
      // TODO: Add webhook integration here
      // await sendToWebhook(name, products);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      results.push({
        niche: name,
        success: false,
        products: [],
        error: errorMessage,
        duration
      });
      
      console.error(`❌ ${name}: Failed - ${errorMessage} (${duration}ms)`);
    }
    
    console.log(''); // Empty line for readability
  }

  const summary = {
    totalFetchers: fetchers.length,
    successful,
    failed: fetchers.length - successful,
    totalProducts
  };

  console.log('📋 SUMMARY:');
  console.log(`   Total fetchers: ${summary.totalFetchers}`);
  console.log(`   ✅ Successful: ${summary.successful}`);
  console.log(`   ❌ Failed: ${summary.failed}`);
  console.log(`   📦 Total products: ${summary.totalProducts}`);
  console.log(`   📊 Average per niche: ${Math.round(summary.totalProducts / summary.successful || 0)}`);

  return { summary, results };
}

// Export individual fetchers for direct use
export {
  fetchTrendingFitnessProducts,
  fetchTrendingSkincareProducts,
  fetchTrendingTravelProducts,
  fetchTrendingTechProducts,
  fetchTrendingFashionProducts,
  fetchTrendingFoodProducts,
  fetchTrendingPetsProducts
};

// Optional: Run immediately if called directly (ES module compatible)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  runAllPerplexityFetchers()
    .then(({ summary }) => {
      console.log('\n🎯 All fetchers completed!');
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Fatal error running fetchers:', error);
      process.exit(1);
    });
}