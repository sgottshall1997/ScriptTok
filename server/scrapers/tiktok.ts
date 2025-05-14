import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { openai } from '../services/openai';
import { ScraperReturn } from './index';
import { ScraperStatusType } from '@shared/constants';

// TikTok trending products scraper with web approach
export async function getTikTokTrending(): Promise<ScraperReturn> {
  // First try real TikTok data
  try {
    // Define popular TikTok skincare hashtags to search
    const skincareTags = [
      'skincaretips',
      'skincareproducts', 
      'skincaremusthaves',
      'beautyhacks',
      'skintok'
    ];
    
    // Choose a random tag
    const selectedTag = skincareTags[Math.floor(Math.random() * skincareTags.length)];
    console.log(`Scraping TikTok for tag: #${selectedTag}`);
    
    // Try to access the TikTok tag page
    const response = await axios.get(`https://www.tiktok.com/tag/${selectedTag}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    
    // TikTok uses a lot of JavaScript, so we need to find their data in script tags
    let tiktokData = null;
    let videoContent: { desc: string, views: number, url: string }[] = [];
    
    // Look for SIGI_STATE data that contains video information
    $('script').each((i, script) => {
      const scriptContent = $(script).html() || '';
      
      if (scriptContent.includes('SIGI_STATE')) {
        try {
          const jsonText = scriptContent.split('window[\'SIGI_STATE\'] = ')[1]?.split(';')[0] || 
                          scriptContent.split('window["SIGI_STATE"] = ')[1]?.split(';')[0];
          
          if (jsonText) {
            tiktokData = JSON.parse(jsonText);
            console.log('Found TikTok state data');
          }
        } catch (e) {
          console.error('Error parsing TikTok data:', e);
        }
      }
    });
    
    // Extract video information from TikTok data
    if (tiktokData && tiktokData.ChallengePage && 
        tiktokData.ChallengePage.challengeInfo && 
        tiktokData.ChallengePage.itemList) {
      
      const videos = tiktokData.ChallengePage.itemList;
      console.log(`Found ${videos.length} TikTok videos`);
      
      for (const video of videos) {
        try {
          const desc = video.desc || '';
          const views = parseInt(video.stats?.playCount || '0');
          const id = video.id;
          const url = `https://tiktok.com/@${video.author?.uniqueId || 'user'}/video/${id}`;
          
          if (desc) {
            videoContent.push({ desc, views, url });
          }
        } catch (err) {
          console.error('Error processing TikTok video:', err);
        }
      }
    } 
    // Try alternate data location
    else if (tiktokData && tiktokData.ItemModule) {
      const videos = Object.values(tiktokData.ItemModule);
      console.log(`Found ${videos.length} TikTok videos (alt method)`);
      
      for (const video of videos as any[]) {
        try {
          const desc = video.desc || '';
          const views = parseInt(video.stats?.playCount || '0');
          const id = video.id;
          const url = `https://tiktok.com/@${video.author?.uniqueId || 'user'}/video/${id}`;
          
          if (desc) {
            videoContent.push({ desc, views, url });
          }
        } catch (err) {
          console.error('Error processing TikTok video (alt):', err);
        }
      }
    }
    
    // Process video descriptions for product mentions
    if (videoContent.length > 0) {
      // Define skincare brands to look for
      const skincareBrands = [
        'CeraVe', 'The Ordinary', 'La Roche-Posay', 'Neutrogena', 'Cetaphil', 
        'Paula\'s Choice', 'Kiehl\'s', 'Drunk Elephant', 'Tatcha', 'Glossier',
        'Laneige', 'Glow Recipe', 'Youth To The People', 'First Aid Beauty', 'Sunday Riley',
        'COSRX', 'SK-II', 'Supergoop', 'Dermalogica', 'Fresh', 'Clinique',
        'Hyaluronic', 'Niacinamide', 'Retinol', 'SPF', 'Sunscreen', 'Moisturizer',
        'Cleanser', 'Serum', 'Toner', 'Exfoliant', 'AHA', 'BHA', 'Vitamin C'
      ];
      
      // Track product mentions
      const productMentions: Map<string, { mentions: number, url: string, views: number }> = new Map();
      
      for (const video of videoContent) {
        const desc = video.desc.toLowerCase();
        const views = video.views;
        const url = video.url;
        
        // Look for skincare brand mentions
        for (const brand of skincareBrands) {
          if (desc.includes(brand.toLowerCase())) {
            // Extract product name (brand + up to 5 words)
            const regex = new RegExp(`${brand.toLowerCase()}(\\s+\\w+){0,5}`, 'gi');
            const matches = desc.match(regex);
            
            if (matches) {
              for (const match of matches) {
                // Clean and normalize product name
                let productName = match.trim();
                productName = productName.replace(/\w\S*/g, (txt: string) => {
                  return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                
                // Update product mentions
                if (productMentions.has(productName)) {
                  const data = productMentions.get(productName)!;
                  data.mentions += 1;
                  data.views += views;
                } else {
                  productMentions.set(productName, {
                    mentions: 1,
                    url,
                    views
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
          source: "tiktok",
          mentions: Math.max(100000, data.mentions * 200000 + data.views * 10), // Scale for UI
          sourceUrl: data.url
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 5); // Top 5
      
      if (products.length > 0) {
        console.log(`Successfully identified ${products.length} trending products from TikTok`);
        return {
          products,
          status: {
            status: 'active',
            errorMessage: undefined
          }
        };
      }
    }
    
    throw new Error('Could not extract product mentions from TikTok data');
    
  } catch (scrapingError) {
    console.error('TikTok scraping failed, falling back to OpenAI:', scrapingError);
    
    // Fallback to OpenAI if real scraping fails
    try {
      // Use OpenAI to generate realistic trending skincare products on TikTok
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a TikTok trend analyzer specialized in skincare and beauty products. Provide authentic, realistic trending skincare products that could be trending on TikTok right now."
          },
          {
            role: "user",
            content: "Generate 5 realistic trending skincare products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
          }
        ],
        response_format: { type: "json_object" }
      });

      // Parse the response
      const content = completion.choices[0].message.content || "{}";
      const responseData = JSON.parse(content);
      // Check if the response is an array, or if it has a key that contains the array
      const productsArray = Array.isArray(responseData) ? responseData : (responseData.products || []);
      
      const products: InsertTrendingProduct[] = productsArray.map((item: any) => ({
        title: item.title,
        source: "tiktok",
        mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 100000),
        sourceUrl: item.sourceUrl || `https://tiktok.com/tag/${encodeURIComponent(item.title.replace(/\s+/g, ''))}`
      }));

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
