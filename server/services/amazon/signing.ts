import crypto from 'crypto';
import aws4 from 'aws4';

// Amazon PA-API signing utilities using AWS Signature Version 4

interface SigningConfig {
  accessKey: string;
  secretKey: string;
  region: string;
  service: string;
  host: string;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  path: string;
  headers?: Record<string, string>;
  body?: string;
}

interface SignedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Creates AWS V4 signature for Amazon PA-API requests
 */
export class AmazonSigner {
  private config: SigningConfig;

  constructor(config: SigningConfig) {
    this.config = config;
  }

  /**
   * Signs a request for Amazon PA-API using AWS V4 signature
   */
  public signRequest(options: RequestOptions): SignedRequest {
    const { method, path, headers = {}, body } = options;
    
    // Prepare the request object for aws4 signing
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Amz-Target': this.getTargetHeader(path),
      ...headers
    };

    // Add body hash for POST requests
    if (body) {
      requestHeaders['X-Amz-Content-Sha256'] = this.sha256Hash(body);
    }

    const requestToSign = {
      method,
      path,
      host: this.config.host,
      service: this.config.service,
      region: this.config.region,
      headers: requestHeaders,
      body
    };

    // Sign the request using aws4
    const signed = aws4.sign(requestToSign, {
      accessKeyId: this.config.accessKey,
      secretAccessKey: this.config.secretKey
    });

    return {
      method: signed.method || method,
      url: `https://${signed.host}${signed.path}`,
      headers: (signed.headers || {}) as Record<string, string>,
      body: signed.body ? String(signed.body) : body
    };
  }

  /**
   * Creates Amazon PA-API specific target header based on operation
   */
  private getTargetHeader(path: string): string {
    // Map API paths to PA-API targets
    if (path.includes('SearchItems')) {
      return 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
    }
    if (path.includes('GetItems')) {
      return 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';
    }
    if (path.includes('GetBrowseNodes')) {
      return 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetBrowseNodes';
    }
    if (path.includes('GetVariations')) {
      return 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetVariations';
    }
    
    // Default to SearchItems for unknown operations
    return 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';
  }

  /**
   * Creates SHA256 hash for request body
   */
  private sha256Hash(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  /**
   * Creates canonical query string from parameters
   */
  private createCanonicalQueryString(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
  }

  /**
   * Helper to create ISO 8601 timestamp for AWS requests
   */
  public static createTimestamp(): string {
    return new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  }

  /**
   * Helper to create date string for AWS requests
   */
  public static createDateStamp(): string {
    return new Date().toISOString().substring(0, 10).replace(/-/g, '');
  }

  /**
   * Validates signing configuration
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.accessKey) {
      errors.push('Amazon Access Key is required');
    }
    if (!this.config.secretKey) {
      errors.push('Amazon Secret Key is required');
    }
    if (!this.config.region) {
      errors.push('Amazon region is required');
    }
    if (!this.config.service) {
      errors.push('Amazon service name is required');
    }
    if (!this.config.host) {
      errors.push('Amazon API host is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Factory function to create pre-configured Amazon signer
 */
export function createAmazonSigner(credentials: {
  accessKey: string;
  secretKey: string;
  region?: string;
  host?: string;
}): AmazonSigner {
  return new AmazonSigner({
    accessKey: credentials.accessKey,
    secretKey: credentials.secretKey,
    region: credentials.region || 'us-east-1',
    service: 'ProductAdvertisingAPI',
    host: credentials.host || 'webservices.amazon.com'
  });
}

// Error types for signing failures
export class SigningError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SigningError';
  }
}

// Utility to test signing configuration
export async function testSigningConfig(signer: AmazonSigner): Promise<boolean> {
  try {
    const validation = signer.validateConfig();
    if (!validation.isValid) {
      console.error('Signing config validation failed:', validation.errors);
      return false;
    }

    // Test signing a simple request
    const testRequest = signer.signRequest({
      method: 'POST',
      path: '/paapi5/searchitems',
      body: JSON.stringify({ test: 'validation' })
    });

    // Check if required headers are present
    const requiredHeaders = ['Authorization', 'X-Amz-Date', 'X-Amz-Target'];
    const hasAllHeaders = requiredHeaders.every(header => 
      testRequest.headers[header] !== undefined
    );

    return hasAllHeaders;
  } catch (error) {
    console.error('Signing test failed:', error);
    return false;
  }
}

export type { SigningConfig, RequestOptions, SignedRequest };