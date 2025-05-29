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
      
      // Extract products from video content using a simple approach
      const combinedText = `${title} ${description}`;
      
      // Look for specific brand names that commonly appear in skincare videos
      const brands = ['CeraVe', 'Neutrogena', 'The Ordinary', 'Fenty Beauty', 'Glossier', 
                     'Drunk Elephant', 'Glow Recipe', 'Tatcha', 'Clinique', 'MAC', 
                     'Urban Decay', 'NARS', 'Morphe', 'Benefit', 'Tarte', 'Maybelline', 
                     'L\'Oreal', 'Revlon', 'NYX', 'ELF'];
      
      brands.forEach(brand => {
        if (combinedText.toLowerCase().includes(brand.toLowerCase())) {
          products.push({
            title: brand,
            source: "youtube",
            niche: niche,
            mentions: Math.floor(viewCount / 1000),
            sourceUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
          });
        }
      });
      
      // Also look for product type mentions if no brands found
      if (products.length === 0) {
        const productTypes = ['serum', 'moisturizer', 'cleanser', 'foundation', 'mascara', 'lipstick'];
        productTypes.forEach(type => {
          if (combinedText.toLowerCase().includes(type)) {
            products.push({
              title: `${type.charAt(0).toUpperCase() + type.slice(1)} Product`,
              source: "youtube",
              niche: niche,
              mentions: Math.floor(viewCount / 2000),
              sourceUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
            });
          }
        });
      }
      
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
    
    if (uniqueProducts.length === 0) {
      console.log('No products extracted, sample video data:');
      videos.slice(0, 2).forEach((video: any, i: number) => {
        console.log(`Video ${i + 1}: "${video.snippet.title}" - Channel: ${video.snippet.channelTitle}`);
      });
      throw new Error('Could not extract product mentions from YouTube data');
    }
    
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