import { request } from 'undici';
import { getAmazonAuth } from './signing';
import { getEnv, requireEnv } from '../env';

/**
 * Amazon PA-API 5.0 Client
 * Handles searchItems, getItems, and getVariations operations with proper error handling
 */

interface PAAPISearchParams {
  keywords?: string;
  category?: string;
  minRating?: number;
  minReviews?: number;
  primeOnly?: boolean;
  sortBy?: 'Featured' | 'Price:LowToHigh' | 'Price:HighToLow' | 'Relevance' | 'NewestArrivals' | 'AvgCustomerReviews';
  maxResults?: number;
}

interface PAAPIItemsParams {
  asins: string[];
}

interface PAAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  cached?: boolean;
}

export class AmazonPAAPIClient {
  private baseUrl: string;
  private partnerTag: string;
  private auth: ReturnType<typeof getAmazonAuth>;

  constructor() {
    const host = getEnv('AMAZON_API_HOST') || 'webservices.amazon.com';
    this.baseUrl = `https://${host}/paapi5`;
    this.partnerTag = requireEnv('AMAZON_PARTNER_TAG', 'Amazon PA-API');
    this.auth = getAmazonAuth();
  }

  /**
   * Search for items using keywords and filters
   */
  async searchItems(params: PAAPISearchParams): Promise<PAAPIResponse> {
    const requestBody = {
      PartnerType: 'Associates',
      PartnerTag: this.partnerTag,
      Marketplace: 'www.amazon.com',
      Keywords: params.keywords,
      SearchIndex: this.mapCategoryToSearchIndex(params.category),
      SortBy: params.sortBy || 'Featured',
      ItemCount: Math.min(params.maxResults || 10, 10), // PA-API max is 10
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible'
      ]
    };

    return this.makeRequest('SearchItems', requestBody);
  }

  /**
   * Get specific items by ASIN
   */
  async getItems(params: PAAPIItemsParams): Promise<PAAPIResponse> {
    const requestBody = {
      PartnerType: 'Associates',
      PartnerTag: this.partnerTag,
      Marketplace: 'www.amazon.com',
      ItemIds: params.asins,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'ItemInfo.ProductInfo'
      ]
    };

    return this.makeRequest('GetItems', requestBody);
  }

  /**
   * Get variations of a parent ASIN
   */
  async getVariations(parentAsin: string): Promise<PAAPIResponse> {
    const requestBody = {
      PartnerType: 'Associates',
      PartnerTag: this.partnerTag,
      Marketplace: 'www.amazon.com',
      ASIN: parentAsin,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'VariationSummary.VariationDimensions'
      ]
    };

    return this.makeRequest('GetVariations', requestBody);
  }

  private async makeRequest(operation: string, body: any): Promise<PAAPIResponse> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/${operation.toLowerCase()}`;
      const requestBody = JSON.stringify(body);
      
      // Sign the request
      const signed = this.auth.signRequest({
        method: 'POST',
        url,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`
        },
        body: requestBody
      });

      // Make the request with retry logic
      const response = await this.requestWithRetry(signed.url, {
        method: 'POST',
        headers: signed.headers,
        body: requestBody
      });

      const duration = Date.now() - startTime;
      console.log(`📦 Amazon PA-API ${operation}: ${response.statusCode} in ${duration}ms`);

      if (response.statusCode === 200) {
        const data = await response.body.json();
        return {
          success: true,
          data
        };
      } else {
        const errorText = await response.body.text();
        console.error(`❌ Amazon PA-API Error (${response.statusCode}):`, errorText);
        
        return {
          success: false,
          error: `PA-API returned ${response.statusCode}: ${errorText}`
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Amazon PA-API ${operation} failed after ${duration}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async requestWithRetry(url: string, options: any, maxRetries = 3): Promise<any> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await request(url, options);
        
        // If rate limited, wait and retry
        if (response.statusCode === 429 && attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // If server error, retry
        if (response.statusCode >= 500 && attempt < maxRetries) {
          const waitTime = 1000 * attempt; // Linear backoff for server errors
          console.log(`🔄 Server error ${response.statusCode}, retrying in ${waitTime}ms (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const waitTime = 1000 * attempt;
          console.log(`🔄 Request failed, retrying in ${waitTime}ms (${attempt}/${maxRetries}):`, error);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
    }
    
    throw lastError;
  }

  private mapCategoryToSearchIndex(category?: string): string {
    const mapping: Record<string, string> = {
      'beauty': 'Beauty',
      'tech': 'Electronics',
      'fashion': 'Fashion',
      'fitness': 'SportingGoods',
      'food': 'Grocery',
      'travel': 'LuggageAndTravelGear',
      'pets': 'PetSupplies',
      'home': 'HomeAndKitchen',
      'books': 'Books',
      'automotive': 'Automotive'
    };
    
    return mapping[category?.toLowerCase() || ''] || 'All';
  }
}

// Singleton instance
let clientInstance: AmazonPAAPIClient | null = null;

export function getAmazonClient(): AmazonPAAPIClient {
  if (!clientInstance) {
    clientInstance = new AmazonPAAPIClient();
  }
  return clientInstance;
}