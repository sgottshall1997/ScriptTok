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
router.post('/research', async (req, res) => {
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
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a product research expert. Provide detailed, actionable product opportunity analysis with specific market insights.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
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
      problem: z.string().min(1),
      targetCustomer: z.string().min(1),
      demandSignal: z.string().min(1),
      marginPotential: z.string().min(1),
      query: z.string().min(1),
    });

    const opportunity = opportunitySchema.parse(req.body);
    
    console.log(`💾 Saving product opportunity: ${opportunity.problem.substring(0, 50)}...`);
    
    const saved = await storage.saveProductOpportunity(opportunity);
    
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
router.get('/saved', async (req, res) => {
  try {
    const opportunities = await storage.getProductOpportunities();
    
    res.json({
      success: true,
      opportunities,
      count: opportunities.length,
    });

  } catch (error) {
    console.error('❌ Get opportunities error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get saved opportunities'
    });
  }
});

/**
 * Parse Perplexity response into structured product opportunities
 */
function parseProductOpportunities(content: string, category: string, query: string) {
  const opportunities: Array<{
    problem: string;
    targetCustomer: string;
    demandSignal: string;
    marginPotential: string;
  }> = [];

  // Split content into sections and try to extract structured data
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentOpportunity: any = {};
  let isCapturingOpportunity = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Look for numbered opportunities (1., 2., etc.)
    if (/^\d+\./.test(trimmedLine)) {
      // Save previous opportunity if it's complete
      if (isCapturingOpportunity && currentOpportunity.problem) {
        opportunities.push({
          problem: currentOpportunity.problem || 'Product opportunity identified',
          targetCustomer: currentOpportunity.targetCustomer || 'Target market analysis needed',
          demandSignal: currentOpportunity.demandSignal || 'Market demand research needed', 
          marginPotential: currentOpportunity.marginPotential || 'Margin analysis needed',
        });
      }
      
      // Start new opportunity
      currentOpportunity = {
        problem: trimmedLine.replace(/^\d+\.\s*/, '').trim(),
      };
      isCapturingOpportunity = true;
    }
    
    // Look for key phrases to categorize information
    else if (isCapturingOpportunity) {
      const lowerLine = trimmedLine.toLowerCase();
      
      if (lowerLine.includes('problem') || lowerLine.includes('solves') || lowerLine.includes('addresses')) {
        currentOpportunity.problem = currentOpportunity.problem || trimmedLine;
      }
      else if (lowerLine.includes('target') || lowerLine.includes('customer') || lowerLine.includes('audience')) {
        currentOpportunity.targetCustomer = trimmedLine;
      }
      else if (lowerLine.includes('demand') || lowerLine.includes('market') || lowerLine.includes('trending')) {
        currentOpportunity.demandSignal = trimmedLine;
      }
      else if (lowerLine.includes('margin') || lowerLine.includes('profit') || lowerLine.includes('revenue')) {
        currentOpportunity.marginPotential = trimmedLine;
      }
    }
  }
  
  // Don't forget the last opportunity
  if (isCapturingOpportunity && currentOpportunity.problem) {
    opportunities.push({
      problem: currentOpportunity.problem || 'Product opportunity identified',
      targetCustomer: currentOpportunity.targetCustomer || 'Target market analysis needed',
      demandSignal: currentOpportunity.demandSignal || 'Market demand research needed',
      marginPotential: currentOpportunity.marginPotential || 'Margin analysis needed',
    });
  }
  
  // If parsing failed, create a single generic opportunity from the content
  if (opportunities.length === 0 && content.trim()) {
    opportunities.push({
      problem: `Product opportunities in ${category} category`,
      targetCustomer: 'Market analysis needed',
      demandSignal: 'Research shows market potential',
      marginPotential: 'Profit potential to be determined',
    });
  }
  
  return opportunities.slice(0, 5); // Limit to 5 as requested
}

export default router;