import { Router, Request, Response } from "express";
import { UnifiedGeneratorTester } from "../tests/unified-generator-comprehensive-test";

const router = Router();

/**
 * Comprehensive test endpoint for unified content generator
 * Tests all model/format combinations and provides detailed analysis
 */
router.post('/test-unified-generator', async (req: Request, res: Response) => {
  try {
    console.log('🎯 Starting comprehensive unified generator test suite...');
    
    const tester = new UnifiedGeneratorTester();
    const results = await tester.runComprehensiveTests();
    
    console.log('📊 Test Results Summary:');
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`Passed: ${results.passedTests}`);
    console.log(`Failed: ${results.failedTests}`);
    console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);
    
    // Log detailed results to console
    console.log('\n' + results.summary);
    
    res.json({
      success: true,
      summary: results.summary,
      statistics: {
        totalTests: results.totalTests,
        passedTests: results.passedTests,
        failedTests: results.failedTests,
        successRate: ((results.passedTests / results.totalTests) * 100).toFixed(1) + '%'
      },
      detailedResults: results.results,
      bugsFound: results.bugsFound,
      bugsFixed: results.bugsFixed,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    res.status(500).json({
      success: false,
      error: 'Test suite execution failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Quick validation test for specific model/format combination
 */
router.post('/test-single-config', async (req: Request, res: Response) => {
  try {
    const { aiModel, useSpartanFormat, productName, niche } = req.body;
    
    if (!aiModel || useSpartanFormat === undefined || !productName || !niche) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: aiModel, useSpartanFormat, productName, niche'
      });
    }
    
    console.log(`🔍 Testing single configuration: ${aiModel} + ${useSpartanFormat ? 'Spartan' : 'Default'}`);
    
    const tester = new UnifiedGeneratorTester();
    const result = await (tester as any).runSingleTest({
      productName,
      niche,
      template: 'Short-Form Video Script',
      tone: 'Professional',
      aiModel,
      useSpartanFormat,
      platforms: ['tiktok', 'instagram']
    }, 'Single Config Test');
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Single config test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Single configuration test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;