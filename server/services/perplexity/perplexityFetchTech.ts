/**
 * Tech-specific Perplexity trend fetcher
 * Fetches trending tech products with specialized prompts
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
    'trending product', 'tech item', 'product name', 'brand name',
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
  const genericBrandTerms = ['brand', 'company', 'tech', 'technology', 'electronics'];
  if (genericBrandTerms.some(term => brandLower === term)) return false;
  
  return true;
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function fetchTrendingTechProducts(): Promise<any[]> {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const prompt = `You are a tech product research API. Return 3 trending tech products from Amazon that are viral on TikTok or Instagram as of ${currentMonth} ${currentYear}.

You MUST include a unique and specific reason why each product is trending. Avoid generic phrases like 'trending product', 'popular item', or 'viral'. The reason should reflect current trends, influencer mentions, seasonal hype, or specific use cases.

EXACT FORMAT - Return only this JSON structure:
[
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Specific trending reason" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Specific trending reason" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Specific trending reason" }
]

FEW-SHOT EXAMPLES (do NOT copy these exactly):
[
  { "product": "AirPods Pro 2nd Generation", "brand": "Apple", "mentions": 35000, "reason": "Noise cancellation upgrade in tech reviews" },
  { "product": "Echo Dot 5th Gen Smart Speaker", "brand": "Amazon", "mentions": 22000, "reason": "Voice control smart home automation setups" },
  { "product": "Galaxy S24 Ultra 256GB", "brand": "Samsung", "mentions": 41000, "reason": "AI camera features showcased by creators" }
]

STRICT REQUIREMENTS:
- Real Amazon tech products only (headphones, phones, gadgets, smart devices, gaming gear)
- Established brands: Apple, Samsung, Sony, JBL, Anker, Nintendo, PlayStation, etc.
- Mentions: 5,000-50,000 range
- Each reason must be unique, specific, and 4-12 words explaining WHY it's trending
- NO generic terms like "trending product", "tech item", "popular", "viral"
- NO template headers like "Name | Brand" or "Product | Brand"
- Product names must include specific details (model, generation, storage, size)

Respond ONLY with a valid JSON array of 3 products. No markdown, headers, or explanation.`;

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
            content: 'You are a product trend research engine. Only respond with valid JSON containing real, purchasable tech products. No placeholders or generic terms. No templates. Reject vague outputs.'
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
    
    console.log(`✅ Tech fetcher: Parsed ${parsedData.length} items, ${validProducts.length} valid products`);
    
    // If we don't have enough valid products, throw error to trigger retry
    if (validProducts.length < 3) {
      throw new Error(`Only ${validProducts.length} valid tech products found, need 3`);
    }
    
    return validProducts.slice(0, 3);

  } catch (error) {
    console.error('❌ Tech fetcher error:', error);
    throw error;
  }
}