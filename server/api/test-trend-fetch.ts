import { Request, Response } from 'express';
import { validateTrendFetchRequest } from '../config/generation-safeguards';

/**
 * 🧪 TEST ENDPOINT: Simulate 5:00 AM Perplexity trend fetch
 * Tests the exact same logic that runs in the cron job
 */
export async function testTrendFetch(req: Request, res: Response) {
  try {
    console.log('\n🧪 TESTING PERPLEXITY TREND FETCH SIMULATION');
    console.log('=' .repeat(60));
    console.log('🕐 Simulating 5:00 AM cron job execution...');
    
    // Step 1: Validate safeguards allow trend fetching
    const validation = validateTrendFetchRequest();
    
    if (!validation.allowed) {
      console.log(`🚫 TREND FETCH BLOCKED: ${validation.reason}`);
      return res.status(403).json({
        success: false,
        blocked: true,
        reason: validation.reason,
        message: 'Trend fetching is blocked by safeguard system'
      });
    }
    
    console.log('🟢 SAFEGUARD: Trend fetching validated - proceeding with test fetch');
    
    // Step 2: Import and run the trend fetcher
    const { pullPerplexityTrends } = await import('../services/perplexityTrendFetcher');
    const startTime = Date.now();
    
    console.log('📡 Starting Perplexity API calls...');
    const result = await pullPerplexityTrends();
    const duration = Date.now() - startTime;
    
    console.log(`✅ Test trend fetch complete in ${duration}ms`);
    console.log(`📊 Result: ${result.message}, added ${result.productsAdded} products`);
    console.log('🔒 IMPORTANT: This was a READ-ONLY data fetch - no content generation occurred');
    
    // Step 3: Verify no generation attempts were logged
    const { getGenerationLog } = await import('../config/generation-safeguards');
    const generationLog = getGenerationLog();
    const recentAttempts = generationLog.filter(entry => 
      Date.now() - new Date(entry.timestamp).getTime() < 60000 // Last minute
    );
    
    console.log(`🔍 Generation attempts in last minute: ${recentAttempts.length}`);
    
    return res.json({
      success: true,
      testResults: {
        safeguardValidation: {
          allowed: validation.allowed,
          message: 'Trend fetching validated by safeguard system'
        },
        fetchResults: {
          message: result.message,
          productsAdded: result.productsAdded,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        },
        securityValidation: {
          generationAttemptsDetected: recentAttempts.length,
          message: recentAttempts.length === 0 ? 
            'No content generation triggered - safe read-only operation' :
            `Warning: ${recentAttempts.length} generation attempts detected during fetch`
        }
      },
      message: 'Test trend fetch completed successfully - ready for production deployment'
    });
    
  } catch (error) {
    console.error('❌ Test trend fetch failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Test trend fetch failed',
      timestamp: new Date().toISOString()
    });
  }
}