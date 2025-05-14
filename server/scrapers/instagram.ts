import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { openai } from '../services/openai';
import { ScraperReturn } from './index';
import { ScraperStatusType } from '@shared/constants';

// Instagram trending products scraper
export async function getInstagramTrending(): Promise<ScraperReturn> {
  // First try real Instagram data
  try {
    // Define popular skincare hashtags to search for
    const skincareTags = [
      'skincare',
      'skincareproducts', 
      'skincareroutine',
      'beautytips',
      'glowingskin',
      'skinessentials'
    ];
    
    // Choose a random tag to search
    const selectedTag = skincareTags[Math.floor(Math.random() * skincareTags.length)];
    console.log(`Scraping Instagram for tag: #${selectedTag}`);
    
    // Fetch Instagram explore page for this hashtag
    const response = await axios.get(`https://www.instagram.com/explore/tags/${selectedTag}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // We need to extract JavaScript data that contains post information
    // This is challenging as Instagram heavily obfuscates its markup and relies on JS for rendering
    // Look for shared_data or initial state JSON in script tags
    
    let instagramData: any = null;
    $('script').each((i, script) => {
      const scriptContent = $(script).html() || '';
      
      // Look for a script that contains shared_data initialization
      if (scriptContent.includes('window._sharedData =')) {
        try {
          const jsonText = scriptContent.replace('window._sharedData =', '').replace(/;$/, '');
          instagramData = JSON.parse(jsonText.trim());
          console.log('Found Instagram shared data');
        } catch (e) {
          console.error('Error parsing Instagram shared data JSON:', e);
        }
      }
    });
    
    // If we found Instagram data, extract trending products
    if (instagramData && 
        instagramData.entry_data && 
        instagramData.entry_data.TagPage && 
        instagramData.entry_data.TagPage[0]?.graphql?.hashtag?.edge_hashtag_to_media) {
      
      const posts = instagramData.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges || [];
      console.log(`Found ${posts.length} Instagram posts`);
      
      // Extract captions and process for product mentions
      const skincareBrands = [
        'CeraVe', 'The Ordinary', 'La Roche-Posay', 'Neutrogena', 'Cetaphil', 
        'Paula\'s Choice', 'Kiehl\'s', 'Drunk Elephant', 'Tatcha', 'Glossier',
        'Laneige', 'Glow Recipe', 'Youth To The People', 'First Aid Beauty', 'Sunday Riley',
        'COSRX', 'SK-II', 'Supergoop', 'Dermalogica', 'Fresh', 'Clinique',
        'Hyaluronic', 'Niacinamide', 'Retinol', 'SPF', 'Sunscreen', 'Moisturizer',
        'Cleanser', 'Serum', 'Toner', 'Exfoliant', 'AHA', 'BHA', 'Vitamin C'
      ];
      
      // Process captions to find product mentions
      const productMentions: Map<string, { mentions: number, url: string, likes: number }> = new Map();
      
      for (const post of posts) {
        try {
          const caption = post.node.edge_media_to_caption?.edges[0]?.node?.text || '';
          const likes = post.node.edge_liked_by?.count || 0;
          const shortcode = post.node.shortcode;
          const postUrl = `https://www.instagram.com/p/${shortcode}/`;
          
          // Check for brand mentions
          for (const brand of skincareBrands) {
            if (caption.toLowerCase().includes(brand.toLowerCase())) {
              // Try to find product name pattern: brand + product type
              const regex = new RegExp(`${brand.toLowerCase()}(\\s+\\w+){0,5}`, 'gi');
              const matches = caption.match(regex);
              
              if (matches) {
                for (const match of matches) {
                  // Clean and normalize the product name
                  let productName = match.trim();
                  productName = productName.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                  });
                  
                  // Update product mentions count
                  if (productMentions.has(productName)) {
                    const data = productMentions.get(productName)!;
                    data.mentions += 1;
                    data.likes += likes;
                  } else {
                    productMentions.set(productName, {
                      mentions: 1,
                      url: postUrl,
                      likes: likes
                    });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Error processing Instagram post:', err);
        }
      }
      
      // Convert to trending products format
      const products: InsertTrendingProduct[] = Array.from(productMentions.entries())
        .map(([title, data]) => ({
          title,
          source: "instagram",
          mentions: Math.max(300000, data.mentions * 100000 + data.likes * 1000), // Scale for UI display
          sourceUrl: data.url
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 5); // Top 5
      
      if (products.length > 0) {
        console.log(`Successfully identified ${products.length} trending products from Instagram`);
        console.log('Instagram products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
        return {
          products,
          status: {
            status: 'active',
            errorMessage: undefined
          }
        };
      }
    }
    
    throw new Error('No Instagram product data found or could not parse shared data');
    
  } catch (scrapingError) {
    console.error('Instagram scraping failed, falling back to OpenAI:', scrapingError);
    
    // Fallback to OpenAI if real scraping fails
    try {
      // Use OpenAI to generate realistic trending skincare products on Instagram
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are an Instagram trend analyzer specialized in skincare and beauty products. Provide authentic, realistic trending skincare products that could be trending on Instagram right now."
          },
          {
            role: "user",
            content: "Generate 5 realistic trending skincare products on Instagram with title, mentions count (between 300K-1.5M), and a mock source URL. Only return JSON in this format: [{title, mentions, sourceUrl}]"
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
        source: "instagram",
        mentions: typeof item.mentions === 'string' ? parseInt(item.mentions.replace(/[^0-9]/g, "")) : (item.mentions || 800000),
        sourceUrl: item.sourceUrl || `https://instagram.com/explore/tags/${encodeURIComponent(item.title)}`
      }));

      console.log(`Generated ${products.length} trending products from Instagram using GPT fallback`);
      console.log('Instagram GPT products:', products.map(p => `"${p.title}" (${p.mentions} mentions)`).join(', '));
      
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
