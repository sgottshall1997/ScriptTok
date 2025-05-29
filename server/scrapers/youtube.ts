import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import { ScraperReturn } from './index';

// Clean YouTube API implementation for authentic trending data
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
      'skincare': ['skincare routine', 'skincare haul', 'beauty products', 'skincare review'],
      'tech': ['tech review', 'gadget unboxing', 'tech haul', 'best tech'],
      'fashion': ['fashion haul', 'outfit ideas', 'clothing review', 'style guide'],
      'fitness': ['fitness gear', 'workout equipment', 'gym essentials', 'fitness review'],
      'food': ['kitchen gadgets', 'cooking tools', 'food review', 'kitchen essentials'],
      'pet': ['pet products', 'pet care', 'dog toys', 'pet essentials'],
      'travel': ['travel gear', 'travel essentials', 'travel review', 'luggage review']
    };

    const searchTerms = nicheSearchTerms[niche] || nicheSearchTerms['skincare'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    console.log(`🔍 YouTube API: Searching for "${searchTerm}" in ${niche} niche`);

    // Get trending videos using YouTube Data API
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        part: 'snippet',
        q: searchTerm,
        type: 'video',
        order: 'relevance',
        maxResults: 15,
        relevanceLanguage: 'en'
      }
    });

    const videos = searchResponse.data.items || [];
    
    if (videos.length === 0) {
      throw new Error('No videos found for search term');
    }

    console.log(`📹 YouTube API: Found ${videos.length} videos for "${searchTerm}"`);

    // Get video statistics for engagement data
    const videoIds = videos.map((video: any) => video.id.videoId).join(',');
    
    const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: API_KEY,
        part: 'statistics',
        id: videoIds
      }
    });

    const videoStats = statsResponse.data.items || [];
    
    // Extract authentic trending content from real videos
    const products: InsertTrendingProduct[] = [];
    
    videos.forEach((video: any, index: number) => {
      const stats = videoStats[index];
      const viewCount = stats ? parseInt(stats.statistics.viewCount || '0') : 0;
      
      if (viewCount > 1000) {
        const title = video.snippet.title;
        const description = video.snippet.description || '';
        const combinedText = `${title} ${description}`.toLowerCase();
        
        // Extract brand mentions from authentic video content
        const brands = ['cerave', 'neutrogena', 'ordinary', 'fenty', 'glossier', 
                       'drunk elephant', 'glow recipe', 'tatcha', 'clinique', 'mac', 
                       'urban decay', 'nars', 'morphe', 'benefit', 'tarte', 'maybelline', 
                       'loreal', 'revlon', 'nyx', 'elf', 'olaplex', 'paula\'s choice'];
        
        const foundBrand = brands.find(brand => combinedText.includes(brand));
        
        let productTitle = '';
        if (foundBrand) {
          productTitle = foundBrand.charAt(0).toUpperCase() + foundBrand.slice(1);
        } else if (combinedText.includes('routine')) {
          productTitle = `${niche.charAt(0).toUpperCase() + niche.slice(1)} Routine Trending`;
        } else if (combinedText.includes('review')) {
          productTitle = `Product Review Trending`;
        } else if (combinedText.includes('haul')) {
          productTitle = `Beauty Haul Trending`;
        } else {
          // Use actual video title for authentic trending content
          productTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
        }
        
        if (productTitle && index < 5) { // Limit to top 5 most relevant
          products.push({
            title: productTitle,
            source: "youtube",
            niche: niche,
            mentions: Math.floor(viewCount / 1000),
            sourceUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`
          });
        }
      }
    });

    // Remove duplicates and sort by engagement
    const uniqueProducts = products
      .filter((product, index, self) => 
        index === self.findIndex(p => p.title.toLowerCase() === product.title.toLowerCase())
      )
      .sort((a, b) => (b.mentions || 0) - (a.mentions || 0))
      .slice(0, 3);

    console.log(`✅ YouTube API: Extracted ${uniqueProducts.length} authentic trending items`);
    
    if (uniqueProducts.length === 0) {
      console.log('📋 Sample authentic video data:');
      videos.slice(0, 2).forEach((video: any, i: number) => {
        console.log(`  ${i + 1}. "${video.snippet.title}" by ${video.snippet.channelTitle}`);
      });
      throw new Error('Could not extract trending content from authentic YouTube data');
    }
    
    return {
      products: uniqueProducts,
      status: {
        status: 'active',
        errorMessage: undefined
      }
    };

  } catch (error: any) {
    console.error('YouTube API error:', error.message);
    return {
      products: [],
      status: {
        status: 'error',
        errorMessage: `YouTube API failed: ${error.message}`
      }
    };
  }
}