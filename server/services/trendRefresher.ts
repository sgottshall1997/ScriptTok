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
 * Refresh trending products using scraper outputs and OpenAI
 */
async function refreshTrendingProducts() {
  try {
    console.log('Refreshing trending products...');
    
    // Get current scraper outputs
    const scraperResults = await getAllTrendingProducts();
    
    // Clear existing trending products
    await storage.clearTrendingProducts();

    // If we have scraper results, save them directly
    if (scraperResults.products.length > 0) {
      // Save each product from scrapers
      for (const product of scraperResults.products) {
        await storage.saveTrendingProduct(product);
      }
      
      // If we need more products to reach a minimum, generate some with OpenAI
      if (scraperResults.products.length < 5) {
        const additionalProducts = await generateTrendingProductsWithAI(scraperResults);
        for (const product of additionalProducts) {
          await storage.saveTrendingProduct(product);
        }
      }
    } else {
      // No scraper results, generate everything with OpenAI
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

// Initial refresh of trending products
refreshTrendingProducts();