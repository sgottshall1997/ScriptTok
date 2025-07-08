interface ViralVideoInspo {
  hook: string;
  format: string;
  caption: string;
  hashtags: string[];
}

interface PerplexityResponse {
  success: boolean;
  inspiration?: ViralVideoInspo;
  error?: string;
}

/**
 * Fetch real viral video inspiration using Perplexity API
 * Searches for actual TikTok/Instagram videos that went viral for similar products
 */
export async function fetchViralVideoInspo(
  productName: string, 
  niche: string
): Promise<ViralVideoInspo | null> {
  try {
    console.log(`🔍 Fetching viral inspiration for "${productName}" in ${niche} niche...`);
    
    const response = await fetch('/api/perplexity-trends/viral-inspiration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: productName,
        niche: niche
      })
    });

    if (!response.ok) {
      console.error('Perplexity API request failed:', response.status, response.statusText);
      return null;
    }

    const data: PerplexityResponse = await response.json();
    console.log('📊 Perplexity viral inspiration response:', data);
    
    if (data.success && data.inspiration) {
      console.log('✅ Successfully fetched viral inspiration:', data.inspiration);
      return data.inspiration;
    } else {
      console.warn('⚠️ No viral inspiration found:', data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching viral inspiration:', error);
    return null;
  }
}