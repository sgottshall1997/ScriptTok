import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import { ScraperReturn } from './index';

// YouTube trending products scraper using real YouTube Data API
export async function getYouTubeTrending(niche: string = 'skincare'): Promise<ScraperReturn> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!API_KEY) {
    return {
      products: [],
      status: {
        status: 'error',
        errorMessage: 'YouTube API key not configured'
      }
    };
  }

  try {
    // Define search terms for each niche
    const nicheSearchTerms: Record<string, string[]> = {
      'skincare': ['skincare routine', 'skin care products', 'skincare haul', 'beauty products'],
      'tech': ['tech review', 'gadget unboxing', 'tech haul', 'best tech'],
      'fashion': ['fashion haul', 'outfit ideas', 'clothing review', 'style guide'],
      'fitness': ['fitness gear', 'workout equipment', 'gym essentials', 'fitness review'],
      'food': ['kitchen gadgets', 'cooking tools', 'food review', 'kitchen essentials'],
      'pet': ['pet products', 'pet care', 'dog toys', 'pet essentials'],
      'travel': ['travel gear', 'travel essentials', 'travel review', 'luggage review']
    };

    const searchTerms = nicheSearchTerms[niche] || nicheSearchTerms['skincare'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    // Search for trending videos in the niche
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        part: 'snippet',
        q: searchTerm,
        type: 'video',
        order: 'relevance',
        maxResults: 20,
        relevanceLanguage: 'en'
      }
    });

    const videos = searchResponse.data.items || [];
    
    if (videos.length === 0) {
      throw new Error('No videos found for search term');
    }

    // Get video IDs for statistics
    const videoIds = videos.map((video: any) => video.id.videoId).join(',');
    
    // Get video statistics
    const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: API_KEY,
        part: 'statistics',
        id: videoIds
      }
    });

    const videoStats = statsResponse.data.items || [];
    
    // Extract product mentions from video titles and descriptions
    const products: InsertTrendingProduct[] = [];
    
    videos.forEach((video: any, index: number) => {
      const stats = videoStats.find((stat: any) => stat.id === video.id.videoId);
      const viewCount = stats?.statistics?.viewCount ? parseInt(stats.statistics.viewCount) : 0;
      
      // Extract potential product names from titles
      const title = video.snippet.title;
      const description = video.snippet.description || '';
      
      // Enhanced product pattern matching for different contexts
      const productPatterns = [
        // Brand + Product patterns
        /([A-Z][a-zA-Z]+)\s+([A-Z][a-zA-Z\s]+(?:Serum|Cream|Cleanser|Moisturizer|Foundation|Mascara|Lipstick|Oil|Balm|Gel|Spray|Mist|Essence|Treatment|Mask|Scrub|Lotion|Powder|Primer|Toner))/gi,
        // Review/unboxing patterns
        /(?:review|unboxing|haul|testing|trying)\s+([A-Z][a-zA-Z\s&\-]+(?:Pro|Max|Ultra|Plus|Mini|Air|One)?)/gi,
        // Product with brand patterns
        /([A-Z][a-zA-Z\s&\-]+)\s+(?:from|by)\s+([A-Z][a-zA-Z\s&]+)/gi,
        // Direct product mentions
        /([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z\s]+)\s*(?:\||review|haul|unboxing)/gi
      ];
      
      productPatterns.forEach(pattern => {
        const titleMatches = [...title.matchAll(pattern)];
        const descMatches = [...description.substring(0, 200).matchAll(pattern)];
        
        [...titleMatches, ...descMatches].forEach(match => {
          let productName = '';
          
          // Handle different match groups
          if (match[1] && match[2]) {
            productName = `${match[1]} ${match[2]}`.trim();
          } else if (match[1]) {
            productName = match[1].trim();
          }
          
          // Clean and validate product name
          productName = productName
            .replace(/[^\w\s\-&]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (productName.length > 5 && productName.length < 60 && viewCount > 1000) {
            products.push({
              title: productName,
              source: "youtube",
              niche: niche,
              mentions: Math.floor(viewCount / 1000), // Convert views to mention metric
              sourceUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
            });
          }
        });
      });
      
      // Extract from channel title for brand mentions
      const channelTitle = video.snippet.channelTitle;
      if (channelTitle && index < 3 && viewCount > 10000) {
        const brandPattern = /([A-Z][a-zA-Z\s]+)\s*(?:Official|Beauty|Skincare|Cosmetics)/gi;
        const brandMatches = [...channelTitle.matchAll(brandPattern)];
        
        brandMatches.forEach(match => {
          const brandName = match[1].trim();
          if (brandName.length > 3 && brandName.length < 30) {
            products.push({
              title: `${brandName} Products`,
              source: "youtube",
              niche: niche,
              mentions: Math.floor(viewCount / 2000),
              sourceUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
            });
          }
        });
      }
    });

    // Remove duplicates and limit results
    const uniqueProducts = products
      .filter((product, index, self) => 
        index === self.findIndex(p => p.title.toLowerCase() === product.title.toLowerCase())
      )
      .sort((a, b) => (b.mentions || 0) - (a.mentions || 0))
      .slice(0, 5);

    console.log(`✅ YouTube API: Found ${uniqueProducts.length} products from ${videos.length} videos`);
    
    return {
      products: uniqueProducts,
      status: {
        status: 'active',
        errorMessage: undefined
      }
    };

  } catch (error: any) {
    console.error('YouTube API error:', error);
    return {
      products: [],
      status: {
        status: 'error',
        errorMessage: `YouTube API failed: ${error.message}`
      }
    };
  }
}