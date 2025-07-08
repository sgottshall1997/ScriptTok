/**
 * Beauty and Personal Care-specific Perplexity trend fetcher
 * Fetches trending beauty and personal care products with specialized prompts
 */

// Enhanced validation function
function isValidProduct(item: any): boolean {
  // Basic type and existence checks
  if (typeof item.product !== 'string' || item.product.length <= 4) return false;
  if (typeof item.brand !== 'string' || item.brand.length <= 2) return false;
  if (typeof item.mentions !== 'number' || item.mentions < 50000 || item.mentions > 2000000) return false;
  if (typeof item.reason !== 'string' || item.reason.length <= 2) return false;

  const productLower = item.product.toLowerCase();
  const brandLower = item.brand.toLowerCase();

  // Hard filters against invalid entries
  const bannedTerms = [
    'trending product', 'beauty item', 'skincare item', 'product name', 'brand name',
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
  const genericBrandTerms = ['brand', 'company', 'skincare', 'beauty', 'cosmetics', 'personal care'];
  if (genericBrandTerms.some(term => brandLower === term)) return false;
  
  return true;
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function fetchTrendingBeautyProducts(): Promise<any[]> {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const prompt = `You are a product research API. Return 3 trending beauty and personal care products from Amazon that are viral on TikTok or Instagram as of ${currentMonth} ${currentYear}.

EXACT FORMAT - Return only this JSON structure:
[
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Brief reason" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Brief reason" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Brief reason" }
]

REQUIREMENTS:
- Real products only: makeup, skincare, haircare, grooming, personal care items
- Specific brand names: The Ordinary, Fenty Beauty, OUAI, Native, CeraVe, Glossier, etc.
- Mentions: 50,000–2,000,000 range
- Unique trending reason (max 8 words) for each product
- Product names must include specific details (size, shade, type)

EXAMPLES (do NOT copy these):
[
  { "product": "Glossy Lip Balm in Cherry", "brand": "Glossier", "mentions": 890000, "reason": "Clean girl makeup trend" },
  { "product": "Hair Treatment Masque 8oz", "brand": "OUAI", "mentions": 650000, "reason": "Viral hair repair routine" }
]

STRICT REQUIREMENTS:
- NO generic terms like "trending product", "beauty item"
- NO template headers like "Name | Brand"
- Include diverse categories: skincare, makeup, haircare, grooming
- Real Amazon beauty and personal care products only

Return ONLY the JSON array:`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a product trend research engine. Only respond with valid JSON containing real, purchasable beauty and personal care products. No placeholders or generic terms. No templates. Include makeup, skincare, haircare, and grooming products.'
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
    
    console.log(`✅ Beauty fetcher: Parsed ${parsedData.length} items, ${validProducts.length} valid products`);
    
    // If we don't have enough valid products, throw error to trigger retry
    if (validProducts.length < 3) {
      throw new Error(`Only ${validProducts.length} valid beauty and personal care products found, need 3`);
    }
    
    return validProducts.slice(0, 3);



  } catch (error) {
    console.error('❌ Beauty fetcher error:', error);
    throw error;
  }
}