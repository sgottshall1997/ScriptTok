/**
 * Fitness-specific Perplexity trend fetcher
 * Fetches trending fitness products with specialized prompts
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
    'trending product', 'fitness item', 'product name', 'brand name',
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
  const genericBrandTerms = ['brand', 'company', 'fitness', 'workout', 'exercise'];
  if (genericBrandTerms.some(term => brandLower === term)) return false;
  
  return true;
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function fetchTrendingFitnessProducts(): Promise<any[]> {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const prompt = `Only return 3 REAL, purchasable fitness products from Amazon with brand names. No placeholders, templates, or format rows. Output must be a valid JSON array.

EXACT FORMAT - Return only this JSON structure:
[
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Brief reason" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Brief reason" },
  { "product": "Product Name", "brand": "Brand Name", "mentions": 123456, "reason": "Brief reason" }
]

IMPORTANT: Include a brief, unique reason (max 8 words) why each product is trending. Must be different for each product.

EXAMPLES (do NOT copy these):
[
  { "product": "Resistance Band Set with Door Anchor", "brand": "Bodylastics", "mentions": 1280000, "reason": "Home gym convenience trend" },
  { "product": "Yoga Mat Extra Thick 6mm", "brand": "Gaiam", "mentions": 890000, "reason": "Comfort workout viral videos" }
]

STRICT REQUIREMENTS:
- Real Amazon fitness products only (equipment, supplements, apparel, accessories)
- Established brands: Nike, Adidas, Gaiam, Bodylastics, Under Armour, etc.
- Mentions: 50,000-2,000,000 range
- NO generic terms like "trending product", "fitness item"
- NO template headers like "Name | Brand"
- Product names must be specific with details (weight, size, material)

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
            content: 'You are a product trend research engine. Only respond with valid JSON containing real, purchasable fitness products. No placeholders or generic terms. No templates. Reject vague outputs.'
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
    
    console.log(`✅ Fitness fetcher: Parsed ${parsedData.length} items, ${validProducts.length} valid products`);
    
    // If we don't have enough valid products, throw error to trigger retry
    if (validProducts.length < 3) {
      throw new Error(`Only ${validProducts.length} valid fitness products found, need 3`);
    }
    
    return validProducts.slice(0, 3);

  } catch (error) {
    console.error('❌ Fitness fetcher error:', error);
    throw error;
  }
}