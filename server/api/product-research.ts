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
    
    // Construct the specific query format requested
    const query = `What are 5 specific product opportunities in ${category} based on current market gaps, trending consumer needs, and profit potential? For each, provide: problem it solves, target customer, estimated demand signal, and rough margin potential.`;
    
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
    });

    const { category, opportunity, reasoning } = opportunitySchema.parse(req.body);
    
    console.log(`💾 Saving product opportunity: ${opportunity.substring(0, 50)}...`);
    
    const saved = await storage.saveProductOpportunity({ category, opportunity, reasoning });
    
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
 * Parse Perplexity response into structured product opportunities
 */
function parseProductOpportunities(content: string, category: string, query: string) {
  const opportunities: Array<{
    opportunity: string;
    reasoning: string;
  }> = [];

  // Split content into sections and try to extract structured data
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentOpportunity: any = {};
  let isCapturingOpportunity = false;
  let reasoningParts: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Look for numbered opportunities (1., 2., etc.)
    if (/^\d+\./.test(trimmedLine)) {
      // Save previous opportunity if it's complete
      if (isCapturingOpportunity && currentOpportunity.opportunity) {
        opportunities.push({
          opportunity: currentOpportunity.opportunity,
          reasoning: reasoningParts.length > 0 ? reasoningParts.join(' ') : 'Market analysis shows strong potential for this product opportunity.',
        });
      }
      
      // Start new opportunity
      currentOpportunity = {
        opportunity: trimmedLine.replace(/^\d+\.\s*/, '').trim(),
      };
      reasoningParts = [];
      isCapturingOpportunity = true;
    }
    
    // Collect reasoning information
    else if (isCapturingOpportunity && trimmedLine.length > 0) {
      reasoningParts.push(trimmedLine);
    }
  }
  
  // Don't forget the last opportunity
  if (isCapturingOpportunity && currentOpportunity.opportunity) {
    opportunities.push({
      opportunity: currentOpportunity.opportunity,
      reasoning: reasoningParts.length > 0 ? reasoningParts.join(' ') : 'Market analysis shows strong potential for this product opportunity.',
    });
  }
  
  // If parsing failed, create a single generic opportunity from the content
  if (opportunities.length === 0 && content.trim()) {
    opportunities.push({
      opportunity: `Product opportunities in ${category} category`,
      reasoning: 'Market analysis shows potential based on current trends and consumer demands. Further research recommended to validate specific opportunities.',
    });
  }
  
  return opportunities.slice(0, 5); // Limit to 5 as requested
}

export default router;