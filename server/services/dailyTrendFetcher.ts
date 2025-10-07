import { getTrendForecast } from './perplexity/trendForecaster';
import { runAllPerplexityFetchers } from './perplexity/runAllFetchers';
import { storage } from '../storage';
import { Niche, NICHES } from '@shared/constants';

const MAX_RETRIES = 3;

interface DailyTrendStatus {
  timestamp: string;
  successCount: number;
  failureCount: number;
  nichesProcessed: string[];
  errors: Array<{ niche: string; error: string }>;
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Attempt ${attempt}/${maxRetries}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ ${operationName} failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}

export async function fetchDailyTrends(): Promise<DailyTrendStatus> {
  console.log('🚀 Starting daily trend fetch for all niches...');
  
  const status: DailyTrendStatus = {
    timestamp: new Date().toISOString(),
    successCount: 0,
    failureCount: 0,
    nichesProcessed: [],
    errors: []
  };

  for (const niche of NICHES) {
    try {
      // Map 'pet' to 'pets' for consistency with other parts of the app
      const nicheForStorage = niche === 'pet' ? 'pets' : niche;
      
      console.log(`\n📊 Processing Trend Forecaster for ${niche}...`);
      
      const forecastResult = await retryOperation(
        () => getTrendForecast(niche),
        `Trend Forecaster - ${niche}`
      );

      await storage.clearTrendHistoryBySourceAndNiche('trend_forecaster', nicheForStorage);
      
      const { dataSource, ...trends } = forecastResult;
      
      let savedCount = 0;
      for (const [category, trendList] of Object.entries(trends)) {
        if (Array.isArray(trendList)) {
          for (const trend of trendList) {
            await storage.saveTrendHistory({
              sourceType: 'trend_forecaster',
              niche: nicheForStorage,
              trendCategory: category,
              trendName: trend.name,
              trendDescription: trend.why || trend.reason || trend.opportunity || trend.prepNow || 'No description available',
              productData: trend.products || null,
              rawData: {
                volume: trend.volume,
                growth: trend.growth,
                when: trend.when,
                why: trend.why,
                reason: trend.reason,
                opportunity: trend.opportunity,
                prepNow: trend.prepNow,
                dataSource: dataSource || null
              }
            });
            savedCount++;
          }
        }
      }
      
      console.log(`✅ ${niche}: Saved ${savedCount} trend forecaster entries`);
      status.successCount++;
      status.nichesProcessed.push(niche);
      
    } catch (error) {
      console.error(`❌ Failed to fetch Trend Forecaster for ${niche}:`, error);
      status.failureCount++;
      status.errors.push({
        niche,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  try {
    console.log('\n🤖 Processing AI Trending Picks (Perplexity)...');
    
    const perplexityResult = await retryOperation(
      () => runAllPerplexityFetchers(),
      'AI Trending Picks'
    );

    for (const result of perplexityResult.results) {
      if (result.success && result.products.length > 0) {
        await storage.clearTrendHistoryBySourceAndNiche('ai_trending_picks', result.niche);
        
        for (const product of result.products) {
          await storage.saveTrendHistory({
            sourceType: 'ai_trending_picks',
            niche: result.niche,
            productTitle: product.product || product.title || 'Unknown Product',
            productMentions: product.mentions || 0,
            productEngagement: product.engagement || 0,
            productSource: 'perplexity',
            productReason: product.reason || '',
            productDescription: product.description || '',
            viralKeywords: product.viralKeywords || [],
            productData: {
              price: product.price || null,
              brand: product.brand || null,
              source: product.source || null,
              mentions: product.mentions || null,
              engagement: product.engagement || null
            },
            rawData: {
              fullProduct: product
            }
          });
        }
        
        console.log(`✅ AI Trending Picks - ${result.niche}: Saved ${result.products.length} products`);
      }
    }
    
    console.log(`✅ AI Trending Picks: Processed ${perplexityResult.summary.successful}/${perplexityResult.summary.totalFetchers} fetchers`);
    
  } catch (error) {
    console.error('❌ Failed to fetch AI Trending Picks:', error);
    status.errors.push({
      niche: 'ai_trending_picks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  console.log(`\n📋 Daily Trend Fetch Summary:`);
  console.log(`   ✅ Success: ${status.successCount}/${NICHES.length} niches`);
  console.log(`   ❌ Failures: ${status.failureCount}`);
  console.log(`   📦 Niches processed: ${status.nichesProcessed.join(', ')}`);
  
  return status;
}
