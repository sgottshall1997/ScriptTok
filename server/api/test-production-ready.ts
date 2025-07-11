import { Router, Request, Response } from "express";
import { runProductionReadyTests } from "../tests/production-ready-test";

const router = Router();

// Production-ready test endpoint
router.post("/test-production-ready", async (req: Request, res: Response) => {
  try {
    console.log('🧪 Starting production-ready test suite...');
    
    const results = await runProductionReadyTests();
    
    console.log('✅ Production-ready test suite completed');
    console.log(`📊 Results: ${results.passedTests}/${results.totalTests} tests passed`);
    
    res.json({
      success: true,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Production-ready test error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Test execution failed",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;