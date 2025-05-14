/**
 * Service to periodically refresh trending products using OpenAI
 * This keeps trending products dynamic while using the scraper outputs as context
 */

import { openai } from './openai';
import { storage } from '../storage';
import { ScraperPlatform, ScraperStatusType, SCRAPER_PLATFORMS } from '@shared/constants';
import { InsertTrendingProduct } from '@shared/schema';
import { getAllTrendingProducts } from '../scrapers';

// Cache for the last generated products
let lastRefreshTime = 0;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

/**
 * Get trending products from scrapers and OpenAI
 * Will refresh trending products at specified intervals
 */
export async function getRefreshedTrendingProducts() {
  const now = Date.now();
  // Only refresh if enough time has passed
  if (now - lastRefreshTime > REFRESH_INTERVAL) {
    await refreshTrendingProducts();
    lastRefreshTime = now;
  }
  
  // Return current products from storage
  return storage.getTrendingProducts();
}

/**
 * Generate trending products using OpenAI with scraper results as context
 */
async function generateTrendingProductsWithAI(scraperResults?: any) {
  try {
    // Create context from scraper results if available
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

Based on these real results, please suggest 5-8 additional trending skincare/beauty products that would likely be trending now. These should be different from the ones already listed but realistic in nature. Include some from different price points and categories.
`;
    } else {
      scraperContext = `Please suggest 10 realistic trending skincare and beauty products that would likely be trending currently. Include a diverse mix of product types, brands, and price points.`;
    }
    
    // Generate new trending products with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a beauty industry trend analyst with real-time knowledge of trending skincare and beauty products. Provide realistic trending product suggestions that would appear on social media platforms. Return your response in JSON format."
        },
        {
          role: "user",
          content: scraperContext + "\n\nFormat your response as a JSON object with a 'products' array. Each product should have a 'title', 'source', and optionally 'mentions'. For example: { \"products\": [{ \"title\": \"Product Name\", \"source\": \"tiktok\", \"mentions\": 250000 }] }"
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
    
    console.log(`OpenAI generated ${trendingProducts.length} trending products`);
    
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
        else if (source === 'reddit') sourceUrl = 'https://reddit.com/r/SkincareAddiction';
        else if (source === 'amazon') sourceUrl = `https://amazon.com/s?k=${encodeURIComponent(title)}`;
        else if (source === 'google-trends') sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(title)}`;
        
        results.push({
          title,
          source,
          mentions,
          sourceUrl
        });
      } catch (productError) {
        console.error('Error processing product from OpenAI:', productError);
      }
    });
    
    console.log(`Successfully processed ${results.length} products from OpenAI`);
    
    return results;
  } catch (error) {
    console.error('Error generating trending products with AI:', error);
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
          content: "You are a beauty industry trend expert that can identify which trending beauty and skincare products are most significant. Analyze the provided list of trending products from various social platforms and select the 5 most significant ones based on popularity, relevance, and diversity of product types. Return your selection in JSON format."
        },
        {
          role: "user",
          content: `Here are all the scraped trending beauty and skincare products from various platforms:\n\n${productsContext}\n\nSelect the 5 most significant trending products from this list. Consider popularity (mentions), diversity of product types, and ensure products from different sources (TikTok, Instagram, YouTube, etc.) are represented if possible.\n\nReturn your response as a JSON object with a 'selected_products' array. Each product should include 'title', 'source', 'mentions' (estimate if not provided), and 'reason' (brief explanation of why you selected it). For example: { \"selected_products\": [{ \"title\": \"Product Name\", \"source\": \"tiktok\", \"mentions\": 250000, \"reason\": \"Popular for its viral before/after results\" }] }`
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
 */
async function refreshTrendingProducts() {
  try {
    console.log('Refreshing trending products...');
    
    // Get current scraper outputs
    const scraperResults = await getAllTrendingProducts();
    
    // Clear existing trending products
    await storage.clearTrendingProducts();

    // Prepare a list of all scraped products with their sources
    let allScrapedProducts = [...scraperResults.products];
    
    // If we have at least some scraper results, analyze them with OpenAI
    if (allScrapedProducts.length > 0) {
      console.log(`Found ${allScrapedProducts.length} products from scrapers for analysis`);
      
      // Find the best trending products using OpenAI to analyze the scraped data
      const curatedProducts = await curateTrendingProductsWithAI(allScrapedProducts);
      
      // Save the curated products
      for (const product of curatedProducts) {
        await storage.saveTrendingProduct(product);
      }
      
      // If we need more products to reach a minimum, generate them with OpenAI
      if (curatedProducts.length < 5) {
        console.log(`Need ${5 - curatedProducts.length} more products to reach minimum`);
        const additionalProducts = await generateTrendingProductsWithAI(scraperResults);
        for (const product of additionalProducts.slice(0, 5 - curatedProducts.length)) {
          await storage.saveTrendingProduct(product);
        }
      }
    } else {
      // No scraper results, generate everything with OpenAI
      console.log('No scraper results, generating all products with OpenAI');
      const generatedProducts = await generateTrendingProductsWithAI();
      for (const product of generatedProducts) {
        await storage.saveTrendingProduct(product);
      }
    }
    
    // Update scraper statuses
    for (const platform of scraperResults.platforms) {
      await storage.updateScraperStatus(
        platform.name,
        platform.status,
        platform.errorMessage
      );
    }
    
    console.log('Trending products refreshed successfully');
  } catch (error) {
    console.error('Error refreshing trending products:', error);
  }
}

// Initial refresh of trending products
refreshTrendingProducts();