/**
 * Test Runner - Phase 6
 * Centralized test execution and reporting system
 */

import { providerMocks, mockUtils } from './providerMocks';
import { testFixtures } from '../fixtures';

// Test result types
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
export type TestSuite = 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility';

export interface TestResult {
  id: string;
  name: string;
  suite: TestSuite;
  status: TestStatus;
  duration?: number;
  error?: string;
  output?: any;
  timestamp: string;
}

export interface TestRunReport {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  results: TestResult[];
}

/**
 * Test Runner Class
 */
export class CookAIngTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.reset();
  }

  /**
   * Reset test runner state
   */
  reset(): void {
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Run unit tests
   */
  async runUnitTests(): Promise<TestResult[]> {
    console.log('[TEST-RUNNER] Starting unit tests...');
    const unitResults: TestResult[] = [];

    // Test 1: Provider Mock Validation
    const mockTest = await this.runTest({
      id: 'unit-provider-mocks',
      name: 'Provider Mock Validation',
      suite: 'unit',
      testFn: async () => {
        const response = providerMocks.contentGeneration.openai.generateContent('test prompt');
        const validation = mockUtils.validateMockResponse(response);
        
        if (!validation.isValid) {
          throw new Error(`Invalid mock response format: ${JSON.stringify(validation)}`);
        }
        
        return { validation, response };
      }
    });
    unitResults.push(mockTest);

    // Test 2: Fixtures Validation
    const fixturesTest = await this.runTest({
      id: 'unit-fixtures-validation',
      name: 'Test Fixtures Validation',
      suite: 'unit',
      testFn: async () => {
        const requiredFixtures = [
          'organizations', 'contacts', 'campaigns', 
          'contentVersions', 'cookaingContentVersions'
        ];
        
        const missing = requiredFixtures.filter(key => !(testFixtures as any)[key]);
        if (missing.length > 0) {
          throw new Error(`Missing fixtures: ${missing.join(', ')}`);
        }
        
        return { fixtures: Object.keys(testFixtures), count: requiredFixtures.length };
      }
    });
    unitResults.push(fixturesTest);

    // Test 3: Content Generation Mock
    const contentGenTest = await this.runTest({
      id: 'unit-content-generation',
      name: 'Content Generation Mock Test',
      suite: 'unit',
      testFn: async () => {
        const prompt = 'Generate a recipe for chocolate cookies';
        const openaiResult = providerMocks.contentGeneration.openai.generateContent(prompt);
        const claudeResult = providerMocks.contentGeneration.anthropic.generateContent(prompt);
        
        if (!openaiResult.content || !claudeResult.content) {
          throw new Error('Content generation failed');
        }
        
        return { openai: openaiResult, claude: claudeResult };
      }
    });
    unitResults.push(contentGenTest);

    // Test 4: Intelligence Providers
    const intelligenceTest = await this.runTest({
      id: 'unit-intelligence-providers',
      name: 'Intelligence Providers Mock Test',
      suite: 'unit',
      testFn: async () => {
        const competitorData = providerMocks.intelligence.competitors.scanCompetitors('food', 'instagram');
        const sentimentData = providerMocks.intelligence.sentiment.analyzeSentiment('food', 'instagram');
        const viralData = providerMocks.intelligence.viral.calculateViralScore('recipe-video', 'tiktok');
        
        if (!competitorData.posts || !sentimentData.score || !viralData.score) {
          throw new Error('Intelligence provider test failed');
        }
        
        return { competitors: competitorData, sentiment: sentimentData, viral: viralData };
      }
    });
    unitResults.push(intelligenceTest);

    console.log(`[TEST-RUNNER] Unit tests completed: ${unitResults.length} tests run`);
    return unitResults;
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests(): Promise<TestResult[]> {
    console.log('[TEST-RUNNER] Starting integration tests...');
    const integrationResults: TestResult[] = [];

    // Test 1: API Health Check
    const healthTest = await this.runTest({
      id: 'integration-api-health',
      name: 'API Health Check',
      suite: 'integration',
      testFn: async () => {
        const response = await fetch('/api/cookaing-marketing/admin/self-test');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(`API health check failed: ${data.error}`);
        }
        
        return data;
      }
    });
    integrationResults.push(healthTest);

    // Test 2: Admin Seed Functionality
    const seedTest = await this.runTest({
      id: 'integration-admin-seed',
      name: 'Admin Seed Functionality',
      suite: 'integration',
      testFn: async () => {
        const response = await fetch('/api/cookaing-marketing/admin/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preset: 'minimal' })
        });
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(`Seed test failed: ${data.error}`);
        }
        
        return data;
      }
    });
    integrationResults.push(seedTest);

    // Test 3: Phase 5 Endpoints
    const phase5Test = await this.runTest({
      id: 'integration-phase5-endpoints',
      name: 'Phase 5 Endpoints Integration',
      suite: 'integration',
      testFn: async () => {
        const endpoints = [
          '/api/cookaing-marketing/personalize/rules/schema',
          '/api/cookaing-marketing/voice/profiles',
          '/api/cookaing-marketing/collab/roles'
        ];
        
        const results = [];
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            const data = await response.json();
            results.push({ endpoint, status: response.status, success: data.success });
          } catch (error) {
            results.push({ endpoint, status: 'error', error: error.message });
          }
        }
        
        const failed = results.filter(r => r.status !== 200 && r.status !== 'error');
        if (failed.length > 0) {
          throw new Error(`Phase 5 endpoint test failed: ${JSON.stringify(failed)}`);
        }
        
        return results;
      }
    });
    integrationResults.push(phase5Test);

    console.log(`[TEST-RUNNER] Integration tests completed: ${integrationResults.length} tests run`);
    return integrationResults;
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(): Promise<TestResult[]> {
    console.log('[TEST-RUNNER] Starting performance tests...');
    const performanceResults: TestResult[] = [];

    // Test 1: API Response Time
    const responseTimeTest = await this.runTest({
      id: 'performance-api-response-time',
      name: 'API Response Time Test',
      suite: 'performance',
      testFn: async () => {
        const startTime = performance.now();
        const response = await fetch('/api/cookaing-marketing/phase5-health');
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) { // 1 second threshold
          throw new Error(`API response too slow: ${duration}ms`);
        }
        
        return { duration, status: response.status };
      }
    });
    performanceResults.push(responseTimeTest);

    // Test 2: Content Generation Performance
    const contentPerfTest = await this.runTest({
      id: 'performance-content-generation',
      name: 'Content Generation Performance',
      suite: 'performance',
      testFn: async () => {
        const startTime = performance.now();
        const result = providerMocks.contentGeneration.openai.generateContent('test content generation');
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 100) { // 100ms threshold for mock
          throw new Error(`Content generation too slow: ${duration}ms`);
        }
        
        return { duration, result };
      }
    });
    performanceResults.push(contentPerfTest);

    console.log(`[TEST-RUNNER] Performance tests completed: ${performanceResults.length} tests run`);
    return performanceResults;
  }

  /**
   * Run accessibility tests
   */
  async runAccessibilityTests(): Promise<TestResult[]> {
    console.log('[TEST-RUNNER] Starting accessibility tests...');
    const accessibilityResults: TestResult[] = [];

    // Test 1: Basic ARIA Compliance
    const ariaTest = await this.runTest({
      id: 'accessibility-aria-compliance',
      name: 'ARIA Compliance Check',
      suite: 'accessibility',
      testFn: async () => {
        const buttons = document.querySelectorAll('button');
        const inputs = document.querySelectorAll('input');
        
        const missingLabels: string[] = [];
        inputs.forEach((input, index) => {
          if (!input.getAttribute('aria-label') && !input.getAttribute('id')) {
            missingLabels.push(`input-${index}`);
          }
        });
        
        if (missingLabels.length > 0) {
          throw new Error(`Missing labels for inputs: ${missingLabels.join(', ')}`);
        }
        
        return { buttons: buttons.length, inputs: inputs.length, compliant: true };
      }
    });
    accessibilityResults.push(ariaTest);

    console.log(`[TEST-RUNNER] Accessibility tests completed: ${accessibilityResults.length} tests run`);
    return accessibilityResults;
  }

  /**
   * Run a single test with error handling and timing
   */
  private async runTest(config: {
    id: string;
    name: string;
    suite: TestSuite;
    testFn: () => Promise<any>;
  }): Promise<TestResult> {
    const startTime = Date.now();
    const result: TestResult = {
      id: config.id,
      name: config.name,
      suite: config.suite,
      status: 'running',
      timestamp: new Date().toISOString()
    };

    try {
      const output = await config.testFn();
      result.status = 'passed';
      result.output = output;
    } catch (error: unknown) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
    } finally {
      result.duration = Date.now() - startTime;
    }

    this.results.push(result);
    return result;
  }

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<TestRunReport> {
    console.log('[TEST-RUNNER] Starting comprehensive test run...');
    this.reset();

    const allResults: TestResult[] = [];

    // Run all test suites
    const unitResults = await this.runUnitTests();
    const integrationResults = await this.runIntegrationTests();
    const performanceResults = await this.runPerformanceTests();
    const accessibilityResults = await this.runAccessibilityTests();

    allResults.push(...unitResults, ...integrationResults, ...performanceResults, ...accessibilityResults);

    // Generate report
    const report: TestRunReport = {
      totalTests: allResults.length,
      passed: allResults.filter(r => r.status === 'passed').length,
      failed: allResults.filter(r => r.status === 'failed').length,
      skipped: allResults.filter(r => r.status === 'skipped').length,
      duration: Date.now() - this.startTime,
      results: allResults
    };

    console.log(`[TEST-RUNNER] Test run completed: ${report.passed}/${report.totalTests} passed`);
    return report;
  }

  /**
   * Get current results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Generate test report
   */
  generateReport(): TestRunReport {
    return {
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      duration: Date.now() - this.startTime,
      results: this.results
    };
  }
}

// Export singleton instance
export const testRunner = new CookAIngTestRunner();

// Browser global for testing
if (typeof window !== 'undefined') {
  (window as any).cookAIngTestRunner = testRunner;
}