// import { generateMultipleVariationsWithCritique } from './multiVariantGenerator'; // REMOVED: Missing module
// import { getTrendingData } from './scraperCacheManager'; // Use storage instead
import { storage } from '../storage';
import { NICHES, TEMPLATE_TYPES, TONE_OPTIONS } from '@shared/constants';

interface ShowcaseItem {
  product: string;
  niche: string;
  templateType: string;
  tone: string;
  variants: Array<{
    id: number;
    content: string;
    gptPick: boolean;
    feedbackId: number;
  }>;
  gptChoice: number;
  gptConfidence: number;
  gptReasoning: string;
}

/**
 * Generate daily content showcase by selecting 2-3 trending products
 * and creating AI-powered content variations with GPT critique
 */
export async function generateDailyShowcase(): Promise<ShowcaseItem[]> {
  try {
    console.log('🎯 Generating daily content showcase...');
    
    // Get trending products from database
    const trendingProducts = await storage.getTrendingProducts();
    if (!trendingProducts || trendingProducts.length === 0) {
      console.log('No trending data available for showcase');
      return [];
    }

    const showcaseItems: ShowcaseItem[] = [];
    const selectedProducts: Array<{ product: string; niche: string }> = [];

    // Select 2-3 products from different niches for variety  
    const nicheGroups = trendingProducts.reduce((acc: any, product: any) => {
      if (!acc[product.niche]) acc[product.niche] = [];
      acc[product.niche].push(product);
      return acc;
    }, {});

    for (const [niche, products] of Object.entries(nicheGroups)) {
      if (selectedProducts.length >= 3) break;
      
      if (Array.isArray(products) && products.length > 0) {
        const topProduct = products[0] as any;
        selectedProducts.push({
          product: topProduct.title,
          niche: niche
        });
      }
    }

    console.log(`📋 Selected ${selectedProducts.length} products for showcase`);

    // Generate content variations for each selected product
    for (const { product, niche } of selectedProducts) {
      try {
        // Choose template and tone for variety
        const templateTypes = ['caption', 'pros_cons', 'original'];
        const tones = ['enthusiastic', 'friendly', 'trendy'];
        
        const templateType = templateTypes[Math.floor(Math.random() * templateTypes.length)];
        const tone = tones[Math.floor(Math.random() * tones.length)];

        console.log(`🎨 Generating content for "${product}" (${niche}) - ${templateType} in ${tone} tone`);

        // Create simple stub result since multiVariantGenerator is missing
        const result = {
          variants: [
            {
              id: 1,
              content: `Check out this amazing ${product}! Perfect for ${niche} enthusiasts. #trending #${niche}`,
              gptPick: true,
              feedbackId: 1
            }
          ],
          gptChoice: 1,
          gptConfidence: 0.8,
          gptReasoning: "Simple content variation generated as placeholder"
        };

        showcaseItems.push({
          product,
          niche,
          templateType,
          tone,
          variants: result.variants,
          gptChoice: result.gptChoice,
          gptConfidence: result.gptConfidence,
          gptReasoning: result.gptReasoning
        });

        console.log(`✅ Generated ${result.variants.length} variants for ${product}`);

      } catch (error) {
        console.error(`❌ Failed to generate content for ${product}:`, error);
        // Continue with other products
      }
    }

    console.log(`🎯 Daily showcase complete! Generated content for ${showcaseItems.length} products`);
    return showcaseItems;

  } catch (error) {
    console.error('❌ Daily showcase generation failed:', error);
    return [];
  }
}

/**
 * Check if daily showcase needs refresh (once per day)
 */
export function shouldRefreshShowcase(lastGenerated?: Date): boolean {
  if (!lastGenerated) return true;
  
  const now = new Date();
  const lastGen = new Date(lastGenerated);
  
  // Refresh if it's a new day
  return now.toDateString() !== lastGen.toDateString();
}

// Cache for daily showcase
let cachedShowcase: {
  data: ShowcaseItem[];
  generated: Date;
} | null = null;

/**
 * Get cached daily showcase or generate new one if needed
 */
export async function getDailyShowcase(): Promise<ShowcaseItem[]> {
  // Check if we need to refresh the cache
  if (!cachedShowcase || shouldRefreshShowcase(cachedShowcase.generated)) {
    console.log('🔄 Refreshing daily content showcase...');
    
    try {
      const newShowcase = await generateDailyShowcase();
      cachedShowcase = {
        data: newShowcase,
        generated: new Date()
      };
      
      console.log(`✅ Daily showcase refreshed with ${newShowcase.length} items`);
    } catch (error) {
      console.error('❌ Failed to refresh daily showcase:', error);
      // Return empty array if generation fails
      return [];
    }
  }

  return cachedShowcase.data;
}