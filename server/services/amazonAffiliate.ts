import axios from 'axios';
import crypto from 'crypto';

interface AmazonProduct {
  ASIN: string;
  DetailPageURL: string;
  ItemInfo?: {
    Title?: {
      DisplayValue: string;
    };
  };
}

interface AmazonSearchResponse {
  SearchResult?: {
    Items: AmazonProduct[];
  };
}

// Generate Amazon Product Advertising API v5 signature
function generateSignature(
  method: string,
  host: string,
  uri: string,
  queryString: string,
  headers: Record<string, string>,
  payload: string,
  secretKey: string
): string {
  const canonicalRequest = [
    method,
    uri,
    queryString,
    Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}`)
      .join('\n') + '\n',
    Object.keys(headers).sort().map(key => key.toLowerCase()).join(';'),
    crypto.createHash('sha256').update(payload).digest('hex')
  ].join('\n');

  const timestamp = headers['X-Amz-Date'];
  const date = timestamp.substr(0, 8);
  const region = 'us-east-1';
  const service = 'ProductAdvertisingAPI';

  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    timestamp,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');

  const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(date).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  
  return crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

/**
 * Get Amazon affiliate link for a product using Amazon Product Advertising API v5
 * @param productName - The product name to search for
 * @returns The affiliate link URL or empty string if not found
 */
export async function getAmazonAffiliateLink(productName: string): Promise<string> {
  try {
    // Check for required environment variables
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const partnerTag = process.env.AMAZON_PARTNER_TAG;
    const marketplace = process.env.AMAZON_MARKETPLACE || 'www.amazon.com';

    if (!accessKey || !secretKey || !partnerTag) {
      console.log('⚠️ Missing Amazon API credentials. Please add AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_PARTNER_TAG to environment variables.');
      return '';
    }

    // Clean product name for search
    const cleanProductName = productName
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .trim()
      .substring(0, 50); // Limit length

    console.log(`🔍 Searching Amazon for: "${cleanProductName}"`);

    // Prepare API request
    const host = 'webservices.amazon.com';
    const uri = '/paapi5/searchitems';
    const method = 'POST';
    const service = 'ProductAdvertisingAPI';
    const region = 'us-east-1';

    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    
    const payload = JSON.stringify({
      Keywords: cleanProductName,
      Resources: [
        'ItemInfo.Title',
        'Offers.Listings.Price'
      ],
      PartnerTag: partnerTag,
      PartnerType: 'Associates',
      Marketplace: marketplace,
      ItemCount: 1
    });

    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'X-Amz-Date': timestamp,
      'Authorization': '',
      'Host': host
    };

    // Generate signature
    const signature = generateSignature(method, host, uri, '', headers, payload, secretKey);
    
    headers.Authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${timestamp.substr(0, 8)}/${region}/${service}/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=${signature}`;

    // Make API request
    const response = await axios.post(`https://${host}${uri}`, payload, {
      headers,
      timeout: 10000
    });

    const data: AmazonSearchResponse = response.data;
    
    if (data.SearchResult?.Items && data.SearchResult.Items.length > 0) {
      const product = data.SearchResult.Items[0];
      const affiliateLink = product.DetailPageURL;
      
      console.log(`✅ Found Amazon product: ${product.ItemInfo?.Title?.DisplayValue || 'Unknown'}`);
      console.log(`🔗 Affiliate link: ${affiliateLink}`);
      
      return affiliateLink;
    } else {
      console.log(`❌ No Amazon products found for: "${cleanProductName}"`);
      return '';
    }

  } catch (error: any) {
    console.error('❌ Amazon API error:', error.response?.data || error.message);
    return '';
  }
}