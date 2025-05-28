import { generateMultipleVariationsWithCritique } from './multiVariantGenerator';
import { getTrendingProducts } from '../api/trending';
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
    
    // Get trending products from all niches
    const trendingData = await getTrendingProducts();
    if (!trendingData?.byNiche) {
      console.log('No trending data available for showcase');
      return [];
    }

    const showcaseItems: ShowcaseItem[] = [];
    const selectedProducts: Array<{ product: string; niche: string }> = [];

    // Select 2-3 products from different niches for variety
    for (const [niche, products] of Object.entries(trendingData.byNiche)) {
      if (selectedProducts.length >= 3) break;
      
      if (Array.isArray(products) && products.length > 0) {
        // Pick the top trending product from this niche
        const topProduct = products[0];
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

        // Get niche-specific trending products for context
        const nicheProducts = trendingData.byNiche[niche] || [];
        
        const result = await generateMultipleVariationsWithCritique(
          product,
          templateType as any,
          tone as any,
          niche as any,
          nicheProducts
        );

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