import { Router, Request, Response } from "express";
import { runSimpleTest } from "../tests/simple-unified-test";

const router = Router();

// Simple test endpoint
router.post("/test-simple-unified", async (req: Request, res: Response) => {
  try {
    const result = await runSimpleTest();
    
    res.json({
      success: result.success,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Simple test error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Test execution failed"
    });
  }
});

export default router;