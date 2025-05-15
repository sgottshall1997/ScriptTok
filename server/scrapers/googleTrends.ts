import axios from 'axios';
import { InsertTrendingProduct } from '@shared/schema';
import { ScraperReturn } from './index';
import { openai } from '../services/openai';

// Google Trends API URLs
const GOOGLE_TRENDS_BASE_URL = 'https://trends.google.com/trends/api/topdailytrends';

// Category IDs for different niches
// See https://github.com/pat310/google-trends-api/wiki/Google-Trends-Categories
const NICHE_CATEGORIES: Record<string, string> = {
  'skincare': '44',  // Beauty & Fitness
  'tech': '5',       // Computers & Electronics
  'fashion': '96',   // Shopping > Apparel
  'fitness': '273',  // Health > Fitness
  'food': '71',      // Food & Drink
  'home': '11',      // Home & Garden
  'pet': '66',       // Pets & Animals
  'travel': '67'     // Travel
};

/**
 * Parse Google Trends response (they start with a strange prefix we need to remove)
 */
function parseGoogleTrendsResponse(response: string): any {
  // Google Trends API responses start with ")]}',\n" which needs to be removed
  const cleanedResponse = response.substring(response.indexOf('\n') + 1);
  return JSON.parse(cleanedResponse);
}

/**
 * Extract trending products from Google Trends data for a specific niche
 */
export async function getGoogleTrendingProducts(niche: string = 'skincare'): Promise<ScraperReturn> {
  try {
    // Get the category ID for the niche, default to skincare category if niche not found
    const categoryId = NICHE_CATEGORIES[niche] || NICHE_CATEGORIES['skincare'];
    
    // Construct the API URL with the appropriate category
    const apiUrl = `${GOOGLE_TRENDS_BASE_URL}?hl=en-US&tz=-180&geo=US&cat=${categoryId}&abtest=1`;
    
    console.log(`Fetching from Google Trends for niche: ${niche} (category: ${categoryId})...`);
    const response = await axios.get(apiUrl);
    
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
      sourceUrl: story.shareUrl || 'https://trends.google.com'
    }));

    return {
      products,
      status: {
        status: 'active',
        errorMessage: undefined
      }
    };
  } catch (scrapingError: any) {
    console.error('Error scraping Google Trends:', scrapingError);
    
    // Fall back to OpenAI for simulated data
    try {
      // Define niche-specific prompts
      const nicheSystemPrompts: Record<string, string> = {
        'skincare': "You are a helpful assistant that provides realistic trending skincare and beauty products from Google Trends. Provide 5 trending beauty products in JSON format that people would likely be searching for currently.",
        'tech': "You are a helpful assistant that provides realistic trending tech products from Google Trends. Provide 5 trending tech gadgets in JSON format that people would likely be searching for currently.",
        'fashion': "You are a helpful assistant that provides realistic trending fashion items from Google Trends. Provide 5 trending clothing or accessory items in JSON format that people would likely be searching for currently.",
        'fitness': "You are a helpful assistant that provides realistic trending fitness products from Google Trends. Provide 5 trending workout equipment or fitness accessories in JSON format that people would likely be searching for currently.",
        'food': "You are a helpful assistant that provides realistic trending kitchen and cooking products from Google Trends. Provide 5 trending kitchen gadgets or cooking tools in JSON format that people would likely be searching for currently.",
        'home': "You are a helpful assistant that provides realistic trending home decor and organization products from Google Trends. Provide 5 trending home products in JSON format that people would likely be searching for currently.",
        'pet': "You are a helpful assistant that provides realistic trending pet products from Google Trends. Provide 5 trending pet accessories or supplies in JSON format that people would likely be searching for currently.",
        'travel': "You are a helpful assistant that provides realistic trending travel products from Google Trends. Provide 5 trending travel gear or accessories in JSON format that people would likely be searching for currently."
      };
      
      const nicheUserPrompts: Record<string, string> = {
        'skincare': "Generate 5 realistic trending beauty/skincare products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'tech': "Generate 5 realistic trending tech products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'fashion': "Generate 5 realistic trending fashion items that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'fitness': "Generate 5 realistic trending fitness products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'food': "Generate 5 realistic trending kitchen gadgets and cooking products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'home': "Generate 5 realistic trending home products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'pet': "Generate 5 realistic trending pet products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }",
        'travel': "Generate 5 realistic trending travel products that would appear on Google Trends today. Return your response as a JSON object with a 'products' array. For example: { \"products\": [\"Product 1\", \"Product 2\", \"Product 3\", \"Product 4\", \"Product 5\"] }"
      };
      
      // Get the appropriate prompts for the niche
      const systemPrompt = nicheSystemPrompts[niche] || nicheSystemPrompts['skincare'];
      const userPrompt = nicheUserPrompts[niche] || nicheUserPrompts['skincare'];
      
      console.log(`Falling back to OpenAI for Google Trends data (niche: ${niche})...`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
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
        sourceUrl: 'https://trends.google.com'
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