import cron from 'node-cron';
import { fetchTrendingPicksFromPerplexity } from '../api/perplexity-trending';

const NICHES = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];

// Schedule daily refresh at 5:00 AM
export function startPerplexityCron() {
  console.log('🕐 Scheduling Perplexity trending products cron job for 5:00 AM daily...');
  
  // Run at 5:00 AM every day
  cron.schedule('0 5 * * *', async () => {
    console.log('🔄 Starting daily Perplexity trending products refresh...');
    
    try {
      for (const niche of NICHES) {
        try {
          console.log(`📊 Fetching trending ${niche} products...`);
          const products = await fetchTrendingPicksFromPerplexity(niche);
          console.log(`✅ Successfully fetched ${products.length} trending ${niche} products`);
          
          // Add delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          console.error(`❌ Failed to fetch trending ${niche} products:`, error.message);
        }
      }
      
      console.log('✅ Daily Perplexity trending products refresh completed');
    } catch (error) {
      console.error('❌ Daily Perplexity trending products refresh failed:', error);
    }
  }, {
    timezone: "America/New_York"
  });

  // Optional: Run immediately on startup for testing (comment out in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🚀 Development mode: Running initial Perplexity fetch...');
    setTimeout(async () => {
      try {
        // Just fetch one niche for testing
        const products = await fetchTrendingPicksFromPerplexity('tech');
        console.log(`✅ Initial fetch completed: ${products.length} tech products`);
      } catch (error) {
        console.log(`ℹ️ Initial fetch failed (this is normal if Perplexity API key isn't configured): ${error.message}`);
      }
    }, 5000);
  }
}

// Manual trigger function for testing
export async function triggerPerplexityRefresh() {
  console.log('🔄 Manually triggering Perplexity trending products refresh...');
  
  const results = {};
  
  for (const niche of NICHES) {
    try {
      const products = await fetchTrendingPicksFromPerplexity(niche);
      results[niche] = {
        success: true,
        count: products.length,
        products: products.map(p => p.productName)
      };
    } catch (error) {
      results[niche] = {
        success: false,
        error: error.message
      };
    }
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}