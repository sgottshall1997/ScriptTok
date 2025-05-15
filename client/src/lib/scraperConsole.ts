/**
 * Utility for displaying organized scraper health information in the browser console
 */
import { apiRequest } from "./queryClient";

type ScraperStatus = {
  name: string;
  status: string;
  lastCheck: string;
  lastSuccess?: string;
  errorMessage?: string;
  successCount: number;
  failureCount: number;
};

/**
 * Fetches and logs the status of all scrapers in a formatted console output
 */
export async function logScraperHealth() {
  try {
    const response = await apiRequest('GET', '/api/scraper-status');
    const scraperStatus: ScraperStatus[] = await response.json();
    
    // Group scrapers by status
    const activeScrapers = scraperStatus.filter(s => s.status === 'active');
    const errorScrapers = scraperStatus.filter(s => s.status === 'error');
    const warningScrapers = scraperStatus.filter(s => s.status === 'warning');
    const otherScrapers = scraperStatus.filter(s => 
      s.status !== 'active' && s.status !== 'error' && s.status !== 'warning'
    );
    
    // Clear console for better visibility
    console.clear();
    
    // Header styling
    const headerStyle = 'color: #fff; background: #333; padding: 4px 8px; border-radius: 4px; font-weight: bold;';
    const subheaderStyle = 'color: #fff; background: #555; padding: 2px 6px; border-radius: 4px; font-weight: bold;';
    
    // Status styling
    const statusStyles = {
      active: 'color: #00cc00; font-weight: bold;',
      error: 'color: #ff0000; font-weight: bold;',
      warning: 'color: #ffcc00; font-weight: bold;',
      default: 'color: #999999; font-weight: bold;'
    };
    
    // Main header
    console.log('%c🔍 GlowBot Scraper Health Monitor 🔍', headerStyle);
    console.log(`Last updated: ${new Date().toLocaleString()}`);
    console.log('-'.repeat(50));
    
    // Summary
    console.log('%cSummary:', subheaderStyle);
    console.log(`Total scrapers: ${scraperStatus.length}`);
    console.log(`%c✅ Active: ${activeScrapers.length}`, 'color: #00cc00');
    console.log(`%c⚠️ Warnings: ${warningScrapers.length}`, 'color: #ffcc00');
    console.log(`%c❌ Errors: ${errorScrapers.length}`, 'color: #ff0000');
    console.log('-'.repeat(50));
    
    // Active scrapers
    if (activeScrapers.length > 0) {
      console.log('%c✅ Active Scrapers:', subheaderStyle);
      activeScrapers.forEach(scraper => {
        const lastCheck = new Date(scraper.lastCheck).toLocaleString();
        console.log(`%c${scraper.name}%c - Last check: ${lastCheck} - Success: ${scraper.successCount}`, 
          statusStyles.active, 'color: inherit');
      });
      console.log('-'.repeat(50));
    }
    
    // Warning scrapers
    if (warningScrapers.length > 0) {
      console.log('%c⚠️ Warning Scrapers:', subheaderStyle);
      warningScrapers.forEach(scraper => {
        const lastCheck = new Date(scraper.lastCheck).toLocaleString();
        console.log(`%c${scraper.name}%c - Last check: ${lastCheck} - Message: ${scraper.errorMessage || 'No details'}`, 
          statusStyles.warning, 'color: inherit');
      });
      console.log('-'.repeat(50));
    }
    
    // Error scrapers
    if (errorScrapers.length > 0) {
      console.log('%c❌ Error Scrapers:', subheaderStyle);
      errorScrapers.forEach(scraper => {
        const lastCheck = new Date(scraper.lastCheck).toLocaleString();
        const lastSuccess = scraper.lastSuccess ? 
          new Date(scraper.lastSuccess).toLocaleString() : 'Never';
        
        console.log(`%c${scraper.name}%c - Last check: ${lastCheck}`, 
          statusStyles.error, 'color: inherit');
        console.log(`  Last success: ${lastSuccess}`);
        console.log(`  Error: ${scraper.errorMessage || 'Unknown error'}`);
      });
      console.log('-'.repeat(50));
    }
    
    // Other scrapers
    if (otherScrapers.length > 0) {
      console.log('%cOther Scrapers:', subheaderStyle);
      otherScrapers.forEach(scraper => {
        const lastCheck = scraper.lastCheck ? 
          new Date(scraper.lastCheck).toLocaleString() : 'Never';
        
        console.log(`%c${scraper.name}%c - Status: ${scraper.status} - Last check: ${lastCheck}`, 
          statusStyles.default, 'color: inherit');
      });
      console.log('-'.repeat(50));
    }
    
    // Footer message
    console.log('To refresh scraper status, call window.checkScraperHealth()');
    
  } catch (error) {
    console.error('Failed to fetch scraper health information:', error);
  }
}

/**
 * Fetches and displays a detailed breakdown of scraped trending products
 */
export async function logTrendingProducts() {
  try {
    const response = await apiRequest('GET', '/api/trending/products');
    const products = await response.json();
    
    // Group by source and niche
    const bySource: Record<string, any[]> = {};
    const byNiche: Record<string, any[]> = {};
    
    products.forEach((product: any) => {
      // Group by source
      if (!bySource[product.source]) {
        bySource[product.source] = [];
      }
      bySource[product.source].push(product);
      
      // Group by niche
      if (!byNiche[product.niche]) {
        byNiche[product.niche] = [];
      }
      byNiche[product.niche].push(product);
    });
    
    // Header styling
    const headerStyle = 'color: #fff; background: #333; padding: 4px 8px; border-radius: 4px; font-weight: bold;';
    const subheaderStyle = 'color: #fff; background: #555; padding: 2px 6px; border-radius: 4px; font-weight: bold;';
    
    console.log('%c📊 GlowBot Trending Products 📊', headerStyle);
    console.log(`Total products: ${products.length}`);
    console.log('-'.repeat(50));
    
    // Products by source
    console.log('%cProducts by Source:', subheaderStyle);
    Object.entries(bySource).forEach(([source, sourceProducts]) => {
      console.log(`%c${source}%c (${sourceProducts.length} products)`, 'color: #3498db; font-weight: bold;', 'color: inherit');
      
      // Show top 3 products by mentions for each source
      sourceProducts
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 3)
        .forEach((product, idx) => {
          console.log(`  ${idx + 1}. ${product.title} (${product.mentions.toLocaleString()} mentions)`);
        });
      
      if (sourceProducts.length > 3) {
        console.log(`  ... ${sourceProducts.length - 3} more products`);
      }
    });
    
    console.log('-'.repeat(50));
    
    // Products by niche
    console.log('%cProducts by Niche:', subheaderStyle);
    Object.entries(byNiche).forEach(([niche, nicheProducts]) => {
      console.log(`%c${niche}%c (${nicheProducts.length} products)`, 'color: #9b59b6; font-weight: bold;', 'color: inherit');
      
      // Show top 3 products by mentions for each niche
      nicheProducts
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 3)
        .forEach((product, idx) => {
          console.log(`  ${idx + 1}. ${product.title} (${product.mentions.toLocaleString()} mentions)`);
        });
      
      if (nicheProducts.length > 3) {
        console.log(`  ... ${nicheProducts.length - 3} more products`);
      }
    });
    
    // Footer message
    console.log('-'.repeat(50));
    console.log('To refresh trending products, call window.checkTrendingProducts()');
    
  } catch (error) {
    console.error('Failed to fetch trending products:', error);
  }
}

// Export functions to window for easy access in the console
declare global {
  interface Window {
    checkScraperHealth: () => Promise<void>;
    checkTrendingProducts: () => Promise<void>;
  }
}

// Initialize the global functions
export function initScraperConsole() {
  window.checkScraperHealth = logScraperHealth;
  window.checkTrendingProducts = logTrendingProducts;
  
  // Run initial scraper health check
  setTimeout(() => {
    logScraperHealth();
    logTrendingProducts();
  }, 1000);
  
  console.log('Scraper console helpers initialized! Use window.checkScraperHealth() or window.checkTrendingProducts() to refresh data.');
}