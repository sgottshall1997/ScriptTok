import { Router } from 'express';
import { db } from '../db';
import { perplexityTrendingProducts, insertPerplexityTrendingProductSchema } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import axios from 'axios';

const router = Router();

// Niches to fetch trending products for
const NICHES = ['skincare', 'tech', 'fashion', 'fitness', 'food', 'travel', 'pet'];

// Fetch trending picks from Perplexity API
export async function fetchTrendingPicksFromPerplexity(niche: string) {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const prompt = `What are the top trending Amazon affiliate products in the ${niche} niche right now that have gone viral on TikTok or Instagram? For each product, return:
- Product Name
- A short benefit sentence
- Viral indicator (TikTok mentions or social traction)
- Price range (under $100 only)
- A sentence on why it's a great affiliate product

Please format the response as a JSON array with objects containing these exact fields:
{
  "productName": "Product Name",
  "benefit": "Short benefit sentence",
  "viralMetric": "TikTok mentions or social traction metric",
  "priceRange": "Price range under $100",
  "affiliateReason": "Why it's a great affiliate product"
}

Return only the JSON array, no additional text.`;

  try {
    console.log(`🔍 Fetching trending ${niche} products from Perplexity...`);
    
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'You are a trend analysis expert focused on viral affiliate products. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      return_related_questions: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Parse JSON response
    let products;
    try {
      // Extract JSON from response (remove any surrounding text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      products = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse Perplexity response as JSON:', content);
      throw new Error('Invalid JSON response from Perplexity API');
    }

    if (!Array.isArray(products)) {
      throw new Error('Expected array response from Perplexity API');
    }

    // Store products in database
    const insertedProducts = [];
    for (const product of products.slice(0, 5)) { // Limit to 5 products per niche
      try {
        const productData = {
          niche,
          productName: product.productName || 'Unknown Product',
          benefit: product.benefit || 'Great product for your needs',
          viralMetric: product.viralMetric || 'Growing social media presence',
          priceRange: product.priceRange || 'Under $50',
          affiliateReason: product.affiliateReason || 'High conversion potential',
          amazonLink: null // Will be populated later if needed
        };

        const [inserted] = await db
          .insert(perplexityTrendingProducts)
          .values(productData)
          .returning();

        insertedProducts.push(inserted);
        console.log(`✅ Stored trending ${niche} product: ${productData.productName}`);
      } catch (dbError) {
        console.error(`Failed to store product for ${niche}:`, dbError);
      }
    }

    return insertedProducts;
  } catch (error) {
    console.error(`❌ Failed to fetch trending products for ${niche}:`, error.message);
    throw error;
  }
}

// Get trending products by niche
router.get('/niche/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    
    const products = await db
      .select()
      .from(perplexityTrendingProducts)
      .where(eq(perplexityTrendingProducts.niche, niche))
      .orderBy(desc(perplexityTrendingProducts.createdAt))
      .limit(10);

    res.json({
      success: true,
      niche,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching trending products by niche:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending products'
    });
  }
});

// Get all trending products organized by niche
router.get('/all', async (req, res) => {
  try {
    const allProducts = await db
      .select()
      .from(perplexityTrendingProducts)
      .orderBy(desc(perplexityTrendingProducts.createdAt))
      .limit(50);

    // Group by niche
    const productsByNiche = allProducts.reduce((acc, product) => {
      if (!acc[product.niche]) {
        acc[product.niche] = [];
      }
      acc[product.niche].push(product);
      return acc;
    }, {} as Record<string, typeof allProducts>);

    res.json({
      success: true,
      count: allProducts.length,
      productsByNiche
    });
  } catch (error) {
    console.error('Error fetching all trending products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending products'
    });
  }
});

// Refresh trending products for all niches
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔄 Starting Perplexity trending products refresh...');
    
    const results = {};
    
    for (const niche of NICHES) {
      try {
        const products = await fetchTrendingPicksFromPerplexity(niche);
        results[niche] = {
          success: true,
          count: products.length,
          products: products.map(p => p.productName)
        };
      } catch (error) {
        results[niche] = {
          success: false,
          error: error.message
        };
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('✅ Perplexity trending products refresh completed');
    
    res.json({
      success: true,
      message: 'Trending products refresh completed',
      results
    });
  } catch (error) {
    console.error('Error refreshing trending products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh trending products'
    });
  }
});

// Refresh specific niche
router.post('/refresh/:niche', async (req, res) => {
  try {
    const { niche } = req.params;
    
    if (!NICHES.includes(niche)) {
      return res.status(400).json({
        success: false,
        error: `Invalid niche. Must be one of: ${NICHES.join(', ')}`
      });
    }

    console.log(`🔄 Refreshing ${niche} trending products from Perplexity...`);
    
    const products = await fetchTrendingPicksFromPerplexity(niche);
    
    res.json({
      success: true,
      niche,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        productName: p.productName,
        benefit: p.benefit,
        viralMetric: p.viralMetric
      }))
    });
  } catch (error) {
    console.error(`Error refreshing ${req.params.niche} trending products:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to refresh ${req.params.niche} trending products: ${error.message}`
    });
  }
});

export default router;