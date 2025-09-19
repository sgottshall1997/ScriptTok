import { createAmazonClient } from './amazon/client.js';
import { normalizeAmazonProduct, NormalizedProduct } from './amazon/normalize.js';
import { getCache, CACHE_TTL, CACHE_KEYS } from '../cache/index.js';
import { getAmazonConfig } from '../env.js';

// Hybrid trends discovery combining multiple sources
// Sources: Perplexity (existing), Reddit, Amazon Product Search

interface TrendSource {
  name: 'perplexity' | 'reddit' | 'amazon';
  priority: number;
  enabled: boolean;
  lastUpdated?: Date;
}

interface TrendingKeyword {
  keyword: string;
  score: number;
  source: TrendSource['name'];
  mentions: number;
  category?: string;
  relatedTerms?: string[];
}

interface TrendingProduct extends NormalizedProduct {
  trendScore: number;
  sources: TrendSource['name'][];
  discoverySources: {
    keywords: string[];
    searchTerms: string[];
    categories: string[];
  };
}

interface HybridTrendsResult {
  keywords: TrendingKeyword[];
  products: TrendingProduct[];
  sources: TrendSource[];
  lastUpdated: Date;
  totalSources: number;
  coverage: {
    amazon: boolean;
    reddit: boolean;
    perplexity: boolean;
  };
}

/**
 * Hybrid Trends Discovery Engine
 * Combines Perplexity, Reddit, and Amazon sources for comprehensive trend discovery
 */
export class HybridTrendsEngine {
  private cache = getCache();
  private amazonClient = createAmazonClient();
  
  private sources: TrendSource[] = [
    { name: 'perplexity', priority: 1, enabled: true },
    { name: 'reddit', priority: 2, enabled: true },
    { name: 'amazon', priority: 3, enabled: !!this.amazonClient }
  ];

  /**
   * Discover trending topics and products across all sources
   */
  async discoverTrends(options: {
    niche?: string;
    maxKeywords?: number;
    maxProducts?: number;
    forceRefresh?: boolean;
  } = {}): Promise<HybridTrendsResult> {
    const cacheKey = `${CACHE_KEYS.TRENDING}:hybrid:${options.niche || 'all'}`;
    
    if (!options.forceRefresh) {
      const cached = await this.cache.get<HybridTrendsResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    console.log('🔍 Discovering hybrid trends across sources...');
    
    // Discover keywords from multiple sources
    const keywords = await this.discoverKeywords(options.niche);
    
    // Map keywords to Amazon products
    const products = await this.discoverProducts(keywords, options);
    
    const result: HybridTrendsResult = {
      keywords: keywords.slice(0, options.maxKeywords || 50),
      products: products.slice(0, options.maxProducts || 30),
      sources: this.sources,
      lastUpdated: new Date(),
      totalSources: this.sources.filter(s => s.enabled).length,
      coverage: {
        amazon: this.sources.find(s => s.name === 'amazon')?.enabled || false,
        reddit: this.sources.find(s => s.name === 'reddit')?.enabled || false,
        perplexity: this.sources.find(s => s.name === 'perplexity')?.enabled || false
      }
    };

    // Cache for 4 hours
    await this.cache.set(cacheKey, result, CACHE_TTL.TRENDING_TOPICS);
    
    return result;
  }

  /**
   * Discover trending keywords from all sources
   */
  private async discoverKeywords(niche?: string): Promise<TrendingKeyword[]> {
    const allKeywords: TrendingKeyword[] = [];

    // 1. Perplexity keywords (from existing trends system)
    try {
      const perplexityKeywords = await this.getPerplexityKeywords(niche);
      allKeywords.push(...perplexityKeywords);
    } catch (error) {
      console.warn('Perplexity keyword discovery failed:', error);
    }

    // 2. Reddit keywords (simulated for now)
    try {
      const redditKeywords = await this.getRedditKeywords(niche);
      allKeywords.push(...redditKeywords);
    } catch (error) {
      console.warn('Reddit keyword discovery failed:', error);
    }

    // 3. Amazon best sellers keywords
    try {
      const amazonKeywords = await this.getAmazonKeywords(niche);
      allKeywords.push(...amazonKeywords);
    } catch (error) {
      console.warn('Amazon keyword discovery failed:', error);
    }

    // Deduplicate and score keywords
    return this.consolidateKeywords(allKeywords);
  }

  /**
   * Get trending keywords from Perplexity (existing system)
   */
  private async getPerplexityKeywords(niche?: string): Promise<TrendingKeyword[]> {
    // This would integrate with existing Perplexity trends
    // For now, return simulated data based on niche
    const baseKeywords = niche ? this.getNicheKeywords(niche) : this.getGeneralKeywords();
    
    return baseKeywords.map((keyword, index) => ({
      keyword,
      score: 90 - (index * 2), // Declining scores
      source: 'perplexity' as const,
      mentions: 50000 - (index * 2000),
      category: niche,
      relatedTerms: this.getRelatedTerms(keyword)
    }));
  }

  /**
   * Get trending keywords from Reddit (simulated)
   */
  private async getRedditKeywords(niche?: string): Promise<TrendingKeyword[]> {
    // This would use Reddit API to discover trending topics
    // For now, simulate Reddit-style keywords
    const redditTerms = niche ? 
      this.getRedditNicheTerms(niche) : 
      ['viral', 'trending', 'must have', 'game changer', 'obsessed with'];
    
    return redditTerms.map((keyword, index) => ({
      keyword,
      score: 75 - (index * 3),
      source: 'reddit' as const,
      mentions: 25000 - (index * 1500),
      category: niche,
      relatedTerms: []
    }));
  }

  /**
   * Get trending keywords from Amazon search trends
   */
  private async getAmazonKeywords(niche?: string): Promise<TrendingKeyword[]> {
    if (!this.amazonClient) {
      return [];
    }

    try {
      // Use Amazon browse nodes to discover trending categories
      const searchTerms = niche ? 
        this.getAmazonSearchTerms(niche) : 
        ['bestseller', 'new arrivals', 'trending now'];

      const keywords: TrendingKeyword[] = [];
      
      for (const term of searchTerms.slice(0, 3)) {
        try {
          const searchResult = await this.amazonClient.searchItems({
            Keywords: term,
            SearchIndex: niche ? this.getSearchIndexForNiche(niche) : 'All',
            ItemCount: 10,
            SortBy: 'Relevance'
          });

          // Extract keywords from product titles
          const items = searchResult?.SearchResult?.Items || [];
          const extractedKeywords = this.extractKeywordsFromProducts(items);
          
          keywords.push(...extractedKeywords.map((keyword, index) => ({
            keyword,
            score: 60 - (index * 2),
            source: 'amazon' as const,
            mentions: 15000 - (index * 1000),
            category: niche,
            relatedTerms: []
          })));
        } catch (error) {
          console.warn(`Amazon search failed for term "${term}":`, error);
        }
      }

      return keywords;
    } catch (error) {
      console.error('Amazon keywords discovery failed:', error);
      return [];
    }
  }

  /**
   * Discover products based on trending keywords
   */
  private async discoverProducts(
    keywords: TrendingKeyword[], 
    options: { maxProducts?: number; niche?: string }
  ): Promise<TrendingProduct[]> {
    if (!this.amazonClient) {
      return [];
    }

    const products: TrendingProduct[] = [];
    const topKeywords = keywords
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Use top 10 keywords for product discovery

    for (const keyword of topKeywords) {
      try {
        const searchResult = await this.amazonClient.searchItems({
          Keywords: keyword.keyword,
          SearchIndex: options.niche ? this.getSearchIndexForNiche(options.niche) : 'All',
          ItemCount: 5,
          SortBy: 'Relevance',
          MinReviewsRating: 4, // Only quality products
          Condition: 'New'
        });

        const items = searchResult?.SearchResult?.Items || [];
        const amazonConfig = getAmazonConfig();
        
        for (const item of items) {
          const normalizedProduct = normalizeAmazonProduct(item, amazonConfig.partnerTag!);
          if (normalizedProduct) {
            const trendingProduct: TrendingProduct = {
              ...normalizedProduct,
              trendScore: keyword.score,
              sources: [keyword.source],
              discoverySources: {
                keywords: [keyword.keyword],
                searchTerms: [keyword.keyword],
                categories: keyword.category ? [keyword.category] : []
              }
            };
            
            products.push(trendingProduct);
          }
        }
      } catch (error) {
        console.warn(`Product discovery failed for keyword "${keyword.keyword}":`, error);
      }
    }

    // Remove duplicates and sort by trend score
    const uniqueProducts = this.deduplicateProducts(products);
    return uniqueProducts
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, options.maxProducts || 30);
  }

  /**
   * Consolidate keywords from multiple sources
   */
  private consolidateKeywords(keywords: TrendingKeyword[]): TrendingKeyword[] {
    const keywordMap = new Map<string, TrendingKeyword>();

    for (const keyword of keywords) {
      const normalizedKey = keyword.keyword.toLowerCase().trim();
      
      if (keywordMap.has(normalizedKey)) {
        const existing = keywordMap.get(normalizedKey)!;
        // Combine scores and mentions
        existing.score = Math.max(existing.score, keyword.score);
        existing.mentions += keyword.mentions;
        existing.relatedTerms = [
          ...(existing.relatedTerms || []),
          ...(keyword.relatedTerms || [])
        ];
      } else {
        keywordMap.set(normalizedKey, { ...keyword });
      }
    }

    return Array.from(keywordMap.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Remove duplicate products based on ASIN
   */
  private deduplicateProducts(products: TrendingProduct[]): TrendingProduct[] {
    const productMap = new Map<string, TrendingProduct>();

    for (const product of products) {
      if (productMap.has(product.asin)) {
        const existing = productMap.get(product.asin)!;
        // Combine sources and update trend score
        existing.sources = Array.from(new Set([...existing.sources, ...product.sources]));
        existing.trendScore = Math.max(existing.trendScore, product.trendScore);
        existing.discoverySources.keywords = Array.from(
          new Set([...existing.discoverySources.keywords, ...product.discoverySources.keywords])
        );
      } else {
        productMap.set(product.asin, product);
      }
    }

    return Array.from(productMap.values());
  }

  // Helper methods for keyword generation
  private getNicheKeywords(niche: string): string[] {
    const nicheKeywords: Record<string, string[]> = {
      tech: ['AI gadgets', 'smart home', 'wireless charging', 'productivity tools', 'gaming setup'],
      fitness: ['home gym', 'workout gear', 'protein powder', 'fitness tracker', 'yoga essentials'],
      beauty: ['skincare routine', 'makeup trends', 'anti-aging', 'natural beauty', 'K-beauty'],
      fashion: ['sustainable fashion', 'streetwear', 'vintage style', 'minimalist wardrobe', 'accessories'],
      food: ['healthy snacks', 'meal prep', 'superfoods', 'plant-based', 'artisan coffee'],
      travel: ['travel essentials', 'packing hacks', 'digital nomad', 'adventure gear', 'luggage'],
      pets: ['pet toys', 'pet health', 'training tools', 'pet grooming', 'smart pet devices']
    };

    return nicheKeywords[niche] || ['trending', 'popular', 'bestseller', 'must have', 'viral'];
  }

  private getGeneralKeywords(): string[] {
    return [
      'trending now', 'viral products', 'bestsellers', 'must have items', 'game changing',
      'life hacks', 'productivity boost', 'self care', 'sustainable living', 'tech innovation'
    ];
  }

  private getRedditNicheTerms(niche: string): string[] {
    const redditNicheTerms: Record<string, string[]> = {
      tech: ['mind blown', 'game changer', 'holy grail', 'obsessed', 'life changing'],
      fitness: ['gains', 'transformation', 'beast mode', 'PR personal record', 'shredded'],
      beauty: ['holy grail', 'obsessed', 'glowing skin', 'dewy look', 'glass skin'],
      fashion: ['outfit inspo', 'style icon', 'thrift find', 'OOTD', 'sustainable fashion'],
      food: ['foodie find', 'flavor bomb', 'comfort food', 'healthy swaps', 'meal prep'],
      travel: ['wanderlust', 'bucket list', 'hidden gem', 'travel hack', 'adventure'],
      pets: ['fur baby', 'good boy', 'pet parent', 'spoiled pet', 'rescue pet']
    };

    return redditNicheTerms[niche] || ['trending', 'viral', 'obsessed', 'must have', 'game changer'];
  }

  private getAmazonSearchTerms(niche: string): string[] {
    const amazonTerms: Record<string, string[]> = {
      tech: ['electronics bestseller', 'smart device', 'wireless technology'],
      fitness: ['fitness equipment', 'workout gear', 'sports nutrition'],
      beauty: ['beauty bestseller', 'skincare must have', 'makeup trending'],
      fashion: ['fashion trending', 'style essentials', 'wardrobe staples'],
      food: ['gourmet food', 'healthy snacks', 'pantry essentials'],
      travel: ['travel accessories', 'luggage bestseller', 'travel gear'],
      pets: ['pet supplies', 'dog toys', 'cat essentials']
    };

    return amazonTerms[niche] || ['bestseller', 'trending', 'highly rated'];
  }

  private getSearchIndexForNiche(niche: string): string {
    const searchIndexes: Record<string, string> = {
      tech: 'Electronics',
      fitness: 'Sports',
      beauty: 'Beauty',
      fashion: 'Fashion',
      food: 'GroceryGourmetFood',
      travel: 'Luggage',
      pets: 'PetSupplies'
    };

    return searchIndexes[niche] || 'All';
  }

  private getRelatedTerms(keyword: string): string[] {
    // Simple related terms generation
    const related: Record<string, string[]> = {
      'AI gadgets': ['smart home', 'automation', 'tech innovation'],
      'skincare routine': ['anti-aging', 'natural beauty', 'glowing skin'],
      'home gym': ['fitness equipment', 'workout gear', 'exercise'],
      'sustainable fashion': ['eco-friendly', 'ethical fashion', 'slow fashion']
    };

    return related[keyword] || [];
  }

  private extractKeywordsFromProducts(items: any[]): string[] {
    const keywords: string[] = [];
    
    for (const item of items) {
      const title = item?.ItemInfo?.Title?.DisplayValue || '';
      // Extract meaningful words from product titles
      const words = title
        .toLowerCase()
        .split(/\s+/)
        .filter((word: string) => word.length > 3 && !this.isStopWord(word))
        .slice(0, 3); // Take first 3 meaningful words
      
      keywords.push(...words);
    }

    // Return unique keywords
    return Array.from(new Set(keywords));
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['with', 'and', 'for', 'the', 'pack', 'set', 'new', 'best', 'top', 'from'];
    return stopWords.includes(word.toLowerCase());
  }
}

// Export singleton instance
export const hybridTrendsEngine = new HybridTrendsEngine();