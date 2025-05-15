import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { openai } from '../services/openai';
import { ScraperReturn } from './index';
import { ScraperStatusType } from '@shared/constants';

// YouTube trending products scraper
export async function getYouTubeTrending(niche: string = 'skincare'): Promise<ScraperReturn> {
  // First try real YouTube data
  try {
    // YouTube search terms by niche
    const nicheSearchTerms: Record<string, string[]> = {
      'skincare': [
        'trending skincare products',
        'best beauty products',
        'skincare must haves',
        'viral beauty products',
        'skincare trending'
      ],
      'tech': [
        'trending tech gadgets',
        'best tech products',
        'tech must haves',
        'viral tech products',
        'tech accessories trending'
      ],
      'fashion': [
        'trending fashion items',
        'best clothing brands',
        'fashion must haves',
        'viral clothing products',
        'fashion trending'
      ],
      'fitness': [
        'trending fitness equipment',
        'best workout gear',
        'fitness must haves',
        'viral fitness products',
        'home gym essentials'
      ],
      'food': [
        'trending kitchen gadgets',
        'best cooking tools',
        'kitchen must haves',
        'viral cooking products',
        'chef recommended tools'
      ],
      'home': [
        'trending home products',
        'best home decor',
        'home organization must haves',
        'viral home gadgets',
        'home essentials trending'
      ],
      'pet': [
        'trending pet products',
        'best pet accessories',
        'pet owner must haves',
        'viral pet gadgets',
        'dog cat products trending'
      ],
      'travel': [
        'trending travel gear',
        'best travel accessories',
        'travel must haves',
        'viral travel products',
        'packing essentials trending'
      ]
    };
    
    // Get search terms for the specified niche, or default to skincare
    const searchTerms = nicheSearchTerms[niche] || nicheSearchTerms['skincare'];
    
    // Choose a random search term
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    console.log(`Scraping YouTube for: "${searchTerm}"`);
    
    // Make request to YouTube search
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const response = await axios.get(`https://www.youtube.com/results?search_query=${encodedSearchTerm}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // YouTube loads its content via JavaScript, so we need to extract the initial data
    // Look for video data in script tags
    let ytInitialData = null;
    let videoResults: { title: string, views: number, videoId: string }[] = [];
    
    // Try to extract the ytInitialData object from script tags
    $('script').each((i, script) => {
      const scriptContent = $(script).html() || '';
      
      if (scriptContent.includes('var ytInitialData = ')) {
        try {
          const dataString = scriptContent.split('var ytInitialData = ')[1]?.split(';</script>')[0];
          if (dataString) {
            ytInitialData = JSON.parse(dataString);
            console.log('Found YouTube initial data');
          }
        } catch (e) {
          console.error('Error parsing YouTube initial data:', e);
        }
      }
    });
    
    // Extract video information if we found the initial data
    if (ytInitialData && 
        ytInitialData.contents && 
        ytInitialData.contents.twoColumnSearchResultsRenderer &&
        ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents &&
        ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer &&
        ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents) {
      
      // Navigate through the structure to find video renderers
      const contents = ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
      
      for (const section of contents) {
        if (section.itemSectionRenderer && section.itemSectionRenderer.contents) {
          for (const item of section.itemSectionRenderer.contents) {
            if (item.videoRenderer) {
              const videoRenderer = item.videoRenderer;
              const title = videoRenderer.title?.runs?.[0]?.text || '';
              const videoId = videoRenderer.videoId;
              const viewCountText = videoRenderer.viewCountText?.simpleText || videoRenderer.viewCountText?.runs?.[0]?.text || '';
              
              // Extract view count as a number
              const viewCountMatch = viewCountText.match(/[\d,]+/);
              const viewCount = viewCountMatch 
                ? parseInt(viewCountMatch[0].replace(/,/g, '')) 
                : 0;
              
              if (title && videoId) {
                videoResults.push({
                  title,
                  views: viewCount,
                  videoId
                });
              }
            }
          }
        }
      }
      
      console.log(`Found ${videoResults.length} YouTube videos`);
    }
    
    // If we have videos, extract product mentions
    if (videoResults.length > 0) {
      // Define skincare brands to look for in video titles
      const skincareBrands = [
        'CeraVe', 'The Ordinary', 'La Roche-Posay', 'Neutrogena', 'Cetaphil', 
        'Paula\'s Choice', 'Kiehl\'s', 'Drunk Elephant', 'Tatcha', 'Glossier',
        'Laneige', 'Glow Recipe', 'Youth To The People', 'First Aid Beauty', 'Sunday Riley',
        'COSRX', 'SK-II', 'Supergoop', 'Dermalogica', 'Fresh', 'Clinique',
        'Hyaluronic', 'Niacinamide', 'Retinol', 'SPF', 'Sunscreen', 'Moisturizer',
        'Cleanser', 'Serum', 'Toner', 'Exfoliant', 'AHA', 'BHA', 'Vitamin C'
      ];
      
      // Process video titles for product mentions
      const productMentions: Map<string, { mentions: number, url: string, views: number }> = new Map();
      
      for (const video of videoResults) {
        const title = video.title.toLowerCase();
        const views = video.views;
        const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
        
        // Check for brand/product mentions
        for (const brand of skincareBrands) {
          if (title.includes(brand.toLowerCase())) {
            // Find product pattern (brand + up to 5 words)
            const regex = new RegExp(`${brand.toLowerCase()}(\\s+\\w+){0,5}`, 'gi');
            const matches = title.match(regex);
            
            if (matches) {
              for (const match of matches) {
                // Clean up the product name
                let productName = match.trim();
                productName = productName.replace(/\w\S*/g, (txt) => {
                  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                
                // Update mentions count
                if (productMentions.has(productName)) {
                  const data = productMentions.get(productName)!;
                  data.mentions += 1;
                  data.views += views;
                } else {
                  productMentions.set(productName, {
                    mentions: 1,
                    url: videoUrl,
                    views: views
                  });
                }
              }
            }
          }
        }
      }
      
      // Convert to trending products format
      const products: InsertTrendingProduct[] = Array.from(productMentions.entries())
        .map(([title, data]) => ({
          title,
          source: "youtube",
          mentions: Math.max(200000, data.mentions * 50000 + data.views * 10), // Scale up for UI
          sourceUrl: data.url
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 5); // Top 5
      
      if (products.length > 0) {
        console.log(`Successfully identified ${products.length} trending products from YouTube`);
        console.log('YouTube products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
        return {
          products,
          status: {
            status: 'active',
            errorMessage: undefined
          }
        };
      }
    }
    
    // If no products found from video data
    throw new Error('Could not extract product mentions from YouTube data');
    
  } catch (scrapingError) {
    console.error('YouTube scraping failed, falling back to OpenAI:', scrapingError);
    
    // Fallback to OpenAI if real scraping fails
    try {
      // Define niche-specific prompts
      const nicheSystemPrompts: Record<string, string> = {
        'skincare': "You are a YouTube trend analyzer specialized in skincare and beauty content. Provide authentic, realistic trending skincare products that could be trending in YouTube videos right now.",
        'tech': "You are a YouTube trend analyzer specialized in technology content. Provide authentic, realistic trending tech products that could be trending in YouTube videos right now.",
        'fashion': "You are a YouTube trend analyzer specialized in fashion content. Provide authentic, realistic trending fashion items that could be trending in YouTube videos right now.",
        'fitness': "You are a YouTube trend analyzer specialized in fitness content. Provide authentic, realistic trending fitness products that could be trending in YouTube videos right now.",
        'food': "You are a YouTube trend analyzer specialized in cooking and food content. Provide authentic, realistic trending kitchen gadgets and cooking products that could be trending in YouTube videos right now.",
        'home': "You are a YouTube trend analyzer specialized in home decor and DIY content. Provide authentic, realistic trending home products that could be trending in YouTube videos right now.",
        'pet': "You are a YouTube trend analyzer specialized in pet content. Provide authentic, realistic trending pet products that could be trending in YouTube videos right now.",
        'travel': "You are a YouTube trend analyzer specialized in travel content. Provide authentic, realistic trending travel gear and accessories that could be trending in YouTube videos right now."
      };
      
      const nicheUserPrompts: Record<string, string> = {
        'skincare': "Generate 5 realistic trending skincare products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'tech': "Generate 5 realistic trending tech products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'fashion': "Generate 5 realistic trending fashion items on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'fitness': "Generate 5 realistic trending fitness products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'food': "Generate 5 realistic trending kitchen gadgets and cooking products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'home': "Generate 5 realistic trending home decor and household products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'pet': "Generate 5 realistic trending pet products on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'travel': "Generate 5 realistic trending travel gear and accessories on YouTube with title, mentions count (between 200K-800K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
      };
      
      // Get the appropriate prompts for the niche
      const systemPrompt = nicheSystemPrompts[niche] || nicheSystemPrompts['skincare'];
      const userPrompt = nicheUserPrompts[niche] || nicheUserPrompts['skincare'];
      
      // Use OpenAI to generate realistic trending products on YouTube
      const completion = await openai.chat.completions.create({
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
        response_format: { type: "json_object" }
      });

      // Parse the response
      const content = completion.choices[0].message.content || "{}";
      const responseData = JSON.parse(content);
      // Check if the response is an array or if it has a products key
      const productsArray = Array.isArray(responseData) ? responseData : (responseData.products || []);
      
      const products: InsertTrendingProduct[] = productsArray.map((item: any) => ({
        title: item.title,
        source: "youtube",
        niche: niche, // Add niche to each product
        mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 500000),
        sourceUrl: item.sourceUrl || `https://youtube.com/results?search_query=${encodeURIComponent(item.title)}`
      }));

      console.log(`Generated ${products.length} trending products from YouTube using GPT fallback`);
      console.log('YouTube GPT products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
      
      return {
        products,
        status: {
          status: 'gpt-fallback',
          errorMessage: `Scraping failed: ${scrapingError instanceof Error ? scrapingError.message : 'Unknown error'}`
        }
      };
    } catch (openaiError) {
      console.error('OpenAI fallback also failed:', openaiError);
      return {
        products: [],
        status: {
          status: 'error',
          errorMessage: `Scraping and GPT fallback failed: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`
        }
      };
    }
  }
}
