import { storage } from "../../storage";
import { InsertABTest, InsertABAssignment } from "@shared/schema";

export class ABAssignmentService {
  /**
   * Assigns a user to an A/B test variant (50/50 split)
   */
  async assignVariant(entity: string, contextJson: any, contactId?: number, anonId?: string): Promise<{ variant: 'A' | 'B'; testId: number; assignmentId: number }> {
    // Find or create A/B test for this entity/context
    const existingTests = await storage.getABTestsByEntity(entity, contextJson);
    
    let test;
    if (existingTests.length > 0) {
      test = existingTests[0]; // Use first running test
    } else {
      // Create new A/B test with default variants
      const newTest: InsertABTest = {
        orgId: 1, // Default org ID for now
        entity,
        contextJson,
        variantAJson: { variant: 'A', content: `${entity} variant A` },
        variantBJson: { variant: 'B', content: `${entity} variant B` },
        status: 'running'
      };
      test = await storage.createABTest(newTest);
    }

    // Check if user already has assignment
    const existingAssignment = await storage.getABAssignment(test.id, contactId, anonId);
    if (existingAssignment) {
      return {
        variant: existingAssignment.variant as 'A' | 'B',
        testId: test.id,
        assignmentId: existingAssignment.id
      };
    }

    // Assign variant (50/50 split based on hash of user identifier)
    const userHash = this.getUserHash(contactId, anonId);
    const variant = userHash % 2 === 0 ? 'A' : 'B';

    // Create assignment record
    const assignment: InsertABAssignment = {
      abTestId: test.id,
      contactId,
      anonId,
      variant
    };

    const createdAssignment = await storage.createABAssignment(assignment);

    return { 
      variant, 
      testId: test.id, 
      assignmentId: createdAssignment.id 
    };
  }

  /**
   * Makes a decision on A/B test winner based on sample size and statistical significance
   */
  async decideWinner(testId: number): Promise<{ winner?: 'A' | 'B'; confidence?: number; shouldContinue: boolean }> {
    const test = await storage.getABTest(testId);
    if (!test) {
      throw new Error(`A/B test ${testId} not found`);
    }

    const results = await storage.getABTestResults(testId);
    const totalAssignments = results.assignmentsA + results.assignmentsB;
    const totalConversions = results.conversionsA + results.conversionsB;

    // Need minimum sample sizes for proper statistical analysis
    const MIN_ASSIGNMENTS_PER_VARIANT = 100;
    const MIN_CONVERSIONS_PER_VARIANT = 5;
    
    if (results.assignmentsA < MIN_ASSIGNMENTS_PER_VARIANT || 
        results.assignmentsB < MIN_ASSIGNMENTS_PER_VARIANT ||
        results.conversionsA < MIN_CONVERSIONS_PER_VARIANT || 
        results.conversionsB < MIN_CONVERSIONS_PER_VARIANT) {
      return {
        shouldContinue: true,
        confidence: 0
      };
    }

    // Use the calculated conversion rates from storage
    const conversionRateA = results.conversionRateA;
    const conversionRateB = results.conversionRateB;
    
    // Two-proportion z-test for conversion rates
    const n1 = results.assignmentsA;
    const n2 = results.assignmentsB;
    const x1 = results.conversionsA;
    const x2 = results.conversionsB;
    
    // Pooled proportion
    const pooledP = (x1 + x2) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    const zScore = Math.abs(conversionRateA - conversionRateB) / se;
    
    // Convert to confidence level (rough approximation)
    const confidence = this.zScoreToConfidence(zScore);
    
    // Require 95% confidence to declare winner
    if (confidence >= 0.95) {
      const winner = conversionRateA > conversionRateB ? 'A' : 'B';
      
      // Update test in database
      await storage.updateABTest(testId, {
        status: 'completed',
        winner
      });

      return {
        winner,
        confidence,
        shouldContinue: false
      };
    }

    return {
      confidence,
      shouldContinue: true
    };
  }

  /**
   * Get A/B test results and statistics
   */
  async getTestResults(testId: number) {
    const test = await storage.getABTest(testId);
    if (!test) {
      throw new Error(`A/B test ${testId} not found`);
    }

    const results = await storage.getABTestResults(testId);
    const totalAssignments = results.assignmentsA + results.assignmentsB;
    const totalConversions = results.conversionsA + results.conversionsB;

    return {
      test,
      results,
      totalAssignments,
      totalConversions,
      conversionRates: {
        A: results.conversionRateA,
        B: results.conversionRateB
      },
      assignments: {
        A: results.assignmentsA,
        B: results.assignmentsB
      },
      conversions: {
        A: results.conversionsA,
        B: results.conversionsB
      },
      status: test.status,
      winner: test.winner
    };
  }

  /**
   * Create a simple hash from user identifier for consistent variant assignment
   */
  private getUserHash(contactId?: number, anonId?: string): number {
    const identifier = contactId?.toString() || anonId || Math.random().toString();
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Convert z-score to confidence level (rough approximation)
   */
  private zScoreToConfidence(zScore: number): number {
    // Rough mapping of z-scores to confidence levels
    if (zScore >= 2.58) return 0.99;  // 99%
    if (zScore >= 1.96) return 0.95;  // 95%
    if (zScore >= 1.64) return 0.90;  // 90%
    if (zScore >= 1.28) return 0.80;  // 80%
    return Math.min(0.79, zScore * 0.4); // Rough approximation below 80%
  }
}

export const abAssignmentService = new ABAssignmentService();