/**
 * Fashion-specific Perplexity trend fetcher
 * Fetches trending fashion products with specialized prompts
 */

// Enhanced validation function
function isValidProduct(item: any): boolean {
  // Basic type and existence checks
  if (typeof item.product !== 'string' || item.product.length <= 4) return false;
  if (typeof item.brand !== 'string' || item.brand.length <= 2) return false;
  if (typeof item.mentions !== 'number' || item.mentions < 5000 || item.mentions > 50000) return false;
  if (typeof item.reason !== 'string' || item.reason.length <= 2) return false;

  const productLower = item.product.toLowerCase();
  const brandLower = item.brand.toLowerCase();

  // Hard filters against invalid entries
  const bannedTerms = [
    'trending product', 'fashion item', 'product name', 'brand name',
    'template', 'placeholder', 'example', 'format', '...', 'item'
  ];
  
  if (bannedTerms.some(term => productLower.includes(term))) return false;
  if (bannedTerms.some(term => brandLower.includes(term))) return false;
  
  // Regex patterns for template headers
  if (/^name\s*\|\s*brand/i.test(item.product)) return false;
  if (/\|\s*(social\s*mentions|why\s*tre|mentions)/i.test(item.product)) return false;
  
  // Must have at least 2 words in product name
  const words = item.product.split(' ').filter(w => w.length > 0);
  if (words.length < 2) return false;
  
  // Brand validation - must be real brand-like (not generic terms)
  const genericBrandTerms = ['brand', 'company', 'fashion', 'clothing', 'apparel'];
  if (genericBrandTerms.some(term => brandLower === term)) return false;
  
  return true;
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function fetchTrendingFashionProducts(): Promise<any[]> {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const prompt = `You are a fashion product research API. Return 3 trending fashion products from Amazon that are viral on TikTok or Instagram as of ${currentMonth} ${currentYear}.

You MUST include a unique and specific reason why each product is trending. Avoid generic phrases like 'trending product', 'popular item', or 'viral'. The reason should reflect current trends, influencer mentions, seasonal hype, or specific use cases.

EXACT FORMAT - Return only this JSON structure:
[
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Specific trending reason", "price": "$12.99", "asin": "B01ABC123" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Specific trending reason", "price": "$25.50", "asin": "B01DEF456" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Specific trending reason", "price": "$18.00", "asin": "B01GHI789" }
]

FEW-SHOT EXAMPLES (do NOT copy these exactly):
[
  { "product": "High Waisted Wide Leg Jeans Light Wash", "brand": "Levi's", "mentions": 34000, "reason": "Y2K denim revival with fashion influencers", "price": "$68.00", "asin": "B07XYZABC1" },
  { "product": "Oversized Blazer Women's Medium Black", "brand": "The Drop", "mentions": 19000, "reason": "Office siren aesthetic trending on TikTok", "price": "$45.90", "asin": "B08DEFGHI2" },
  { "product": "Chunky Gold Chain Necklace 18 inch", "brand": "Mejuri", "mentions": 26000, "reason": "Layered jewelry trend with content creators", "price": "$98.00", "asin": "B09JKLMNO3" }
]

STRICT REQUIREMENTS:
- Real Amazon fashion products only (clothing, accessories, jewelry, shoes, handbags)
- Established brands: Levi's, Nike, Adidas, The Drop, Amazon Essentials, Mejuri, etc.
- Mentions: 5,000-50,000 range
- Each reason must be unique, specific, and 4-12 words explaining WHY it's trending
- Price: Must include real Amazon price in format "$12.99" (use current Amazon pricing)
- ASIN: Must include real Amazon ASIN code (10-character alphanumeric like "B01ABC123D")
- NO generic terms like "trending product", "fashion item", "popular", "viral"
- NO template headers like "Name | Brand" or "Product | Brand"
- Product names must include specific details (size, color, style, material)

Respond ONLY with a valid JSON array of 3 products. No markdown, headers, or explanation.`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a product trend research engine. Only respond with valid JSON containing real, purchasable fashion products. No placeholders or generic terms. No templates. Reject vague outputs.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.04,
        top_p: 0.8,
        search_domain_filter: ["amazon.com", "tiktok.com", "instagram.com"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'week',
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Parse and validate JSON response
    let cleanContent = content.trim();
    
    // Remove any non-JSON text before/after the array
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    const parsedData = JSON.parse(cleanContent);
    
    if (!Array.isArray(parsedData)) {
      throw new Error('Response is not a JSON array');
    }

    // Enhanced validation and filtering
    const validProducts = parsedData.filter(item => {
      return isValidProduct(item);
    });
    
    console.log(`✅ Fashion fetcher: Parsed ${parsedData.length} items, ${validProducts.length} valid products`);
    
    // If we don't have enough valid products, throw error to trigger retry
    if (validProducts.length < 3) {
      throw new Error(`Only ${validProducts.length} valid fashion products found, need 3`);
    }
    
    return validProducts.slice(0, 3);

  } catch (error) {
    console.error('❌ Fashion fetcher error:', error);
    throw error;
  }
}