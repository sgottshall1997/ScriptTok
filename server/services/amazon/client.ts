import { fetch } from 'undici';
import { createAmazonSigner, AmazonSigner } from './signing.js';
import { getAmazonConfig } from '../../env.js';

// Amazon PA-API 5.0 client for product search and discovery

interface AmazonCredentials {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region?: string;
  apiHost?: string;
}

interface SearchItemsRequest {
  Keywords?: string;
  SearchIndex?: string;
  BrowseNodeId?: string;
  ItemCount?: number;
  ItemPage?: number;
  SortBy?: string;
  MinPrice?: number;
  MaxPrice?: number;
  MinReviewsRating?: number;
  MinSavingPercent?: number;
  Brand?: string[];
  Merchant?: 'Amazon' | 'All';
  Condition?: 'New' | 'Used' | 'Collectible' | 'Refurbished' | 'Any';
  DeliveryFlags?: string[];
  LanguagesOfPreference?: string[];
  CurrencyOfPreference?: string;
  Resources?: string[];
}

interface GetItemsRequest {
  ItemIds: string[];
  ItemIdType?: 'ASIN';
  Condition?: 'New' | 'Used' | 'Collectible' | 'Refurbished' | 'Any';
  CurrencyOfPreference?: string;
  LanguagesOfPreference?: string[];
  Merchant?: 'Amazon' | 'All';
  Resources?: string[];
}

interface BrowseNodesRequest {
  BrowseNodeIds: string[];
  LanguagesOfPreference?: string[];
  Resources?: string[];
}

// Standard PA-API resource sets for comprehensive product data
const DEFAULT_RESOURCES = [
  'BrowseNodeInfo.BrowseNodes',
  'BrowseNodeInfo.BrowseNodes.Ancestor',
  'BrowseNodeInfo.WebsiteSalesRank',
  'CustomerReviews.Count',
  'CustomerReviews.StarRating',
  'Images.Primary.Small',
  'Images.Primary.Medium',
  'Images.Primary.Large',
  'ItemInfo.ByLineInfo',
  'ItemInfo.ContentInfo',
  'ItemInfo.ContentRating',
  'ItemInfo.Features',
  'ItemInfo.ManufactureInfo',
  'ItemInfo.ProductInfo',
  'ItemInfo.TechnicalInfo',
  'ItemInfo.Title',
  'ItemInfo.TradeInInfo',
  'Offers.Listings.Availability.MaxOrderQuantity',
  'Offers.Listings.Availability.Message',
  'Offers.Listings.Availability.MinOrderQuantity',
  'Offers.Listings.Availability.Type',
  'Offers.Listings.Condition',
  'Offers.Listings.Condition.ConditionNote',
  'Offers.Listings.Condition.SubCondition',
  'Offers.Listings.DeliveryInfo.IsAmazonFulfilled',
  'Offers.Listings.DeliveryInfo.IsFreeShippingEligible',
  'Offers.Listings.DeliveryInfo.IsPrimeEligible',
  'Offers.Listings.DeliveryInfo.ShippingCharges',
  'Offers.Listings.IsBuyBoxWinner',
  'Offers.Listings.LoyaltyPoints.Points',
  'Offers.Listings.MerchantInfo',
  'Offers.Listings.Price',
  'Offers.Listings.ProgramEligibility.IsPrimeExclusive',
  'Offers.Listings.ProgramEligibility.IsPrimePantry',
  'Offers.Listings.Promotions',
  'Offers.Listings.SavingBasis',
  'Offers.Summaries.HighestPrice',
  'Offers.Summaries.LowestPrice',
  'Offers.Summaries.OfferCount',
  'ParentASIN',
  'RentalOffers.Listings.Availability.MaxOrderQuantity',
  'RentalOffers.Listings.Availability.Message',
  'RentalOffers.Listings.Availability.MinOrderQuantity',
  'RentalOffers.Listings.Availability.Type',
  'RentalOffers.Listings.BasePrice',
  'RentalOffers.Listings.Condition',
  'RentalOffers.Listings.Condition.ConditionNote',
  'RentalOffers.Listings.Condition.SubCondition',
  'RentalOffers.Listings.DeliveryInfo.IsAmazonFulfilled',
  'RentalOffers.Listings.DeliveryInfo.IsFreeShippingEligible',
  'RentalOffers.Listings.DeliveryInfo.IsPrimeEligible',
  'RentalOffers.Listings.MerchantInfo'
];

/**
 * Amazon Product Advertising API 5.0 Client
 * Handles authenticated requests to Amazon's product database
 */
export class AmazonPAAPIClient {
  private signer: AmazonSigner;
  private credentials: AmazonCredentials;
  private apiUrl: string;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds to be very safe (PA-API limit: 1 TPS)

  constructor(credentials: AmazonCredentials) {
    this.credentials = credentials;
    this.signer = createAmazonSigner({
      accessKey: credentials.accessKey,
      secretKey: credentials.secretKey,
      region: credentials.region,
      host: credentials.apiHost
    });
    
    this.apiUrl = `https://${credentials.apiHost || 'webservices.amazon.com'}/paapi5`;
  }

  /**
   * Search for products using keywords, categories, or browse nodes
   */
  async searchItems(request: SearchItemsRequest): Promise<any> {
    const payload = {
      PartnerTag: this.credentials.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.getMarketplaceFromRegion(),
      Resources: request.Resources || DEFAULT_RESOURCES,
      ...request
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    return this.makeRequest('/searchitems', payload);
  }

  /**
   * Get detailed information for specific products by ASIN
   */
  async getItems(request: GetItemsRequest): Promise<any> {
    const payload = {
      PartnerTag: this.credentials.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.getMarketplaceFromRegion(),
      ItemIdType: request.ItemIdType || 'ASIN',
      Resources: request.Resources || DEFAULT_RESOURCES,
      ...request
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    return this.makeRequest('/getitems', payload);
  }

  /**
   * Get browse node information for category navigation
   */
  async getBrowseNodes(request: BrowseNodesRequest): Promise<any> {
    const payload = {
      PartnerTag: this.credentials.partnerTag,
      PartnerType: 'Associates',
      Marketplace: this.getMarketplaceFromRegion(),
      Resources: request.Resources || [
        'BrowseNodes.Ancestor',
        'BrowseNodes.Children',
        'BrowseNodes.SalesRank'
      ],
      ...request
    };

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    return this.makeRequest('/getbrowsenodes', payload);
  }

  /**
   * Make signed request to Amazon PA-API with exponential backoff retry and rate limiting
   */
  private async makeRequest(endpoint: string, payload: any, retries: number = 3): Promise<any> {
    // Rate limiting: ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms before Amazon API request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const requestBody = JSON.stringify(payload);
        
        const signedRequest = this.signer.signRequest({
          method: 'POST',
          path: `/paapi5${endpoint}`,
          body: requestBody
        });

        const response = await fetch(signedRequest.url, {
          method: signedRequest.method,
          headers: signedRequest.headers,
          body: signedRequest.body
        });

        const responseText = await response.text();
        
        if (!response.ok) {
          // 404 InternalFailure is often rate limiting or account restrictions
          if (response.status === 404 && responseText.includes('InternalFailure')) {
            console.log(`⚠️ Amazon API 404 InternalFailure - likely rate limiting or account restriction`);
          }
          
          // Check if this is a retryable error (500s, InternalFailure, or TooManyRequests)
          const isRetryable = response.status >= 500 || 
            responseText.includes('InternalFailure') ||
            responseText.includes('TooManyRequests') ||
            response.status === 404; // Retry 404s as they're often temporary
            
          if (isRetryable && attempt < retries) {
            // Exponential backoff with jitter: (2^attempt * 1000ms) + random(0-1000ms)
            const baseDelay = Math.pow(2, attempt) * 1000;
            const jitter = Math.random() * 1000;
            const delay = baseDelay + jitter;
            
            console.log(`🔄 Amazon API retry ${attempt + 1}/${retries} after ${Math.round(delay)}ms (${response.status})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          throw new AmazonAPIError(
            `Amazon API request failed: ${response.status} ${response.statusText}`,
            response.status,
            responseText
          );
        }

        return JSON.parse(responseText);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (error instanceof AmazonAPIError) {
          // Don't retry non-retryable Amazon API errors
          if (error.statusCode < 500 && !error.responseBody?.includes('InternalFailure')) {
            throw error;
          }
        }
        
        // If this is the last attempt, throw the error
        if (attempt === retries) {
          break;
        }
        
        // Exponential backoff for other errors too
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.log(`🔄 Amazon API retry ${attempt + 1}/${retries} after ${Math.round(delay)}ms (error: ${lastError.message})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we get here, all retries failed
    throw new AmazonAPIError(
      `Request failed after ${retries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
      500,
      lastError?.stack
    );
  }

  /**
   * Get marketplace identifier for the region
   */
  private getMarketplaceFromRegion(): string {
    const region = this.credentials.region || 'us-east-1';
    
    const marketplaces: Record<string, string> = {
      'us-east-1': 'www.amazon.com',
      'us-west-2': 'www.amazon.com',
      'eu-west-1': 'www.amazon.co.uk',
      'eu-central-1': 'www.amazon.de',
      'ap-northeast-1': 'www.amazon.co.jp',
      'ap-southeast-1': 'www.amazon.com.sg',
      'ap-southeast-2': 'www.amazon.com.au'
    };

    return marketplaces[region] || 'www.amazon.com';
  }

  /**
   * Test API connectivity and authentication
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Make a minimal search request to test authentication
      const response = await this.searchItems({
        Keywords: 'test',
        SearchIndex: 'All',
        ItemCount: 1
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recommended search indexes for different niches
   */
  getSearchIndexesForNiche(niche: string): string[] {
    const nicheIndexMap: Record<string, string[]> = {
      'tech': ['Electronics', 'Computers', 'Software'],
      'fitness': ['Sports', 'HealthPersonalCare'],
      'cooking': ['Kitchen', 'GroceryGourmetFood'],
      'fashion': ['Fashion', 'Shoes', 'Jewelry'],
      'beauty': ['Beauty', 'HealthPersonalCare'],
      'home': ['HomeGarden', 'Kitchen', 'Tools'],
      'automotive': ['Automotive'],
      'books': ['Books', 'KindleStore'],
      'toys': ['Toys'],
      'pet': ['PetSupplies'],
      'music': ['Music', 'MusicalInstruments'],
      'video': ['MoviesTV', 'VideoGames'],
      'office': ['OfficeProducts', 'Industrial']
    };

    return nicheIndexMap[niche.toLowerCase()] || ['All'];
  }
}

/**
 * Custom error class for Amazon API issues
 */
export class AmazonAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'AmazonAPIError';
  }
}

/**
 * Factory function to create client from environment
 */
export function createAmazonClient(): AmazonPAAPIClient | null {
  const config = getAmazonConfig();
  
  if (!config.isConfigured) {
    console.warn('Amazon PA-API not configured. Monetization features disabled.');
    return null;
  }

  return new AmazonPAAPIClient({
    accessKey: config.accessKey!,
    secretKey: config.secretKey!,
    partnerTag: config.partnerTag!,
    region: config.region,
    apiHost: config.apiHost
  });
}

// Helper function to validate API response
export function validateAmazonResponse(response: any): boolean {
  return response && 
         response.SearchResult && 
         Array.isArray(response.SearchResult.Items);
}

export type { 
  AmazonCredentials, 
  SearchItemsRequest, 
  GetItemsRequest, 
  BrowseNodesRequest 
};