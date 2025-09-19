import crypto from 'crypto';
import { requireEnv } from '../env';

/**
 * AWS Signature Version 4 signing for Amazon PA-API
 * Implements the standard AWS4 signing process for authenticated requests
 */

interface SigningOptions {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  service?: string;
  region?: string;
}

interface SignedRequest {
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export class AmazonAPIAuth {
  private accessKey: string;
  private secretKey: string;
  private region: string;
  private service: string;

  constructor() {
    this.accessKey = requireEnv('AMAZON_ACCESS_KEY', 'Amazon PA-API');
    this.secretKey = requireEnv('AMAZON_SECRET_KEY', 'Amazon PA-API');
    this.region = requireEnv('AMAZON_REGION', 'Amazon PA-API') || 'us-east-1';
    this.service = 'ProductAdvertisingAPI';
  }

  /**
   * Sign a request using AWS Signature Version 4
   */
  signRequest(options: SigningOptions): SignedRequest {
    const { method, url, headers, body = '' } = options;
    const urlParts = new URL(url);
    
    // Step 1: Create canonical request
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = timestamp.substr(0, 8);
    
    // Required headers
    const allHeaders = {
      ...headers,
      'host': urlParts.host,
      'x-amz-date': timestamp,
      'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'content-type': 'application/json; charset=utf-8'
    };
    
    // Sort headers and create canonical headers string
    const sortedHeaders = Object.keys(allHeaders).sort();
    const canonicalHeaders = sortedHeaders
      .map(key => `${key.toLowerCase()}:${allHeaders[key].trim()}`)
      .join('\n') + '\n';
    
    const signedHeaders = sortedHeaders.map(key => key.toLowerCase()).join(';');
    
    // Create canonical request
    const canonicalQueryString = urlParts.search.slice(1); // Remove '?' 
    const payloadHash = this.sha256(body);
    
    const canonicalRequest = [
      method,
      urlParts.pathname,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
    
    // Step 2: Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      this.sha256(canonicalRequest)
    ].join('\n');
    
    // Step 3: Calculate signature
    const signature = this.calculateSignature(stringToSign, dateStamp);
    
    // Step 4: Add authorization header
    const authorizationHeader = [
      `${algorithm} Credential=${this.accessKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`
    ].join(', ');
    
    const finalHeaders = {
      ...allHeaders,
      'Authorization': authorizationHeader
    };
    
    return {
      url,
      headers: finalHeaders,
      body
    };
  }

  private sha256(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  private hmac(key: Buffer | string, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
  }

  private calculateSignature(stringToSign: string, dateStamp: string): string {
    const kDate = this.hmac('AWS4' + this.secretKey, dateStamp);
    const kRegion = this.hmac(kDate, this.region);
    const kService = this.hmac(kRegion, this.service);
    const kSigning = this.hmac(kService, 'aws4_request');
    
    return this.hmac(kSigning, stringToSign).toString('hex');
  }
}

// Singleton instance
let authInstance: AmazonAPIAuth | null = null;

export function getAmazonAuth(): AmazonAPIAuth {
  if (!authInstance) {
    authInstance = new AmazonAPIAuth();
  }
  return authInstance;
}