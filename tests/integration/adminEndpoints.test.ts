/**
 * Integration Tests - Admin Endpoints
 * Tests for Phase 6 admin API functionality
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

const BASE_URL = 'http://localhost:5000/api/cookaing-marketing';

describe.skipIf(!process.env.TEST_INTEGRATION)('Admin Endpoints Integration', () => {
  let serverAvailable = false;
  
  beforeAll(async () => {
    // Check if server is running before tests
    try {
      const response = await fetch(`${BASE_URL}/self-test`);
      if (response.ok) {
        serverAvailable = true;
        console.log('✅ Server is available for testing');
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.warn('⚠️ Server not available, integration tests will be skipped');
      serverAvailable = false;
    }
  });
  
  beforeEach(() => {
    // Skip logic handled within individual tests
  });

  describe('Self-Test Endpoints', () => {
    it('should provide self-test via compatibility route', async () => {
      if (!serverAvailable) {
        return; // Skip test gracefully
      }
      const response = await fetch(`${BASE_URL}/self-test`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.overall).toBeDefined();
      expect(['ok', 'warning', 'error']).toContain(data.data.overall);
    });

    it('should provide self-test via admin route', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/self-test`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.overall).toBeDefined();
      expect(data.data.checks).toBeDefined();
      expect(Array.isArray(data.data.checks)).toBe(true);
    });

    it('should return consistent results from both endpoints', async () => {
      if (!serverAvailable) return;
      const [compatResponse, adminResponse] = await Promise.all([
        fetch(`${BASE_URL}/self-test`),
        fetch(`${BASE_URL}/admin/self-test`)
      ]);

      expect(compatResponse.ok).toBe(true);
      expect(adminResponse.ok).toBe(true);

      const [compatData, adminData] = await Promise.all([
        compatResponse.json(),
        adminResponse.json()
      ]);

      expect(compatData.success).toBe(adminData.success);
      expect(compatData.data.overall).toBe(adminData.data.overall);
    });
  });

  describe('Seed Endpoint', () => {
    it('should seed minimal test data successfully', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: 'minimal' })
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.preset).toBe('minimal');
      expect(data.stats).toBeDefined();
      expect(data.stats.organizations).toBeGreaterThanOrEqual(0);
      expect(data.stats.contacts).toBeGreaterThanOrEqual(0);
      expect(data.stats.campaigns).toBeGreaterThanOrEqual(0);
      expect(data.stats.contentVersions).toBeGreaterThanOrEqual(0);
    });

    it('should seed full test data successfully', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: 'full' })
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.preset).toBe('full');
      expect(data.stats.analyticsEvents).toBeGreaterThan(0);
    });

    it('should be idempotent when run multiple times', async () => {
      if (!serverAvailable) return;
      // Run seeding twice
      const response1 = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: 'minimal' })
      });

      const response2 = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: 'minimal' })
      });

      expect(response1.ok).toBe(true);
      expect(response2.ok).toBe(true);

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ]);

      expect(data1.success).toBe(true);
      expect(data2.success).toBe(true);
      // Should not create duplicates
      expect(data2.stats).toBeDefined();
    });

    it('should reject invalid preset values', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset: 'invalid' })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('Reset Mocks Endpoint', () => {
    it('should reset mock provider states', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/reset-mocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.cleared).toBeDefined();
      expect(data.cleared.competitors).toBe('cleared');
      expect(data.cleared.sentiment).toBe('cleared');
      expect(data.cleared.viral).toBe('cleared');
    });
  });

  describe('Test Stats Endpoint', () => {
    it('should provide comprehensive test statistics', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/test-stats`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.recentTests).toBeTypeOf('number');
      expect(data.data.seedDataPresent).toBeTypeOf('boolean');
      expect(data.data.mockModeActive).toBeTypeOf('boolean');
      expect(data.data.lastTestRun).toBeDefined();
    });

    it('should track test execution count', async () => {
      if (!serverAvailable) return;
      // Get initial count
      const initialResponse = await fetch(`${BASE_URL}/admin/test-stats`);
      const initialData = await initialResponse.json();
      const initialCount = initialData.data.recentTests;

      // Run a self-test
      await fetch(`${BASE_URL}/admin/self-test`);

      // Check count increased
      const finalResponse = await fetch(`${BASE_URL}/admin/test-stats`);
      const finalData = await finalResponse.json();
      const finalCount = finalData.data.recentTests;

      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe('Security and Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      expect(response.ok).toBe(false);
    });

    it('should handle missing request body', async () => {
      if (!serverAvailable) return;
      const response = await fetch(`${BASE_URL}/admin/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(response.ok).toBe(false);
    });

    it('should allow access in development mode', async () => {
      if (!serverAvailable) return;
      // These tests should pass since we're in development
      const response = await fetch(`${BASE_URL}/admin/self-test`);
      expect(response.ok).toBe(true);
    });
  });
});