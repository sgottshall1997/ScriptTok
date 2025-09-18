import express from "express";
import { abAssignmentService } from "../../cookaing-marketing/ab/assignment.service";
import { storage } from "../../storage";

const router = express.Router();

/**
 * POST /api/cookaing-marketing/ab/assign
 * Assigns a user to an A/B test variant (50/50 split)
 */
router.post("/assign", async (req, res) => {
  try {
    const { testId, entity, contextJson, contactId, anonId } = req.body;

    // Support both testId and entity for compatibility
    const testEntity = testId || entity;
    if (!testEntity) {
      return res.status(400).json({ error: "testId or entity is required" });
    }

    if (!contactId && !anonId) {
      return res.status(400).json({ error: "Either contactId or anonId is required" });
    }

    console.log(`🎯 A/B Assignment Request:`, {
      entity,
      contextJson,
      contactId,
      anonId: anonId ? `${anonId.substring(0, 8)}...` : undefined
    });

    const assignment = await abAssignmentService.assignVariant(
      testEntity,
      contextJson || {},
      contactId,
      anonId
    );

    console.log(`✅ A/B Assignment Result:`, {
      entity,
      variant: assignment.variant,
      testId: assignment.testId
    });

    // Track assignment in analytics
    try {
      await storage.createAnalyticsEvent({
        orgId: 1, // Default org
        eventType: 'ab_assignment',
        entityType: 'ab_test',
        entityId: assignment.testId,
        contactId,
        metaJson: {
          entity,
          variant: assignment.variant,
          contextJson,
          anonId
        }
      });
    } catch (analyticsError) {
      console.warn('⚠️ Failed to log A/B assignment analytics:', analyticsError);
    }

    res.json({
      success: true,
      data: {
        assignment: {
          id: assignment.assignmentId,
          variant: assignment.variant,
          testId: assignment.testId
        }
      }
    });

  } catch (error) {
    console.error('❌ A/B Assignment Error:', error);
    res.status(500).json({
      error: "Failed to assign A/B test variant",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * POST /api/cookaing-marketing/ab/convert
 * Track a conversion for an A/B test
 */
router.post("/convert", async (req, res) => {
  try {
    const { testId, variant, conversionType, value, metadata } = req.body;

    if (!testId || !variant || !conversionType) {
      return res.status(400).json({ 
        error: "testId, variant, and conversionType are required" 
      });
    }

    console.log(`🎯 A/B Conversion Tracked:`, {
      testId,
      variant,
      conversionType,
      value,
      timestamp: new Date().toISOString()
    });

    // Store actual conversion data for statistical analysis
    try {
      await storage.recordABTestConversion(testId, variant, conversionType, value, metadata?.assignmentId);
    } catch (conversionError) {
      console.warn('⚠️ Failed to record A/B test conversion:', conversionError);
      // Continue - analytics tracking is still valuable even if conversion recording fails
    }

    // Track conversion in analytics (non-fatal)
    try {
      await storage.createAnalyticsEvent({
        orgId: 1, // Default org
        eventType: 'ab_conversion',
        entityType: 'ab_test',
        entityId: testId,
        metaJson: {
          variant,
          conversionType,
          value,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
    } catch (analyticsError) {
      console.warn('⚠️ Failed to log A/B conversion analytics:', analyticsError);
      // Don't fail the conversion tracking if analytics fails
    }

    res.json({
      success: true,
      message: `Conversion '${conversionType}' tracked for test ${testId}, variant ${variant}`,
      data: {
        testId,
        variant,
        conversionType,
        value,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ A/B Conversion Error:', error);
    res.status(500).json({
      error: "Failed to track conversion",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * POST /api/cookaing-marketing/ab/decide
 * Runs statistical analysis and decides A/B test winner
 */
router.post("/decide", async (req, res) => {
  try {
    const { testId } = req.body;

    if (!testId) {
      return res.status(400).json({ error: "Test ID is required" });
    }

    console.log(`🔬 A/B Decision Analysis for test ${testId}`);

    const decision = await abAssignmentService.decideWinner(testId);
    const testResults = await abAssignmentService.getTestResults(testId);

    console.log(`📊 A/B Test Results:`, {
      testId,
      totalSamples: testResults.totalSamples,
      variantA: testResults.results.variantA,
      variantB: testResults.results.variantB,
      winner: decision.winner,
      confidence: decision.confidence,
      shouldContinue: decision.shouldContinue
    });

    // Track decision in analytics
    try {
      await storage.createAnalyticsEvent({
        orgId: 1, // Default org
        eventType: 'ab_decision',
        entityType: 'ab_test',
        entityId: testId,
        metaJson: {
          decision,
          testResults: {
            totalSamples: testResults.totalSamples,
            variantA: testResults.results.variantA,
            variantB: testResults.results.variantB
          }
        }
      });
    } catch (analyticsError) {
      console.warn('⚠️ Failed to log A/B decision analytics:', analyticsError);
    }

    res.json({
      success: true,
      data: {
        testId,
        decision,
        results: testResults,
        recommendation: decision.shouldContinue 
          ? "Continue test - not enough data or statistical significance"
          : `Declare ${decision.winner} as winner with ${Math.round((decision.confidence || 0) * 100)}% confidence`
      }
    });

  } catch (error) {
    console.error('❌ A/B Decision Error:', error);
    res.status(500).json({
      error: "Failed to analyze A/B test results",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/cookaing-marketing/ab/test/:testId
 * Get A/B test results and statistics
 */
router.get("/test/:testId", async (req, res) => {
  try {
    const testId = req.params.testId; // Accept string IDs

    if (!testId) {
      return res.status(400).json({ error: "Test ID is required" });
    }

    // Convert to number if it's a numeric string, otherwise pass as string
    const testIdForService = isNaN(Number(testId)) ? testId : Number(testId);
    const testResults = await abAssignmentService.getTestResults(testIdForService);

    res.json({
      success: true,
      data: testResults
    });

  } catch (error) {
    console.error('❌ Get A/B Test Error:', error);
    res.status(500).json({
      error: "Failed to get A/B test results",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * GET /api/cookaing-marketing/ab/tests
 * Get all A/B tests with basic stats
 */
router.get("/tests", async (req, res) => {
  try {
    // Get all AB test assignments from the database to build test list
    const assignments = await storage.getABAssignments();
    
    // Group assignments by entity to get unique tests
    const testsByEntity = new Map<string, any>();
    assignments.forEach(assignment => {
      const entity = assignment.entity;
      if (!testsByEntity.has(entity)) {
        testsByEntity.set(entity, {
          testId: entity,
          status: 'active',
          variants: { A: { assignments: 0, conversions: 0, conversionRate: 0 }, B: { assignments: 0, conversions: 0, conversionRate: 0 } }
        });
      }
      
      const test = testsByEntity.get(entity);
      test.variants[assignment.variant].assignments++;
    });

    // Convert to array format expected by frontend
    const testsWithResults = Array.from(testsByEntity.values()).map(test => ({
      testId: test.testId,
      status: test.status,
      variants: test.variants,
      winner: null, // Would need statistical analysis to determine
      confidence: null,
      pValue: null,
      recommendation: "Continue collecting data"
    }));

    res.json({
      success: true,
      data: testsWithResults,
      count: testsWithResults.length
    });

  } catch (error) {
    console.error('❌ Get A/B Tests Error:', error);
    res.status(500).json({
      error: "Failed to get A/B tests",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

export default router;