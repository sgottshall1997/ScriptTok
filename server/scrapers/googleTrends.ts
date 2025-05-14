import axios from 'axios';
import { InsertTrendingProduct } from '@shared/schema';
import { ScraperReturn } from './index';
import { openai } from '../services/openai';

// Google Trends API URLs
const GOOGLE_TRENDS_BASE_URL = 'https://trends.google.com/trends/api/topdailytrends';
const GOOGLE_TRENDS_API_URL = `${GOOGLE_TRENDS_BASE_URL}?hl=en-US&tz=-180&geo=US&cat=44&abtest=1`;

/**
 * Parse Google Trends response (they start with a strange prefix we need to remove)
 */
function parseGoogleTrendsResponse(response: string): any {
  // Google Trends API responses start with ")]}',\n" which needs to be removed
  const cleanedResponse = response.substring(response.indexOf('\n') + 1);
  return JSON.parse(cleanedResponse);
}

/**
 * Extract trending beauty/skincare products from Google Trends data
 */
export async function getGoogleTrendingProducts(): Promise<ScraperReturn> {
  try {
    console.log('Fetching from Google Trends (beauty & skincare)...');
    const response = await axios.get(GOOGLE_TRENDS_API_URL);
    
    // Parse the response and extract trending topics
    const parsedData = parseGoogleTrendsResponse(response.data);
    const trendingTopics = parsedData.default.trendingStoryList || [];
    
    // Filter and map the trending topics to our product format
    const beautyRelatedTopics = trendingTopics
      .filter((story: any) => {
        const title = story.title.toLowerCase();
        const entityNames = story.entityNames || [];
        
        // Check if the topic is related to beauty, skincare, makeup, etc.
        return title.includes('skin') || 
               title.includes('beauty') || 
               title.includes('makeup') || 
               title.includes('cosmetic') ||
               title.includes('cream') ||
               title.includes('lotion') ||
               title.includes('moisturizer') ||
               title.includes('serum') ||
               entityNames.some((entity: string) => 
                 entity.toLowerCase().includes('skin') || 
                 entity.toLowerCase().includes('beauty')
               );
      })
      .slice(0, 10); // Take top 10 beauty-related topics

    // Map to our product format
    const products: InsertTrendingProduct[] = beautyRelatedTopics.map((story: any, index: number) => ({
      title: story.title,
      source: 'google-trends',
      mentions: story.formattedTraffic ? parseInt(story.formattedTraffic.replace(/[^0-9]/g, '')) : 1000 - (index * 100),
      sourceUrl: story.shareUrl || 'https://trends.google.com',
      createdAt: new Date().toISOString()
    }));

    return {
      products,
      status: {
        status: 'active',
        errorMessage: undefined
      }
    };
  } catch (scrapingError: unknown) {
    console.error('Error scraping Google Trends:', scrapingError);
    
    // Fall back to OpenAI for simulated data
    try {
      console.log('Falling back to OpenAI for Google Trends data...');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides realistic trending skincare and beauty products from Google Trends. Provide 5 trending beauty products that people would likely be searching for currently."
          },
          {
            role: "user",
            content: "Generate 5 realistic trending beauty/skincare products that would appear on Google Trends today. Include product names only, no description."
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      if (!content) throw new Error("No content returned from OpenAI");
      
      const parsedContent = JSON.parse(content);
      const trendingProducts = Array.isArray(parsedContent.products) 
        ? parsedContent.products 
        : (parsedContent.trending_products || []);
      
      const products: InsertTrendingProduct[] = trendingProducts.slice(0, 5).map((product: string, index: number) => ({
        title: product,
        source: 'google-trends',
        mentions: 1000 - (index * 100), // Simulated trend strength
        sourceUrl: 'https://trends.google.com',
        createdAt: new Date().toISOString()
      }));
      
      return {
        products,
        status: {
          status: 'gpt-fallback',
          errorMessage: "Using OpenAI-generated data due to Google Trends API error"
        }
      };
    } catch (openaiError: any) {
      console.error('Error with OpenAI fallback for Google Trends:', openaiError);
      
      return {
        products: [],
        status: {
          status: 'error',
          errorMessage: `Failed to fetch Google Trends data: ${openaiError.message || 'Unknown error'}`
        }
      };
    }
  }
}