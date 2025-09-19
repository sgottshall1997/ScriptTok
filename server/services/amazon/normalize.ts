// Amazon PA-API response normalization and data transformation utilities

interface RawAmazonItem {
  ASIN: string;
  ItemInfo?: {
    Title?: { DisplayValue?: string };
    ByLineInfo?: { Brand?: { DisplayValue?: string } };
    Features?: { DisplayValues?: string[] };
    ProductInfo?: { 
      Color?: { DisplayValue?: string };
      Size?: { DisplayValue?: string };
    };
  };
  Images?: {
    Primary?: {
      Small?: { URL?: string; Height?: number; Width?: number };
      Medium?: { URL?: string; Height?: number; Width?: number };
      Large?: { URL?: string; Height?: number; Width?: number };
    };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        DisplayAmount?: string;
        Amount?: number;
        Currency?: string;
      };
      Condition?: { Value?: string };
      Availability?: { Type?: string };
      DeliveryInfo?: {
        IsPrimeEligible?: boolean;
        IsFreeShippingEligible?: boolean;
        IsAmazonFulfilled?: boolean;
      };
      SavingBasis?: {
        DisplayAmount?: string;
        Amount?: number;
      };
    }>;
    Summaries?: Array<{
      OfferCount?: number;
      LowestPrice?: {
        DisplayAmount?: string;
        Amount?: number;
        Currency?: string;
      };
      HighestPrice?: {
        DisplayAmount?: string;
        Amount?: number;
        Currency?: string;
      };
    }>;
  };
  CustomerReviews?: {
    Count?: number;
    StarRating?: {
      Value?: number;
    };
  };
  BrowseNodeInfo?: {
    BrowseNodes?: Array<{
      Id?: string;
      DisplayName?: string;
      ContextFreeName?: string;
    }>;
  };
  DetailPageURL?: string;
}

// Normalized product structure for our application
export interface NormalizedProduct {
  id: string;
  asin: string;
  title: string;
  brand?: string;
  description?: string;
  features: string[];
  category?: string;
  subcategory?: string;
  price?: {
    current: number;
    currency: string;
    display: string;
    original?: number;
    discount?: number;
    discountPercent?: number;
  };
  images: {
    small?: string;
    medium?: string;
    large?: string;
  };
  availability: {
    inStock: boolean;
    type: string;
    message?: string;
  };
  shipping: {
    isPrime: boolean;
    isFreeShipping: boolean;
    isAmazonFulfilled: boolean;
  };
  reviews: {
    count: number;
    rating: number;
    hasReviews: boolean;
  };
  affiliateUrl: string;
  lastUpdated: Date;
  metadata: {
    source: 'amazon';
    searchRelevance?: number;
    isSponsored?: boolean;
    condition: string;
    color?: string;
    size?: string;
  };
}

// Search result structure
export interface NormalizedSearchResult {
  products: NormalizedProduct[];
  totalResults: number;
  searchTerms?: string;
  category?: string;
  hasMoreResults: boolean;
  nextPage?: number;
  searchTime: Date;
  source: 'amazon';
}

/**
 * Normalizes Amazon PA-API search response into our standard format
 */
export function normalizeAmazonSearchResponse(
  response: any,
  partnerTag: string,
  searchParams?: { keywords?: string; category?: string; page?: number }
): NormalizedSearchResult {
  const searchResult = response?.SearchResult;
  const items = searchResult?.Items || [];
  const totalResults = searchResult?.TotalResultCount || items.length;

  const normalizedProducts = items
    .map((item: RawAmazonItem) => normalizeAmazonProduct(item, partnerTag))
    .filter((product: NormalizedProduct | null): product is NormalizedProduct => product !== null);

  return {
    products: normalizedProducts,
    totalResults,
    searchTerms: searchParams?.keywords,
    category: searchParams?.category,
    hasMoreResults: totalResults > normalizedProducts.length,
    nextPage: searchParams?.page ? searchParams.page + 1 : 2,
    searchTime: new Date(),
    source: 'amazon'
  };
}

/**
 * Normalizes a single Amazon product into our standard format
 */
export function normalizeAmazonProduct(
  item: RawAmazonItem,
  partnerTag: string
): NormalizedProduct | null {
  if (!item?.ASIN) {
    return null;
  }

  try {
    const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
    const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue;
    const features = item.ItemInfo?.Features?.DisplayValues || [];
    
    // Extract pricing information
    const listing = item.Offers?.Listings?.[0];
    const summary = item.Offers?.Summaries?.[0];
    const currentPrice = listing?.Price || summary?.LowestPrice;
    const originalPrice = listing?.SavingBasis;
    
    const price = currentPrice ? {
      current: currentPrice.Amount || 0,
      currency: currentPrice.Currency || 'USD',
      display: currentPrice.DisplayAmount || '$0.00',
      original: originalPrice?.Amount,
      discount: originalPrice?.Amount ? (originalPrice.Amount - (currentPrice.Amount || 0)) : undefined,
      discountPercent: originalPrice?.Amount && currentPrice.Amount ? 
        Math.round(((originalPrice.Amount - currentPrice.Amount) / originalPrice.Amount) * 100) : undefined
    } : undefined;

    // Extract image URLs
    const images = {
      small: item.Images?.Primary?.Small?.URL,
      medium: item.Images?.Primary?.Medium?.URL,
      large: item.Images?.Primary?.Large?.URL
    };

    // Extract availability info
    const availability = {
      inStock: listing?.Availability?.Type === 'Now',
      type: listing?.Availability?.Type || 'Unknown',
      message: undefined
    };

    // Extract shipping info
    const shipping = {
      isPrime: listing?.DeliveryInfo?.IsPrimeEligible || false,
      isFreeShipping: listing?.DeliveryInfo?.IsFreeShippingEligible || false,
      isAmazonFulfilled: listing?.DeliveryInfo?.IsAmazonFulfilled || false
    };

    // Extract review information
    const reviews = {
      count: item.CustomerReviews?.Count || 0,
      rating: item.CustomerReviews?.StarRating?.Value || 0,
      hasReviews: (item.CustomerReviews?.Count || 0) > 0
    };

    // Generate affiliate URL
    const affiliateUrl = generateAffiliateUrl(item.ASIN, partnerTag, item.DetailPageURL);

    // Extract category information
    const browseNode = item.BrowseNodeInfo?.BrowseNodes?.[0];
    const category = browseNode?.DisplayName;

    return {
      id: `amazon_${item.ASIN}`,
      asin: item.ASIN,
      title: title.substring(0, 200), // Limit title length
      brand,
      description: features.slice(0, 3).join('. '), // Use first 3 features as description
      features: features.slice(0, 10), // Limit features
      category,
      subcategory: browseNode?.ContextFreeName,
      price,
      images,
      availability,
      shipping,
      reviews,
      affiliateUrl,
      lastUpdated: new Date(),
      metadata: {
        source: 'amazon',
        condition: listing?.Condition?.Value || 'New',
        color: item.ItemInfo?.ProductInfo?.Color?.DisplayValue,
        size: item.ItemInfo?.ProductInfo?.Size?.DisplayValue
      }
    };
  } catch (error) {
    console.error('Error normalizing Amazon product:', error, item);
    return null;
  }
}

/**
 * Generates Amazon affiliate URL with partner tag
 */
export function generateAffiliateUrl(
  asin: string, 
  partnerTag: string, 
  originalUrl?: string
): string {
  if (originalUrl && originalUrl.includes('amazon.')) {
    // Ensure partner tag is added to existing URL
    const url = new URL(originalUrl);
    url.searchParams.set('tag', partnerTag);
    return url.toString();
  }

  // Generate standard affiliate URL
  return `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`;
}

/**
 * Extracts trending product insights from Amazon search results
 */
export function extractTrendingInsights(products: NormalizedProduct[]): {
  popularBrands: string[];
  priceRanges: { min: number; max: number; average: number };
  topFeatures: string[];
  categoryDistribution: Record<string, number>;
} {
  const brands = products
    .map(p => p.brand)
    .filter(Boolean)
    .reduce((acc, brand) => {
      acc[brand!] = (acc[brand!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const prices = products
    .map(p => p.price?.current)
    .filter((price): price is number => typeof price === 'number' && price > 0);

  const features = products
    .flatMap(p => p.features)
    .reduce((acc, feature) => {
      const normalized = feature.toLowerCase().trim();
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const categories = products
    .map(p => p.category)
    .filter(Boolean)
    .reduce((acc, category) => {
      acc[category!] = (acc[category!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return {
    popularBrands: Object.entries(brands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([brand]) => brand),
    priceRanges: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    },
    topFeatures: Object.entries(features)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([feature]) => feature),
    categoryDistribution: categories
  };
}

/**
 * Filters products by price range, rating, and availability
 */
export function filterProducts(
  products: NormalizedProduct[],
  filters: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    primeOnly?: boolean;
    brands?: string[];
    categories?: string[];
  }
): NormalizedProduct[] {
  return products.filter(product => {
    // Price filters
    if (filters.minPrice && (!product.price || product.price.current < filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice && (!product.price || product.price.current > filters.maxPrice)) {
      return false;
    }
    
    // Rating filter
    if (filters.minRating && product.reviews.rating < filters.minRating) {
      return false;
    }
    
    // Availability filters
    if (filters.inStockOnly && !product.availability.inStock) {
      return false;
    }
    if (filters.primeOnly && !product.shipping.isPrime) {
      return false;
    }
    
    // Brand filter
    if (filters.brands?.length && (!product.brand || !filters.brands.includes(product.brand))) {
      return false;
    }
    
    // Category filter
    if (filters.categories?.length && (!product.category || !filters.categories.includes(product.category))) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sorts products by various criteria
 */
export function sortProducts(
  products: NormalizedProduct[],
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'reviews' | 'newest'
): NormalizedProduct[] {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.price?.current || Infinity) - (b.price?.current || Infinity);
      case 'price_high':
        return (b.price?.current || 0) - (a.price?.current || 0);
      case 'rating':
        return b.reviews.rating - a.reviews.rating;
      case 'reviews':
        return b.reviews.count - a.reviews.count;
      case 'newest':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      case 'relevance':
      default:
        // For relevance, prioritize products with good ratings and prime shipping
        const scoreA = (a.reviews.rating * 0.4) + (a.shipping.isPrime ? 0.3 : 0) + (a.availability.inStock ? 0.3 : 0);
        const scoreB = (b.reviews.rating * 0.4) + (b.shipping.isPrime ? 0.3 : 0) + (b.availability.inStock ? 0.3 : 0);
        return scoreB - scoreA;
    }
  });
}

export type { RawAmazonItem };