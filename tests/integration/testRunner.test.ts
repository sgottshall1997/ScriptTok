/**
 * Integration Tests - Test Runner
 * Tests for the comprehensive test runner functionality
 */

import { describe, it, expect } from 'vitest';
import { testRunner } from '../../client/src/cookaing-marketing/testing/testRunner';

describe('Test Runner Integration', () => {
  describe('Test Suite Execution', () => {
    it('should execute unit test suite', async () => {
      const results = await testRunner.runTestSuite('unit');
      
      expect(results.suiteName).toBe('unit');
      expect(results.totalTests).toBeGreaterThan(0);
      expect(Array.isArray(results.results)).toBe(true);
      expect(results.summary.total).toBe(results.totalTests);
      expect(results.summary.passed + results.summary.failed).toBe(results.totalTests);
    });

    it('should execute integration test suite', async () => {
      const results = await testRunner.runTestSuite('integration');
      
      expect(results.suiteName).toBe('integration');
      expect(results.totalTests).toBeGreaterThan(0);
      expect(results.results.length).toBeGreaterThan(0);
      
      // Should include API health check
      const apiHealthTest = results.results.find(r => r.id === 'integration-api-health');
      expect(apiHealthTest).toBeDefined();
    });

    it('should execute performance test suite', async () => {
      const results = await testRunner.runTestSuite('performance');
      
      expect(results.suiteName).toBe('performance');
      expect(results.totalTests).toBeGreaterThan(0);
      
      // Should include response time tests
      const responseTimeTest = results.results.find(r => r.id?.includes('response-time'));
      expect(responseTimeTest).toBeDefined();
    });

    it('should execute accessibility test suite', async () => {
      const results = await testRunner.runTestSuite('accessibility');
      
      expect(results.suiteName).toBe('accessibility');
      expect(results.totalTests).toBeGreaterThan(0);
      
      // Should include accessibility checks
      const accessibilityTest = results.results.find(r => r.id?.includes('accessibility'));
      expect(accessibilityTest).toBeDefined();
    });
  });

  describe('Test Results and Reporting', () => {
    it('should provide detailed test results', async () => {
      const results = await testRunner.runTestSuite('unit');
      
      results.results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.name).toBeDefined();
        expect(result.suite).toBe('unit');
        expect(['passed', 'failed', 'skipped']).toContain(result.status);
        expect(result.duration).toBeGreaterThanOrEqual(0);
        
        if (result.status === 'failed') {
          expect(result.error).toBeDefined();
        }
      });
    });

    it('should calculate accurate summary statistics', async () => {
      const results = await testRunner.runTestSuite('integration');
      
      const manualCount = {
        passed: results.results.filter(r => r.status === 'passed').length,
        failed: results.results.filter(r => r.status === 'failed').length,
        skipped: results.results.filter(r => r.status === 'skipped').length
      };
      
      expect(results.summary.passed).toBe(manualCount.passed);
      expect(results.summary.failed).toBe(manualCount.failed);
      expect(results.summary.skipped).toBe(manualCount.skipped);
      expect(results.summary.total).toBe(manualCount.passed + manualCount.failed + manualCount.skipped);
    });

    it('should track test execution duration', async () => {
      const startTime = Date.now();
      const results = await testRunner.runTestSuite('unit');
      const endTime = Date.now();
      
      expect(results.duration).toBeGreaterThan(0);
      expect(results.duration).toBeLessThanOrEqual(endTime - startTime);
    });
  });

  describe('Test Configuration and Setup', () => {
    it('should validate required test fixtures', async () => {
      // This test verifies that all required test fixtures are available
      const results = await testRunner.runTestSuite('unit');
      
      // Should not fail due to missing fixtures
      const fixtureFailures = results.results.filter(r => 
        r.status === 'failed' && r.error?.includes('Missing fixtures')
      );
      
      expect(fixtureFailures).toHaveLength(0);
    });

    it('should handle test environment setup', async () => {
      const results = await testRunner.runTestSuite('integration');
      
      // API health check should pass if environment is properly set up
      const apiHealthTest = results.results.find(r => r.id === 'integration-api-health');
      
      if (apiHealthTest) {
        expect(apiHealthTest.status).toBe('passed');
      }
    });

    it('should run tests in isolation', async () => {
      // Run the same suite twice to ensure tests don't interfere
      const results1 = await testRunner.runTestSuite('unit');
      const results2 = await testRunner.runTestSuite('unit');
      
      expect(results1.summary.total).toBe(results2.summary.total);
      
      // Results should be consistent (accounting for potential timing differences)
      const passedDiff = Math.abs(results1.summary.passed - results2.summary.passed);
      const failedDiff = Math.abs(results1.summary.failed - results2.summary.failed);
      
      expect(passedDiff).toBeLessThanOrEqual(1); // Allow minimal variance
      expect(failedDiff).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid test suite names gracefully', async () => {
      await expect(
        testRunner.runTestSuite('nonexistent' as any)
      ).rejects.toThrow();
    });

    it('should handle test timeouts', async () => {
      // This test ensures that individual test timeouts are handled
      const results = await testRunner.runTestSuite('performance');
      
      // No test should run indefinitely
      results.results.forEach(result => {
        expect(result.duration).toBeLessThan(30000); // 30 second max
      });
    });

    it('should continue execution after individual test failures', async () => {
      const results = await testRunner.runTestSuite('integration');
      
      // Even if some tests fail, the suite should complete
      expect(results.summary.total).toBeGreaterThan(0);
      expect(results.status).toBeDefined();
      
      // Should have attempted to run all tests
      const attemptedTests = results.summary.passed + results.summary.failed + results.summary.skipped;
      expect(attemptedTests).toBe(results.summary.total);
    });
  });
});