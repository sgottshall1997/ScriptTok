import express from "express";
import { abAssignmentService } from "../../cookaing-marketing/ab/assignment.service";
import { storage } from "../../storage";
import { z } from "zod";

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
    // Dedicated request schema for the conversion API (separate from DB schema)
    const conversionRequestSchema = z.object({
      conversionType: z.string(),
      value: z.union([z.number(), z.string().transform(Number)]).refine(Number.isFinite, "Value must be a finite number").optional(),
      metadata: z.object({
        assignmentId: z.union([z.string(), z.number()]).transform(val => Number(val)),
        contactId: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
        anonId: z.string().optional()
      }),
      testId: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
      variant: z.enum(["A", "B"]).optional()
    });

    const parseResult = conversionRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const { conversionType, value, metadata } = parseResult.data;
    let { testId, variant } = parseResult.data; // Optional, may be derived - using let for reassignment
    const assignmentId = metadata.assignmentId; // Already coerced to number by schema

    // Get assignment by ID directly - more efficient and avoids testId type mismatch
    const assignment = await storage.getABAssignmentById(assignmentId);
    
    if (!assignment) {
      return res.status(400).json({
        error: "Assignment not found for the provided assignmentId"
      });
    }

    // Derive testId and variant from assignment if not provided (or validate if provided)
    const actualTestId = assignment.abTestId;
    const actualVariant = assignment.variant;
    
    if (testId && testId !== actualTestId) {
      return res.status(400).json({
        error: "Provided testId does not match assignment"
      });
    }
    
    if (variant && variant !== actualVariant) {
      return res.status(400).json({
        error: "Provided variant does not match assignment"
      });
    }
    
    // Use actual values from assignment
    testId = actualTestId;
    variant = actualVariant;

    // Validate identity to prevent fraud - require either contactId or anonId to match assignment
    // Use parsed values exclusively for consistency
    const providedContactId = metadata.contactId;
    const providedAnonId = metadata.anonId;
    
    if (!providedContactId && !providedAnonId) {
      return res.status(400).json({
        error: "Either contactId or anonId is required for conversion validation"
      });
    }
    
    // Coerce contactId to number for comparison (frontend might send as string)
    const normalizedProvidedContactId = providedContactId ? Number(providedContactId) : undefined;
    const normalizedAssignmentContactId = assignment.contactId ? Number(assignment.contactId) : undefined;
    
    // Check that the identity matches the assignment (fix truthy logic issues)
    const identityMatches = 
      (normalizedAssignmentContactId !== undefined && normalizedProvidedContactId === normalizedAssignmentContactId) ||
      (assignment.anonId !== undefined && assignment.anonId !== null && providedAnonId === assignment.anonId);
    
    if (!identityMatches) {
      return res.status(400).json({
        error: "Conversion identity does not match assignment - potential fraud detected"
      });
    }

    // Check for duplicate conversion to prevent fraud
    const existingConversions = await storage.getABConversionsByTest(testId);
    const duplicateConversion = existingConversions.find(c => 
      c.assignmentId === assignmentId && 
      c.conversionType === conversionType
    );
    
    if (duplicateConversion) {
      return res.status(409).json({
        error: "Conversion already recorded for this assignment and conversion type"
      });
    }

    console.log(`🎯 A/B Conversion Tracked:`, {
      testId,
      variant,
      conversionType,
      value,
      assignmentId,
      anonId: providedAnonId,
      contactId: providedContactId,
      timestamp: new Date().toISOString()
    });

    // Store actual conversion data for statistical analysis
    try {
      await storage.recordABTestConversion(actualTestId, actualVariant, conversionType, value, assignmentId);
    } catch (conversionError: any) {
      console.warn('⚠️ Failed to record A/B test conversion:', conversionError);
      
      // Handle unique constraint violations gracefully (when DB constraints are added)
      if (conversionError?.message?.includes('unique') || conversionError?.code === '23505') {
        return res.status(409).json({
          error: "Conversion already recorded for this assignment and conversion type",
          details: "Database-level duplicate prevention triggered"
        });
      }
      
      // For other database errors, return server error
      return res.status(500).json({
        error: "Failed to record conversion",
        details: "Database operation failed"
      });
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