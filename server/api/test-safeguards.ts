import { Router, Request, Response } from 'express';
import { runComprehensiveSafeguardTest } from '../tests/comprehensive-safeguard-test';

const router = Router();

/**
 * GET /api/test-safeguards
 * Run comprehensive safeguard test and return results
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Running comprehensive safeguard test via API...');
    
    // Capture console output for the test
    const originalConsoleLog = console.log;
    let testOutput = '';
    
    console.log = (...args: any[]) => {
      testOutput += args.join(' ') + '\n';
      originalConsoleLog(...args);
    };
    
    await runComprehensiveSafeguardTest();
    
    // Restore console.log
    console.log = originalConsoleLog;
    
    const isSecure = testOutput.includes('SAFEGUARDS WORKING CORRECTLY');
    
    res.json({
      success: true,
      secure: isSecure,
      testOutput: testOutput,
      message: isSecure ? 'All safeguards are working correctly' : 'Some safeguards may be compromised',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error running safeguard test:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as testSafeguardsRouter };