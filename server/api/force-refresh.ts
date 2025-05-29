import { Router } from "express";
import { getAllTrendingProducts } from "../scrapers/index";
import { storage } from "../storage";

const router = Router();

// Force bypass cache and run fresh scrapers with detailed logging
router.post("/", async (req, res) => {
  try {
    console.log('\n🚀 FORCING FRESH SCRAPER RUN - BYPASSING ALL CACHE\n');
    
    // Run scrapers directly without any cache checking
    const scraperResult = await getAllTrendingProducts();
    
    console.log('\n📊 DETAILED SCRAPER RESULTS:');
    console.log(`Total products found: ${scraperResult.products?.length || 0}`);
    
    // Log each platform status with AI fallback detection
    console.log('\n🔍 PLATFORM-BY-PLATFORM STATUS:');
    scraperResult.platforms?.forEach(platform => {
      if (platform.status === 'gpt-fallback') {
        console.log(`🤖 ${platform.name.toUpperCase()}: AI FALLBACK ACTIVE`);
        console.log(`   Reason: ${platform.errorMessage || 'Scraper failed, using AI-generated data'}`);
      } else if (platform.status === 'error') {
        console.log(`❌ ${platform.name.toUpperCase()}: ERROR`);
        console.log(`   Reason: ${platform.errorMessage || 'Unknown error'}`);
      } else if (platform.status === 'active') {
        console.log(`✅ ${platform.name.toUpperCase()}: AUTHENTIC DATA`);
      }
    });
    
    // Save products to database
    const trendingProducts = scraperResult.products || [];
    if (trendingProducts.length > 0) {
      await storage.clearTrendingProducts();
      for (const product of trendingProducts) {
        await storage.saveTrendingProduct(product);
      }
      console.log(`\n✅ Saved ${trendingProducts.length} products to database`);
    }
    
    console.log('\n🎯 FRESH SCRAPER RUN COMPLETE\n');
    
    res.json({
      success: true,
      message: "Fresh scraper run completed",
      productsFound: trendingProducts.length,
      platformStatuses: scraperResult.platforms,
      timestamp: new Date().toLocaleString()
    });
    
  } catch (error) {
    console.error('\n❌ FORCE REFRESH FAILED:', error);
    res.status(500).json({
      error: "Force refresh failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export const forceRefreshRouter = router;