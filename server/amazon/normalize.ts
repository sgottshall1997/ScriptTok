import { getEnv } from '../env';

/**
 * Normalizes Amazon PA-API responses to a consistent format
 * Handles URL generation with proper partner tags and ascsubtag attribution
 */

export interface NormalizedItem {
  asin: string;
  title: string;
  image: string | null;
  rating: number | null;
  reviewCount: number | null;
  price: string | null; // display amount
  isPrime: boolean | null;
  url: string; // must include partner tag + ascsubtag
}

interface AscSubtagConfig {
  niche: string;
  platform: string;
  prefix?: string;
}

export class AmazonResponseNormalizer {
  private storeDomain: string;
  private partnerTag: string;

  constructor() {
    this.storeDomain = getEnv('AMAZON_STORE_DOMAIN') as string || 'www.amazon.com';
    this.partnerTag = getEnv('AMAZON_PARTNER_TAG') as string || '';
  }

  /**
   * Normalize PA-API search response to NormalizedItem[]
   */
  normalizeSearchResponse(response: any, ascSubtagConfig: AscSubtagConfig): NormalizedItem[] {
    if (!response?.SearchResult?.Items) {
      return [];
    }

    return response.SearchResult.Items
      .map((item: any) => this.normalizeItem(item, ascSubtagConfig))
      .filter((item: NormalizedItem | null) => item !== null) as NormalizedItem[];
  }

  /**
   * Normalize PA-API get items response to NormalizedItem[]
   */
  normalizeItemsResponse(response: any, ascSubtagConfig: AscSubtagConfig): NormalizedItem[] {
    if (!response?.ItemsResult?.Items) {
      return [];
    }

    return response.ItemsResult.Items
      .map((item: any) => this.normalizeItem(item, ascSubtagConfig))
      .filter((item: NormalizedItem | null) => item !== null) as NormalizedItem[];
  }

  /**
   * Normalize PA-API variations response to NormalizedItem[]
   */
  normalizeVariationsResponse(response: any, ascSubtagConfig: AscSubtagConfig): NormalizedItem[] {
    if (!response?.VariationsResult?.Items) {
      return [];
    }

    return response.VariationsResult.Items
      .map((item: any) => this.normalizeItem(item, ascSubtagConfig))
      .filter((item: NormalizedItem | null) => item !== null) as NormalizedItem[];
  }

  private normalizeItem(item: any, ascSubtagConfig: AscSubtagConfig): NormalizedItem | null {
    if (!item?.ASIN) {
      return null;
    }

    try {
      // Extract basic info
      const asin = item.ASIN;
      const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
      
      // Extract image
      const image = item.Images?.Primary?.Large?.URL || 
                   item.Images?.Primary?.Medium?.URL || 
                   item.Images?.Primary?.Small?.URL || 
                   null;

      // Extract ratings and reviews
      const rating = item.CustomerReviews?.StarRating?.Value || null;
      const reviewCount = item.CustomerReviews?.Count || null;

      // Extract price
      let price: string | null = null;
      const offers = item.Offers?.Listings?.[0];
      if (offers?.Price?.DisplayAmount) {
        price = offers.Price.DisplayAmount;
      } else if (offers?.Price?.Amount && offers?.Price?.Currency) {
        // Format price if we have raw amount
        const amount = parseFloat(offers.Price.Amount);
        const currency = offers.Price.Currency;
        price = currency === 'USD' ? `$${amount.toFixed(2)}` : `${amount.toFixed(2)} ${currency}`;
      }

      // Extract Prime eligibility
      const isPrime = offers?.DeliveryInfo?.IsPrimeEligible || false;

      // Generate affiliate URL with ascsubtag
      const url = this.generateAffiliateUrl(asin, ascSubtagConfig);

      return {
        asin,
        title,
        image,
        rating,
        reviewCount,
        price,
        isPrime,
        url
      };

    } catch (error) {
      console.error(`❌ Error normalizing item ${item?.ASIN}:`, error);
      return null;
    }
  }

  /**
   * Generate affiliate URL with proper partner tag and ascsubtag attribution
   */
  private generateAffiliateUrl(asin: string, config: AscSubtagConfig): string {
    const baseUrl = `https://${this.storeDomain}/dp/${asin}`;
    const ascsubtag = this.buildAscSubtag(config);
    
    const params = new URLSearchParams();
    if (this.partnerTag) {
      params.set('tag', this.partnerTag);
    }
    params.set('ascsubtag', ascsubtag);
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Build ascsubtag for attribution tracking
   * Format: <prefix><niche>_<YYYY-MM-DD>_<platform>
   */
  private buildAscSubtag(config: AscSubtagConfig): string {
    const prefix = config.prefix || getEnv('MONETIZATION_ASC_SUBTAG_PREFIX') || 'glowbot_';
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    return `${prefix}${config.niche}_${date}_${config.platform}`;
  }

  /**
   * Apply server-side filters to normalized items
   */
  filterItems(items: NormalizedItem[], filters: {
    minRating?: number;
    minReviews?: number;
    primeOnly?: boolean;
    maxPrice?: number;
    minPrice?: number;
  }): NormalizedItem[] {
    return items.filter(item => {
      // Rating filter
      if (filters.minRating && (item.rating === null || item.rating < filters.minRating)) {
        return false;
      }

      // Review count filter
      if (filters.minReviews && (item.reviewCount === null || item.reviewCount < filters.minReviews)) {
        return false;
      }

      // Prime filter
      if (filters.primeOnly && !item.isPrime) {
        return false;
      }

      // Price filters
      if (filters.maxPrice || filters.minPrice) {
        const priceNum = this.extractPriceNumber(item.price);
        if (priceNum === null) return false;
        
        if (filters.minPrice && priceNum < filters.minPrice) return false;
        if (filters.maxPrice && priceNum > filters.maxPrice) return false;
      }

      return true;
    });
  }

  /**
   * Extract numeric value from price string
   */
  private extractPriceNumber(price: string | null): number | null {
    if (!price) return null;
    
    const match = price.match(/[\d,]+\.?\d*/);
    if (!match) return null;
    
    return parseFloat(match[0].replace(/,/g, ''));
  }
}

// Singleton instance
let normalizerInstance: AmazonResponseNormalizer | null = null;

export function getAmazonNormalizer(): AmazonResponseNormalizer {
  if (!normalizerInstance) {
    normalizerInstance = new AmazonResponseNormalizer();
  }
  return normalizerInstance;
}