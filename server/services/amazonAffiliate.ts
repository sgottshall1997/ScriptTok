/**
 * AMAZON AFFILIATE LINK GENERATOR
 * Generates Amazon affiliate links for products with proper tracking
 */

// DISABLED: Amazon Associates functionality temporarily disabled
import { isAmazonEnabled, getDisabledFeatureMessage } from '@shared/constants';

export interface AffiliateConfig {
  affiliateId: string;
  domain?: string;
  trackingCode?: string;
}

/**
 * GENERATE AMAZON AFFILIATE LINK
 */
export function generateAmazonAffiliateLink(
  productName: string, 
  affiliateId: string = 'sgottshall107-20',
  domain: string = 'amazon.com'
): string {
  // DISABLED: Check if Amazon features are enabled
  if (!isAmazonEnabled()) {
    console.log('🚫 Amazon affiliate link generation disabled via feature flag');
    return `https://example.com/disabled?product=${encodeURIComponent(productName)}`;
  }

  try {
    // Clean product name for URL
    const cleanProductName = productName
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '+') // Replace spaces with +
      .substring(0, 100); // Limit length
    
    // Generate affiliate link with search query
    const baseUrl = `https://${domain}/s`;
    const searchParams = new URLSearchParams({
      k: cleanProductName,
      tag: affiliateId,
      ref: 'sr_1_1'
    });
    
    const affiliateLink = `${baseUrl}?${searchParams.toString()}`;
    
    console.log(`🔗 Generated affiliate link for "${productName}": ${affiliateLink}`);
    return affiliateLink;
    
  } catch (error) {
    console.error('❌ Failed to generate affiliate link:', error);
    // Fallback to basic Amazon link
    return `https://amazon.com/?tag=${affiliateId}`;
  }
}

/**
 * GENERATE PRODUCT-SPECIFIC AFFILIATE LINK
 */
export function generateProductAffiliateLink(
  productName: string,
  asin?: string,
  affiliateId: string = 'sgottshall107-20'
): string {
  // DISABLED: Check if Amazon features are enabled
  if (!isAmazonEnabled()) {
    console.log('🚫 Amazon product affiliate link generation disabled via feature flag');
    return `https://example.com/disabled?product=${encodeURIComponent(productName)}`;
  }

  try {
    if (asin) {
      // Direct product link if ASIN is available
      return `https://amazon.com/dp/${asin}?tag=${affiliateId}`;
    } else {
      // Search-based link if no ASIN
      return generateAmazonAffiliateLink(productName, affiliateId);
    }
  } catch (error) {
    console.error('❌ Failed to generate product affiliate link:', error);
    return generateAmazonAffiliateLink(productName, affiliateId);
  }
}

/**
 * VALIDATE AFFILIATE ID FORMAT
 */
export function validateAffiliateId(affiliateId: string): boolean {
  // DISABLED: Check if Amazon features are enabled
  if (!isAmazonEnabled()) {
    console.log('🚫 Amazon affiliate ID validation disabled via feature flag');
    return false;
  }

  // Amazon affiliate IDs typically follow the pattern: name-number
  const affiliatePattern = /^[a-zA-Z0-9\-]{1,20}$/;
  return affiliatePattern.test(affiliateId);
}

/**
 * GET AFFILIATE LINK METADATA
 */
export function getAffiliateLinkMetadata(affiliateLink: string): {
  domain: string;
  affiliateId: string;
  productSearch?: string;
  isValid: boolean;
} {
  try {
    const url = new URL(affiliateLink);
    const searchParams = new URLSearchParams(url.search);
    
    return {
      domain: url.hostname,
      affiliateId: searchParams.get('tag') || '',
      productSearch: searchParams.get('k') || undefined,
      isValid: url.hostname.includes('amazon') && !!searchParams.get('tag')
    };
  } catch (error) {
    return {
      domain: '',
      affiliateId: '',
      isValid: false
    };
  }
}

/**
 * TRACK AFFILIATE LINK CLICKS (placeholder for analytics)
 */
export function trackAffiliateClick(
  affiliateLink: string,
  productName: string,
  source: string = 'content_generator'
): void {
  // DISABLED: Check if Amazon features are enabled
  if (!isAmazonEnabled()) {
    console.log('🚫 Amazon affiliate click tracking disabled via feature flag');
    return;
  }

  // This could be enhanced to send analytics to external services
  console.log(`📊 Affiliate click tracked: ${productName} from ${source}`);
  console.log(`🔗 Link: ${affiliateLink}`);
}