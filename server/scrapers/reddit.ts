import { InsertTrendingProduct } from '@shared/schema';
import axios from 'axios';
import { ScraperReturn } from './index';

// Reddit trending products scraper using real Reddit API
export async function getRedditTrending(niche: string = 'skincare'): Promise<ScraperReturn> {
  const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
  const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return {
      products: [],
      status: {
        status: 'error',
        errorMessage: 'Reddit API credentials not configured'
      }
    };
  }

  try {
    // Get OAuth token for Reddit API
    const authResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'GlowBot/1.0.0'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Define subreddits for each niche
    const nicheSubreddits: Record<string, string[]> = {
      'skincare': ['SkincareAddiction', 'AsianBeauty', 'BeautyBoxes', 'Sephora'],
      'tech': ['gadgets', 'technology', 'BuyItForLife', 'reviews'],
      'fashion': ['femalefashionadvice', 'malefashionadvice', 'streetwear', 'frugalfemalefashion'],
      'fitness': ['fitness', 'homegym', 'bodyweightfitness', 'xxfitness'],
      'food': ['MealPrepSunday', 'Cooking', 'AskCulinary', 'KitchenConfidential'],
      'pet': ['dogs', 'cats', 'pets', 'puppy101'],
      'travel': ['travel', 'solotravel', 'backpacking', 'digitalnomad']
    };

    const subreddits = nicheSubreddits[niche] || nicheSubreddits['skincare'];
    const products: InsertTrendingProduct[] = [];

    // Search each subreddit for trending posts
    for (const subreddit of subreddits.slice(0, 2)) { // Limit to 2 subreddits to avoid rate limits
      try {
        const postsResponse = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'GlowBot/1.0.0'
          },
          params: {
            limit: 25,
            t: 'week' // Posts from this week
          }
        });

        const posts = postsResponse.data.data?.children || [];

        posts.forEach((post: any) => {
          const postData = post.data;
          const title = postData.title;
          const score = postData.score || 0;
          const url = `https://reddit.com${postData.permalink}`;

          // Extract product mentions from titles
          const productPatterns = [
            /(?:bought|using|love|recommend|review)\s+([A-Z][a-zA-Z\s&]+(?:Pro|Max|Ultra|Plus|Mini|Air|One)?)/gi,
            /([A-Z][a-zA-Z\s&]+)\s+(?:review|haul|recommendation)/gi,
            /(?:HG|holy grail)\s*:?\s*([A-Z][a-zA-Z\s&]+)/gi
          ];

          productPatterns.forEach(pattern => {
            const matches = [...title.matchAll(pattern)];
            matches.forEach(match => {
              const productName = match[1].trim();
              if (productName.length > 3 && productName.length < 50 && score > 10) {
                products.push({
                  title: productName,
                  source: "reddit",
                  niche: niche,
                  mentions: score, // Use Reddit score as mention count
                  sourceUrl: url
                });
              }
            });
          });

          // Also check for product mentions in text posts
          if (postData.selftext && score > 50) {
            const text = postData.selftext;
            const brandPattern = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]*)*)\s+(?:serum|cream|cleanser|moisturizer|sunscreen|foundation|concealer|lipstick|mascara|eyeshadow|powder|primer|toner|oil|balm|gel|foam|lotion|spray|mist|essence|treatment|mask|scrub|exfoliant|peel|retinol|vitamin\s+c|niacinamide|hyaluronic\s+acid|salicylic\s+acid|glycolic\s+acid|lactic\s+acid|peptides|ceramides)/gi;
            
            const textMatches = [...text.matchAll(brandPattern)];
            textMatches.slice(0, 2).forEach(match => { // Limit to avoid spam
              const productName = match[0].trim();
              if (productName.length > 5) {
                products.push({
                  title: productName,
                  source: "reddit",
                  niche: niche,
                  mentions: Math.floor(score / 2), // Lower weight for text mentions
                  sourceUrl: url
                });
              }
            });
          }
        });
      } catch (subredditError: any) {
        console.error(`Error fetching from r/${subreddit}:`, subredditError.message);
      }
    }

    // Remove duplicates and sort by score
    const uniqueProducts = products
      .filter((product, index, self) => 
        index === self.findIndex(p => p.title.toLowerCase() === product.title.toLowerCase())
      )
      .sort((a, b) => (b.mentions || 0) - (a.mentions || 0))
      .slice(0, 8);

    console.log(`✅ Reddit API: Found ${uniqueProducts.length} products from ${subreddits.length} subreddits`);
    
    return {
      products: uniqueProducts,
      status: {
        status: 'active',
        errorMessage: undefined
      }
    };

  } catch (error: any) {
    console.error('Reddit API error:', error);
    return {
      products: [],
      status: {
        status: 'error',
        errorMessage: `Reddit API failed: ${error.message}`
      }
    };
  }
}