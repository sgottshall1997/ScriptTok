import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { openai } from '../services/openai';
import { ScraperReturn } from './index';
import { ScraperStatusType } from '@shared/constants';

// TikTok trending products scraper with web approach
export async function getTikTokTrending(niche: string = 'skincare'): Promise<ScraperReturn> {
  // First try real TikTok data
  try {
    // Define popular TikTok hashtags by niche
    const nicheTags: Record<string, string[]> = {
      'skincare': [
        'skincaretips',
        'skincareproducts', 
        'skincaremusthaves',
        'beautyhacks',
        'skintok'
      ],
      'tech': [
        'techtok',
        'techreview',
        'gadgets',
        'technews',
        'techhacks'
      ],
      'fashion': [
        'fashiontok',
        'ootd',
        'styletips',
        'fashionhacks',
        'outfitinspo'
      ],
      'fitness': [
        'fitnesstok',
        'workout',
        'fitnessgear',
        'gymessentials',
        'fitnessjourney'
      ],
      'food': [
        'foodtok',
        'kitchengadgets',
        'foodie',
        'cookingessentials',
        'recipehacks'
      ],
      'home': [
        'hometok',
        'homedecor',
        'cleaninghacks',
        'organization',
        'homeessentials'
      ],
      'pet': [
        'pettok',
        'dogproducts',
        'catessentials',
        'pethacks',
        'petcare'
      ],
      'travel': [
        'traveltok',
        'travelgear',
        'travelmusthaves',
        'packingtips',
        'wanderlust'
      ]
    };
    
    // Get the tags for the specified niche, or default to skincare
    const tags = nicheTags[niche] || nicheTags['skincare'];
    
    // Choose a random tag
    const selectedTag = tags[Math.floor(Math.random() * tags.length)];
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
      // Define niche-specific brands and keywords
      const nicheBrands: Record<string, string[]> = {
        'skincare': [
          'CeraVe', 'The Ordinary', 'La Roche-Posay', 'Neutrogena', 'Cetaphil', 
          'Paula\'s Choice', 'Kiehl\'s', 'Drunk Elephant', 'Tatcha', 'Glossier',
          'Laneige', 'Glow Recipe', 'Youth To The People', 'First Aid Beauty', 'Sunday Riley',
          'COSRX', 'SK-II', 'Supergoop', 'Dermalogica', 'Fresh', 'Clinique',
          'Hyaluronic', 'Niacinamide', 'Retinol', 'SPF', 'Sunscreen', 'Moisturizer',
          'Cleanser', 'Serum', 'Toner', 'Exfoliant', 'AHA', 'BHA', 'Vitamin C'
        ],
        'tech': [
          'Apple', 'Samsung', 'Sony', 'Bose', 'Sonos', 'Google', 'Microsoft', 'Logitech',
          'Anker', 'DJI', 'GoPro', 'Kindle', 'Fitbit', 'Garmin', 'JBL', 'Razer', 'Asus',
          'Canon', 'Nikon', 'iPhone', 'iPad', 'MacBook', 'AirPods', 'Galaxy', 'Pixel',
          'Surface', 'Nintendo', 'PlayStation', 'Xbox', 'Quest', 'Echo', 'SmartWatch',
          'Wireless', 'Bluetooth', 'Charger', 'Adapter', 'Speaker', 'Headphones', 'Earbuds'
        ],
        'fashion': [
          'Nike', 'Adidas', 'Zara', 'H&M', 'Lululemon', 'Shein', 'Abercrombie', 'Hollister',
          'Gap', 'Uniqlo', 'Urban Outfitters', 'Free People', 'Aritzia', 'Brandy Melville',
          'Patagonia', 'North Face', 'Levi\'s', 'Dr. Martens', 'Converse', 'Vans',
          'Sweater', 'Jeans', 'Jacket', 'Dress', 'Pants', 'Shirt', 'Skirt', 'Shorts',
          'Boots', 'Sneakers', 'Sandals', 'Heels', 'Bag', 'Purse', 'Backpack', 'Accessories'
        ],
        'fitness': [
          'Nike', 'Adidas', 'Lululemon', 'Under Armour', 'New Balance', 'Gymshark',
          'Peloton', 'NordicTrack', 'Bowflex', 'HOKA', 'On Running', 'Brooks', 'Asics',
          'Fitbit', 'Garmin', 'Apple Watch', 'Hyperice', 'Theragun', 'Trigger Point',
          'Protein', 'Pre-workout', 'Creatine', 'BCAA', 'Collagen', 'Dumbbells',
          'Resistance bands', 'Yoga mat', 'Foam roller', 'Jump rope', 'Kettlebell'
        ],
        'food': [
          'Ninja', 'Instant Pot', 'KitchenAid', 'Vitamix', 'Cuisinart', 'Breville',
          'Oxo', 'Le Creuset', 'Lodge', 'Staub', 'All-Clad', 'Zwilling', 'Wusthof',
          'Nutribullet', 'Yeti', 'Stanley', 'Hydro Flask', 'Traeger', 'Weber',
          'Air fryer', 'Blender', 'Mixer', 'Coffee maker', 'Toaster', 'Food processor',
          'Dutch oven', 'Cast iron', 'Knife set', 'Cutting board', 'Meal prep', 'Containers'
        ],
        'home': [
          'Dyson', 'iRobot', 'Shark', 'Clorox', 'Bissell', 'OxiClean', 'Lysol',
          'Rubbermaid', 'Sterilite', 'Container Store', 'SimpleHuman', 'IKEA',
          'Wayfair', 'West Elm', 'Pottery Barn', 'CB2', 'Target', 'Amazon Basics',
          'Roomba', 'Vacuum', 'Mop', 'Disinfectant', 'Organizer', 'Storage', 'Basket',
          'Sheets', 'Pillow', 'Mattress', 'Lamp', 'Chair', 'Sofa', 'Table', 'Curtains'
        ],
        'pet': [
          'Chewy', 'PetSmart', 'Petco', 'Kong', 'Nylabone', 'Purina', 'Royal Canin',
          'Hill\'s', 'Blue Buffalo', 'Greenies', 'Frontline', 'Seresto', 'Advantage',
          'Furbo', 'Whistle', 'PetSafe', 'FURminator', 'ChomChom', 'Bark Box',
          'Food', 'Treats', 'Toys', 'Bed', 'Crate', 'Carrier', 'Leash', 'Collar',
          'Harness', 'Brush', 'Shampoo', 'Flea', 'Tick', 'Litter box', 'Scratching post'
        ],
        'travel': [
          'Away', 'Samsonite', 'Tumi', 'Monos', 'Calpak', 'Beis', 'Eagle Creek',
          'Osprey', 'North Face', 'Patagonia', 'REI', 'Columbia', 'Thule', 'Fjallraven',
          'Quay', 'Ray-Ban', 'Hydroflask', 'Yeti', 'GoPro', 'Sony', 'Bose', 'Apple',
          'Suitcase', 'Luggage', 'Backpack', 'Duffel', 'Packing cubes', 'Toiletry bag',
          'Passport holder', 'Travel pillow', 'Eye mask', 'Adapter', 'Power bank', 'Camera'
        ]
      };
      
      // Get brands for the specified niche
      const brandList = nicheBrands[niche] || nicheBrands['skincare'];
      
      // Track product mentions
      const productMentions: Map<string, { mentions: number, url: string, views: number }> = new Map();
      
      for (const video of videoContent) {
        const desc = video.desc.toLowerCase();
        const views = video.views;
        const url = video.url;
        
        // Look for brand mentions for the specified niche
        for (const brand of brandList) {
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
        console.log('TikTok products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
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
      // Define niche-specific prompts
      const nicheSystemPrompts: Record<string, string> = {
        'skincare': "You are a TikTok trend analyzer specialized in skincare and beauty products. Provide authentic, realistic trending skincare products that could be trending on TikTok right now.",
        'tech': "You are a TikTok trend analyzer specialized in technology and gadgets. Provide authentic, realistic trending tech products that could be trending on TikTok right now.",
        'fashion': "You are a TikTok trend analyzer specialized in fashion and clothing. Provide authentic, realistic trending fashion items that could be trending on TikTok right now.",
        'fitness': "You are a TikTok trend analyzer specialized in fitness equipment and accessories. Provide authentic, realistic trending fitness products that could be trending on TikTok right now.",
        'food': "You are a TikTok trend analyzer specialized in cooking and kitchen products. Provide authentic, realistic trending cooking gadgets and kitchen items that could be trending on TikTok right now.",
        'home': "You are a TikTok trend analyzer specialized in home goods and decor. Provide authentic, realistic trending home products that could be trending on TikTok right now.",
        'pet': "You are a TikTok trend analyzer specialized in pet products and accessories. Provide authentic, realistic trending pet products that could be trending on TikTok right now.",
        'travel': "You are a TikTok trend analyzer specialized in travel gear and accessories. Provide authentic, realistic trending travel products that could be trending on TikTok right now."
      };
      
      const nicheUserPrompts: Record<string, string> = {
        'skincare': "Generate 5 realistic trending skincare products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'tech': "Generate 5 realistic trending tech products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'fashion': "Generate 5 realistic trending fashion items on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'fitness': "Generate 5 realistic trending fitness products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'food': "Generate 5 realistic trending kitchen gadgets and cooking products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'home': "Generate 5 realistic trending home decor and household products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'pet': "Generate 5 realistic trending pet products on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]",
        'travel': "Generate 5 realistic trending travel gear and accessories on TikTok with title, mentions count (between 100K-2M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
      };
      
      // Get the appropriate prompts for the niche
      const systemPrompt = nicheSystemPrompts[niche] || nicheSystemPrompts['skincare'];
      const userPrompt = nicheUserPrompts[niche] || nicheUserPrompts['skincare'];
      
      // Use OpenAI to generate realistic trending products for the specified niche
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
      // Check if the response is an array, or if it has a key that contains the array
      const productsArray = Array.isArray(responseData) ? responseData : (responseData.products || []);
      
      const products: InsertTrendingProduct[] = productsArray.map((item: any) => ({
        title: item.title,
        source: "tiktok",
        niche: niche, // Add niche to each product
        mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 100000),
        sourceUrl: item.sourceUrl || `https://tiktok.com/tag/${encodeURIComponent(item.title.replace(/\s+/g, ''))}`
      }));

      console.log(`Generated ${products.length} trending products from TikTok using GPT fallback`);
      console.log('TikTok GPT products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
      
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
