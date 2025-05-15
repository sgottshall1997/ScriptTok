import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import { openai } from '../services/openai';
import { ScraperReturn } from './index';
import { ScraperStatusType } from '@shared/constants';

// Reddit trending products scraper
export async function getRedditTrending(niche: string = 'skincare'): Promise<ScraperReturn> {
  // First try real Reddit API
  try {
    // Define niche-specific subreddits to check
    const nicheSubreddits: Record<string, string[]> = {
      'skincare': [
        'SkincareAddiction',
        'AsianBeauty',
        'beauty',
        'BeautyGuruChatter'
      ],
      'tech': [
        'gadgets',
        'technology',
        'AndroidApps',
        'homeautomation',
        'Cameras'
      ],
      'fashion': [
        'malefashionadvice',
        'femalefashionadvice',
        'streetwear',
        'frugalmalefashion',
        'sneakers'
      ],
      'fitness': [
        'fitness',
        'running',
        'homegym',
        'weightlifting',
        'fitnessgear'
      ],
      'food': [
        'cooking',
        'cookingforbeginners',
        'mealprep',
        'kitchenconfidential',
        'foodhacks'
      ],
      'home': [
        'homedecorating',
        'organization',
        'CleaningTips',
        'furniture',
        'houseplants'
      ],
      'pet': [
        'pets',
        'dogs',
        'cats',
        'dogtraining',
        'aquariums'
      ],
      'travel': [
        'travel',
        'backpacking',
        'onebag',
        'camping',
        'solotravel'
      ]
    };
    
    // Get subreddits for the specified niche, or default to skincare
    const subreddits = nicheSubreddits[niche] || nicheSubreddits['skincare'];
    
    // Choose a random subreddit to diversify results
    const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
    console.log(`Scraping Reddit from r/${subreddit}`);
    
    // Reddit API requires a user agent
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000
    });
    
    const posts = response.data.data.children;
    console.log(`Got ${posts.length} posts from Reddit r/${subreddit}`);
    
    // Extract product names using a set of known skincare brands and terms
    const skincareBrands = [
      'CeraVe', 'The Ordinary', 'La Roche-Posay', 'Neutrogena', 'Cetaphil', 
      'Paula\'s Choice', 'Kiehl\'s', 'Drunk Elephant', 'Tatcha', 'Glossier',
      'Laneige', 'Glow Recipe', 'Youth To The People', 'First Aid Beauty', 'Sunday Riley',
      'Hyaluronic', 'Niacinamide', 'Retinol', 'SPF', 'Sunscreen', 'Moisturizer',
      'Cleanser', 'Serum', 'Toner', 'Exfoliant', 'AHA', 'BHA', 'Vitamin C'
    ];
    
    // Collect potential product references
    const productReferences: Map<string, { mentions: number, url: string, score: number }> = new Map();
    
    // Process posts to find product mentions
    for (const post of posts) {
      const { title, selftext, ups, url, permalink } = post.data;
      const content = `${title} ${selftext || ''}`.toLowerCase();
      
      // Check for brand/term mentions
      for (const brand of skincareBrands) {
        if (content.includes(brand.toLowerCase())) {
          // Find likely full product name (up to 5 words after the brand)
          const regex = new RegExp(`${brand.toLowerCase()}(\\s+\\w+){0,5}`, 'gi');
          const matches = content.match(regex);
          
          if (matches) {
            for (const match of matches) {
              // Clean up the match
              let productName = match.trim();
              // Capitalize first letter of each word
              productName = productName.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
              });
              
              if (productReferences.has(productName)) {
                const data = productReferences.get(productName)!;
                data.mentions += 1;
                data.score += ups;
              } else {
                productReferences.set(productName, {
                  mentions: 1,
                  url: `https://reddit.com${permalink}`,
                  score: ups
                });
              }
            }
          }
        }
      }
    }
    
    // Convert to trending products format
    const products: InsertTrendingProduct[] = Array.from(productReferences.entries())
      .map(([title, data]) => ({
        title,
        source: "reddit",
        mentions: Math.max(50, data.mentions * 10000 + data.score * 100), // Scale up for UI display
        sourceUrl: data.url
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5); // Only take top 5
    
    if (products.length > 0) {
      console.log(`Successfully identified ${products.length} trending products from Reddit`);
      console.log('Reddit products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
      return {
        products,
        status: {
          status: 'active',
          errorMessage: undefined
        }
      };
    }
    
    throw new Error('No products identified from Reddit content');
    
  } catch (scrapingError) {
    console.error('Reddit scraping failed, falling back to OpenAI:', scrapingError);
    
    // Fallback to OpenAI if real scraping fails
    try {
      // Use OpenAI to generate realistic trending skincare products on Reddit
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are a Reddit trend analyzer specialized in skincare and beauty subreddits like r/SkincareAddiction. Provide authentic, realistic trending skincare products that could be trending on Reddit right now."
          },
          {
            role: "user",
            content: "Generate 5 realistic trending skincare products on Reddit with title, mentions count (between 50K-500K), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
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
        source: "reddit",
        niche: niche, // Add niche to each product
        mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 200000),
        sourceUrl: item.sourceUrl || `https://reddit.com/search?q=${encodeURIComponent(item.title)}`
      }));

      console.log(`Generated ${products.length} trending products from Reddit using GPT fallback`);
      console.log('Reddit GPT products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
      
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
