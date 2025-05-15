import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { openai } from '../services/openai';
import { ScraperReturn } from './index';
import { ScraperStatusType } from '@shared/constants';

// Amazon trending products scraper
export async function getAmazonTrending(niche: string = 'skincare'): Promise<ScraperReturn> {
  // First try real scraping
  try {
    // Target URLs for different niches trending/bestsellers
    const nicheTargetURLs: Record<string, string[]> = {
      'skincare': [
        'https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty',
        'https://www.amazon.com/Best-Sellers-Beauty-Skin-Care-Products/zgbs/beauty/11060451'
      ],
      'tech': [
        'https://www.amazon.com/Best-Sellers-Electronics/zgbs/electronics',
        'https://www.amazon.com/Best-Sellers-Electronics-Computer-Accessories-Supplies/zgbs/electronics/172456'
      ],
      'fashion': [
        'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry/zgbs/fashion',
        'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Womens-Fashion/zgbs/fashion/7147440011'
      ],
      'fitness': [
        'https://www.amazon.com/Best-Sellers-Sports-Fitness/zgbs/sporting-goods',
        'https://www.amazon.com/Best-Sellers-Sports-Fitness-Exercise-Fitness-Equipment/zgbs/sporting-goods/3375251'
      ],
      'food': [
        'https://www.amazon.com/Best-Sellers-Kitchen-Dining/zgbs/kitchen',
        'https://www.amazon.com/Best-Sellers-Home-Kitchen-Small-Appliances/zgbs/kitchen/289913'
      ],
      'home': [
        'https://www.amazon.com/Best-Sellers-Home-Kitchen/zgbs/home-garden',
        'https://www.amazon.com/Best-Sellers-Home-Kitchen-Home-D%C3%A9cor-Products/zgbs/home-garden/1063278'
      ],
      'pet': [
        'https://www.amazon.com/Best-Sellers-Pet-Supplies/zgbs/pet-supplies',
        'https://www.amazon.com/Best-Sellers-Pet-Supplies-Dog-Supplies/zgbs/pet-supplies/2975312011'
      ],
      'travel': [
        'https://www.amazon.com/Best-Sellers-Luggage-Travel-Gear/zgbs/luggage',
        'https://www.amazon.com/Best-Sellers-Luggage-Travel-Gear-Travel-Accessories/zgbs/luggage/9479199011'
      ]
    };
    
    // Get the target URLs for the specified niche, or default to skincare
    const targetURLs = nicheTargetURLs[niche] || nicheTargetURLs['skincare'];
    
    // Choose a random URL to avoid detection patterns
    const targetURL = targetURLs[Math.floor(Math.random() * targetURLs.length)];
    console.log(`Scraping Amazon from: ${targetURL}`);
    
    // Make the request with appropriate headers to mimic a browser
    const response = await axios.get(targetURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.amazon.com/',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000
    });
    
    // Load the HTML content
    const $ = cheerio.load(response.data);
    
    // Find product items from the bestseller list
    const products: InsertTrendingProduct[] = [];
    
    // Amazon's bestseller list uses these selectors - this may need updates if Amazon changes their DOM
    $('.zg-item-immersion, .p13n-sc-uncoverable-faceout').each((i, el) => {
      if (i >= 8) return; // Only get the top items
      
      try {
        // Extract product information - try multiple selectors to get the best title
        let title = $(el).find('.a-size-small.a-link-normal').text().trim();
        
        // If title is empty or just a price, try other selectors
        if (!title || title.startsWith('$') || title.length < 5) {
          title = $(el).find('.p13n-sc-truncate, .a-link-normal.a-text-normal').text().trim();
        }
        
        // Clean up the title
        title = title.replace(/\s+/g, ' ').trim();
        
        // Try to extract brand and product name
        const productImg = $(el).find('img.a-dynamic-image').attr('alt');
        if ((!title || title.startsWith('$')) && productImg) {
          title = productImg;
        }
        
        const relativeUrl = $(el).find('a.a-link-normal').attr('href');
        const sourceUrl = relativeUrl ? 
                         (relativeUrl.startsWith('http') ? relativeUrl : `https://www.amazon.com${relativeUrl}`) 
                         : undefined;
        const rank = i + 1;
        
        // Add to our products array if it's a valid title (not just a price)
        if (title && !title.startsWith('$') && title.length > 5) {
          // If the title is still generic or a price, use fake but realistic product titles
          if (title.startsWith('$') || title.match(/^\$?[\d\.]+$/) || title.length < 10) {
            // We'll let OpenAI replace this with real products later
            title = `$${(Math.random() * 30 + 10).toFixed(2)}`;
          }
          
          products.push({
            title,
            source: "amazon",
            niche: niche, // Add niche to each product
            mentions: (1000 - rank * 50) * 100, // Rough approximation of popularity based on rank
            sourceUrl: sourceUrl || `https://amazon.com/s?k=${encodeURIComponent(title)}`
          });
        }
      } catch (err) {
        console.error('Error parsing Amazon product:', err);
      }
    });
    
    // If we successfully got products through scraping, return them
    if (products.length > 0) {
      console.log(`Successfully scraped ${products.length} products from Amazon`);
      console.log('Amazon products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
      return { 
        products,
        status: {
          status: 'active',
          errorMessage: undefined
        }
      };
    }
    
    throw new Error('Failed to extract products from Amazon HTML');
  } catch (scrapingError) {
    console.error('Amazon scraping failed, falling back to OpenAI:', scrapingError);
    
    // Fallback to OpenAI if real scraping fails
    try {
      // Define niche-specific prompts
      const nicheSystemPrompts: Record<string, string> = {
        'skincare': "You are an Amazon trend analyzer specialized in skincare and beauty bestsellers. Provide authentic, realistic trending skincare products that could be bestsellers on Amazon right now.",
        'tech': "You are an Amazon trend analyzer specialized in electronics and tech gadgets. Provide authentic, realistic trending tech products that could be bestsellers on Amazon right now.",
        'fashion': "You are an Amazon trend analyzer specialized in fashion and clothing items. Provide authentic, realistic trending fashion products that could be bestsellers on Amazon right now.",
        'fitness': "You are an Amazon trend analyzer specialized in fitness and workout equipment. Provide authentic, realistic trending fitness products that could be bestsellers on Amazon right now.",
        'food': "You are an Amazon trend analyzer specialized in kitchen gadgets and cooking tools. Provide authentic, realistic trending kitchen products that could be bestsellers on Amazon right now.",
        'home': "You are an Amazon trend analyzer specialized in home decor and organization products. Provide authentic, realistic trending home products that could be bestsellers on Amazon right now.",
        'pet': "You are an Amazon trend analyzer specialized in pet supplies and accessories. Provide authentic, realistic trending pet products that could be bestsellers on Amazon right now.",
        'travel': "You are an Amazon trend analyzer specialized in luggage and travel accessories. Provide authentic, realistic trending travel products that could be bestsellers on Amazon right now."
      };
      
      const nicheUserPrompts: Record<string, string> = {
        'skincare': "Generate 5 realistic trending skincare products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'tech': "Generate 5 realistic trending tech products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'fashion': "Generate 5 realistic trending fashion items on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'fitness': "Generate 5 realistic trending fitness products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'food': "Generate 5 realistic trending kitchen gadgets and cooking products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'home': "Generate 5 realistic trending home decor and household products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'pet': "Generate 5 realistic trending pet products on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'travel': "Generate 5 realistic trending travel gear and accessories on Amazon with title, review count (between 1K-20K), and a mock product URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
      };
      
      // Get the appropriate prompts for the niche
      const systemPrompt = nicheSystemPrompts[niche] || nicheSystemPrompts['skincare'];
      const userPrompt = nicheUserPrompts[niche] || nicheUserPrompts['skincare'];
      
      // Use OpenAI to generate realistic trending products on Amazon
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
        source: "amazon",
        niche: niche, // Add niche to each product
        mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 10000),
        sourceUrl: item.sourceUrl || `https://amazon.com/s?k=${encodeURIComponent(item.title)}`
      }));

      return {
        products,
        status: {
          status: 'gpt-fallback',
          errorMessage: `Scraping failed: ${scrapingError.message}`
        }
      };
    } catch (openaiError) {
      console.error('OpenAI fallback also failed:', openaiError);
      return {
        products: [],
        status: {
          status: 'error',
          errorMessage: `Scraping and GPT fallback failed: ${openaiError.message}`
        }
      };
    }
  }
}
