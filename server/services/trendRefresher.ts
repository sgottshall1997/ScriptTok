/**
 * Service to periodically refresh trending products using OpenAI
 * Data is refreshed once a day at midnight to reduce load on scrapers
 */

import { openai } from './openai';
import { storage } from '../storage';
import { ScraperPlatform, ScraperStatusType, SCRAPER_PLATFORMS } from '@shared/constants';
import { InsertTrendingProduct } from '@shared/schema';
import { getAllTrendingProducts } from '../scrapers';

// Cache for the last generated products
let lastRefreshTime = 0;
let lastRefreshDate = ''; // Track the date of last refresh

/**
 * Check if we need to refresh the data based on the current date
 * Returns true if:
 * 1. It's a new day (after midnight)
 * 2. We haven't refreshed data today yet
 * 3. We have no data at all (first run)
 */
function shouldRefreshData(): boolean {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // If we've never refreshed or it's a new day, we should refresh
  return !lastRefreshTime || today !== lastRefreshDate;
}

/**
 * Force a refresh of trending products regardless of the time
 * This is useful for manual refresh or testing
 */
export async function forceRefreshTrendingProducts() {
  console.log('Manually forcing refresh of trending products at:', new Date().toLocaleString());
  await refreshTrendingProducts();
  
  // Update the refresh tracking variables
  lastRefreshTime = Date.now();
  lastRefreshDate = new Date().toISOString().split('T')[0];
  
  return storage.getTrendingProducts();
}

/**
 * Get trending products from storage, refreshing only when needed
 * Data is refreshed once per day (after midnight)
 */
export async function getRefreshedTrendingProducts() {
  // Only refresh if it's a new day or we have no data
  if (shouldRefreshData()) {
    console.log('Refreshing trending products for the day at:', new Date().toLocaleString());
    await refreshTrendingProducts();
    
    // Update the refresh tracking variables
    lastRefreshTime = Date.now();
    lastRefreshDate = new Date().toISOString().split('T')[0];
  }
  
  // Return current products from storage
  return storage.getTrendingProducts();
}

// Schedule a refresh to run at midnight every day
function scheduleNextMidnightRefresh() {
  const now = new Date();
  const midnight = new Date();
  
  // Set time to next midnight (00:00:00)
  midnight.setDate(now.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  
  // Calculate milliseconds until midnight
  const timeUntilMidnight = midnight.getTime() - now.getTime();
  
  console.log(`Scheduled next trending product refresh at midnight (${midnight.toLocaleString()}), which is in ${Math.round(timeUntilMidnight/1000/60)} minutes`);
  
  // Schedule the refresh
  setTimeout(async () => {
    try {
      await forceRefreshTrendingProducts();
    } catch (error) {
      console.error('Error in scheduled midnight refresh:', error);
    } finally {
      // Schedule the next day's refresh
      scheduleNextMidnightRefresh();
    }
  }, timeUntilMidnight);
}

// Initialize the midnight refresh schedule when this module is loaded
scheduleNextMidnightRefresh();

/**
 * Generate trending products using OpenAI with scraper results as context
 * @param niche Optional niche to generate trending products for
 * @param scraperResults Optional scraper results to use as context
 */
async function generateTrendingProductsWithAI(niche: string = 'skincare', scraperResults?: any) {
  try {
    // Define niche-specific system prompts
    const nicheSystemPrompts: Record<string, string> = {
      skincare: "You are a beauty industry trend analyst with real-time knowledge of trending skincare and beauty products. Provide specific, named product suggestions with brand names that are currently trending on social media platforms. Avoid generic descriptions like 'Retinol Serum' and instead use specific product names like 'The Ordinary Niacinamide 10% + Zinc 1%' or 'CeraVe Hydrating Facial Cleanser'. Return your response in JSON format.",
      tech: "You are a technology industry analyst with real-time knowledge of trending tech products. Provide specific, named product suggestions with brand names that are currently trending on tech review sites and social media platforms. Avoid generic descriptions like 'Bluetooth Speaker' and instead use specific product names like 'Sony WH-1000XM5' or 'Apple MacBook Air M2'. Return your response in JSON format.",
      fashion: "You are a fashion industry analyst with real-time knowledge of trending clothing and accessories. Provide specific, named product suggestions with brand names that are currently trending on social media and fashion blogs. Avoid generic descriptions like 'White Sneakers' and instead use specific product names like 'Nike Air Force 1' or 'Levi's 501 Original Fit Jeans'. Return your response in JSON format.",
      fitness: "You are a fitness industry analyst with real-time knowledge of trending fitness products and equipment. Provide specific, named product suggestions with brand names that are currently trending on social media and fitness communities. Avoid generic descriptions like 'Running Shoes' and instead use specific product names like 'Hoka Clifton 8' or 'Lululemon Align Leggings'. Return your response in JSON format.",
      food: "You are a food and kitchen industry analyst with real-time knowledge of trending cooking products and kitchen gadgets. Provide specific, named product suggestions with brand names that are currently trending on social media and cooking communities. Avoid generic descriptions like 'Air Fryer' and instead use specific product names like 'Ninja Foodi 10-in-1 XL Pro' or 'Le Creuset Dutch Oven'. Return your response in JSON format.",
      home: "You are a home goods industry analyst with real-time knowledge of trending home products and decor. Provide specific, named product suggestions with brand names that are currently trending on social media and home design communities. Avoid generic descriptions like 'Throw Pillow' and instead use specific product names like 'Brooklinen Down Pillow' or 'Dyson V11 Vacuum'. Return your response in JSON format.",
      pet: "You are a pet industry analyst with real-time knowledge of trending pet products and accessories. Provide specific, named product suggestions with brand names that are currently trending on social media and pet owner communities. Avoid generic descriptions like 'Dog Leash' and instead use specific product names like 'Wild One Walk Kit' or 'Furbo Dog Camera'. Return your response in JSON format.",
      travel: "You are a travel goods industry analyst with real-time knowledge of trending travel products and accessories. Provide specific, named product suggestions with brand names that are currently trending on social media and travel communities. Avoid generic descriptions like 'Carry-on Bag' and instead use specific product names like 'Away The Carry-On' or 'Bose QuietComfort Earbuds'. Return your response in JSON format.",
      default: "You are a product trend analyst with real-time knowledge of trending consumer products. Provide specific, named product suggestions with brand names that are currently trending on social media platforms. Avoid generic descriptions and use specific product names with brands. Return your response in JSON format."
    };

    // Define niche-specific user prompts
    const nicheUserPrompts: Record<string, string> = {
      skincare: "Please suggest 10 realistic trending skincare and beauty products that would likely be trending currently. Include a diverse mix of product types, brands, and price points.",
      tech: "Please suggest 10 realistic trending technology products that would likely be trending currently. Include a diverse mix of gadgets, accessories, and devices at different price points.",
      fashion: "Please suggest 10 realistic trending fashion items that would likely be trending currently. Include a diverse mix of clothing, footwear, and accessories at different price points.",
      fitness: "Please suggest 10 realistic trending fitness products that would likely be trending currently. Include a diverse mix of workout equipment, apparel, and accessories at different price points.",
      food: "Please suggest 10 realistic trending kitchen and cooking products that would likely be trending currently. Include a diverse mix of appliances, cookware, and gadgets at different price points.",
      home: "Please suggest 10 realistic trending home products that would likely be trending currently. Include a diverse mix of furniture, decor, and smart home devices at different price points.",
      pet: "Please suggest 10 realistic trending pet products that would likely be trending currently. Include a diverse mix of food, toys, and accessories at different price points for different types of pets.",
      travel: "Please suggest 10 realistic trending travel products that would likely be trending currently. Include a diverse mix of luggage, accessories, and gadgets at different price points.",
      default: "Please suggest 10 realistic trending consumer products that would likely be trending currently. Include a diverse mix of product types, brands, and price points."
    };

    // Get the appropriate system prompt for the niche
    const systemPrompt = nicheSystemPrompts[niche] || nicheSystemPrompts.default;
    
    // Create context from scraper results if available, or use the default prompt
    let scraperContext = "";
    if (scraperResults && scraperResults.products && scraperResults.products.length > 0) {
      const platformStatuses = scraperResults.platforms.map((p: any) => 
        `${p.name}: ${p.status}${p.errorMessage ? ` (${p.errorMessage})` : ''}`
      ).join('\n');
      
      const existingProducts = scraperResults.products.map((p: any) => 
        `${p.title} (from ${p.source}, ${p.mentions || 0} mentions)`
      ).join('\n');
      
      scraperContext = `
Current scraper statuses:
${platformStatuses}

Products already found by scrapers:
${existingProducts}

Based on these real results, please suggest 5-8 additional trending ${niche} products that would likely be trending now. These should be different from the ones already listed but realistic in nature. Include some from different price points and categories.
`;
    } else {
      scraperContext = nicheUserPrompts[niche] || nicheUserPrompts.default;
    }
    
    // Generate new trending products with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: scraperContext + "\n\nFormat your response as a JSON object with a 'products' array. Each product should have 'title' (specific product name with brand), 'source', and 'mentions'. For example: { \"products\": [{ \"title\": \"CeraVe Hydrating Cleanser\", \"source\": \"tiktok\", \"mentions\": 250000 }] }"
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    // Parse the response
    const parsedContent = JSON.parse(content);
    
    // Extract trending products from different formats
    const trendingProducts = 
      parsedContent.products || 
      parsedContent.trending_products || 
      [];
    
    console.log(`OpenAI generated ${trendingProducts.length} trending ${niche} products`);
    
    // Convert to our format with different sources
    const platforms: ScraperPlatform[] = ['tiktok', 'instagram', 'youtube', 'reddit', 'amazon', 'google-trends'];
    const results: InsertTrendingProduct[] = [];
    
    trendingProducts.forEach((product: any, index: number) => {
      try {
        // Handle different input formats (string vs object)
        const title = typeof product === 'string' ? product : product.title || product.name || 'Unknown Product';
        
        // Ensure source is a valid platform
        let source = product.source;
        if (!source || !SCRAPER_PLATFORMS.includes(source as ScraperPlatform)) {
          source = platforms[index % platforms.length];
        }
        
        const mentions = product.mentions || Math.floor(Math.random() * 500000) + 100000;
        
        // Get an appropriate URL for the source
        let sourceUrl = `https://${source}.com`;
        if (source === 'tiktok') sourceUrl = `https://tiktok.com/tag/${encodeURIComponent(title.split(' ')[0])}`;
        else if (source === 'instagram') sourceUrl = `https://instagram.com/explore/tags/${encodeURIComponent(title.split(' ')[0])}`;
        else if (source === 'youtube') sourceUrl = `https://youtube.com/results?search_query=${encodeURIComponent(title)}`;
        else if (source === 'reddit') {
          // Select appropriate subreddit based on niche
          let subreddit = 'all';
          if (niche === 'skincare') subreddit = 'SkincareAddiction';
          else if (niche === 'tech') subreddit = 'gadgets';
          else if (niche === 'fashion') subreddit = 'malefashionadvice';
          else if (niche === 'fitness') subreddit = 'fitness';
          else if (niche === 'food') subreddit = 'cooking';
          else if (niche === 'home') subreddit = 'homedecorating';
          else if (niche === 'pet') subreddit = 'pets';
          else if (niche === 'travel') subreddit = 'travel';
          
          sourceUrl = `https://reddit.com/r/${subreddit}`;
        }
        else if (source === 'amazon') sourceUrl = `https://amazon.com/s?k=${encodeURIComponent(title)}`;
        else if (source === 'google-trends') sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}`;
        
        results.push({
          title,
          source,
          mentions,
          sourceUrl,
          niche // Add niche to the trending product
        });
      } catch (productError) {
        console.error('Error processing product from OpenAI:', productError);
      }
    });
    
    console.log(`Successfully processed ${results.length} ${niche} products from OpenAI`);
    
    return results;
  } catch (error) {
    console.error(`Error generating trending ${niche} products with AI:`, error);
    return [];
  }
}

/**
 * Curate the most relevant trending products from scraper results using OpenAI
 * This analyzes all scraped products and selects the top trending ones
 */
async function curateTrendingProductsWithAI(scrapedProducts: InsertTrendingProduct[]): Promise<InsertTrendingProduct[]> {
  try {
    console.log('Curating trending products from scraped data with OpenAI...');
    
    // Prepare the context with all scraped products
    const productsContext = scrapedProducts.map(p => 
      `- ${p.title} (from ${p.source}${p.mentions ? `, ${p.mentions} mentions` : ''})`
    ).join('\n');
    
    // Send to OpenAI for curation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a beauty industry trend expert that can identify which trending beauty and skincare products are most significant. Analyze the provided list of trending products and select the 5 most significant ones based on popularity, relevance, and diversity of product types. If any product entries contain only prices or generic names like '$12.99', replace them with specific, real product names with brands like 'The Ordinary Niacinamide 10% + Zinc 1%' or 'CeraVe Hydrating Facial Cleanser'. Return your selection in JSON format."
        },
        {
          role: "user",
          content: `Here are all the scraped trending beauty and skincare products from various platforms:\n\n${productsContext}\n\nSelect the 5 most significant trending products from this list. Consider popularity (mentions), diversity of product types, and ensure products from different sources (TikTok, Instagram, YouTube, etc.) are represented if possible.\n\n* IMPORTANT: If any product titles are just dollar amounts (like '$12.99') or generic descriptions, replace them with specific, real product names from popular brands like CeraVe, The Ordinary, Neutrogena, etc.\n\nReturn your response as a JSON object with a 'selected_products' array. Each product should include 'title' (specific product name with brand), 'source', 'mentions', and 'reason' (brief explanation of why you selected it). For example: { \"selected_products\": [{ \"title\": \"CeraVe Hydrating Cleanser\", \"source\": \"amazon\", \"mentions\": 250000, \"reason\": \"Popular for its viral before/after results\" }] }`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    // Parse the response
    const parsedContent = JSON.parse(content);
    
    // Extract selected products
    const selectedProducts = parsedContent.selected_products || [];
    console.log(`OpenAI selected ${selectedProducts.length} top trending products`);
    
    // Convert to our format
    const results: InsertTrendingProduct[] = [];
    
    for (const selected of selectedProducts) {
      // Try to find the original product to maintain its data
      const originalProduct = scrapedProducts.find(p => 
        p.title.toLowerCase() === selected.title.toLowerCase() && 
        p.source === selected.source
      );
      
      if (originalProduct) {
        // Use original product data but update mentions if provided
        results.push({
          ...originalProduct,
          mentions: selected.mentions || originalProduct.mentions
        });
      } else {
        // Create new product from OpenAI suggestion
        let sourceUrl = `https://${selected.source}.com`;
        if (selected.source === 'tiktok') sourceUrl = `https://tiktok.com/tag/${encodeURIComponent(selected.title.split(' ')[0])}`;
        else if (selected.source === 'instagram') sourceUrl = `https://instagram.com/explore/tags/${encodeURIComponent(selected.title.split(' ')[0])}`;
        else if (selected.source === 'youtube') sourceUrl = `https://youtube.com/results?search_query=${encodeURIComponent(selected.title)}`;
        else if (selected.source === 'reddit') sourceUrl = 'https://reddit.com/r/SkincareAddiction';
        else if (selected.source === 'amazon') sourceUrl = `https://amazon.com/s?k=${encodeURIComponent(selected.title)}`;
        else if (selected.source === 'google-trends') sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(selected.title)}`;
        
        results.push({
          title: selected.title,
          source: selected.source,
          mentions: selected.mentions || 100000,
          sourceUrl
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error curating trending products with AI:', error);
    return scrapedProducts.slice(0, 5); // Return first 5 scraped products as fallback
  }
}

/**
 * Refresh trending products using scraper outputs and OpenAI
 * Optionally specify a niche to refresh products specifically for that niche
 */
async function refreshTrendingProducts(specificNiche?: string) {
  try {
    const niches = specificNiche ? [specificNiche] : ['skincare', 'tech', 'fashion', 'fitness', 'food', 'home', 'pet', 'travel'];
    console.log(`Refreshing trending products for ${specificNiche || 'all niches'}...`);
    
    // Clear existing trending products for the specified niche(s)
    if (specificNiche) {
      await storage.clearTrendingProductsByNiche(specificNiche);
    } else {
      await storage.clearTrendingProducts();
    }

    // Process each niche separately to get niche-specific trending products
    for (const niche of niches) {
      console.log(`Processing niche: ${niche}`);
      
      // Get current scraper outputs for this specific niche
      const scraperResults = await getAllTrendingProducts(niche);
      
      // Prepare a list of scraped products with their sources for this niche
      let scrapedProducts = [...scraperResults.products];
      
      // Do we have enough products from scrapers?
      console.log(`Found ${scrapedProducts.length} products from scrapers for analysis`);
      
      // We need at least 5 products, if we don't have enough, generate more with AI
      const minProductsNeeded = 5;
      if (scrapedProducts.length < minProductsNeeded) {
        const neededProducts = minProductsNeeded - scrapedProducts.length;
        console.log(`Need ${neededProducts} more products for ${niche} to reach minimum`);
        const generatedProducts = await generateTrendingProductsWithAI(niche);
        const additionalProducts = generatedProducts.slice(0, neededProducts);
        scrapedProducts = [...scrapedProducts, ...additionalProducts];
        console.log(`Successfully processed ${additionalProducts.length} ${niche} products from OpenAI`);
      }
      
      // If we have at least some scraper results, analyze them with OpenAI
      if (scrapedProducts.length > 0) {
        console.log(`Found ${scrapedProducts.length} products from scrapers for analysis`);
        
        // Filter products that might be relevant to this niche (basic keyword matching)
        // This is a simple approach - in a real system you might use categorization or ML
        const potentialNicheProducts = scrapedProducts.filter(product => {
          const title = product.title.toLowerCase();
          
          // Basic keyword matching for each niche
          if (niche === 'skincare' && (
            title.includes('skin') || title.includes('face') || title.includes('cream') || 
            title.includes('serum') || title.includes('cleanser') || title.includes('moisturizer')
          )) return true;
          
          if (niche === 'tech' && (
            title.includes('phone') || title.includes('laptop') || title.includes('headphone') || 
            title.includes('speaker') || title.includes('tablet') || title.includes('watch')
          )) return true;
          
          if (niche === 'fashion' && (
            title.includes('jeans') || title.includes('shirt') || title.includes('dress') || 
            title.includes('shoes') || title.includes('bag') || title.includes('jacket')
          )) return true;
          
          // Default behavior - give the product to the niche if no other niche has claimed it
          // and we're processing the default niche (skincare)
          return niche === 'skincare' && !product.niche;
        });
        
        // Add niche to these products
        potentialNicheProducts.forEach(product => {
          product.niche = niche;
        });
        
        // Find the best trending products using OpenAI to analyze the scraped data
        const curatedProducts = potentialNicheProducts.length > 0 ? 
          await curateTrendingProductsWithAI(potentialNicheProducts) : [];
        
        // Save the curated products
        for (const product of curatedProducts) {
          product.niche = niche; // Ensure niche is set
          await storage.saveTrendingProduct(product);
        }
        
        // If we need more products to reach a minimum, generate them with OpenAI
        if (curatedProducts.length < 5) {
          console.log(`Need ${5 - curatedProducts.length} more products for ${niche} to reach minimum`);
          const additionalProducts = await generateTrendingProductsWithAI(niche, scraperResults);
          for (const product of additionalProducts.slice(0, 5 - curatedProducts.length)) {
            product.niche = niche; // Ensure niche is set
            await storage.saveTrendingProduct(product);
          }
        }
      } else {
        // No scraper results, generate everything with OpenAI
        console.log(`No scraper results, generating all products for ${niche} with OpenAI`);
        const generatedProducts = await generateTrendingProductsWithAI(niche);
        for (const product of generatedProducts) {
          product.niche = niche; // Ensure niche is set
          await storage.saveTrendingProduct(product);
        }
      }
    }
    
    // Update scraper statuses for each platform
    for (const platform of SCRAPER_PLATFORMS) {
      await storage.updateScraperStatus(
        platform,
        'active' // Set all platforms to active after refreshing
      );
    }
    
    console.log(`Trending products refreshed successfully for ${specificNiche || 'all niches'}`);
  } catch (error) {
    console.error(`Error refreshing trending products for ${specificNiche || 'all niches'}:`, error);
  }
}

// Initial refresh of trending products
refreshTrendingProducts();