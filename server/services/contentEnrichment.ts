import { getRedditTrending } from "../scrapers/reddit";
import { getTikTokTrending } from "../scrapers/tiktok";
import { getYouTubeTrending } from "../scrapers/youtube";
import { getGoogleTrendingProducts } from "../scrapers/googleTrends";

/**
 * Content Enrichment Service
 * 
 * Scrapes Reddit, TikTok, YouTube, and Google Trends to gather social proof
 * and trending insights for GPT prompt enhancement (not for display)
 */

export interface ContentEnrichmentData {
  socialProof: string[];
  trendingInsights: string[];
  platformMentions: {
    reddit?: string[];
    tiktok?: string[];
    youtube?: string[];
    googleTrends?: string[];
  };
}

export async function getContentEnrichmentData(niche: string, productTitle?: string): Promise<ContentEnrichmentData> {
  const enrichmentData: ContentEnrichmentData = {
    socialProof: [],
    trendingInsights: [],
    platformMentions: {
      reddit: [],
      tiktok: [],
      youtube: [],
      googleTrends: []
    }
  };

  console.log(`🔍 Gathering content enrichment data for ${niche}...`);

  // Scrape all platforms in parallel for content enrichment (not display)
  const platformResults = await Promise.allSettled([
    getRedditTrending(niche),
    getTikTokTrending(niche), 
    getYouTubeTrending(niche),
    getGoogleTrendingProducts(niche)
  ]);

  // Process Reddit insights
  if (platformResults[0].status === 'fulfilled' && platformResults[0].value.products?.length > 0) {
    const redditProducts = platformResults[0].value.products.slice(0, 3);
    enrichmentData.platformMentions.reddit = redditProducts.map(p => p.title);
    enrichmentData.socialProof.push(`Reddit users are discussing products like: ${redditProducts.map(p => p.title).join(', ')}`);
    console.log(`✅ Reddit enrichment: ${redditProducts.length} insights`);
  }

  // Process TikTok insights  
  if (platformResults[1].status === 'fulfilled' && platformResults[1].value.products?.length > 0) {
    const tiktokProducts = platformResults[1].value.products.slice(0, 3);
    enrichmentData.platformMentions.tiktok = tiktokProducts.map(p => p.title);
    enrichmentData.trendingInsights.push(`TikTok trending products include: ${tiktokProducts.map(p => p.title).join(', ')}`);
    console.log(`✅ TikTok enrichment: ${tiktokProducts.length} insights`);
  }

  // Process YouTube insights
  if (platformResults[2].status === 'fulfilled' && platformResults[2].value.products?.length > 0) {
    const youtubeProducts = platformResults[2].value.products.slice(0, 3);
    enrichmentData.platformMentions.youtube = youtubeProducts.map(p => p.title);
    enrichmentData.socialProof.push(`YouTube creators are featuring: ${youtubeProducts.map(p => p.title).join(', ')}`);
    console.log(`✅ YouTube enrichment: ${youtubeProducts.length} insights`);
  }

  // Process Google Trends insights
  if (platformResults[3].status === 'fulfilled' && platformResults[3].value.products?.length > 0) {
    const trendsProducts = platformResults[3].value.products.slice(0, 3);
    enrichmentData.platformMentions.googleTrends = trendsProducts.map(p => p.title);
    enrichmentData.trendingInsights.push(`Google Trends shows rising interest in: ${trendsProducts.map(p => p.title).join(', ')}`);
    console.log(`✅ Google Trends enrichment: ${trendsProducts.length} insights`);
  }

  console.log(`📊 Content enrichment complete for ${niche}: ${enrichmentData.socialProof.length} social proof items, ${enrichmentData.trendingInsights.length} trending insights`);

  return enrichmentData;
}

/**
 * Generate enhanced prompt context using enrichment data
 */
export function generateEnhancedPromptContext(enrichmentData: ContentEnrichmentData, productTitle?: string): string {
  let context = '';

  if (enrichmentData.socialProof.length > 0) {
    context += `\n\nSOCIAL PROOF & COMMUNITY INSIGHTS:\n${enrichmentData.socialProof.join('\n')}`;
  }

  if (enrichmentData.trendingInsights.length > 0) {
    context += `\n\nTRENDING INSIGHTS:\n${enrichmentData.trendingInsights.join('\n')}`;
  }

  if (productTitle && enrichmentData.platformMentions) {
    const relevantMentions = [];
    
    Object.entries(enrichmentData.platformMentions).forEach(([platform, mentions]) => {
      if (mentions && mentions.length > 0) {
        // Check if any mentions are similar to the product title
        const similarMentions = mentions.filter(mention => 
          mention.toLowerCase().includes(productTitle.toLowerCase().split(' ')[0]) ||
          productTitle.toLowerCase().includes(mention.toLowerCase().split(' ')[0])
        );
        
        if (similarMentions.length > 0) {
          relevantMentions.push(`${platform}: ${similarMentions.join(', ')}`);
        }
      }
    });

    if (relevantMentions.length > 0) {
      context += `\n\nRELATED PRODUCT MENTIONS:\n${relevantMentions.join('\n')}`;
    }
  }

  return context;
}