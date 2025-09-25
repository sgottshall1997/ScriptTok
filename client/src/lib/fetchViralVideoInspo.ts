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

// Enhanced viral research interfaces
interface ViralVideoExample {
  title: string;
  hook: string;
  format: string;
  style: string;
  hashtags: string[];
  engagementMetrics: {
    views: string;
    likes: string;
    comments: string;
    shares: string;
  };
  contentStructure: {
    opening: string;
    demonstration: string;
    callToAction: string;
  };
  confidence: number;
}

interface ViralResearchResult {
  product: string;
  niche: string;
  totalExamplesFound: number;
  viralExamples: ViralVideoExample[];
  commonPatterns: {
    topHooks: string[];
    popularFormats: string[];
    engagementDrivers: string[];
    successfulHashtags: string[];
  };
  templateRecommendations: {
    bestHookTemplate: string;
    recommendedFormat: string;
    suggestedStructure: string;
    confidenceScore: number;
  };
  searchMetadata: {
    searchQuery: string;
    timestamp: string;
    source: string;
  };
}

interface EnhancedViralResponse {
  success: boolean;
  data?: {
    research: ViralResearchResult;
    template: any;
    cacheStats: any;
    metadata: any;
  };
  error?: string;
  code?: string;
}

/**
 * Fetch real viral video inspiration using Perplexity API (legacy function)
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

/**
 * Enhanced TikTok viral content research - comprehensive analysis
 * Uses the new viral research service for detailed viral content analysis
 */
export async function fetchEnhancedViralResearch(
  productName: string,
  niche: string
): Promise<ViralResearchResult | null> {
  try {
    console.log(`🎯 Fetching enhanced viral research for "${productName}" in ${niche} niche...`);
    
    const response = await fetch('/api/perplexity-trends/viral-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: productName,
        niche: niche,
        includeTemplate: true
      })
    });

    if (!response.ok) {
      console.error('Enhanced viral research failed:', response.status, response.statusText);
      return null;
    }

    const data: EnhancedViralResponse = await response.json();
    console.log('📊 Enhanced viral research response:', data);
    
    if (data.success && data.data?.research) {
      console.log('✅ Successfully fetched enhanced viral research:', data.data.research);
      return data.data.research;
    } else {
      console.warn('⚠️ No enhanced viral research found:', data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching enhanced viral research:', error);
    return null;
  }
}

/**
 * Get viral template data only (lighter request)
 */
export async function fetchViralTemplate(
  productName: string,
  niche: string
): Promise<any | null> {
  try {
    console.log(`🎨 Fetching viral template for "${productName}" in ${niche} niche...`);
    
    const response = await fetch('/api/perplexity-trends/viral-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: productName,
        niche: niche
      })
    });

    if (!response.ok) {
      console.error('Viral template request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('📊 Viral template response:', data);
    
    if (data.success && data.template) {
      console.log('✅ Successfully fetched viral template:', data.template);
      return data.template;
    } else {
      console.warn('⚠️ No viral template found:', data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching viral template:', error);
    return null;
  }
}

/**
 * Get viral research status and cache statistics
 */
export async function getViralResearchStatus(): Promise<any | null> {
  try {
    const response = await fetch('/api/perplexity-trends/viral-status');

    if (!response.ok) {
      console.error('Viral research status request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.success ? data.status : null;
  } catch (error) {
    console.error('❌ Error fetching viral research status:', error);
    return null;
  }
}

/**
 * Auto-select the best viral research method based on requirements
 * Returns enhanced research if available, falls back to legacy inspiration
 */
export async function fetchOptimalViralResearch(
  productName: string,
  niche: string,
  preferEnhanced: boolean = true
): Promise<{
  type: 'enhanced' | 'legacy';
  data: ViralResearchResult | ViralVideoInspo | null;
}> {
  if (preferEnhanced) {
    // Try enhanced research first
    const enhancedData = await fetchEnhancedViralResearch(productName, niche);
    if (enhancedData) {
      return { type: 'enhanced', data: enhancedData };
    }
    
    console.log('🔄 Enhanced research unavailable, falling back to legacy inspiration...');
  }
  
  // Fall back to legacy inspiration
  const legacyData = await fetchViralVideoInspo(productName, niche);
  return { type: 'legacy', data: legacyData };
}

// Export types for use in other components
export type { 
  ViralVideoInspo, 
  ViralVideoExample, 
  ViralResearchResult, 
  EnhancedViralResponse 
};