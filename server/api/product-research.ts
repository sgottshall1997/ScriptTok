/**
 * Product Research API Endpoint
 * Uses existing Perplexity integration to research product opportunities
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';

const router = Router();

// Request schema for product research
const productResearchSchema = z.object({
  category: z.string().min(1, 'Category is required'),
});

/**
 * Research product opportunities for a given category using Perplexity
 */
router.post('/', async (req, res) => {
  try {
    const { category } = productResearchSchema.parse(req.body);
    
    console.log(`🔍 Product Research: Analyzing opportunities in ${category} category`);
    
    // Construct the actionable research query - no generic summaries allowed
    const query = `For the ${category} category, identify 3 specific product opportunities. For each product, provide concrete data points (NO VAGUE LANGUAGE):

REQUIRED DATA FOR EACH PRODUCT:

1. SPECIFIC PRODUCT: Exact product description with specific features (not "${category} devices" but "LED red light therapy wand for at-home face treatments")

2. DEMAND PROOF: 
   - Monthly Google search volume for this exact product type
   - Approximate TikTok video count in past 30 days with related hashtags
   - Reddit mentions/complaints about this problem in past 90 days
   - Concrete numbers only, no "shows potential" language

3. COMPETITION ANALYSIS:
   - Name 3-5 existing brands selling this exact product
   - Their approximate price points ($X - $Y range)
   - Market saturation: LOW/MEDIUM/HIGH with specific reasoning

4. MARGIN POTENTIAL:
   - Estimated manufacturing cost (Alibaba rough estimate)
   - Typical retail price based on competitor research
   - Calculated gross margin percentage: "X% gross margin"
   - Example format: "$8 cost → $35 retail = 77% gross margin"

5. TARGET CUSTOMER:
   - Specific demographic (not "women 25-45" but "working moms 30-40 in suburbs who follow clean beauty influencers")
   - Exact pain point this solves
   - Where they spend time online (specific platforms)

6. TESTING DIFFICULTY:
   - EASY/MEDIUM/HARD to test with $500 ad budget
   - Specific reasoning: visual appeal, price point, content creation ease
   - Red flags if any (high returns, education required, etc.)

7. SUCCESSFUL EXAMPLES:
   - Name 1-2 brands that went viral with this product type
   - What specific content format made them successful
   - Their engagement/sales results if available

8. GO/NO-GO DECISION:
   - Clear WORTH_TESTING/SKIP/MAYBE recommendation
   - Score 1-100 based on all factors
   - Specific checklist items passed/failed

Return structured data with concrete numbers. If data isn't available, say "Data not available" rather than vague language. Focus on products that can be sourced, tested, and sold within 30 days.`;
    
    // Call Perplexity API using the same approach as existing endpoints
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the response to extract product opportunities
    const opportunities = parseProductOpportunities(content, category, query);
    
    console.log(`✅ Product Research: Found ${opportunities.length} opportunities for ${category}`);
    
    res.json({
      success: true,
      category,
      query,
      opportunities,
      rawContent: content,
    });

  } catch (error) {
    console.error('❌ Product Research error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to research product opportunities'
    });
  }
});

/**
 * Save a product opportunity to the database
 */
router.post('/save', async (req, res) => {
  try {
    const opportunitySchema = z.object({
      category: z.string().min(1),
      opportunity: z.string().min(1),
      reasoning: z.string().min(1),
      
      // New required fields for actionable data
      specificProduct: z.string().min(1),
      whyThisProduct: z.string().min(1),
      marketSaturation: z.string().min(1),
      saturationReasoning: z.string().min(1),
      targetDemographic: z.string().min(1),
      customerPainPoint: z.string().min(1),
      testDifficulty: z.string().min(1),
      testDifficultyReasoning: z.string().min(1),
      recommendation: z.string().min(1),
      
      // Optional fields
      productFeatures: z.string().optional(),
      monthlySearchVolume: z.number().optional(),
      tiktokVideoCount: z.number().optional(),
      redditMentions: z.number().optional(),
      demandEvidence: z.string().optional(),
      competitorBrands: z.array(z.any()).optional(),
      manufacturingCost: z.string().optional(), // Database uses decimal (string)
      typicalRetailPrice: z.string().optional(), // Database uses decimal (string)
      grossMarginPercent: z.string().optional(), // Database uses decimal (string)
      marginCalculation: z.string().optional(),
      whereTheySpend: z.string().optional(),
      redFlags: z.string().optional(),
      successfulBrands: z.array(z.any()).optional(),
      whatMadeThemWork: z.string().optional(),
      goNoGoScore: z.number().optional(),
      goNoGoIndicators: z.array(z.any()).optional(),
    });

    const opportunityData = opportunitySchema.parse(req.body);
    
    console.log(`💾 Saving product opportunity: ${opportunityData.specificProduct.substring(0, 50)}...`);
    
    const saved = await storage.saveProductOpportunity(opportunityData);
    
    res.json({
      success: true,
      opportunity: saved,
      message: 'Product opportunity saved successfully'
    });

  } catch (error) {
    console.error('❌ Save opportunity error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save product opportunity'
    });
  }
});

/**
 * Get all saved product opportunities
 */
router.get('/opportunities', async (req, res) => {
  try {
    const opportunities = await storage.getProductOpportunities();
    
    res.json(opportunities);

  } catch (error) {
    console.error('❌ Get opportunities error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get saved opportunities'
    });
  }
});

/**
 * Delete a saved product opportunity
 */
router.delete('/opportunities/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid opportunity ID'
      });
    }
    
    console.log(`🗑️ Deleting product opportunity: ${id}`);
    
    const deleted = await storage.deleteProductOpportunity(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Product opportunity not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product opportunity deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete opportunity error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product opportunity'
    });
  }
});

/**
 * Parse Perplexity response into structured, actionable product opportunities
 */
function parseProductOpportunities(content: string, category: string, query: string) {
  const opportunities: Array<{
    // Legacy fields for backward compatibility
    opportunity: string;
    reasoning: string;
    
    // New actionable fields
    specificProduct: string;
    productFeatures?: string;
    whyThisProduct: string;
    monthlySearchVolume?: number;
    tiktokVideoCount?: number;
    redditMentions?: number;
    demandEvidence?: string;
    competitorBrands?: any[];
    marketSaturation: string;
    saturationReasoning: string;
    manufacturingCost?: string;
    typicalRetailPrice?: string;
    grossMarginPercent?: string;
    marginCalculation?: string;
    targetDemographic: string;
    customerPainPoint: string;
    whereTheySpend?: string;
    testDifficulty: string;
    testDifficultyReasoning: string;
    redFlags?: string;
    successfulBrands?: any[];
    whatMadeThemWork?: string;
    goNoGoScore?: number;
    goNoGoIndicators?: any[];
    recommendation: string;
  }> = [];

  try {
    // Split content into product sections
    const sections = content.split(/(?=\d+\.\s*[A-Z]|Product \d+|PRODUCT \d+)/i);
    
    for (const section of sections) {
      if (!section.trim() || section.length < 50) continue;
      
      const opportunity = parseProductSection(section, category);
      if (opportunity) {
        opportunities.push(opportunity);
      }
    }
    
    // If structured parsing failed, try fallback parsing
    if (opportunities.length === 0) {
      const fallbackOpportunity = createFallbackOpportunity(content, category);
      opportunities.push(fallbackOpportunity);
    }
    
  } catch (error) {
    console.error('❌ Parsing error:', error);
    // Create fallback opportunity
    const fallbackOpportunity = createFallbackOpportunity(content, category);
    opportunities.push(fallbackOpportunity);
  }
  
  return opportunities.slice(0, 3); // Limit to 3 as requested
}

/**
 * Parse individual product section from AI response
 */
function parseProductSection(section: string, category: string) {
  try {
    const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Extract key data points using regex patterns
    const specificProduct = extractValue(section, /SPECIFIC PRODUCT[:\-]?\s*(.+?)(?=\n|DEMAND PROOF|$)/i) ||
                          extractValue(section, /Product[:\-]?\s*(.+?)(?=\n|Demand|Competition|$)/i) ||
                          extractValue(section, /^\d+\.\s*(.+?)(?=\n|$)/m) ||
                          "Data not available";
    
    const searchVolume = extractNumber(section, /search volume[:\-]?\s*([0-9,]+)/i);
    const tiktokCount = extractNumber(section, /tiktok[^0-9]*([0-9,]+)/i);
    const redditMentions = extractNumber(section, /reddit[^0-9]*([0-9,]+)/i);
    
    const competitorBrands = extractCompetitors(section);
    const marketSaturation = extractValue(section, /saturation[:\-]?\s*(LOW|MEDIUM|HIGH)/i) || "MEDIUM";
    const saturationReasoning = extractValue(section, /saturation[^:]*:[^.]*\.?\s*(.+?)(?=\n|MARGIN|$)/i) || "Market analysis based on current competition";
    
    const manufacturingCost = extractPrice(section, /manufacturing cost[:\-]?\s*\$?([0-9.]+)/i);
    const retailPrice = extractPrice(section, /retail price[:\-]?\s*\$?([0-9.]+)/i);
    const marginPercent = extractNumber(section, /([0-9]+)%\s*(?:gross\s*)?margin/i);
    
    const targetDemo = extractValue(section, /TARGET CUSTOMER[:\-]?\s*(.+?)(?=\n|TESTING|$)/i) ||
                      extractValue(section, /demographic[:\-]?\s*(.+?)(?=\n|pain point|$)/i) ||
                      "Data not available";
    
    const painPoint = extractValue(section, /pain point[:\-]?\s*(.+?)(?=\n|online|$)/i) ||
                     "Solves key customer problem";
    
    const testDifficulty = extractValue(section, /TESTING DIFFICULTY[:\-]?\s*(EASY|MEDIUM|HARD)/i) ||
                          extractValue(section, /(EASY|MEDIUM|HARD)\s*to test/i) ||
                          "MEDIUM";
    
    const testReasoning = extractValue(section, /difficulty[^:]*:[^.]*\.?\s*(.+?)(?=\n|RED FLAGS|$)/i) ||
                         "Standard testing requirements";
    
    const recommendation = extractValue(section, /(WORTH_TESTING|SKIP|MAYBE)/i) ||
                          (marginPercent && marginPercent > 40 ? "WORTH_TESTING" : "MAYBE");
    
    const score = extractNumber(section, /score[:\-]?\s*([0-9]+)/i) ||
                 calculateScore(marginPercent, searchVolume, marketSaturation);
    
    // Build margin calculation string
    let marginCalculation = "Data not available";
    if (manufacturingCost && retailPrice) {
      const margin = Math.round(((retailPrice - manufacturingCost) / retailPrice) * 100);
      marginCalculation = `$${manufacturingCost} cost → $${retailPrice} retail = ${margin}% gross margin`;
    }
    
    return {
      // Legacy fields
      opportunity: specificProduct.substring(0, 255), // Ensure it fits in text field
      reasoning: `${painPoint} Target: ${targetDemo}. Testing: ${testDifficulty}. ${marginCalculation}`,
      
      // New actionable fields
      specificProduct,
      whyThisProduct: painPoint,
      monthlySearchVolume: searchVolume || undefined,
      tiktokVideoCount: tiktokCount || undefined,
      redditMentions: redditMentions || undefined,
      competitorBrands,
      marketSaturation,
      saturationReasoning,
      manufacturingCost: manufacturingCost ? manufacturingCost.toString() : undefined,
      typicalRetailPrice: retailPrice ? retailPrice.toString() : undefined,
      grossMarginPercent: marginPercent ? marginPercent.toString() : undefined,
      marginCalculation,
      targetDemographic: targetDemo,
      customerPainPoint: painPoint,
      testDifficulty,
      testDifficultyReasoning: testReasoning,
      goNoGoScore: score || undefined,
      recommendation,
    };
    
  } catch (error) {
    console.error('❌ Error parsing product section:', error);
    return null;
  }
}

/**
 * Extract text value using regex
 */
function extractValue(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract number from text
 */
function extractNumber(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  if (match) {
    const numStr = match[1].replace(/,/g, '');
    const num = parseInt(numStr);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Extract price from text
 */
function extractPrice(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  if (match) {
    const priceStr = match[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    return isNaN(price) ? null : price;
  }
  return null;
}

/**
 * Extract competitor brands from text
 */
function extractCompetitors(text: string): any[] {
  const competitors: any[] = [];
  
  // Look for brand patterns
  const brandMatches = text.match(/(?:brands?|competitors?)[:\-]?\s*(.+?)(?=\n|price|margin|$)/i);
  if (brandMatches) {
    const brandsText = brandMatches[1];
    // Split by common delimiters and extract brand names
    const brandNames = brandsText.split(/[,;]|\band\b/).map(b => b.trim()).filter(b => b.length > 2);
    
    for (const brand of brandNames.slice(0, 5)) {
      competitors.push({
        name: brand.replace(/^\d+\.\s*/, ''),
        pricePoint: "Data not available"
      });
    }
  }
  
  return competitors;
}

/**
 * Calculate score based on available metrics
 */
function calculateScore(margin?: number | null, searchVolume?: number | null, saturation?: string): number {
  let score = 50; // Base score
  
  if (margin && margin > 50) score += 20;
  else if (margin && margin > 30) score += 10;
  
  if (searchVolume && searchVolume > 50000) score += 15;
  else if (searchVolume && searchVolume > 10000) score += 10;
  
  if (saturation === "LOW") score += 15;
  else if (saturation === "HIGH") score -= 15;
  
  return Math.min(Math.max(score, 1), 100);
}

/**
 * Create fallback opportunity when parsing fails
 */
function createFallbackOpportunity(content: string, category: string) {
  return {
    opportunity: `Product opportunity analysis for ${category}`,
    reasoning: "AI analysis completed - review full response for details",
    specificProduct: `Specific ${category} product opportunity`,
    whyThisProduct: "Market analysis indicates potential",
    marketSaturation: "MEDIUM",
    saturationReasoning: "Standard market competition",
    targetDemographic: "Target customer analysis needed",
    customerPainPoint: "Customer problem to be solved",
    testDifficulty: "MEDIUM",
    testDifficultyReasoning: "Standard testing approach",
    recommendation: "MAYBE",
  };
}

export default router;