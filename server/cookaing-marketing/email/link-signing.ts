import crypto from 'crypto';

interface LinkTrackingParams {
  contactId: number;
  campaignId: number;
  variant?: string;
}

interface SignedLinkResult {
  signedUrl: string;
  trackingParams: URLSearchParams;
}

export class LinkSigningService {
  private secretKey: string;
  
  constructor() {
    // Use a secret key for signing (should be in environment variables)
    this.secretKey = process.env.LINK_SIGNING_SECRET || 'cookaing-marketing-default-secret';
    
    if (!process.env.LINK_SIGNING_SECRET) {
      console.warn('⚠️ LINK_SIGNING_SECRET not set, using default (not secure for production)');
    }
  }

  /**
   * Sign a URL by appending tracking parameters
   */
  signUrl(originalUrl: string, params: LinkTrackingParams): SignedLinkResult {
    try {
      const url = new URL(originalUrl);
      
      // Add tracking parameters
      const trackingParams = new URLSearchParams();
      trackingParams.set('cid', params.contactId.toString());
      trackingParams.set('cmp', params.campaignId.toString());
      
      if (params.variant) {
        trackingParams.set('v', params.variant);
      }

      // Add timestamp
      trackingParams.set('t', Date.now().toString());

      // Generate signature
      const signature = this.generateSignature(trackingParams);
      trackingParams.set('sig', signature);

      // Append to original URL, preserving existing query params
      for (const [key, value] of trackingParams) {
        url.searchParams.set(key, value);
      }

      return {
        signedUrl: url.toString(),
        trackingParams
      };
    } catch (error) {
      console.error('❌ Error signing URL:', error);
      // Return original URL if signing fails
      return {
        signedUrl: originalUrl,
        trackingParams: new URLSearchParams()
      };
    }
  }

  /**
   * Verify a signed URL's authenticity
   */
  verifySignedUrl(signedUrl: string): { valid: boolean; params?: LinkTrackingParams; error?: string } {
    try {
      const url = new URL(signedUrl);
      const signature = url.searchParams.get('sig');
      
      if (!signature) {
        return { valid: false, error: 'Missing signature' };
      }

      // Extract tracking parameters
      const trackingParams = new URLSearchParams();
      const requiredParams = ['cid', 'cmp', 't'];
      
      for (const param of requiredParams) {
        const value = url.searchParams.get(param);
        if (!value) {
          return { valid: false, error: `Missing required parameter: ${param}` };
        }
        trackingParams.set(param, value);
      }

      // Include optional variant parameter
      const variant = url.searchParams.get('v');
      if (variant) {
        trackingParams.set('v', variant);
      }

      // Verify signature
      const expectedSignature = this.generateSignature(trackingParams);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Check timestamp (optional: reject links older than X hours)
      const timestamp = parseInt(url.searchParams.get('t') || '0');
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (Date.now() - timestamp > maxAge) {
        return { valid: false, error: 'Link expired' };
      }

      return {
        valid: true,
        params: {
          contactId: parseInt(url.searchParams.get('cid')!),
          campaignId: parseInt(url.searchParams.get('cmp')!),
          variant: variant || undefined
        }
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Invalid URL format' 
      };
    }
  }

  /**
   * Process HTML content and sign all URLs
   */
  signAllUrlsInHtml(htmlContent: string, params: LinkTrackingParams): string {
    // Regular expression to find URLs in href attributes
    const urlRegex = /href=["']([^"']+)["']/gi;
    
    return htmlContent.replace(urlRegex, (match, url) => {
      // Skip mailto: links, tel: links, and anchor links
      if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
        return match;
      }
      
      // Skip already signed URLs
      if (url.includes('cid=') && url.includes('cmp=')) {
        return match;
      }

      try {
        const signedResult = this.signUrl(url, params);
        return match.replace(url, signedResult.signedUrl);
      } catch (error) {
        console.warn('⚠️ Failed to sign URL:', url, error);
        return match; // Return original if signing fails
      }
    });
  }

  /**
   * Generate HMAC signature for tracking parameters
   */
  private generateSignature(params: URLSearchParams): string {
    // Sort parameters for consistent signature generation
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(([key]) => key !== 'sig') // Exclude signature itself
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return crypto
      .createHmac('sha256', this.secretKey)
      .update(sortedParams)
      .digest('hex')
      .substring(0, 16); // Use first 16 characters for shorter URLs
  }

  /**
   * Extract base URL without tracking parameters
   */
  getBaseUrl(signedUrl: string): string {
    try {
      const url = new URL(signedUrl);
      const trackingParams = ['cid', 'cmp', 'v', 't', 'sig'];
      
      trackingParams.forEach(param => {
        url.searchParams.delete(param);
      });
      
      return url.toString();
    } catch (error) {
      return signedUrl; // Return original if parsing fails
    }
  }
}

// Export singleton instance
export const linkSigningService = new LinkSigningService();