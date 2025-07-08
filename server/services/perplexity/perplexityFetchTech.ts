/**
 * Tech-specific Perplexity trend fetcher
 * Fetches trending tech products with specialized prompts
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function fetchTrendingTechProducts(): Promise<any[]> {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const prompt = `You are a product research API. Return 3 trending tech products from Amazon that are viral on TikTok or Instagram as of ${currentMonth} ${currentYear}. Respond ONLY with a JSON array and nothing else. Follow this structure exactly:

[
  { "product": "...", "brand": "...", "mentions": 1230000, "reason": "..." },
  { "product": "...", "brand": "...", "mentions": 850000, "reason": "..." },
  { "product": "...", "brand": "...", "mentions": 620000, "reason": "..." }
]

Example (do NOT copy these exact products):
[
  { "product": "AirPods Pro 2nd Generation", "brand": "Apple", "mentions": 1890000, "reason": "Audio quality upgrade viral reviews" },
  { "product": "Galaxy S24 Ultra 256GB", "brand": "Samsung", "mentions": 1450000, "reason": "AI camera features trending" },
  { "product": "Echo Dot 5th Gen Smart Speaker", "brand": "Amazon", "mentions": 980000, "reason": "Smart home automation trend" }
]

Requirements:
- Real tech products only (phones, headphones, gadgets, smart devices)
- Specific brand names (Apple, Samsung, Sony, JBL, etc.)
- Mentions: 50,000-2,000,000 range
- Brief trending reason (max 8 words)

JSON array only:`;

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

    // Validate and filter products
    const validProducts = parsedData.filter(item => {
      if (!item.product || !item.brand || typeof item.mentions !== 'number') {
        return false;
      }
      
      // Check for banned terms
      const bannedTerms = ['template', 'placeholder', 'example', 'product name', 'trending product'];
      const productLower = item.product.toLowerCase();
      
      if (bannedTerms.some(term => productLower.includes(term))) {
        return false;
      }
      
      // Must have at least 2 words
      const words = item.product.split(' ').filter(w => w.length > 0);
      return words.length >= 2;
    });

    console.log(`✅ Tech fetcher: Found ${validProducts.length} valid products`);
    return validProducts;

  } catch (error) {
    console.error('❌ Tech fetcher error:', error);
    throw error;
  }
}