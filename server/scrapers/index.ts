import { getTikTokTrending } from './tiktok';
import { getRedditTrending } from './reddit';
import { getYouTubeTrending } from './youtube';
import { getInstagramTrending } from './instagram';
import { getAmazonTrending } from './amazon';
import { getGoogleTrendingProducts } from './googleTrends';
import type { TrendingProduct, InsertTrendingProduct } from '@shared/schema';

export interface ScraperReturn {
  products: InsertTrendingProduct[];
  status: {
    status: 'active' | 'error' | 'gpt-fallback';
    errorMessage?: string;
  };
}

export interface ScraperStatus {
  realDataCount: number;
  aiDataCount: number;
  message: string;
  status: 'active' | 'error' | 'gpt-fallback';
  errorMessage?: string;
}

export interface PlatformStatus {
  name: 'tiktok' | 'instagram' | 'youtube' | 'reddit' | 'amazon' | 'google-trends';
  status: 'active' | 'error' | 'gpt-fallback';
  errorMessage?: string;
}

export interface ScraperResults {
  products: InsertTrendingProduct[];
  platforms: PlatformStatus[];
  backgroundIntelligence: Record<string, any>;
}

// Background intelligence gathering for content creation
export async function getBackgroundIntelligence(niche: string): Promise<Record<string, any>> {
  console.log(`🔍 Gathering background intelligence for ${niche}`);
  
  const results = await Promise.allSettled([
    getTikTokTrending(niche),
    getRedditTrending(niche), 
    getYouTubeTrending(niche),
    getInstagramTrending(niche),
    getGoogleTrendingProducts(niche)
  ]);
  
  const intelligence: Record<string, any> = {};
  const platforms = ['tiktok', 'reddit', 'youtube', 'instagram', 'google-trends'];
  
  results.forEach((result, index) => {
    const platform = platforms[index];
    if (result.status === 'fulfilled') {
      intelligence[platform] = {
        products: result.value.products || [],
        status: result.value.status,
        lastUpdated: new Date()
      };
    } else {
      intelligence[platform] = {
        products: [],
        status: { status: 'error', errorMessage: result.reason.message },
        lastUpdated: new Date()
      };
    }
  });
  
  return intelligence;
}

// Primary trending products source: Amazon
export async function getAllTrendingProducts(niche: string = 'skincare'): Promise<ScraperResults> {
  console.log(`🛍️ Getting trending products from Amazon for ${niche} niche`);
  
  const platforms: PlatformStatus[] = [];
  let allProducts: InsertTrendingProduct[] = [];
  
  // Get trending products from Amazon (primary source)
  const amazonResult = await getAmazonTrending(niche);
  
  // Get background intelligence from other sources
  const backgroundIntelligence = await getBackgroundIntelligence(niche);
  
  // Process Amazon results (primary trending products)
  if (amazonResult.products && amazonResult.products.length > 0) {
    allProducts = amazonResult.products;
    platforms.push({
      name: 'amazon',
      status: amazonResult.status.status,
      errorMessage: amazonResult.status.errorMessage
    });
    console.log(`✅ Amazon: Found ${amazonResult.products.length} trending products for display`);
  } else {
    platforms.push({
      name: 'amazon',
      status: 'error',
      errorMessage: amazonResult.status.errorMessage || 'No products found'
    });
    console.log(`❌ Amazon: No trending products found`);
  }
  
  // Add background intelligence sources to status
  Object.keys(backgroundIntelligence).forEach(platform => {
    const platformData = backgroundIntelligence[platform];
    platforms.push({
      name: platform as any,
      status: platformData.status.status,
      errorMessage: platformData.status.errorMessage
    });
  });
  
  return {
    products: allProducts,
    platforms: platforms,
    backgroundIntelligence: backgroundIntelligence
  };
}

// Function to get content intelligence for caption and hashtag generation
export function getContentIntelligence(backgroundData: Record<string, any>, niche: string): {
  trendingTopics: string[];
  popularHashtags: string[];
  contentThemes: string[];
} {
  const trendingTopics: string[] = [];
  const popularHashtags: string[] = [];
  const contentThemes: string[] = [];
  
  // Extract insights from background intelligence
  Object.values(backgroundData).forEach((platformData: any) => {
    if (platformData.products && Array.isArray(platformData.products)) {
      platformData.products.forEach((product: any) => {
        if (product.title) {
          // Extract themes and topics
          const title = product.title.toLowerCase();
          if (title.includes('routine')) contentThemes.push('routine');
          if (title.includes('trending')) contentThemes.push('trending');
          if (title.includes('viral')) contentThemes.push('viral');
          if (title.includes('review')) contentThemes.push('review');
        }
      });
    }
  });
  
  // Generate niche-specific hashtags
  const nicheHashtags: Record<string, string[]> = {
    'skincare': ['#skincare', '#beauty', '#glowup', '#selfcare', '#skincareroutine'],
    'tech': ['#tech', '#gadgets', '#innovation', '#technology', '#techreview'],
    'fashion': ['#fashion', '#style', '#ootd', '#trendy', '#fashionista'],
    'fitness': ['#fitness', '#workout', '#health', '#gym', '#fitlife'],
    'food': ['#food', '#cooking', '#recipe', '#foodie', '#kitchen'],
    'pet': ['#pets', '#dogs', '#cats', '#petcare', '#animals'],
    'travel': ['#travel', '#wanderlust', '#explore', '#adventure', '#vacation']
  };
  
  popularHashtags.push(...(nicheHashtags[niche] || nicheHashtags['skincare']));
  
  return {
    trendingTopics: [...new Set(trendingTopics)],
    popularHashtags: [...new Set(popularHashtags)],
    contentThemes: [...new Set(contentThemes)]
  };
}