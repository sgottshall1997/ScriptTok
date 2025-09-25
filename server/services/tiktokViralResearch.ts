/**
 * TikTok Viral Content Research Service
 * Comprehensive viral content analysis system that bridges product discovery and content creation
 */

export interface ViralVideoExample {
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
  confidence: number; // 0-100 score for how viral/successful this example is
}

export interface ViralResearchResult {
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

export interface CachedViralData {
  [key: string]: {
    data: ViralResearchResult;
    timestamp: number;
    expiresAt: number;
  };
}

// In-memory cache for viral research results (24-hour expiry)
export const viralDataCache: CachedViralData = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate cache key for viral research data
 */
function generateCacheKey(product: string, niche: string): string {
  return `viral_${product.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${niche.toLowerCase()}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(cacheKey: string): boolean {
  const cached = viralDataCache[cacheKey];
  return cached && Date.now() < cached.expiresAt;
}

/**
 * Get cached viral research data
 */
function getCachedData(cacheKey: string): ViralResearchResult | null {
  if (isCacheValid(cacheKey)) {
    console.log(`📋 Using cached viral data for: ${cacheKey}`);
    return viralDataCache[cacheKey].data;
  }
  return null;
}

/**
 * Cache viral research data
 */
function cacheData(cacheKey: string, data: ViralResearchResult): void {
  viralDataCache[cacheKey] = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_DURATION
  };
  console.log(`💾 Cached viral data for: ${cacheKey}`);
}

/**
 * Main function to research viral TikTok content for a specific product
 */
export async function researchTikTokViralContent(
  productName: string,
  niche: string
): Promise<ViralResearchResult | null> {
  const cacheKey = generateCacheKey(productName, niche);
  
  // Check cache first
  const cachedResult = getCachedData(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  console.log(`🎯 Starting TikTok viral research for "${productName}" in ${niche} niche`);

  try {
    // Enhanced Perplexity prompt for comprehensive viral analysis
    const searchQuery = `viral TikTok videos about ${productName} ${niche} products with high engagement`;
    const prompt = `Analyze viral TikTok videos for products like "${productName}" in the ${niche} niche. Find 3 real viral examples with engagement data.

For each viral video, extract and analyze:

1. CONTENT STRUCTURE:
   - Hook (exact opening words/phrase)
   - Format type (demo, unboxing, review, before/after, storytelling, etc.)
   - Style elements (lighting, music type, pacing, visual effects)
   - Content flow (how video progresses from hook to CTA)

2. ENGAGEMENT PATTERNS:
   - View count, likes, comments, shares (approximate numbers)
   - What made it viral (timing, trending audio, unique angle, etc.)
   - Audience engagement triggers (emotional hooks, social proof, etc.)

3. HASHTAG ANALYSIS:
   - Popular hashtags used
   - Niche-specific tags that drove discovery
   - Trending tags that boosted reach

Return ONLY valid JSON in this exact format:
{
  "viralExamples": [
    {
      "title": "Brief description of the video",
      "hook": "Exact opening words/phrase",
      "format": "Video format type",
      "style": "Visual and audio style description",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "engagementMetrics": {
        "views": "1.2M",
        "likes": "180K", 
        "comments": "12K",
        "shares": "8K"
      },
      "contentStructure": {
        "opening": "How video opens",
        "demonstration": "Main content/demo section",
        "callToAction": "How video ends/CTA"
      },
      "confidence": 85
    }
  ],
  "commonPatterns": {
    "topHooks": ["Pattern 1", "Pattern 2", "Pattern 3"],
    "popularFormats": ["Format 1", "Format 2"],
    "engagementDrivers": ["Driver 1", "Driver 2"],
    "successfulHashtags": ["#tag1", "#tag2", "#tag3"]
  },
  "templateRecommendations": {
    "bestHookTemplate": "Template based on successful hooks",
    "recommendedFormat": "Best performing format type",
    "suggestedStructure": "Recommended video structure",
    "confidenceScore": 78
  }
}

Focus on real, recent viral content with verified engagement metrics. No placeholders or generic examples.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: 'You are a viral content analyst specializing in TikTok engagement patterns and viral video structures. Analyze real viral content and provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        search_domain_filter: ['tiktok.com', 'instagram.com'],
        search_recency_filter: 'month',
        return_images: false,
        return_related_questions: false
      })
    });

    if (!perplexityResponse.ok) {
      console.error('Perplexity API error:', perplexityResponse.status, perplexityResponse.statusText);
      return await fallbackViralResearch(productName, niche);
    }

    const perplexityData = await perplexityResponse.json();
    console.log('📊 Raw Perplexity viral research response:', perplexityData);

    if (!perplexityData.choices?.[0]?.message?.content) {
      console.warn('⚠️ No content in Perplexity viral research response');
      return await fallbackViralResearch(productName, niche);
    }

    try {
      const analysisData = JSON.parse(perplexityData.choices[0].message.content);
      
      // Validate the response structure
      if (!analysisData.viralExamples || !analysisData.commonPatterns || !analysisData.templateRecommendations) {
        throw new Error('Invalid viral research response structure');
      }

      // Construct the complete result
      const result: ViralResearchResult = {
        product: productName,
        niche: niche,
        totalExamplesFound: analysisData.viralExamples.length,
        viralExamples: analysisData.viralExamples,
        commonPatterns: analysisData.commonPatterns,
        templateRecommendations: analysisData.templateRecommendations,
        searchMetadata: {
          searchQuery,
          timestamp: new Date().toISOString(),
          source: 'perplexity_viral_analysis'
        }
      };

      console.log('✅ Successfully analyzed viral content:', result);

      // Cache the result
      cacheData(cacheKey, result);

      return result;

    } catch (parseError) {
      console.error('❌ Failed to parse Perplexity viral research JSON:', parseError);
      console.log('Raw content:', perplexityData.choices[0].message.content);
      
      return await fallbackViralResearch(productName, niche);
    }

  } catch (error) {
    console.error('❌ Error in TikTok viral research:', error);
    return await fallbackViralResearch(productName, niche);
  }
}

/**
 * Fallback viral research with generic patterns
 */
async function fallbackViralResearch(productName: string, niche: string): Promise<ViralResearchResult | null> {
  try {
    console.log('🔄 Attempting fallback viral research...');
    
    const fallbackPrompt = `Analyze common viral patterns for ${niche} products like "${productName}" on TikTok. 

Return JSON format for typical viral video structures:
{
  "viralExamples": [
    {
      "title": "Common ${niche} product demo pattern",
      "hook": "Typical opening for ${niche} content",
      "format": "Standard format for ${niche} videos",
      "style": "Popular style in ${niche} niche",
      "hashtags": ["#${niche}", "#viral", "#fyp"],
      "engagementMetrics": {
        "views": "500K+",
        "likes": "50K+",
        "comments": "5K+",
        "shares": "2K+"
      },
      "contentStructure": {
        "opening": "Hook structure",
        "demonstration": "Demo/review section",
        "callToAction": "Typical CTA"
      },
      "confidence": 60
    }
  ],
  "commonPatterns": {
    "topHooks": ["Common hook 1", "Common hook 2"],
    "popularFormats": ["Demo", "Review"],
    "engagementDrivers": ["Visual appeal", "Social proof"],
    "successfulHashtags": ["#${niche}", "#fyp", "#viral"]
  },
  "templateRecommendations": {
    "bestHookTemplate": "Generic ${niche} hook template",
    "recommendedFormat": "Demo/review format",
    "suggestedStructure": "Hook -> Demo -> CTA",
    "confidenceScore": 45
  }
}`;

    const fallbackResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: fallbackPrompt }],
        temperature: 0.2,
        search_recency_filter: 'month'
      })
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      const analysisData = JSON.parse(fallbackData.choices[0].message.content);
      
      const result: ViralResearchResult = {
        product: productName,
        niche: niche,
        totalExamplesFound: analysisData.viralExamples.length,
        viralExamples: analysisData.viralExamples,
        commonPatterns: analysisData.commonPatterns,
        templateRecommendations: analysisData.templateRecommendations,
        searchMetadata: {
          searchQuery: `fallback patterns for ${niche} ${productName}`,
          timestamp: new Date().toISOString(),
          source: 'perplexity_fallback'
        }
      };

      // Cache the fallback result with shorter expiry
      const cacheKey = generateCacheKey(productName, niche);
      viralDataCache[cacheKey] = {
        data: result,
        timestamp: Date.now(),
        expiresAt: Date.now() + (CACHE_DURATION / 4) // 6 hours for fallback data
      };

      return result;
    }
  } catch (fallbackError) {
    console.error('❌ Fallback viral research also failed:', fallbackError);
  }

  return null;
}

/**
 * Extract viral template data for content generation
 */
export function extractViralTemplate(viralResearch: ViralResearchResult): any {
  if (!viralResearch || viralResearch.viralExamples.length === 0) {
    return null;
  }

  // Find the highest confidence viral example
  const bestExample = viralResearch.viralExamples.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );

  return {
    viralHook: bestExample.hook,
    viralFormat: bestExample.format,
    viralStyle: bestExample.style,
    viralStructure: bestExample.contentStructure,
    recommendedHashtags: viralResearch.commonPatterns.successfulHashtags,
    templateConfidence: viralResearch.templateRecommendations.confidenceScore,
    engagementPatterns: viralResearch.commonPatterns.engagementDrivers,
    bestPractices: {
      hookTemplate: viralResearch.templateRecommendations.bestHookTemplate,
      contentFormat: viralResearch.templateRecommendations.recommendedFormat,
      videoStructure: viralResearch.templateRecommendations.suggestedStructure
    }
  };
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  const expiredKeys = Object.keys(viralDataCache).filter(key => 
    viralDataCache[key].expiresAt < now
  );
  
  expiredKeys.forEach(key => {
    delete viralDataCache[key];
  });

  if (expiredKeys.length > 0) {
    console.log(`🧹 Cleared ${expiredKeys.length} expired viral research cache entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { total: number; expired: number; valid: number } {
  const now = Date.now();
  const allKeys = Object.keys(viralDataCache);
  const expiredKeys = allKeys.filter(key => viralDataCache[key].expiresAt < now);
  
  return {
    total: allKeys.length,
    expired: expiredKeys.length,
    valid: allKeys.length - expiredKeys.length
  };
}